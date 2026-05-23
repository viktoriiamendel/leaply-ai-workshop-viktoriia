// One step of the founder's reading pipeline. Each stage gets a big
// faded numeric badge, a Bungee title, a one-line VT323 subtitle, and
// a divider that visually separates it from the previous stage. The
// `accent` prop drives the badge color so each stage carries its own
// ambient tone (red for verdict, amber for diagnosis, etc.).

import type { CSSProperties } from "react"

type StageAccent = "red" | "amber" | "yellow" | "emerald" | "pink" | "scarlet"

const ACCENT: Record<StageAccent, { text: string; glow: string }> = {
  red: { text: "rgba(239, 68, 68, 0.55)", glow: "rgba(239, 68, 68, 0.45)" },
  amber: { text: "rgba(245, 158, 11, 0.55)", glow: "rgba(245, 158, 11, 0.45)" },
  yellow: {
    text: "rgba(250, 204, 21, 0.55)",
    glow: "rgba(250, 204, 21, 0.4)",
  },
  emerald: {
    text: "rgba(16, 185, 129, 0.55)",
    glow: "rgba(16, 185, 129, 0.4)",
  },
  pink: { text: "rgba(236, 72, 153, 0.55)", glow: "rgba(236, 72, 153, 0.45)" },
  scarlet: {
    text: "rgba(220, 38, 38, 0.55)",
    glow: "rgba(220, 38, 38, 0.45)",
  },
}

export function Stage({
  number,
  title,
  subtitle,
  accent = "red",
  anchorId,
  children,
}: {
  number: number
  title: string
  subtitle?: string
  accent?: StageAccent
  // Optional id placed on the stage for in-page anchor scrolling.
  anchorId?: string
  children: React.ReactNode
}) {
  const c = ACCENT[accent]
  const badgeStyle: CSSProperties = {
    color: c.text,
    textShadow: `0 0 22px ${c.glow}, 0 0 44px ${c.glow}`,
  }
  return (
    <section
      id={anchorId}
      className="relative flex scroll-mt-12 flex-col gap-5 pt-10"
    >
      {/* Stage divider — fades in from both sides with a centered dot. */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-center">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700/70 to-transparent" />
        <div
          aria-hidden
          className="mx-3 size-1.5 rotate-45"
          style={{ background: c.text }}
        />
        <div className="h-px flex-1 bg-gradient-to-r from-zinc-700/70 via-transparent to-transparent" />
      </div>

      <header className="flex items-baseline gap-4">
        <span
          aria-hidden
          className="font-display text-5xl leading-none sm:text-6xl"
          style={badgeStyle}
        >
          {String(number).padStart(2, "0")}
        </span>
        <div className="flex flex-col gap-0.5">
          <h2
            className="font-display text-lg tracking-[0.18em] text-zinc-100 uppercase sm:text-xl"
            style={{ textShadow: `0 0 14px ${c.glow}` }}
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="font-retro-mono text-xs tracking-widest text-zinc-500 uppercase sm:text-sm">
              {subtitle}
            </p>
          ) : null}
        </div>
      </header>

      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}
