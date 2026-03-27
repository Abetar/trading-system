// app/api/prices/fetch/cron/prices/route.ts

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    // 🔥 ejecuta actualización de precios
    await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/prices/fetch`
    )

    // 🔥 guarda última ejecución (clave para countdown)
    await prisma.portfolioMetric.upsert({
      where: {
        date: new Date(0), // registro único
      },
      update: {
        createdAt: new Date(),
      },
      create: {
        date: new Date(0),
        totalPnl: 0,
        totalPnlPct: 0,
        createdAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date(),
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Cron failed" },
      { status: 500 }
    )
  }
}