import * as THREE from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/** Progreso de scroll de toda la página, de 0 a 1. Se lee dentro de useFrame: sin listeners ni estado. */
export function progresoScroll() {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  return THREE.MathUtils.clamp(window.scrollY / max, 0, 1)
}

/**
 * Sincroniza la escena con la lectura: convierte el scroll en un número continuo `s`.
 *   s = 0 en el hero; s = k cuando la ficha k (1 a n) está centrada; s = n + 1 en el cierre.
 * Así la escena enseña la app que la persona tiene delante, no un porcentaje de página.
 */
export function crearMapaFilas(ids: string[], cierre: string) {
  let ys: number[] = [0]
  const medir = () => {
    const vh = window.innerHeight
    const lista = [0]
    for (const id of [...ids.map((i) => `proyecto-${i}`), cierre]) {
      const el = document.getElementById(id)
      const previo = lista[lista.length - 1]
      if (!el) {
        lista.push(previo + vh * 0.5)
        continue
      }
      const r = el.getBoundingClientRect()
      lista.push(Math.max(r.top + window.scrollY + r.height / 2 - vh / 2, previo + 40))
    }
    ys = lista
  }
  medir()
  return {
    medir,
    valor(y: number) {
      if (y <= ys[0]) return 0
      for (let i = 1; i < ys.length; i++) {
        if (y <= ys[i]) return i - 1 + (y - ys[i - 1]) / (ys[i] - ys[i - 1])
      }
      return ys.length - 1
    },
  }
}

/** Textura de punto redondo y suave: sin ella los puntos de WebGL se dibujan cuadrados. */
export function crearTexturaPunto() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.7)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

/** Oscurece la escena al bajar para que el texto se lea. `max` es la opacidad máxima del velo. */
export function ponerVelo(max = 0.5) {
  const v = THREE.MathUtils.clamp(window.scrollY / (window.innerHeight * 0.9), 0, 1) * max
  document.documentElement.style.setProperty('--velo', v.toFixed(3))
}

/** Generador pseudoaleatorio con semilla: la escena sale igual en cada visita y en cada captura. */
export function mulberry32(semilla: number) {
  let a = semilla >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hash3(x: number, y: number, z: number) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453
  return s - Math.floor(s)
}

/** Ruido de valor 3D suave, en 0..1. Suficiente para dar relieve a una roca. */
export function ruido3(x: number, y: number, z: number) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z)
  const xf = x - xi, yf = y - yi, zf = z - zi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const w = zf * zf * (3 - 2 * zf)
  const l = (a: number, b: number, t: number) => a + (b - a) * t
  return l(
    l(l(hash3(xi, yi, zi), hash3(xi + 1, yi, zi), u), l(hash3(xi, yi + 1, zi), hash3(xi + 1, yi + 1, zi), u), v),
    l(l(hash3(xi, yi, zi + 1), hash3(xi + 1, yi, zi + 1), u), l(hash3(xi, yi + 1, zi + 1), hash3(xi + 1, yi + 1, zi + 1), u), v),
    w,
  )
}

/** Fractal de varias octavas, en 0..1 aproximadamente. */
export function fbm3(x: number, y: number, z: number, octavas = 4) {
  let suma = 0, amp = 0.5, f = 1
  for (let i = 0; i < octavas; i++) {
    suma += ruido3(x * f, y * f, z * f) * amp
    amp *= 0.5
    f *= 2.03
  }
  return suma
}

/**
 * Una roca: icosaedro deformado con ruido fractal. Cada semilla da una forma distinta.
 * Detalle 2 (320 caras): suficiente para silueta irregular y barato al instanciar cientos.
 */
export function crearGeometriaRoca(semilla: number, detalle = 3) {
  const rnd = mulberry32(semilla)
  // Se funden los vértices repetidos (el icosaedro viene "suelto", cara a cara) para poder
  // suavizar las normales: sin esto cada triángulo se ve plano y la roca parece de baja resolución.
  let g: THREE.BufferGeometry = new THREE.IcosahedronGeometry(1, detalle)
  g.deleteAttribute('normal')
  g.deleteAttribute('uv')
  g = mergeVertices(g, 1e-4)
  const pos = g.attributes.position as THREE.BufferAttribute
  const uvs = new Float32Array(pos.count * 2)
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
    uvs[i * 2] = Math.atan2(z, x) / (Math.PI * 2) + 0.5
    uvs[i * 2 + 1] = Math.asin(Math.max(-1, Math.min(1, y))) / Math.PI + 0.5
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  const v = new THREE.Vector3()
  const ox = rnd() * 40, oy = rnd() * 40, oz = rnd() * 40
  // Achatamiento por eje: las rocas reales no son esferas
  const sx = 0.78 + rnd() * 0.5, sy = 0.7 + rnd() * 0.5, sz = 0.78 + rnd() * 0.5

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize()
    const grande = fbm3(v.x * 1.4 + ox, v.y * 1.4 + oy, v.z * 1.4 + oz, 3)
    const fino = fbm3(v.x * 4.2 + oy, v.y * 4.2 + oz, v.z * 4.2 + ox, 2)
    const r = 0.62 + grande * 0.62 + (fino - 0.5) * 0.16
    v.multiplyScalar(r)
    v.x *= sx
    v.y *= sy
    v.z *= sz
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  pos.needsUpdate = true
  g.computeVertexNormals()
  return g
}

/**
 * Textura de superficie: manchas de ruido y cráteres. Se usa como mapa de color y de relieve.
 * Se genera en un canvas 2D, así no hay que descargar ninguna imagen.
 */
export function crearTexturaRoca(tam = 256) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = tam
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(tam, tam)
  const rnd = mulberry32(777)

  for (let y = 0; y < tam; y++) {
    for (let x = 0; x < tam; x++) {
      const n = fbm3(x / 38, y / 38, 3.1, 5)
      const grano = ruido3(x / 3, y / 3, 9) * 0.18
      const val = Math.max(0, Math.min(255, (0.28 + n * 0.62 + grano) * 255))
      const i = (y * tam + x) * 4
      img.data[i] = img.data[i + 1] = img.data[i + 2] = val
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)

  // Cráteres: borde claro, fondo oscuro
  for (let c = 0; c < 46; c++) {
    const cx = rnd() * tam, cy = rnd() * tam
    const r = 4 + Math.pow(rnd(), 2.2) * 30
    const grad = ctx.createRadialGradient(cx, cy, r * 0.15, cx, cy, r)
    grad.addColorStop(0, 'rgba(0,0,0,0.55)')
    grad.addColorStop(0.72, 'rgba(0,0,0,0.28)')
    grad.addColorStop(0.9, 'rgba(255,255,255,0.32)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}
