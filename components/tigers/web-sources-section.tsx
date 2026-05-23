import { RiExternalLinkLine, RiGlobalLine } from "@remixicon/react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Card } from "@/components/ui/card"
import type { WebSource } from "@/lib/schemas/critique"

// Audit trail. Lists every URL the model actually fetched via Google
// Search grounding while writing this critique. Collapsed by default
// so it doesn't dominate the page; open it to verify the claims marked
// "sourced" above.
export function WebSourcesSection({ sources }: { sources: WebSource[] }) {
  if (sources.length === 0) return null
  return (
    <Collapsible>
      <Card className="border-zinc-800 bg-zinc-900/70">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="group flex w-full items-center justify-between p-4 text-left"
          >
            <span className="flex items-center gap-2">
              <RiGlobalLine className="size-4 text-emerald-300" aria-hidden />
              <span className="font-display text-sm tracking-widest text-emerald-200 uppercase">
                Sources the panel read ({sources.length})
              </span>
            </span>
            <span className="font-retro-mono text-xs tracking-widest text-zinc-500 uppercase">
              Click to expand
            </span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className="flex flex-col gap-2 px-4 pb-4">
            {sources.map((s, i) => (
              <li key={i}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start justify-between gap-3 rounded border border-zinc-800 bg-zinc-950/50 p-3 hover:border-emerald-500/40 hover:bg-zinc-900"
                >
                  <span className="text-sm text-zinc-200 group-hover:text-emerald-200">
                    {s.title}
                  </span>
                  <RiExternalLinkLine
                    className="size-4 shrink-0 text-zinc-500 group-hover:text-emerald-300"
                    aria-hidden
                  />
                </a>
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
