import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const overlays = await prisma.overlay.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(overlays)
  } catch (error) {
    console.error('Error fetching overlays:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, name, config, isActive } = body

    const overlay = await prisma.overlay.create({
      data: {
        userId: session.user.id,
        type,
        name,
        config: config || {},
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(overlay, { status: 201 })
  } catch (error) {
    console.error('Error creating overlay:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

