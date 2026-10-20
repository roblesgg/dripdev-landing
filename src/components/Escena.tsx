'use client'

import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { CaretUp, Palette } from '@phosphor-icons/react'
import { VARIANTES, type Calidad, type Variante } from './escena/ajustes'

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

const CLAVE = 'dripdev-diseno'
const ids = VARIANTES.map((v) => v.id)
const esVariante = (v: string | null): v is Variante => !!v && (ids as string[]).includes(v)

interface Config {
  calidad: Calidad
  estatico: boolean
}

export function Escena() {
  const [config, setConfig] = useState<Config | null>(null)
  const [variante, setVariante] = useState<Variante>('cinturon')
  const [lista, setLista] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const caja = useRef<HTMLDivElement>(null)
  const temporizador = useRef<number>(0)

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

    // El enlace manda; si no hay enlace, el último diseño que eligió esta persona
    let inicial: Variante = 'cinturon'
    try {
      const url = new URLSearchParams(window.location.search).get('d')
      const guardado = window.localStorage.getItem(CLAVE)
      if (esVariante(url)) inicial = url
      else if (esVariante(guardado)) inicial = guardado
    } catch {
      /* sin almacenamiento: se queda el de por defecto */
    }
    setVariante(inicial)
    setConfig({ calidad: movil ? 'media' : 'alta', estatico: reducir })
  }, [])

  const cambiar = useCallback(
    (id: Variante) => {
      setAbierto(false)
      if (id === variante) return
      // Fundido a negro, cambio de escena y fundido de vuelta cuando la nueva está lista
      setLista(false)
      window.clearTimeout(temporizador.current)
      temporizador.current = window.setTimeout(() => {
        setVariante(id)
        try {
          window.localStorage.setItem(CLAVE, id)
          const url = new URL(window.location.href)
          url.searchParams.set('d', id)
          window.history.replaceState(null, '', url)
        } catch {
          /* sin almacenamiento: el cambio funciona igual, solo que no se recuerda */
        }
      }, 460)
    },
    [variante],
  )

  // Atajos 1 a 5, Esc para cerrar y clic fuera
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && /^(input|textarea|select)$/i.test(el.tagName)) return
      if (e.key === 'Escape') setAbierto(false)
      const n = Number(e.key)
      if (n >= 1 && n <= ids.length && !e.metaKey && !e.ctrlKey && !e.altKey) cambiar(ids[n - 1])
    }
    const fuera = (e: PointerEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false)
    }
    window.addEventListener('keydown', tecla)
    window.addEventListener('pointerdown', fuera)
    return () => {
      window.removeEventListener('keydown', tecla)
      window.removeEventListener('pointerdown', fuera)
    }
  }, [cambiar])

  useEffect(() => () => window.clearTimeout(temporizador.current), [])

  const actual = VARIANTES.find((v) => v.id === variante) ?? VARIANTES[0]

  return (
    <>
      <div className="escena-fondo" aria-hidden />
      <div className={`escena${lista ? ' lista' : ''}`} aria-hidden>
        {config && (
          <Resguardo>
            <EscenaCanvas {...config} variante={variante} onListo={() => setLista(true)} />
          </Resguardo>
        )}
      </div>
      <div className="escena-velo" aria-hidden />

      {config && (
        <div className="diseno" ref={caja}>
          {abierto && (
            <ul className="diseno-menu" role="menu" aria-label="Elegir diseño de la portada">
              {VARIANTES.map((v, i) => (
                <li key={v.id} role="none">
                  <button
                    role="menuitemradio"
                    aria-checked={v.id === variante}
                    className={`diseno-opcion${v.id === variante ? ' activa' : ''}`}
                    onClick={() => cambiar(v.id)}
                  >
                    <span className="diseno-tecla mono">{i + 1}</span>
                    <span className="diseno-texto">
                      <strong>{v.nombre}</strong>
                      <small>{v.nota}</small>
                    </span>
                    <span className="diseno-tono mono">{v.tono}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {abierto && (
            <a className="diseno-plano" href="/plano">
              Diseño plano, sin 3D
              <span className="mono">nuevo</span>
            </a>
          )}
          <button
            className="diseno-boton"
            aria-haspopup="menu"
            aria-expanded={abierto}
            onClick={() => setAbierto((a) => !a)}
          >
            <Palette size={18} aria-hidden />
            <span className="diseno-nombre">
              <small>Diseño</small>
              {actual.nombre}
            </span>
            <CaretUp size={14} aria-hidden className={abierto ? 'girado' : ''} />
          </button>
        </div>
      )}
    </>
  )
}
