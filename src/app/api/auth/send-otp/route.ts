import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { phone } = await req.json();

  if (!phone || phone.length < 10) {
    return Response.json({ error: "Invalid phone" }, { status: 400 });
  }

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