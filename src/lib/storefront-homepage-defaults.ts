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
    title: "Certified Craft",
    description:
      "Every piece is presented with care, quality, and confidence.",
    icon: "shieldCheck",
  },
  {
    title: "Store Guidance",
    description:
      "Book a consultation and discover styles with personal assistance.",
    icon: "store",
  },
  {
    title: "Secure Delivery",
    description:
      "From packaging to doorstep, every order is handled with precision.",
    icon: "truck",
  },
];

export const defaultReassuranceHighlights: HomePageInfoCardContent[] = [
  {
    title: "Try at Home, Fast",
    description:
      "Priority samples delivered in 24-72 hours with easy returns.",
    icon: "truck",
  },
  {
    title: "Lifetime Care",
    description:
      "Complimentary cleaning, tightening, and resizing on every piece.",
    icon: "shieldCheck",
  },
  {
    title: "Certified Stones",
    description:
      "GIA / IGI grading and transparent gold purity on every order.",
    icon: "gem",
  },
  {
    title: "Concierge Updates",
    description:
      "Chat updates from purchase to delivery, including gift timing.",
    icon: "messageCircle",
  },
];

export const defaultConciergeEyebrow = "Concierge Services";
export const defaultConciergeTitle =
  "Personalized guidance for every jewellery moment";

export const defaultConciergeActions: HomePageActionCardContent[] = [
  {
    title: "Book a Styling Call",
    description:
      "Share your event, budget, and vibe; receive a tailored cart in 24 hours.",
    href: "/contact",
    icon: "phoneCall",
  },
  {
    title: "Visit the Studio",
    description:
      "See metal finishes and stones in person. Private appointments daily.",
    href: "/about",
    icon: "mapPin",
  },
  {
    title: "Gift Concierge",
    description:
      "Handwritten notes, discreet delivery windows, luxe wrapping, and tracking.",
    href: "/contact",
    icon: "sparkles",
  },
];

export const defaultStylingJournalEyebrow = "Styling Journal";
export const defaultStylingJournalTitle =
  "Layer with balance, shine with intention";

export const defaultStylingTips = [
  "Layer a slim herringbone with a sculpted pendant for contrast.",
  "Mix metals around one hero ring to add depth without bulk.",
  "Pair quiet diamond studs with a structured ear cuff for edge.",
];
