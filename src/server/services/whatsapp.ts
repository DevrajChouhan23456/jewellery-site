import { Twilio } from 'twilio';
import { getAutomationSetting } from './automation/settings';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const twilio = accountSid && authToken ? new Twilio(accountSid, authToken) : null;

export interface WhatsAppMessage {
  to: string; // Phone number with country code, e.g., +1234567890
  body: string;
  mediaUrl?: string[];
}

export async function sendWhatsAppMessage(message: WhatsAppMessage) {
  // Check if WhatsApp notifications are enabled
  const whatsappEnabled = await getAutomationSetting('whatsapp_notifications_enabled');
  if (!whatsappEnabled?.isEnabled) {
    console.log('WhatsApp notifications disabled, skipping message to:', message.to);
    return { success: false, error: 'WhatsApp notifications disabled' };
  }

  if (!twilio || !whatsappNumber) {
    console.warn('Twilio not configured. WhatsApp message not sent:', message.to);
    return { success: false, error: 'WhatsApp service not configured' };
  }

  try {
    // Ensure phone number starts with whatsapp:
    const to = message.to.startsWith('whatsapp:') ? message.to : `whatsapp:${message.to}`;

    const result = await twilio.messages.create({
      from: `whatsapp:${whatsappNumber}`,
      to,
      body: message.body,
      ...(message.mediaUrl && message.mediaUrl.length > 0 && {
        mediaUrl: message.mediaUrl
      })
    });

    return { success: true, id: result.sid };
  } catch (error) {
    console.error('WhatsApp send failed:', error);
    return { success: false, error: error.message };
  }
}

export async function sendOrderConfirmationWhatsApp(phone: string, orderDetails: any) {
  const message = `🎉 Order Confirmed!

Thank you for your order with Tanishq Jewellery!

📋 Order Details:
• Order #: ${orderDetails.orderNumber}
• Total: ₹${orderDetails.totalAmount / 100}
• Status: ${orderDetails.status}

We'll send you updates on your order status. For any questions, reply to this message.

✨ Thank you for choosing Tanishq! ✨`;

  return await sendWhatsAppMessage({
    to: phone,
    body: message
  });
}

export async function sendCartRecoveryWhatsApp(phone: string, recoveryToken: string, cartItems: any[]) {
  const recoveryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/cart/recovery/${recoveryToken}`;

  const itemsText = cartItems.slice(0, 3).map(item =>
    `• ${item.product.name} (₹${item.product.price})`
  ).join('\n');

  const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const moreItems = cartItems.length > 3 ? `\n...and ${cartItems.length - 3} more items` : '';

  const message = `🛒 Your Cart is Waiting!

We noticed you left some beautiful pieces in your cart:

${itemsText}${moreItems}

💰 Total: ₹${total}

Don't miss out! Complete your purchase:
${recoveryUrl}

⏰ Link expires in 7 days

Questions? Reply here! ✨`;

  return await sendWhatsAppMessage({
    to: phone,
    body: message
  });
}

export async function sendPaymentReminderWhatsApp(phone: string, orderId: string, amount: number) {
  const message = `💳 Payment Reminder

Your order #${orderId} is pending payment.

💰 Amount: ₹${amount / 100}

Complete your payment to confirm your beautiful Tanishq pieces!

Need help? Reply to this message. ✨`;

  return await sendWhatsAppMessage({
    to: phone,
    body: message
  });
}

export async function sendShippingUpdateWhatsApp(phone: string, orderId: string, status: string) {
  const statusEmoji = {
    'PROCESSING': '⚙️',
    'SHIPPED': '🚚',
    'DELIVERED': '✅'
  }[status] || '📦';

  const message = `${statusEmoji} Order Update

Your order #${orderId} status: ${status}

Track your order or contact us for any questions!

✨ Tanishq Jewellery ✨`;

  return await sendWhatsAppMessage({
    to: phone,
    body: message
  });
}