import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { searchProducts } from "@/lib/products";

const EMBEDDING_MODEL = "text-embedding-3-small";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let index = 0; index < a.length; index += 1) {
    dotProduct += a[index] * b[index];
    normA += a[index] * a[index];
    normB += b[index] * b[index];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

const INTENT_KEYWORDS = {
  cheap: ["cheap", "budget", "affordable", "low price", "inexpensive"],
  premium: ["premium", "luxury", "expensive", "high-end", "costly"],
  gold: ["gold", "golden"],
  diamond: ["diamond", "diamonds"],
  wedding: ["wedding", "bridal", "marriage", "engagement"],
  gift: ["gift", "present", "surprise"],
} as const;

function detectIntent(query: string): {
  sortBy?: "price_asc" | "price_desc";
  category?: string;
  material?: string;
} {
  const lowerQuery = query.toLowerCase();
  const intent: {
    sortBy?: "price_asc" | "price_desc";
    category?: string;
    material?: string;
  } = {};

  if (INTENT_KEYWORDS.cheap.some((keyword) => lowerQuery.includes(keyword))) {
    intent.sortBy = "price_asc";
  } else if (
    INTENT_KEYWORDS.premium.some((keyword) => lowerQuery.includes(keyword))
  ) {
    intent.sortBy = "price_desc";
  }

  if (INTENT_KEYWORDS.wedding.some((keyword) => lowerQuery.includes(keyword))) {
    intent.category = "rings";
  }

  if (INTENT_KEYWORDS.gold.some((keyword) => lowerQuery.includes(keyword))) {
    intent.material = "gold";
  }

  if (INTENT_KEYWORDS.diamond.some((keyword) => lowerQuery.includes(keyword))) {
    intent.material = "diamond";
  }

  return intent;
}

function hasUsableOpenAIKey() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  return Boolean(apiKey && !apiKey.toLowerCase().startsWith("dummy"));
}

function isRecoverableOpenAIError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as {
    code?: string;
    status?: number;
    message?: string;
    type?: string;
  };

  return (
    maybeError.code === "invalid_api_key" ||
    maybeError.status === 401 ||
    maybeError.type === "invalid_request_error" ||
    maybeError.message?.includes("Incorrect API key provided") === true
  );
}

async function buildTextSearchResult(
  query: string,
  limit: number,
  options?: {
    requestedType?: "text" | "ai";
    fallbackReason?: string;
  },
) {
  const products = await searchProducts(query, limit);

  return {
    products,
    total: products.length,
    query: query.trim(),
    type: options?.requestedType ?? "text",
    mode: options?.fallbackReason ? "fallback" : "text",
    fallbackReason: options?.fallbackReason,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const type = searchParams.get("type") || "text";
  const limit = Math.min(Number(searchParams.get("limit")) || 8, 20);

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ products: [], total: 0 });
  }

  const cacheKey = `search:${type}:${query.trim().toLowerCase()}:${limit}`;

  try {
    const cachedResult = await redis.get(cacheKey);
    if (cachedResult) {
      return NextResponse.json(JSON.parse(cachedResult as string));
    }

    if (type === "ai") {
      if (!hasUsableOpenAIKey()) {
        const fallbackResult = await buildTextSearchResult(query, limit, {
          requestedType: "ai",
          fallbackReason: "openai_key_unavailable",
        });

        await redis.setex(cacheKey, 300, JSON.stringify(fallbackResult));
        return NextResponse.json(fallbackResult);
      }

      try {
        const queryEmbedding = await openai.embeddings.create({
          model: EMBEDDING_MODEL,
          input: query.trim(),
          encoding_format: "float",
        });

        const embedding = queryEmbedding.data[0].embedding;
        const intent = detectIntent(query);
        const where: {
          embeddings: { isEmpty: false };
          category?: { contains: string; mode: "insensitive" };
          material?: { contains: string; mode: "insensitive" };
        } = {
          embeddings: { isEmpty: false },
        };

        if (intent.category) {
          where.category = { contains: intent.category, mode: "insensitive" };
        }

        if (intent.material) {
          where.material = { contains: intent.material, mode: "insensitive" };
        }

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

        const productIds = products.map((product) => product.id);
        const salesData =
          productIds.length === 0
            ? []
            : await prisma.orderItem.groupBy({
                by: ["productId"],
                where: {
                  productId: { in: productIds },
                },
                _count: {
                  quantity: true,
                },
              });

        const salesMap = new Map(
          salesData.map((item) => [item.productId, item._count.quantity]),
        );

        let rankedProducts = products
          .map((product) => {
            const similarity = cosineSimilarity(embedding, product.embeddings);
            const salesCount = salesMap.get(product.id) || 0;

            return {
              ...product,
              similarity,
              score: similarity + salesCount * 0.01,
            };
          })
          .sort((a, b) => b.score - a.score);

        if (intent.sortBy === "price_asc") {
          rankedProducts = rankedProducts.sort((a, b) => a.price - b.price);
        } else if (intent.sortBy === "price_desc") {
          rankedProducts = rankedProducts.sort((a, b) => b.price - a.price);
        }

        const finalProducts = rankedProducts.slice(0, limit).map((product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          images: product.images,
          category: product.category,
          material: product.material,
          type: product.type,
          description: product.description,
          createdAt: product.createdAt,
        }));

        const result = {
          products: finalProducts,
          total: finalProducts.length,
          query: query.trim(),
          type: "ai",
          mode: "semantic",
          intent,
        };

        await redis.setex(cacheKey, 300, JSON.stringify(result));
        return NextResponse.json(result);
      } catch (error) {
        if (!isRecoverableOpenAIError(error)) {
          throw error;
        }

        console.warn(
          "Falling back to text search after OpenAI search failure.",
          error,
        );

        const fallbackResult = await buildTextSearchResult(query, limit, {
          requestedType: "ai",
          fallbackReason: "openai_auth_failed",
        });

        await redis.setex(cacheKey, 300, JSON.stringify(fallbackResult));
        return NextResponse.json(fallbackResult);
      }
    }

    const result = await buildTextSearchResult(query, limit);
    await redis.setex(cacheKey, 300, JSON.stringify(result));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
