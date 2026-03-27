"use client"

import { useState } from "react"
import { FaCheck } from "react-icons/fa"

const ETF_CATEGORIES = [
  {
    title: "📊 Índices principales",
    items: [
      { symbol: "SPY", name: "S&P 500" },
      { symbol: "QQQ", name: "Nasdaq 100 (Tech)" },
      { symbol: "DIA", name: "Dow Jones" },
      { symbol: "VTI", name: "Total Market" },
    ],
  },
  {
    title: "💻 Tecnología",
    items: [
      { symbol: "XLK", name: "Tech Sector" },
      { symbol: "ARKK", name: "Innovation (High Risk)" },
      { symbol: "SMH", name: "Semiconductors" },
    ],
  },
  {
    title: "⚡ Sectores",
    items: [
      { symbol: "XLE", name: "Energy" },
      { symbol: "XLF", name: "Financials" },
      { symbol: "XLV", name: "Healthcare" },
      { symbol: "XLY", name: "Consumer Discretionary" },
    ],
  },
  {
    title: "🌎 Internacional",
    items: [
      { symbol: "VXUS", name: "International Market" },
      { symbol: "EFA", name: "Developed Markets" },
      { symbol: "EEM", name: "Emerging Markets" },
    ],
  },
  {
    title: "🛡️ Conservadores",
    items: [
      { symbol: "BND", name: "Total Bond Market" },
      { symbol: "SGOV", name: "Short Treasury" },
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

    for (const category of ETF_CATEGORIES) {
      for (const etf of category.items) {
        if (selected.includes(etf.symbol)) {
          try {
            // 🔥 1. CREAR (con protección contra duplicados en backend idealmente)
            await fetch("/api/assets/create", {
              method: "POST",
              body: JSON.stringify({
                symbol: etf.symbol,
                name: etf.name,
              }),
            })

            // 🔥 2. FETCH PRECIO INMEDIATO (CLAVE)
            await fetch(`/api/prices/fetch?symbol=${etf.symbol}`)

          } catch (err) {
            console.error("Error con:", etf.symbol)
          }
        }
      }
    }

    setLoading(false)
    setSelected([])
    setOpen(false)

    // 🔥 refresh limpio
    window.location.reload()
  }

  return (
    <>
      {/* BOTÓN */}
      <button
        onClick={() => setOpen(true)}
        className="bg-[#0F2A36] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
      >
        + Agregar ETFs
      </button>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#0F2A36]">
                Agregar ETFs
              </h2>

              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* LISTA */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">

              {ETF_CATEGORIES.map((category) => (
                <div key={category.title}>
                  <p className="text-xs font-semibold text-gray-400 mb-2">
                    {category.title}
                  </p>

                  <div className="space-y-2">
                    {category.items.map((etf) => {
                      const isSelected = selected.includes(etf.symbol)

                      return (
                        <div
                          key={etf.symbol}
                          onClick={() => toggle(etf.symbol)}
                          className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition
                          ${
                            isSelected
                              ? "bg-[#0F2A36] text-white border-[#0F2A36]"
                              : "bg-white hover:bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium text-black">
                              {etf.symbol}
                            </p>
                            <p className={`text-xs ${
                              isSelected ? "text-gray-200" : "text-gray-500"
                            }`}>
                              {etf.name}
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

            {/* FOOTER */}
            <div className="flex justify-between items-center mt-5">

              <p className="text-xs text-gray-400">
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