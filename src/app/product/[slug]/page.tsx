import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ShieldCheck, Truck } from "lucide-react";

import AddToCartButton from "@/components/add-to-cart-button";
import { ProductGallery } from "@/components/shop/product-gallery";
import { getProductById } from "@/lib/products";

export const dynamic = "force-dynamic";

type ProductPageRouteProps = {
  params: Promise<{ slug: string }>;
};

function formatINR(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export async function generateMetadata({
  params,
}: ProductPageRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductById(slug);

  if (!product) {
    return {
      title: "Product Not Found | Tanishq",
    };
  }

  return {
    title: `${product.name} | Tanishq`,
    description: product.description || `Buy ${product.name} online at Tanishq.`,
  };
}

export default async function ProductPage({ params }: ProductPageRouteProps) {
  const { slug } = await params;
  const product = await getProductById(slug);

  if (!product) {
    notFound();
  }

  const galleryImages =
    product.images.filter((image): image is string => Boolean(image)).length > 0
      ? product.images.filter((image): image is string => Boolean(image))
      : product.imageUrl
        ? [product.imageUrl]
        : ["/images/sbg-women.jpg"];

  const specs = (product.specifications as Record<string, string>) || {
    "Metal Purity": "18KT Gold",
    Theme: product.shopPage.title,
    Occasion: "Everyday, Celebration",
  };

  return (
    <main className="min-h-screen bg-[#faf9f6]">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 md:py-10 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 font-serif text-xs uppercase tracking-wider text-gray-500">
          <Link href="/" className="transition hover:text-[#832729]">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <Link
            href={`/shop/${product.shopPage.slug}`}
            className="transition hover:text-[#832729]"
          >
            {product.shopPage.title}
          </Link>
          <ChevronRight className="size-3" />
          <span className="max-w-[200px] truncate font-medium text-[#832729] md:max-w-[400px]">
            {product.name}
          </span>
        </nav>

        <div className="lg:grid lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <ProductGallery
            images={galleryImages}
            productName={product.name}
            badge={product.badge}
          />

          <div className="mt-10 px-2 sm:px-0 lg:mt-0">
            <h1 className="mb-3 text-3xl leading-[1.1] tracking-tight text-gray-900 md:text-[42px]">
              {product.name}
            </h1>
            <p className="mb-8 font-sans text-sm text-gray-500">
              Product Code:{" "}
              <span className="font-semibold text-gray-700">
                {product.id.slice(-8).toUpperCase()}
              </span>
            </p>

            <div className="mb-6 flex items-end gap-3">
              <span className="text-4xl font-medium text-[#832729]">
                {formatINR(product.price)}
              </span>
              <span className="mb-1 font-sans text-sm text-gray-500">
                (Price inclusive of all taxes)
              </span>
            </div>

            {product.lowStockText ? (
              <p className="mb-6 inline-block rounded bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-600">
                Low stock: {product.lowStockText}
              </p>
            ) : null}

            <p className="mb-10 max-w-[90%] font-sans text-[15px] leading-relaxed text-gray-600 lg:text-base">
              {product.description}
            </p>

            <div className="mb-10 flex flex-col gap-4 sm:flex-row">
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  imageUrl: galleryImages[0] ?? "/images/product-placeholder.png",
                }}
              />
              <button className="flex items-center justify-center rounded-full border border-[#832729] bg-white px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-[#832729] transition hover:bg-[#fcf8f8] sm:flex-[0.8]">
                Buy Now
              </button>
            </div>

            <div className="mb-10 grid grid-cols-2 gap-4 border-y border-gray-200 py-8">
              <div className="flex items-center gap-4">
                <span className="rounded-full bg-[#faeff0] p-3 text-[#832729]">
                  <ShieldCheck className="size-6 stroke-[1.5]" />
                </span>
                <span className="font-serif text-[15px] leading-tight text-gray-800">
                  Purity
                  <br />
                  Guarantee
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="rounded-full bg-[#faeff0] p-3 text-[#832729]">
                  <Truck className="size-6 stroke-[1.5]" />
                </span>
                <span className="font-serif text-[15px] leading-tight text-gray-800">
                  Secure & Free
                  <br />
                  Delivery
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="border-b border-gray-200 pb-3 text-xl font-medium text-gray-900">
                Product Details
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3">
                {Object.entries(specs).map(([key, value]) => (
                  <div key={key}>
                    <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">
                      {key}
                    </span>
                    <span className="block font-serif text-sm font-medium text-gray-900">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
