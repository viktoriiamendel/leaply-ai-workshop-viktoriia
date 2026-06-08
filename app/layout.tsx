import { Bungee, Figtree, Fraunces, Geist_Mono, VT323 } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

// Editorial display serif for the Compliance Editor headings.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-editorial",
})

// Retro display face for "TIGERS", tiger names, stamps. Bungee is a heavy
// uppercase block font — pairs well with multi-layer text-shadow glows.
const bungee = Bungee({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
})

// Retro pixel-mono used for labels and taglines. VT323 is a classic
// terminal/arcade face.
const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-retro-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        figtree.variable,
        fraunces.variable,
        bungee.variable,
        vt323.variable,
        "font-sans"
      )}
    >
      <body>
        <ThemeProvider>
          {children}
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  )
}
