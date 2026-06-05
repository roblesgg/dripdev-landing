'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface Project {
  title: string
  description: string
  image: string
  fallbackIcon: string
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
    fallbackIcon: '</>',
    status: 'Publicada',
    link: 'https://marketplace.visualstudio.com/items?itemName=b3325c32-f6ee-4fad-9894-9af09cca5946.rdlc-autoheader',
  },
]

export default function ProjectCarousel3D() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const slideNext = useCallback(() => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % projects.length)
  }, [])

  const slidePrev = useCallback(() => {
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + projects.length) % projects.length)
  }, [])

  // Auto-play
  useEffect(() => {
    if (isDragging) return
    const interval = setInterval(() => {
      slideNext()
    }, 4000)
    return () => clearInterval(interval)
  }, [isDragging, slideNext])

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    setIsDragging(false)
    const threshold = 50
    if (info.offset.x > threshold || info.velocity.x > 500) {
      slidePrev()
    } else if (info.offset.x < -threshold || info.velocity.x < -500) {
      slideNext()
    }
  }

  const getCardStyle = (index: number) => {
    const diff = index - current
    const angle = diff * 180
    const isActive = index === current

    return {
      transform: `rotateY(${angle}deg) translateZ(280px)`,
      opacity: isActive ? 1 : 0.4,
      zIndex: isActive ? 10 : 0,
    }
  }

  return (
    <div className="carousel-section">
      <div className="carousel-container">
        <motion.div
          className="carousel-track"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          animate={{ rotateY: -current * 180 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <AnimatePresence mode="popLayout" custom={direction}>
            {projects.map((project, index) => (
              <motion.a
                key={project.title}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="carousel-card"
                style={getCardStyle(index)}
                whileHover={{ scale: index === current ? 1.02 : 1 }}
              >
                <div className="carousel-card-inner">
                  <div className="carousel-card-image">
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={project.title}
                        width={120}
                        height={120}
                        className="carousel-icon"
                      />
                    ) : (
                      <div className="carousel-fallback-icon">{project.fallbackIcon}</div>
                    )}
                  </div>
                  <span className="carousel-card-status">{project.status}</span>
                  <h3 className="carousel-card-title">{project.title}</h3>
                  <p className="carousel-card-desc">{project.description}</p>
                  <span className="carousel-card-link">
                    Visitar <span>→</span>
                  </span>
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="carousel-dots">
        {projects.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === current ? 'active' : ''}`}
            onClick={() => {
              setDirection(index > current ? 1 : -1)
              setCurrent(index)
            }}
            aria-label={`Ir al proyecto ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
