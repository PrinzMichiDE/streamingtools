import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

/**
 * Edge-compatible middleware using NextAuth.
 * Uses auth.config.ts which doesn't include Prisma (not supported in Edge Runtime).
 */
const { auth } = NextAuth(authConfig)

export default auth

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
