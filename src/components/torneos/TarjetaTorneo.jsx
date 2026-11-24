import './TarjetaTorneo.css'
import { Link } from 'react-router-dom'
import BadgeEstado from '../compartidos/BadgeEstado'
import { ESTADOS_TORNEO, etiqueta } from '../../logica/estados.js'
import { cierreInscripcion, formatearFecha, imagenJuego } from '../../logica/torneos.js'

function TarjetaTorneo({ torneo, juego, rutaDetalle = '/torneos/' }) {
	return (
		<article className="tarjeta-torneo card h-100">
			<img
				className="tarjeta-torneo-portada"
				src={imagenJuego(juego)}
				alt={'Torneo de ' + (juego?.nombre ?? 'eSports')}
				loading="lazy"
			/>
			<div className="card-body d-flex flex-column">
				<div>
					<BadgeEstado estado={etiqueta(ESTADOS_TORNEO, torneo.state)} />
				</div>
				<h3 className="tarjeta-torneo-titulo">{torneo.name}</h3>
				<dl className="tarjeta-torneo-datos">
					<dt>Juego</dt>
					<dd>{juego?.nombre ?? '—'}</dd>
					<dt>Modalidad</dt>
					<dd>{juego?.modalidad ?? '—'}</dd>
					<dt>Inicio</dt>
					<dd>{formatearFecha(torneo.startDate)}</dd>
					<dt>Término</dt>
					<dd>{formatearFecha(torneo.endDate)}</dd>
					<dt>Cierre de inscripción</dt>
					<dd>{formatearFecha(cierreInscripcion(torneo))}</dd>
				</dl>
				<Link className="boton boton-primario mt-auto" to={rutaDetalle + torneo.tournamentId}>
					Ver detalles
				</Link>
			</div>
		</article>
	)
}
export default TarjetaTorneo
