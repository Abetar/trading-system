import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  // Si ya estás logueado → directo al dashboard
  if (session) {
    redirect("/dashboard")
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F5F6F7]">
      <div className="bg-white border rounded-xl p-8 w-full max-w-md space-y-6 text-center">

        {/* Título */}
        <div>
          <h1 className="text-2xl font-semibold text-[#0F2A36]">
            Trading System
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Sistema de decisiones y seguimiento de inversiones
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/login"
          className="block w-full bg-[#0F2A36] text-white py-2 rounded-lg hover:opacity-90 transition"
        >
          Iniciar sesión
        </Link>

        {/* Nota */}
        <p className="text-xs text-gray-400">
          Acceso restringido
        </p>
      </div>
    </main>
  )
}