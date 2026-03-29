import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string;
      role: "ADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    username?: string;
    role: "ADMIN";
  }

  interface JWT {
    uid?: string;
    username?: string;
    role?: "ADMIN";
  }
}

interface DefaultSession {
  user?: {
    id: string;
    username?: string;
    role: "ADMIN";
  } & DefaultSession["user"];
}

