import { z } from "zod";
import crypto from "crypto";

import { getZodErrorMessage, parseJsonBody } from "@/lib/api/validation";
import { normalizePhoneNumber } from "@/lib/phone";
import { redis } from "@/lib/redis";

const verifyOtpSchema = z.object({
  phone: z.coerce.string().trim().min(1, "Phone is required."),
  otp: z.coerce.string().trim().min(1, "OTP is required."),
});

/**
 * Calculate progressive delay based on attempt count (exponential backoff)
 * Attempts: 1-2 (0ms), 3-4 (1s), 5+ (5s)
 */
function getBackoffDelay(attempts: number): number {
  if (attempts <= 2) return 0;
  if (attempts <= 4) return 1000;
  return 5000;
}

export async function POST(req: Request) {
  const parsedBody = await parseJsonBody(req, verifyOtpSchema);

  if (!parsedBody.success) {
    return Response.json(
      {
        success: false,
        error:
          parsedBody.kind === "json"
            ? parsedBody.message
            : getZodErrorMessage(parsedBody.error, "Invalid OTP request."),
      },
      { status: 400 }
    );
  }

  const phone = normalizePhoneNumber(parsedBody.data.phone);
  const { otp } = parsedBody.data;

  // Get client IP for IP-level rate limiting
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || 
                    req.headers.get("x-real-ip") || 
                    "unknown";

  // IP-level rate limiting: 20 failed verifications per 15min (across all phone numbers)
  const ipRateLimitKey = `otp:verify:ip:${clientIp}`;
  const ipFailures = await redis.incr(ipRateLimitKey);
  if (ipFailures === 1) await redis.expire(ipRateLimitKey, 900); // 15 min window

  if (ipFailures > 20) {
    console.warn(`[Security] Excessive OTP verification attempts from IP ${clientIp}: ${ipFailures} in 15min`);
    return Response.json(
      { success: false, error: "Too many verification attempts from your network. Please try again later." },
      { status: 429 }
    );
  }

  // Per-phone rate limiting: 5 attempts per 5min
  const phoneRateLimitKey = `otp:verify:${phone}`;
  const phoneAttempts = await redis.incr(phoneRateLimitKey);
  if (phoneAttempts === 1) await redis.expire(phoneRateLimitKey, 300);

  if (phoneAttempts > 5) {
    console.warn(`[Security] Excessive OTP verification for phone ${phone}: ${phoneAttempts} attempts`);
    return Response.json(
      { success: false, error: "Too many verification attempts for this number. Please try again in 5 minutes." },
      { status: 429 }
    );
  }

  // Apply progressive backoff delay
  const delay = getBackoffDelay(phoneAttempts);
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  const hashedInputOtp = crypto.createHash("sha256").update(otp.trim()).digest("hex");
  const storedHashedOtp = await redis.get(`otp:${phone}`);

  if (!storedHashedOtp || hashedInputOtp !== storedHashedOtp) {
    // Log failed OTP attempt for security audit
    console.warn(`[Security] Failed OTP verification for phone: ${phone} (attempt ${phoneAttempts})`);
    return Response.json(
      { success: false, error: "Invalid or expired OTP" },
      { status: 400 }
    );
  }

  // Success: clear the OTP and rate limit keys
  await redis.del(`otp:${phone}`);
  await redis.del(phoneRateLimitKey);
  await redis.del(ipRateLimitKey);

  // Log successful auth for audit trail
  console.log(`[Auth] OTP verified successfully for phone: ${phone}`);

  return Response.json({
    success: true,
    newUser: true,
  });
}
