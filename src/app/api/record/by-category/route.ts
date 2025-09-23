import { NextResponse } from 'next/server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const recordsByCategory = await prisma.record.groupBy({
    by: ['categoryId'],
    _count: {
      _all: true
    }
  })

  if (recordsByCategory.length === 0) {
    return NextResponse.json([])
  }

  const categoryIds = recordsByCategory.map(r => r.categoryId)

  const categories = await prisma.category.findMany({
    where: {
      id: {
        in: categoryIds
      }
    },
    select: {
      id: true,
      name: true
    }
  })

  const categoryMap = new Map(categories.map(c => [c.id, c.name]))

  const result = recordsByCategory.map(r => ({
    categoryId: r.categoryId,
    categoryName: categoryMap.get(r.categoryId) ?? 'Unknown Category',
    recordCount: r._count._all
  }))

  return NextResponse.json(result.sort((a, b) => a.recordCount - b.recordCount).reverse())
}
