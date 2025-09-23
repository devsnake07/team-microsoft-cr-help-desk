import fs from 'fs'

import path from 'path'

import { NextResponse } from 'next/server'

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
      const [, extension, base64Data] = matches
      const buffer = Buffer.from(base64Data, 'base64')

      // Create a unique filename
      const filename = `${Date.now()}.${extension}`

      // Define the path to save the image
      const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots')
      const filePath = path.join(screenshotsDir, filename)

      // Ensure the directory exists
      fs.mkdirSync(screenshotsDir, { recursive: true })

      // Write the file
      fs.writeFileSync(filePath, buffer)

      // Set the URL to be saved in the database
      imageUrl = `/screenshots/${filename}`
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
