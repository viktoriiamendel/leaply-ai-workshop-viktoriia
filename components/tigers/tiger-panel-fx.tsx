import type { TigerVerdictStatus } from "@/lib/schemas/critique"
import { cn } from "@/lib/utils"

// Status stamp + card-flash + status config — extracted from tiger-panel
// to stay under the 200-line cap (CLAUDE.md Rule 2).

export const STATUS_CONFIG: Record<
  TigerVerdictStatus,
  { label: string; bg: string; border: string; text: string; glow: string }
> = {
  in: {
    label: "INVESTING",
    bg: "bg-emerald-500",
    border: "border-emerald-300",
    text: "text-emerald-50",
    glow: "rgba(16, 185, 129, 0.85)",
  },
  cautious: {
    label: "CAUTIOUS",
    bg: "bg-amber-500",
    border: "border-amber-300",
    text: "text-amber-50",
    glow: "rgba(245, 158, 11, 0.85)",
  },
  out: {
    label: "I'M OUT",
    bg: "bg-red-600",
    border: "border-red-300",
    text: "text-red-50",
    glow: "rgba(239, 68, 68, 0.95)",
  },
}

// White overlay that briefly flashes the card when a verdict lands.
export function CardFlash({ stagger }: { stagger: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-white"
      style={{
        animation: `tigerCardFlash 600ms ease-out ${stagger}ms 1 both`,
        opacity: 0,
      }}
    />
  )
}

// Three pulsing dots beneath each tiger while the panel reads the
// pitch. Index drives the per-tiger stagger so they don't sync.
export function LoadingDots({ index }: { index: number }) {
  return (
    <div className="z-10 flex items-center gap-2" aria-label="reading">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block size-2 rounded-full"
          style={{
            background: "#ff2a3a",
            boxShadow: "0 0 10px rgba(255, 42, 58, 0.8)",
            animation: "tigerDot 1.2s ease-in-out infinite",
            animationDelay: `${index * 250 + i * 180}ms`,
          }}
        />
      ))}
    </div>
  )
}

// The stamp that slams onto the card with rotation + scale-overshoot.
export function Stamp({
  status,
  stagger,
}: {
  status: TigerVerdictStatus
  stagger: number
}) {
  const cfg = STATUS_CONFIG[status]
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute top-[30%] left-1/2 z-20 -translate-x-1/2 select-none",
        "rounded border-4 px-5 py-1.5 font-display text-2xl tracking-widest uppercase",
        cfg.bg,
        cfg.border,
        cfg.text
      )}
      style={{
        animation: `tigerStampSlam 500ms cubic-bezier(0.2, 0.9, 0.4, 1) ${stagger + 300}ms 1 both`,
        opacity: 0,
        boxShadow: `0 0 30px -5px ${cfg.glow}`,
      }}
    >
      {cfg.label}
    </div>
  )
}
