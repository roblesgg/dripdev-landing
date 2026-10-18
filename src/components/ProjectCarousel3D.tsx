'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, PanInfo } from 'framer-motion'

interface Project {
  title: string
  description: string
  image: string
  status: string
  statusType: 'live' | 'published'
  link: string
  accent: string
}

const projects: Project[] = [
  {
    title: 'VeoVeo',
    description: 'Descubre pelis, guarda tu lista y decidid en un minuto qué ver juntos.',
    image: '/veoveo-icon.png',
    status: 'En vivo',
    statusType: 'live',
    link: 'https://veoveo.dripdev.dev/descargar',
    accent: '#38BDF8',
  },
  {
    title: 'split',
    description: 'Tus cuentas, gastos, ahorro y pagos programados. Sin registro y sin nube: los datos se quedan en tu móvil.',
    image: '/split-icon.png',
    status: 'En vivo',
    statusType: 'live',
    link: 'https://github.com/roblesgg/split/releases/latest',
    accent: '#22C55E',
  },
  {
    title: 'imputa.me',
    description: 'Registra tus horas por tarea y míralas en un calendario semanal. Vive en la bandeja del sistema.',
    image: '/imputame-icon.png',
    status: 'En vivo',
    statusType: 'live',
    link: 'https://imputame.dripdev.dev/descargar',
    accent: '#FB944E',
  },
  {
    title: 'Zona Cliente',
    description: 'CRM para gestionar hospitales, contactos, empresas y encargos. Web y app Android.',
    image: '/zonacliente-icon.png',
    status: 'En vivo',
    statusType: 'live',
    link: 'https://zonacliente.dripdev.dev/descargar',
    accent: '#8F72EB',
  },
  {
    title: 'RDLC Auto Header',
    description: 'Extensión de VS Code que automatiza los encabezados en informes RDLC de Business Central.',
    image: '/rdlc-icon.png',
    status: 'Publicada',
    statusType: 'published',
    link: 'https://marketplace.visualstudio.com/items?itemName=b3325c32-f6ee-4fad-9894-9af09cca5946.rdlc-autoheader',
    accent: '#E57E89',
  },
]

const AUTO_INTERVAL = 6000
const PAUSE_AFTER_INTERACTION = 9000

function getOffset(cardIndex: number, activeIndex: number, count: number) {
  const diff = cardIndex - activeIndex
  let offset = ((diff % count) + count) % count
  if (offset > count / 2) offset -= count
  return offset
}

function useCardSpacing() {
  const [spacing, setSpacing] = useState(320)
  const [rotate, setRotate] = useState(48)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w < 400) { setSpacing(132); setRotate(35) }
      else if (w < 640) { setSpacing(170); setRotate(38) }
      else if (w < 768) { setSpacing(210); setRotate(40) }
      else if (w < 1024) { setSpacing(248); setRotate(42) }
      else { setSpacing(288); setRotate(44) }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return { spacing, rotate }
}

function getVariant(offset: number, spacing: number, rotate: number) {
  if (offset === 0) {
    return { x: 0, z: 0, rotateY: 0, scale: 1, opacity: 1, zIndex: 10 }
  }
  const dir = offset > 0 ? 1 : -1
  const abs = Math.abs(offset)

  // Solo se ven las dos tarjetas contiguas. Las demás esperan fuera, apagadas:
  // con cinco proyectos, dibujar también las de offset 2 las amontonaba encima
  // de las de offset 1 y los títulos se pisaban.
  if (abs > 1) {
    return {
      x: dir * (spacing + 220),
      z: -420,
      rotateY: -dir * rotate,
      scale: 0.62,
      opacity: 0,
      zIndex: 1,
    }
  }

  // La contigua se abre en abanico y retrocede en profundidad para formar el
  // arco del coverflow. Sin desenfoque: se mantiene nítida y legible.
  return {
    x: dir * spacing,
    z: -150,
    rotateY: -dir * rotate,
    scale: 0.84,
    opacity: 0.92,
    zIndex: 9,
  }
}

