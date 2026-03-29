"use client"

import { useState } from "react"

type Asset = {
  id: string
  symbol: string
  name: string
}

type Props = {
  assets: Asset[]
}

export default function TradeForm({ assets }: Props) {
  const [assetId, setAssetId] = useState("")
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("")
  const [side, setSide] = useState("BUY")

  const handleSubmit = async () => {
    if (!assetId || !price || !quantity) return

    await fetch("/api/trades/create", {
      method: "POST",
      body: JSON.stringify({
        assetId,
        price: Number(price),
        quantity: Number(quantity),
        side,
      }),
    })

    window.location.reload()
  }

  return (
    <div className="bg-[#F9FAFB] border border-gray-200 rounded-xl p-4">

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">

        {/* ACTIVO */}
        <div className="sm:col-span-2">
          <label className="text-xs text-gray-600 mb-1 block">
            Activo
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0F2A36]/20"
            onChange={(e) => setAssetId(e.target.value)}
          >
            <option value="" className="text-gray-400">
              Seleccionar activo
            </option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.symbol}
              </option>
            ))}
          </select>
        </div>

        {/* PRECIO */}
        <div>
          <label className="text-xs text-gray-600 mb-1 block">
            Precio
          </label>
          <input
            placeholder="$0.00"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F2A36]/20"
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        {/* CANTIDAD */}
        <div>
          <label className="text-xs text-gray-600 mb-1 block">
            Cantidad
          </label>
          <input
            placeholder="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F2A36]/20"
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        {/* TIPO */}
        <div>
          <label className="text-xs text-gray-600 mb-1 block">
            Tipo
          </label>
          <select
            className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2A36]/20 ${
              side === "BUY"
                ? "text-[#2E7D5B]"
                : "text-[#B23A3A]"
            }`}
            onChange={(e) => setSide(e.target.value)}
          >
            <option value="BUY">Compra</option>
            <option value="SELL">Venta</option>
          </select>
        </div>

      </div>

      {/* BOTÓN */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-[#0F2A36] text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          Guardar operación
        </button>
      </div>

    </div>
  )
}