"use client"

import { useState } from "react"
import { FaCheck } from "react-icons/fa"

const ASSET_CATEGORIES = [
  {
    title: "📊 Índices / ETFs",
    type: "ETF",
    items: [
      { symbol: "SPY", name: "S&P 500" },
      { symbol: "QQQ", name: "Nasdaq 100 (Tech)" },
      { symbol: "DIA", name: "Dow Jones" },
      { symbol: "VTI", name: "Total Market" },
      { symbol: "VXUS", name: "International Market" },
      { symbol: "SGOV", name: "Short Treasury" },
    ],
  },
  {
    title: "💻 Acciones",
    type: "STOCK",
    items: [
      { symbol: "AAPL", name: "Apple" },
      { symbol: "MSFT", name: "Microsoft" },
      { symbol: "NVDA", name: "Nvidia" },
      { symbol: "TSLA", name: "Tesla" },
      { symbol: "GOOGL", name: "Google" },
    ],
  },
  {
    title: "🏢 Fibras (REIT)",
    type: "REIT",
    items: [
      { symbol: "FUNO11", name: "Fibra Uno" },
      { symbol: "FMTY14", name: "Fibra Monterrey" },
    ],
  },
  {
    title: "🪙 Crypto",
    type: "CRYPTO",
    items: [
      { symbol: "BTC-USD", name: "Bitcoin" },
      { symbol: "ETH-USD", name: "Ethereum" },
    ],
  },
]

export default function AddAssetModal() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const toggle = (symbol: string) => {
    setSelected((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    )
  }

  const handleAdd = async () => {
    setLoading(true)

    for (const category of ASSET_CATEGORIES) {
      for (const asset of category.items) {
        if (selected.includes(asset.symbol)) {
          try {
            await fetch("/api/assets/create", {
              method: "POST",
              body: JSON.stringify({
                symbol: asset.symbol,
                name: asset.name,
                type: category.type, // 🔥 FIX CLAVE
              }),
            })

            await fetch(`/api/prices/fetch?symbol=${asset.symbol}`)

          } catch (err) {
            console.error("Error con:", asset.symbol)
          }
        }
      }
    }

    setLoading(false)
    setSelected([])
    setOpen(false)

    window.location.reload()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-[#0F2A36] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
      >
        + Agregar activos
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#0F2A36]">
                Agregar activos
              </h2>

              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">

              {ASSET_CATEGORIES.map((category) => (
                <div key={category.title}>
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    {category.title}
                  </p>

                  <div className="space-y-2">
                    {category.items.map((asset) => {
                      const isSelected = selected.includes(asset.symbol)

                      return (
                        <div
                          key={asset.symbol}
                          onClick={() => toggle(asset.symbol)}
                          className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition
                          ${
                            isSelected
                              ? "bg-[#0F2A36] text-white border-[#0F2A36]"
                              : "bg-white hover:bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div>
                            <p className={`text-sm font-medium ${
                              isSelected ? "text-white" : "text-black"
                            }`}>
                              {asset.symbol}
                            </p>
                            <p className={`text-xs ${
                              isSelected ? "text-gray-200" : "text-gray-500"
                            }`}>
                              {asset.name}
                            </p>
                          </div>

                          {isSelected && (
                            <FaCheck className="text-white text-sm" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

            </div>

            <div className="flex justify-between items-center mt-5">

              <p className="text-xs text-gray-500">
                {selected.length} seleccionados
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="text-sm text-gray-500"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleAdd}
                  disabled={loading || selected.length === 0}
                  className="bg-[#0F2A36] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {loading ? "Agregando..." : "Agregar"}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  )
}