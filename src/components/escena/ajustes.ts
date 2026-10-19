export type Calidad = 'alta' | 'media'

export type Variante = 'cinturon' | 'sistema' | 'metamorfosis' | 'aurora' | 'olas'

export const VARIANTES: { id: Variante; nombre: string; nota: string; tono: string }[] = [
  { id: 'cinturon', nombre: 'Cinturón', nota: 'Vuelas entre asteroides', tono: 'Espectacular' },
  { id: 'sistema', nombre: 'Sistema solar', nota: 'Un planeta por proyecto', tono: 'Loco' },
  { id: 'metamorfosis', nombre: 'Metamorfosis', nota: 'Las partículas se vuelven tus apps', tono: 'Loco' },
  { id: 'aurora', nombre: 'Aurora', nota: 'Seda de luz que fluye', tono: 'Elegante' },
  { id: 'olas', nombre: 'Olas', nota: 'Un mar de datos', tono: 'Elegante' },
]

export const AJUSTES = {
  alta: {
    asteroides: 760,
    puntosLogo: 70000,
    polvo: 2600,
    estrellas: 1800,
    puntosForma: 22000,
    rejilla: [300, 180] as [number, number],
    dpr: [1, 1.75] as [number, number],
  },
  media: {
    asteroides: 240,
    puntosLogo: 26000,
    polvo: 800,
    estrellas: 900,
    puntosForma: 12000,
    rejilla: [150, 100] as [number, number],
    dpr: [1, 1.3] as [number, number],
  },
}

export interface PropsVariante {
  calidad: Calidad
  estatico: boolean
}
