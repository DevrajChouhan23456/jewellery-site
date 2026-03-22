import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "ADMIN";
      username: string;
    };
  }

  interface User {
    id: string;
    role: "ADMIN";
    username: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN";
    username?: string;
  }
}
