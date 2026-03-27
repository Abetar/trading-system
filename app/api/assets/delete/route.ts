import { prisma } from "@/lib/db/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { id } = await req.json()

    await prisma.asset.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error deleting" }, { status: 500 })
  }
}