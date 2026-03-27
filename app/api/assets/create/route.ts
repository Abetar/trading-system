import { prisma } from "@/lib/db/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { symbol, name } = await req.json()

    if (!symbol) {
      return NextResponse.json({ error: "Missing symbol" }, { status: 400 })
    }

    const asset = await prisma.asset.create({
      data: {
        symbol: symbol.toUpperCase(),
        name: name || symbol,
        type: "ETF",
        currency: "USD",
      },
    })

    return NextResponse.json(asset)
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}