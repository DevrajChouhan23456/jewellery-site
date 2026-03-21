"use client";

import Image from "next/image";

type Item = {
  id: string;
  title: string;
  image: string;
  link: string;
};

export default function CuratedSection({ items }: { items: Item[] }) {
  return (
    <section className="px-6 md:px-16 py-16 bg-[#f8f6f4]">
      
      {/* Heading */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-serif">Curated For You</h2>
        <p className="text-gray-500 mt-2 text-lg">Shop By Gender</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {items.map((item) => (
          <div key={item.id} className="group cursor-pointer">
            
            {/* Image */}
            <div className="relative w-full h-[350px] rounded-2xl overflow-hidden">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition duration-500"
              />
            </div>

            {/* Title */}
            <h3 className="text-center mt-4 text-xl font-medium text-gray-800">
              {item.title}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
}