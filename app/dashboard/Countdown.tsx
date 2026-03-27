"use client"

import { useEffect, useState } from "react"

const INTERVAL_MINUTES = 15
const POLLING_INTERVAL = 30000 // 30 segundos

export default function Countdown() {
  const [remaining, setRemaining] = useState<number | null>(null)
  const [lastRun, setLastRun] = useState<number | null>(null)

  useEffect(() => {
    let countdownInterval: NodeJS.Timeout
    let pollingInterval: NodeJS.Timeout

    async function fetchLastRun() {
      try {
        const res = await fetch("/api/cron/last-run")
        const data = await res.json()

        if (data.lastRunAt) {
          const timestamp = new Date(data.lastRunAt).getTime()

          // 🔥 solo actualiza si cambió
          setLastRun((prev) => {
            if (prev !== timestamp) {
              return timestamp
            }
            return prev
          })
        }
      } catch (err) {
        console.error("Polling error:", err)
      }
    }

    function startCountdown() {
      countdownInterval = setInterval(() => {
        if (!lastRun) return

        const now = Date.now()
        const nextRun = lastRun + INTERVAL_MINUTES * 60 * 1000
        const diff = nextRun - now

        setRemaining(diff > 0 ? diff : 0)
      }, 1000)
    }

    // 🔥 init
    fetchLastRun()
    startCountdown()

    // 🔥 polling cada 30s
    pollingInterval = setInterval(fetchLastRun, POLLING_INTERVAL)

    return () => {
      clearInterval(countdownInterval)
      clearInterval(pollingInterval)
    }
  }, [lastRun])

  if (remaining === null) {
    return <div>Cargando countdown...</div>
  }

  const minutes = Math.floor(remaining / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)

  return (
    <div className="text-sm text-gray-500">
      Próxima actualización en:{" "}
      <span className="font-semibold">
        {minutes}:{seconds.toString().padStart(2, "0")}
      </span>
    </div>
  )
}