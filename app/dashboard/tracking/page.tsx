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

  const trades: Trade[] = tradesRaw.map((t: any): Trade => ({
    id: t.id,
    side: t.side === "BUY" ? "BUY" : "SELL",
    entryPrice: Number(t.price),
    quantity: Number(t.quantity),
    asset: {
      symbol: t.asset?.symbol ?? "N/A",
    },
  }));

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
    <div className="min-h-screen bg-[#F5F6F7] p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-[#0F2A36]">
              Tracking
            </h1>
            <p className="text-sm text-gray-500">
              Control de operaciones
            </p>
          </div>
        </div>

        {/* KPI RESULTADO */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">
            Resultado total
          </p>

          <p
            className={`text-3xl font-semibold ${
              totalProfit >= 0
                ? "text-[#2E7D5B]"
                : "text-[#B23A3A]"
            }`}
          >
            ${totalProfit.toFixed(2)}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Basado en operaciones registradas
          </p>
        </div>

        {/* FORM */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-medium text-[#0F2A36] mb-3">
            Registrar operación
          </p>
          <TradeForm assets={assets} />
        </div>

        {/* LISTA DE TRADES */}
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b text-sm font-medium text-[#0F2A36]">
            Historial de operaciones
          </div>

          {trades.length === 0 && (
            <div className="p-6 text-sm text-gray-400 text-center">
              No hay operaciones registradas
            </div>
          )}

          {trades.map((trade: Trade) => (
            <div
              key={trade.id}
              className="px-5 py-4 flex justify-between items-center border-b last:border-b-0 hover:bg-gray-50 transition"
            >
              {/* LEFT */}
              <div>
                <p className="font-medium text-[#0F2A36]">
                  {trade.asset.symbol}
                </p>

                <p
                  className={`text-xs font-medium ${
                    trade.side === "BUY"
                      ? "text-[#2E7D5B]"
                      : "text-[#B23A3A]"
                  }`}
                >
                  {trade.side === "BUY" ? "Compra" : "Venta"}
                </p>
              </div>

              {/* RIGHT */}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  ${trade.entryPrice.toFixed(2)}
                </p>

                <p className="text-xs text-gray-400">
                  Cantidad: {trade.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}