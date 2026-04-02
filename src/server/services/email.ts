import { Resend } from 'resend';
import { getAutomationSetting } from './automation/settings';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(data: EmailData) {
  // Check if email notifications are enabled
  const emailEnabled = await getAutomationSetting('email_notifications_enabled');
  if (!emailEnabled?.isEnabled) {
    console.log('Email notifications disabled, skipping email to:', data.to);
    return { success: false, error: 'Email notifications disabled' };
  }

  if (!resend) {
    console.warn('Resend API key not configured. Email not sent:', data.to, data.subject);
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const from = data.from || 'noreply@yourdomain.com'; // Replace with your domain

    const result = await resend.emails.send({
      from,
      to: data.to,
      subject: data.subject,
      html: data.html,
    });

    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('Email send failed:', error);
    return { success: false, error: error.message };
  }
}

export async function sendCartRecoveryEmail(email: string, recoveryToken: string, cartItems: any[]) {
  const recoveryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/cart/recovery/${recoveryToken}`;

  const itemsHtml = cartItems.map(item => `
    <div style="display: flex; align-items: center; margin: 10px 0; padding: 10px; border: 1px solid #eee; border-radius: 5px;">
      <img src="${item.product.images[0]}" alt="${item.product.name}" style="width: 60px; height: 60px; object-fit: cover; margin-right: 15px;">
      <div>
        <strong>${item.product.name}</strong><br>
        Quantity: ${item.quantity} | Price: ₹${item.product.price}
      </div>
    </div>
  `).join('');

  const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Your Cart is Waiting!</h2>
      <p>We noticed you left some beautiful items in your cart. Don't miss out on these pieces!</p>

      <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
        ${itemsHtml}
        <div style="text-align: right; margin-top: 15px; font-size: 18px; font-weight: bold;">
          Total: ₹${total}
        </div>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${recoveryUrl}" style="background: #d4af37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Complete Your Purchase
        </a>
      </div>

      <p style="color: #666; font-size: 14px;">
        This link will expire in 7 days. If you didn't add these items to your cart, please ignore this email.
      </p>

      <p style="color: #666; font-size: 12px;">
        Best regards,<br>
        Tanishq Jewellery Team
      </p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: 'Your Cart is Waiting - Complete Your Purchase',
    html
  });
}

export async function sendOrderConfirmationEmail(email: string, orderDetails: any) {
  const itemsHtml = orderDetails.items.map((item: any) => `
    <div style="display: flex; align-items: center; margin: 10px 0; padding: 15px; border: 1px solid #eee; border-radius: 8px; background: #fafafa;">
      <div style="flex: 1;">
        <strong style="font-size: 16px; color: #333;">${item.product.name}</strong><br>
        <span style="color: #666;">Quantity: ${item.quantity} | Unit Price: ₹${item.product.price / 100}</span>
      </div>
      <div style="font-weight: bold; color: #d4af37; font-size: 16px;">
        ₹${(item.product.price * item.quantity) / 100}
      </div>
    </div>
  `).join('');

  const shippingAddress = orderDetails.shippingAddress ? `
    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h4 style="margin: 0 0 10px 0; color: #333;">Shipping Address</h4>
      <p style="margin: 5px 0; color: #666;">
        ${orderDetails.shippingAddress.name || ''}<br>
        ${orderDetails.shippingAddress.address}<br>
        ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.pincode}<br>
        ${orderDetails.shippingAddress.email}<br>
        ${orderDetails.shippingAddress.phone}
      </p>
    </div>
  ` : '';

  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #d4af37, #b8860b); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Order Confirmed!</h1>
        <p style="color: #f5f5dc; margin: 10px 0 0 0; font-size: 16px;">Thank you for choosing Tanishq Jewellery</p>
      </div>

      <div style="padding: 30px 20px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">Order Details</h2>
          <p style="margin: 5px 0; color: #666;"><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">${orderDetails.status}</span></p>
        </div>

        <h3 style="color: #333; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Items Ordered</h3>
        ${itemsHtml}

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: right;">
          <div style="font-size: 18px; font-weight: bold; color: #333; margin-bottom: 10px;">
            Total: ₹${orderDetails.totalAmount / 100}
          </div>
          <div style="color: #666; font-size: 14px;">
            Payment Method: Razorpay
          </div>
        </div>

        ${shippingAddress}

        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h4 style="margin: 0 0 10px 0; color: #2d5016;">What's Next?</h4>
          <ul style="margin: 0; padding-left: 20px; color: #2d5016;">
            <li>We'll prepare your order within 2-3 business days</li>
            <li>You'll receive shipping updates via WhatsApp and email</li>
            <li>Delivery typically takes 3-7 business days</li>
            <li>Track your order status in your account</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/order/${orderDetails.id}" style="background: #d4af37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            View Order Details
          </a>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            Questions about your order? <br>
            Contact us at <a href="mailto:support@tanishq.com" style="color: #d4af37;">support@tanishq.com</a> or reply to this email
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="margin: 0; color: #999; font-size: 12px;">
            ✨ Thank you for shopping with Tanishq Jewellery ✨<br>
            Crafting beauty, creating memories since 1995
          </p>
        </div>
      </div>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: `Order Confirmed - ${orderDetails.orderNumber} | Tanishq Jewellery`,
    html
  });
}