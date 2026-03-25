import Link from "next/link";
import Image from "next/image";
export function ProductGrid({ products }) {

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="flex justify-between items-center mb-6">
  <h2 className="text-2xl font-semibold text-stone-900">
    {products.length} Designs Found
  </h2>
</div>
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

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

          {/* Badge */}
          {product.badge && (
            <div className="absolute top-4 left-4 bg-[#832729] text-white text-xs px-3 py-1 rounded-full">
              {product.badge}
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="text-lg font-serif text-stone-900 group-hover:text-[#a67c52] transition">
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
    </div>
  );
}
