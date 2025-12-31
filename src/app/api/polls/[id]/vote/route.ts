import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { optionId } = body

    // Check if poll exists and is active
    const poll = await prisma.poll.findFirst({
      where: {
        id,
        userId: session.user.id,
        isActive: true,
      },
      include: {
        options: true,
      },
    })

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    // Update vote count
    const option = await prisma.pollOption.update({
      where: {
        id: optionId,
        pollId: id,
      },
      data: {
        votes: {
          increment: 1,
        },
      },
    })

    return NextResponse.json(option)
  } catch (error) {
    console.error('Error voting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

