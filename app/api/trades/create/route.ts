import { prisma } from "@/lib/db/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { assetId, side, price, quantity, signalId } = await req.json()

    if (!assetId || !side || !price || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const trade = await prisma.trade.create({
      data: {
        assetId,
        side,
        price,
        quantity,
        ...(signalId ? { signalId } : {}),
      },
    })

    return NextResponse.json(trade)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Error creating trade" },
      { status: 500 }
    )
  }
}