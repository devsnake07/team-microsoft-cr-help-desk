import { NextResponse } from 'next/server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { id } = resolvedParams

  try {
    const user = await prisma.user.delete({
      where: {
        id
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Could not delete user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
