import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/products";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Cosine similarity calculation
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Intent detection keywords
const INTENT_KEYWORDS = {
  cheap: ["cheap", "budget", "affordable", "low price", "inexpensive"],
  premium: ["premium", "luxury", "expensive", "high-end", "costly"],
  gold: ["gold", "golden"],
  diamond: ["diamond", "diamonds"],
  wedding: ["wedding", "bridal", "marriage", "engagement"],
  gift: ["gift", "present", "surprise"],
};

function detectIntent(query: string): {
  sortBy?: "price_asc" | "price_desc";
  category?: string;
  material?: string;
} {
  const lowerQuery = query.toLowerCase();

  const intent: any = {};

  // Price sorting intent
  if (INTENT_KEYWORDS.cheap.some(keyword => lowerQuery.includes(keyword))) {
    intent.sortBy = "price_asc";
  } else if (INTENT_KEYWORDS.premium.some(keyword => lowerQuery.includes(keyword))) {
    intent.sortBy = "price_desc";
  }

  // Category/material intent
  if (INTENT_KEYWORDS.wedding.some(keyword => lowerQuery.includes(keyword))) {
    intent.category = "rings"; // Wedding rings
  }

  if (INTENT_KEYWORDS.gold.some(keyword => lowerQuery.includes(keyword))) {
    intent.material = "gold";
  }

  if (INTENT_KEYWORDS.diamond.some(keyword => lowerQuery.includes(keyword))) {
    intent.material = "diamond";
  }

  return intent;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const type = searchParams.get("type") || "text"; // "text" or "ai"
  const limit = Math.min(Number(searchParams.get("limit")) || 8, 20);

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ products: [], total: 0 });
  }

  const cacheKey = `search:${type}:${query.trim().toLowerCase()}:${limit}`;

  try {
    // Try to get from cache first
    const cachedResult = await redis.get(cacheKey);
    if (cachedResult) {
      return NextResponse.json(JSON.parse(cachedResult));
    }

    let result;

    if (type === "ai") {
      // AI-powered semantic search
      const queryEmbedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: query.trim(),
        encoding_format: "float",
      });

      const embedding = queryEmbedding.data[0].embedding;

      // Detect intent
      const intent = detectIntent(query);

      // Build where clause for intent filtering
      const where: any = {
        embeddings: { not: null },
      };

      if (intent.category) {
        where.category = { contains: intent.category, mode: "insensitive" };
      }

      if (intent.material) {
        where.material = { contains: intent.material, mode: "insensitive" };
      }

      // Get products with embeddings and intent filters
      const products = await prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: true,
          category: true,
          material: true,
          type: true,
          description: true,
          createdAt: true,
          embeddings: true,
        },
      });

      // Get sales data for ranking
      const productIds = products.map(p => p.id);
      const salesData = await prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          productId: { in: productIds }
        },
        _count: {
          quantity: true,
        },
      });

      const salesMap = new Map(
        salesData.map(item => [item.productId, item._count.quantity])
      );

      // Calculate similarities and rank
      let rankedProducts = products
        .map((product) => {
          const similarity = cosineSimilarity(embedding, product.embeddings!);
          const salesCount = salesMap.get(product.id) || 0;

          // Boost score with sales popularity
          const score = similarity + (salesCount * 0.01);

          return {
            ...product,
            similarity,
            score,
          };
        })
        .sort((a, b) => b.score - a.score);

      // Apply intent-based sorting
      if (intent.sortBy === "price_asc") {
        rankedProducts = rankedProducts.sort((a, b) => a.price - b.price);
      } else if (intent.sortBy === "price_desc") {
        rankedProducts = rankedProducts.sort((a, b) => b.price - a.price);
      }

      const finalProducts = rankedProducts
        .slice(0, limit)
        .map(({ embeddings, _count, ...product }) => product);

      const result = {
        products: finalProducts,
        total: finalProducts.length,
        query: query.trim(),
        type: "ai",
        intent,
      };

      // Cache the result for 5 minutes
      await redis.setex(cacheKey, 300, JSON.stringify(result));

      return NextResponse.json(result);
    } else {
      // Traditional text search
      const products = await searchProducts(query, limit);
      const result = {
        products,
        total: products.length,
        query: query.trim(),
        type: "text",
      };

      // Cache the result for 5 minutes
      await redis.setex(cacheKey, 300, JSON.stringify(result));

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}