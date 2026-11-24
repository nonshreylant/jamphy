import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { isFreeProEmail } from "@/lib/razorpay";

export const dynamic = 'force-dynamic';

const isDevBypassEnabled =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_DEV_BYPASS_LOGIN === "true";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    ...(isDevBypassEnabled
      ? [
          CredentialsProvider({
            id: "dev-login",
            name: "Dev Testing Mode",
            credentials: {},
            async authorize() {
              const devUser = await prisma.user.upsert({
                where: { email: "dev.tester@jamphy.local" },
                update: {},
                create: {
                  email: "dev.tester@jamphy.local",
                  name: "Dev Tester",
                  username: "devtester",
                  college: "Test Institute",
                  year: "3rd Year",
                  course: "B.Sc Physics",
                  isPro: false,
                },
              });
              return devUser;
            },
          }),
        ]
      : []),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (user?.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { isBlocked: true }
          });
          if (dbUser?.isBlocked) {
            return false; // Prevent login
          }
        } catch (err) {
          console.error("Error checking block status on signIn", err);
        }
      }
      return true;
    },
    async jwt({ token, account, user, trigger, session }) {
      // Never store huge base64 data URLs inside the JWT cookie (session callback loads image from DB)
      if (typeof token.picture === "string" && token.picture.startsWith("data:")) {
        delete token.picture;
      }

      // Initial sign in
      if (account && user) {
        token.id = user.id;
        token.username = user.username;
        token.provider = account.provider;
        token.access_token = account.access_token;
        token.expires_at = account.expires_at;
        token.refresh_token = account.refresh_token;
        return token;
      }

      // Support manual updates from client useSession().update()
      if (trigger === "update" && session) {
        if (session.name !== undefined) token.name = session.name;
        if (session.username !== undefined) token.username = session.username;
        return token;
      }

      // Dev testing credentials session doesn't use Google OAuth token refresh
      if (token.provider === "dev-login" || !token.expires_at) {
        return token;
      }

      // Return previous token if the access token has not expired yet
      if (token.expires_at && Date.now() < token.expires_at * 1000) {
        const userId = token.id || token.sub;
        if (userId && !token.username) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: userId },
              select: { username: true },
            });
            if (dbUser?.username) {
              token.username = dbUser.username;
            }
          } catch (err) {
            console.error("Database fallback session check failed:", err);
          }
        }
        return token;
      }

      // Access token has expired, try to update it
      try {
        if (!token.refresh_token) {
          throw new Error("No refresh token available");
        }
        
        const response = await fetch("https://oauth2.googleapis.com/token", {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID || "",
            client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
            grant_type: "refresh_token",
            refresh_token: token.refresh_token,
          }),
          method: "POST",
        });

        const tokens = await response.json();

        if (!response.ok) throw tokens;

        token.access_token = tokens.access_token;
        token.expires_at = Math.floor(Date.now() / 1000 + tokens.expires_in);
        token.refresh_token = tokens.refresh_token ?? token.refresh_token; // Fall back to old refresh token
      } catch (error) {
        console.error("Error refreshing access token", error);
        token.error = "RefreshAccessTokenError";
      }

      const userId = token.id || token.sub;
      if (userId && !token.username) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { username: true },
          });
          if (dbUser?.username) {
            token.username = dbUser.username;
          }
        } catch (err) {
          console.error("Database fallback session check failed:", err);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub || token.id;
        session.error = token.error;
        session.user.name = token.name;
        session.user.image = token.picture;
        session.user.username = token.username;

        // Fetch latest user data from database so session is always up-to-date
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { name: true, image: true, username: true, email: true, isBlocked: true, isPro: true, proPurchasedAt: true }
          });
          
          if (dbUser) {
            session.user.name = dbUser.name;
            session.user.image = dbUser.image;
            session.user.username = dbUser.username;
            session.user.isPro = Boolean(dbUser.isPro) || isFreeProEmail(dbUser.email || session.user.email);
            session.user.proPurchasedAt = dbUser.proPurchasedAt;
            if (dbUser.isBlocked) {
              session.error = "UserBlocked";
            }
          }
        } catch (error) {
          console.error("Error fetching latest user session info:", error);
        }
      }
      return session;
    },
  },
  debug: true,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
