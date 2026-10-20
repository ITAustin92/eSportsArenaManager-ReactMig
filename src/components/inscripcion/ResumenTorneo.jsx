import BadgeEstado from '../compartidos/BadgeEstado'
import { cuposDisponibles, formatearFecha } from '../../logica/torneos.js'
function ResumenTorneo({ torneo, juego }) {
	return (
		<aside className="panel">
			<p className="sobretitulo">Tu próxima competencia</p>
			<h2>{torneo.nombre}</h2>
			<BadgeEstado estado={torneo.estado} />
			<p className="mt-3">
				{juego.nombre} · {juego.modalidad}
			</p>
			<p>Cierre: {formatearFecha(torneo.cierreISO)}</p>
			<p>
				<strong>{cuposDisponibles(torneo)}</strong> cupos disponibles
			</p>
		</aside>
	)
}
export default ResumenTorneo
