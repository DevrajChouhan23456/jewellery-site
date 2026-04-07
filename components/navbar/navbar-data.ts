import type { LucideIcon } from "lucide-react";
import {
  Circle,
  CircleDollarSign,
  Diamond,
  Ear,
  Gift,
  HeartHandshake,
  Layers,
  Menu,
  Sparkles,
  Sun,
} from "lucide-react";

export type Category = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type MegaMenuItem = {
  filters: string[];
  groups: string[][];
  promo: {
    title: string;
    subtitle: string;
    cta: string;
  };
  ribbon: string;
};

export const categories: Category[] = [
  { label: "All Jewellery", href: "/shop/jewellery", icon: Sparkles },
  { label: "Earrings", href: "/shop/earrings", icon: Ear },
  { label: "Rings", href: "/shop/rings", icon: Circle },
  { label: "Daily Wear", href: "/shop/glamdays", icon: Sun },
  { label: "Collections", href: "/shop/thejoydressing", icon: Layers },
  { label: "Wedding", href: "/shop/jewellery", icon: HeartHandshake },
  { label: "Gifting", href: "/shop/gifting", icon: Gift },
  { label: "More", href: "/shop/jewellery", icon: Menu },
];

export const megaMenuData: Record<string, MegaMenuItem> = {
  "All Jewellery": {
    filters: ["Category", "Price", "Occasion", "Gender", "Metal"],
    groups: [
      ["All Jewellery", "Earrings", "Pendants", "Finger Rings"],
      ["Mangalsutra", "Chains", "Nose Pin", "Necklaces"],
      ["Necklace Set", "Bangles", "Bracelets", "Pendants & Earring Set"],
    ],
    promo: {
      title: "Elan - My World. My Story.",
      subtitle: "Jewellery for every moment, crafted to shine.",
      cta: "Explore now",
    },
    ribbon: "Jewellery for Every Moment - See It All Here!",
  },
  Gold: {
    filters: ["Category", "Price", "Occasion", "Gold Coin", "Men", "Metal"],
    groups: [
      ["All Gold", "Gold Earrings", "Gold Rings", "Gold Nose Pins"],
      [
        "Gold Bangles",
        "Gold Chains",
        "Gold Engagement Rings",
        "Gold Kadas",
      ],
      [
        "Gold Bracelets",
        "Gold Pendants",
        "Gold Necklaces",
        "Gold Mangalsutras",
      ],
    ],
    promo: {
      title: "Intricately handcrafted",
      subtitle: "Heritage-inspired pieces for modern elegance.",
      cta: "Explore now",
    },
    ribbon: "From Classic to Contemporary",
  },
  Diamond: {
    filters: ["Category", "Price", "Occasion", "Gender", "Metal & Stones"],
    groups: [
      [
        "All Diamond",
        "Diamond Earrings",
        "Diamond Rings",
        "Diamond Nose Pins",
      ],
      [
        "Diamond Bracelets",
        "Diamond Chains",
        "Diamond Pendants",
        "Diamond Bangles",
      ],
      ["Diamond Necklaces", "Diamond Sets", "Solitaires", "Wedding Diamonds"],
    ],
    promo: {
      title: "Timeless brilliance",
      subtitle: "Signature diamond styles made to celebrate you.",
      cta: "Explore now",
    },
    ribbon: "Sparkle in every design",
  },
  Earrings: {
    filters: ["Category", "Price", "Occasion", "Gender", "Metal & Stones"],
    groups: [
      ["All Earrings", "Studs", "Hoops", "Drops"],
      ["Chandbalis", "Jhumkas", "Daily Wear", "Office Wear"],
      ["Party Edit", "Bridal Edit", "Solitaire Earrings", "Kids Earrings"],
    ],
    promo: {
      title: "Find your perfect pair",
      subtitle: "From subtle studs to statement silhouettes.",
      cta: "Shop now",
    },
    ribbon: "Ear candy for every style",
  },
  Rings: {
    filters: ["Category", "Price", "Occasion", "Gender", "Metal & Stones"],
    groups: [
      [
        "All Rings",
        "Casual Rings",
        "Couple Rings",
        "Diamond Engagement Rings",
      ],
      [
        "Engagement Rings",
        "Gold Engagement Rings",
        "Men's Rings",
        "Platinum Rings",
      ],
      ["Solitaire Rings", "Wedding Bands", "Stacking Rings", "Cocktail Rings"],
    ],
    promo: {
      title: "A symbol of commitment",
      subtitle: "Celebrate love and milestones with a ring that speaks.",
      cta: "Shop now",
    },
    ribbon: "Celebrate love & milestones",
  },
  "Daily Wear": {
    filters: ["Category", "Price", "Occasion", "Gender", "Metal"],
    groups: [
      ["All Daily Wear", "Pendants", "Rings", "Earrings"],
      ["Chains", "Bracelets", "Necklaces", "Office Wear"],
      ["Lightweight Gold", "Minimal Diamond", "Everyday Classics", "Gift Picks"],
    ],
    promo: {
      title: "Style, every day",
      subtitle: "Light, elegant and effortless pieces for daily looks.",
      cta: "Explore now",
    },
    ribbon: "Daily looks that always shine",
  },
  Collections: {
    filters: ["Category", "New Arrivals", "Price", "Occasion", "Theme"],
    groups: [
      ["All Collections", "Bridal Edit", "Festive Edit", "Office Edit"],
      [
        "Statement Collection",
        "Minimal Collection",
        "Temple Collection",
        "Classic Gold",
      ],
      ["Contemporary Diamond", "Limited Edition", "Seasonal Drops", "Best Sellers"],
    ],
    promo: {
      title: "Curated stories in gold",
      subtitle: "Exclusive edits inspired by moments and moods.",
      cta: "View all",
    },
    ribbon: "Curated collections for every story",
  },
  Wedding: {
    filters: ["Category", "Bridal Sets", "Price", "Occasion", "Metal"],
    groups: [
      ["All Wedding", "Bridal Necklaces", "Wedding Rings", "Wedding Earrings"],
      [
        "Mangalsutra",
        "Bridal Bangles",
        "Temple Jewellery",
        "Heirloom Edit",
      ],
      ["For Bride", "For Groom", "Family Gifting", "Ceremony Essentials"],
    ],
    promo: {
      title: "Made for your big day",
      subtitle: "Celebrate your journey with timeless wedding jewellery.",
      cta: "Explore now",
    },
    ribbon: "Bridal jewellery crafted with love",
  },
  Gifting: {
    filters: ["Category", "Price", "Recipient", "Occasion", "Metal"],
    groups: [
      ["All Gifting", "For Her", "For Him", "For Kids"],
      [
        "Birthday Gifts",
        "Anniversary Gifts",
        "Wedding Gifts",
        "Festive Gifts",
      ],
      ["Under 10k", "Under 25k", "Premium Gifts", "Gift Cards"],
    ],
    promo: {
      title: "Gift unforgettable sparkle",
      subtitle: "Thoughtful jewellery picks for every celebration.",
      cta: "Explore now",
    },
    ribbon: "Gift moments that last forever",
  },
  More: {
    filters: ["Highlights", "Shop by", "Help", "Services", "About"],
    groups: [
      ["New Arrivals", "Bestsellers", "Store Locator", "Book Appointment"],
      ["Try at Home", "Exchange Policy", "Track Order", "Customer Support"],
      ["About Us", "Care Guide", "FAQs", "Blogs"],
    ],
    promo: {
      title: "Discover more with us",
      subtitle: "Services and stories beyond shopping.",
      cta: "Know more",
    },
    ribbon: "Everything else you need",
  },
};

export const categoryHrefByLabel = Object.fromEntries(
  categories.map((item) => [item.label, item.href]),
) as Record<string, string>;
