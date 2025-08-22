import NextAuth, { DefaultSession } from "next-auth";
import { UserRole } from "@prisma/client";

// Module augmentation for next-auth to add our custom user fields
// Ensures session.user.id & session.user.role are typed across the app

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      // Optional profile-related extras (extend as needed)
      cvUrl?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
  }
}
