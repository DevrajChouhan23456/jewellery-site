import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import ProductGallery from "@/components/product/productGallery";
import ProductInfo from "@/components/product/productInfo";
import StickyProductHeader from "@/components/product/stickyProductHeader";
import ProductWishlistToggle from "@/components/product/productWishlistToggle";
import { getProductBySlug, getRelatedProducts } from "@/lib/getProductBySlug";

const FALLBACK_PRODUCT_IMAGE = "/images/product-placeholder.svg";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug).catch(() => null);

    return {
      title: product ? `${product.name} | Jewellery Store` : "Product Not Found",
      description: product
        ? `Buy ${product.name} - ${product.material} ${product.type} | ${product.category}`
        : "Product not found",
      openGraph: product
        ? {
            images: product.images,
            title: product.name,
            description: `Premium ${product.material} ${product.type}`,
          }
        : undefined,
    };
  } catch {
    return {
      title: "Product Not Found",
    };
  }
}

export default async function ProductDetailPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const productSizes = ["XS", "S", "M", "L", "XL"];
  const relatedProducts = await getRelatedProducts(product, 4);
  const primaryImage = product.images[0] ?? FALLBACK_PRODUCT_IMAGE;
  const galleryImages =
    product.images.length > 0 ? product.images : [FALLBACK_PRODUCT_IMAGE];

  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#1a1a1a]">
      <StickyProductHeader
        product={{
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: primaryImage,
        }}
      />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-6 text-sm text-rose-700">
          <span className="text-slate-600">Home</span> /{" "}
          <span className="text-slate-600">Jewellery</span> /{" "}
          <span className="font-semibold">{product.name}</span>
        </div>

        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <article className="rounded-3xl bg-white p-4 shadow-lg ring-1 ring-black/5 sm:p-6">
            <ProductGallery images={galleryImages} />
          </article>

          <article className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-black/5">
              <p className="text-sm uppercase tracking-wider text-[#8b6f47]">
                Limited Edition
              </p>
              <div className="mt-2 flex items-center gap-3">
                <h1 className="text-3xl font-serif font-bold tracking-tight text-[#1a1a1a] sm:text-4xl">
                  {product.name}
                </h1>
                <ProductWishlistToggle productId={product.id} />
              </div>

              <p className="mt-4 text-2xl font-extrabold text-[#8b6f47]">
                INR {product.price.toLocaleString("en-IN")}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium uppercase text-slate-500">
                <span className="rounded-full bg-rose-100 px-3 py-1">
                  {product.material}
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1">
                  {product.type}
                </span>
                <span className="rounded-full bg-cyan-100 px-3 py-1">
                  {product.category}
                </span>
              </div>

              <div className="mt-6">
                <ProductInfo
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    imageUrl: primaryImage,
                    sizes: productSizes,
                  }}
                />
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-black/5">
              <h2 className="text-2xl font-semibold text-slate-900">
                Product Details
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Crafted in premium {product.material} and shaped with clean
                geometry, the {product.name} brings modern shine with artisan
                craftsmanship. Suitable for daily wear and special occasions.
              </p>

              <ul className="mt-5 space-y-2 text-sm text-slate-600">
                <li>SKU: {product.slug}</li>
                <li>Category: {product.category}</li>
                <li>Sub-category: {product.subCategory ?? "General"}</li>
                <li>
                  Created at: {new Date(product.createdAt).toLocaleDateString()}
                </li>
                <li>Delivery: Free next-day shipping</li>
                <li>Returns: 30-day easy return policy</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <h2 className="mb-7 text-2xl font-bold text-slate-900">
          You might also like
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {relatedProducts.map((relatedProduct) => (
            <div key={relatedProduct.id} className="group">
              <Link href={`/product/${relatedProduct.slug}`} className="block">
                <div className="relative h-44 overflow-hidden rounded-xl bg-gradient-to-br from-pink-100 via-white to-purple-50 p-4 shadow-inner">
                  <Image
                    src={relatedProduct.images[0] || FALLBACK_PRODUCT_IMAGE}
                    alt={relatedProduct.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 rounded-lg bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
                </div>
                <div className="mt-2 text-center">
                  <h3 className="line-clamp-2 text-sm font-medium text-gray-900 transition-colors group-hover:text-[#8b6f47]">
                    {relatedProduct.name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-[#a67c52]">
                    INR {relatedProduct.price.toLocaleString("en-IN")}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
