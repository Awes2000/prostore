import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";
import type { NextAuthConfig } from "next-auth";

const config = {
  // Define custom authentication pages
  pages: {
    signIn: "/sign-in",
    error: "/sign-in", // Redirect errors back to sign-in
  },

  // Configure session strategy
  session: {
    strategy: "jwt", // Use JSON Web Tokens
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Connect to Prisma database
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,

  // Authentication providers
  providers: [
    CredentialsProvider({
      // Define login form fields
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },

      // Authorization logic
      async authorize(credentials) {
        // Return null if no credentials provided
        if (!credentials) return null;

        // Find user in database by email
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });

        // Verify user exists and has password
        if (user && user.password) {
          // Compare submitted password with hashed password in database
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          );

          // If password matches, return user data
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }

        // Authentication failed - return null
        return null;
      },
    }),
  ],

  // Callback functions that run at specific times
  callbacks: {
    // Runs when JWT is created or updated
    async jwt({ token, user, trigger, session }) {
      // On sign in, add user data to token
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }

      // Handle session updates (like profile changes)
      if (trigger === "update" && session) {
        token.name = session.user.name;
      }

      return token;
    },

    // Runs when session is accessed
    async session({ session, token, user, trigger }) {
      // Add user ID and role from token to session
      session.user.id = token.sub as string;
      session.user.role = token.role as string;

      // Handle profile updates (for when user updates their name)
      if (trigger === "update") {
        session.user.name = user.name;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

// Export authentication functions
export const { handlers, auth, signIn, signOut } = NextAuth(config);
