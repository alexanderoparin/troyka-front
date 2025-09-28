import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyRobokassaCallback, parseRobokassaCallback } from "@/lib/robokassa"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const data: any = {}
    
    // Конвертируем FormData в обычный объект
    formData.forEach((value, key) => {
      data[key] = value.toString()
    })

    console.log('Robokassa callback received:', data)

    const callbackData = parseRobokassaCallback(data)

    // Проверяем подпись
    if (!verifyRobokassaCallback(callbackData)) {
      console.error('Invalid Robokassa signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const { InvId, OutSum } = callbackData
    const orderId = InvId
    const amountRub = Math.round(parseFloat(OutSum) * 100) // Конвертируем в копейки

    // Найти заказ
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        plan: true,
        user: {
          include: {
            wallet: true,
          },
        },
      },
    })

    if (!order) {
      console.error(`Order not found: ${orderId}`)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status === 'PAID') {
      // Заказ уже оплачен, возвращаем OK для идемпотентности
      return new Response('OK')
    }

    // Проверяем сумму
    if (amountRub !== order.plan.priceRub) {
      console.error(`Amount mismatch: expected ${order.plan.priceRub}, got ${amountRub}`)
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
    }

    // Записать событие вебхука
    await prisma.webhookEvent.create({
      data: {
        kind: 'robokassa_callback',
        payload: callbackData,
      },
    })

    // Обрабатываем успешный платеж в транзакции
    await prisma.$transaction(async (tx) => {
      // Обновляем статус заказа
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'PAID' },
      })

      // Создаем запись о платеже
      await tx.payment.create({
        data: {
          orderId: order.id,
          provider: 'ROBOKASSA',
          amountRub,
          status: 'CONFIRMED',
          raw: callbackData,
        },
      })

      // Находим или создаем кошелек пользователя
      let wallet = order.user.wallet
      if (!wallet) {
        wallet = await tx.creditWallet.create({
          data: {
            userId: order.user.id,
            balanceInt: 0,
          },
        })
      }

      // Начисляем поинты
      await tx.creditWallet.update({
        where: { id: wallet.id },
        data: {
          balanceInt: { increment: order.plan.credits },
        },
      })

      // Создаем транзакцию начисления
      await tx.creditTransaction.create({
        data: {
          walletId: wallet.id,
          deltaInt: order.plan.credits,
          reason: 'PURCHASE',
          refId: order.id,
        },
      })
    })

    // Отмечаем вебхук как обработанный
    await prisma.webhookEvent.updateMany({
      where: {
        kind: 'robokassa_callback',
        payload: { path: ['InvId'], equals: InvId },
        processedAt: null,
      },
      data: {
        processedAt: new Date(),
      },
    })

    console.log(`Order ${orderId} paid successfully, credited ${order.plan.credits} points`)

    // Robokassa ожидает простой ответ "OK"
    return new Response('OK')
  } catch (error) {
    console.error('Robokassa callback processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Robokassa также может отправлять GET запросы
export async function GET(request: NextRequest) {
  return POST(request)
}
