import prisma from "@/lib/prisma";
import { createAlert } from "./alerts";
import { getAutomationSetting } from "./settings";
import { sendCartRecoveryEmail } from "../email";
import { sendCartRecoveryWhatsApp } from "../whatsapp";
import { posthogEvents } from "@/lib/posthog-events";
import { randomBytes } from "crypto";

export async function findAbandonedCarts() {
  const recoveryDelayHours = Number((await getAutomationSetting('cart_recovery_delay_hours'))?.value) || 24;
  const cutoffDate = new Date(Date.now() - recoveryDelayHours * 60 * 60 * 1000);

  const abandonedCarts = await prisma.cart.findMany({
    where: {
      status: 'ACTIVE',
      updatedAt: { lt: cutoffDate },
      userId: { not: null },
      items: {
        some: {} // Has at least one item
      }
    },
    include: {
      user: {
        select: { id: true, email: true, name: true, phone: true }
      },
      items: {
        include: {
          product: {
            select: { id: true, name: true, price: true, images: true }
          }
        }
      }
    }
  });

  return abandonedCarts;
}

export async function createCartRecovery(cartId: string, userId: string, email: string) {
  const recoveryToken = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Check if recovery already exists
  const existing = await prisma.cartRecovery.findFirst({
    where: { cartId, status: { in: ['PENDING', 'SENT'] } }
  });

  if (existing) return existing;

  return await prisma.cartRecovery.create({
    data: {
      cartId,
      userId,
      email,
      recoveryToken,
      expiresAt
    }
  });
}

export async function processCartRecovery() {
  const isEnabled = await getAutomationSetting('cart_recovery_enabled');
  if (!isEnabled?.isEnabled) return;

  const abandonedCarts = await findAbandonedCarts();

  for (const cart of abandonedCarts) {
    if (!cart.user?.email) continue;

    // Track cart abandonment
    const totalValue = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    posthogEvents.trackCartAbandoned(cart.id, cart.items.length, totalValue / 100, cart.updatedAt.toISOString());

    const recovery = await createCartRecovery(cart.id, cart.user.id, cart.user.email);

    // Send recovery email
    const emailResult = await sendCartRecoveryEmail(
      cart.user.email,
      recovery.recoveryToken,
      cart.items
    );

    // Send WhatsApp recovery message
    let whatsappResult = null;
    if (cart.user.phone) {
      whatsappResult = await sendCartRecoveryWhatsApp(
        cart.user.phone,
        recovery.recoveryToken,
        cart.items
      );
    }

    if (emailResult.success || (whatsappResult && whatsappResult.success)) {
      // Update recovery status
      await prisma.cartRecovery.update({
        where: { id: recovery.id },
        data: { status: 'SENT', sentAt: new Date() }
      });

      // Create alert for successful send
      await createAlert({
        type: 'CART_ABANDONED',
        title: 'Cart Recovery Messages Sent',
        message: `Recovery messages sent to ${cart.user.email}${cart.user.phone ? ` and ${cart.user.phone}` : ''} for cart with ${cart.items.length} items`,
        priority: 'LOW',
        metadata: {
          cartId: cart.id,
          userId: cart.user.id,
          recoveryId: recovery.id,
          emailId: emailResult.id,
          whatsappId: whatsappResult?.id
        }
      });
    } else {
      // Create alert for failed send
      await createAlert({
        type: 'SYSTEM_ERROR',
        title: 'Cart Recovery Messages Failed',
        message: `Failed to send recovery messages to ${cart.user.email}: Email - ${emailResult.error}${whatsappResult ? `, WhatsApp - ${whatsappResult.error}` : ''}`,
        priority: 'MEDIUM',
        metadata: {
          cartId: cart.id,
          userId: cart.user.id,
          recoveryId: recovery.id,
          emailError: emailResult.error,
          whatsappError: whatsappResult?.error
        }
      });
    }
  }

  return abandonedCarts.length;
}

export async function markRecoveryClicked(recoveryToken: string) {
  const recovery = await prisma.cartRecovery.findUnique({
    where: { recoveryToken }
  });

  if (!recovery) return null;

  return await prisma.cartRecovery.update({
    where: { id: recovery.id },
    data: {
      status: 'CLICKED',
      clickedAt: new Date()
    }
  });
}

export async function markRecoveryConverted(recoveryId: string) {
  return await prisma.cartRecovery.update({
    where: { id: recoveryId },
    data: {
      status: 'CONVERTED',
      convertedAt: new Date()
    }
  });
}
