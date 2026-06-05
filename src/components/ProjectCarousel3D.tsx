'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface Project {
  title: string
  description: string
  image: string
  fallbackIcon: React.ReactNode
  status: string
  link: string
}

const projects: Project[] = [
  {
    title: 'VeoVeo',
    description: 'App social para descubrir películas y hacer match con amigos.',
    image: '/veoveo-icon.png',
    fallbackIcon: '🍿',
    status: 'En vivo',
    link: 'https://veoveo.dripdev.dev',
  },
  {
    title: 'RDLC Auto Header',
    description: 'Extensión VS Code para automatizar encabezados en informes RDLC.',
    image: '',
    fallbackIcon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    status: 'Publicada',
    link: 'https://marketplace.visualstudio.com/items?itemName=b3325c32-f6ee-4fad-9894-9af09cca5946.rdlc-autoheader',
  },
]

export default function ProjectCarousel3D() {
  const [current, setCurrent] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const angleStep = 360 / projects.length
  const radius = 320

  const slideNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % projects.length)
  }, [])

  const slidePrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + projects.length) % projects.length)
  }, [])

  useEffect(() => {
    if (isDragging) return
    const interval = setInterval(() => {
      slideNext()
    }, 6000)
    return () => clearInterval(interval)
  }, [isDragging, slideNext])

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    setIsDragging(false)
    const threshold = 40
    if (info.offset.x > threshold || info.velocity.x > 300) {
      slidePrev()
    } else if (info.offset.x < -threshold || info.velocity.x < -300) {
      slideNext()
    }
  }

  return (
    <div className="carousel-section" id="proyectos">
      <div className="carousel-stage">
        <motion.div
          className="carousel-ring"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.05}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          animate={{ rotateY: -current * angleStep }}
          transition={{
            type: 'spring',
            stiffness: 80,
            damping: 20,
            mass: 1.2,
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {projects.map((project, index) => {
            const isActive = index === current
            const rotation = index * angleStep

            return (
              <a
                key={project.title}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`carousel-item ${isActive ? 'active' : ''}`}
                style={{
                  transform: `rotateY(${rotation}deg) translateZ(${radius}px)`,
                }}
              >
                <div className="carousel-item-inner">
                  <div className="carousel-item-image">
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={project.title}
                        width={110}
                        height={110}
                        className="carousel-item-img"
                      />
                    ) : (
                      <div className="carousel-item-fallback">{project.fallbackIcon}</div>
                    )}
                  </div>
                  <span className="carousel-item-status">{project.status}</span>
                  <h3 className="carousel-item-title">{project.title}</h3>
                  <p className="carousel-item-desc">{project.description}</p>
                  <span className="carousel-item-cta">
                    Visitar <span>→</span>
                  </span>
                </div>
                <div className="carousel-item-reflection" />
              </a>
            )
          })}
        </motion.div>
      </div>

      <div className="carousel-floor" />

      <div className="carousel-controls">
        <button
          className="carousel-arrow"
          onClick={slidePrev}
          aria-label="Proyecto anterior"
        >
          ←
        </button>
        <div className="carousel-dots">
          {projects.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === current ? 'active' : ''}`}
              onClick={() => setCurrent(index)}
              aria-label={`Ir al proyecto ${index + 1}`}
            />
          ))}
        </div>
        <button
          className="carousel-arrow"
          onClick={slideNext}
          aria-label="Proyecto siguiente"
        >
          →
        </button>
      </div>
    </div>
  )
}
