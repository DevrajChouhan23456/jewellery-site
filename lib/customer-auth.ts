import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { prisma } from "@/lib/prisma";

const customerProviders: NonNullable<NextAuthOptions["providers"]> = [
  CredentialsProvider({
    name: "OTP",
    credentials: {
      phone: { label: "Phone", type: "text" },
      otp: { label: "OTP", type: "text" },
    },
    async authorize(credentials) {
      if (!credentials?.phone || !credentials?.otp) {
        return null;
      }

      const phone = credentials.phone.trim();
      const otpInput = credentials.otp.trim();

      const record = await prisma.oTP.findFirst({
        where: { identifier: phone },
        orderBy: { createdAt: "desc" },
      });

      if (!record || record.expiresAt < new Date() || record.otp !== otpInput) {
        return null;
      }

      await prisma.oTP.delete({
        where: { id: record.id },
      });

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

export const customerAuthOptions: NextAuthOptions = {
  providers: customerProviders,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn({ user, account }) {
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
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.phone = user.phone ?? null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid ?? token.sub ?? "";
        session.user.phone = typeof token.phone === "string" ? token.phone : null;
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
