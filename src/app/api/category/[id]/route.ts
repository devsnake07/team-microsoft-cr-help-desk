import { NextResponse } from 'next/server'

import { PrismaClient } from '@prisma/client'

import { saveBinnacleEntry, actions } from '@/services/binnacle'

const prisma = new PrismaClient()

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { id } = resolvedParams
  const body = await request.json()
  const { name } = body

  try {
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name
      }
    })

    await saveBinnacleEntry({ action: actions.UPDATE_CATEGORY, details: JSON.stringify(body) })

    return NextResponse.json(updatedCategory)
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    console.error('Failed to update category:', error)

    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { id } = resolvedParams

  try {
    await prisma.category.delete({
      where: {
        id
      }
    })
    await saveBinnacleEntry({ action: actions.DELETE_CATEGORY, details: JSON.stringify(params) })

    return new NextResponse(null, { status: 204 })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    console.error('Failed to delete category:', error)

    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
