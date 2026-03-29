import { z } from "zod";

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

  const storedOtp = await redis.get(`otp:${phone}`);

  if (!storedOtp || String(storedOtp) !== String(otp)) {
    return Response.json(
      { success: false, error: "Invalid or expired OTP" },
      { status: 400 }
    );
  }

  await redis.del(`otp:${phone}`);

  return Response.json({
    success: true,
    newUser: true,
  });
}
