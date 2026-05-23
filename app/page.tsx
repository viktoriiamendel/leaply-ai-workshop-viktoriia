import { TigersApp } from "@/components/tigers/tigers-app"

export default function Page() {
  return (
    <main className="dark relative min-h-svh overflow-hidden bg-[#0d0307] text-zinc-100">
      {/* Retro Tron-perspective grid floor — fixed, subtle, faded. */}
      <div
        aria-hidden
        className="tigers-grid-floor pointer-events-none fixed inset-0 opacity-40"
      />
      {/* Hot crimson studio glow from top — sets aggressive mood. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(239,68,68,0.32),transparent_55%)]"
      />
      {/* Hot pink accent glow from bottom-right for sexy depth. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_85%_100%,rgba(236,72,153,0.18),transparent_55%)]"
      />
      {/* Deep blood-red glow from bottom-left. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_10%_100%,rgba(153,27,27,0.22),transparent_50%)]"
      />
      {/* CRT scanlines overlay, sits on top of everything. */}
      <div
        aria-hidden
        className="tigers-scanlines pointer-events-none fixed inset-0 z-50"
      />

      <div className="relative mx-auto flex min-h-svh w-full max-w-6xl flex-col items-center justify-start px-5 py-10 sm:py-16">
        <TigersApp />
      </div>
    </main>
  )
}
