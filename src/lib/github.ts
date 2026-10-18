/**
 * Datos reales de GitHub para la portada.
 *
 * Todo se pide en el servidor y se cachea una hora (ISR). Si GitHub no responde,
 * o se agota el límite sin token, cada función devuelve null y la interfaz
 * oculta ese dato: es preferible no enseñar nada que enseñar algo inventado.
 *
 * Variable opcional GITHUB_TOKEN (solo lectura): sube el límite de 60 a 5000 por hora.
 */

const OWNER = 'roblesgg'
const REVALIDAR = 3600

/**
 * Repos cuyos mensajes de commit se muestran en el feed.
 * VeoVeo queda fuera a propósito: trabaja en ramas play/* y sus mensajes son
 * notas internas (producción, cuentas de prueba) que no hace falta amplificar.
 */
const REPOS_DEL_FEED = ['split', 'imputa-me', 'zona-cliente', 'dripdev-landing', 'BusinessCentralRdlcAutoheader']

function cabeceras(): HeadersInit {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  return h
}

async function pedir<T>(ruta: string): Promise<T | null> {
  try {
    const res = await fetch(`https://api.github.com${ruta}`, {
      headers: cabeceras(),
      next: { revalidate: REVALIDAR },
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

export interface DatosRepo {
  version: string | null
  /** Fecha de esa versión (ISO 8601). No es la del último push: un cambio del README no es una versión. */
  fechaVersion: string | null
}

export async function datosDeRepo(repo: string): Promise<DatosRepo> {
  const release = await pedir<{ tag_name?: string; published_at?: string }>(
    `/repos/${OWNER}/${repo}/releases/latest`,
  )
  return {
    version: release?.tag_name ?? null,
    fechaVersion: release?.published_at ?? null,
  }
}

export interface Commit {
  sha: string
  repo: string
  mensaje: string
  fecha: string
}

interface EventoPush {
  type: string
  repo: { name: string }
  payload: { head?: string }
  created_at: string
}

/**
 * Los últimos commits públicos de los repos permitidos.
 * La API de eventos ya no trae los mensajes, así que se pide cada commit por su hash.
 */
export async function actividadReciente(max = 6): Promise<Commit[] | null> {
  const eventos = await pedir<EventoPush[]>(`/users/${OWNER}/events/public?per_page=60`)
  if (!eventos) return null

  const vistos = new Set<string>()
  const candidatos: { repo: string; sha: string }[] = []
  for (const e of eventos) {
    if (e.type !== 'PushEvent' || !e.payload.head) continue
    const repo = e.repo.name.replace(`${OWNER}/`, '')
    if (!REPOS_DEL_FEED.includes(repo)) continue
    if (vistos.has(e.payload.head)) continue
    vistos.add(e.payload.head)
    candidatos.push({ repo, sha: e.payload.head })
    if (candidatos.length >= max + 2) break
  }

  const commits = await Promise.all(
    candidatos.map(async ({ repo, sha }) => {
      const c = await pedir<{ sha: string; commit: { message: string; committer: { date: string } } }>(
        `/repos/${OWNER}/${repo}/commits/${sha}`,
      )
      if (!c) return null
      return {
        sha: c.sha.slice(0, 7),
        repo,
        mensaje: c.commit.message.split('\n')[0],
        fecha: c.commit.committer.date,
      } satisfies Commit
    }),
  )

  // Ruido que no dice nada de un producto: fusiones y notas de trabajo con agentes.
  const RUIDO = /^merge\b|claude|agente/i
  const validos = commits.filter((c): c is Commit => c !== null && !RUIDO.test(c.mensaje))
  validos.sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha))
  return validos.slice(0, max)
}

/** "18 oct" en español, con año solo si no es el actual. Fecha absoluta: no caduca. */
export function fechaCorta(iso: string): string {
  const d = new Date(iso)
  const mismoAnio = d.getFullYear() === new Date().getFullYear()
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    ...(mismoAnio ? {} : { year: 'numeric' }),
  })
    .format(d)
    .replace('.', '')
}
