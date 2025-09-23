import { NextResponse } from 'next/server'

import { put } from '@vercel/blob'

import { PrismaClient } from '@prisma/client'

import { saveBinnacleEntry, actions } from '@/services/binnacle'

const prisma = new PrismaClient()

export async function GET() {
  const records = await prisma.record.findMany({
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

  return NextResponse.json(records)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { userId, categoryId, dateRecord, comments, image, code } = body

  let imageUrl = image

  // Check if the image is a base64 string and save it to the filesystem
  if (image && typeof image === 'string' && image.startsWith('data:image')) {
    // Extract image data and type from base64 string (e.g., "data:image/png;base64,iVBORw0KGgo...")
    const matches = image.match(/^data:image\/(\w+);base64,(.+)$/)

    if (matches) {
      const [, extension] = matches

      // Create a unique filename
      const filename = `${Date.now()}.${extension}`

      const blob = await put(image, filename, { access: 'public', addRandomSuffix: true })

      // Set the URL to be saved in the database
      imageUrl = blob.url
    }
  }

  const record = await prisma.record.create({
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
    action: actions.CREATE_RECORD,
    details: JSON.stringify({
      comments,
      code
    })
  })

  return NextResponse.json(record)
}
