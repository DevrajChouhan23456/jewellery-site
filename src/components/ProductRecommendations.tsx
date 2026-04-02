'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

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

export default function ProductRecommendations({ productId, limit = 4 }: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(`/api/recommendations?limit=${limit}`);
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [limit]);

  const trackClick = async (recommendationId: string) => {
    try {
      await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendationId, action: 'click' })
      });
    } catch (error) {
      console.error('Failed to track recommendation click:', error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-lg mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-1"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((rec) => (
          <Card key={rec.product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <Link
                href={`/product/${rec.product.id}`}
                onClick={() => trackClick(`${rec.product.id}_${Date.now()}`)}
                className="block"
              >
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src={rec.product.images[0] || '/placeholder.jpg'}
                    alt={rec.product.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-sm line-clamp-2">{rec.product.name}</h4>
                  <p className="text-lg font-bold text-primary mt-1">₹{rec.product.price}</p>
                  <p className="text-xs text-gray-500 mt-1 capitalize">{rec.algorithm.replace('_', ' ')}</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}