"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async () => {
    setLoading(true)
    setError("")

    const res = await signIn("credentials", {
      email,
      redirect: false,
      callbackUrl: "/dashboard",
    })

    setLoading(false)

    if (res?.error) {
      setError("Acceso no autorizado")
    } else {
      window.location.href = "/dashboard"
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F6F7] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">

        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-[#0F2A36]">
            Acceso al sistema
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Uso exclusivo
          </p>
        </div>

        {/* Input */}
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="tu@email.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F2A36] focus:border-transparent transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500">
              {error}
            </p>
          )}

          {/* Button */}
          <button
            onClick={handleLogin}
            disabled={loading || !email}
            className="w-full bg-[#0F2A36] text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? "Validando..." : "Entrar"}
          </button>
        </div>

        {/* Footer */}
        <p className="text-[11px] text-gray-400 text-center mt-6">
          Sistema privado · AG Solutions
        </p>
      </div>
    </div>
  )
}