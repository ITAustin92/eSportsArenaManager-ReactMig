import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Cabecera from './Cabecera'
import Navegacion from './Navegacion'
import PieDePagina from './PieDePagina'
import MensajeError from '../compartidos/MensajeError'
import Boton from '../compartidos/Boton'
import useAuth from '../auth/useAuth'

function Layout({ children }) {
	const { pathname } = useLocation()
	const { errorSesion, expirada, cerrarAviso } = useAuth()
	useEffect(() => {
		const anterior = document.title
		document.title =
			'eSports Arena Manager · ' +
			(pathname === '/' ? 'Inicio' : pathname.split('/').filter(Boolean).join(' / '))
		window.scrollTo(0, 0)
		return () => {
			document.title = anterior
		}
	}, [pathname])
	return (
		<div className="app">
			<a className="salto-contenido" href="#contenido">
				Saltar al contenido
			</a>
			{pathname !== '/' && (
				<>
					<Cabecera />
					<Navegacion />
				</>
			)}
			<main
				id="contenido"
				className={'container app-contenido' + (pathname === '/' ? ' app-contenido--inicio' : '')}
			>
				{expirada && (
					<div className="panel mb-4 aviso-sesion" role="alert">
						<strong>Tu sesión expiró.</strong> Por seguridad cerramos la sesión.{' '}
						<Link to="/login" onClick={cerrarAviso}>
							Vuelve a iniciar sesión
						</Link>
						<Boton variante="secundario" onClick={cerrarAviso} aria-label="Cerrar aviso">
							×
						</Boton>
					</div>
				)}
				<MensajeError>{errorSesion}</MensajeError>
				{children}
			</main>
			<PieDePagina />
		</div>
	)
}
export default Layout
