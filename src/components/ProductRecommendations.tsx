"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";

interface Recommendation {
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
  score: number;
  algorithm: string;
  context: string;
}

interface ProductRecommendationsProps {
  productId?: string;
  limit?: number;
}

export default function ProductRecommendations({
  productId,
  limit = 4,
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const params = new URLSearchParams({ limit: String(limit) });
        if (productId) {
          params.set("productId", productId);
        }

        const response = await fetch(`/api/recommendations?${params.toString()}`);
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchRecommendations();
  }, [limit, productId]);

  const trackClick = async (recommendationId: string) => {
    try {
      await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendationId, action: "click" }),
      });
    } catch (error) {
      console.error("Failed to track recommendation click:", error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: limit }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="mb-2 aspect-square rounded-lg bg-gray-200" />
            <div className="mb-1 h-4 rounded bg-gray-200" />
            <div className="h-3 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recommended for You</h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {recommendations.map((recommendation) => (
          <Card
            key={recommendation.product.id}
            className="overflow-hidden transition-shadow hover:shadow-lg"
          >
            <CardContent className="p-0">
              <Link
                href={`/product/${recommendation.product.id}`}
                onClick={() =>
                  trackClick(`${recommendation.product.id}_${Date.now()}`)
                }
                className="block"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={
                      recommendation.product.images[0] ||
                      "/images/product-placeholder.svg"
                    }
                    alt={recommendation.product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <h4 className="line-clamp-2 text-sm font-medium">
                    {recommendation.product.name}
                  </h4>
                  <p className="mt-1 text-lg font-bold text-primary">
                    INR {recommendation.product.price}
                  </p>
                  <p className="mt-1 text-xs capitalize text-gray-500">
                    {recommendation.algorithm.replace("_", " ")}
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
