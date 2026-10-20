'use client'

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { ArrowDown, ArrowUpRight } from '@phosphor-icons/react'

const PALABRAS = ['Construyo', 'las', 'apps', 'que', 'uso.']

/** La chispa de cuatro puntas, plana y de un solo color. */
function Chispa({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path d="M63,37c-6.7-4-4-27-13-27s-6.3,23-13,27-27,4-27,13,20.3,9,27,13,4,27,13,27,6.3-23,13-27,27-4,27-13-20.3-9-27-13Z" fill="currentColor" />
    </svg>
  )
}

export function Hero() {
  const reducir = useReducedMotion()
  const { scrollY } = useScroll()

  // Cada forma sube a su propio ritmo al bajar: la página parece tener profundidad sin ser 3D
  const y1 = useTransform(scrollY, [0, 900], [0, -180])
  const y2 = useTransform(scrollY, [0, 900], [0, -80])
  const y3 = useTransform(scrollY, [0, 900], [0, -280])
  const giro = useTransform(scrollY, [0, 900], [0, 90])

  // El rótulo se inclina hacia el cursor
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-1, 1], [9, -9]), { stiffness: 110, damping: 14 })
  const ry = useSpring(useTransform(mx, [-1, 1], [-12, 12]), { stiffness: 110, damping: 14 })

  const alMover = (e: React.PointerEvent<HTMLElement>) => {
    if (reducir || e.pointerType !== 'mouse') return
    mx.set((e.clientX / window.innerWidth) * 2 - 1)
    my.set((e.clientY / window.innerHeight) * 2 - 1)
  }

  return (
    <section className="pl-hero" onPointerMove={alMover} aria-labelledby="pl-titulo">
      <motion.div className="pl-forma pl-circulo" style={reducir ? undefined : { y: y1 }} aria-hidden />
      <motion.div className="pl-forma pl-bloque" style={reducir ? undefined : { y: y2, rotate: giro }} aria-hidden />
      <motion.div className="pl-forma pl-medio" style={reducir ? undefined : { y: y3 }} aria-hidden />
      <motion.div style={reducir ? undefined : { y: y2, rotate: giro }} className="pl-forma-chispa" aria-hidden>
        <Chispa className="pl-chispa" />
      </motion.div>

      <div className="pl-hero-pegatina" style={{ perspective: 900 }}>
        <motion.img
          src="/dripdev-pegatina.png"
          alt="DripDev"
          width={1888}
          height={640}
          initial={reducir ? false : { scale: 0.5, rotate: -28, opacity: 0 }}
          animate={{ scale: 1, rotate: -6, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 90, damping: 11, delay: 0.25 }}
          style={reducir ? undefined : { rotateX: rx, rotateY: ry }}
        />
      </div>

      <div className="pl-contenedor pl-hero-texto">
        <h1 id="pl-titulo" className="pl-h1">
          {PALABRAS.map((p, i) => (
            <span key={p} className="pl-mascara">
              <motion.span
                className="pl-palabra"
                initial={reducir ? false : { y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.15 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
              >
                {p}
              </motion.span>{' '}
            </span>
          ))}
        </h1>
        <p className="pl-sub">
          DripDev es mi estudio independiente: apps para Android, web y escritorio, publicadas y mantenidas por mí.
        </p>
        <div className="pl-acciones">
          <a className="pl-boton pl-boton-tinta" href="#apps">
            Ver proyectos
            <ArrowDown size={18} weight="bold" aria-hidden />
          </a>
          <a className="pl-enlace" href="https://github.com/roblesgg" target="_blank" rel="noopener noreferrer">
            GitHub
            <ArrowUpRight size={18} weight="bold" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  )
}
