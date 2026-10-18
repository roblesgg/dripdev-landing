/**
 * Convierte public/dripdev-logo.png en una nube de puntos para la portada.
 *
 * El logo es un rótulo a pincel negro con contorno blanco. Solo se muestrea el
 * trazo negro (las letras): el contorno blanco no es parte del dibujo.
 *
 * Salida: public/logo-puntos.bin
 *   float32  aspecto (ancho / alto del trazo)
 *   uint32   número de puntos
 *   uint16[] x, y por punto, normalizados al cuadro del trazo (0..65535)
 *
 * Uso: node scripts/generar-logo-puntos.mjs
 */
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const entrada = path.join(raiz, 'public', 'dripdev-logo.png')
const salida = path.join(raiz, 'public', 'logo-puntos.bin')

const PUNTOS = 70000
const UMBRAL_NEGRO = 96 // luminosidad por debajo de la cual es trazo
const ANCHO = 1400

const { data, info } = await sharp(entrada)
  .resize({ width: ANCHO })
  .flatten({ background: '#ffffff' })
  .greyscale()
  .raw()
  .toBuffer({ resolveWithObject: true })

const { width, height } = info
const candidatos = []
let minX = width, maxX = 0, minY = height, maxY = 0

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (data[y * width + x] < UMBRAL_NEGRO) {
      candidatos.push(x, y)
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
}

const total = candidatos.length / 2
if (total === 0) throw new Error('No se encontró trazo negro en el logo')

const cajaW = maxX - minX + 1
const cajaH = maxY - minY + 1

// Muestreo uniforme sin repetir (barajado parcial de Fisher-Yates, semilla fija)
let semilla = 20261018
const rnd = () => {
  semilla = (semilla + 0x6d2b79f5) | 0
  let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const n = Math.min(PUNTOS, total)
const indices = Uint32Array.from({ length: total }, (_, i) => i)
for (let i = 0; i < n; i++) {
  const j = i + Math.floor(rnd() * (total - i))
  const tmp = indices[i]
  indices[i] = indices[j]
  indices[j] = tmp
}

const cabecera = Buffer.alloc(8)
cabecera.writeFloatLE(cajaW / cajaH, 0)
cabecera.writeUInt32LE(n, 4)

const coords = new Uint16Array(n * 2)
for (let i = 0; i < n; i++) {
  const k = indices[i] * 2
  // medio píxel de jitter: evita la rejilla visible en los bordes
  const px = candidatos[k] - minX + rnd() - 0.5
  const py = candidatos[k + 1] - minY + rnd() - 0.5
  coords[i * 2] = Math.max(0, Math.min(65535, Math.round((px / cajaW) * 65535)))
  coords[i * 2 + 1] = Math.max(0, Math.min(65535, Math.round((py / cajaH) * 65535)))
}

writeFileSync(salida, Buffer.concat([cabecera, Buffer.from(coords.buffer)]))
console.log(`logo-puntos.bin: ${n} puntos de ${total} candidatos, aspecto ${(cajaW / cajaH).toFixed(2)}, ${(8 + n * 4) / 1024 | 0} KB`)

