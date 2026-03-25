import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import Image from "next/image";
import { ChevronRight, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import AddToCartButton from "@/components/add-to-cart-button";
import { ProductGallery } from "@/components/shop/product-gallery";

export const dynamic = "force-dynamic";

type ProductPageRouteProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageRouteProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

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
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  // Use the primary imageUrl if images array is empty
  const galleryImages = product.images.length > 0 && product.images[0] !== null
    ? product.images 
    : (product.imageUrl ? [product.imageUrl, product.imageUrl, product.imageUrl] : ["/images/sbg-women.jpg"]);

  const specs = (product.specifications as Record<string, string>) || {
    "Metal Purity": "18KT Gold",
    "Theme": product.shopPage.title,
    "Occasion": "Everyday, Celebration"
  };

  return (
    <main className="min-h-screen bg-[#faf9f6]">
      <div className="mx-auto max-w-[1400px] px-4 py-6 md:py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8 font-serif uppercase tracking-wider">
          <Link href="/" className="hover:text-[#832729] transition">Home</Link>
          <ChevronRight className="size-3" />
          <Link href={`/shop/${product.shopPage.slug}`} className="hover:text-[#832729] transition">
            {product.shopPage.title}
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-[#832729] font-medium truncate max-w-[200px] md:max-w-[400px]">{product.name}</span>
        </nav>

        {/* Product Layout */}
        <div className="lg:grid lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          
          {/* Gallery Area */}
          <ProductGallery images={galleryImages} productName={product.name} badge={product.badge} />

          {/* Details Area */}
          <div className="mt-10 lg:mt-0 px-2 sm:px-0">
            <h1 className="text-3xl md:text-[42px] font-serif text-gray-900 tracking-tight leading-[1.1] mb-3">
              {product.name}
            </h1>
            <p className="text-sm text-gray-500 mb-8 font-sans">Product Code: <span className="font-semibold text-gray-700">{product.id.slice(-8).toUpperCase()}</span></p>
            
            <div className="flex items-end gap-3 mb-6">
              <span className="text-4xl font-serif font-medium text-[#832729]">
                ₹ {new Intl.NumberFormat('en-IN').format(product.price)}
              </span>
              <span className="text-sm text-gray-500 font-sans mb-1">(Price inclusive of all taxes)</span>
            </div>

            {product.lowStockText && (
              <p className="text-sm font-semibold text-amber-600 mb-6 bg-amber-50 inline-block px-3 py-1 rounded">
                ⏳ {product.lowStockText}
              </p>
            )}

            <p className="text-gray-600 font-sans leading-relaxed mb-10 text-[15px] lg:text-base max-w-[90%]">
              {product.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <AddToCartButton 
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  imageUrl: galleryImages[0]
                }} 
              />
              <button className="flex-[0.8] bg-white text-[#832729] border border-[#832729] px-8 py-4 rounded-full font-bold tracking-[0.2em] text-sm uppercase transition hover:bg-[#fcf8f8] flex items-center justify-center">
                Buy Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 py-8 border-y border-gray-200 mb-10">
              <div className="flex items-center gap-4">
                <span className="p-3 rounded-full bg-[#faeff0] text-[#832729]">
                  <ShieldCheck className="size-6 stroke-[1.5]" />
                </span>
                <span className="text-[15px] font-medium text-gray-800 font-serif leading-tight">Purity<br/>Guarantee</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="p-3 rounded-full bg-[#faeff0] text-[#832729]">
                  <Truck className="size-6 stroke-[1.5]" />
                </span>
                <span className="text-[15px] font-medium text-gray-800 font-serif leading-tight">Secure & Free<br/>Delivery</span>
              </div>
            </div>

            {/* Specifications Accordion */}
            <div className="space-y-6">
              <h3 className="text-xl font-serif font-medium text-gray-900 border-b border-gray-200 pb-3">
                Product Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                {Object.entries(specs).map(([key, value]) => (
                  <div key={key}>
                    <span className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">{key}</span>
                    <span className="block text-sm font-medium text-gray-900 font-serif">{value}</span>
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
