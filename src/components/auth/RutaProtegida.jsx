import { Link, Navigate, useLocation } from 'react-router-dom'
import useAuth from './useAuth'
import { puedeAcceder } from '../../logica/acceso.js'

function RutaProtegida({ children }) {
	const { rol } = useAuth()
	const ubicacion = useLocation()
	if (rol === 'visitante') {
		return <Navigate to="/login" state={{ desde: ubicacion.pathname + ubicacion.search }} replace />
	}
	if (!puedeAcceder(rol, ubicacion.pathname)) {
		return (
			<section className="panel">
				<h1>403 · Acceso denegado</h1>
				<p>Tu rol no tiene permiso para acceder a esta vista.</p>
				<Link to="/">Volver al inicio</Link>
			</section>
		)
	}
	return children
}
export default RutaProtegida
