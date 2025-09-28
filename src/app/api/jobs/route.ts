import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    const where: any = {
      userId: session.user.id,
    }

    if (search) {
      where.inputPrompt = {
        contains: search,
        mode: 'insensitive',
      }
    }

    if (status && status !== 'all') {
      where.status = status
    }

    const jobs = await prisma.generationJob.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
      select: {
        id: true,
        status: true,
        inputPrompt: true,
        resultUrl: true,
        thumbUrl: true,
        ratio: true,
        createdAt: true,
        meta: true,
      },
    })

    return NextResponse.json(jobs)
  } catch (error) {
    console.error("Jobs API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
