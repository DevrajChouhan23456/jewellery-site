import { Resend } from "resend";
import { getAutomationSetting } from "./automation/settings";
import { formatProductName } from "@/lib/brand-copy";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

type CartEmailItem = {
  product: {
    images?: string[];
    name: string;
    price: number;
  };
  quantity: number;
};

type OrderEmailDetails = {
  id: string;
  items: CartEmailItem[];
  orderNumber: string;
  shippingAddress?: {
    address: string;
    city: string;
    email: string;
    name?: string;
    phone: string;
    pincode: string;
    state: string;
  };
  status: string;
  totalAmount: number;
};

export async function sendEmail(data: EmailData) {
  const emailEnabled = await getAutomationSetting("email_notifications_enabled");
  if (!emailEnabled?.isEnabled) {
    console.log("Email notifications disabled, skipping email to:", data.to);
    return { success: false, error: "Email notifications disabled" };
  }

  if (!resend) {
    console.warn("Resend API key not configured. Email not sent:", data.to, data.subject);
    return { success: false, error: "Email service not configured" };
  }

  try {
    const from = data.from || "noreply@yourdomain.com";

    const result = await resend.emails.send({
      from,
      to: data.to,
      subject: data.subject,
      html: data.html,
    });

    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("Email send failed:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function sendCartRecoveryEmail(
  email: string,
  recoveryToken: string,
  cartItems: CartEmailItem[],
) {
  const recoveryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/cart/recovery/${recoveryToken}`;

  const itemsHtml = cartItems
    .map(
      (item: CartEmailItem) => `
    <div style="display:flex;align-items:center;margin:10px 0;padding:10px;border:1px solid #eee;border-radius:5px;">
      <img src="${item.product.images?.[0] || ""}" alt="${item.product.name}" style="width:60px;height:60px;object-fit:cover;margin-right:15px;">
      <div>
        <strong>${formatProductName(item.product.name)}</strong><br>
        Quantity: ${item.quantity} | Price: Rs. ${item.product.price}
      </div>
    </div>
  `,
    )
    .join("");

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#333;">Your cart is waiting</h2>
      <p>We noticed you left some styles in your cart. Complete your order before they sell out.</p>

      <div style="background:#f9f9f9;padding:20px;border-radius:5px;margin:20px 0;">
        ${itemsHtml}
        <div style="text-align:right;margin-top:15px;font-size:18px;font-weight:bold;">
          Total: Rs. ${total}
        </div>
      </div>

      <div style="text-align:center;margin:30px 0;">
        <a href="${recoveryUrl}" style="background:#d4af37;color:white;padding:15px 30px;text-decoration:none;border-radius:5px;font-weight:bold;">
          Complete Your Purchase
        </a>
      </div>

      <p style="color:#666;font-size:14px;">
        This link will expire in 7 days. If you did not add these items to your cart, please ignore this email.
      </p>

      <p style="color:#666;font-size:12px;">
        Best regards,<br>
        Auraa Fashion Jewellery
      </p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: "Your Cart Is Waiting - Complete Your Purchase",
    html,
  });
}

export async function sendOrderConfirmationEmail(
  email: string,
  orderDetails: OrderEmailDetails,
) {
  const itemsHtml = orderDetails.items
    .map(
      (item: CartEmailItem) => `
    <div style="display:flex;align-items:center;margin:10px 0;padding:15px;border:1px solid #eee;border-radius:8px;background:#fafafa;">
      <div style="flex:1;">
        <strong style="font-size:16px;color:#333;">${formatProductName(item.product.name)}</strong><br>
        <span style="color:#666;">Quantity: ${item.quantity} | Unit Price: Rs. ${item.product.price / 100}</span>
      </div>
      <div style="font-weight:bold;color:#d4af37;font-size:16px;">
        Rs. ${(item.product.price * item.quantity) / 100}
      </div>
    </div>
  `,
    )
    .join("");

  const shippingAddress = orderDetails.shippingAddress
    ? `
    <div style="background:#f9f9f9;padding:15px;border-radius:8px;margin:15px 0;">
      <h4 style="margin:0 0 10px 0;color:#333;">Shipping Address</h4>
      <p style="margin:5px 0;color:#666;">
        ${orderDetails.shippingAddress.name || ""}<br>
        ${orderDetails.shippingAddress.address}<br>
        ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.pincode}<br>
        ${orderDetails.shippingAddress.email}<br>
        ${orderDetails.shippingAddress.phone}
      </p>
    </div>
  `
    : "";

  const html = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
      <div style="background:linear-gradient(135deg,#d4af37,#b8860b);padding:40px 20px;text-align:center;border-radius:8px 8px 0 0;">
        <h1 style="color:white;margin:0;font-size:28px;">Order Confirmed</h1>
        <p style="color:#f5f5dc;margin:10px 0 0 0;font-size:16px;">Thank you for shopping with Auraa Fashion Jewellery</p>
      </div>

      <div style="padding:30px 20px;">
        <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin-bottom:20px;">
          <h2 style="margin:0 0 15px 0;color:#333;font-size:20px;">Order Details</h2>
          <p style="margin:5px 0;color:#666;"><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
          <p style="margin:5px 0;color:#666;"><strong>Order Date:</strong> ${new Date().toLocaleDateString("en-IN")}</p>
          <p style="margin:5px 0;color:#666;"><strong>Status:</strong> <span style="color:#28a745;font-weight:bold;">${orderDetails.status}</span></p>
        </div>

        <h3 style="color:#333;border-bottom:2px solid #d4af37;padding-bottom:10px;">Items Ordered</h3>
        ${itemsHtml}

        <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;text-align:right;">
          <div style="font-size:18px;font-weight:bold;color:#333;margin-bottom:10px;">
            Total: Rs. ${orderDetails.totalAmount / 100}
          </div>
          <div style="color:#666;font-size:14px;">
            Payment Method: Razorpay
          </div>
        </div>

        ${shippingAddress}

        <div style="background:#e8f5e8;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #28a745;">
          <h4 style="margin:0 0 10px 0;color:#2d5016;">What happens next?</h4>
          <ul style="margin:0;padding-left:20px;color:#2d5016;">
            <li>We will prepare your order within 2-3 business days</li>
            <li>You will receive shipping updates via WhatsApp and email</li>
            <li>Delivery typically takes 3-7 business days</li>
            <li>You can track the order from your account</li>
          </ul>
        </div>

        <div style="text-align:center;margin:30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/order/${orderDetails.id}" style="background:#d4af37;color:white;padding:15px 30px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">
            View Order Details
          </a>
        </div>

        <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;text-align:center;">
          <p style="margin:0;color:#666;font-size:14px;">
            Questions about your order?<br>
            Contact us at <a href="mailto:support@auraa.in" style="color:#d4af37;">support@auraa.in</a> or reply to this email
          </p>
        </div>

        <div style="text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #eee;">
          <p style="margin:0;color:#999;font-size:12px;">
            Thank you for shopping with Auraa Fashion Jewellery<br>
            Statement styles for gifting, celebrations, and everyday glam
          </p>
        </div>
      </div>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: `Order Confirmed - ${orderDetails.orderNumber} | Auraa Fashion Jewellery`,
    html,
  });
}

type OrderStatusUpdateEmailInput = {
  orderNumber: string;
  statusLabel: string;
  statusDetail: string;
  trackUrl: string;
};

export async function sendOrderStatusUpdateEmail(
  email: string,
  input: OrderStatusUpdateEmailInput,
) {
  const html = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
      <div style="background:linear-gradient(135deg,#7a1f24,#5c181c);padding:32px 20px;text-align:center;border-radius:8px 8px 0 0;">
        <h1 style="color:white;margin:0;font-size:22px;">Order update</h1>
        <p style="color:#f5e6e7;margin:10px 0 0 0;font-size:15px;">Order #${input.orderNumber}</p>
      </div>
      <div style="padding:28px 20px;">
        <p style="margin:0 0 12px 0;color:#333;font-size:17px;font-weight:600;">${input.statusLabel}</p>
        <p style="margin:0 0 24px 0;color:#555;font-size:15px;line-height:1.5;">${input.statusDetail}</p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${input.trackUrl}" style="background:#7a1f24;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">
            Track your order
          </a>
        </div>
        <p style="color:#888;font-size:13px;text-align:center;margin:0;">
          Auraa Fashion Jewellery — reply to this email if you need help.
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: `${input.statusLabel} — Order ${input.orderNumber}`,
    html,
  });
}
