import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[AUTH] Credentials received:', { username: credentials?.username });
        }

        const username = credentials?.username?.trim();
        const password = credentials?.password ?? "";

        if (!username || !password) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[AUTH] Missing credentials');
          }
          return null;
        }

        try {
          const admin = await prisma.adminUser.findUnique({
            where: { username },
          });

          if (process.env.NODE_ENV === 'development') {
            console.log('[AUTH] Admin found:', !!admin, admin?.username);
          }

          if (!admin) {
            return null;
          }

          const passwordValid = verifyPassword(password, admin.passwordHash);
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[AUTH] Password valid:', passwordValid);
          }

          if (!passwordValid) {
            return null;
          }

          const user = {
            id: admin.id,
            name: admin.username,
            username: admin.username,
            role: "ADMIN" as const,
          };

          if (process.env.NODE_ENV === 'development') {
            console.log('[AUTH] Login successful:', user.username);
          }

          return user;
        } catch (error) {
          console.error('[AUTH] Error in authorize:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = user.role;
        token.username = user.username;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid ?? token.sub ?? "";
        session.user.role = token.role;
        session.user.username =
          typeof token.username === "string" ? token.username : undefined;
      }

      return session;
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
