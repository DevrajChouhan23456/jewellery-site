import type { NextAuthOptions, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import crypto from "crypto";

import { DEFAULT_LOGIN_PATH, normalizeRole } from "@/lib/auth-routes";
import { normalizePhoneNumber } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export const customerProviders: NonNullable<NextAuthOptions["providers"]> = [
  CredentialsProvider({
    id: "otp",
    name: "OTP",
    credentials: {
      phone: { label: "Phone", type: "text" },
      otp: { label: "OTP", type: "text" },
    },
    async authorize(credentials) {
      if (!credentials?.phone || !credentials?.otp) {
        return null;
      }

      const phone = normalizePhoneNumber(credentials.phone);
      const otpInput = credentials.otp.trim();
      const hashedOtp = crypto.createHash("sha256").update(otpInput).digest("hex");
      const storedHashedOtp = await redis.get<string>(`otp:${phone}`);

      if (!storedHashedOtp || storedHashedOtp !== hashedOtp) {
        return null;
      }

      await redis.del(`otp:${phone}`);

      const user = await prisma.user.upsert({
        where: { phone },
        update: {},
        create: { phone },
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? undefined,
        role: "USER" as const,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  customerProviders.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export async function handleCustomerSignIn({
  user,
  account,
}: {
  user: {
    id?: string;
    email?: string | null;
    name?: string | null;
    phone?: string | null;
    role?: "ADMIN" | "USER";
  };
  account?: {
    provider?: string;
  } | null;
}) {
  if (account?.provider !== "google" || !user.email) {
    return true;
  }

  const dbUser = await prisma.user.upsert({
    where: { email: user.email },
    update: {
      name: user.name ?? undefined,
    },
    create: {
      email: user.email,
      name: user.name ?? undefined,
      phone: `google-${user.email}`,
    },
  });

  user.id = dbUser.id;
  user.phone = dbUser.phone ?? undefined;
  user.role = "USER";
  return true;
}

export function applyCustomerJwt(
  token: JWT,
  user?: {
    id?: string;
    phone?: string | null;
    role?: "ADMIN" | "USER" | null;
  } | null,
) {
  if (typeof user?.id === "string") {
    token.uid = user.id;
  }

  if (user) {
    token.phone = user.phone ?? null;
  }

  token.role = normalizeRole(user?.role ?? token.role);
  return token;
}

export function applyCustomerSession(session: Session, token: JWT) {
  if (session.user) {
    session.user.id = token.uid ?? token.sub ?? "";
    session.user.phone = typeof token.phone === "string" ? token.phone : null;
    session.user.role = normalizeRole(token.role);
  }

  return session;
}

export const customerAuthOptions: NextAuthOptions = {
  providers: customerProviders,
  session: { strategy: "jwt" },
  pages: {
    signIn: DEFAULT_LOGIN_PATH,
  },
  callbacks: {
    async signIn(args) {
      return handleCustomerSignIn(args);
    },
    async jwt({ token, user }) {
      return applyCustomerJwt(token, user);
    },
    async session({ session, token }) {
      return applyCustomerSession(session, token);
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
