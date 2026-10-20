'use client'

import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'

const TEXTO =
  'Empiezo cada proyecto con un problema mío. Lo construyo, lo uso a diario y no lo suelto hasta que alguien más pueda usarlo sin pensar en cómo está hecho.'

function Palabra({ p, i, n, progreso }: { p: string; i: number; n: number; progreso: MotionValue<number> }) {
  const ini = 0.12 + (i / n) * 0.6
  const opacidad = useTransform(progreso, [ini, ini + 0.08], [0.16, 1])
  return (
    <motion.span style={{ opacity: opacidad }} className="pl-manif-palabra">
      {p}{' '}
    </motion.span>
  )
}

/** Cada palabra se enciende al ritmo del scroll: el texto se lee a la velocidad que se baja. */
export function Manifiesto() {
  const reducir = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.55'] })
  const palabras = TEXTO.split(' ')

  return (
    <section ref={ref} className="pl-manif" aria-label="Cómo trabajo">
      <div className="pl-contenedor">
        <p className="pl-etiqueta mono">Cómo trabajo</p>
        <p className="pl-manif-texto">
          {reducir
            ? TEXTO
            : palabras.map((p, i) => <Palabra key={i} p={p} i={i} n={palabras.length} progreso={scrollYProgress} />)}
        </p>
      </div>
    </section>
  )
}
