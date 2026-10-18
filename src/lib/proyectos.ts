/**
 * Fuente única de los proyectos de DripDev.
 *
 * Los estados los decide Álvaro, no se infieren:
 *  - publicada: terminada y en su tienda.
 *  - beta: se puede usar, sigue cambiando.
 *  - proximamente: todavía no hay nada que descargar. Sin enlace y sin datos de GitHub.
 */

export type Estado = 'publicada' | 'beta' | 'proximamente'
export type Plataforma = 'android' | 'web' | 'windows' | 'vscode'

export interface Proyecto {
  id: string
  nombre: string
  descripcion: string
  estado: Estado
  plataformas: Plataforma[]
  /** Repositorio público en roblesgg/. Solo si el estado no es "proximamente". */
  repo?: string
  enlace?: string
  icono?: string
  inicial: string
}

export const proyectos: Proyecto[] = [
  {
    id: 'rdlc',
    nombre: 'RDLC Auto Header',
    descripcion: 'Extensión de VS Code que automatiza los encabezados de los informes RDLC en Business Central.',
    estado: 'publicada',
    plataformas: ['vscode'],
    repo: 'BusinessCentralRdlcAutoheader',
    enlace:
      'https://marketplace.visualstudio.com/items?itemName=b3325c32-f6ee-4fad-9894-9af09cca5946.rdlc-autoheader',
    icono: '/rdlc-icon.png',
    inicial: 'R',
  },
  {
    id: 'veoveo',
    nombre: 'VeoVeo',
    descripcion: 'Descubre películas, guarda tu lista y decide con tus amigos qué ver esta noche.',
    estado: 'beta',
    plataformas: ['android', 'web'],
    repo: 'veoveo',
    enlace: 'https://veoveo.dripdev.dev/descargar',
    icono: '/veoveo-icon.png',
    inicial: 'V',
  },
  {
    id: 'split',
    nombre: 'split',
    descripcion: 'Cuentas, gastos, ahorro y pagos programados. Sin registro y sin nube: tus datos se quedan en el móvil.',
    estado: 'beta',
    plataformas: ['android', 'web'],
    repo: 'split',
    // TODO: pasar a https://split.dripdev.dev cuando el subdominio responda.
    enlace: 'https://github.com/roblesgg/split/releases/latest',
    icono: '/split-icon.png',
    inicial: 'S',
  },
  {
    id: 'imputame',
    nombre: 'imputa.me',
    descripcion: 'Registra tus horas por tarea y consúltalas en un calendario semanal. Vive en la bandeja del sistema.',
    estado: 'beta',
    plataformas: ['windows', 'web'],
    repo: 'imputa-me',
    enlace: 'https://imputame.dripdev.dev/descargar',
    icono: '/imputame-icon.png',
    inicial: 'I',
  },
  {
    id: 'zona',
    nombre: 'Zona Cliente',
    descripcion: 'CRM para gestionar hospitales, contactos, empresas y encargos.',
    estado: 'beta',
    plataformas: ['web', 'android'],
    repo: 'zona-cliente',
    enlace: 'https://zonacliente.dripdev.dev/descargar',
    icono: '/zonacliente-icon.png',
    inicial: 'Z',
  },
  {
    id: 'pulso',
    nombre: 'Pulso',
    descripcion: 'Tus entrenamientos y tu sueño del reloj en un sitio que es tuyo: sesiones, parciales y evolución.',
    estado: 'proximamente',
    plataformas: ['android', 'web'],
    inicial: 'P',
  },
  {
    id: 'garage',
    nombre: 'DripGarage',
    descripcion: 'Tu garaje en el móvil: vehículos, mantenimientos y el calendario de lo que toca.',
    estado: 'proximamente',
    plataformas: ['android'],
    inicial: 'G',
  },
  {
    id: 'citattoo',
    nombre: 'CiTattoo',
    descripcion: 'Citas de tatuaje con vista de cliente y de profesional, pensada para el móvil.',
    estado: 'proximamente',
    plataformas: ['web'],
    inicial: 'C',
  },
  {
    id: 'copiloto',
    nombre: 'Copiloto',
    descripcion: 'Asistente de escritorio para Star Citizen: rutas, precios y qué conviene llevar.',
    estado: 'proximamente',
    plataformas: ['windows'],
    inicial: 'C',
  },
]

export const gruposEstado: { estado: Estado; titulo: string; nota: string }[] = [
  { estado: 'publicada', titulo: 'Publicadas', nota: 'Terminadas y en su tienda.' },
  { estado: 'beta', titulo: 'En beta', nota: 'Se pueden usar y siguen cambiando.' },
  { estado: 'proximamente', titulo: 'Próximamente', nota: 'Todavía no hay nada que descargar.' },
]

/** Stack real, sacado del inventario de DripDev (TECNOLOGIAS.md), no de memoria. */
export const stack: { area: string; items: string }[] = [
  { area: 'Móvil', items: 'React Native, Expo, Capacitor' },
  { area: 'Web', items: 'React 19, Next.js 16, Vite, TypeScript' },
  { area: 'Escritorio', items: 'Tauri 2, Electron' },
  { area: 'Sin build', items: 'HTML, CSS y JavaScript puros (split, CiTattoo)' },
  { area: 'Datos', items: 'Firebase, Supabase, SQLite' },
  { area: 'IA', items: 'Servidores MCP en TypeScript' },
  { area: 'Publicación', items: 'Vercel, EAS Build, GitHub Releases, Google Play' },
  { area: 'Calidad', items: 'GitHub Actions, Dependabot, Vitest' },
]
