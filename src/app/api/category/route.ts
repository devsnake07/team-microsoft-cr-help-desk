import { NextResponse } from 'next/server'

import { PrismaClient } from '@prisma/client'

import { saveBinnacleEntry, actions } from '@/services/binnacle'

const prisma = new PrismaClient()

export async function GET() {
  const categories = await prisma.category.findMany()

  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  const body = await request.json()

  const { name, description } = body

  const category = await prisma.category.create({
    data: {
      name,
      description
    }
  })

  await saveBinnacleEntry({ action: actions.CREATE_CATEGORY, details: JSON.stringify(body) })

  return NextResponse.json(category)
}