export default function ProjectCarousel3D() {
  const [active, setActive] = useState(0)
  const { spacing, rotate } = useCardSpacing()
  const lastInteraction = useRef<number>(0)
  const markInteraction = () => { lastInteraction.current = Date.now() }
  const dragMoved = useRef(false)

  useEffect(() => {
    const timer = setInterval(() => {
      if (Date.now() - lastInteraction.current < PAUSE_AFTER_INTERACTION) return
      setActive((prev) => (prev + 1) % projects.length)
    }, AUTO_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    markInteraction()
    if (info.offset.x < -60 || info.velocity.x < -300) setActive((p) => (p + 1) % projects.length)
    else if (info.offset.x > 60 || info.velocity.x > 300) setActive((p) => (p - 1 + projects.length) % projects.length)
  }

  const slideNext = () => { markInteraction(); setActive((p) => (p + 1) % projects.length) }
  const slidePrev = () => { markInteraction(); setActive((p) => (p - 1 + projects.length) % projects.length) }
  const goTo = (index: number) => { markInteraction(); setActive(index) }

  const current = projects[active]

  return (
    <div className="coverflow-section" id="proyectos">

      <motion.div
        className="coverflow-glow"
        animate={{ background: `radial-gradient(ellipse at 50% 55%, ${current.accent}28 0%, transparent 68%)` }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      />

      <div className="coverflow-stage">
        <motion.div
          className="coverflow-track"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragStart={() => { markInteraction(); dragMoved.current = true }}
          onDragEnd={(e, info) => { handleDragEnd(e, info); setTimeout(() => { dragMoved.current = false }, 0) }}
        >
          {projects.map((project, index) => {
            const offset = getOffset(index, active, projects.length)
            const variant = getVariant(offset, spacing, rotate)
            const isCenter = offset === 0

            return (
              <motion.a
                key={project.title}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`coverflow-card${isCenter ? ' active' : ''}`}
                initial={false}
                animate={variant}
                transition={{ type: 'spring', stiffness: 210, damping: 26, mass: 0.9 }}
                whileHover={isCenter ? { y: -12, scale: 1.035 } : { scale: 0.88, opacity: 0.95 }}
                style={{ transformStyle: 'preserve-3d' }}
                onClick={(e) => {
                  // A non-active card just gets selected (brought to the front);
                  // only the active card opens the link.
                  if (dragMoved.current) { e.preventDefault(); return }
                  if (!isCenter) { e.preventDefault(); goTo(index) }
                  else markInteraction()
                }}
              >
                {/* Liquid glass layers */}
                <div className="lg-effect" />
                <div
                  className="lg-tint"
                  style={{
                    background: isCenter
                      ? `linear-gradient(155deg, ${project.accent}1a 0%, rgba(255,255,255,0.52) 55%)`
                      : 'rgba(255,255,255,0.48)',
                  }}
                />
                <div className="lg-shine" />

                <div className="coverflow-card-inner">
                  <div
                    className="coverflow-card-visual"
                    style={{ background: `linear-gradient(145deg, ${project.accent}1c 0%, ${project.accent}08 100%)` }}
                  >
                    <img src={project.image} alt={project.title} className="coverflow-card-img" />
                    {isCenter && (
                      <motion.div
                        className="card-icon-glow"
                        style={{ background: project.accent }}
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 0.18, scale: 1 }}
                        transition={{ duration: 0.6 }}
                      />
                    )}
                    <span className={`coverflow-card-badge badge-${project.statusType}`}>
                      <span className="badge-dot" />
                      {project.status}
                    </span>
                  </div>

                  <div className="coverflow-card-content">
                    <h3 className="coverflow-card-title">{project.title}</h3>
                    <p className="coverflow-card-desc">{project.description}</p>
                    <span className="coverflow-card-link" style={{ color: project.accent }}>
                      Ver proyecto <span className="link-arrow">→</span>
                    </span>
                  </div>
                </div>
              </motion.a>
            )
          })}
        </motion.div>
      </div>

      <div className="coverflow-controls">
        <button className="coverflow-arrow" onClick={slidePrev} aria-label="Anterior">‹</button>
        <div className="coverflow-dots">
          {projects.map((_, i) => (
            <motion.button
              key={i}
              className={`coverflow-dot${active === i ? ' active' : ''}`}
              onClick={() => goTo(i)}
              animate={{
                width: active === i ? 28 : 10,
                background: active === i ? current.accent : 'rgba(255,255,255,0.22)',
              }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              aria-label={`Ir a ${projects[i].title}`}
            />
          ))}
        </div>
        <button className="coverflow-arrow" onClick={slideNext} aria-label="Siguiente">›</button>
      </div>
    </div>
  )
}
