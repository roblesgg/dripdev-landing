'use client'

import { useRef } from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'

const wrap = (min: number, max: number, v: number) => {
  const rango = max - min
  return ((((v - min) % rango) + rango) % rango) + min
}

/**
 * La cinta de nombres corre sola y se acelera, e incluso da la vuelta, según la velocidad
 * con la que se hace scroll. Motivo: da la sensación de que la página tiene inercia.
 */
export function Cinta({ nombres }: { nombres: string[] }) {
  const reducir = useReducedMotion()
  const base = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocidad = useVelocity(scrollY)
  const suave = useSpring(velocidad, { damping: 50, stiffness: 400 })
  const factor = useTransform(suave, [0, 1500], [0, 5], { clamp: false })
  const direccion = useRef(1)

  const x = useTransform(base, (v) => `${wrap(-25, 0, v)}%`)

  useAnimationFrame((_, dt) => {
    if (reducir) return
    let mueve = direccion.current * 1.6 * (dt / 1000)
    const f = factor.get()
    if (f < 0) direccion.current = -1
    else if (f > 0) direccion.current = 1
    mueve += direccion.current * mueve * Math.abs(f)
    base.set(base.get() - mueve)
  })

  const tira = [...nombres, ...nombres]
  return (
    <div className="pl-cinta" aria-hidden>
      <motion.div className="pl-cinta-pista" style={{ x }}>
        {[0, 1].map((r) => (
          <span key={r} className="pl-cinta-grupo">
            {tira.map((n, i) => (
              <span key={`${r}-${i}`} className="pl-cinta-nombre">
                {n}
                <span className="pl-cinta-punto" />
              </span>
            ))}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
