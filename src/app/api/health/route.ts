import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Проверяем подключение к базе данных
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({
      ok: true,
      version: process.env.npm_package_version || "1.0.0",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      services: {
        database: "ok",
        fal: process.env.FAL_API_KEY ? "configured" : "not_configured",
        robokassa: process.env.ROBOKASSA_LOGIN ? "configured" : "not_configured",
        s3: process.env.S3_ACCESS_KEY_ID ? "configured" : "not_configured",
      },
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        ok: false,
        error: "Service unavailable",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
