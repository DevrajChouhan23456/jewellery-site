export const BRAND_NAME = "Auraa Fashion Jewellery";
export const BRAND_SHORT_NAME = "AURAA";

const materialLabels: Record<string, string> = {
  diamond: "American Diamond",
  gold: "Gold-Tone",
  platinum: "Silver-Tone",
  silver: "Silver-Tone",
};

const productWordReplacements: Array<[RegExp, string]> = [
  [/\bDiamond\b/g, "American Diamond"],
  [/\bGold\b/g, "Gold-Tone"],
  [/\bPlatinum\b/g, "Silver-Tone"],
  [/\bSilver\b/g, "Silver-Tone"],
  [/\bSolitaire\b/g, "Statement Stone"],
  [/\bFine\b/g, "Fashion"],
];

function toTitleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function formatMaterialLabel(value: string | null | undefined) {
  if (!value) {
    return "Fashion Finish";
  }

  const normalizedValue = value.trim().toLowerCase();
  return materialLabels[normalizedValue] ?? toTitleCase(value);
}

export function formatProductName(name: string | null | undefined) {
  if (!name) {
    return "";
  }

  return productWordReplacements.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    name,
  );
}
