import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions, Session } from "next-auth";
import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
// import type { GenericObject, SessionBase } from "next-auth/utils/logger";

const scopes = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: scopes.join(" "),
        },
      },
    }),
  ],
  debug: process.env.NODE_ENV === "development",

  callbacks: {
    async jwt({ token, user, account, isNewUser, profile }): Promise<JWT> {
      if (account) {
        token.accessToken = account?.accessToken;
        token.refreshToken = account?.refreshToken;
      }

      console.log(token, account);

      return token;
    },
    async session({ session, user }): Promise<Session> {
      console.log(session);
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};

export default NextAuth(authOptions);
