import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { FaArrowUp, FaArrowDown, FaFire } from "react-icons/fa";
import AddAssetModal from "./AddAssetModal";
import DeleteButton from "./DeleteButton";
import Link from "next/link";
import Countdown from "./Countdown";
import RecommendationsModal from "./RecommendationsModal";

type DashboardAsset = {
  id: string;
  symbol: string;
  name: string;
  latest?: number;
  priceMXN?: number | null;
  score: number;
  signal: "BUY" | "SELL";
  timing: string;
  momentum: number;
  volatility: number;
  expectedMove: number;
  riskLevel: "Bajo" | "Medio" | "Alto";
};

function calculateStdDev(values: number[]): number {
  if (values.length < 2) return 0;

  const mean =
    values.reduce((sum: number, value: number) => sum + value, 0) / values.length;

  const variance =
    values.reduce((sum: number, value: number) => {
      return sum + Math.pow(value - mean, 2);
    }, 0) / values.length;

  return Math.sqrt(variance);
}

function getRiskLevel(volatility: number): "Bajo" | "Medio" | "Alto" {
  if (volatility < 1.2) return "Bajo";
  if (volatility < 2.5) return "Medio";
  return "Alto";
}

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) return <div>No autorizado</div>;

  const assetsRaw = await prisma.asset.findMany({
    where: { isActive: true },
    include: {
      priceSnapshots: {
        orderBy: { date: "desc" },
        take: 20,
      },
    },
  });

  let usdToMxn = 17;
  try {
    const res = await fetch(
      "https://api.exchangerate.host/latest?base=USD&symbols=MXN"
    );
    const data = await res.json();
    usdToMxn = data?.rates?.MXN ?? 17;
  } catch {}

  const assets: DashboardAsset[] = assetsRaw.map((asset: any) => {
    const closes = asset.priceSnapshots.map((p: any) => Number(p.close));

    const latest = closes[0];

    const smaShort =
      closes.slice(0, 5).reduce((a: number, b: number) => a + b, 0) /
      Math.max(1, Math.min(5, closes.length));

    const smaLong =
      closes.slice(0, 20).reduce((a: number, b: number) => a + b, 0) /
      Math.max(1, Math.min(20, closes.length));

    const momentum =
      closes[0] && closes[5]
        ? ((closes[0] - closes[5]) / closes[5]) * 100
        : 0;

    // 🔥 retornos diarios en %
    const dailyReturns: number[] = [];
    for (let i = 0; i < closes.length - 1; i++) {
      const current = closes[i];
      const previous = closes[i + 1];

      if (current && previous) {
        const dailyReturn = ((current - previous) / previous) * 100;
        dailyReturns.push(dailyReturn);
      }
    }

    // 🔥 volatilidad simple basada en std dev de retornos
    const volatility = calculateStdDev(dailyReturns);

    // 🔥 movimiento esperado más realista que solo momentum
    let expectedMove = Math.max(volatility * 0.8, 0.6);
    expectedMove = Math.min(expectedMove, 4);

    const riskLevel = getRiskLevel(volatility);

    let score = 50;

    if (latest > smaShort) score += 15;
    if (latest > smaLong) score += 25;
    if (smaShort > smaLong) score += 20;
    if (momentum > 0.5) score += 15;

    if (latest < smaShort) score -= 15;
    if (latest < smaLong) score -= 25;
    if (momentum < -0.5) score -= 15;

    if (volatility > 3) score -= 10;
    if (volatility < 1.2) score += 5;

    const signal: "BUY" | "SELL" = score >= 55 ? "BUY" : "SELL";

    return {
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      latest,
      priceMXN: latest ? latest * usdToMxn : null,
      score,
      signal,
      timing: "",
      momentum,
      volatility,
      expectedMove,
      riskLevel,
    };
  });

  assets.sort((a, b) => b.score - a.score);

  const top = assets[0];

  return (
    <div className="min-h-screen bg-[#F5F6F7] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-[#0F2A36]">
              Dashboard
            </h1>

            <p className="text-sm text-gray-500">
              Análisis y oportunidades de inversión
            </p>

            <Countdown />
          </div>

          <div className="flex gap-2">
            <RecommendationsModal assets={assets} />

            <Link
              href="/dashboard/tracking"
              className="bg-[#0F2A36] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
            >
              Ver operaciones
            </Link>
          </div>
        </div>

        {/* HERO */}
        {top && (
          <div className="bg-[#0F2A36] text-white rounded-2xl p-6 shadow-lg">
            <p className="text-xs opacity-70 flex items-center gap-2">
              <FaFire /> Mejor oportunidad del momento
            </p>

            <div className="flex justify-between items-center mt-3">
              <div>
                <h2 className="text-2xl font-bold">{top.symbol}</h2>

                <p className="text-sm opacity-80">
                  Nivel de señal: {top.score} | Tendencia:{" "}
                  {top.momentum.toFixed(2)}%
                </p>

                <p className="text-sm opacity-80 mt-1">
                  Movimiento esperado: ±{top.expectedMove.toFixed(2)}% | Riesgo:{" "}
                  {top.riskLevel}
                </p>
              </div>

              <div
                className={`px-4 py-2 rounded-lg font-semibold ${
                  top.signal === "BUY" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {top.signal === "BUY" ? "Comprar" : "Vender"}
              </div>
            </div>
          </div>
        )}

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="relative bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >
              <DeleteButton id={asset.id} />

              {/* HEADER */}
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#0F2A36]">
                  {asset.symbol}
                </span>

                <span className="text-xs text-gray-400">
                  Señal {asset.score}
                </span>
              </div>

              <p className="text-xs text-gray-500">{asset.name}</p>

              {/* PRECIOS */}
              <div className="mt-3 space-y-1">
                {asset.latest ? (
                  <>
                    <p className="text-lg font-semibold text-gray-900">
                      ${asset.latest.toFixed(2)} USD
                    </p>

                    <p className="text-sm text-gray-600">
                      ${asset.priceMXN?.toFixed(2)} MXN
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">
                    Precio no disponible
                  </p>
                )}

                {Math.abs(asset.momentum) > 0.1 && (
                  <p className="text-xs text-gray-500">
                    Tendencia reciente: {asset.momentum.toFixed(2)}%
                  </p>
                )}

                <p className="text-xs text-gray-500">
                  Volatilidad: {asset.volatility.toFixed(2)}%
                </p>

                <p className="text-xs text-gray-500">
                  Movimiento esperado: ±{asset.expectedMove.toFixed(2)}%
                </p>

                <p className="text-xs text-gray-500">
                  Riesgo estimado: {asset.riskLevel}
                </p>

                {/* SEÑAL */}
                <div
                  className={`text-xs flex items-center gap-1 font-medium ${
                    asset.signal === "BUY"
                      ? "text-[#2E7D5B]"
                      : "text-[#B23A3A]"
                  }`}
                >
                  {asset.signal === "BUY" ? <FaArrowUp /> : <FaArrowDown />}
                  {asset.signal === "BUY"
                    ? "Señal de compra"
                    : "Señal de venta"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-end">
          <AddAssetModal />
        </div>
      </div>
    </div>
  );
}