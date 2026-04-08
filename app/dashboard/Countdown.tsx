"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"

const INTERVAL_MINUTES = 15
const POLLING_INTERVAL = 30000

export default function Countdown() {
  const [remaining, setRemaining] = useState<number | null>(null)
  const [lastRun, setLastRun] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const router = useRouter()

  const lastRunRef = useRef<number | null>(null)
  const hasRefreshedRef = useRef(false)
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // sync ref
  useEffect(() => {
    lastRunRef.current = lastRun
  }, [lastRun])

  // 🔥 POLLING
  useEffect(() => {
    async function fetchLastRun() {
      try {
        const res = await fetch("/api/cron/last-run")
        const data = await res.json()

        if (data.lastRunAt) {
          const timestamp = new Date(data.lastRunAt).getTime()

          setLastRun((prev) => {
            if (prev !== timestamp) {
              hasRefreshedRef.current = false

              // 🔥 apagar overlay si ya hay nuevo run real
              setIsRefreshing(false)

              // limpiar fallback
              if (fallbackTimeoutRef.current) {
                clearTimeout(fallbackTimeoutRef.current)
              }

              return timestamp
            }
            return prev
          })
        }
      } catch (err) {
        console.error("Polling error:", err)
      }
    }

    fetchLastRun()
    const interval = setInterval(fetchLastRun, POLLING_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  // 🔥 COUNTDOWN
  useEffect(() => {
    const interval = setInterval(() => {
      const currentLastRun = lastRunRef.current
      if (!currentLastRun) return

      const now = Date.now()
      const nextRun = currentLastRun + INTERVAL_MINUTES * 60 * 1000
      const diff = nextRun - now

      if (diff <= 0 && !hasRefreshedRef.current) {
        hasRefreshedRef.current = true

        setIsRefreshing(true)
        console.log("🔄 Triggering router.refresh()")

        setTimeout(() => {
          router.refresh()

          // 🔥 FALLBACK obligatorio (clave)
          fallbackTimeoutRef.current = setTimeout(() => {
            console.log("⚠️ Fallback: forcing overlay off")
            setIsRefreshing(false)
          }, 2000)
        }, 300)
      }

      setRemaining(diff > 0 ? diff : 0)
    }, 1000)

    return () => clearInterval(interval)
  }, [router])

  // cleanup
  useEffect(() => {
    return () => {
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current)
      }
    }
  }, [])

  if (remaining === null) {
    return <div>Cargando countdown...</div>
  }

  const minutes = Math.floor(remaining / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)

  return (
    <>
      {isRefreshing && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#0F2A36] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600">
              Actualizando datos...
            </p>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500">
        Próxima actualización en{" "}
        <span className="font-semibold">
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
      </div>
    </>
  )
}