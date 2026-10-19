'use client'

import { useReducedMotion } from 'motion/react'
import { AndroidLogo, ArrowUpRight, Code, Globe, WindowsLogo } from '@phosphor-icons/react'
import type { Estado, Plataforma, Proyecto } from '@/lib/proyectos'

const etiquetaEstado: Record<Estado, string> = {
  publicada: 'Publicada',
  beta: 'Beta',
  proximamente: 'Próximamente',
}

const plataformas: Record<Plataforma, { nombre: string; Icono: typeof Globe }> = {
  android: { nombre: 'Android', Icono: AndroidLogo },
  web: { nombre: 'Web', Icono: Globe },
  windows: { nombre: 'Windows', Icono: WindowsLogo },
  vscode: { nombre: 'VS Code', Icono: Code },
}

interface Props {
  proyecto: Proyecto
  version: string | null
  /** Fecha de esa versión, "18 oct", ya formateada en el servidor. */
  fechaVersion: string | null
}

/**
 * Una fila de proyecto. El brillo que sigue al cursor es feedback de hover: marca
 * qué fila está bajo el puntero. Se escribe en variables CSS, sin estado de React,
 * y se desactiva con movimiento reducido o sin puntero fino.
 */
export function FilaProyecto({ proyecto, version, fechaVersion }: Props) {
  const reducir = useReducedMotion()
  const enlace = proyecto.enlace

  const alMover = (e: React.PointerEvent<HTMLElement>) => {
    if (reducir || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  const contenido = (
    <>
      <div className="fila-icono" aria-hidden>
        {proyecto.icono ? (
          <img src={proyecto.icono} alt="" width={48} height={48} loading="lazy" />
        ) : (
          <span className="fila-inicial">{proyecto.inicial}</span>
        )}
      </div>

      <div className="fila-cabecera">
        <h4 className="fila-nombre">{proyecto.nombre}</h4>
        <span className={`estado estado-${proyecto.estado}`}>{etiquetaEstado[proyecto.estado]}</span>
      </div>

      <p className="fila-descripcion">{proyecto.descripcion}</p>

      <div className="fila-meta mono">
        {proyecto.plataformas.map((p) => {
          const { nombre, Icono } = plataformas[p]
          return (
            <span key={p} className="meta-item">
              <Icono size={14} weight="regular" aria-hidden />
              {nombre}
            </span>
          )
        })}
        {version && (
          <span className="meta-item" title="Última versión publicada">
            {version}
            {fechaVersion && <span className="meta-fecha">{fechaVersion}</span>}
          </span>
        )}
      </div>

      {enlace && <ArrowUpRight className="fila-flecha" size={18} weight="regular" aria-hidden />}
    </>
  )

  if (!enlace) {
    return (
      <div id={`proyecto-${proyecto.id}`} className="fila sin-enlace" role="listitem">
        {contenido}
      </div>
    )
  }

  return (
    <a
      id={`proyecto-${proyecto.id}`}
      className="fila con-enlace"
      role="listitem"
      href={enlace}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${proyecto.nombre}, ${etiquetaEstado[proyecto.estado]}. Se abre en una pestaña nueva.`}
      onPointerMove={alMover}
    >
      {contenido}
    </a>
  )
}
