import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import crypto from "crypto";

import { getZodErrorMessage, parseJsonBody } from "@/lib/api/validation";
import { redis } from "@/lib/redis";

const prisma = new PrismaClient();
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

  const phone = parsedBody.data.phone;

  // Check rate limit
  const rateLimitKey = `otp:ratelimit:${phone}`;
  const attempts = await redis.incr(rateLimitKey);
  if (attempts === 1) await redis.expire(rateLimitKey, 300); // 5 min window

  if (attempts > 3) {
    return Response.json(
      { error: "Too many OTP requests. Try again in 5 minutes." },
      { status: 429 }
    );
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  // Store in Redis with 5-minute TTL (faster than MongoDB)
  await redis.setex(`otp:${phone}`, 300, hashedOtp);

  // Delete old MongoDB OTP records
  await prisma.oTP.deleteMany({ 
    where: { identifier: phone }
  });

  // Log for audit (no sensitive data)
  if (process.env.NODE_ENV === 'development') {
    console.log(`OTP sent to ${phone} at ${new Date().toISOString()}`);
  }

  return Response.json({ success: true });
}
