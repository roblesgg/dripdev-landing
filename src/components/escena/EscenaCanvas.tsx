'use client'

import { useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { AJUSTES, type Calidad, type Variante } from './ajustes'
import { Z_INICIO } from './Camara'
import Cinturon from './variantes/Cinturon'
import Sistema from './variantes/Sistema'
import Metamorfosis from './variantes/Metamorfosis'
import Aurora from './variantes/Aurora'
import Olas from './variantes/Olas'

interface Props {
  variante: Variante
  calidad: Calidad
  estatico: boolean
  onListo: () => void
}

/** Brillo de cada diseño: la aurora es sutil; el cinturón y la metamorfosis, intensos. */
const BRILLO: Record<Variante, { intensidad: number; umbral: number; viñeta: number }> = {
  cinturon: { intensidad: 0.95, umbral: 0.7, viñeta: 0.8 },
  sistema: { intensidad: 0.7, umbral: 0.78, viñeta: 0.75 },
  metamorfosis: { intensidad: 1.0, umbral: 0.62, viñeta: 0.8 },
  aurora: { intensidad: 0.4, umbral: 0.85, viñeta: 0.6 },
  olas: { intensidad: 0.9, umbral: 0.55, viñeta: 0.8 },
}

/** En modo estático la escena se dibuja bajo demanda: hay que pedir el repintado mientras carga. */
function PedirRepintado({ activo }: { activo: boolean }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    if (!activo) return
    const id = window.setInterval(invalidate, 400)
    const fin = window.setTimeout(() => window.clearInterval(id), 3500)
    return () => {
      window.clearInterval(id)
      window.clearTimeout(fin)
    }
  }, [activo, invalidate])
  return null
}

export default function EscenaCanvas({ variante, calidad, estatico, onListo }: Props) {
  const a = AJUSTES[calidad]
  const potente = calidad === 'alta'
  const b = BRILLO[variante]
  const props = { calidad, estatico }

  return (
    <Canvas
      key={variante}
      dpr={a.dpr}
      frameloop={estatico ? 'demand' : 'always'}
      camera={{ fov: 52, near: 0.1, far: 700, position: [0, 0, estatico ? Z_INICIO : 44] }}
      gl={{ antialias: !potente, powerPreference: 'high-performance', alpha: false }}
      eventSource={typeof document !== 'undefined' ? document.body : undefined}
      eventPrefix="client"
      onCreated={onListo}
      aria-hidden
    >
      <color attach="background" args={['#0b0910']} />

      {variante === 'cinturon' && <Cinturon {...props} />}
      {variante === 'sistema' && <Sistema {...props} />}
      {variante === 'metamorfosis' && <Metamorfosis {...props} />}
      {variante === 'aurora' && <Aurora {...props} />}
      {variante === 'olas' && <Olas {...props} />}

      <PedirRepintado activo={estatico} />

      {potente && (
        <EffectComposer multisampling={4} enableNormalPass={false}>
          <Bloom intensity={b.intensidad} luminanceThreshold={b.umbral} luminanceSmoothing={0.25} mipmapBlur radius={0.7} />
          <Vignette offset={0.22} darkness={b.viñeta} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
