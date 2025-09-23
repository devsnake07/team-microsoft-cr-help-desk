import { NextResponse } from 'next/server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const records = await prisma.binnacle.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  })

  return NextResponse.json(records)
}

export async function POST(request: Request) {
  const body = await request.json()

  const { userId, action, details } = body

  const binnacle = await prisma.binnacle.create({
    data: {
      userId,
      action,
      details
    }
  })

  return NextResponse.json(binnacle)
}
