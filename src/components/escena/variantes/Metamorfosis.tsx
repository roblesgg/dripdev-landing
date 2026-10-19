'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Cielo, Polvo } from '../Ambiente'
import { AJUSTES, type PropsVariante } from '../ajustes'
import { Z_INICIO } from '../Camara'
import { mulberry32, crearMapaFilas, ponerVelo } from '../utiles'

const VERTICE = /* glsl */ `
  uniform float uMix;
  uniform float uTime;
  uniform float uEntrada;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec3 uMouse;
  attribute vec3 aA;
  attribute vec3 aB;
  attribute vec3 cA;
  attribute vec3 cB;
  attribute vec4 aSeed;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Cada punto sale en su momento: la forma se deshace y se reforma como un fluido
    float t = clamp((uMix - aSeed.x * 0.5) / 0.5, 0.0, 1.0);
    float e = t * t * (3.0 - 2.0 * t);
    vec3 p = mix(aA, aB, e);

    // En mitad del cambio, cada punto da un rodeo y gira alrededor del eje vertical
    float arco = sin(e * 3.14159265);
    p += (aSeed.xyz - 0.5) * vec3(6.0, 5.0, 7.0) * arco;
    float ang = arco * (aSeed.w - 0.5) * 3.2;
    float cs = cos(ang);
    float sn = sin(ang);
    p.xz = mat2(cs, -sn, sn, cs) * p.xz;

    // Entrada: llegan desde el fondo
    vec3 dir = normalize(aSeed.zxy - 0.5 + 1e-4);
    vec3 ini = dir * (9.0 + aSeed.w * 14.0);
    ini.z -= 25.0 * (0.4 + aSeed.x);
    float te = clamp((uEntrada - aSeed.y * 0.42) / 0.58, 0.0, 1.0);
    float ee = 1.0 - pow(1.0 - te, 4.0);
    p = mix(ini, p, ee);

    p += vec3(
      sin(uTime * 1.2 + aSeed.x * 60.0),
      cos(uTime * 1.0 + aSeed.y * 60.0),
      sin(uTime * 0.9 + aSeed.z * 60.0)
    ) * 0.014;

    vec2 dm = p.xy - uMouse.xy;
    float f = smoothstep(1.3, 0.0, length(dm));
    p.xy += normalize(dm + 1e-5) * f * 0.7;
    p.z += f * 0.6;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = min(64.0, uSize * (0.65 + aSeed.w * 0.9) * (1.0 + f * 1.3) * uPixelRatio * (300.0 / max(0.1, -mv.z)));

    vec3 col = mix(cA, cB, e) * 0.9 + 0.1;
    col = mix(col, vec3(1.0, 0.94, 0.86), f * 0.7);
    vColor = col * (0.85 + f * 1.4) * (1.0 + 0.4 * arco);
    vAlpha = smoothstep(0.0, 0.25, te);
  }
`

const FRAGMENTO = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(vColor * a, a * vAlpha * 0.85);
  }
