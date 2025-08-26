import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nickname?: string | null;
      avatar?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    nickname?: string | null;
    avatar?: string | null;
  }
} 