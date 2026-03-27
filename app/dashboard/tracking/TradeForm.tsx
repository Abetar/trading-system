"use client"

import { useState } from "react"
import { Asset } from "@prisma/client"

type Props = {
  assets: Asset[]
}

export default function TradeForm({ assets }: Props) {
  const [assetId, setAssetId] = useState("")
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("")
  const [side, setSide] = useState<"BUY" | "SELL">("BUY")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!assetId || !price || !quantity) return

    setLoading(true)

    await fetch("/api/trades/create", {
      method: "POST",
      body: JSON.stringify({
        assetId,
        price: Number(price),
        quantity: Number(quantity),
        side,
      }),
    })

    setLoading(false)
    window.location.reload()
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">

      {/* ACTIVO */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-600 mb-1 font-medium">
          Activo
        </label>

        <select
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
          className="border border-gray-300 bg-white text-gray-800 rounded-lg px-3 py-2 text-sm 
          focus:outline-none focus:ring-2 focus:ring-[#0F2A36] focus:border-[#0F2A36]"
        >
          <option value="">Selecciona</option>
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.symbol}
            </option>
          ))}
        </select>
      </div>

      {/* PRECIO */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-600 mb-1 font-medium">
          Precio
        </label>

        <input
          type="number"
          placeholder="Ej: 100"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border border-gray-300 bg-white text-gray-800 placeholder-gray-400 rounded-lg px-3 py-2 text-sm 
          focus:outline-none focus:ring-2 focus:ring-[#0F2A36] focus:border-[#0F2A36]"
        />
      </div>

      {/* CANTIDAD */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-600 mb-1 font-medium">
          Cantidad
        </label>

        <input
          type="number"
          placeholder="Ej: 2"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="border border-gray-300 bg-white text-gray-800 placeholder-gray-400 rounded-lg px-3 py-2 text-sm 
          focus:outline-none focus:ring-2 focus:ring-[#0F2A36] focus:border-[#0F2A36]"
        />
      </div>

      {/* ACCIÓN */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-600 mb-1 font-medium">
          Acción
        </label>

        <select
          value={side}
          onChange={(e) => setSide(e.target.value as "BUY" | "SELL")}
          className={`border rounded-lg px-3 py-2 text-sm font-medium bg-white
          focus:outline-none focus:ring-2 focus:ring-[#0F2A36]
          ${
            side === "BUY"
              ? "border-green-400 text-green-700"
              : "border-red-400 text-red-700"
          }`}
        >
          <option value="BUY">Comprar</option>
          <option value="SELL">Vender</option>
        </select>
      </div>

      {/* BOTÓN */}
      <button
        onClick={handleSubmit}
        disabled={loading || !assetId || !price || !quantity}
        className="h-[42px] bg-[#0F2A36] text-white rounded-lg text-sm font-medium 
        hover:opacity-90 disabled:opacity-50 transition"
      >
        {loading ? "Guardando..." : "Guardar"}
      </button>

    </div>
  )
}   