import NextAuth from 'next-auth'
import { prisma } from './prisma'
import { authConfig } from './auth.config'

/**
 * Full NextAuth configuration with database callbacks.
 * Only use in Node.js runtime (API routes, Server Components).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider === 'twitch' && profile) {
        try {
          const twitchProfile = profile as any
          
          // Check if user exists by Twitch ID
          let existingUser = await prisma.user.findUnique({
            where: { twitchId: twitchProfile.sub },
          })

          if (!existingUser) {
            // Create new user with Twitch data
            existingUser = await prisma.user.create({
              data: {
                twitchId: twitchProfile.sub,
                username: twitchProfile.preferred_username || twitchProfile.login || 'unknown',
                displayName: twitchProfile.preferred_username || twitchProfile.login || 'Unknown',
                email: twitchProfile.email,
                avatar: twitchProfile.picture || twitchProfile.profile_image_url,
                accessToken: account.access_token || '',
                refreshToken: account.refresh_token || '',
              },
            })
          } else {
            // Update existing user's tokens and info
            await prisma.user.update({
              where: { twitchId: twitchProfile.sub },
              data: {
                accessToken: account.access_token || existingUser.accessToken,
                refreshToken: account.refresh_token || existingUser.refreshToken,
                email: twitchProfile.email || existingUser.email,
                avatar: twitchProfile.picture || twitchProfile.profile_image_url || existingUser.avatar,
              },
            })
          }

          // Ensure account link exists
          const existingAccount = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
          })

          if (!existingAccount) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state as string | null | undefined,
              },
            })
          }

          return true
        } catch (error) {
          console.error('Error in signIn callback:', error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        // Find user by Twitch ID or database ID
        let dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { id: token.sub },
              { twitchId: token.sub },
            ],
          },
        })

        // If still not found, try by email
        if (!dbUser && session.user.email) {
          dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
          })
        }
        
        if (dbUser) {
          session.user.id = dbUser.id
          session.user.twitchId = dbUser.twitchId
          session.user.name = dbUser.displayName
          session.user.image = dbUser.avatar
        }
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === 'development',
})
