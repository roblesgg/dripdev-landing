import { actividadReciente, datosDeRepo, fechaCorta, type Commit } from '@/lib/github'
import { proyectos, type Proyecto } from '@/lib/proyectos'

export interface ProyectoConDatos {
  proyecto: Proyecto
  version: string | null
  fechaVersion: string | null
}

/** Proyectos con su última versión y la actividad reciente de GitHub. Se cachea una hora. */
export async function cargarDatos(): Promise<{ lista: ProyectoConDatos[]; commits: Commit[] | null }> {
  const [commits, datos] = await Promise.all([
    actividadReciente(6),
    Promise.all(proyectos.map((p) => (p.repo && p.estado !== 'proximamente' ? datosDeRepo(p.repo) : null))),
  ])
  const lista = proyectos.map((proyecto, i) => ({
    proyecto,
    version: datos[i]?.version ?? null,
    fechaVersion: datos[i]?.fechaVersion ? fechaCorta(datos[i]!.fechaVersion!) : null,
  }))
  return { lista, commits }
}
