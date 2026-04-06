import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import {
  decryptTotpSecret,
  verifyTotpCode,
} from "@/lib/admin-two-factor";
import { DEFAULT_LOGIN_PATH, normalizeRole } from "@/lib/auth-routes";
import {
  applyCustomerJwt,
  applyCustomerSession,
  customerProviders,
  handleCustomerSignIn,
} from "@/lib/customer-auth";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: DEFAULT_LOGIN_PATH,
  },
  providers: [
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "Authenticator code", type: "text" },
      },
      async authorize(credentials) {
        const username = credentials?.username?.trim();
        const password = credentials?.password ?? "";
        const twoFactorCode = credentials?.twoFactorCode?.trim() ?? "";

        if (!username || !password) {
          return null;
        }

        try {
          const admin = await prisma.adminUser.findUnique({
            where: { username },
          });

          if (!admin) {
            return null;
          }

          const passwordValid = verifyPassword(password, admin.passwordHash);

          if (!passwordValid) {
            return null;
          }

          if (admin.twoFactorEnabled && admin.twoFactorSecret) {
            if (!twoFactorCode) {
              throw new Error("TWO_FACTOR_REQUIRED");
            }

            let secret: string;

            try {
              secret = decryptTotpSecret(admin.twoFactorSecret);
            } catch (error) {
              console.error("[AUTH] Invalid admin 2FA secret:", error);
              throw new Error("TWO_FACTOR_CONFIGURATION_ERROR");
            }

            if (!verifyTotpCode(secret, twoFactorCode)) {
              throw new Error("INVALID_TWO_FACTOR_CODE");
            }
          }

          const user = {
            id: admin.id,
            name: admin.username,
            username: admin.username,
            role: "ADMIN" as const,
          };

          if (process.env.NODE_ENV === 'development') {
            console.log('[AUTH] Login successful');
          }

          return user;
        } catch (error) {
          if (
            error instanceof Error &&
            [
              "TWO_FACTOR_REQUIRED",
              "INVALID_TWO_FACTOR_CODE",
              "TWO_FACTOR_CONFIGURATION_ERROR",
            ].includes(error.message)
          ) {
            throw error;
          }

          console.error('[AUTH] Error in authorize:', error);
          return null;
        }
      },
    }),
    ...customerProviders,
  ],
  callbacks: {
    signIn: handleCustomerSignIn,
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = normalizeRole(user.role);
        token.phone = user.phone ?? null;

        if (typeof user.username === "string" && user.username.length > 0) {
          token.username = user.username;
        } else {
          delete token.username;
        }
      }

      return applyCustomerJwt(token, user);
    },
    async session({ session, token }) {
      const nextSession = applyCustomerSession(session, token);

      if (nextSession.user) {
        nextSession.user.username =
          nextSession.user.role === "ADMIN" &&
          typeof token.username === "string"
            ? token.username
            : undefined;
      }

      return nextSession;
    },
  },
};

export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authOptions);
}
