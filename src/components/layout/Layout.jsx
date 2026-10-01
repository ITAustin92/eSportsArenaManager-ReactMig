import Header from './Header'
import Navegacion from './Navegacion'
import Footer from './Footer'

function Layout({ vistaActiva, onNavegar, children }) {
  return (
    <div className="app">
      <Header />
      <Navegacion vistaActiva={vistaActiva} onNavegar={onNavegar} />
      <main className="contenido-principal">{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
