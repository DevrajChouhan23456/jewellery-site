import Razorpay from "razorpay";
import { createHmac } from "crypto";
import { z } from "zod";

const requiredString = z.string().trim().min(1);

function getKeys() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!requiredString.safeParse(keyId).success || !requiredString.safeParse(keySecret).success) {
    throw new Error("Razorpay keys are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }
  return { keyId: keyId!, keySecret: keySecret! };
}

export function getRazorpayClient() {
  const { keyId, keySecret } = getKeys();
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export function verifySignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const { keySecret } = getKeys();
  const payload = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
  const expected = createHmac("sha256", keySecret).update(payload).digest("hex");
  return expected === params.razorpaySignature;
}

export function getPublicKey() {
  return process.env.RAZORPAY_KEY_ID ?? "";
}
