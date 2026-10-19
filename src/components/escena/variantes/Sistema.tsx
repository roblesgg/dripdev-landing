'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Cielo, Polvo } from '../Ambiente'
import { LogoParticulas } from '../LogoParticulas'
import { AJUSTES, type PropsVariante } from '../ajustes'
import { RUIDO_GLSL } from '../glsl'
import { mulberry32, crearMapaFilas } from '../utiles'
import { Z_INICIO } from '../Camara'
import { proyectos } from '@/lib/proyectos'

const LUZ = new THREE.Vector3(0.7, 0.45, 0.55).normalize()
const SOL: [number, number, number] = [0.7, 0.45, 0.55]

/** Color de cada mundo, el mismo que su app. */
const COLORES: Record<string, [string, string]> = {
  rdlc: ['#E57E89', '#7448BE'],
  veoveo: ['#38BDF8', '#1d4ed8'],
  split: ['#22C55E', '#0f766e'],
  imputame: ['#FB944E', '#b5521c'],
  zona: ['#8F72EB', '#312e81'],
  pulso: ['#F43F5E', '#7f1d1d'],
  garage: ['#FDB65C', '#92400e'],
  citattoo: ['#a78bfa', '#4c1d95'],
  copiloto: ['#5EEAD4', '#115e59'],
}

const VERT_PLANETA = /* glsl */ `
  varying vec3 vObj;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vObj = position;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

const FRAG_PLANETA = /* glsl */ `
  ${RUIDO_GLSL}
  uniform vec3 uA;
  uniform vec3 uB;
  uniform vec3 uLuz;
  uniform float uSemilla;
  uniform float uBandas;
  uniform float uApagado;
  uniform float uTime;
  varying vec3 vObj;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec3 n = normalize(vNormal);
    float r = fbm3(vObj * 1.9 + uSemilla);
    float bandas = 0.5 + 0.5 * sin(vObj.y * uBandas + r * 4.0 + uTime * 0.05);
    float t = mix(r, bandas, step(0.5, uBandas) * 0.78);
    vec3 base = mix(uA, uB, smoothstep(0.28, 0.72, t));
    float d = dot(n, uLuz);
    float luz = smoothstep(-0.2, 0.6, d);
    vec3 col = base * (0.06 + luz * 1.08);
    // luces de "ciudad" en el lado oscuro
    float ciudad = step(0.78, noise3(vObj * 14.0 + uSemilla)) * smoothstep(0.1, -0.25, d) * (1.0 - step(0.5, uBandas));
    col += vec3(1.0, 0.85, 0.55) * ciudad * 0.8;
    float f = pow(1.0 - max(dot(n, normalize(vView)), 0.0), 3.0);
    col += uB * f * (0.2 + 0.8 * luz) * 1.3;
    vec3 gris = vec3(dot(col, vec3(0.33))) * 0.55;
    col = mix(col, gris, uApagado);
    gl_FragColor = vec4(col, 1.0);
  }
`

const FRAG_ATMOSFERA = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uLuz;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float f = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.6);
    float luz = 0.35 + 0.65 * smoothstep(-0.4, 0.6, dot(normalize(vNormal), uLuz));
    gl_FragColor = vec4(uColor * f * luz * 1.8, f * luz);
  }
`

const FRAG_ANILLO = /* glsl */ `
  uniform vec3 uColor;
  varying vec3 vObj;
  void main() {
    float r = length(vObj.xy);
    float bandas = 0.55 + 0.45 * sin(r * 26.0) * sin(r * 61.0 + 1.3);
    float borde = smoothstep(1.55, 1.7, r) * (1.0 - smoothstep(2.35, 2.45, r));
    gl_FragColor = vec4(uColor * (0.5 + bandas), borde * bandas * 0.8);
  }
`

const ESTADO: Record<string, string> = { publicada: 'Publicada', beta: 'Beta', proximamente: 'Próximamente' }

