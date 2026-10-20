'use client'

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { ArrowDown, ArrowUpRight } from '@phosphor-icons/react'

const LINEAS = [['Construyo', 'las'], ['apps', 'que', 'uso.']]

export function Hero() {
  const reducir = useReducedMotion()
  const { scrollY } = useScroll()

  // Al bajar, el sistema de órbitas se aleja y se desvanece
  const escala = useTransform(scrollY, [0, 900], [1, 1.5])
  const opacidad = useTransform(scrollY, [0, 700], [1, 0])
  const sube = useTransform(scrollY, [0, 900], [0, -120])

  // Las órbitas se desplazan un poco hacia el cursor
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const dx = useSpring(useTransform(mx, [-1, 1], [-22, 22]), { stiffness: 60, damping: 18 })
  const dy = useSpring(useTransform(my, [-1, 1], [-16, 16]), { stiffness: 60, damping: 18 })

  const alMover = (e: React.PointerEvent<HTMLElement>) => {
    if (reducir || e.pointerType !== 'mouse') return
    mx.set((e.clientX / window.innerWidth) * 2 - 1)
    my.set((e.clientY / window.innerHeight) * 2 - 1)
  }

  let n = 0
  return (
    <section className="pl-hero" onPointerMove={alMover} aria-labelledby="pl-titulo">
      <motion.div
        className="pl-orbitas"
        style={reducir ? undefined : { scale: escala, opacity: opacidad, y: sube }}
        aria-hidden
      >
        <motion.div className="pl-orbitas-ajuste" style={reducir ? undefined : { x: dx, y: dy }}>
          <svg viewBox="-300 -300 600 600" className="pl-orbitas-svg">
            <circle r="270" className="pl-aro" />
            <circle r="205" className="pl-aro" />
            <circle r="140" className="pl-aro" />
            <g className="pl-giro pl-giro-a">
              <circle cx="270" cy="0" r="5" className="pl-pto" />
            </g>
            <g className="pl-giro pl-giro-b">
              <circle cx="-205" cy="0" r="3.5" className="pl-pto-claro" />
            </g>
            <g className="pl-giro pl-giro-c">
              <circle cx="0" cy="-140" r="4" className="pl-pto-claro" />
            </g>
            <circle r="62" className="pl-sol" />
          </svg>
        </motion.div>
      </motion.div>

      <div className="pl-contenedor pl-hero-texto">
        <motion.p
          className="pl-etiqueta mono"
          initial={reducir ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          DripDev · estudio independiente
        </motion.p>
        <h1 id="pl-titulo" className="pl-h1">
          {LINEAS.map((linea, l) => (
            <span key={l} className="pl-linea">
              {linea.map((p) => {
                const i = n++
                return (
                  <span key={p} className="pl-mascara">
                    <motion.span
                      className={`pl-palabra${p === 'uso.' ? ' pl-acento' : ''}`}
                      initial={reducir ? false : { y: '112%' }}
                      animate={{ y: 0 }}
                      transition={{ duration: 1, delay: 0.25 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {p}
                    </motion.span>{' '}
                  </span>
                )
              })}
            </span>
          ))}
        </h1>
        <motion.p
          className="pl-sub"
          initial={reducir ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
        >
          Apps para Android, web y escritorio, publicadas y mantenidas por mí.
        </motion.p>
        <motion.div
          className="pl-acciones"
          initial={reducir ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <a className="pl-boton" href="#apps">
            Ver proyectos
            <ArrowDown size={18} weight="bold" aria-hidden />
          </a>
          <a className="pl-enlace" href="https://github.com/roblesgg" target="_blank" rel="noopener noreferrer">
            GitHub
            <ArrowUpRight size={18} weight="bold" aria-hidden />
          </a>
        </motion.div>
      </div>

      <span className="pl-bajar mono" aria-hidden>
        scroll
      </span>
    </section>
  )
}
