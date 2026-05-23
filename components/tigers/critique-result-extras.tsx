"use client"

import { RiCheckLine, RiClipboardLine, RiRefreshLine } from "@remixicon/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Top-of-result toolbar: brand badge + Copy + New pitch. Extracted from
// critique-result.tsx to keep that file under 200 lines (Rule 2).
export function ResultHeader({
  copied,
  onCopy,
  onReset,
}: {
  copied: boolean
  onCopy: () => void
  onReset: () => void
}) {
  return (
    <header className="flex items-center justify-between gap-3">
      <Badge
        variant="outline"
        className="border-orange-500/40 bg-orange-500/10 text-orange-300"
      >
        Tigers verdict
      </Badge>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => void onCopy()}
          className="border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
        >
          {copied ? (
            <>
              <RiCheckLine className="size-4" /> Copied
            </>
          ) : (
            <>
              <RiClipboardLine className="size-4" /> Copy as markdown
            </>
          )}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onReset}
          className="border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
        >
          <RiRefreshLine className="size-4" /> New pitch
        </Button>
      </div>
    </header>
  )
}
