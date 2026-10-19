'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { crearTexturaPunto, mulberry32 } from './utiles'

/**
 * Cielo: noche tintada de violeta y, muy al fondo del túnel, un sol lejano que sube y baja
 * de intensidad como una brasa. Es una esfera invertida con un degradado: casi gratis.
 */
export function Cielo({
  sol = [0, 0, -1],
  color = '#ff8f3d',
  fuerza = 1,
}: {
  /** Hacia dónde brilla el sol lejano (no hace falta normalizar). */
  sol?: [number, number, number]
  color?: string
  fuerza?: number
}) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const uniformes = useMemo(
    () => ({
      uTime: { value: 0 },
      uSol: { value: new THREE.Vector3(...sol).normalize() },
      uColor: { value: new THREE.Color(color) },
      uFuerza: { value: fuerza },
    }),
    [sol, color, fuerza],
  )

  useFrame((state) => {
    if (material.current) material.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <mesh frustumCulled={false} renderOrder={-10}>
      <sphereGeometry args={[260, 32, 24]} />
      <shaderMaterial
        ref={material}
        side={THREE.BackSide}
        depthWrite={false}
        toneMapped={false}
        uniforms={uniformes}
        vertexShader={/* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          uniform float uTime;
          uniform vec3 uSol;
          uniform vec3 uColor;
          uniform float uFuerza;
          varying vec3 vDir;
          void main() {
            vec3 base = vec3(0.043, 0.035, 0.063);
            float haciaFondo = max(dot(normalize(vDir), uSol), 0.0);
            float pulso = 0.92 + 0.08 * sin(uTime * 0.6);
            vec3 sol = uColor * pow(haciaFondo, 34.0) * 1.15 * pulso * uFuerza;
            vec3 halo = vec3(0.56, 0.45, 0.92) * pow(haciaFondo, 5.0) * 0.14;
            float horizonte = smoothstep(-0.6, 0.9, vDir.y) * 0.025;
            gl_FragColor = vec4(base + sol + halo + horizonte, 1.0);
          }
        `}
      />
    </mesh>
  )
}

/** Polvo incandescente dentro del túnel y estrellas lejanas. */
export function Polvo({
  polvo,
  estrellas,
  zMin = -130,
  radio: radioMax = 17,
}: {
  polvo: number
  estrellas: number
  /** Hasta dónde se extiende el polvo por delante de la cámara. */
  zMin?: number
  radio?: number
}) {
  const grupo = useRef<THREE.Group>(null)

  const { posPolvo, colPolvo, posEstrellas } = useMemo(() => {
    const rnd = mulberry32(5150)
    const posPolvo = new Float32Array(polvo * 3)
    const colPolvo = new Float32Array(polvo * 3)
    const c = new THREE.Color()
    for (let i = 0; i < polvo; i++) {
      const ang = rnd() * Math.PI * 2
      const radio = 2 + Math.pow(rnd(), 0.8) * radioMax
      posPolvo[i * 3] = Math.cos(ang) * radio * 1.35
      posPolvo[i * 3 + 1] = Math.sin(ang) * radio * 0.85
      posPolvo[i * 3 + 2] = zMin + rnd() * (10 - zMin)
      // Brasas: del melocotón al coral, alguna violeta
      const t = rnd()
      if (t < 0.7) c.set('#FDB65C').lerp(new THREE.Color('#FB944E'), rnd())
      else if (t < 0.9) c.set('#E57E89')
      else c.set('#8F72EB')
      c.multiplyScalar(1.6)
      colPolvo.set([c.r, c.g, c.b], i * 3)
    }
    const posEstrellas = new Float32Array(estrellas * 3)
    for (let i = 0; i < estrellas; i++) {
      const u = rnd() * 2 - 1
      const th = rnd() * Math.PI * 2
      const r = 180 + rnd() * 60
      const s = Math.sqrt(1 - u * u)
      posEstrellas.set([r * s * Math.cos(th), r * u, r * s * Math.sin(th)], i * 3)
    }
    return { posPolvo, colPolvo, posEstrellas }
  }, [polvo, estrellas, zMin, radioMax])

  const punto = useMemo(() => crearTexturaPunto(), [])

  useFrame((state) => {
    if (grupo.current) grupo.current.rotation.z = state.clock.elapsedTime * 0.012
  })

  return (
    <group ref={grupo}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[posPolvo, 3]} />
          <bufferAttribute attach="attributes-color" args={[colPolvo, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={punto}
          size={0.12}
          vertexColors
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          toneMapped={false}
        />
      </points>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[posEstrellas, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={punto}
          size={2}
          color="#cfc7e6"
          transparent
          opacity={0.75}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  )
}

/**
 * Meteoro: una raya brillante que cruza la pantalla de vez en cuando.
 * Es un solo objeto reciclado, con un reposo largo entre pasadas.
 */
export function Meteoro({ desfase }: { desfase: number }) {
  const malla = useRef<THREE.Mesh>(null)
  const estado = useRef({ t0: desfase, x: 0, y: 0, vx: 0, vy: 0, z: -9, activo: false, espera: desfase })

  useFrame((state, dt) => {
    const m = malla.current
    if (!m) return
    const e = estado.current
    if (!e.activo) {
      e.espera -= dt
      m.visible = false
      if (e.espera <= 0) {
        // Entra por arriba a la derecha y cruza hacia abajo a la izquierda
        e.x = 12 + Math.random() * 6
        e.y = 5 + Math.random() * 4
        e.vx = -(22 + Math.random() * 10)
        e.vy = -(8 + Math.random() * 6)
        e.z = state.camera.position.z - (9 + Math.random() * 6)
        m.rotation.z = Math.atan2(e.vy, e.vx)
        e.activo = true
      }
      return
    }
    e.x += e.vx * dt
    e.y += e.vy * dt
    m.visible = true
    m.position.set(e.x + state.camera.position.x, e.y + state.camera.position.y, e.z)
    if (e.x < -22 || e.y < -12) {
      e.activo = false
      e.espera = 5 + Math.random() * 7
    }
  })

  return (
    <mesh ref={malla} visible={false} frustumCulled={false}>
      <boxGeometry args={[3.2, 0.028, 0.028]} />
      <meshBasicMaterial color={[5.2, 3.1, 1.6]} toneMapped={false} />
    </mesh>
  )
}
