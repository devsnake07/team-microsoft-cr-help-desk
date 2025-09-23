import { NextResponse } from 'next/server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

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
