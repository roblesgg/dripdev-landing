'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mulberry32 } from './utiles'
import { Z_INICIO } from './Camara'

const ANCHO_LOGO = 6.6

const VERTICE = /* glsl */ `
  uniform float uTime;
  uniform float uAssemble;
  uniform float uScatter;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec3 uMouse;
  attribute vec3 aTarget;
  attribute vec4 aSeed;
  attribute float aGrad;
  varying vec3 vColor;
  varying float vAlpha;

  // Degradado de marca: melocotón, coral, violeta
  vec3 paleta(float t) {
    vec3 a = vec3(0.992, 0.714, 0.361);
    vec3 b = vec3(0.898, 0.494, 0.537);
    vec3 c = vec3(0.561, 0.447, 0.922);
    return t < 0.5 ? mix(a, b, t * 2.0) : mix(b, c, (t - 0.5) * 2.0);
  }

  void main() {
    // Origen: una nube lejana y alargada hacia el fondo, de donde vienen los puntos
    vec3 dir = normalize(aSeed.xyz - 0.5 + 1e-4);
    vec3 start = dir * (9.0 + aSeed.w * 14.0);
    start.z -= 30.0 * (0.4 + aSeed.x);

    // Cada punto llega en su momento: escalonado por su semilla
    float t = clamp((uAssemble - aSeed.x * 0.42) / 0.58, 0.0, 1.0);
    float e = 1.0 - pow(1.0 - t, 4.0);

    vec3 p = mix(start, aTarget, e);

    // Turbulencia mientras viaja, y una respiración casi imperceptible después
    float resto = 1.0 - e;
    p += vec3(
      sin(uTime * 1.7 + aSeed.y * 30.0),
      cos(uTime * 1.3 + aSeed.z * 30.0),
      sin(uTime * 1.1 + aSeed.w * 30.0)
    ) * resto * 0.9;
    p += vec3(
      sin(uTime * 1.2 + aSeed.x * 60.0),
      cos(uTime * 1.0 + aSeed.y * 60.0),
      sin(uTime * 0.9 + aSeed.z * 60.0)
    ) * 0.012;

    // El cursor aparta los puntos cercanos y los enciende
    vec2 dm = p.xy - uMouse.xy;
    float d = length(dm);
    float f = smoothstep(1.3, 0.0, d) * (1.0 - uScatter);
    p.xy += normalize(dm + 1e-5) * f * 0.75;
    p.z += f * 0.6;

    // Con el scroll, el rótulo se deshace y los puntos pasan junto a la cámara
    float s = uScatter * uScatter;
    p += (aSeed.xyz - 0.5) * vec3(26.0, 16.0, 40.0) * s;
    p.z += 30.0 * s;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float tam = uSize * (0.65 + aSeed.w * 0.9) * (1.0 + f * 1.4);
    gl_PointSize = min(64.0, tam * uPixelRatio * (300.0 / max(0.1, -mv.z)));

    vec3 col = paleta(clamp(aGrad, 0.0, 1.0));
    col = mix(col, vec3(1.0, 0.94, 0.86), f * 0.8);
    // Brillo contenido: con 70.000 puntos aditivos solapados, más intensidad lo quema todo a blanco
    vColor = col * (0.74 + f * 1.5);
    vAlpha = smoothstep(0.0, 0.25, t) * (1.0 - smoothstep(0.55, 1.0, uScatter));
  }
`

const FRAGMENTO = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(vColor * a, a * vAlpha * 0.8);
  }
