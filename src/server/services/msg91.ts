import { normalizePhoneNumber } from "@/lib/phone";

export const MSG91_NOT_CONFIGURED_ERROR = "MSG91 OTP service is not configured.";

type Msg91Result =
  | {
      success: true;
      normalizedTo: string;
      payload: unknown;
      requestId?: string;
    }
  | {
      success: false;
      error: string;
      normalizedTo?: string;
      payload?: unknown;
      requestId?: string;
    };

function getConfiguredValue(value: string | undefined) {
  return value?.trim() || null;
}

function toMsg91Mobile(phone: string) {
  return normalizePhoneNumber(phone).replace(/\D/g, "");
}

function getPayloadValue(payload: unknown, keys: string[]) {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  for (const key of keys) {
    const value = (payload as Record<string, unknown>)[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function toLowerCase(value: string | undefined) {
  return value?.trim().toLowerCase() || "";
}

function getErrorMessage(payload: unknown, fallback: string) {
  return (
    getPayloadValue(payload, ["message", "Message", "Details", "details", "error"]) ||
    fallback
  );
}

function getRequestId(payload: unknown) {
  return getPayloadValue(payload, [
    "request_id",
    "requestId",
    "requestIdValue",
    "requestid",
  ]);
}

export async function sendMsg91Otp(phone: string): Promise<Msg91Result> {
  const authKey = getConfiguredValue(process.env.MSG91_AUTH_KEY);
  const templateId = getConfiguredValue(process.env.MSG91_OTP_TEMPLATE_ID);
  const normalizedTo = toMsg91Mobile(phone);

  if (!normalizedTo) {
    return {
      success: false,
      error: "Recipient phone number is missing or invalid.",
    };
  }

  if (!authKey || !templateId) {
    return {
      success: false,
      error: MSG91_NOT_CONFIGURED_ERROR,
      normalizedTo,
    };
  }

  const url = new URL("https://control.msg91.com/api/v5/otp");
  url.searchParams.set("template_id", templateId);
  url.searchParams.set("mobile", normalizedTo);
  url.searchParams.set("authkey", authKey);

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => null)) as unknown;

    if (!response.ok) {
      return {
        success: false,
        error: getErrorMessage(payload, "MSG91 could not send the OTP."),
        normalizedTo,
        payload,
        requestId: getRequestId(payload),
      };
    }

    const type = toLowerCase(getPayloadValue(payload, ["type", "Type"]));
    if (type !== "success") {
      return {
        success: false,
        error: getErrorMessage(payload, "MSG91 could not send the OTP."),
        normalizedTo,
        payload,
        requestId: getRequestId(payload),
      };
    }

    return {
      success: true,
      normalizedTo,
      payload,
      requestId: getRequestId(payload),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "MSG91 request failed.",
      normalizedTo,
    };
  }
}

export async function verifyMsg91Otp(
  phone: string,
  otp: string,
): Promise<Msg91Result> {
  const authKey = getConfiguredValue(process.env.MSG91_AUTH_KEY);
  const normalizedTo = toMsg91Mobile(phone);

  if (!normalizedTo) {
    return {
      success: false,
      error: "Recipient phone number is missing or invalid.",
    };
  }

  if (!authKey) {
    return {
      success: false,
      error: MSG91_NOT_CONFIGURED_ERROR,
      normalizedTo,
    };
  }

  const url = new URL("https://control.msg91.com/api/v5/otp/verify");
  url.searchParams.set("mobile", normalizedTo);
  url.searchParams.set("otp", otp.trim());

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { authkey: authKey },
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => null)) as unknown;

    if (!response.ok) {
      return {
        success: false,
        error: getErrorMessage(payload, "MSG91 could not verify the OTP."),
        normalizedTo,
        payload,
        requestId: getRequestId(payload),
      };
    }

    const message = toLowerCase(getPayloadValue(payload, ["message", "Message"]));
    const type = toLowerCase(getPayloadValue(payload, ["type", "Type"]));
    const verified =
      message === "otp verified success" ||
      message === "number_verified_successfully" ||
      (type === "success" && message.includes("verified"));

    if (!verified) {
      return {
        success: false,
        error: getErrorMessage(payload, "Invalid or expired OTP."),
        normalizedTo,
        payload,
        requestId: getRequestId(payload),
      };
    }

    return {
      success: true,
      normalizedTo,
      payload,
      requestId: getRequestId(payload),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "MSG91 request failed.",
      normalizedTo,
    };
  }
}
