import type React from "react"
import type { Metadata, Viewport } from "next"

import { PWAInstall } from "@/components/pwa-install"
import { ThemeProvider } from "@/components/theme-provider"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import { Oxanium, Source_Code_Pro, Source_Serif_4 } from "next/font/google"

const oxanium = Oxanium({ subsets: ["latin"], weight: ["200", "300", "400", "500", "600", "700", "800"] })
const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
})
const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "Sales Management System",
  description: "Complete sales tracking and management for your business",
  generator: "v0.app",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#ef4444",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <PWAInstall />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
