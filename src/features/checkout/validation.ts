import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required.").max(120),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().min(6, "Enter a valid phone number.").max(20),
  line1: z.string().trim().min(1, "Address line 1 is required.").max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1, "City is required.").max(80),
  state: z.string().trim().min(1, "State is required.").max(80),
  postalCode: z.string().trim().min(3, "PIN code is required.").max(20),
  country: z.string().trim().min(2).max(80),
});

export const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  notes: z.string().trim().max(500).optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
