import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "./lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [Google],
  callbacks: {
    async signIn({ user, account }) {
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email as string },
      });
      if (!existingUser) {
        await prisma.user.create({
          data: {
            email: user.email as string,
            name: user.name as string,
            image: user.image as string,
            access_token: account?.access_token as string,
          },
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const userData = await prisma.user.findUnique({
          where: { email: user.email as string },
        });
        token.role = userData?.role;
        token.id = userData?.id;
        token.email = userData?.email;
        token.name = userData?.name.toLowerCase();
      }
      return token;
    },
    async session({ session, token }) {
      session.user.name = token.name;
      session.user.role = token.role as string | undefined;
      session.user.id = token.id as string;
      session.user.email = token.email as string;
      return session;
    },
  },
});
