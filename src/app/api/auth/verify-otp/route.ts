import { redis } from "@/lib/redis";

export async function POST(req: Request) {
  const { phone, otp } = await req.json();

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