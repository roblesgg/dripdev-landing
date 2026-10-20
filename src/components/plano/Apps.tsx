'use client'

import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { AndroidLogo, ArrowUpRight, Code, Globe, WindowsLogo } from '@phosphor-icons/react'
import type { ProyectoConDatos } from '@/lib/datos'
import type { Estado, Plataforma } from '@/lib/proyectos'

/** El color de cada app, el mismo que usa en su propia identidad. */
const COLOR: Record<string, string> = {
  rdlc: '#E57E89',
  veoveo: '#38BDF8',
  split: '#2DD4BF',
  imputame: '#FDB65C',
  zona: '#8F72EB',
}

const ESTADO: Record<Estado, string> = { publicada: 'Publicada', beta: 'Beta', proximamente: 'Próximamente' }

const PLATAFORMA: Record<Plataforma, { nombre: string; Icono: typeof Globe }> = {
  android: { nombre: 'Android', Icono: AndroidLogo },
  web: { nombre: 'Web', Icono: Globe },
  windows: { nombre: 'Windows', Icono: WindowsLogo },
  vscode: { nombre: 'VS Code', Icono: Code },
}

function Pantalla({ d, i }: { d: ProyectoConDatos; i: number }) {
  const reducir = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const giro = useTransform(scrollYProgress, [0, 1], [-14, 10])
  const sube = useTransform(scrollYProgress, [0, 1], [90, -90])
  const escala = useTransform(scrollYProgress, [0, 0.35, 1], [0.8, 1, 1])
  const { proyecto: p } = d

  return (
    <section
      ref={ref}
      id={`proyecto-${p.id}`}
      className="pl-app"
      style={{ background: COLOR[p.id] ?? '#FB944E', zIndex: i + 1 }}
      aria-labelledby={`pl-${p.id}`}
    >
      <span className="pl-num mono" aria-hidden>
        {String(i + 1).padStart(2, '0')}
      </span>
      <div className="pl-contenedor pl-app-rejilla">
        <div className="pl-app-texto">
          <span className={`pl-estado pl-estado-${p.estado}`}>{ESTADO[p.estado]}</span>
          <h2 id={`pl-${p.id}`} className="pl-app-nombre">
            {p.nombre}
          </h2>
          <p className="pl-app-desc">{p.descripcion}</p>
          <ul className="pl-app-meta mono">
            {p.plataformas.map((pl) => {
              const { nombre, Icono } = PLATAFORMA[pl]
              return (
                <li key={pl}>
                  <Icono size={16} weight="bold" aria-hidden />
                  {nombre}
                </li>
              )
            })}
            {d.version && (
              <li title="Última versión publicada">
                {d.version}
                {d.fechaVersion && ` ${d.fechaVersion}`}
              </li>
            )}
          </ul>
          {p.enlace && (
            <a className="pl-boton pl-boton-tinta" href={p.enlace} target="_blank" rel="noopener noreferrer">
              Abrir {p.nombre}
              <ArrowUpRight size={18} weight="bold" aria-hidden />
            </a>
          )}
        </div>
        <motion.div className="pl-app-icono" style={reducir ? undefined : { rotate: giro, y: sube, scale: escala }}>
          {p.icono && <img src={p.icono} alt={`Icono de ${p.nombre}`} width={420} height={420} loading="lazy" />}
        </motion.div>
      </div>
    </section>
  )
}

/** Cada app ocupa una pantalla de su color; al bajar, la siguiente sube y tapa a la anterior. */
export function Apps({ apps }: { apps: ProyectoConDatos[] }) {
  return (
    <div id="apps" className="pl-pila">
      {apps.map((d, i) => (
        <Pantalla key={d.proyecto.id} d={d} i={i} />
      ))}
    </div>
  )
}
