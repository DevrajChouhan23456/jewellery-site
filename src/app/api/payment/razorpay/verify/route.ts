import { NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { verifySignature } from "@/lib/payments/razorpay";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "Invalid id format (expected ObjectId)");

const verifySchema = z.object({
  orderId: objectIdSchema,
  razorpayOrderId: z.string().trim().min(1),
  razorpayPaymentId: z.string().trim().min(1),
  razorpaySignature: z.string().trim().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      razorpayOrderId: true,
      paymentStatus: true,
      status: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.paymentStatus === "PAID") {
    return NextResponse.json({ message: "Already verified" });
  }

  if (!order.razorpayOrderId || order.razorpayOrderId !== razorpayOrderId) {
    return NextResponse.json({ error: "Razorpay order mismatch" }, { status: 400 });
  }

  const isValid = verifySignature({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "PAID",
      status: order.status === "PENDING" ? "CONFIRMED" : order.status,
      razorpayPaymentId,
      razorpaySignature,
    },
  });

  return NextResponse.json({ message: "Payment verified", orderId: order.id });
}
