import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Cabecera from './Cabecera'
import Navegacion from './Navegacion'
import PieDePagina from './PieDePagina'
import MensajeError from '../compartidos/MensajeError'
import useAuth from '../auth/useAuth'

function Layout({ children }) {
  const { pathname } = useLocation()
  const { errorSesion } = useAuth()
  useEffect(() => {
    const anterior = document.title
    document.title = 'eSports Arena Manager · ' + (pathname === '/' ? 'Inicio' : pathname.split('/').filter(Boolean).join(' / '))
    window.scrollTo(0, 0)
    return () => { document.title = anterior }
  }, [pathname])
  return <div className="app"><a className="salto-contenido" href="#contenido">Saltar al contenido</a><Cabecera /><Navegacion /><main id="contenido" className="container app-contenido"><MensajeError>{errorSesion}</MensajeError>{children}</main><PieDePagina /></div>
}
export default Layout
