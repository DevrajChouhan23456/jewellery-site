import Image from "next/image";
import Link from "next/link";

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
  return `INR ${price.toLocaleString("en-IN")}`;
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-stone-900">
          {products.length} Designs Found
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <Link
            href={`/product/${product.id}`}
            key={product.id}
            className="group luxury-card overflow-hidden transition duration-500 hover:-translate-y-2"
          >
            <div className="relative h-[260px] overflow-hidden">
              <Image
                src={product.imageUrl || "/placeholder.jpg"}
                alt={product.name}
                fill
                className="object-cover transition duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

              {product.badge ? (
                <div className="absolute top-4 left-4 rounded-full bg-[#832729] px-3 py-1 text-xs text-white">
                  {product.badge}
                </div>
              ) : null}
            </div>

            <div className="p-5">
              <h3 className="text-lg font-serif text-stone-900 transition group-hover:text-[#a67c52]">
                {product.name}
              </h3>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-xl font-serif text-[#a67c52]">
                  {formatINR(product.price)}
                </p>

                <span className="text-xs uppercase tracking-widest text-[#a67c52]">
                  View
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
