export function validateInternalPath(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return true;
  }

  return value.startsWith("/")
    ? true
    : "Use a site-relative path that starts with '/'.";
}

export function validateImageSource(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return true;
  }

  const normalizedValue = value.trim();

  return normalizedValue.startsWith("/") ||
    /^https?:\/\//i.test(normalizedValue)
    ? true
    : "Use a site-relative path like '/images/example.jpg' or an absolute http(s) URL.";
}
