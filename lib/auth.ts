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

type AdminRole = "ADMIN";

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
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username?.trim() ?? "";
        const password = credentials?.password ?? "";

        if (!username || !password) {
          return null;
        }

        const admin = await prisma.adminUser.findUnique({
          where: { username },
        });

        if (!admin) {
          return null;
        }

        const isValid = verifyPassword(password, admin.passwordHash);

        if (!isValid || admin.role !== "ADMIN") {
          return null;
        }

        return {
          id: admin.id,
          name: admin.username,
          username: admin.username,
          role: "ADMIN" as AdminRole,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as AdminRole) ?? "ADMIN";
        session.user.username =
          typeof token.username === "string" ? token.username : "";
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
