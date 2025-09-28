import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { createRobokassaPayment } from "@/lib/robokassa"

const purchaseSchema = z.object({
  planId: z.string().cuid(),
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
    const { planId } = purchaseSchema.parse(body)

    // Найти план
    const plan = await prisma.plan.findUnique({
      where: { id: planId, isActive: true },
    })

    if (!plan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      )
    }

    // Создать заказ
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        planId: plan.id,
        status: "PENDING",
      },
    })

    // Создать платеж в Robokassa
    const paymentUrl = await createRobokassaPayment({
      orderId: order.id,
      amount: plan.priceRub / 100, // Конвертируем копейки в рубли
      description: `Покупка ${plan.name} - ${plan.credits} поинтов`,
      userEmail: session.user.email || undefined,
    })

    // Обновить заказ с ID инвойса Robokassa
    await prisma.order.update({
      where: { id: order.id },
      data: {
        robokassaInvId: order.id, // Используем ID заказа как инвойс ID
      },
    })

    return NextResponse.json({
      orderId: order.id,
      paymentUrl,
      amount: plan.priceRub / 100,
    })
  } catch (error) {
    console.error("Purchase API error:", error)
    
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
