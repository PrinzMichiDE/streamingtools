import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      twitchId: string
      email?: string | null
      name?: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
    twitchId: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    accessToken?: string
    refreshToken?: string
  }
}

