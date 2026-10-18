import Link from 'next/link'

/** Una sola línea en escritorio, 64px de alto. Un solo enlace de contacto: "Escríbeme". */
export function Nav() {
  return (
    <header className="nav">
      <div className="contenedor nav-dentro">
        <Link href="/" className="nav-marca" aria-label="DripDev, inicio">
          DripDev
        </Link>
        <nav aria-label="Principal" className="nav-lista">
          <a className="nav-enlace" href="#proyectos">Proyectos</a>
          <a className="nav-enlace nav-enlace-opcional" href="#stack">Stack</a>
          <a className="boton boton-secundario" href="#contacto">Escríbeme</a>
        </nav>
      </div>
    </header>
  )
}
