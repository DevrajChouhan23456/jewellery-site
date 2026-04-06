const DEFAULT_COUNTRY_CODE = "+91";

export function normalizePhoneNumber(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    return "";
  }

  const sanitized = trimmed.replace(/[^\d+]/g, "");

  if (sanitized.startsWith("+")) {
    const digits = sanitized.slice(1).replace(/\D/g, "");
    return digits ? `+${digits}` : "";
  }

  const digits = sanitized.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  // Default bare 10-digit inputs to India, which matches the current storefront setup.
  if (digits.length === 10) {
    return `${DEFAULT_COUNTRY_CODE}${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return `${DEFAULT_COUNTRY_CODE}${digits.slice(1)}`;
  }

  return `+${digits}`;
}

export function isValidE164PhoneNumber(phone: string) {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

export function isTwilioWhatsAppSandboxNumber(phone: string) {
  return normalizePhoneNumber(phone) === "+14155238886";
}
