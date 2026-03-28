import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      phone?: string | null;
      role?: "ADMIN";
      username?: string;
    };
  }

  interface User {
    id: string;
    phone?: string | null;
    role?: "ADMIN";
    username?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    phone?: string | null;
    role?: "ADMIN";
    username?: string;
  }
}
