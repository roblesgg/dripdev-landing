'use client'

import { Component, useEffect, useState, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import type { Calidad } from './escena/EscenaCanvas'

// Three.js es pesado: se carga aparte y solo en el navegador, sin bloquear el texto.
const EscenaCanvas = dynamic(() => import('./escena/EscenaCanvas'), { ssr: false })

/** Si WebGL falla a mitad de camino, la página sigue funcionando con el fondo estático. */
class Resguardo extends Component<{ children: ReactNode }, { fallo: boolean }> {
  state = { fallo: false }
  static getDerivedStateFromError() {
    return { fallo: true }
  }
  render() {
    return this.state.fallo ? null : this.props.children
  }
}

interface Config {
  calidad: Calidad
  estatico: boolean
}

export function Escena() {
  const [config, setConfig] = useState<Config | null>(null)
  const [lista, setLista] = useState(false)

  useEffect(() => {
    // Sin WebGL no hay escena: queda el degradado de fondo y la página se lee igual.
    try {
      const prueba = document.createElement('canvas')
      if (!prueba.getContext('webgl2') && !prueba.getContext('webgl')) return
    } catch {
      return
    }
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const movil = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches
    setConfig({ calidad: movil ? 'media' : 'alta', estatico: reducir })
  }, [])

  return (
    <>
      <div className="escena-fondo" aria-hidden />
      <div className={`escena${lista ? ' lista' : ''}`} aria-hidden>
        {config && (
          <Resguardo>
            <EscenaCanvas {...config} onListo={() => setLista(true)} />
          </Resguardo>
        )}
      </div>
      <div className="escena-velo" aria-hidden />
    </>
  )
}
