import {
  ADMIN_ACCESS_ROUTE_PREFIX,
  DEFAULT_ADMIN_DASHBOARD_PATH,
  buildLoginPath,
  sanitizeCallbackUrl,
} from "@/lib/auth-routes";

export function getAdminSecretAccessKey() {
  const value = process.env.ADMIN_SECRET_ACCESS_KEY?.trim();
  return value ? value : null;
}

export function isValidAdminSecret(secret: string) {
  const expected = getAdminSecretAccessKey();
  return Boolean(expected && secret === expected);
}

export function buildAdminAccessPath(
  callbackUrl = DEFAULT_ADMIN_DASHBOARD_PATH,
) {
  const safeCallbackUrl = sanitizeCallbackUrl(
    callbackUrl,
    DEFAULT_ADMIN_DASHBOARD_PATH,
  );
  const secret = getAdminSecretAccessKey();

  if (!secret) {
    return buildLoginPath({
      mode: "admin",
      callbackUrl: safeCallbackUrl,
    });
  }

  const params = new URLSearchParams({ callbackUrl: safeCallbackUrl });
  return `${ADMIN_ACCESS_ROUTE_PREFIX}/${encodeURIComponent(secret)}?${params.toString()}`;
}
