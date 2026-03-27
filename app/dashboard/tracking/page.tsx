import { prisma } from "@/lib/db/prisma";
import TradeForm from "./TradeForm";

type Trade = {
  id: string;
  side: "BUY" | "SELL";
  entryPrice: number;
  quantity: number;
  asset: {
    symbol: string;
  };
};

type Asset = {
  id: string;
  symbol: string;
  name: string;
};

export default async function TrackingPage() {
  const tradesRaw = await prisma.trade.findMany({
    include: {
      asset: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const assetsRaw = await prisma.asset.findMany({
    where: { isActive: true },
  });

  // 🔥 ALINEADO CON TU SCHEMA REAL (price → entryPrice)
  const trades: Trade[] = tradesRaw.map((t: any): Trade => {
    const side: "BUY" | "SELL" = t.side === "BUY" ? "BUY" : "SELL";

    return {
      id: t.id,
      side,
      entryPrice: Number(t.price), // ✅ FIX REAL AQUÍ
      quantity: Number(t.quantity),
      asset: {
        symbol: t.asset?.symbol ?? "N/A",
      },
    };
  });

  const assets: Asset[] = assetsRaw.map((a: any): Asset => ({
    id: a.id,
    symbol: a.symbol,
    name: a.name,
  }));

  const totalProfit = trades.reduce(
    (acc: number, trade: Trade): number => {
      if (trade.side === "SELL") {
        return acc + trade.entryPrice * trade.quantity;
      }
      if (trade.side === "BUY") {
        return acc - trade.entryPrice * trade.quantity;
      }
      return acc;
    },
    0
  );

  return (
    <div className="p-6 space-y-6 bg-[#F5F6F7] min-h-screen">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-[#0F2A36]">
          Tracking
        </h1>
        <p className="text-sm text-gray-500">
          Control de operaciones
        </p>
      </div>

      {/* FORM */}
      <TradeForm assets={assets} />

      {/* RESULTADO */}
      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <p className="text-sm text-gray-500">Resultado total</p>
        <p
          className={
            totalProfit >= 0
              ? "text-lg font-semibold text-green-600"
              : "text-lg font-semibold text-red-600"
          }
        >
          ${totalProfit.toFixed(2)}
        </p>
      </div>

      {/* LISTA */}
      <div className="bg-white rounded-xl border shadow-sm">
        {trades.map((trade: Trade) => (
          <div
            key={trade.id}
            className="p-4 border-b flex justify-between items-center"
          >
            <div>
              <p className="font-medium text-[#0F2A36]">
                {trade.asset.symbol}
              </p>
              <p className="text-xs text-gray-500">
                {trade.side}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                ${trade.entryPrice.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400">
                x{trade.quantity}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}