import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string;
      role?: "ADMIN";
      phone?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    username?: string;
    role?: "ADMIN";
    phone?: string;
  }

  interface JWT {
    uid?: string;
    username?: string;
    role?: "ADMIN";
    phone?: string | null;
  }
}

