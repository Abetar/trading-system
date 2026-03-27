// app/api/cron/last-run/route.ts

import { prisma } from "@/lib/db/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cron = await prisma.cronExecution.findFirst({
      where: {
        jobName: "price-fetch",
      },
      orderBy: {
        lastRunAt: "desc",
      },
    })

    return NextResponse.json({
      lastRunAt: cron?.lastRunAt ?? null,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Error fetching cron status" },
      { status: 500 }
    )
  }
}