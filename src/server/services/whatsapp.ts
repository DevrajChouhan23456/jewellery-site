import { Twilio } from "twilio";
import { getAutomationSetting } from "./automation/settings";
import { formatProductName } from "@/lib/brand-copy";
import { isTwilioWhatsAppSandboxNumber, normalizePhoneNumber } from "@/lib/phone";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const twilio = accountSid && authToken ? new Twilio(accountSid, authToken) : null;

export interface WhatsAppMessage {
  to: string;
  body: string;
  mediaUrl?: string[];
}

type CartWhatsAppItem = {
  product: {
    name: string;
    price: number;
  };
  quantity: number;
};

type WhatsAppOrderDetails = {
  orderNumber: string;
  status: string;
  totalAmount: number;
};

export async function sendWhatsAppMessage(message: WhatsAppMessage) {
  const normalizedFrom = normalizePhoneNumber(whatsappNumber ?? "");
  const normalizedTo = normalizePhoneNumber(message.to);
  const sandboxHint = isTwilioWhatsAppSandboxNumber(normalizedFrom)
    ? "Twilio WhatsApp Sandbox is configured. Make sure the recipient joined the sandbox, and remember free-form messages only work inside the 24-hour service window after that join/reply."
    : undefined;

  const whatsappEnabled = await getAutomationSetting("whatsapp_notifications_enabled");
  if (!whatsappEnabled?.isEnabled) {
    console.log("WhatsApp notifications disabled, skipping message to:", message.to);
    return { success: false, error: "WhatsApp notifications disabled", hint: sandboxHint };
  }

  if (!normalizedTo) {
    return { success: false, error: "Recipient phone number is missing or invalid.", hint: sandboxHint };
  }

  if (!twilio || !normalizedFrom) {
    console.warn("Twilio not configured. WhatsApp message not sent:", message.to);
    return { success: false, error: "WhatsApp service not configured", hint: sandboxHint };
  }

  try {
    const to = `whatsapp:${normalizedTo}`;

    const result = await twilio.messages.create({
      from: `whatsapp:${normalizedFrom}`,
      to,
      body: message.body,
      ...(message.mediaUrl && message.mediaUrl.length > 0
        ? { mediaUrl: message.mediaUrl }
        : {}),
    });

    return {
      success: true,
      id: result.sid,
      normalizedTo,
      hint: sandboxHint,
    };
  } catch (error) {
    console.error("WhatsApp send failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      hint: sandboxHint,
      normalizedTo,
    };
  }
}

export async function sendOrderConfirmationWhatsApp(
  phone: string,
  orderDetails: WhatsAppOrderDetails,
) {
  const message = `Order Confirmed

Thank you for shopping with Auraa Fashion Jewellery.

Order details:
- Order #: ${orderDetails.orderNumber}
- Total: Rs. ${orderDetails.totalAmount / 100}
- Status: ${orderDetails.status}

We will send you more updates as your order moves forward. Reply here if you need help.`;

  return await sendWhatsAppMessage({
    to: phone,
    body: message,
  });
}

export async function sendCartRecoveryWhatsApp(
  phone: string,
  recoveryToken: string,
  cartItems: CartWhatsAppItem[],
) {
  const recoveryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/cart/recovery/${recoveryToken}`;

  const itemsText = cartItems
    .slice(0, 3)
    .map((item: CartWhatsAppItem) => `- ${formatProductName(item.product.name)} (Rs. ${item.product.price})`)
    .join("\n");

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const moreItems =
    cartItems.length > 3 ? `\n...and ${cartItems.length - 3} more items` : "";

  const message = `Your cart is waiting

We noticed you left these styles in your cart:

${itemsText}${moreItems}

Total: Rs. ${total}

Complete your purchase here:
${recoveryUrl}

This link expires in 7 days. Reply here if you need help choosing the right pieces.`;

  return await sendWhatsAppMessage({
    to: phone,
    body: message,
  });
}

export async function sendPaymentReminderWhatsApp(
  phone: string,
  orderId: string,
  amount: number,
) {
  const message = `Payment Reminder

Your order #${orderId} is pending payment.

Amount: Rs. ${amount / 100}

Complete your payment to confirm your Auraa styles.

Need help? Reply to this message.`;

  return await sendWhatsAppMessage({
    to: phone,
    body: message,
  });
}

export async function sendShippingUpdateWhatsApp(
  phone: string,
  orderId: string,
  status: string,
) {
  const message = `Order Update

Your order #${orderId} status: ${status}

Track your order or contact us if you need help.

Auraa Fashion Jewellery`;

  return await sendWhatsAppMessage({
    to: phone,
    body: message,
  });
}

type OrderStatusWhatsAppInput = {
  orderNumber: string;
  statusLine: string;
  detail: string;
  trackUrl: string;
};

export async function sendOrderStatusUpdateWhatsApp(
  phone: string,
  input: OrderStatusWhatsAppInput,
) {
  const message = `Order update — #${input.orderNumber}

${input.statusLine}

${input.detail}

Track: ${input.trackUrl}

— Auraa Fashion Jewellery`;

  return await sendWhatsAppMessage({
    to: phone,
    body: message,
  });
}
