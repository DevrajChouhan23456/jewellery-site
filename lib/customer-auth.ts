import type { NextAuthOptions, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

import { DEFAULT_LOGIN_PATH, normalizeRole } from "@/lib/auth-routes";
import { prisma } from "@/lib/prisma";

function sanitizeCustomerPhone(phone: string | null | undefined) {
  if (typeof phone !== "string") {
    return null;
  }

  return phone.startsWith("google-") ? null : phone;
}

export const customerProviders: NonNullable<NextAuthOptions["providers"]> = [
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

  let dbUser = await prisma.user.upsert({
    where: { email: user.email },
    update: {
      name: user.name ?? undefined,
    },
    create: {
      email: user.email,
      name: user.name ?? undefined,
    },
  });

  const sanitizedPhone = sanitizeCustomerPhone(dbUser.phone);

  if (dbUser.phone !== sanitizedPhone) {
    dbUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        phone: sanitizedPhone,
      },
    });
  }

  user.id = dbUser.id;
  user.phone = sanitizedPhone ?? undefined;
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
    token.phone = sanitizeCustomerPhone(user.phone);
  }

  token.role = normalizeRole(user?.role ?? token.role);
  return token;
}

export function applyCustomerSession(session: Session, token: JWT) {
  if (session.user) {
    session.user.id = token.uid ?? token.sub ?? "";
    session.user.phone =
      typeof token.phone === "string" ? sanitizeCustomerPhone(token.phone) : null;
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
