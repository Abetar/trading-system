import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      where: { isActive: true },
      orderBy: { symbol: "asc" },
    })

    return NextResponse.json(assets)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Error fetching assets" },
      { status: 500 }
    )
  }
}