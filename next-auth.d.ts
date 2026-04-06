import type { DefaultSession } from "next-auth";

import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string;
      role: "ADMIN" | "USER";
      phone?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    username?: string;
    role?: "ADMIN" | "USER";
    phone?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    username?: string;
    role?: "ADMIN" | "USER";
    phone?: string | null;
  }
}
