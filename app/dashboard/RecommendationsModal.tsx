"use client";

import { useState } from "react";

type Asset = {
  id: string;
  symbol: string;
  score: number;
  momentum: number;
  signal: "BUY" | "SELL";
};

function getAdvancedRecommendation(asset: Asset) {
  const today = new Date();

  const nextDay = new Date(today);
  nextDay.setDate(today.getDate() + 1);

  const day = nextDay.toLocaleDateString("es-MX", {
    weekday: "long",
  });

  // 🔥 BASE: momentum
  let expectedMove = Math.abs(asset.momentum) * 0.6;

  // 🔥 FIX: evitar 0%
  if (expectedMove < 0.5) {
    expectedMove = 0.8;
  }

  // 🔥 límite superior
  expectedMove = Math.min(expectedMove, 3);

  // 🔥 nueva base más clara
  const baseInvestment = 1000;
  const estimatedProfit = (baseInvestment * expectedMove) / 100;

  const confidence =
    asset.score > 80 ? "Alta" : asset.score > 65 ? "Media" : "Baja";

  if (asset.signal === "BUY") {
    return {
      action: "Comprar",
      message: `Compra ${asset.symbol} el ${day}`,
      expectedMove,
      estimatedProfit,
      confidence,
    };
  }

  return {
    action: "Vender",
    message: `Vende ${asset.symbol} el ${day}`,
    expectedMove: -expectedMove,
    estimatedProfit: -estimatedProfit,
    confidence,
  };
}

export default function RecommendationsModal({ assets }: { assets: Asset[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* BOTÓN */}
      <button
        onClick={() => setOpen(true)}
        className="bg-white border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 text-[#1F1F1F]"
      >
        Ver recomendaciones
      </button>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white text-[#1F1F1F] rounded-2xl p-6 w-full max-w-lg shadow-xl">
            {/* HEADER */}
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

            {/* LISTA */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {assets.slice(0, 5).map((a) => {
                const rec = getAdvancedRecommendation(a);

                return (
                  <div
                    key={a.id}
                    className="border rounded-xl p-4 space-y-2 bg-[#F9FAFB]"
                  >
                    {/* TITULO */}
                    <p className="font-semibold text-[#0F2A36]">
                      {rec.action} {a.symbol}
                    </p>

                    {/* MENSAJE */}
                    <p className="text-sm text-gray-700">{rec.message}</p>

                    {/* METRICAS */}
                    <div className="flex justify-between mt-2 text-sm">
                      {/* MOVIMIENTO */}
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

                      {/* GANANCIA */}
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
                        <span className="block text-[10px] text-gray-400">
                          por cada $1,000 invertidos
                        </span>
                      </p>
                      
                      {/* CONFIANZA */}
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
