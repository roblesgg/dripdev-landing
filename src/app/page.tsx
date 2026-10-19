import { ArrowUpRight, GithubLogo, LinkedinLogo } from '@phosphor-icons/react/dist/ssr'
import { Nav } from '@/components/Nav'
import { Escena } from '@/components/Escena'
import { Actividad } from '@/components/Actividad'
import { FilaProyecto } from '@/components/FilaProyecto'
import { Reveal } from '@/components/Reveal'
import { actividadReciente, datosDeRepo, fechaCorta } from '@/lib/github'
import { gruposEstado, proyectos, stack } from '@/lib/proyectos'

// Datos de GitHub: se recalculan como mucho una vez por hora.
export const revalidate = 3600

const CORREO = 'Roblesgg16@gmail.com'

export default async function Home() {
  const [commits, datos] = await Promise.all([
    actividadReciente(6),
    Promise.all(proyectos.map((p) => (p.repo && p.estado !== 'proximamente' ? datosDeRepo(p.repo) : null))),
  ])

  // Con menos de tres commits el panel parece vacío: mejor no enseñarlo.
  const hayActividad = !!commits && commits.length >= 3

  return (
    <>
      <a className="skip" href="#proyectos">Saltar al contenido</a>
      <Escena />
      <Nav />

      <main>
        <section className="hero" aria-labelledby="titulo-hero">
          <div className="contenedor">
            <div>
              <Reveal>
                <h1 id="titulo-hero">Construyo las apps que uso.</h1>
              </Reveal>
              <Reveal delay={0.08}>
                <p className="hero-sub">
                  DripDev es mi estudio independiente: apps para Android, web y escritorio, publicadas y
                  mantenidas por mí.
                </p>
              </Reveal>
              <Reveal delay={0.16}>
                <div className="hero-acciones">
                  <a className="boton boton-primario" href="#proyectos">Ver proyectos</a>
                  <a
                    className="boton boton-secundario"
                    href="https://github.com/roblesgg"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                    <ArrowUpRight size={16} weight="regular" aria-hidden />
                  </a>
                </div>
              </Reveal>
            </div>

          </div>
        </section>

        {hayActividad && (
          <section id="actividad" className="seccion seccion-corta" aria-labelledby="titulo-actividad">
            <div className="contenedor">
              <Reveal>
                <h2 id="titulo-actividad" className="seccion-titulo">Lo último que he hecho</h2>
                <p className="seccion-intro">Commits reales de mis repositorios públicos, tal como salen de GitHub.</p>
              </Reveal>
              <Reveal delay={0.06} className="actividad-envoltorio">
                <Actividad commits={commits} />
              </Reveal>
            </div>
          </section>
        )}

        <section id="proyectos" className="seccion" aria-labelledby="titulo-proyectos">
          <div className="contenedor">
            <Reveal>
              <h2 id="titulo-proyectos" className="seccion-titulo">Proyectos</h2>
              <p className="seccion-intro">
                Lo que ya se puede usar, lo que sigue en beta y lo que está por llegar.
              </p>
            </Reveal>

            <div className="grupos">
              {gruposEstado.map(({ estado, titulo, nota }) => (
                <Reveal key={estado} className="panel">
                  <h3 className="grupo-titulo">{titulo}</h3>
                  <p className="grupo-nota">{nota}</p>
                  <div className="filas" role="list">
                    {proyectos.map((p, i) =>
                      p.estado !== estado ? null : (
                        <FilaProyecto
                          key={p.id}
                          proyecto={p}
                          version={datos[i]?.version ?? null}
                          fechaVersion={datos[i]?.fechaVersion ? fechaCorta(datos[i]!.fechaVersion!) : null}
                        />
                      ),
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="stack" className="seccion" aria-labelledby="titulo-stack">
          <div className="contenedor">
            <Reveal>
              <h2 id="titulo-stack" className="seccion-titulo">Con qué lo construyo</h2>
            </Reveal>
            <Reveal delay={0.05} className="panel" >
              <dl className="stack" style={{ marginTop: 0 }}>
                {stack.map(({ area, items }) => (
                  <div key={area}>
                    <dt>{area}</dt>
                    <dd>{items}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        <section id="contacto" className="seccion" aria-labelledby="titulo-contacto">
          <div className="contenedor contacto-envoltorio">
           <div className="contacto panel">
            <Reveal className="persona">
              <img src="/alvaro.jpeg" alt="Álvaro Robles" width={132} height={132} loading="lazy" />
              <p className="persona-nombre">Álvaro Robles González</p>
              <p className="persona-cargo">Desarrollador de aplicaciones multiplataforma</p>
            </Reveal>

            <Reveal delay={0.08}>
              <h2 id="titulo-contacto" className="seccion-titulo">Sobre mí</h2>
              <p className="contacto-texto" style={{ marginTop: 16 }}>
                Soy <strong>Álvaro</strong>, de Murcia. Desarrollo y mantengo estos proyectos por mi cuenta.
                Si tienes una idea, has encontrado un fallo o quieres probar alguna de las apps, escríbeme.
              </p>
              <a className="contacto-correo" href={`mailto:${CORREO}`}>{CORREO}</a>
              <div className="contacto-enlaces">
                <a href="https://github.com/roblesgg" target="_blank" rel="noopener noreferrer">
                  <GithubLogo size={18} aria-hidden />
                  GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/%C3%A1lvaro-robles-gonz%C3%A1lez-bbb017240/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LinkedinLogo size={18} aria-hidden />
                  LinkedIn
                </a>
              </div>
            </Reveal>
           </div>
          </div>
        </section>
      </main>

      <footer className="pie">
        <div className="contenedor pie-dentro">
          <span>© {new Date().getFullYear()} DripDev. Álvaro Robles González.</span>
          <span>Murcia, España</span>
        </div>
      </footer>
    </>
  )
}
