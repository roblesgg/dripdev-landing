import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="error-pagina">
      <div>
        <p className="error-codigo mono">404</p>
        <h1>Esta página no existe.</h1>
        <p>Puede que el enlace esté mal escrito o que ya no esté aquí.</p>
        <Link href="/" className="boton boton-primario">Volver al inicio</Link>
      </div>
    </main>
  )
}
