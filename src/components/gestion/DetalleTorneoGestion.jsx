import { Link, useParams } from 'react-router-dom'
import EstadoCarga from '../compartidos/EstadoCarga'
import useCarga from '../../hooks/useCarga'
import { cargarDetalleTorneo } from '../../servicios/catalogo.js'
import { ContenidoDetalle } from '../torneos/DetalleTorneo'
import AdminCompeticion from '../admin/AdminCompeticion'
import useAuth from '../auth/useAuth'

// Detalle de torneo dentro de la gestión (ORGANIZADOR / ADMIN), sin acciones de jugador.
function DetalleTorneoGestion() {
	const { rol } = useAuth()
	const { id } = useParams()
	const { datos, error, cargando, recargar } = useCarga(() => cargarDetalleTorneo(id), [id])
	return (
		<>
			<p>
				<Link to="/gestion/torneos">← Volver a torneos</Link>
			</p>
			<EstadoCarga cargando={cargando} error={error} onReintentar={recargar}>
				{datos && (
					<>
						<ContenidoDetalle detalle={datos} mostrarAcciones={false} />
						{rol === 'ADMIN' && <AdminCompeticion detalle={datos} onCambio={recargar} />}
						<p className="mt-4">
							<Link to={'/gestion/inscripciones?torneo=' + datos.torneo.tournamentId}>
								Ver inscripciones de este torneo →
							</Link>
						</p>
					</>
				)}
			</EstadoCarga>
		</>
	)
}
export default DetalleTorneoGestion
