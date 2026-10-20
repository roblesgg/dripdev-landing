'use client'

import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { AndroidLogo, ArrowUpRight, Code, Globe, WindowsLogo } from '@phosphor-icons/react'
import type { ProyectoConDatos } from '@/lib/datos'
import type { Estado, Plataforma } from '@/lib/proyectos'

/** El color de cada app. Solo se usa como detalle: línea, número y halo del icono. */
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

const SUAVE = [0.16, 1, 0.3, 1] as const

function Pantalla({ d, i }: { d: ProyectoConDatos; i: number }) {
  const reducir = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const linea = useTransform(scrollYProgress, [0.05, 0.4], [0, 1])
  const sube = useTransform(scrollYProgress, [0, 1], [70, -70])
  const numero = useTransform(scrollYProgress, [0, 1], [120, -120])
  const aro = useTransform(scrollYProgress, [0, 0.5, 1], [0.7, 1, 1.25])
  const giro = useTransform(scrollYProgress, [0, 1], [-8, 8])
  const { proyecto: p } = d
  const acento = COLOR[p.id] ?? '#FB944E'
  const lado = i % 2 === 1

  const entra = (delay: number) =>
    reducir
      ? {}
      : {
          initial: { opacity: 0, y: 36 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-12% 0px' },
          transition: { duration: 0.9, delay, ease: SUAVE },
        }

  return (
    <section
      ref={ref}
      id={`proyecto-${p.id}`}
      className={`pl-app${lado ? ' pl-app-inversa' : ''}`}
      style={{ ['--acento' as string]: acento }}
      aria-labelledby={`pl-${p.id}`}
    >
      <motion.div className="pl-app-linea" style={reducir ? undefined : { scaleX: linea }} aria-hidden />
      <motion.span className="pl-num mono" style={reducir ? undefined : { y: numero }} aria-hidden>
        {String(i + 1).padStart(2, '0')}
      </motion.span>
      <div className="pl-contenedor pl-app-rejilla">
        <div className="pl-app-texto">
          <motion.span className={`pl-estado pl-estado-${p.estado}`} {...entra(0)}>
            {ESTADO[p.estado]}
          </motion.span>
          <h2 id={`pl-${p.id}`} className="pl-app-nombre">
            <motion.span
              className="pl-mascara"
              initial={reducir ? false : 'oculto'}
              whileInView="visto"
              viewport={{ once: true, margin: '-12% 0px' }}
            >
              <motion.span
                className="pl-palabra"
                variants={{ oculto: { y: '112%' }, visto: { y: 0 } }}
                transition={{ duration: 1, ease: SUAVE }}
              >
                {p.nombre}
              </motion.span>
            </motion.span>
          </h2>
          <motion.p className="pl-app-desc" {...entra(0.12)}>
            {p.descripcion}
          </motion.p>
          <motion.ul className="pl-app-meta mono" {...entra(0.2)}>
            {p.plataformas.map((pl) => {
              const { nombre, Icono } = PLATAFORMA[pl]
              return (
                <li key={pl}>
                  <Icono size={15} weight="bold" aria-hidden />
                  {nombre}
                </li>
              )
            })}
            {d.version && (
              <li title="Última versión publicada">
                {d.version}
                {d.fechaVersion && ` · ${d.fechaVersion}`}
              </li>
            )}
          </motion.ul>
          {p.enlace && (
            <motion.div {...entra(0.28)}>
              <a className="pl-boton" href={p.enlace} target="_blank" rel="noopener noreferrer">
                Abrir {p.nombre}
                <ArrowUpRight size={18} weight="bold" aria-hidden />
              </a>
            </motion.div>
          )}
        </div>
        <div className="pl-app-visual" aria-hidden={!p.icono}>
          <motion.span className="pl-app-aro" style={reducir ? undefined : { scale: aro }} />
          <motion.span className="pl-app-aro pl-app-aro-2" style={reducir ? undefined : { scale: aro }} />
          <motion.div className="pl-app-icono" style={reducir ? undefined : { y: sube, rotate: giro }}>
            {p.icono && <img src={p.icono} alt={`Icono de ${p.nombre}`} width={420} height={420} loading="lazy" />}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export function Apps({ apps }: { apps: ProyectoConDatos[] }) {
  return (
    <div id="apps" className="pl-pila">
      {apps.map((d, i) => (
        <Pantalla key={d.proyecto.id} d={d} i={i} />
      ))}
    </div>
  )
}
