import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getPresignedUploadUrl } from "@/lib/s3"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const uploadSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().startsWith('image/'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { filename, contentType } = uploadSchema.parse(body)

    // Проверяем тип файла
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      )
    }

    // Генерируем presigned URL для загрузки
    const { uploadUrl, assetUrl, key } = await getPresignedUploadUrl(filename, contentType)

    // Сохраняем информацию о файле в БД
    await prisma.asset.create({
      data: {
        userId: session.user.id,
        type: 'INPUT',
        url: assetUrl,
      },
    })

    return NextResponse.json({
      uploadUrl,
      assetUrl,
      key,
    })
  } catch (error) {
    console.error("Upload API error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
