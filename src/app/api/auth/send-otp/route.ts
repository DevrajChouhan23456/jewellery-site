import { z } from "zod";
import crypto from "crypto";

import { getZodErrorMessage, parseJsonBody } from "@/lib/api/validation";
import { isValidE164PhoneNumber, normalizePhoneNumber } from "@/lib/phone";
import { redis } from "@/lib/redis";
import { sendWhatsAppMessage } from "@/server/services/whatsapp";

const sendOtpSchema = z.object({
  phone: z.string().trim().min(10, "Invalid phone"),
});

export async function POST(req: Request) {
  const parsedBody = await parseJsonBody(req, sendOtpSchema);

  if (!parsedBody.success) {
    return Response.json(
      {
        error:
          parsedBody.kind === "json"
            ? parsedBody.message
            : getZodErrorMessage(parsedBody.error, "Invalid phone"),
      },
      { status: 400 },
    );
  }

  const normalizedPhone = normalizePhoneNumber(parsedBody.data.phone);

  if (!isValidE164PhoneNumber(normalizedPhone)) {
    return Response.json(
      { error: "Enter a valid WhatsApp number with country code." },
      { status: 400 },
    );
  }

  // Get client IP for rate limiting
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || 
                    req.headers.get("x-real-ip") || 
                    "unknown";

  // IP-level rate limiting: 10 OTP sends per hour
  const ipSendLimitKey = `otp:send:ip:${clientIp}`;
  const ipSends = await redis.incr(ipSendLimitKey);
  if (ipSends === 1) await redis.expire(ipSendLimitKey, 3600); // 1 hour

  if (ipSends > 10) {
    console.warn(`[Security] Excessive OTP send attempts from IP ${clientIp}: ${ipSends} in 1hour`);
    return Response.json(
      { error: "Too many OTP requests from your network. Try again later." },
      { status: 429 }
    );
  }

  // Check rate limit per phone (3 sends per 5 minutes)
  const rateLimitKey = `otp:ratelimit:${normalizedPhone}`;
  const attempts = await redis.incr(rateLimitKey);
  if (attempts === 1) await redis.expire(rateLimitKey, 300); // 5 min window

  if (attempts > 3) {
    console.warn(`[Security] Excessive OTP attempts for phone ${normalizedPhone}: ${attempts} in 5min`);
    return Response.json(
      { error: "Too many OTP requests. Try again in 5 minutes." },
      { status: 429 }
    );
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  // Store in Redis with 5-minute TTL (faster than MongoDB)
  await redis.setex(`otp:${normalizedPhone}`, 300, hashedOtp);

  // Send OTP via WhatsApp
  const messageResult = await sendWhatsAppMessage({
    to: normalizedPhone,
    body: `Your Tanishq verification code is: ${otp}`
  });

  if (!messageResult.success) {
    await redis.del(`otp:${normalizedPhone}`);
    console.error('[Auth] Failed to send OTP via WhatsApp:', messageResult.error);
    return Response.json(
      { error: "We couldn't send the OTP right now. Please try again." },
      { status: 500 }
    );
  }

  // Audit log: OTP sent successfully
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[Auth] OTP ${otp} sent to ${normalizedPhone} at ${new Date().toISOString()}`,
    );
  } else {
    console.log(`[Auth] OTP sent (phone: ${normalizedPhone.slice(-4)}) at ${new Date().toISOString()}`);
  }

  return Response.json({
    success: true,
    normalizedPhone,
  });
}
