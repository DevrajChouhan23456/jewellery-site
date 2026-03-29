import Image from "next/image";
import { Metadata, ResolvingMetadata } from "next";

import { getProductBySlug, type ProductDetail } from "@/lib/getProductBySlug";
import ProductGallery from "@/components/product/productGallery";
import ProductInfo from "@/components/product/productInfo";

type Props = {
  params: { slug: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  try {
    const slug = await params.slug;
    const product = await getProductBySlug(slug).catch(() => null);

    return {
      title: product ? `${product.name} | Jewellery Store` : "Product Not Found",
      description: product ? `Buy ${product.name} - ${product.material} ${product.type} | ${product.category}` : "Product not found",
      openGraph: product ? {
        images: product.images,
        title: product.name,
        description: `Premium ${product.material} ${product.type}`,
      } : undefined,
    };
  } catch {
    return {
      title: "Product Not Found",
    };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const slug = await params.slug;
  const product = await getProductBySlug(slug);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:gap-24">
        <ProductGallery images={product.images} />
        
        <ProductInfo product={{
          name: product.name,
          price: product.price,
          sizes: ['S', 'M', 'L'], // Static for jewellery
        } as any} />
      </div>

      {/* Description Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold mb-6">Product Details</h2>
        <div className="text-sm text-gray-600 leading-relaxed">
          Premium {product.material.toUpperCase()} {product.type.toUpperCase()} crafted for elegance.
          Perfect for {product.category === 'jewellery' ? 'everyday luxury' : product.category}.
        </div>
      </section>

      {/* Related Products Teaser */}
      <section className="mt-24">
        <h2 className="text-2xl font-semibold mb-8">You might also like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-50 rounded-xl animate-pulse" />
          ))}
        </div>
      </section>
    </div>
  );
}


