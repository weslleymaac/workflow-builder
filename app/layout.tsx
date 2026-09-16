import type { Metadata } from "next"
import { Orbitron } from "next/font/google"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "reactflow/dist/style.css"
import "./globals.css"

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Logic Flow — Missão Espacial de Lógica",
  description:
    "Embarque numa aventura espacial e aprenda variáveis, condições, loops e listas montando fluxos como um comandante.",
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
      className={`${orbitron.variable} ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className={GeistSans.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="logic-flow-theme">
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
