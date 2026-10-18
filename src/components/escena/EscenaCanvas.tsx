'use client'

import { useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { Asteroides } from './Asteroides'
import { Camara, Z_INICIO } from './Camara'
import { LogoParticulas } from './LogoParticulas'
import { Cielo, Meteoro, Polvo } from './Ambiente'

export type Calidad = 'alta' | 'media'

interface Props {
  calidad: Calidad
  estatico: boolean
  onListo: () => void
}

const AJUSTES = {
  alta: { asteroides: 900, puntosLogo: 70000, polvo: 2600, estrellas: 1800, dpr: [1, 1.75] as [number, number] },
  media: { asteroides: 270, puntosLogo: 26000, polvo: 800, estrellas: 900, dpr: [1, 1.4] as [number, number] },
}

/** Luz que sigue al cursor: ilumina las rocas que quedan cerca, como una linterna. */
function Linterna() {
  const luz = useMemo(() => new THREE.PointLight('#ffd7b0', 70, 0, 2), [])
  const dir = useMemo(() => new THREE.Vector3(), [])

  useFrame((state) => {
    dir.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera).sub(state.camera.position).normalize()
    luz.position.copy(state.camera.position).addScaledVector(dir, 9)
  })

  return <primitive object={luz} />
}

/** En modo estático la escena se dibuja bajo demanda: hay que pedir el repintado al cargar el rótulo. */
function PedirRepintado({ activo }: { activo: boolean }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    if (!activo) return
    const id = window.setInterval(invalidate, 400)
    const fin = window.setTimeout(() => window.clearInterval(id), 3000)
    return () => {
      window.clearInterval(id)
      window.clearTimeout(fin)
    }
  }, [activo, invalidate])
  return null
}

export default function EscenaCanvas({ calidad, estatico, onListo }: Props) {
  const a = AJUSTES[calidad]
  const potente = calidad === 'alta'

  return (
    <Canvas
      dpr={a.dpr}
      frameloop={estatico ? 'demand' : 'always'}
      camera={{ fov: 52, near: 0.1, far: 500, position: [0, 0, estatico ? Z_INICIO : 44] }}
      gl={{ antialias: !potente, powerPreference: 'high-performance', alpha: false }}
      eventSource={typeof document !== 'undefined' ? document.body : undefined}
      eventPrefix="client"
      onCreated={onListo}
      aria-hidden
    >
      <color attach="background" args={['#0b0910']} />
      <Cielo />

      <ambientLight intensity={0.5} color="#8a7bd0" />
      <directionalLight position={[8, 5, -10]} intensity={4.2} color="#ffa965" />
      <directionalLight position={[-7, -3, 9]} intensity={1.1} color="#8f72eb" />
      {!estatico && <Linterna />}

      <Asteroides cantidad={a.asteroides} estatico={estatico} />
      <LogoParticulas
        puntos={a.puntosLogo}
        estatico={estatico}
        alturaRelativa={calidad === 'alta' ? 0.15 : 0.27}
      />
      <Polvo polvo={a.polvo} estrellas={a.estrellas} />
      {!estatico && <Meteoro desfase={3.5} />}
      {!estatico && potente && <Meteoro desfase={8} />}

      <Camara estatico={estatico} />
      <PedirRepintado activo={estatico} />

      {potente && (
        <EffectComposer multisampling={4} enableNormalPass={false}>
          <Bloom intensity={0.95} luminanceThreshold={0.7} luminanceSmoothing={0.25} mipmapBlur radius={0.7} />
          <Vignette offset={0.22} darkness={0.8} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
