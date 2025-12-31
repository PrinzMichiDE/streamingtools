import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { lat, lng, speed, altitude, accuracy, heading } = body

    const location = await prisma.location.create({
      data: {
        userId: session.user.id,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        speed: speed ? parseFloat(speed) : null,
        altitude: altitude ? parseFloat(altitude) : null,
        accuracy: accuracy ? parseFloat(accuracy) : null,
        heading: heading ? parseFloat(heading) : null,
      },
    })

    return NextResponse.json(location, { status: 201 })
  } catch (error) {
    console.error('Error saving location:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const locations = await prisma.location.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 1,
    })

    return NextResponse.json(locations[0] || null)
  } catch (error) {
    console.error('Error fetching location:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

