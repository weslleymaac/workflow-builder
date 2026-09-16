import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "reactflow/dist/style.css"
import "./globals.css"

export const metadata: Metadata = {
  title: "Logic Flow — Lógica de programação",
  description:
    "Aprenda variáveis, condições, loops e listas montando fluxos visuais. Manual guiado e editor profissional.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className={GeistSans.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="logic-flow-theme-v2">
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
