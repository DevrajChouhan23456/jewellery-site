import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

type ProductGridItem = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  badge?: string | null;
};

type ProductGridProps = {
  products: ProductGridItem[];
};

function formatINR(price: number) {
  return `₹ ${price.toLocaleString("en-IN")}`;
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif text-stone-900 tracking-wide">
          {products.length} Designs Found
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">

        {products.map((product) => (
          <Link
            href={`/product/${product.id}`}
            key={product.id}
            className="group block"
          >
            <div className="relative rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition duration-500">

              {/* Image */}
              <div className="relative h-[300px] overflow-hidden">
                <Image
                  src={product.imageUrl || "/images/product-placeholder.svg"}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover transition duration-700 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />

                {/* Wishlist */}
                <button className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur hover:bg-white transition hover:scale-110">
                  <Heart className="size-4 text-gray-700 hover:text-[#832729]" />
                </button>

                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-4 left-4 bg-[#832729] text-white px-3 py-1 text-xs uppercase tracking-widest rounded-full">
                    {product.badge}
                  </div>
                )}

                {/* Quick View */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition duration-500">
                  <span className="px-4 py-2 bg-white text-sm rounded-full shadow hover:bg-black hover:text-white transition">
                    Quick View
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-serif text-stone-900 group-hover:text-[#a67c52] transition">
                  {product.name}
                </h3>

                <p className="text-xl font-semibold text-[#a67c52]">
                  {formatINR(product.price)}
                </p>
              </div>

            </div>
          </Link>
        ))}

      </div>
    </div>
  );
}