`

interface Forma {
  pos: Float32Array
  col: Float32Array
}

const PALETA = [new THREE.Color('#FDB65C'), new THREE.Color('#E57E89'), new THREE.Color('#8F72EB')]
function paleta(t: number, out: THREE.Color) {
  const x = THREE.MathUtils.clamp(t, 0, 1) * 2
  const i = Math.min(1, Math.floor(x))
  return out.copy(PALETA[i]).lerp(PALETA[i + 1], x - i)
}

export default function Metamorfosis({ calidad, estatico }: PropsVariante) {
  const a = AJUSTES[calidad]
  const N = a.puntosForma
  const material = useRef<THREE.ShaderMaterial>(null)
  const tramo = useRef(-1)
  const progreso = useRef(0)
  const mapa = useRef<ReturnType<typeof crearMapaFilas> | null>(null)
  const cuenta = useRef(0)
  const vistoRaton = useRef(false)
  const raton = useMemo(() => new THREE.Vector3(), [])
  const dir = useMemo(() => new THREE.Vector3(), [])
  const size = useThree((s) => s.size)
  const camara = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const invalidate = useThree((s) => s.invalidate)
  const [formas, setFormas] = useState<Forma[] | null>(null)

  // Encuadre calculado con la cámara en reposo, como en el resto de diseños
  const altoVisible = 2 * Z_INICIO * Math.tan(THREE.MathUtils.degToRad(camara.fov / 2))
  const anchoVisible = altoVisible * (size.width / size.height)
  const movil = anchoVisible < 6

  useEffect(() => {
    let cancelado = false
    Promise.all([
      fetch('/logo-puntos.bin').then((r) => r.arrayBuffer()),
      fetch('/formas-puntos.bin').then((r) => r.arrayBuffer()),
    ])
      .then(([logoBuf, formasBuf]) => {
        if (cancelado) return
        const rnd = mulberry32(31)
        const lista: Forma[] = []
        const c = new THREE.Color()

        // 0: el logo, con el degradado de marca
        const dv = new DataView(logoBuf)
        const aspecto = dv.getFloat32(0, true)
        const nLogo = dv.getUint32(4, true)
        const coords = new Uint16Array(logoBuf, 8, nLogo * 2)
        const ancho = Math.min(6.6, anchoVisible * (movil ? 0.86 : 0.66))
        const alto = ancho / aspecto
        const logo: Forma = { pos: new Float32Array(N * 3), col: new Float32Array(N * 3) }
        for (let i = 0; i < N; i++) {
          const k = i % nLogo
          const nx = coords[k * 2] / 65535
          const ny = coords[k * 2 + 1] / 65535
          logo.pos.set([(nx - 0.5) * ancho, (0.5 - ny) * alto + altoVisible * (movil ? 0.27 : 0.15), (rnd() - 0.5) * 0.16], i * 3)
          paleta(nx * 0.82 + (1 - ny) * 0.18, c)
          logo.col.set([c.r, c.g, c.b], i * 3)
        }
        lista.push(logo)

        // 1..5: los iconos de las apps, con su color real
        const cab = new DataView(formasBuf)
        const nFormas = cab.getUint32(0, true)
        const porForma = cab.getUint32(4, true)
        let off = 8
        // En escritorio los iconos van a la derecha: a la izquierda está la columna de contenido
        const lado = Math.min(2.7, anchoVisible * (movil ? 0.56 : 0.24))
        const cx = movil ? 0 : anchoVisible * 0.34
        const cy = movil ? altoVisible * 0.2 : altoVisible * 0.04
        for (let f = 0; f < nFormas; f++) {
          off += 4 // aspecto
          const dvf = new DataView(formasBuf, off, porForma * 8)
          const forma: Forma = { pos: new Float32Array(N * 3), col: new Float32Array(N * 3) }
          for (let i = 0; i < N; i++) {
            const k = i % porForma
            const nx = dvf.getUint16(k * 8, true) / 65535
            const ny = dvf.getUint16(k * 8 + 2, true) / 65535
            forma.pos.set([cx + (nx - 0.5) * lado, cy + (0.5 - ny) * lado, (rnd() - 0.5) * 0.14], i * 3)
            forma.col.set([dvf.getUint8(k * 8 + 4) / 255, dvf.getUint8(k * 8 + 5) / 255, dvf.getUint8(k * 8 + 6) / 255], i * 3)
          }
          off += porForma * 8
          lista.push(forma)
        }

        // 6: una galaxia espiral con los colores de marca
        const gal: Forma = { pos: new Float32Array(N * 3), col: new Float32Array(N * 3) }
        const inclina = new THREE.Euler(-1.05, 0.3, 0.2)
        const v = new THREE.Vector3()
        for (let i = 0; i < N; i++) {
          const brazo = i % 3
          const r = Math.pow(rnd(), 0.62) * (movil ? 2.2 : 4.4)
          const ang = r * 1.15 + (brazo * Math.PI * 2) / 3 + (rnd() - 0.5) * (0.7 / (r + 0.4))
          v.set(Math.cos(ang) * r, (rnd() - 0.5) * 0.4 * (1 - r / 5), Math.sin(ang) * r).applyEuler(inclina)
          gal.pos.set([cx + v.x, cy + v.y, v.z], i * 3)
          paleta(r / (movil ? 2.2 : 4.4), c)
          if (rnd() < 0.08) c.set('#ffffff')
          gal.col.set([c.r, c.g, c.b], i * 3)
        }
        lista.push(gal)

        setFormas(lista)
        invalidate()
      })
      .catch(() => {})
    return () => {
      cancelado = true
    }
    // Se construye una vez: un cambio de tamaño de ventana no recoloca las formas
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [N])

  const geometria = useMemo(() => {
    if (!formas) return null
    const rnd = mulberry32(99)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3))
    g.setAttribute('aA', new THREE.BufferAttribute(new Float32Array(formas[0].pos), 3))
    g.setAttribute('aB', new THREE.BufferAttribute(new Float32Array(formas[1].pos), 3))
    g.setAttribute('cA', new THREE.BufferAttribute(new Float32Array(formas[0].col), 3))
    g.setAttribute('cB', new THREE.BufferAttribute(new Float32Array(formas[1].col), 3))
    const semilla = new Float32Array(N * 4)
    for (let i = 0; i < semilla.length; i++) semilla[i] = rnd()
    g.setAttribute('aSeed', new THREE.BufferAttribute(semilla, 4))
    tramo.current = 0
    return g
  }, [formas, N])

  const uniformes = useMemo(
    () => ({
      uMix: { value: 0 },
      uTime: { value: 0 },
      uEntrada: { value: estatico ? 1 : 0 },
      uSize: { value: 0.095 },
      uPixelRatio: { value: 1 },
      uMouse: { value: new THREE.Vector3(99, 99, 0) },
    }),
    [estatico],
  )

  useEffect(() => () => geometria?.dispose(), [geometria])

  useFrame((state, dt) => {
    const u = material.current?.uniforms
    if (!u || !formas || !geometria) return
    u.uPixelRatio.value = state.gl.getPixelRatio()
    // Más grueso que el del logo: un icono es una superficie y necesita cubrirse, no salpicarse
    u.uSize.value = 0.095 * (movil ? 0.8 : 1)
    const cam = state.camera
    const t = state.clock.elapsedTime
    const S = formas.length

    if (estatico) {
      cam.position.set(0, 0, Z_INICIO)
      cam.lookAt(0, 0, 0)
      return
    }

    u.uTime.value = t
    const k = Math.min(1, Math.max(0, (t - 0.4) / 3.6))
    u.uEntrada.value = 1 - Math.pow(1 - k, 3)

    // La forma sigue a la ficha que se está leyendo: s = 1 con RDLC centrada, 2 con VeoVeo...
    if (!mapa.current) mapa.current = crearMapaFilas(['rdlc', 'veoveo', 'split', 'imputame', 'zona'], 'contacto')
    if (++cuenta.current % 90 === 0) mapa.current.medir()
    progreso.current = THREE.MathUtils.damp(progreso.current, mapa.current.valor(window.scrollY), 2.6, dt)
    const s = Math.min(S - 1, progreso.current)
    const i = Math.min(S - 2, Math.floor(s))
    const f = s - i
    if (i !== tramo.current) {
      tramo.current = i
      const at = geometria.attributes
      ;(at.aA.array as Float32Array).set(formas[i].pos)
      ;(at.aB.array as Float32Array).set(formas[i + 1].pos)
      ;(at.cA.array as Float32Array).set(formas[i].col)
      ;(at.cB.array as Float32Array).set(formas[i + 1].col)
      at.aA.needsUpdate = at.aB.needsUpdate = at.cA.needsUpdate = at.cB.needsUpdate = true
    }
    // Cada forma se queda quieta un buen rato y el cambio ocupa solo el centro del tramo
    u.uMix.value = THREE.MathUtils.clamp((f - 0.28) / 0.44, 0, 1)

    cam.position.x = THREE.MathUtils.damp(cam.position.x, state.pointer.x * 0.5, 2.4, dt)
    cam.position.y = THREE.MathUtils.damp(cam.position.y, state.pointer.y * 0.3, 2.4, dt)
    cam.position.z = THREE.MathUtils.damp(cam.position.z, Z_INICIO + (1 - Math.min(1, t / 2.6)) * 18, 4, dt)
    cam.lookAt(0, 0, 0)
    ponerVelo(0.42)

    if (state.pointer.x !== 0 || state.pointer.y !== 0) vistoRaton.current = true
    if (!vistoRaton.current) {
      u.uMouse.value.set(99, 99, 0)
    } else {
      dir.set(state.pointer.x, state.pointer.y, 0.5).unproject(cam).sub(cam.position).normalize()
      raton.copy(cam.position).addScaledVector(dir, -cam.position.z / (dir.z || -1e-5))
      u.uMouse.value.set(raton.x, raton.y, 0)
    }
  })

  return (
    <>
      <Cielo sol={[0, 0, -1]} color="#c9794a" fuerza={0.55} />
      <Polvo polvo={a.polvo * 0.6} estrellas={a.estrellas} zMin={-60} radio={20} />
      {geometria && (
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
      )}
    </>
  )
}
