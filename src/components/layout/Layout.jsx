import Header from './Header'
import Footer from './Footer'

function Layout({ vistaActiva, onNavegar, children }) {
  return (
    <>
      <Header vistaActiva={vistaActiva} onNavegar={onNavegar} />
      <main className={vistaActiva === 'torneos' ? 'pagina-torneos' : vistaActiva === 'detalle' ? 'pagina-detalle' : undefined}>{children}</main>
      <Footer vistaActiva={vistaActiva} />
    </>
  )
}

export default Layout
