export type AppRole = "ADMIN" | "USER";

export const DEFAULT_LOGIN_PATH = "/login";
export const DEFAULT_CUSTOMER_HOME_PATH = "/account";
export const DEFAULT_ADMIN_DASHBOARD_PATH = "/admin/dashboard";
export const ADMIN_ACCESS_ROUTE_PREFIX = "/access";

export function normalizeRole(role: unknown): AppRole {
  return role === "ADMIN" ? "ADMIN" : "USER";
}

export function sanitizeCallbackUrl(
  value: string | null | undefined,
  fallback = "/",
) {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();

  if (!trimmed || !trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed, "http://localhost");
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

type BuildLoginPathOptions = {
  mode?: "user" | "admin";
  callbackUrl?: string | null;
};

export function buildLoginPath({
  mode = "user",
  callbackUrl,
}: BuildLoginPathOptions = {}) {
  const params = new URLSearchParams();

  if (mode === "admin") {
    params.set("mode", "admin");
  }

  if (callbackUrl) {
    params.set(
      "callbackUrl",
      sanitizeCallbackUrl(
        callbackUrl,
        mode === "admin"
          ? DEFAULT_ADMIN_DASHBOARD_PATH
          : DEFAULT_CUSTOMER_HOME_PATH,
      ),
    );
  }

  const search = params.toString();
  return search ? `${DEFAULT_LOGIN_PATH}?${search}` : DEFAULT_LOGIN_PATH;
}
