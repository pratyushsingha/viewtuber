import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    userId?: string;
    role?: string;
  }
  interface Session {
    user: {
      id?: string;
      email?: string;
      role?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}
