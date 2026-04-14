export async function POST() {
  return Response.json(
    {
      success: false,
      code: "OTP_DISABLED",
      error:
        "OTP login is temporarily disabled. Please continue with Google sign-in.",
    },
    { status: 410 },
  );
}
