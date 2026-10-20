import type { Metadata } from 'next'
import { ArrowUpRight, GithubLogo, LinkedinLogo } from '@phosphor-icons/react/dist/ssr'
import { Hero } from '@/components/plano/Hero'
import { Cinta } from '@/components/plano/Cinta'
import { Apps } from '@/components/plano/Apps'
import { Nav } from '@/components/plano/Nav'
import { Estrellas } from '@/components/plano/Estrellas'
import { Manifiesto } from '@/components/plano/Manifiesto'
import { Reveal } from '@/components/Reveal'
import { fechaCorta } from '@/lib/github'
import { cargarDatos } from '@/lib/datos'
import { stack } from '@/lib/proyectos'
import './plano.css'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'DripDev | Diseño plano',
  robots: { index: false, follow: false },
}

const CORREO = 'Roblesgg16@gmail.com'

export default async function Plano() {
  const { lista, commits } = await cargarDatos()
  const apps = lista.filter((d) => d.proyecto.estado !== 'proximamente')
  const proximas = lista.filter((d) => d.proyecto.estado === 'proximamente')
  const hayActividad = !!commits && commits.length >= 3

  return (
    <div className="pl">
      <Estrellas />
      <Nav />

      <main>
        <Hero />
        <Cinta nombres={lista.map((d) => d.proyecto.nombre)} />
        <Manifiesto />
        <Apps apps={apps} />

        <section id="proximamente" className="pl-seccion" aria-labelledby="pl-prox">
          <div className="pl-contenedor">
            <Reveal>
              <p className="pl-etiqueta mono">En camino</p>
              <h2 id="pl-prox" className="pl-titulo">Próximamente</h2>
              <p className="pl-intro">Todavía no hay nada que descargar de estos cuatro.</p>
            </Reveal>
            <div className="pl-prox-rejilla">
              {proximas.map(({ proyecto: p }, i) => (
                <Reveal key={p.id} delay={i * 0.07}>
                  <article className="pl-prox">
                    <span className="pl-prox-inicial mono" aria-hidden>{String(i + 1).padStart(2, '0')}</span>
                    <h3>{p.nombre}</h3>
                    <p>{p.descripcion}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {hayActividad && (
          <section id="actividad" className="pl-seccion" aria-labelledby="pl-act">
            <div className="pl-contenedor">
              <Reveal>
                <p className="pl-etiqueta mono">Actividad</p>
                <h2 id="pl-act" className="pl-titulo">Lo último que he hecho</h2>
                <p className="pl-intro">Commits reales de mis repositorios públicos, tal como salen de GitHub.</p>
              </Reveal>
              <Reveal delay={0.05}>
                <ul className="pl-commits mono">
                  {commits!.map((c) => (
                    <li key={c.sha}>
                      <span className="pl-sha">{c.sha}</span>
                      <span className="pl-msg">{c.mensaje}</span>
                      <span className="pl-repo">{c.repo}</span>
                      <time dateTime={c.fecha}>{fechaCorta(c.fecha)}</time>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </section>
        )}

        <section id="stack" className="pl-seccion" aria-labelledby="pl-stack">
          <div className="pl-contenedor">
            <Reveal>
              <p className="pl-etiqueta mono">Herramientas</p>
              <h2 id="pl-stack" className="pl-titulo">Con qué lo construyo</h2>
            </Reveal>
            <div className="pl-stack">
              {stack.map(({ area, items }, i) => (
                <Reveal key={area} delay={i * 0.04}>
                  <div className="pl-stack-bloque">
                    <h3>{area}</h3>
                    <p>{items}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="contacto" className="pl-seccion" aria-labelledby="pl-contacto">
          <div className="pl-contenedor pl-contacto">
            <Reveal>
              <p className="pl-etiqueta mono">Contacto</p>
              <h2 id="pl-contacto" className="pl-titulo pl-titulo-enorme">Escríbeme</h2>
              <p className="pl-intro">
                Soy Álvaro, de Murcia. Desarrollo y mantengo estos proyectos por mi cuenta. Si tienes una idea, has
                encontrado un fallo o quieres probar alguna de las apps, escríbeme.
              </p>
              <a className="pl-correo" href={`mailto:${CORREO}`}>{CORREO}</a>
              <div className="pl-acciones">
                <a className="pl-boton" href="https://github.com/roblesgg" target="_blank" rel="noopener noreferrer">
                  <GithubLogo size={18} weight="bold" aria-hidden />
                  GitHub
                </a>
                <a
                  className="pl-boton pl-boton-borde"
                  href="https://www.linkedin.com/in/%C3%A1lvaro-robles-gonz%C3%A1lez-bbb017240/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LinkedinLogo size={18} weight="bold" aria-hidden />
                  LinkedIn
                </a>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="pl-foto">
                <img src="/alvaro.jpeg" alt="Álvaro Robles" width={420} height={420} loading="lazy" />
                <p>Álvaro Robles González</p>
                <small>Desarrollador de aplicaciones multiplataforma</small>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="pl-pie">
        <div className="pl-contenedor pl-pie-dentro">
          <span>© {new Date().getFullYear()} DripDev. Álvaro Robles González.</span>
          <a href="/">
            Ver los diseños 3D
            <ArrowUpRight size={14} weight="bold" aria-hidden />
          </a>
        </div>
      </footer>
    </div>
  )
}