function crearRotulo(texto: string, color: string, estado: string, tenue: boolean) {
  const lienzo = document.createElement('canvas')
  lienzo.width = 768
  lienzo.height = 160
  const ctx = lienzo.getContext('2d')!
  ctx.font = '700 84px system-ui, -apple-system, Segoe UI, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(0,0,0,0.85)'
  ctx.shadowBlur = 28
  ctx.fillStyle = tenue ? 'rgba(220,214,235,0.7)' : '#ffffff'
  ctx.fillText(texto, 384, 70)
  ctx.shadowBlur = 0
  ctx.font = '600 38px system-ui, -apple-system, Segoe UI, sans-serif'
  ctx.fillStyle = color
  ctx.fillText(estado, 384, 134)
  const tex = new THREE.CanvasTexture(lienzo)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

interface Mundo {
  id: string
  nombre: string
  pos: THREE.Vector3
  radio: number
  bandas: number
  anillo: boolean
  luna: boolean
  apagado: boolean
  estado: string
  semilla: number
}

function Planeta({ m, registro }: { m: Mundo; registro: (id: string, grupo: THREE.Group | null, rotulo: THREE.Sprite | null) => void }) {
  const [ca, cb] = COLORES[m.id] ?? ['#ffffff', '#555555']
  const matPlaneta = useRef<THREE.ShaderMaterial>(null)
  const luna = useRef<THREE.Mesh>(null)
  const cuerpo = useRef<THREE.Mesh>(null)

  const uni = useMemo(
    () => ({
      uA: { value: new THREE.Color(ca) },
      uB: { value: new THREE.Color(cb) },
      uLuz: { value: LUZ },
      uSemilla: { value: m.semilla },
      uBandas: { value: m.bandas },
      uApagado: { value: m.apagado ? 0.8 : 0 },
      uTime: { value: 0 },
    }),
    [ca, cb, m],
  )
  const uniAtm = useMemo(() => ({ uColor: { value: new THREE.Color(ca) }, uLuz: { value: LUZ } }), [ca])
  const uniAnillo = useMemo(() => ({ uColor: { value: new THREE.Color(ca).lerp(new THREE.Color('#ffffff'), 0.25) } }), [ca])
  const rotulo = useMemo(() => {
    const mat = new THREE.SpriteMaterial({ map: crearRotulo(m.nombre, ca, ESTADO[m.estado], m.apagado), transparent: true, depthWrite: false, opacity: 0 })
    const s = new THREE.Sprite(mat)
    s.scale.set(9, 1.88, 1)
    return s
  }, [m, ca])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    uni.uTime.value = t
    if (cuerpo.current) cuerpo.current.rotation.y = t * 0.04 * (m.semilla % 2 ? 1 : -1)
    if (luna.current) {
      const a = t * 0.35 + m.semilla
      luna.current.position.set(Math.cos(a) * m.radio * 1.9, Math.sin(a * 0.7) * m.radio * 0.25, Math.sin(a) * m.radio * 1.9)
    }
  })

  return (
    <group
      ref={(g) => registro(m.id, g, rotulo)}
      position={m.pos}
    >
      <mesh ref={cuerpo} scale={m.radio}>
        <sphereGeometry args={[1, 96, 64]} />
        <shaderMaterial ref={matPlaneta} vertexShader={VERT_PLANETA} fragmentShader={FRAG_PLANETA} uniforms={uni} />
      </mesh>
      <mesh scale={m.radio * 1.09}>
        <sphereGeometry args={[1, 64, 48]} />
        <shaderMaterial
          vertexShader={VERT_PLANETA}
          fragmentShader={FRAG_ATMOSFERA}
          uniforms={uniAtm}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>
      {m.anillo && (
        <mesh scale={m.radio} rotation={[Math.PI / 2.35, 0.25, 0.4]}>
          <ringGeometry args={[1.5, 2.45, 160]} />
          <shaderMaterial
            vertexShader={VERT_PLANETA}
            fragmentShader={FRAG_ANILLO}
            uniforms={uniAnillo}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      {m.luna && (
        <mesh ref={luna} scale={m.radio * 0.2}>
          <sphereGeometry args={[1, 32, 24]} />
          <meshStandardMaterial color="#b9b2c6" roughness={0.95} />
        </mesh>
      )}
      <primitive object={rotulo} position={[0, m.radio * 1.75 + 1.1, 0]} />
    </group>
  )
}

export default function Sistema({ calidad, estatico }: PropsVariante) {
  const a = AJUSTES[calidad]

  const mundos = useMemo<Mundo[]>(() => {
    const rnd = mulberry32(909)
    return proyectos.map((p, i) => {
      const lado = i % 2 === 0 ? 1 : -1
      return {
        id: p.id,
        nombre: p.nombre,
        pos: new THREE.Vector3(lado * (4.2 + rnd() * 4.5), (rnd() - 0.5) * 4, -34 - i * 38),
        radio: 2.2 + rnd() * 2,
        bandas: i % 3 === 1 ? 7 + rnd() * 8 : 0,
        anillo: i === 1 || i === 4 || i === 7,
        luna: i % 2 === 0 || i === 5,
        apagado: p.estado === 'proximamente',
        estado: p.estado,
        semilla: Math.floor(rnd() * 90),
      }
    })
  }, [])

  const refs = useRef<Record<string, { grupo: THREE.Group | null; rotulo: THREE.Sprite | null }>>({})
  const registro = (id: string, grupo: THREE.Group | null, rotulo: THREE.Sprite | null) => {
    refs.current[id] = { grupo, rotulo }
  }

  const objetivo = useMemo(() => new THREE.Vector3(), [])
  const puntos = useMemo(() => {
    // La cámara pasa por un lado de cada mundo, algo más cerca y elevada: ve el hemisferio iluminado
    const lista = [new THREE.Vector3(0, 0, Z_INICIO)]
    mundos.forEach((m) => {
      const lado = Math.sign(m.pos.x) || 1
      lista.push(new THREE.Vector3(m.pos.x - lado * (m.radio * 3.4), m.pos.y + m.radio * 0.9, m.pos.z + m.radio * 4.6 + 6))
    })
    const ultimo = mundos[mundos.length - 1]
    lista.push(new THREE.Vector3(0, 1, ultimo.pos.z - 26))
    return new THREE.CatmullRomCurve3(lista, false, 'catmullrom', 0.4)
  }, [mundos])

  const progreso = useRef(0)
  const mapa = useRef<ReturnType<typeof crearMapaFilas> | null>(null)
  const cuenta = useRef(0)
  const mira = useMemo(() => new THREE.Vector3(0, 0, -20), [])
  const pos = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, dt) => {
    const cam = state.camera
    const t = state.clock.elapsedTime
    const n = mundos.length

    if (estatico) {
      cam.position.set(0, 0, Z_INICIO)
      cam.lookAt(0, 0, -20)
    } else {
      const intro = 1 - Math.min(1, t / 2.6)
      // El viaje sigue a la lectura: el mundo k llega cuando la ficha de su proyecto está centrada
      if (!mapa.current) mapa.current = crearMapaFilas(mundos.map((m) => m.id), 'contacto')
      if (++cuenta.current % 90 === 0) mapa.current.medir()
      progreso.current = THREE.MathUtils.damp(progreso.current, mapa.current.valor(window.scrollY), 2.6, dt)
      const s = Math.min(n + 1, progreso.current)
      puntos.getPoint(s / (n + 1), pos)
      cam.position.set(pos.x + state.pointer.x * 0.5, pos.y + state.pointer.y * 0.3, pos.z + intro * 30)

      // Mira hacia el mundo que toca, pasando de uno a otro con suavidad
      const k = THREE.MathUtils.clamp(Math.floor(s) - 1, -1, n - 1)
      const f = THREE.MathUtils.smoothstep(s - Math.floor(s), 0.15, 0.85)
      const A = k < 0 ? mira.set(0, 0.4, -14) : mundos[k].pos
      const B = k + 1 >= n ? objetivo.set(0, 0, mundos[n - 1].pos.z - 40) : mundos[k + 1].pos
      mira.lerpVectors(A.clone(), B.clone(), f)
      // En escritorio se mira un poco a la izquierda del mundo: así cae en la mitad derecha,
      // la que deja libre la columna de contenido
      if (state.size.width >= 1024) mira.x -= 6
      cam.lookAt(mira)

      // El velo sube con el scroll para que el texto se lea
      document.documentElement.style.setProperty('--velo', (Math.min(1, window.scrollY / (window.innerHeight * 0.9)) * 0.42).toFixed(3))
    }

    // Rótulos: aparecen al acercarse a cada mundo
    for (const m of mundos) {
      const r = refs.current[m.id]
      if (!r?.rotulo) continue
      const d = cam.position.distanceTo(m.pos)
      const alfa = THREE.MathUtils.clamp(1 - (d - 16) / 18, 0, 1)
      ;(r.rotulo.material as THREE.SpriteMaterial).opacity = alfa
    }
  })

  return (
    <>
      <Cielo sol={SOL} color="#ffb27a" fuerza={0.9} />
      <ambientLight intensity={0.35} color="#8a7bd0" />
      <directionalLight position={[7, 4.5, 5.5]} intensity={2.2} color="#ffd2a8" />

      <LogoParticulas puntos={a.puntosLogo} estatico={estatico} alturaRelativa={calidad === 'alta' ? 0.15 : 0.27} />
      {mundos.map((m) => (
        <Planeta key={m.id} m={m} registro={registro} />
      ))}
      <Polvo polvo={a.polvo} estrellas={a.estrellas} zMin={-380} radio={30} />
    </>
  )
}
