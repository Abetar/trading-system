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
    <div className="bg-white p-4 rounded-xl border space-y-3 shadow-sm">

      <select
        className="w-full border rounded-lg p-2 text-sm text-gray-800"
        onChange={(e) => setAssetId(e.target.value)}
      >
        <option value="">Selecciona ETF</option>
        {assets.map((a) => (
          <option key={a.id} value={a.id}>
            {a.symbol}
          </option>
        ))}
      </select>

      <input
        placeholder="Precio"
        className="w-full border rounded-lg p-2 text-sm text-gray-800"
        onChange={(e) => setPrice(e.target.value)}
      />

      <input
        placeholder="Cantidad"
        className="w-full border rounded-lg p-2 text-sm text-gray-800"
        onChange={(e) => setQuantity(e.target.value)}
      />

      <select
        className="w-full border rounded-lg p-2 text-sm text-gray-800"
        onChange={(e) => setSide(e.target.value)}
      >
        <option value="BUY">Comprar</option>
        <option value="SELL">Vender</option>
      </select>

      <button
        onClick={handleSubmit}
        className="w-full bg-[#0F2A36] text-white py-2 rounded-lg text-sm font-medium hover:opacity-90"
      >
        Guardar operación
      </button>

    </div>
  )
}