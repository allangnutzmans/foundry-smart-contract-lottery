import 'next-auth';
import type { DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      nickname?: string | null;
      avatar?: string | null;
    } & DefaultUser;
  }

  interface User {
    nickname?: string | null;
    avatar?: string | null;
  }
}
