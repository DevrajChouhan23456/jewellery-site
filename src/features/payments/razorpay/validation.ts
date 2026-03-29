import { z } from "zod";

import { objectIdSchema } from "@/features/cart/validation";

export const razorpayOrderRequestSchema = z.object({
  orderId: objectIdSchema,
});

export const razorpayPaymentVerificationSchema = z.object({
  orderId: objectIdSchema,
  razorpayOrderId: z.string().trim().min(1),
  razorpayPaymentId: z.string().trim().min(1),
  razorpaySignature: z.string().trim().min(1),
});

export type RazorpayOrderRequestInput = z.infer<
  typeof razorpayOrderRequestSchema
>;
export type RazorpayPaymentVerificationInput = z.infer<
  typeof razorpayPaymentVerificationSchema
>;
