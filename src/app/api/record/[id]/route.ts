import { NextResponse } from 'next/server'

import { PrismaClient } from '@prisma/client'

import { put } from '@vercel/blob'

import { saveBinnacleEntry, actions } from '@/services/binnacle'

const prisma = new PrismaClient()

// GET a single record by ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { id } = resolvedParams

  try {
    const record = await prisma.record.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        category: {
          select: {
            name: true
          }
        }
      }
    })

    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error('Failed to fetch record:', error)

    return NextResponse.json({ error: 'Failed to fetch record' }, { status: 500 })
  }
}

// PUT (update) a record by ID
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { id } = resolvedParams
  const body = await request.json()
  const { userId, categoryId, dateRecord, comments, image, code } = body

  let imageUrl = image

  // Check if the image is a new base64 string and save it to the filesystem
  if (image && typeof image === 'string' && image.startsWith('data:image')) {
    // Extract image data and type from base64 string
    const matches = image.match(/^data:image\/(\w+);base64,(.+)$/)

    if (matches) {
      const [, extension, base64Data] = matches

      // Create a unique filename
      const filename = `${Date.now()}.${extension}`

      const buffer = Buffer.from(base64Data, 'base64')

      // The first argument to `put` is the filename, and the second is the file content.
      const blob = await put(filename, buffer, { access: 'public', addRandomSuffix: true })

      imageUrl = blob.url
    }
  }

  try {
    const updatedRecord = await prisma.record.update({
      where: { id },
      data: {
        userId,
        categoryId,
        dateRecord,
        comments,
        image: imageUrl,
        code
      }
    })

    await saveBinnacleEntry({
      action: actions.UPDATE_RECORD,
      details: JSON.stringify({
        comments,
        code
      })
    })

    return NextResponse.json(updatedRecord)
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    }

    console.error('Failed to update record:', error)

    return NextResponse.json({ error: 'Failed to update record' }, { status: 500 })
  }
}

// DELETE a record by ID
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { id } = resolvedParams

  try {
    await prisma.record.delete({
      where: { id }
    })

    await saveBinnacleEntry({ action: actions.DELETE_RECORD, details: JSON.stringify(id) })

    return new NextResponse(null, { status: 204 })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    }

    console.error('Failed to delete record:', error)

    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 })
  }
}
