'use client'

import { motion } from 'framer-motion'
import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import ProjectCarousel3D from '@/components/ProjectCarousel3D'
import MeshGradientBackground from '@/components/MeshGradientBackground'
import AnimatedSection from '@/components/AnimatedSection'
import { SocialButtons } from '@/components/SocialLinks'
import { IconEnUso, IconChispa, IconCommits, IconUbicacion } from '@/components/Icons'

const EasterEggJet = dynamic(() => import('@/components/EasterEggJet'), { ssr: false })

const features = [
  {
    Icon: IconEnUso,
    title: 'Las uso yo',
    desc: 'Split lleva mis cuentas e imputa.me mis horas de trabajo. Si algo falla, lo noto yo primero.',
  },
  {
    Icon: IconChispa,
    title: 'De la idea al móvil',
    desc: 'Sin reuniones ni fases. Lo que hoy es un problema, en unos días es una app instalada.',
  },
  {
    Icon: IconCommits,
    title: 'No las abandono',
    desc: 'Siguen cambiando después de publicarse. El historial de commits está a la vista.',
  },
]

const LETTERS = 'DripDev'.split('')

export default function Home() {
  const [exploded] = useState(false)
  const [showLogo, setShowLogo] = useState(false)
  const handleImpact = useCallback(() => {
    // The jet leaves a cloud of smoke over the title; swap the text for the
    // logo behind it so it's revealed when the smoke clears.
    setTimeout(() => setShowLogo(true), 750)
  }, [])

  return (
    <main>
      <MeshGradientBackground />

      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="lg-effect" />
        <div className="lg-tint" />
        <div className="lg-shine" />
        <div className="navbar-inner">
          <button
            className="logo"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Volver arriba"
          >
            DRIPDEV
          </button>
          <nav className="nav-links">
            <a href="#dripdev">Sobre mí</a>
            <a href="#contacto">Contacto</a>
          </nav>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero" style={{ minHeight: 'auto', paddingBottom: '0' }}>

        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="hero-badge-dot" />
          Apps Android · Web · Escritorio
        </motion.div>

        <motion.h1
          className={`hero-title${exploded ? ' exploded' : ''}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
        >
          {showLogo ? (
            <motion.img
              src="/dripdev-logo.png"
              alt="DripDev"
              className="hero-logo"
              initial={{ opacity: 0, scale: 0.3, rotate: -15 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 140, damping: 12 }}
            />
          ) : (
            <span className="gradient">
              {LETTERS.map((char, i) => (
                <span key={i} className="letter" style={{ '--i': i } as React.CSSProperties}>
                  {char}
                </span>
              ))}
            </span>
          )}
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Hago las aplicaciones que yo quería tener. Si me sirven a mí, puede que te sirvan a ti.
        </motion.p>

        <motion.div
          className="hero-cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
        >
          <a href="#contacto" className="btn btn-primary">Escríbeme</a>
          <a href="#dripdev" className="btn btn-secondary">Ver proyectos</a>
        </motion.div>

        <ProjectCarousel3D />

        <motion.a
          href="#dripdev"
          className="scroll-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >↓</motion.a>
      </section>

      {/* ── Qué es DripDev ── */}
      <section id="dripdev" className="section">
        <div className="container">
          <AnimatedSection>
            <h2 className="section-title">Qué es DripDev</h2>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <p className="section-subtitle">
              La marca con la que publico lo que desarrollo por mi cuenta: apps para Android,
              webs y herramientas de escritorio.
            </p>
          </AnimatedSection>

          <div className="feature-grid">
            {features.map(({ Icon, title, desc }, i) => (
              <AnimatedSection key={title} delay={i * 0.12}>
                <div className="feature-card">
                  <div className="lg-effect" />
                  <div className="lg-tint" />
                  <div className="lg-shine" />
                  <div className="feature-card-inner">
                    <Icon className="feature-icon" />
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contacto ── */}
      <section id="contacto" className="section contact-section">
        <div className="container">
          <AnimatedSection>
            <div className="contact-card">
              <div className="lg-effect" />
              <div className="lg-tint" style={{ background: 'linear-gradient(155deg, rgba(251,148,78,0.10) 0%, rgba(143,114,235,0.08) 38%, rgba(21,18,28,0.82) 72%)' }} />
              <div className="lg-shine" />
              <div className="contact-card-inner">
                <div className="contact-avatar">
                  <img src="/alvaro.jpeg" alt="Álvaro Robles" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                </div>
                <h2 className="contact-name">Álvaro Robles González</h2>
                <p className="contact-role">Desarrollador de aplicaciones multiplataforma</p>
                <a href="mailto:Roblesgg16@gmail.com" className="contact-email">
                  Roblesgg16@gmail.com
                </a>
                <p className="contact-location">
                  <IconUbicacion className="contact-location-icon" />
                  Murcia
                </p>
                <SocialButtons />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <EasterEggJet onImpact={handleImpact} />

      <footer className="footer">
        <div className="container">
          <p>© {new Date().getFullYear()} DripDev · Álvaro Robles González</p>
        </div>
      </footer>
    </main>
  )
}
