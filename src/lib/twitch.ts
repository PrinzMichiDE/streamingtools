import { prisma } from './prisma'

interface TwitchChannel {
  id: string
  login: string
  display_name: string
  description: string
  profile_image_url: string
  view_count: number
  broadcaster_type: string
}

interface TwitchGame {
  id: string
  name: string
  box_art_url: string
}

export class TwitchAPI {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  async getChannel(channelId: string): Promise<TwitchChannel | null> {
    try {
      const response = await fetch(
        `https://api.twitch.tv/helix/channels?broadcaster_id=${channelId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Client-Id': process.env.TWITCH_CLIENT_ID!,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Twitch API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data?.[0] || null
    } catch (error) {
      console.error('Error fetching Twitch channel:', error)
      return null
    }
  }

  async getCurrentGame(channelId: string): Promise<TwitchGame | null> {
    try {
      const channel = await this.getChannel(channelId)
      if (!channel) return null

      const response = await fetch(
        `https://api.twitch.tv/helix/games?id=${channel.broadcaster_type}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Client-Id': process.env.TWITCH_CLIENT_ID!,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Twitch API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data?.[0] || null
    } catch (error) {
      console.error('Error fetching current game:', error)
      return null
    }
  }

  async getViewerCount(channelId: string): Promise<number> {
    try {
      const channel = await this.getChannel(channelId)
      return channel?.view_count || 0
    } catch (error) {
      console.error('Error fetching viewer count:', error)
      return 0
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
      const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: process.env.TWITCH_CLIENT_ID!,
          client_secret: process.env.TWITCH_CLIENT_SECRET!,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to refresh token')
      }

      const data = await response.json()
      return data.access_token
    } catch (error) {
      console.error('Error refreshing token:', error)
      return null
    }
  }
}

export async function getTwitchAPIForUser(userId: string): Promise<TwitchAPI | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user || !user.accessToken) {
    return null
  }

  return new TwitchAPI(user.accessToken)
}

