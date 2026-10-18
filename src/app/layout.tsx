import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const sans = Geist({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })

const titulo = 'DripDev | Apps independientes de Álvaro Robles'
const descripcion =
  'DripDev es el estudio independiente de Álvaro Robles: apps para Android, web y escritorio. VeoVeo, split, imputa.me, Zona Cliente y RDLC Auto Header.'

export const metadata: Metadata = {
  metadataBase: new URL('https://dripdev.dev'),
  title: titulo,
  description: descripcion,
  authors: [{ name: 'Álvaro Robles González', url: 'https://github.com/roblesgg' }],
  alternates: { canonical: '/' },
  icons: { icon: '/dripdev-logo.png', apple: '/dripdev-logo.png' },
  openGraph: {
    title: titulo,
    description: descripcion,
    url: 'https://dripdev.dev',
    siteName: 'DripDev',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: titulo, description: descripcion },
}

export const viewport: Viewport = {
  themeColor: '#0e0c12',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
