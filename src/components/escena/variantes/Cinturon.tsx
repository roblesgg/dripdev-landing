'use client'

import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Asteroides } from '../Asteroides'
import { Camara } from '../Camara'
import { LogoParticulas } from '../LogoParticulas'
import { Cielo, Meteoro, Polvo } from '../Ambiente'
import { AJUSTES, type PropsVariante } from '../ajustes'

const SOL: [number, number, number] = [0, 0, -1]

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

export default function Cinturon({ calidad, estatico }: PropsVariante) {
  const a = AJUSTES[calidad]
  const potente = calidad === 'alta'
  return (
    <>
      <Cielo sol={SOL} />
      <ambientLight intensity={0.55} color="#8a7bd0" />
      <directionalLight position={[8, 5, -10]} intensity={4.2} color="#ffa965" />
      <directionalLight position={[-7, -3, 9]} intensity={1.3} color="#8f72eb" />
      {!estatico && <Linterna />}

      <Asteroides cantidad={a.asteroides} estatico={estatico} />
      <LogoParticulas puntos={a.puntosLogo} estatico={estatico} alturaRelativa={potente ? 0.15 : 0.27} />
      <Polvo polvo={a.polvo} estrellas={a.estrellas} />
      {!estatico && <Meteoro desfase={3.5} />}
      {!estatico && potente && <Meteoro desfase={8} />}

      <Camara estatico={estatico} />
    </>
  )
}
