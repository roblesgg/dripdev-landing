'use client'

import { useEffect, useRef } from 'react'

interface Estrella {
  x: number
  y: number
  z: number
  r: number
  fase: number
  vel: number
}

/**
 * Campo de estrellas plano y muy tenue, fijo detrás de toda la página.
 * Tres capas de profundidad: las lejanas casi no se mueven al hacer scroll, las cercanas más.
 */
export function Estrellas() {
  const lienzo = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = lienzo.current
    const ctx = el?.getContext('2d')
    if (!el || !ctx) return

    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let ancho = 0
    let alto = 0
    let estrellas: Estrella[] = []
    let raf = 0
    let scroll = 0
    let rx = 0
    let ry = 0
    let objX = 0
    let objY = 0
    let fugaT = 6 + Math.random() * 6
    let fuga: { x: number; y: number; vx: number; vy: number; vida: number } | null = null

    const preparar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      ancho = window.innerWidth
      alto = window.innerHeight
      el.width = ancho * dpr
      el.height = alto * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.min(230, Math.round((ancho * alto) / 8500))
      estrellas = Array.from({ length: n }, () => {
        const z = Math.random() ** 1.6
        return {
          x: Math.random() * ancho,
          y: Math.random() * alto,
          z,
          r: 0.35 + z * 1.05,
          fase: Math.random() * Math.PI * 2,
          vel: 0.4 + Math.random() * 1.1,
        }
      })
    }

    const dibujar = (t: number, dt: number) => {
      ctx.clearRect(0, 0, ancho, alto)
      rx += (objX - rx) * 0.04
      ry += (objY - ry) * 0.04
      for (const s of estrellas) {
        const py = (((s.y - scroll * (0.04 + s.z * 0.22) + ry * s.z * 14) % alto) + alto) % alto
        const px = (((s.x + rx * s.z * 18) % ancho) + ancho) % ancho
        const brillo = reducir ? 0.5 : 0.55 + 0.45 * Math.sin(t * 0.001 * s.vel + s.fase)
        ctx.globalAlpha = (0.14 + s.z * 0.5) * brillo
        ctx.fillStyle = '#f1efe9'
        ctx.beginPath()
        ctx.arc(px, py, s.r, 0, Math.PI * 2)
        ctx.fill()
      }

      if (!reducir) {
        fugaT -= dt / 1000
        if (fugaT <= 0 && !fuga) {
          fuga = { x: Math.random() * ancho * 0.8, y: Math.random() * alto * 0.4, vx: 520, vy: 230, vida: 0 }
          fugaT = 9 + Math.random() * 9
        }
        if (fuga) {
          fuga.vida += dt / 1000
          fuga.x += fuga.vx * (dt / 1000)
          fuga.y += fuga.vy * (dt / 1000)
          const a = Math.max(0, 1 - fuga.vida / 0.9)
          ctx.globalAlpha = a * 0.55
          ctx.strokeStyle = '#f1efe9'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(fuga.x, fuga.y)
          ctx.lineTo(fuga.x - fuga.vx * 0.16, fuga.y - fuga.vy * 0.16)
          ctx.stroke()
          if (fuga.vida > 0.9) fuga = null
        }
      }
      ctx.globalAlpha = 1
    }

    let previo = performance.now()
    const bucle = (t: number) => {
      const dt = Math.min(64, t - previo)
      previo = t
      scroll = window.scrollY
      dibujar(t, dt)
      raf = requestAnimationFrame(bucle)
    }

    const alMover = (e: PointerEvent) => {
      objX = (e.clientX / ancho) * 2 - 1
      objY = (e.clientY / alto) * 2 - 1
    }
    const visibilidad = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden && !reducir) {
        previo = performance.now()
        raf = requestAnimationFrame(bucle)
      }
    }

    preparar()
    if (reducir) {
      scroll = window.scrollY
      dibujar(0, 0)
    } else {
      raf = requestAnimationFrame(bucle)
    }
    window.addEventListener('resize', preparar)
    window.addEventListener('pointermove', alMover, { passive: true })
    document.addEventListener('visibilitychange', visibilidad)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', preparar)
      window.removeEventListener('pointermove', alMover)
      document.removeEventListener('visibilitychange', visibilidad)
    }
  }, [])

  return <canvas ref={lienzo} className="pl-estrellas" aria-hidden />
}
