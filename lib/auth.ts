import NextAuth, { type AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
      },
      async authorize(credentials) {
        const adminEmails =
          process.env.ADMIN_EMAILS?.split(",").map(e => e.trim()) ?? []

        if (credentials?.email && adminEmails.includes(credentials.email)) {
          return {
            id: credentials.email,
            email: credentials.email,
            isAdmin: true,
          }
        }

        return null
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = (user as any).isAdmin ?? false
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).isAdmin = token.isAdmin ?? false
      }
      return session
    },
  },
}
