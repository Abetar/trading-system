import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { FaArrowUp, FaArrowDown, FaFire } from "react-icons/fa";
import AddAssetModal from "./AddAssetModal";
import DeleteButton from "./DeleteButton";
import Link from "next/link";
import Countdown from "./Countdown"; // 🔥 NUEVO

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

  // 🔥 CRON META
  const cronMeta = await prisma.portfolioMetric.findUnique({
    where: { date: new Date(0) },
  });

  const lastRun = cronMeta?.createdAt ?? new Date();

  // FX
  let usdToMxn = 17;
  try {
    const res = await fetch(
      "https://api.exchangerate.host/latest?base=USD&symbols=MXN"
    );
    const data = await res.json();
    usdToMxn = data?.rates?.MXN ?? 17;
  } catch {}

  const assets = assetsRaw.map((asset) => {
    const closes = asset.priceSnapshots.map((p) => Number(p.close));
    const latest = closes[0];

    const smaShort =
      closes.slice(0, 5).reduce((a, b) => a + b, 0) /
      Math.min(5, closes.length);

    const smaLong =
      closes.slice(0, 20).reduce((a, b) => a + b, 0) /
      Math.min(20, closes.length);

    const momentum =
      closes[0] && closes[5]
        ? ((closes[0] - closes[5]) / closes[5]) * 100
        : 0;

    let score = 50;

    if (latest > smaShort) score += 15;
    if (latest > smaLong) score += 25;
    if (smaShort > smaLong) score += 20;
    if (momentum > 0.5) score += 15;

    if (latest < smaShort) score -= 15;
    if (latest < smaLong) score -= 25;
    if (momentum < -0.5) score -= 15;

    let signal = score >= 55 ? "BUY" : "SELL";

    let timing =
      signal === "BUY"
        ? momentum > 2
          ? "🔥 Entrada fuerte (1-3 días)"
          : "Entrada probable (2-5 días)"
        : momentum < -2
        ? "⚠️ Caída fuerte (1-3 días)"
        : "Salida probable (2-5 días)";

    return {
      ...asset,
      latest,
      priceMXN: latest ? latest * usdToMxn : null,
      score,
      signal,
      timing,
      momentum,
    };
  });

  // ORDEN AUTOMÁTICO
  assets.sort((a, b) => b.score - a.score);

  // FORZAR MEJOR OPCIÓN
  if (assets.length > 0) {
    assets[0].signal = "BUY";
    assets[0].timing = "🔥 Mejor oportunidad actual";
  }

  const top = assets[0];

  return (
    <div className="min-h-screen bg-[#F5F6F7] p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* 🔥 HEADER + NAV + COUNTDOWN */}
        <div className="flex justify-between items-center">

          <div>
            <h1 className="text-2xl font-semibold text-[#0F2A36]">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Sistema de decisiones
            </p>

            {/* 🔥 COUNTDOWN */}
            <Countdown lastRun={lastRun.toISOString()} />
          </div>

          <Link
            href="/dashboard/tracking"
            className="bg-[#0F2A36] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
          >
            Ver Tracking
          </Link>

        </div>

        {/* HERO */}
        {top && (
          <div className="bg-[#0F2A36] text-white rounded-2xl p-6 shadow-lg">
            <p className="text-xs opacity-70 flex items-center gap-2">
              <FaFire /> Mejor oportunidad hoy
            </p>

            <div className="flex justify-between items-center mt-3">
              <div>
                <h2 className="text-2xl font-bold">{top.symbol}</h2>
                <p className="text-sm opacity-80">
                  Score: {top.score} | {top.momentum.toFixed(2)}%
                </p>
              </div>

              <div className="bg-green-500 px-4 py-2 rounded-lg font-semibold">
                BUY
              </div>
            </div>

            <p className="text-sm mt-3 opacity-80">{top.timing}</p>
          </div>
        )}

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {assets.map((asset) => {
            return (
              <div
                key={asset.id}
                className="relative bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
              >

                <DeleteButton id={asset.id} />

                <div className="flex justify-between">
                  <span className="font-semibold text-[#0F2A36]">
                    {asset.symbol}
                  </span>

                  <span className="text-xs text-gray-400">
                    Score {asset.score}
                  </span>
                </div>

                <p className="text-xs text-gray-500">{asset.name}</p>

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
                      Cargando precio...
                    </p>
                  )}

                  <p className="text-xs text-gray-500">
                    {asset.momentum.toFixed(2)}%
                  </p>

                  <div
                    className={
                      asset.signal === "BUY"
                        ? "text-green-600 font-medium text-xs flex items-center gap-1"
                        : "text-red-600 font-medium text-xs flex items-center gap-1"
                    }
                  >
                    {asset.signal === "BUY" ? <FaArrowUp /> : <FaArrowDown />}
                    {asset.signal}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RECOMENDACIONES */}
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-[#0F2A36] mb-3">
            Acciones sugeridas
          </h3>

          <div className="space-y-2">
            {assets.map((a) => (
              <div
                key={a.id}
                className={
                  a.signal === "BUY"
                    ? "p-2 rounded bg-green-50 text-green-700"
                    : "p-2 rounded bg-red-50 text-red-700"
                }
              >
                {a.signal === "BUY" ? "🟢 Comprar" : "🔴 Vender"}{" "}
                {a.symbol} — {a.timing}
              </div>
            ))}
          </div>
        </div>

        {/* MODAL */}
        <div className="flex justify-end">
          <AddAssetModal />
        </div>

      </div>
    </div>
  );
}