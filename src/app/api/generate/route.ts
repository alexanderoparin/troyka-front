import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { createFalJob } from "@/lib/fal"

const generateSchema = z.object({
  prompt: z.string().min(10).max(2000),
  // Автоматические оптимальные настройки
  negative_prompt: z.string().default("blur, low quality, watermark, text, logo, signature"),
  image_size: z.string().default("3:4"),
  seed: z.number().optional(),
  guidance_scale: z.number().default(7.5),
  num_inference_steps: z.number().default(30),
  // Для редактирования изображений
  image_urls: z.array(z.string().url()).optional(),
  num_images: z.number().default(1),
  output_format: z.enum(['jpeg', 'png']).default('jpeg'),
  // Автоматическое определение типа
  generation_type: z.enum(['create', 'edit']).default('create'),
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
    const params = generateSchema.parse(body)

    // Проверить баланс пользователя
    const wallet = await prisma.creditWallet.findUnique({
      where: { userId: session.user.id },
    })

    if (!wallet || wallet.balanceInt < 3) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      )
    }

    // Проверить лимит параллельных генераций
    const runningJobs = await prisma.generationJob.count({
      where: {
        userId: session.user.id,
        status: { in: ["QUEUED", "RUNNING"] },
      },
    })

    const maxParallelJobs = parseInt(process.env.MAX_PARALLEL_JOBS_PER_USER || "5")
    if (runningJobs >= maxParallelJobs) {
      return NextResponse.json(
        { error: "Too many parallel generations. Please wait for current jobs to complete." },
        { status: 429 }
      )
    }

    // Списать поинты и создать задачу в транзакции
    const result = await prisma.$transaction(async (tx) => {
      // Списать поинты
      await tx.creditWallet.update({
        where: { userId: session.user.id },
        data: { balanceInt: { decrement: 3 } },
      })

      // Создать транзакцию списания
      await tx.creditTransaction.create({
        data: {
          walletId: wallet.id,
          deltaInt: -3,
          reason: "GENERATE",
        },
      })

      // Создать задачу генерации
      const job = await tx.generationJob.create({
        data: {
          userId: session.user.id,
          status: "QUEUED",
          inputPrompt: params.prompt,
          negative: params.negative_prompt,
          ratio: params.image_size,
          seed: params.seed,
          guidance: params.guidance_scale,
          steps: params.num_inference_steps,
          inputUrl: params.image_urls?.join(','), // Сохраняем URL изображений через запятую
          meta: {
            generation_type: params.generation_type,
            image_urls: params.image_urls,
            num_images: params.num_images,
            output_format: params.output_format,
          },
        },
      })

      return job
    })

    // Запустить генерацию в FAL
    try {
      const falRequestId = await createFalJob({
        prompt: params.prompt,
        generation_type: params.generation_type,
        // Для генерации с нуля
        negative_prompt: params.negative_prompt,
        image_size: params.image_size,
        seed: params.seed,
        guidance_scale: params.guidance_scale,
        num_inference_steps: params.num_inference_steps,
        // Для редактирования изображений
        image_urls: params.image_urls,
        num_images: params.num_images,
        output_format: params.output_format,
      })

      // Обновить задачу с ID запроса FAL
      await prisma.generationJob.update({
        where: { id: result.id },
        data: {
          falRequestId,
          status: "RUNNING",
        },
      })
    } catch (falError) {
      console.error("FAL job creation failed:", falError)
      
      // Откатить списание поинтов если FAL недоступен
      await prisma.$transaction(async (tx) => {
        await tx.creditWallet.update({
          where: { userId: session.user.id },
          data: { balanceInt: { increment: 3 } },
        })

        await tx.creditTransaction.create({
          data: {
            walletId: wallet.id,
            deltaInt: 3,
            reason: "REFUND",
            refId: result.id,
          },
        })

        await tx.generationJob.update({
          where: { id: result.id },
          data: { status: "FAILED" },
        })
      })

      return NextResponse.json(
        { error: "Generation service temporarily unavailable" },
        { status: 503 }
      )
    }

    return NextResponse.json({
      jobId: result.id,
      status: "RUNNING",
      message: "Generation started successfully",
    })
  } catch (error) {
    console.error("Generate API error:", error)
    
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
