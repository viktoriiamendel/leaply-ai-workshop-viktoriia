"use client"

// "Thinking" block + name plate for the verdict card. The dimension
// score/bullets ("Based on") used to live here too but is now rendered
// once in the dedicated Signals section further down the result page.

export function TigerNamePlate({
  name,
  tagline,
}: {
  name: string
  tagline: string
}) {
  return (
    <div className="z-10 flex flex-col items-center text-center">
      <div
        className="font-display text-xl uppercase sm:text-2xl"
        style={{
          color: "#ffe5e9",
          textShadow:
            "0 0 8px rgba(255, 42, 58, 0.8), 0 0 22px rgba(255, 42, 138, 0.45)",
          letterSpacing: "0.04em",
        }}
      >
        {name}
      </div>
      <div
        className="mt-0.5 font-retro-mono text-sm tracking-widest uppercase"
        style={{
          color: "#7ce8ff",
          opacity: 0.85,
          textShadow: "0 0 6px rgba(0, 225, 255, 0.45)",
        }}
      >
        ✦ {tagline} ✦
      </div>
    </div>
  )
}

export function TigerThinking({ text }: { text: string }) {
  return (
    <div className="z-10 flex w-full flex-col gap-2">
      <SectionLabel text="✦ Thinking ✦" />
      <blockquote
        className="rounded border-l-2 px-3 py-2 text-sm leading-snug italic"
        style={{
          color: "#fde2c0",
          borderColor: "rgba(255, 184, 0, 0.5)",
          background: "rgba(0, 0, 0, 0.35)",
        }}
      >
        {text}
      </blockquote>
    </div>
  )
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div
      className="font-retro-mono text-xs tracking-widest uppercase"
      style={{
        color: "#7ce8ff",
        opacity: 0.85,
        textShadow: "0 0 4px rgba(0, 225, 255, 0.4)",
      }}
    >
      {text}
    </div>
  )
}
