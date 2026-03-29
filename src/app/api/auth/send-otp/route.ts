import { PrismaClient } from "@prisma/client";
import { z } from "zod";

import { getZodErrorMessage, parseJsonBody } from "@/lib/api/validation";

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

  const { phone } = parsedBody.data;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await prisma.oTP.create({
    data: {
      identifier: phone,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  // 👉 WhatsApp OTP (Twilio example)
  console.log("OTP:", otp);

  return Response.json({ success: true });
}
