import { notFound, redirect } from 'next/navigation';
import { markRecoveryClicked } from '@/server/services/automation/cart-recovery';
import { posthogEvents } from '@/lib/posthog-events';
import prisma from '@/lib/prisma';

interface RecoveryPageProps {
  params: {
    token: string;
  };
}

export default async function CartRecoveryPage({ params }: RecoveryPageProps) {
  const { token } = params;

  try {
    // Find the recovery record
    const recovery = await prisma.cartRecovery.findUnique({
      where: { recoveryToken: token },
      include: {
        cart: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    images: true,
                    slug: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!recovery) {
      notFound();
    }

    // Check if expired
    if (recovery.expiresAt < new Date()) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Link Expired</h1>
            <p className="text-gray-600">
              This cart recovery link has expired. Please visit our shop to start a new cart.
            </p>
          </div>
        </div>
      );
    }

    // Mark as clicked
    await markRecoveryClicked(token);

    // Track recovery click
    posthogEvents.trackCartRecoveryClick(recovery.id, recovery.cartId);

    // Redirect to cart page (you might want to restore the cart items)
    redirect('/cart');

  } catch (error) {
    console.error('Cart recovery error:', error);
    notFound();
  }
}
