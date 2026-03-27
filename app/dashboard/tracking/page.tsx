import { prisma } from "@/lib/db/prisma"
import TradeForm from "./TradeForm"
import Link from "next/link"

export default async function TrackingPage() {

  const trades = await prisma.trade.findMany({
    include: {
      asset: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const assets = await prisma.asset.findMany({
    where: { isActive: true },
    orderBy: { symbol: "asc" },
  })

  const totalProfit = trades.reduce((acc, trade) => {
    const price = Number(trade.price)
    const quantity = Number(trade.quantity)

    if (trade.side === "SELL") return acc + price * quantity
    if (trade.side === "BUY") return acc - price * quantity

    return acc
  }, 0)

  return (
    <div className="min-h-screen bg-[#F5F6F7] p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* 🔥 HEADER */}
        <div className="flex justify-between items-center">

          <div>
            <h1 className="text-2xl font-semibold text-[#0F2A36]">
              Tracking
            </h1>
            <p className="text-sm text-gray-500">
              Registro de operaciones
            </p>
          </div>

          <Link
            href="/dashboard"
            className="text-sm text-gray-600 hover:text-black"
          >
            ← Volver
          </Link>

        </div>

        {/* 🔥 FORM */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#0F2A36] mb-3">
            Registrar operación
          </h2>

          <TradeForm assets={assets} />
        </div>

        {/* 🔥 RESULTADO */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">

          <p className="text-sm text-gray-500">
            Resultado total
          </p>

          <p
            className={`text-2xl font-semibold mt-1 ${
              totalProfit >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            ${totalProfit.toFixed(2)}
          </p>

        </div>

        {/* 🔥 HISTORIAL */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">

          <div className="p-4 border-b">
            <h3 className="text-sm font-semibold text-[#0F2A36]">
              Historial
            </h3>
          </div>

          {trades.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">
              No hay operaciones aún
            </p>
          ) : (
            trades.map((trade) => {
              const price = Number(trade.price)
              const quantity = Number(trade.quantity)

              return (
                <div
                  key={trade.id}
                  className="p-4 border-b last:border-b-0 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-[#0F2A36]">
                      {trade.asset.symbol}
                    </p>

                    <p
                      className={`text-xs ${
                        trade.side === "BUY"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {trade.side}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ${price.toFixed(2)}
                    </p>

                    <p className="text-xs text-gray-400">
                      x{quantity}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}