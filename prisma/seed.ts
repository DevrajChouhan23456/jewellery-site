import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

import { hashPassword } from "../lib/password";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate());

const imageLibrary = {
  women: "/images/sbg-women.jpg",
  men: "/images/sbg-men.webp",
  kids: "/images/sbg-kids.webp",
};

const homepageSections = [
  {
    key: "category",
    title: "Find Your Perfect Match",
    subtitle: "Shop by Categories",
  },
  {
    key: "trending",
    title: "Trending Now",
    subtitle: "Jewellery pieces everyone's eyeing right now",
  },
  {
    key: "arrival",
    eyebrow: "500+ New Items",
    title: "New Arrivals",
    description:
      "New arrivals dropping daily. Explore the latest launches for gifting, celebration, and signature self-expression.",
    ctaLabel: "Explore Latest Launches",
    ctaHref: "/shop/jewellery",
  },
  {
    key: "gender",
    title: "Curated For You",
    subtitle: "Shop by Gender",
  },
];

const homepageCards = [
  {
    section: "category",
    title: "Earrings",
    subtitle: "Delicate sparkle for every day and every event.",
    image: imageLibrary.women,
    link: "/shop/earrings",
    order: 1,
  },
  {
    section: "category",
    title: "Finger Rings",
    subtitle: "Signature bands and elegant statement silhouettes.",
    image: imageLibrary.men,
    link: "/shop/rings",
    order: 2,
  },
  {
    section: "category",
    title: "Pendants",
    subtitle: "Light-catching charms made to layer beautifully.",
    image: imageLibrary.kids,
    link: "/shop/diamond",
    order: 3,
  },
  {
    section: "category",
    title: "Mangalsutra",
    subtitle: "A timeless symbol styled with contemporary grace.",
    image: imageLibrary.men,
    link: "/shop/jewellery",
    order: 4,
  },
  {
    section: "category",
    title: "Bracelets",
    subtitle: "Elegant circles of shine and everyday sophistication.",
    image: imageLibrary.kids,
    link: "/shop/jewellery",
    order: 5,
  },
  {
    section: "category",
    title: "Bangles",
    subtitle: "Rich gold finishes for festive and bridal styling.",
    image: imageLibrary.men,
    link: "/shop/gold",
    order: 6,
  },
  {
    section: "category",
    title: "Chains",
    subtitle: "Subtle layering pieces with a refined modern profile.",
    image: imageLibrary.women,
    link: "/shop/jewellery",
    order: 7,
  },
  {
    section: "category",
    title: "View All",
    subtitle: "10+ categories to choose from",
    image: null,
    link: "/shop/jewellery",
    badge: "10+",
    order: 8,
  },
  {
    section: "trending",
    title: "Auspicious Occasion",
    subtitle: "Temple-inspired pieces for festive moments and heirloom gifting.",
    image: imageLibrary.men,
    link: "/shop/gold",
    order: 1,
  },
  {
    section: "trending",
    title: "Gifting Jewellery",
    subtitle: "Refined keepsakes wrapped in warmth, sparkle, and celebration.",
    image: imageLibrary.kids,
    link: "/shop/gifting",
    order: 2,
  },
  {
    section: "trending",
    title: "Drops of Radiance",
    subtitle: "Soft floral stones and luminous details for modern elegance.",
    image: imageLibrary.women,
    link: "/shop/earrings",
    order: 3,
  },
  {
    section: "arrival",
    title: "Silver Idols",
    subtitle: "Auspicious gifting pieces and divine collectibles.",
    image: imageLibrary.men,
    link: "/shop/jewellery",
    order: 1,
  },
  {
    section: "arrival",
    title: "Floral Bloom",
    subtitle: "Soft blush florals for modern romantic styling.",
    image: imageLibrary.women,
    link: "/shop/earrings",
    order: 2,
  },
  {
    section: "gender",
    title: "Women Jewellery",
    subtitle: "Elegant layers, occasion sparkle, and everyday essentials.",
    image: imageLibrary.women,
    link: "/shop/jewellery",
    order: 1,
  },
  {
    section: "gender",
    title: "Men Jewellery",
    subtitle: "Bold bands, elevated chains, and confident statement pieces.",
    image: imageLibrary.men,
    link: "/shop/jewellery",
    order: 2,
  },
  {
    section: "gender",
    title: "Kids Jewellery",
    subtitle: "Playful gifting designs crafted with softness and shine.",
    image: imageLibrary.kids,
    link: "/shop/jewellery",
    order: 3,
  },
];

