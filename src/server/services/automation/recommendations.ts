import prisma from "@/lib/prisma";
import { getAutomationSetting } from "./settings";

export async function generateProductRecommendations(userId?: string, sessionId?: string, limit = 10) {
  const isEnabled = await getAutomationSetting('recommendations_enabled');
  if (!isEnabled?.isEnabled) return [];

  // Get user's purchase history
  const userPurchases = userId ? await prisma.orderItem.findMany({
    where: {
      order: {
        userId,
        paymentStatus: 'PAID'
      }
    },
    include: {
      product: {
        select: { id: true, category: true, material: true, type: true }
      }
    }
  }) : [];

  // Get user's wishlist
  const userWishlist = userId ? await prisma.wishlist.findMany({
    where: { userId },
    include: {
      product: {
        select: { id: true, category: true, material: true, type: true }
      }
    }
  }) : [];

  // Get trending products
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const trendingProducts = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: {
      order: {
        paymentStatus: 'PAID',
        createdAt: { gte: thirtyDaysAgo }
      }
    },
    _sum: {
      quantity: true
    },
    orderBy: {
      _sum: {
        quantity: 'desc'
      }
    },
    take: 20
  });

  const trendingProductIds = trendingProducts.map(t => t.productId);

  // Generate recommendations based on user behavior
  let recommendations = [];

  if (userPurchases.length > 0) {
    // Collaborative filtering: products bought by users who bought similar items
    const userCategories = [...new Set(userPurchases.map(p => p.product.category))];
    const userMaterials = [...new Set(userPurchases.map(p => p.product.material))];

    const similarProducts = await prisma.product.findMany({
      where: {
        OR: [
          { category: { in: userCategories } },
          { material: { in: userMaterials } }
        ],
        id: {
          notIn: userPurchases.map(p => p.product.id)
        }
      },
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        category: true,
        material: true
      },
      take: limit
    });

    recommendations = similarProducts.map(product => ({
      product,
      score: 0.8, // High score for similar products
      algorithm: 'collaborative',
      context: 'similar_purchases'
    }));
  } else if (userWishlist.length > 0) {
    // Content-based: similar to wishlist items
    const wishlistCategories = [...new Set(userWishlist.map(w => w.product.category))];

    const similarProducts = await prisma.product.findMany({
      where: {
        category: { in: wishlistCategories },
        id: {
          notIn: userWishlist.map(w => w.product.id)
        }
      },
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        category: true,
        material: true
      },
      take: limit
    });

    recommendations = similarProducts.map(product => ({
      product,
      score: 0.7,
      algorithm: 'content_based',
      context: 'wishlist_similar'
    }));
  } else {
    // Trending products for new users
    const trendingProductDetails = await prisma.product.findMany({
      where: {
        id: { in: trendingProductIds }
      },
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        category: true,
        material: true
      },
      take: limit
    });

    recommendations = trendingProductDetails.map(product => ({
      product,
      score: 0.6,
      algorithm: 'trending',
      context: 'popular_products'
    }));
  }

  // Store recommendations in database
  if (userId || sessionId) {
    for (const rec of recommendations) {
      await prisma.recommendation.upsert({
        where: {
          id: `${(userId || sessionId) as string}_${rec.product.id}_${Date.now()}`
        },
        update: {},
        create: {
          userId,
          sessionId,
          productId: rec.product.id,
          recommendedFor: (userId || sessionId) as string,
          score: rec.score,
          algorithm: rec.algorithm,
          context: rec.context,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      });
    }
  }

  return recommendations;
}

export async function trackRecommendationInteraction(recommendationId: string, action: 'click' | 'purchase') {
  const updateData = action === 'click'
    ? { isClicked: true }
    : { isPurchased: true };

  return await prisma.recommendation.update({
    where: { id: recommendationId },
    data: updateData
  });
}

export async function getRecommendationAnalytics(days = 7) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const totalRecommendations = await prisma.recommendation.count({
    where: { createdAt: { gte: since } }
  });

  const clickedRecommendations = await prisma.recommendation.count({
    where: {
      createdAt: { gte: since },
      isClicked: true
    }
  });

  const purchasedRecommendations = await prisma.recommendation.count({
    where: {
      createdAt: { gte: since },
      isPurchased: true
    }
  });

  const clickRate = totalRecommendations > 0 ? (clickedRecommendations / totalRecommendations) * 100 : 0;
  const purchaseRate = totalRecommendations > 0 ? (purchasedRecommendations / totalRecommendations) * 100 : 0;

  return {
    totalRecommendations,
    clickedRecommendations,
    purchasedRecommendations,
    clickRate,
    purchaseRate
  };
}