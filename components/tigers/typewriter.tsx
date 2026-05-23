"use client"

import { useEffect, useState } from "react"

// Reveals `text` one character at a time. Pure presentation — pauses by
// `delayMs` before starting, then types `text` at `speedMs` per char.
// Re-renders only when the visible slice grows.
export function Typewriter({
  text,
  delayMs = 0,
  speedMs = 30,
  className,
}: {
  text: string
  delayMs?: number
  speedMs?: number
  className?: string
}) {
  const [visible, setVisible] = useState(0)

  useEffect(() => {
    let cancelled = false
    let interval: ReturnType<typeof setInterval> | null = null
    const startTimer = setTimeout(() => {
      if (cancelled) return
      // Reset inside the async callback (not the effect body) so the
      // react-hooks/set-state-in-effect lint stays happy.
      setVisible(0)
      interval = setInterval(() => {
        setVisible((v) => {
          if (v >= text.length) {
            if (interval) clearInterval(interval)
            return v
          }
          return v + 1
        })
      }, speedMs)
    }, delayMs)

    return () => {
      cancelled = true
      clearTimeout(startTimer)
      if (interval) clearInterval(interval)
    }
  }, [text, delayMs, speedMs])

  return (
    <span className={className} aria-label={text}>
      {text.slice(0, visible)}
      <span
        aria-hidden
        className={
          visible < text.length
            ? "ml-0.5 inline-block w-[0.5ch] animate-pulse"
            : "hidden"
        }
      >
        ▌
      </span>
    </span>
  )
}
