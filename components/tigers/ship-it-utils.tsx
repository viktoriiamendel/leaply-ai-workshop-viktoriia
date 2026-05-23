"use client"

import { RiClipboardLine } from "@remixicon/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

// Tiny shared primitives used by every Ship It tab pane. Extracted to
// keep ship-it-tabs.tsx within the 200-line cap (CLAUDE.md Rule 2).

export function CopyButton({ text, label }: { text: string; label?: string }) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        void navigator.clipboard
          .writeText(text)
          .then(() => toast.success(label ?? "Copied to clipboard"))
          .catch(() => toast.error("Couldn't copy — try again"))
      }}
      className="border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
    >
      <RiClipboardLine className="size-4" /> Copy
    </Button>
  )
}

export function PaneCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900/70 p-5">
      {children}
    </div>
  )
}
