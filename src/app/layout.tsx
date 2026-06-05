import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Álvaro Robles González | DripDev',
  description: 'Desarrollador de aplicaciones móviles y web. Fundador de DripDev. Creador de VeoVeo y más proyectos digitales.',
  keywords: ['Álvaro Robles González', 'DripDev', 'VeoVeo', 'desarrollador apps', 'React Native', 'Next.js'],
  authors: [{ name: 'Álvaro Robles González' }],
  openGraph: {
    title: 'Álvaro Robles González | DripDev',
    description: 'Desarrollador de aplicaciones móviles y web. Fundador de DripDev.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
