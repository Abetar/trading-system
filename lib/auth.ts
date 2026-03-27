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
        const allowedEmail = process.env.ADMIN_EMAIL

        if (credentials?.email === allowedEmail) {
          return { id: "1", email: allowedEmail }
        }

        return null
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt", // 👈 ahora TS lo acepta
  },
}