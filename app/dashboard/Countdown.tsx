"use client"

import { useEffect, useState } from "react"

export default function Countdown({ lastRun }: { lastRun: string }) {
  const interval = 5 * 60 // 5 min

  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    const update = () => {
      const last = new Date(lastRun).getTime()
      const now = Date.now()

      const diff = Math.floor((now - last) / 1000)
      const remaining = Math.max(interval - diff, 0)

      setSecondsLeft(remaining)

      // 🔥 auto refresh real
      if (remaining === 0) {
        window.location.reload()
      }
    }

    update()
    const timer = setInterval(update, 1000)

    return () => clearInterval(timer)
  }, [lastRun])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  return (
    <div className="text-xs text-gray-500">
      Actualización en {minutes}:{seconds.toString().padStart(2, "0")}
    </div>
  )
}