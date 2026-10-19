/**
 * Convierte los iconos de las apps en nubes de puntos CON su color real.
 *
 * Salida: public/formas-puntos.bin
 *   uint32 número de formas, uint32 puntos por forma
 *   por cada forma: float32 aspecto, y después, por punto: uint16 x, uint16 y, uint8 r, g, b, relleno
 *
 * Uso: node scripts/generar-formas-puntos.mjs
 */
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ICONOS = ['rdlc-icon.png', 'veoveo-icon.png', 'split-icon.png', 'imputame-icon.png', 'zonacliente-icon.png']
const PUNTOS = 22000
const LADO = 360

let semilla = 7777
const rnd = () => {
  semilla = (semilla + 0x6d2b79f5) | 0
  let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const partes = [Buffer.alloc(8)]
partes[0].writeUInt32LE(ICONOS.length, 0)
partes[0].writeUInt32LE(PUNTOS, 4)

for (const nombre of ICONOS) {
  const { data, info } = await sharp(path.join(raiz, 'public', nombre))
    .resize(LADO, LADO, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const cand = []
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 4
      if (data[i + 3] > 200) cand.push(i)
    }
  }
  if (cand.length === 0) throw new Error(`${nombre}: sin píxeles opacos`)

  // Muestreo sin repetir (Fisher-Yates parcial); si hay menos candidatos que puntos, se repiten con jitter
  const n = PUNTOS
  const idx = new Uint32Array(n)
  if (cand.length >= n) {
    for (let k = 0; k < n; k++) {
      const j = k + Math.floor(rnd() * (cand.length - k))
      const t = cand[k]; cand[k] = cand[j]; cand[j] = t
      idx[k] = cand[k]
    }
  } else {
    for (let k = 0; k < n; k++) idx[k] = cand[Math.floor(rnd() * cand.length)]
  }

  const cab = Buffer.alloc(4)
  cab.writeFloatLE(1, 0)
  const cuerpo = Buffer.alloc(n * 8)
  for (let k = 0; k < n; k++) {
    const i = idx[k]
    const px = ((i / 4) % info.width) + rnd() - 0.5
    const py = Math.floor(i / 4 / info.width) + rnd() - 0.5
    cuerpo.writeUInt16LE(Math.max(0, Math.min(65535, Math.round((px / info.width) * 65535))), k * 8)
    cuerpo.writeUInt16LE(Math.max(0, Math.min(65535, Math.round((py / info.height) * 65535))), k * 8 + 2)
    cuerpo[k * 8 + 4] = data[i]
    cuerpo[k * 8 + 5] = data[i + 1]
    cuerpo[k * 8 + 6] = data[i + 2]
  }
  partes.push(cab, cuerpo)
  console.log(`${nombre}: ${cand.length} píxeles opacos, ${n} puntos`)
}

const salida = Buffer.concat(partes)
writeFileSync(path.join(raiz, 'public', 'formas-puntos.bin'), salida)
console.log(`formas-puntos.bin: ${(salida.length / 1024) | 0} KB`)