const sliderData = [
  {
    imageUrl: imageLibrary.women,
    badge: "Floral Bloom",
    title: "Fresh florals for modern celebration dressing",
    subtitle:
      "Soft gemstones, luminous gold, and elegant silhouettes inspired by the season.",
    ctaLabel: "Shop Floral Edit",
    ctaHref: "/shop/earrings",
    order: 1,
  },
  {
    imageUrl: imageLibrary.men,
    badge: "Golden Signatures",
    title: "Gold statements designed to look timeless from day to night",
    subtitle:
      "Discover refined classics, gifting icons, and everyday luxury essentials.",
    ctaLabel: "Explore Gold",
    ctaHref: "/shop/gold",
    order: 2,
  },
  {
    imageUrl: imageLibrary.kids,
    badge: "Diamond Edit",
    title: "Diamond jewellery that catches the light with quiet confidence",
    subtitle:
      "From pendants to rings, build a look that feels polished and personal.",
    ctaLabel: "Shop Diamond",
    ctaHref: "/shop/diamond",
    order: 3,
  },
];

const shopPageSeed = [
  {
    slug: "jewellery",
    title: "All Jewellery",
    subtitle: "Explore our complete edit of fine jewellery.",
    heroEyebrow: "Signature Collections",
    heroTitle: "Find jewellery for everyday elegance and unforgettable occasions.",
    heroDescription:
      "Browse the full catalogue of earrings, rings, pendants, chains, gifting icons, and festive heirloom-inspired pieces.",
    heroImageUrl: imageLibrary.women,
    heroCtaLabel: "Explore All Jewellery",
    heroCtaHref: "/shop/jewellery",
    resultCount: 28627,
    features: [
      { title: "Earrings", imageUrl: imageLibrary.women, href: "/shop/earrings", order: 1 },
      { title: "Pendants", imageUrl: imageLibrary.kids, href: "/shop/diamond", order: 2 },
      { title: "Rings", imageUrl: imageLibrary.men, href: "/shop/rings", order: 3 },
      { title: "Gifts", imageUrl: imageLibrary.kids, href: "/shop/gifting", order: 4 },
    ],
    products: [
      { name: "Everyday Charm Diamond Stud Earrings", price: 105541, imageUrl: imageLibrary.women, lowStockText: "Only 1 left!", order: 1 },
      { name: "Charming Paisley Pendant", price: 55772, imageUrl: imageLibrary.kids, badge: "EXPERT'S CHOICE", order: 2 },
      { name: "Classic Gold Earrings", price: 86437, imageUrl: imageLibrary.women, order: 3 },
      { name: "Minimal Gold Necklace", price: 124900, imageUrl: imageLibrary.men, order: 4 },
      { name: "Statement Diamond Ring", price: 210450, imageUrl: imageLibrary.men, order: 5 },
      { name: "Elegant Daily Wear Pendant", price: 48990, imageUrl: imageLibrary.kids, order: 6 },
    ],
  },
  {
    slug: "gold",
    title: "Gold",
    subtitle: "Classic gold jewellery with modern polish.",
    heroEyebrow: "Gold Edit",
    heroTitle: "Rich gold tones crafted for gifting, festivals, and everyday shine.",
    heroDescription:
      "Layer delicate essentials or step into festive dressing with gold pieces designed to stay timeless.",
    heroImageUrl: imageLibrary.men,
    heroCtaLabel: "Shop Gold",
    heroCtaHref: "/shop/gold",
    resultCount: 18234,
    features: [
      { title: "Daily Wear", imageUrl: imageLibrary.women, href: "/shop/glamdays", order: 1 },
      { title: "Gifting", imageUrl: imageLibrary.kids, href: "/shop/gifting", order: 2 },
      { title: "Bridal Gold", imageUrl: imageLibrary.men, href: "/shop/jewellery", order: 3 },
      { title: "Chains", imageUrl: imageLibrary.women, href: "/shop/jewellery", order: 4 },
    ],
    products: [
      { name: "Classic Gold Hoop Earrings", price: 68250, imageUrl: imageLibrary.women, order: 1 },
      { name: "Golden Bloom Pendant", price: 92500, imageUrl: imageLibrary.kids, order: 2 },
      { name: "Statement Gold Ring", price: 118750, imageUrl: imageLibrary.men, order: 3 },
      { name: "Heritage Gold Bangle", price: 164900, imageUrl: imageLibrary.men, badge: "BESTSELLER", order: 4 },
      { name: "Minimal Gold Chain", price: 79990, imageUrl: imageLibrary.women, order: 5 },
      { name: "Festive Gold Bracelet", price: 99500, imageUrl: imageLibrary.kids, order: 6 },
    ],
  },
  {
    slug: "diamond",
    title: "Diamond",
    subtitle: "Diamond jewellery for every occasion.",
    heroEyebrow: "Styling 101 with Diamonds",
    heroTitle: "Trendsetting diamond jewellery suited for every occasion.",
    heroDescription:
      "Build your perfect diamond look with statement pendants, refined earrings, occasion rings, and gifting favourites.",
    heroImageUrl: imageLibrary.kids,
    heroCtaLabel: "Explore Diamond",
    heroCtaHref: "/shop/diamond",
    resultCount: 6432,
    features: [
      { title: "Earrings", imageUrl: imageLibrary.women, href: "/shop/earrings", order: 1 },
      { title: "Pendants", imageUrl: imageLibrary.kids, href: "/shop/diamond", order: 2 },
      { title: "Rings", imageUrl: imageLibrary.men, href: "/shop/rings", order: 3 },
      { title: "Gifts", imageUrl: imageLibrary.kids, href: "/shop/gifting", order: 4 },
    ],
    products: [
      { name: "Dazzling Teardrop Diamond Earrings", price: 148500, imageUrl: imageLibrary.women, badge: "TRENDING", order: 1 },
      { name: "Diamond Halo Pendant", price: 129990, imageUrl: imageLibrary.kids, order: 2 },
      { name: "Diamond Promise Ring", price: 175000, imageUrl: imageLibrary.men, lowStockText: "Only 2 left!", order: 3 },
      { name: "Petal Sparkle Studs", price: 86500, imageUrl: imageLibrary.women, order: 4 },
      { name: "Radiant Diamond Bracelet", price: 192500, imageUrl: imageLibrary.kids, order: 5 },
      { name: "Signature Solitaire Pendant", price: 224990, imageUrl: imageLibrary.men, order: 6 },
    ],
  },
  {
    slug: "earrings",
    title: "Earrings",
    subtitle: "Studs, drops, hoops, and event-ready sparkle.",
    heroEyebrow: "Ear Candy",
    heroTitle: "Statement earrings that frame every look with elegance.",
    heroDescription:
      "Discover diamond drops, floral accents, classic gold hoops, and gifting-friendly silhouettes.",
    heroImageUrl: imageLibrary.women,
    heroCtaLabel: "Shop Earrings",
    heroCtaHref: "/shop/earrings",
    resultCount: 5140,
    features: [
      { title: "Studs", imageUrl: imageLibrary.women, href: "/shop/earrings", order: 1 },
      { title: "Drops", imageUrl: imageLibrary.kids, href: "/shop/earrings", order: 2 },
      { title: "Hoops", imageUrl: imageLibrary.men, href: "/shop/earrings", order: 3 },
      { title: "Bridal", imageUrl: imageLibrary.kids, href: "/shop/diamond", order: 4 },
    ],
    products: [
      { name: "Floral Bloom Earrings", price: 92500, imageUrl: imageLibrary.women, order: 1 },
      { name: "Radiant Drop Earrings", price: 114500, imageUrl: imageLibrary.kids, order: 2 },
      { name: "Minimal Gold Hoops", price: 66500, imageUrl: imageLibrary.men, order: 3 },
      { name: "Petal Stud Earrings", price: 58990, imageUrl: imageLibrary.women, order: 4 },
      { name: "Diamond Fan Drops", price: 153900, imageUrl: imageLibrary.kids, order: 5 },
      { name: "Everyday Sparkle Studs", price: 48990, imageUrl: imageLibrary.women, order: 6 },
    ],
  },
  {
    slug: "rings",
    title: "Rings",
    subtitle: "Modern rings for milestones, gifting, and personal style.",
    heroEyebrow: "Celebrate Love & Milestones",
    heroTitle: "Find a ring that speaks your heart with elegance and intent.",
    heroDescription:
      "From casual rings to engagement styles, explore sculpted silhouettes designed for every story.",
    heroImageUrl: imageLibrary.men,
    heroCtaLabel: "Shop Rings",
    heroCtaHref: "/shop/rings",
    resultCount: 4120,
    features: [
      { title: "Casual Rings", imageUrl: imageLibrary.men, href: "/shop/rings", order: 1 },
      { title: "Engagement Rings", imageUrl: imageLibrary.kids, href: "/shop/rings", order: 2 },
      { title: "Couple Rings", imageUrl: imageLibrary.women, href: "/shop/rings", order: 3 },
      { title: "Gold Rings", imageUrl: imageLibrary.men, href: "/shop/gold", order: 4 },
    ],
    products: [
      { name: "Everyday Diamond Ring", price: 98500, imageUrl: imageLibrary.men, order: 1 },
      { name: "Promise Gold Ring", price: 62490, imageUrl: imageLibrary.kids, order: 2 },
      { name: "Diamond Engagement Ring", price: 248000, imageUrl: imageLibrary.women, badge: "BESTSELLER", order: 3 },
      { name: "Minimal Stack Ring", price: 45990, imageUrl: imageLibrary.men, order: 4 },
      { name: "Couple Band Pair", price: 119500, imageUrl: imageLibrary.kids, order: 5 },
      { name: "Halo Statement Ring", price: 184000, imageUrl: imageLibrary.women, order: 6 },
    ],
  },
  {
    slug: "gifting",
    title: "Gifting",
    subtitle: "Thoughtful jewellery gifts for heartfelt milestones.",
    heroEyebrow: "Gift With Grace",
    heroTitle: "From birthdays to anniversaries, choose a gift that lasts.",
    heroDescription:
      "Explore keepsakes, floral sparkle, everyday classics, and memorable gifting edits curated for every celebration.",
    heroImageUrl: imageLibrary.kids,
    heroCtaLabel: "Explore Gifts",
    heroCtaHref: "/shop/gifting",
    resultCount: 2300,
    features: [
      { title: "Birthday Gifts", imageUrl: imageLibrary.women, href: "/shop/gifting", order: 1 },
      { title: "Anniversary", imageUrl: imageLibrary.kids, href: "/shop/gifting", order: 2 },
      { title: "For Him", imageUrl: imageLibrary.men, href: "/shop/gifting", order: 3 },
      { title: "For Her", imageUrl: imageLibrary.women, href: "/shop/gifting", order: 4 },
    ],
    products: [
      { name: "Gift Box Pendant", price: 72500, imageUrl: imageLibrary.kids, order: 1 },
      { name: "Rose Gold Gift Earrings", price: 66500, imageUrl: imageLibrary.women, order: 2 },
      { name: "Golden Keepsake Bracelet", price: 78990, imageUrl: imageLibrary.men, order: 3 },
      { name: "Anniversary Diamond Pendant", price: 118000, imageUrl: imageLibrary.kids, order: 4 },
      { name: "Minimal Gift Ring", price: 52990, imageUrl: imageLibrary.women, order: 5 },
      { name: "Signature Charm Necklace", price: 96990, imageUrl: imageLibrary.men, order: 6 },
    ],
  },
  {
    slug: "glamdays",
    title: "Daily Wear",
    subtitle: "Lightweight luxury for polished everyday styling.",
    heroEyebrow: "Everyday Icons",
    heroTitle: "Daily-wear jewellery that feels easy, modern, and elevated.",
    heroDescription:
      "Choose sleek pendants, stackable rings, versatile earrings, and subtle accents designed to move with your routine.",
    heroImageUrl: imageLibrary.women,
    heroCtaLabel: "Shop Daily Wear",
    heroCtaHref: "/shop/glamdays",
    resultCount: 3750,
    features: [
      { title: "Stackables", imageUrl: imageLibrary.men, href: "/shop/rings", order: 1 },
      { title: "Everyday Chains", imageUrl: imageLibrary.women, href: "/shop/jewellery", order: 2 },
      { title: "Subtle Studs", imageUrl: imageLibrary.kids, href: "/shop/earrings", order: 3 },
      { title: "Office Edit", imageUrl: imageLibrary.women, href: "/shop/glamdays", order: 4 },
    ],
    products: [
      { name: "Minimal Daily Pendant", price: 42500, imageUrl: imageLibrary.kids, order: 1 },
      { name: "Subtle Sparkle Earrings", price: 38990, imageUrl: imageLibrary.women, order: 2 },
      { name: "Delicate Stack Ring", price: 44990, imageUrl: imageLibrary.men, order: 3 },
      { name: "Workday Gold Chain", price: 68500, imageUrl: imageLibrary.women, order: 4 },
      { name: "Everyday Diamond Dot Pendant", price: 59500, imageUrl: imageLibrary.kids, order: 5 },
      { name: "Soft Glow Bracelet", price: 47990, imageUrl: imageLibrary.men, order: 6 },
    ],
  },
  {
    slug: "thejoydressing",
    title: "Collections",
    subtitle: "Curated jewellery stories with a distinct point of view.",
    heroEyebrow: "Collection Stories",
    heroTitle: "Explore signature edits designed around mood, moment, and artistry.",
    heroDescription:
      "Dive into floral stories, diamond styling ideas, gifting edits, and celebration-ready collections.",
    heroImageUrl: imageLibrary.kids,
    heroCtaLabel: "Explore Collections",
    heroCtaHref: "/shop/thejoydressing",
    resultCount: 1960,
    features: [
      { title: "Floral Bloom", imageUrl: imageLibrary.women, href: "/shop/thejoydressing", order: 1 },
      { title: "Diamond Dressing", imageUrl: imageLibrary.kids, href: "/shop/diamond", order: 2 },
      { title: "Festive Gold", imageUrl: imageLibrary.men, href: "/shop/gold", order: 3 },
      { title: "Joyful Gifting", imageUrl: imageLibrary.kids, href: "/shop/gifting", order: 4 },
    ],
    products: [
      { name: "Floral Story Earrings", price: 83500, imageUrl: imageLibrary.women, order: 1 },
      { name: "Collection Signature Pendant", price: 92500, imageUrl: imageLibrary.kids, order: 2 },
      { name: "Joy Dressing Ring", price: 78990, imageUrl: imageLibrary.men, order: 3 },
      { name: "Golden Story Bracelet", price: 115000, imageUrl: imageLibrary.men, order: 4 },
      { name: "Collection Halo Necklace", price: 167500, imageUrl: imageLibrary.kids, order: 5 },
      { name: "Soft Bloom Studs", price: 64250, imageUrl: imageLibrary.women, order: 6 },
    ],
  },
];

