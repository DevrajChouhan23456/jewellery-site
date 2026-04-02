import { z } from "zod";
import crypto from "crypto";

import { getZodErrorMessage, parseJsonBody } from "@/lib/api/validation";
import { redis } from "@/lib/redis";

const verifyOtpSchema = z.object({
  phone: z.coerce.string().trim().min(1, "Phone is required."),
  otp: z.coerce.string().trim().min(1, "OTP is required."),
});

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

  const { phone, otp } = parsedBody.data;

  // Check rate limit for verification attempts
  const verifyLimitKey = `otp:verify:${phone}`;
  const verifyAttempts = await redis.incr(verifyLimitKey);
  if (verifyAttempts === 1) await redis.expire(verifyLimitKey, 300);

  if (verifyAttempts > 5) {
    return Response.json(
      { success: false, error: "Too many verification attempts. Please try again later." },
      { status: 429 }
    );
  }

  const hashedInputOtp = crypto.createHash("sha256").update(otp.trim()).digest("hex");
  const storedHashedOtp = await redis.get(`otp:${phone}`);

  if (!storedHashedOtp || hashedInputOtp !== storedHashedOtp) {
    return Response.json(
      { success: false, error: "Invalid or expired OTP" },
      { status: 400 }
    );
  }

  await redis.del(`otp:${phone}`);
  await redis.del(verifyLimitKey);

  return Response.json({
    success: true,
    newUser: true,
  });
}
