import { fechaCorta, type Commit } from '@/lib/github'

/**
 * Commits reales, públicos, sacados de GitHub. Nada de esto es una maqueta:
 * si GitHub no responde, la portada no muestra este panel.
 */
export function Actividad({ commits }: { commits: Commit[] }) {
  return (
    <aside className="actividad" aria-label="Actividad reciente en GitHub">
      <div className="actividad-cabecera mono">
        <span>Actividad reciente</span>
        <a href="https://github.com/roblesgg" target="_blank" rel="noopener noreferrer">
          github.com/roblesgg
        </a>
      </div>
      <ul className="actividad-lista">
        {commits.map((c) => (
          <li key={c.sha} className="commit">
            <span className="commit-sha mono">{c.sha}</span>
            <span className="commit-texto">
              <span className="commit-mensaje">{c.mensaje}</span>
              <span className="commit-repo mono">{c.repo}</span>
            </span>
            <time className="commit-fecha mono" dateTime={c.fecha}>
              {fechaCorta(c.fecha)}
            </time>
          </li>
        ))}
      </ul>
    </aside>
  )
}
