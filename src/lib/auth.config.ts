import TwitchProvider from 'next-auth/providers/twitch'
import type { NextAuthConfig } from 'next-auth'

/**
 * NextAuth configuration without database dependencies.
 * Used in Edge Runtime (middleware) where Prisma is not available.
 */
export const authConfig: NextAuthConfig = {
  providers: [
    TwitchProvider({
      clientId: process.env.TWITCH_CLIENT_ID!,
      clientSecret: process.env.TWITCH_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid user:read:email channel:read:subscriptions channel:read:redemptions channel:manage:redemptions',
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          twitchId: profile.sub,
          name: profile.preferred_username,
          email: profile.email,
          image: profile.picture,
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnLogin = nextUrl.pathname === '/login'

      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect to login
      } else if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }
      return true
    },
  },
}

