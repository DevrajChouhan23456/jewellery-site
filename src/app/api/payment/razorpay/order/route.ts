import { NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { getRazorpayClient, getPublicKey } from "@/lib/payments/razorpay";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "Invalid id format (expected ObjectId)");

const requestSchema = z.object({
  orderId: objectIdSchema,
});

function calculateTotals(order: {
  items: { lineTotal: number }[];
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
}) {
  const itemsTotal = order.items.reduce((sum, item) => sum + item.lineTotal, 0);
  const total = Math.max(
    0,
    itemsTotal + (order.taxAmount ?? 0) + (order.shippingAmount ?? 0) - (order.discountAmount ?? 0),
  );
  return { itemsTotal, total };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const { orderId } = parsed.data;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.paymentStatus === "PAID") {
    return NextResponse.json({ error: "Order already paid" }, { status: 400 });
  }

  const totals = calculateTotals(order);

  if (totals.total <= 0) {
    return NextResponse.json({ error: "Invalid payable amount" }, { status: 400 });
  }

  // keep DB total consistent with item sums
  if (totals.total !== order.totalAmount) {
    await prisma.order.update({
      where: { id: order.id },
      data: { totalAmount: totals.total, subtotalAmount: totals.itemsTotal },
    });
  }

  // Reuse existing Razorpay order if present
  if (order.razorpayOrderId) {
    return NextResponse.json({
      razorpayOrderId: order.razorpayOrderId,
      amount: totals.total * 100,
      currency: "INR",
      key: getPublicKey(),
      orderId: order.id,
    });
  }

  const client = getRazorpayClient();

  const rzpOrder = await client.orders.create({
    amount: totals.total * 100, // paise
    currency: "INR",
    receipt: order.id,
    notes: { orderNumber: order.orderNumber },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { razorpayOrderId: rzpOrder.id, paymentStatus: "PENDING" },
  });

  return NextResponse.json({
    razorpayOrderId: rzpOrder.id,
    amount: rzpOrder.amount,
    currency: rzpOrder.currency,
    key: getPublicKey(),
    orderId: order.id,
  });
}
