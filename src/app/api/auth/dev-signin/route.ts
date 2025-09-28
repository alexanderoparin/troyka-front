import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

// Только для разработки - создает пользователя и сессию
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    const testEmail = 'test@troyka.ai'
    
    // Найти или создать пользователя
    let user = await prisma.user.findUnique({
      where: { email: testEmail },
      include: { wallet: true },
    })

    if (!user) {
      // Создаем нового пользователя с кошельком
      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: testEmail,
            name: 'Test User',
            emailVerified: new Date(),
          },
        })

        const wallet = await tx.creditWallet.create({
          data: {
            userId: newUser.id,
            balanceInt: parseInt(process.env.DEFAULT_SIGNUP_BONUS || "6"),
          },
        })

        await tx.creditTransaction.create({
          data: {
            walletId: wallet.id,
            deltaInt: parseInt(process.env.DEFAULT_SIGNUP_BONUS || "6"),
            reason: "BONUS",
            refId: "dev_signup_bonus",
          },
        })

        return await tx.user.findUnique({
          where: { id: newUser.id },
          include: { wallet: true },
        })
      })
    }

    // Создаем сессию NextAuth
    const sessionToken = `dev-session-${Date.now()}-${Math.random().toString(36)}`
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 дней

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user!.id,
        expires,
      },
    })

    // Устанавливаем cookie сессии
    const response = NextResponse.json({
      message: 'Dev signin successful',
      user: {
        id: user!.id,
        email: user!.email,
        name: user!.name,
        balance: user!.wallet?.balanceInt || 0,
      },
    })

    // Устанавливаем session cookie
    response.cookies.set('next-auth.session-token', sessionToken, {
      expires,
      httpOnly: true,
      secure: false, // Для локальной разработки всегда false
      sameSite: 'lax',
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Dev signin error:', error)
    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 }
    )
  }
}
