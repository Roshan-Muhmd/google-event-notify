import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
         prompt: "consent", // force re-consent to ensure token comes back
          access_type: "offline", // ensures refresh_token is returned,
            response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      // First time user signs in
      console.log("JWT callback:", token, account)
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at * 1000 // convert to ms
      }
      return token
    },
    async session({ session, token }) {
      // Attach accessToken to the session
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      session.expiresAt = token.expiresAt
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