`

interface Props {
  puntos: number
  /** Sin movimiento: el rótulo aparece ya ensamblado y no reacciona al cursor ni al scroll. */
  estatico: boolean
  /** Altura a la que flota el rótulo, como fracción de la altura visible. */
  alturaRelativa: number
}

export function LogoParticulas({ puntos, estatico, alturaRelativa }: Props) {
  const [datos, setDatos] = useState<{ aspecto: number; coords: Uint16Array } | null>(null)
  const material = useRef<THREE.ShaderMaterial>(null)
  const grupo = useRef<THREE.Group>(null)
  const vistoRaton = useRef(false)
  const raton = useMemo(() => new THREE.Vector3(), [])
  const dir = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    let cancelado = false
    fetch('/logo-puntos.bin')
      .then((r) => r.arrayBuffer())
      .then((buf) => {
        if (cancelado) return
        const vista = new DataView(buf)
        const aspecto = vista.getFloat32(0, true)
        const n = vista.getUint32(4, true)
        setDatos({ aspecto, coords: new Uint16Array(buf, 8, n * 2) })
      })
      .catch(() => {})
    return () => {
      cancelado = true
    }
  }, [])

  const geometria = useMemo(() => {
    if (!datos) return null
    const n = Math.min(puntos, datos.coords.length / 2)
    const alto = ANCHO_LOGO / datos.aspecto
    const rnd = mulberry32(42)

    const objetivo = new Float32Array(n * 3)
    const semilla = new Float32Array(n * 4)
    const grad = new Float32Array(n)

    for (let i = 0; i < n; i++) {
      const nx = datos.coords[i * 2] / 65535
      const ny = datos.coords[i * 2 + 1] / 65535
      objetivo[i * 3] = (nx - 0.5) * ANCHO_LOGO
      objetivo[i * 3 + 1] = (0.5 - ny) * alto
      objetivo[i * 3 + 2] = (rnd() - 0.5) * 0.16 // un poco de grosor
      semilla[i * 4] = rnd()
      semilla[i * 4 + 1] = rnd()
      semilla[i * 4 + 2] = rnd()
      semilla[i * 4 + 3] = rnd()
      // El degradado corre en diagonal, como la tinta del rótulo
      grad[i] = Math.min(1, Math.max(0, nx * 0.82 + (1 - ny) * 0.18))
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(objetivo, 3))
    g.setAttribute('aTarget', new THREE.BufferAttribute(objetivo, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(semilla, 4))
    g.setAttribute('aGrad', new THREE.BufferAttribute(grad, 1))
    return g
  }, [datos, puntos])

  const uniformes = useMemo(
    () => ({
      uTime: { value: 0 },
      uAssemble: { value: estatico ? 1 : 0 },
      uScatter: { value: 0 },
      uSize: { value: 0.05 },
      uPixelRatio: { value: 1 },
      uMouse: { value: new THREE.Vector3(99, 99, 0) },
    }),
    [estatico],
  )

  useEffect(
    () => () => {
      geometria?.dispose()
    },
    [geometria],
  )

  useFrame((state) => {
    const u = material.current?.uniforms
    const g = grupo.current
    if (!u || !g) return

    // Encuadre calculado con la cámara EN REPOSO (z = Z_INICIO), no con la actual: durante
    // el travelling de entrada la cámara está lejos y el viewport de R3F sale enorme.
    const cam = state.camera as THREE.PerspectiveCamera
    const altoVisible = 2 * Z_INICIO * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2))
    const anchoVisible = altoVisible * (state.size.width / state.size.height)
    // Responsive: en móvil el rótulo ocupa ~86% del ancho; en escritorio, un 66%
    const escala = Math.min(1.15, (anchoVisible * (anchoVisible < 6 ? 0.86 : 0.66)) / ANCHO_LOGO)
    g.scale.setScalar(escala)
    g.position.y = altoVisible * alturaRelativa
    u.uPixelRatio.value = state.gl.getPixelRatio()
    u.uSize.value = 0.05 * Math.max(0.6, escala)

    if (estatico) return

    const t = state.clock.elapsedTime
    u.uTime.value = t
    // Entrada: tras una breve pausa, los puntos viajan al rótulo con suavidad
    const k = Math.min(1, Math.max(0, (t - 0.5) / 3.6))
    u.uAssemble.value = 1 - Math.pow(1 - k, 3)

    // Scroll: el rótulo se deshace durante el primer viewport
    const s = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.85)))
    u.uScatter.value = s * s * (3 - 2 * s)

    // El cursor, proyectado al plano del rótulo (z = 0) y pasado al espacio local.
    // Hasta que no se mueve el ratón, R3F da (0, 0): el centro de la pantalla. Eso no es un
    // cursor, así que se aparta lejos para que no empuje los puntos del centro del rótulo.
    if (state.pointer.x !== 0 || state.pointer.y !== 0) vistoRaton.current = true
    if (!vistoRaton.current) {
      u.uMouse.value.set(99, 99, 0)
    } else {
      dir.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera).sub(state.camera.position).normalize()
      const dist = -state.camera.position.z / (dir.z || -1e-5)
      raton.copy(state.camera.position).addScaledVector(dir, dist)
      u.uMouse.value.set((raton.x - g.position.x) / escala, (raton.y - g.position.y) / escala, 0)
    }
  })

  if (!geometria) return null

  return (
    <group ref={grupo}>
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
    </group>
  )
}
