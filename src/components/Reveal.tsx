'use client'

import { motion, useReducedMotion } from 'motion/react'

/**
 * Entrada al hacer scroll. Motivo: marcar el orden de lectura (jerarquía) sin
 * que todo aparezca de golpe. Una sola vez, corta y sin rebote.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const reducir = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reducir ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
