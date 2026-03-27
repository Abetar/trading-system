"use client"

import { useState } from "react"

export default function AddAsset() {
  const [symbol, setSymbol] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!symbol) return

    setLoading(true)

    await fetch("/api/assets/create", {
      method: "POST",
      body: JSON.stringify({
        symbol,
        name: name || symbol,
      }),
    })

    setLoading(false)
    window.location.reload()
  }

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-2">

      <input
        placeholder="Ticker (ej: QQQ)"
        className="border px-3 py-2 rounded text-sm flex-1"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
      />

      <input
        placeholder="Nombre (opcional)"
        className="border px-3 py-2 rounded text-sm flex-1"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        onClick={handleAdd}
        disabled={loading}
        className="bg-[#0F2A36] text-white px-4 py-2 rounded text-sm font-medium hover:opacity-90"
      >
        {loading ? "..." : "Agregar ETF"}
      </button>
    </div>
  )
}