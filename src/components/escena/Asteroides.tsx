'use client'

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { crearGeometriaRoca, crearTexturaRoca, mulberry32 } from './utiles'

interface Props {
  cantidad: number
  /** Escena sin movimiento: se coloca una vez y no se anima. */
  estatico: boolean
}

const FORMAS = 3
/** Recorrido del cinturón a lo largo del eje Z, por delante de la cámara. */
const Z_CERCA = 9
const Z_LEJOS = -130

/**
 * El cinturón: miles de rocas repartidas en un túnel alrededor del eje por el que viaja la cámara.
 * Tres geometrías distintas, una malla instanciada por cada una (3 llamadas de dibujo en total).
 */
export function Asteroides({ cantidad, estatico }: Props) {
  const mallas = useRef<(THREE.InstancedMesh | null)[]>([])

  const { geometrias, material, datos, porForma } = useMemo(() => {
    const geometrias = Array.from({ length: FORMAS }, (_, i) => crearGeometriaRoca(11 + i * 97))
    const tex = crearTexturaRoca(256)
    const material = new THREE.MeshStandardMaterial({
      map: tex,
      bumpMap: tex,
      bumpScale: 3.2,
      roughness: 0.93,
      metalness: 0.05,
      flatShading: true,
    })

    const rnd = mulberry32(20261018)
    const porForma = Math.ceil(cantidad / FORMAS)
    const datos = Array.from({ length: FORMAS }, () => ({
      pos: new Float32Array(porForma * 3),
      rot: new Float32Array(porForma * 3),
      vel: new Float32Array(porForma * 3),
      esc: new Float32Array(porForma),
      col: new Float32Array(porForma * 3),
    }))

    const color = new THREE.Color()
    for (let f = 0; f < FORMAS; f++) {
      const d = datos[f]
      for (let i = 0; i < porForma; i++) {
        // Posición: túnel con hueco central, más denso cerca del borde del hueco.
        let x = 0, y = 0, z = 0
        for (let intento = 0; intento < 12; intento++) {
          const ang = rnd() * Math.PI * 2
          const radio = 3.1 + Math.pow(rnd(), 1.55) * 15
          x = Math.cos(ang) * radio * 1.35 // algo más ancho que alto: la pantalla es apaisada
          y = Math.sin(ang) * radio * 0.85
          z = Z_LEJOS + rnd() * (Z_CERCA - Z_LEJOS)
          // Zona del logo: ninguna roca entre la cámara y el rótulo, ni pegada a él
          const cercaDelLogo = z > -3 && z < 9
          const tapaLogo = Math.abs(x) < 9 && y > -3.2 && y < 5
          if (!(cercaDelLogo && tapaLogo)) break
        }
        d.pos.set([x, y, z], i * 3)
        d.rot.set([rnd() * 6.28, rnd() * 6.28, rnd() * 6.28], i * 3)
        d.vel.set([(rnd() - 0.5) * 0.35, (rnd() - 0.5) * 0.35, (rnd() - 0.5) * 0.35], i * 3)
        // Tamaños con cola larga: muchas rocas pequeñas, pocas enormes
        d.esc[i] = 0.1 + Math.pow(rnd(), 3.4) * 2.1
        // Tintes: gris cálido, gris violáceo y alguna roca rojiza
        const t = rnd()
        if (t < 0.55) color.setHSL(0.07 + rnd() * 0.03, 0.08 + rnd() * 0.14, 0.34 + rnd() * 0.18)
        else if (t < 0.88) color.setHSL(0.73 + rnd() * 0.04, 0.06 + rnd() * 0.12, 0.3 + rnd() * 0.16)
        else color.setHSL(0.03 + rnd() * 0.03, 0.28 + rnd() * 0.18, 0.28 + rnd() * 0.14)
        d.col.set([color.r, color.g, color.b], i * 3)
      }
    }
    return { geometrias, material, datos, porForma }
  }, [cantidad])

  const ficha = useMemo(() => new THREE.Object3D(), [])

  const colocar = (tiempo: number) => {
    for (let f = 0; f < FORMAS; f++) {
      const malla = mallas.current[f]
      if (!malla) continue
      const d = datos[f]
      for (let i = 0; i < porForma; i++) {
        const k = i * 3
        ficha.position.set(d.pos[k], d.pos[k + 1], d.pos[k + 2])
        ficha.rotation.set(
          d.rot[k] + d.vel[k] * tiempo,
          d.rot[k + 1] + d.vel[k + 1] * tiempo,
          d.rot[k + 2] + d.vel[k + 2] * tiempo,
        )
        ficha.scale.setScalar(d.esc[i])
        ficha.updateMatrix()
        malla.setMatrixAt(i, ficha.matrix)
      }
      malla.instanceMatrix.needsUpdate = true
    }
  }

  // Colores de instancia y primera colocación
  useLayoutEffect(() => {
    const c = new THREE.Color()
    for (let f = 0; f < FORMAS; f++) {
      const malla = mallas.current[f]
      if (!malla) continue
      const d = datos[f]
      for (let i = 0; i < porForma; i++) {
        c.setRGB(d.col[i * 3], d.col[i * 3 + 1], d.col[i * 3 + 2])
        malla.setColorAt(i, c)
      }
      if (malla.instanceColor) malla.instanceColor.needsUpdate = true
    }
    colocar(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datos])

  useFrame((state) => {
    if (estatico) return
    colocar(state.clock.elapsedTime)
  })

  // Liberar memoria de GPU al desmontar
  useEffect(
    () => () => {
      geometrias.forEach((g) => g.dispose())
      material.map?.dispose()
      material.dispose()
    },
    [geometrias, material],
  )

  return (
    <group>
      {geometrias.map((g, f) => (
        <instancedMesh
          key={f}
          ref={(m) => {
            mallas.current[f] = m
          }}
          args={[g, material, porForma]}
          frustumCulled={false}
        />
      ))}
    </group>
  )
}
