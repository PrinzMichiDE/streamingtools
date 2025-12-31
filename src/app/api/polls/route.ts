import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const polls = await prisma.poll.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      include: {
        options: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(polls)
  } catch (error) {
    console.error('Error fetching polls:', error)
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
    const { question, options, endsAt } = body

    const poll = await prisma.poll.create({
      data: {
        userId: session.user.id,
        question,
        endsAt: endsAt ? new Date(endsAt) : null,
        options: {
          create: options.map((opt: string, index: number) => ({
            text: opt,
            position: index,
          })),
        },
      },
      include: {
        options: true,
      },
    })

    return NextResponse.json(poll, { status: 201 })
  } catch (error) {
    console.error('Error creating poll:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

