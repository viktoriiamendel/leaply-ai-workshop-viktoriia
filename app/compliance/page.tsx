import { ComplianceEditor } from "@/components/compliance/compliance-editor"

export const metadata = {
  title: "Leaply — Compliance Editor",
  description: "Compliance check + compliant rewrite for Leaply creatives",
}

export default function CompliancePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0c0a09] text-stone-200">
      {/* Atmosphere: warm amber glow + faint grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60rem 40rem at 70% -10%, rgba(245,158,11,0.10), transparent 60%), radial-gradient(50rem 30rem at 0% 0%, rgba(244,63,94,0.06), transparent 55%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <header className="mb-10">
          <p className="mb-3 font-mono text-[11px] tracking-[0.25em] text-amber-400/90 uppercase">
            Leaply · FTC/FDA Wellness · Compliance Desk
          </p>
          <h1 className="font-[family-name:var(--font-editorial)] text-5xl leading-[0.95] font-light tracking-tight text-stone-50 sm:text-6xl">
            Compliance <span className="text-amber-400 italic">Editor</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-stone-400">
            Paste a creative — get a compliant rewrite, a transparent analysis
            of every rule we checked, and the exact line-by-line changes.
          </p>
        </header>

        <ComplianceEditor />
      </div>
    </main>
  )
}
