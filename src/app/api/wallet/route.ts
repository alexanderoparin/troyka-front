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

    // Найти или создать кошелек
    let wallet = await prisma.creditWallet.findUnique({
      where: { userId: session.user.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!wallet) {
      // Создаем кошелек с бонусными поинтами
      const bonusAmount = parseInt(process.env.DEFAULT_SIGNUP_BONUS || "6")
      
      wallet = await prisma.$transaction(async (tx) => {
        const newWallet = await tx.creditWallet.create({
          data: {
            userId: session.user.id,
            balanceInt: bonusAmount,
          },
        })

        await tx.creditTransaction.create({
          data: {
            walletId: newWallet.id,
            deltaInt: bonusAmount,
            reason: "BONUS",
            refId: "signup_bonus",
          },
        })

        return tx.creditWallet.findUnique({
          where: { id: newWallet.id },
          include: {
            transactions: {
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
        })
      })
    }

    return NextResponse.json(wallet)
  } catch (error) {
    console.error("Wallet API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