async function seedShopPages() {
  for (const page of shopPageSeed) {
    const shopPage = await prisma.shopPage.upsert({
      where: { slug: page.slug },
      update: {
        title: page.title,
        subtitle: page.subtitle,
        heroEyebrow: page.heroEyebrow,
        heroTitle: page.heroTitle,
        heroDescription: page.heroDescription,
        heroImageUrl: page.heroImageUrl,
        heroCtaLabel: page.heroCtaLabel,
        heroCtaHref: page.heroCtaHref,
        resultCount: page.resultCount,
      },
      create: {
        slug: page.slug,
        title: page.title,
        subtitle: page.subtitle,
        heroEyebrow: page.heroEyebrow,
        heroTitle: page.heroTitle,
        heroDescription: page.heroDescription,
        heroImageUrl: page.heroImageUrl,
        heroCtaLabel: page.heroCtaLabel,
        heroCtaHref: page.heroCtaHref,
        resultCount: page.resultCount,
      },
    });

    await prisma.shopPageFeature.deleteMany({
      where: { shopPageId: shopPage.id },
    });
    await prisma.shopPageProduct.deleteMany({
      where: { shopPageId: shopPage.id },
    });

    await prisma.shopPageFeature.createMany({
      data: page.features.map((feature) => ({
        ...feature,
        shopPageId: shopPage.id,
      })),
    });

    await prisma.shopPageProduct.createMany({
      data: page.products.map((product, index) => ({
        ...product,
        order: product.order ?? index + 1,
        shopPageId: shopPage.id,
      })),
    });
  }
}

async function main() {
  const defaultUsername = process.env.DEFAULT_ADMIN_USERNAME ?? "admin";
  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD ?? "admin12345";

  await prisma.adminUser.upsert({
    where: { username: defaultUsername },
    update: {
      passwordHash: hashPassword(defaultPassword),
      role: "ADMIN",
    },
    create: {
      username: defaultUsername,
      passwordHash: hashPassword(defaultPassword),
      role: "ADMIN",
    },
  });

  await prisma.curatedItem.deleteMany();
  await prisma.homepageSection.deleteMany();
  await prisma.slider.deleteMany();

  await prisma.homepageSection.createMany({
    data: homepageSections,
  });

  await prisma.curatedItem.createMany({
    data: homepageCards,
  });

  await prisma.slider.createMany({
    data: sliderData,
  });

  await seedShopPages();

  console.log(
    "Seeded admin account, homepage sections, hero slides, and shop pages.",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
