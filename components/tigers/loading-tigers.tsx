import { TigerPanel, type TigerKey } from "./tiger-panel"

const TIGER_ORDER: TigerKey[] = ["money_tiger", "user_tiger", "tech_tiger"]

export function LoadingTigers() {
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <p
        className="font-display text-2xl tracking-wide text-red-200 uppercase sm:text-3xl"
        style={{
          textShadow:
            "0 0 14px rgba(239,68,68,0.8), 0 0 32px rgba(236,72,153,0.5)",
        }}
      >
        🎬 The tigers are reading your pitch
        <AnimatedDots />
      </p>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        {TIGER_ORDER.map((key, i) => (
          <TigerPanel key={key} tigerKey={key} mode="loading" index={i} />
        ))}
      </div>
    </div>
  )
}

function AnimatedDots() {
  return (
    <span className="ml-2 inline-flex">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="ml-1 inline-block"
          style={{
            animation: "tigerDot 1.2s ease-in-out infinite",
            animationDelay: `${i * 200}ms`,
          }}
        >
          •
        </span>
      ))}
    </span>
  )
}
