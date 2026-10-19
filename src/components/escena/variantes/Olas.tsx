'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Cielo } from '../Ambiente'
import { LogoParticulas } from '../LogoParticulas'
import { AJUSTES, type PropsVariante } from '../ajustes'
import { Z_INICIO } from '../Camara'
import { progresoScroll, ponerVelo } from '../utiles'

const VERTICE = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  attribute vec2 aGrid;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float x = (aGrid.x - 0.5) * 76.0;
    float z = -aGrid.y * 170.0 + 8.0;
    float amp = 1.0 + uScroll * 1.9;

    float w = sin(x * 0.16 + uTime * 0.6) * 1.1
            + sin(z * 0.12 - uTime * 0.8) * 1.3
            + sin((x + z) * 0.07 + uTime * 0.35) * 1.9
            + sin(x * 0.45 - z * 0.3 + uTime * 1.1) * 0.35;
    float y = w * amp - 4.0;

    // Una onda circular nace bajo el cursor y se va apagando
    float d = distance(vec2(x, z), uMouse);
    y += sin(d * 1.6 - uTime * 4.0) * exp(-d * 0.18) * 0.9;

    vec4 mv = modelViewMatrix * vec4(x, y, z, 1.0);
    gl_Position = projectionMatrix * mv;
    float dist = -mv.z;
    gl_PointSize = clamp(uPixelRatio * (190.0 / dist), 1.0, 7.0);

    float h = clamp((w * amp + 3.0) / 8.0, 0.0, 1.0);
    vec3 base = mix(vec3(0.56, 0.45, 0.92), vec3(0.90, 0.49, 0.54), h);
    vec3 cresta = mix(base, vec3(0.99, 0.71, 0.36), smoothstep(0.6, 1.0, h));
    vColor = cresta * (0.5 + h * 1.1);
    vAlpha = (1.0 - smoothstep(40.0, 150.0, dist)) * smoothstep(1.0, 6.0, dist);
  }
`

const FRAGMENTO = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.1, d);
    gl_FragColor = vec4(vColor * a, a * vAlpha);
  }
`

const SOL: [number, number, number] = [0, 0.12, -1]

export default function Olas({ calidad, estatico }: PropsVariante) {
  const a = AJUSTES[calidad]
  const [gx, gz] = a.rejilla
  const material = useRef<THREE.ShaderMaterial>(null)
  const progreso = useRef(0)
  const dir = useMemo(() => new THREE.Vector3(), [])

  const geometria = useMemo(() => {
    const n = gx * gz
    const grid = new Float32Array(n * 2)
    for (let j = 0; j < gz; j++) {
      for (let i = 0; i < gx; i++) {
        // Un poco de jitter para que no se vea la rejilla
        const k = (j * gx + i) * 2
        grid[k] = (i + (Math.sin(i * 12.9898 + j * 78.233) * 0.5 + 0.5) * 0.6) / gx
        grid[k + 1] = (j + (Math.sin(i * 39.346 + j * 11.135) * 0.5 + 0.5) * 0.6) / gz
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    g.setAttribute('aGrid', new THREE.BufferAttribute(grid, 2))
    return g
  }, [gx, gz])
  useEffect(() => () => geometria.dispose(), [geometria])

  const uniformes = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPixelRatio: { value: 1 },
      uMouse: { value: new THREE.Vector2(999, 999) },
    }),
    [],
  )

  useFrame((state, dt) => {
    const u = material.current?.uniforms
    const cam = state.camera
    if (!u) return
    u.uPixelRatio.value = state.gl.getPixelRatio()

    if (estatico) {
      cam.position.set(0, 1.4, Z_INICIO)
      cam.lookAt(0, -2, -30)
      return
    }

    const t = state.clock.elapsedTime
    u.uTime.value = t
    progreso.current = THREE.MathUtils.damp(progreso.current, progresoScroll(), 3, dt)
    const p = progreso.current
    u.uScroll.value = p

    const intro = 1 - Math.min(1, t / 2.8)
    cam.position.x = THREE.MathUtils.damp(cam.position.x, state.pointer.x * 1.2, 2.4, dt)
    cam.position.y = THREE.MathUtils.damp(cam.position.y, 1.4 + p * 9 + state.pointer.y * 0.5 + intro * 4, 3, dt)
    cam.position.z = THREE.MathUtils.damp(cam.position.z, Z_INICIO - p * 46 + intro * 10, 3, dt)
    cam.lookAt(cam.position.x * 0.3, -2 - p * 3, cam.position.z - 30)
    ponerVelo(0.36)

    // El cursor, proyectado al plano del mar
    if (state.pointer.x !== 0 || state.pointer.y !== 0) {
      dir.set(state.pointer.x, state.pointer.y, 0.5).unproject(cam).sub(cam.position).normalize()
      if (dir.y < -0.01) {
        const k = (-4 - cam.position.y) / dir.y
        u.uMouse.value.set(cam.position.x + dir.x * k, cam.position.z + dir.z * k)
      }
    }
  })

  return (
    <>
      <Cielo sol={SOL} color="#ffa56b" fuerza={0.85} />
      <points geometry={geometria} frustumCulled={false}>
        <shaderMaterial
          ref={material}
          vertexShader={VERTICE}
          fragmentShader={FRAGMENTO}
          uniforms={uniformes}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
      <LogoParticulas puntos={a.puntosLogo} estatico={estatico} alturaRelativa={calidad === 'alta' ? 0.2 : 0.3} />
    </>
  )
}
