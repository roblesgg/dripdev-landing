'use client'

import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export const Z_INICIO = 6.5
const RECORRIDO = 118
const INTRO = 2.9

const { damp, clamp } = THREE.MathUtils
const suave = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * La cámara viaja por el túnel de asteroides al hacer scroll, sigue al cursor con inercia
 * y arranca con un travelling de entrada. Lee window.scrollY dentro del bucle de render:
 * sin listeners de scroll y sin estado de React, así no hay renders de más.
 */
export function Camara({ estatico }: { estatico: boolean }) {
  const roll = useMemo(() => ({ v: 0 }), [])

  useFrame((state, dt) => {
    const cam = state.camera

    if (estatico) {
      cam.position.set(0, 0, Z_INICIO)
      cam.lookAt(0, 0, -20)
      return
    }

    const t = state.clock.elapsedTime
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    const p = clamp(window.scrollY / max, 0, 1)
    const intro = 1 - suave(clamp(t / INTRO, 0, 1))

    const zObjetivo = Z_INICIO - p * RECORRIDO + intro * 38
    cam.position.z = damp(cam.position.z, zObjetivo, 4.5, dt)
    cam.position.x = damp(cam.position.x, state.pointer.x * 0.55, 2.4, dt)
    cam.position.y = damp(cam.position.y, state.pointer.y * 0.35 + Math.sin(t * 0.3) * 0.06, 2.4, dt)

    cam.lookAt(cam.position.x * 0.25, cam.position.y * 0.25, cam.position.z - 12)
    // Alabeo suave con el avance, como un caza en el cinturón
    roll.v = damp(roll.v, p * 0.7 - state.pointer.x * 0.03, 2, dt)
    cam.rotateZ(roll.v)

    // El velo oscuro sube con el scroll para que el texto se lea sobre las rocas
    const velo = clamp(window.scrollY / (window.innerHeight * 0.9), 0, 1) * 0.5
    document.documentElement.style.setProperty('--velo', velo.toFixed(3))
  })

  return null
}
