'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import ParticlesBackground from '@/components/ParticlesBackground'
import AnimatedSection from '@/components/AnimatedSection'
import { SocialButtons, SocialIcons } from '@/components/SocialLinks'

const projects = [
  {
    title: 'VeoVeo',
    description: 'La app definitiva para descubrir películas y hacer match con tus amigos. Decidir qué ver nunca fue tan fácil.',
    icon: '🍿',
    status: 'live',
    statusText: 'En vivo',
    link: 'https://veoveo.dripdev.dev',
  },
  {
    title: 'RDLC Auto Header',
    description: 'Extensión de Visual Studio Code para automatizar encabezados en informes RDLC. Ahorra tiempo en cada reporte.',
    icon: '🧩',
    status: 'live',
    statusText: 'Publicada',
    link: 'https://marketplace.visualstudio.com/items?itemName=b3325c32-f6ee-4fad-9894-9af09cca5946.rdlc-autoheader',
  },
]

const stats = [
  { number: '2+', label: 'Proyectos públicos' },
  { number: '1', label: 'App publicada' },
  { number: '1', label: 'Extensión VS Code' },
  { number: '∞', label: 'Ganas de crear' },
]

export default function Home() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main>
      <ParticlesBackground />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">
          <div className="logo">DRIPDEV</div>
          <div className="nav-links">
            <SocialIcons />
          </div>
        </div>
      </nav>

      <section className="hero">
        <motion.p
          className="hero-label"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Hola, soy
        </motion.p>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="gradient">Álvaro Robles González</span>
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Desarrollador de aplicaciones móviles y web. Fundador de{' '}
          <strong style={{ color: 'var(--accent)' }}>DripDev</strong>.
        </motion.p>

        <motion.div
          className="hero-cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <a href="#proyectos" className="btn btn-primary">
            Ver proyectos
          </a>
          <a href="#contacto" className="btn btn-secondary">
            Contactar
          </a>
        </motion.div>

        <SocialButtons />

        <motion.a
          href="#sobre-mi"
          className="scroll-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          ↓
        </motion.a>
      </section>

      <section id="sobre-mi" className="section">
        <div className="container">
          <AnimatedSection>
            <h2 className="section-title">Sobre mí</h2>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <p className="section-subtitle">
              Apasionado por transformar ideas en aplicaciones reales que la gente use día a día.
            </p>
          </AnimatedSection>

          <div className="about-grid">
            <AnimatedSection delay={0.2} className="about-text">
              <p>
                Me llamo <span className="about-highlight">Álvaro Robles González</span> y soy
                desarrollador de aplicaciones móviles y web. Trabajo principalmente con{' '}
                <span className="about-highlight">React Native</span>,{' '}
                <span className="about-highlight">Next.js</span> y{' '}
                <span className="about-highlight">Firebase</span>.
              </p>
              <p>
                Con <strong>DripDev</strong> quiero crear apps que resuelvan problemas cotidianos
                de forma sencilla y con buen diseño. Mi primer proyecto público es{' '}
                <strong>VeoVeo</strong>, una app social para descubrir películas con amigos.
              </p>
              <p>
                Me encanta aprender nuevas tecnologías, iterar rápido y construir productos que
                aporten valor real.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <div className="stats-grid">
                {stats.map((stat) => (
                  <div key={stat.label} className="stat-card">
                    <div className="stat-number">{stat.number}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section id="proyectos" className="section" style={{ background: 'var(--bg-light)' }}>
        <div className="container">
          <AnimatedSection>
            <h2 className="section-title">Proyectos</h2>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <p className="section-subtitle">
              Estas son las apps y proyectos en los que estoy trabajando actualmente.
            </p>
          </AnimatedSection>

          <div className="projects-grid">
            {projects.map((project, index) => (
              <AnimatedSection key={project.title} delay={0.2 + index * 0.15}>
                <a
                  href={project.link}
                  target={project.link !== '#' ? '_blank' : undefined}
                  rel={project.link !== '#' ? 'noopener noreferrer' : undefined}
                  className="project-card"
                >
                  <span className={`project-status status-${project.status}`}>
                    {project.statusText}
                  </span>
                  <div className="project-icon">{project.icon}</div>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <span className="project-arrow">
                    {project.status === 'live' ? 'Visitar' : 'Más info'}
                    <span>→</span>
                  </span>
                </a>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section id="contacto" className="section contact-section">
        <div className="container">
          <AnimatedSection>
            <h2 className="section-title">¿Trabajamos juntos?</h2>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <p className="section-subtitle">
              Si tienes una idea, quieres colaborar o simplemente charlar sobre tecnología, escríbeme.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <a href="mailto:Alvaro@dripdev.dev" className="contact-email">
              Alvaro@dripdev.dev
            </a>
          </AnimatedSection>
          <AnimatedSection delay={0.3}>
            <SocialButtons />
          </AnimatedSection>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-socials">
            <a href="https://www.linkedin.com/in/%C3%A1lvaro-robles-gonz%C3%A1lez-bbb017240/" target="_blank" rel="noopener noreferrer" className="footer-link">
              LinkedIn
            </a>
            <a href="https://github.com/roblesgg" target="_blank" rel="noopener noreferrer" className="footer-link">
              GitHub
            </a>
            <a href="mailto:Alvaro@dripdev.dev" className="footer-link">
              Email
            </a>
          </div>
          <p>© {new Date().getFullYear()} Álvaro Robles González • DripDev</p>
        </div>
      </footer>
    </main>
  )
}
