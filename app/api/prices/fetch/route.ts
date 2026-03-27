// app/api/prices/fetch/route.ts
import { prisma } from "@/lib/db/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const singleSymbol = searchParams.get("symbol")

    // 🔥 Permite fetch individual o masivo
    const assets = await prisma.asset.findMany({
      where: {
        isActive: true,
        ...(singleSymbol && { symbol: singleSymbol.toUpperCase() }),
      },
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const results = []

    for (const asset of assets) {
      try {
        const symbolToFetch =
          asset.symbol === "IVVPESO" ? "IVV" : asset.symbol

        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbolToFetch}`,
          {
            // 🔥 evita requests colgados
            next: { revalidate: 0 },
          }
        )

        const data = await res.json()

        // 🔥 VALIDACIÓN REAL
        if (!data?.chart || data.chart.error || !data.chart.result) {
          results.push({
            symbol: asset.symbol,
            status: "invalid_symbol",
          })
          continue
        }

        const result = data.chart.result[0]

        const price =
          result?.meta?.regularMarketPrice ??
          result?.indicators?.quote?.[0]?.close?.slice(-1)?.[0]

        if (!price || isNaN(price)) {
          results.push({
            symbol: asset.symbol,
            status: "no_price",
          })
          continue
        }

        // 🔥 UPSERT (correcto)
        await prisma.priceSnapshot.upsert({
          where: {
            assetId_date: {
              assetId: asset.id,
              date: today,
            },
          },
          update: {
            close: price,
          },
          create: {
            assetId: asset.id,
            date: today,
            close: price,
          },
        })

        results.push({
          symbol: asset.symbol,
          status: "ok",
          price,
        })
      } catch (error) {
        results.push({
          symbol: asset.symbol,
          status: "error",
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Error fetching prices" },
      { status: 500 }
    )
  }
}