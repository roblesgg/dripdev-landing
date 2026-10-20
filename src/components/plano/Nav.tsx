'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useSpring } from 'motion/react'

export function Nav() {
  const [fondo, setFondo] = useState(false)
  const { scrollYProgress } = useScroll()
  const progreso = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 })

  useEffect(() => {
    const f = () => setFondo(window.scrollY > 40)
    f()
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])

  return (
    <header className={`pl-nav${fondo ? ' con-fondo' : ''}`}>
      <div className="pl-contenedor pl-nav-dentro">
        <a href="#" className="pl-marca" aria-label="DripDev, inicio">
          DripDev
        </a>
        <nav aria-label="Principal" className="pl-nav-lista">
          <a href="#apps">Proyectos</a>
          <a href="#stack">Stack</a>
          <a href="#contacto" className="pl-nav-boton">
            Escríbeme
          </a>
        </nav>
      </div>
      <motion.div className="pl-progreso" style={{ scaleX: progreso }} aria-hidden />
    </header>
  )
}
