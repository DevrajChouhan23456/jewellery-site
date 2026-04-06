import crypto from "node:crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const TOTP_DIGITS = 6;
const TOTP_PERIOD_SECONDS = 30;
const DEFAULT_TOTP_WINDOW = 1;
const SECRET_BYTE_LENGTH = 20;

function getTwoFactorEncryptionKey() {
  const source =
    process.env.ADMIN_2FA_ENCRYPTION_KEY?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim();

  if (!source) {
    throw new Error("Missing NEXTAUTH_SECRET for admin 2FA encryption.");
  }

  return crypto.createHash("sha256").update(source).digest();
}

function base32Encode(buffer: Buffer) {
  let bits = "";
  let output = "";

  for (const byte of buffer) {
    bits += byte.toString(2).padStart(8, "0");
  }

  for (let index = 0; index < bits.length; index += 5) {
    const chunk = bits.slice(index, index + 5).padEnd(5, "0");
    output += BASE32_ALPHABET[Number.parseInt(chunk, 2)];
  }

  return output;
}

function base32Decode(secret: string) {
  const normalized = normalizeTotpSecret(secret);
  let bits = "";

  for (const char of normalized) {
    const index = BASE32_ALPHABET.indexOf(char);

    if (index === -1) {
      throw new Error("Invalid TOTP secret.");
    }

    bits += index.toString(2).padStart(5, "0");
  }

  const bytes: number[] = [];

  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
  }

  return Buffer.from(bytes);
}

function normalizeTotpSecret(secret: string) {
  return secret.toUpperCase().replace(/[^A-Z2-7]/g, "");
}

function getCounterBuffer(counter: number) {
  const buffer = Buffer.alloc(8);
  const high = Math.floor(counter / 0x100000000);
  const low = counter % 0x100000000;

  buffer.writeUInt32BE(high, 0);
  buffer.writeUInt32BE(low, 4);

  return buffer;
}

function generateHotp(secret: string, counter: number) {
  const secretBuffer = base32Decode(secret);
  const hmac = crypto
    .createHmac("sha1", secretBuffer)
    .update(getCounterBuffer(counter))
    .digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binaryCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(binaryCode % 10 ** TOTP_DIGITS).padStart(TOTP_DIGITS, "0");
}

export function generateTotpSecret() {
  return base32Encode(crypto.randomBytes(SECRET_BYTE_LENGTH));
}

export function formatTotpSecret(secret: string) {
  return normalizeTotpSecret(secret).replace(/(.{4})/g, "$1 ").trim();
}

export function encryptTotpSecret(secret: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    getTwoFactorEncryptionKey(),
    iv,
  );
  const encrypted = Buffer.concat([
    cipher.update(normalizeTotpSecret(secret), "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptTotpSecret(payload: string) {
  const [ivHex, authTagHex, encryptedHex] = payload.split(":");

  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error("Invalid encrypted TOTP payload.");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getTwoFactorEncryptionKey(),
    Buffer.from(ivHex, "hex"),
  );

  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]);

  return normalizeTotpSecret(decrypted.toString("utf8"));
}

export function verifyTotpCode(
  secret: string,
  code: string,
  window = DEFAULT_TOTP_WINDOW,
) {
  const normalizedCode = code.replace(/\s+/g, "");

  if (!/^\d{6}$/.test(normalizedCode)) {
    return false;
  }

  const counter = Math.floor(Date.now() / 1000 / TOTP_PERIOD_SECONDS);

  for (let offset = -window; offset <= window; offset += 1) {
    if (generateHotp(secret, counter + offset) === normalizedCode) {
      return true;
    }
  }

  return false;
}

export function getTotpIssuer() {
  return process.env.ADMIN_2FA_ISSUER?.trim() || "Jewellery Admin";
}

export function buildTotpSetupUri(accountName: string, secret: string) {
  const issuer = getTotpIssuer();
  const label = encodeURIComponent(`${issuer}:${accountName}`);
  const params = new URLSearchParams({
    secret: normalizeTotpSecret(secret),
    issuer,
    algorithm: "SHA1",
    digits: String(TOTP_DIGITS),
    period: String(TOTP_PERIOD_SECONDS),
  });

  return `otpauth://totp/${label}?${params.toString()}`;
}
