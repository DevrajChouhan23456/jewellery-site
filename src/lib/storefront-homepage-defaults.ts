export const homePageIconKeys = [
  "shieldCheck",
  "store",
  "truck",
  "gem",
  "messageCircle",
  "phoneCall",
  "mapPin",
  "sparkles",
] as const;

export type HomePageIconKey = (typeof homePageIconKeys)[number];

export type HomePageInfoCardContent = {
  title: string;
  description: string;
  icon: HomePageIconKey;
};

export type HomePageActionCardContent = {
  title: string;
  description: string;
  href: string;
  icon: HomePageIconKey;
};

export const homePageIconOptions: Array<{
  title: string;
  value: HomePageIconKey;
}> = [
  { title: "Shield Check", value: "shieldCheck" },
  { title: "Store", value: "store" },
  { title: "Truck", value: "truck" },
  { title: "Gem", value: "gem" },
  { title: "Message Circle", value: "messageCircle" },
  { title: "Phone Call", value: "phoneCall" },
  { title: "Map Pin", value: "mapPin" },
  { title: "Sparkles", value: "sparkles" },
];

export function isHomePageIconKey(value: unknown): value is HomePageIconKey {
  return (
    typeof value === "string" &&
    homePageIconKeys.includes(value as HomePageIconKey)
  );
}

export function normalizeHomePageIcon(
  value: unknown,
  fallback: HomePageIconKey,
) {
  return isHomePageIconKey(value) ? value : fallback;
}

export const defaultServicePillars: HomePageInfoCardContent[] = [
  {
    title: "Quality-Checked Finish",
    description:
      "Every piece is selected for style, finish, and easy repeat wear.",
    icon: "shieldCheck",
  },
  {
    title: "Styling Guidance",
    description:
      "Share your event, budget, and outfit mood to get help choosing the right look.",
    icon: "store",
  },
  {
    title: "Careful Delivery",
    description:
      "From packing to doorstep, every order is handled with gifting and occasion wear in mind.",
    icon: "truck",
  },
];

export const defaultReassuranceHighlights: HomePageInfoCardContent[] = [
  {
    title: "Fresh Drops, Fast",
    description:
      "New styles land regularly so you can shop the latest party and festive looks.",
    icon: "truck",
  },
  {
    title: "Care Tips Included",
    description:
      "Simple storage and after-wear care guidance helps your favourite pieces stay looking better for longer.",
    icon: "shieldCheck",
  },
  {
    title: "Statement Finishes",
    description:
      "Browse American Diamond sparkle, gold-tone layers, pearls, and festive statement styles in one place.",
    icon: "gem",
  },
  {
    title: "Quick Support",
    description:
      "Chat updates for orders, gifting requests, and styling help when you need a second opinion.",
    icon: "messageCircle",
  },
];

export const defaultConciergeEyebrow = "Styling Support";
export const defaultConciergeTitle =
  "Personalized guidance for gifting, festive looks, and occasion wear";

export const defaultConciergeActions: HomePageActionCardContent[] = [
  {
    title: "Book a Styling Call",
    description:
      "Share your event, outfit vibe, and budget to get a curated shortlist from our team.",
    href: "/contact",
    icon: "phoneCall",
  },
  {
    title: "Explore The Brand",
    description:
      "See how we think about party-wear sparkle, gifting, and artificial jewellery styling.",
    href: "/about",
    icon: "mapPin",
  },
  {
    title: "Gift Concierge",
    description:
      "Build bridesmaid boxes, festive gifts, or return-gift bundles with a little extra help.",
    href: "/contact",
    icon: "sparkles",
  },
];

export const defaultStylingJournalEyebrow = "Styling Journal";
export const defaultStylingJournalTitle =
  "Style with confidence, sparkle with ease";

export const defaultStylingTips = [
  "Pair one statement necklace with lighter earrings to keep festive looks balanced.",
  "Mix gold-tone layers with pearls or American Diamond accents for more depth.",
  "Use one bold accessory with a simple outfit when you want the jewellery to lead.",
];
