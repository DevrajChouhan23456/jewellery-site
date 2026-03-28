import { z } from "zod";

export const MAX_CART_ITEM_QUANTITY = 99;

export const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-fA-F0-9]{24}$/, "Invalid id format.");

export const quantitySchema = z
  .coerce
  .number()
  .int()
  .min(1)
  .max(MAX_CART_ITEM_QUANTITY);

export const addToCartSchema = z.object({
  productId: objectIdSchema,
  quantity: quantitySchema.default(1),
});

export const updateCartQuantitySchema = z.object({
  productId: objectIdSchema,
  quantity: quantitySchema,
});

export const removeCartItemSchema = z.object({
  productId: objectIdSchema,
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartQuantityInput = z.infer<typeof updateCartQuantitySchema>;
export type RemoveCartItemInput = z.infer<typeof removeCartItemSchema>;
