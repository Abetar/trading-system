"use client";

import { useState } from "react";

type Asset = {
  id: string;
  symbol: string;
  score: number;
  momentum: number;
  signal: "BUY" | "SELL";
  hasPosition?: boolean;

  // 🔥 NUEVO
  priceMXN?: number;
};

function formatCurrency(value: number) {
  return value.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
}

function getAdvancedRecommendation(asset: Asset) {
  const today = new Date();

  const entryDate = new Date(today);
  entryDate.setDate(today.getDate() + 1);

  const entryDay = entryDate.toLocaleDateString("es-MX", {
    weekday: "long",
  });

  let expectedMove = Math.abs(asset.momentum) * 0.6;

  if (expectedMove < 0.5) {
    expectedMove = 0.8;
  }

  expectedMove = Math.min(expectedMove, 3);

  let holdDays = Math.max(1, Math.round(4 - expectedMove));

  if (asset.score > 80) holdDays += 1;
  if (asset.score < 60) holdDays -= 1;

  holdDays = Math.min(Math.max(holdDays, 1), 7);

  const exitDate = new Date(entryDate);
  exitDate.setDate(entryDate.getDate() + holdDays);

  const exitDay = exitDate.toLocaleDateString("es-MX", {
    weekday: "long",
  });

  const baseInvestment = 1000;
  const estimatedProfit = (baseInvestment * expectedMove) / 100;

  const confidence =
    asset.score > 80 ? "Alta" : asset.score > 65 ? "Media" : "Baja";

  // 🔥 POSITION SIZING CON TÍTULOS
  const capital = 1000;

  let baseAllocation = 0;

  if (asset.score > 80) baseAllocation = 0.25;
  else if (asset.score > 70) baseAllocation = 0.15;
  else if (asset.score > 60) baseAllocation = 0.1;
  else baseAllocation = 0;

  let riskMultiplier = 1;

  if (expectedMove < 1) riskMultiplier = 1.2;
  else if (expectedMove > 2) riskMultiplier = 0.7;

  let shares = 0;
  let totalInvestment = 0;

  if (asset.priceMXN && baseAllocation > 0) {
    const targetAmount = capital * baseAllocation * riskMultiplier;

    shares = Math.floor(targetAmount / asset.priceMXN);

    // mínimo 1 si es buena señal
    if (shares === 0 && asset.score > 70) {
      shares = 1;
    }

    totalInvestment = shares * asset.priceMXN;
  }

  // 🔥 CASOS

  if (!asset.hasPosition && asset.signal === "BUY") {
    return {
      title: "Nueva oportunidad",
      action: "Comprar",
      message: `Compra ${asset.symbol} el ${entryDay}`,
      plan: `Mantén ${holdDays} días y vende el ${exitDay}`,
      investmentText:
        shares > 0
          ? `Compra ${shares} título${shares > 1 ? "s" : ""} (~${formatCurrency(totalInvestment)})`
          : "Capital insuficiente para este activo",
      expectedMove,
      estimatedProfit,
      confidence,
    };
  }

  if (asset.hasPosition && asset.signal === "BUY") {
    return {
      title: "Mantener posición",
      action: "Mantener",
      message: `Ya tienes ${asset.symbol}`,
      plan: `Mantén ${holdDays} días más`,
      expectedMove,
      estimatedProfit,
      confidence,
    };
  }

  if (asset.hasPosition && asset.signal === "SELL") {
    return {
      title: "Salida recomendada",
      action: "Vender",
      message: `Se detecta debilidad en ${asset.symbol}`,
      plan: `Vende el ${entryDay}`,
      expectedMove: -expectedMove,
      estimatedProfit: -estimatedProfit,
      confidence,
    };
  }

  return {
    title: "Evitar entrada",
    action: "No entrar",
    message: `Evita comprar ${asset.symbol}`,
    plan: `Esperar mejor momento`,
    expectedMove: -expectedMove,
    estimatedProfit: -estimatedProfit,
    confidence,
  };
}

export default function RecommendationsModal({ assets }: { assets: Asset[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-white border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 text-[#1F1F1F]"
      >
        Ver recomendaciones
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white text-[#1F1F1F] rounded-2xl p-6 w-full max-w-lg shadow-xl">

            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#0F2A36]">
                Recomendaciones
              </h2>

              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">

              {assets.slice(0, 5).map((a) => {
                const rec = getAdvancedRecommendation(a);

                return (
                  <div
                    key={a.id}
                    className="border rounded-xl p-4 space-y-2 bg-[#F9FAFB]"
                  >
                    <p className="font-semibold text-[#0F2A36]">
                      {rec.title} — {a.symbol}
                    </p>

                    <div className="text-sm text-gray-700 space-y-1">
                      <p>{rec.message}</p>
                      <p className="text-gray-500">{rec.plan}</p>

                      {rec.investmentText && (
                        <p className="text-xs font-medium text-blue-600">
                          {rec.investmentText}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between mt-2 text-sm">

                      <div>
                        <p className="text-xs text-gray-400">Movimiento</p>
                        <p
                          className={`font-medium ${
                            rec.expectedMove >= 0
                              ? "text-[#2E7D5B]"
                              : "text-[#B23A3A]"
                          }`}
                        >
                          {rec.expectedMove.toFixed(2)}%
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          {rec.estimatedProfit >= 0
                            ? "Ganancia estimada"
                            : "Pérdida estimada"}
                        </p>

                        <p
                          className={`font-medium ${
                            rec.estimatedProfit >= 0
                              ? "text-[#2E7D5B]"
                              : "text-[#B23A3A]"
                          }`}
                        >
                          ${Math.abs(rec.estimatedProfit).toFixed(0)} MXN
                        </p>

                        <p className="text-[10px] text-gray-400">
                          por cada $1,000 invertidos
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">Confianza</p>
                        <p className="font-medium text-gray-700">
                          {rec.confidence}
                        </p>
                      </div>

                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        </div>
      )}
    </>
  );
}