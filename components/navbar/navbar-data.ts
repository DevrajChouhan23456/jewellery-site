import type { LucideIcon } from "lucide-react";
import {
  Circle,
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
  { label: "Occasion Wear", href: "/shop/jewellery", icon: HeartHandshake },
  { label: "Gifting", href: "/shop/gifting", icon: Gift },
  { label: "More", href: "/shop/jewellery", icon: Menu },
];

export const megaMenuData: Record<string, MegaMenuItem> = {
  "All Jewellery": {
    filters: ["Category", "Price", "Occasion", "Style", "Finish"],
    groups: [
      ["All Jewellery", "Earrings", "Rings", "Pendants"],
      ["Necklace Sets", "Bangles", "Bracelets", "Maang Tikka"],
      ["Hair Accessories", "Anklets", "Statement Sets", "Gift Picks"],
    ],
    promo: {
      title: "Auraa edits for every outfit",
      subtitle:
        "Artificial jewellery styles for brunch looks, gifting, and big celebrations.",
      cta: "Explore now",
    },
    ribbon: "Everyday glam to occasion sparkle, all in one place",
  },
  Earrings: {
    filters: ["Category", "Price", "Occasion", "Finish", "Mood"],
    groups: [
      ["All Earrings", "Studs", "Hoops", "Drops"],
      ["Chandbalis", "Jhumkas", "Daily Wear", "Office Wear"],
      ["Party Edit", "Bridal Glam", "Ear Cuffs", "Kids Earrings"],
    ],
    promo: {
      title: "Find your perfect pair",
      subtitle: "From lightweight studs to festive jhumkas and bold party drops.",
      cta: "Shop now",
    },
    ribbon: "Ear candy for every mood",
  },
  Rings: {
    filters: ["Category", "Price", "Occasion", "Finish", "Style"],
    groups: [
      ["All Rings", "Adjustable Rings", "Stack Rings", "Cocktail Rings"],
      ["Floral Rings", "Pearl Rings", "Couple Rings", "Gift Rings"],
      ["Stone Rings", "Minimal Rings", "Party Rings", "Daily Rings"],
    ],
    promo: {
      title: "Stack, style, repeat",
      subtitle:
        "Adjustable rings and statement styles made for gifting and easy styling.",
      cta: "Shop now",
    },
    ribbon: "Rings for gifting, layering, and instant glam",
  },
  "Daily Wear": {
    filters: ["Category", "Price", "Occasion", "Finish", "Weight"],
    groups: [
      ["All Daily Wear", "Pendants", "Rings", "Earrings"],
      ["Chains", "Bracelets", "Necklaces", "Office Wear"],
      ["Minimal Sets", "Gold-Tone Basics", "American Diamond Touch", "Gift Picks"],
    ],
    promo: {
      title: "Style, every day",
      subtitle:
        "Lightweight artificial jewellery made for office, errands, and dinner plans.",
      cta: "Explore now",
    },
    ribbon: "Easy looks that still bring the sparkle",
  },
  Collections: {
    filters: ["Category", "New Arrivals", "Price", "Occasion", "Theme"],
    groups: [
      ["All Collections", "Bridal Edit", "Festive Edit", "Office Edit"],
      ["Statement Collection", "Minimal Collection", "Kundan Edit", "Oxidised Edit"],
      ["American Diamond Edit", "Limited Drops", "Seasonal Picks", "Best Sellers"],
    ],
    promo: {
      title: "Curated style stories",
      subtitle:
        "Statement edits inspired by weddings, gifting, and everyday dressing.",
      cta: "View all",
    },
    ribbon: "Collections built around moods, moments, and outfit plans",
  },
  "Occasion Wear": {
    filters: ["Category", "Bridal Sets", "Price", "Occasion", "Finish"],
    groups: [
      ["All Occasion Wear", "Bridal Sets", "Wedding Guest", "Reception Looks"],
      ["Mehendi Picks", "Sangeet Styles", "Layered Chokers", "Bridal Bangles"],
      ["Maang Tikka", "Passa Styles", "Photo-ready Sets", "Ceremony Essentials"],
    ],
    promo: {
      title: "Made for your big day",
      subtitle:
        "Show-stopping artificial jewellery for brides, bridesmaids, and wedding guests.",
      cta: "Explore now",
    },
    ribbon: "Big celebration sparkle without the real-gold price tag",
  },
  Gifting: {
    filters: ["Category", "Price", "Recipient", "Occasion", "Style"],
    groups: [
      ["All Gifting", "For Her", "For Him", "For Kids"],
      ["Birthday Gifts", "Return Gifts", "Wedding Favours", "Festive Gifts"],
      ["Under 999", "Under 1999", "Statement Gifts", "Gift Sets"],
    ],
    promo: {
      title: "Gift unforgettable sparkle",
      subtitle:
        "Thoughtful artificial jewellery picks for birthdays, festive gifting, and bridesmaid boxes.",
      cta: "Explore now",
    },
    ribbon: "Budget-friendly gifting that still feels special",
  },
  More: {
    filters: ["Highlights", "Shop by", "Help", "Services", "About"],
    groups: [
      ["New Arrivals", "Bestsellers", "Styling Help", "Gift Guide"],
      ["Care Tips", "Return Help", "Track Order", "Customer Support"],
      ["About Us", "Lookbook", "FAQs", "Contact Us"],
    ],
    promo: {
      title: "Discover more with us",
      subtitle: "Styling help, care tips, and support beyond the catalogue.",
      cta: "Know more",
    },
    ribbon: "Everything else you need, from care to gifting help",
  },
};

export const categoryHrefByLabel = Object.fromEntries(
  categories.map((item) => [item.label, item.href]),
) as Record<string, string>;
