import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ModuleTransitionLayer } from '@/components/ModuleTransitionLayer'
import { RouteTracker } from '@/components/RouteTracker'

export const metadata: Metadata = {
  title: 'SPEAK — Aprende inglés escribiendo',
  description: 'Plataforma de aprendizaje de inglés donde escribir es el único camino para avanzar.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = { themeColor: '#0D1117', width: 'device-width', initialScale: 1, maximumScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" /></head>
      <body className="min-h-screen bg-background antialiased">
        <RouteTracker />
        {children}
        <ModuleTransitionLayer />
      </body>
    </html>
  )
}
