import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyFalWebhook } from "@/lib/fal"
import { uploadImageFromUrl } from "@/lib/s3"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-fal-signature') || ''

    // Проверяем подпись вебхука
    if (!verifyFalWebhook(body, signature)) {
      console.error('Invalid FAL webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const data = JSON.parse(body)
    console.log('FAL webhook received:', data)

    const { request_id, status, output } = data

    if (!request_id) {
      return NextResponse.json({ error: 'Missing request_id' }, { status: 400 })
    }

    // Найти задачу по falRequestId
    const job = await prisma.generationJob.findUnique({
      where: { falRequestId: request_id },
    })

    if (!job) {
      console.error(`Job not found for FAL request ID: ${request_id}`)
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Записать событие вебхука
    await prisma.webhookEvent.create({
      data: {
        kind: 'fal_webhook',
        payload: data,
      },
    })

    if (status === 'COMPLETED' && output?.images?.[0]?.url) {
      try {
        // Загружаем и обрабатываем изображение
        const { resultUrl, thumbUrl } = await uploadImageFromUrl(
          output.images[0].url,
          job.id
        )

        // Обновляем задачу
        await prisma.generationJob.update({
          where: { id: job.id },
          data: {
            status: 'SUCCEEDED',
            resultUrl,
            thumbUrl,
            meta: {
              width: output.images[0].width,
              height: output.images[0].height,
              seed: output.seed,
              falOutput: output,
            },
          },
        })

        console.log(`Job ${job.id} completed successfully`)
      } catch (uploadError) {
        console.error('Failed to upload result image:', uploadError)
        
        // Обновляем статус на ошибку
        await prisma.generationJob.update({
          where: { id: job.id },
          data: {
            status: 'FAILED',
            meta: {
              error: 'Failed to upload result image',
              falOutput: output,
            },
          },
        })
      }
    } else if (status === 'FAILED') {
      // Обновляем статус на ошибку
      await prisma.generationJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          meta: {
            error: data.error || 'Generation failed',
            falOutput: output,
          },
        },
      })

      // Возвращаем поинты пользователю
      const wallet = await prisma.creditWallet.findUnique({
        where: { userId: job.userId },
      })

      if (wallet) {
        await prisma.$transaction(async (tx) => {
          await tx.creditWallet.update({
            where: { id: wallet.id },
            data: { balanceInt: { increment: 3 } },
          })

          await tx.creditTransaction.create({
            data: {
              walletId: wallet.id,
              deltaInt: 3,
              reason: 'REFUND',
              refId: job.id,
            },
          })
        })
      }

      console.log(`Job ${job.id} failed, refunded 3 credits`)
    }

    // Отметить вебхук как обработанный
    await prisma.webhookEvent.updateMany({
      where: {
        kind: 'fal_webhook',
        payload: { path: ['request_id'], equals: request_id },
        processedAt: null,
      },
      data: {
        processedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('FAL webhook processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
