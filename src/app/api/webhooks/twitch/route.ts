import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('twitch-eventsub-message-signature')
    const messageId = request.headers.get('twitch-eventsub-message-id')
    const timestamp = request.headers.get('twitch-eventsub-message-timestamp')

    if (!messageId || !timestamp || !signature) {
      return NextResponse.json({ error: 'Missing required headers' }, { status: 400 })
    }

    // Verify webhook signature
    const message = messageId + timestamp + body
    const secret = process.env.TWITCH_WEBHOOK_SECRET!
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(message)
    const expectedSignature = 'sha256=' + hmac.digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    const data = JSON.parse(body)

    // Handle webhook verification challenge
    if (data.challenge) {
      return NextResponse.json({ challenge: data.challenge })
    }

    // Handle different event types
    const event = data.event
    const subscription = data.subscription

    switch (subscription.type) {
      case 'channel.follow':
        await handleFollowEvent(event)
        break
      case 'channel.subscribe':
        await handleSubscribeEvent(event)
        break
      case 'channel.cheer':
        await handleBitsEvent(event)
        break
      case 'channel.raid':
        await handleRaidEvent(event)
        break
      // Add more event types as needed
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleFollowEvent(event: any) {
  // TODO: Implement follow event handling
  console.log('Follow event:', event)
}

async function handleSubscribeEvent(event: any) {
  // TODO: Implement subscribe event handling
  console.log('Subscribe event:', event)
}

async function handleBitsEvent(event: any) {
  // TODO: Implement bits event handling
  console.log('Bits event:', event)
}

async function handleRaidEvent(event: any) {
  // TODO: Implement raid event handling
  console.log('Raid event:', event)
}

