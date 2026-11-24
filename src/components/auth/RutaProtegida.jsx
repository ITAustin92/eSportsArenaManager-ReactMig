import { Link, Navigate, useLocation } from 'react-router-dom'
import useAuth from './useAuth'
import { INICIO_POR_ROL } from '../../logica/acceso.js'
import { NOMBRE_ROL } from '../../logica/estados.js'

// Guardia de rutas del frontend.
// - Visitante en ruta privada: va a /login y se recuerda a dónde quería ir.
// - Rol sin permiso: muestra 403 (no se renderiza la vista ni se piden sus datos).
// Ocultar es la primera barrera; si alguien llama a la API igual, el backend responde 403.
function RutaProtegida({ roles, children }) {
	const { rol } = useAuth()
	const ubicacion = useLocation()
	if (rol === 'visitante') {
		return <Navigate to="/login" state={{ desde: ubicacion.pathname + ubicacion.search }} replace />
	}
	if (roles && !roles.includes(rol)) {
		return (
			<section className="panel">
				<p className="sobretitulo">Error 403</p>
				<h1>Acceso denegado</h1>
				<p>
					Tu rol ({NOMBRE_ROL[rol] ?? rol}) no tiene permiso para abrir esta sección. Si se intenta
					la acción directamente contra la API, el servidor también responde 403.
				</p>
				<Link className="boton boton-primario" to={INICIO_POR_ROL[rol] ?? '/'}>
					Ir a mi inicio
				</Link>
			</section>
		)
	}
	return children
}
export default RutaProtegida
