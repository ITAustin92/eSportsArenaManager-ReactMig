import './DetalleTorneo.css'
import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import BarraCupos from './BarraCupos'
import LlaveTorneo from './LlaveTorneo'
import Campo from '../compartidos/Campo'
import useAhora from '../../logica/useAhora.js'
import BadgeEstado from '../compartidos/BadgeEstado'
import EstadoCarga from '../compartidos/EstadoCarga'
import useCarga from '../../hooks/useCarga'
import useAuth from '../auth/useAuth'
import { cargarDetalleTorneo } from '../../servicios/catalogo.js'
import {
	ESTADOS_INSCRIPCION,
	ESTADOS_PARTIDA,
	ESTADOS_PREMIO,
	ESTADOS_TORNEO,
	TIPOS_PREMIO,
	etiqueta,
} from '../../logica/estados.js'
import {
	admiteInscripciones,
	cierreInscripcion,
	inscripcionVigente,
	formatearFecha,
	formatearFechaHora,
	nombreEquipo,
	ordenarRanking,
} from '../../logica/torneos.js'

// Detalle público de un torneo. Reúne datos de 7 microservicios a través del gateway.
function DetalleTorneo() {
	const { id } = useParams()
	const { datos, error, cargando, recargar } = useCarga(() => cargarDetalleTorneo(id), [id])
	return (
		<EstadoCarga cargando={cargando} error={error} onReintentar={recargar}>
			{datos && <ContenidoDetalle detalle={datos} />}
		</EstadoCarga>
	)
}

export function ContenidoDetalle({ detalle, mostrarAcciones = true }) {
	const { rol } = useAuth()
	const {
		torneo,
		juego,
		inscripciones,
		ranking,
		partidas,
		premios,
		equipos,
		jugadores = [],
	} = detalle
	useAhora()
	const [rondaElegida, setRondaElegida] = useState('')
	const rondas = [...new Set(partidas.map((p) => p.round || 'General'))]
	const ronda = rondas.includes(rondaElegida) ? rondaElegida : rondas[0]
	const nombreParticipante = (i) =>
		i.userId
			? (jugadores.find((j) => j.usuarioId === i.userId)?.nickname ?? 'Jugador #' + i.userId)
			: nombreEquipo(equipos, i.teamId)
	const nombreLocal = (partida) =>
		nombreParticipante({ userId: partida.homeUserId, teamId: partida.homeTeamId })
	const nombreVisita = (partida) =>
		nombreParticipante({ userId: partida.awayUserId, teamId: partida.awayTeamId })
	const vigentes = inscripciones.filter(inscripcionVigente)
	const maximo = torneo.maxParticipants ?? 16
	const fallos = detalle.fallos ?? []
	const cuposDisponibles = !fallos.includes('inscripciones')
	return (
		<>
			<section className="panel detalle-cabecera mb-4">
				<p className="sobretitulo">{juego?.nombre ?? 'Torneo'}</p>
				<h1>{torneo.name}</h1>
				<BadgeEstado estado={etiqueta(ESTADOS_TORNEO, torneo.state)} />
				<dl className="datos-definicion mt-3">
					<dt>Modalidad</dt>
					<dd>
						{juego ? juego.modalidad + ' · ' + juego.jugadoresPorEquipo + ' por equipo' : '—'}
					</dd>
					<dt>Inicio</dt>
					<dd>{formatearFecha(torneo.startDate)}</dd>
					<dt>Término</dt>
					<dd>{formatearFecha(torneo.endDate)}</dd>
					<dt>Participantes inscritos</dt>
					<dd>
						{cuposDisponibles ? `${vigentes.length} / ${maximo}` : 'Información no disponible'}
					</dd>
					<dt>Cierre de inscripción</dt>
					<dd>{formatearFechaHora(cierreInscripcion(torneo))}</dd>
				</dl>
				{cuposDisponibles && <BarraCupos inscritos={vigentes.length} maximo={maximo} />}
				{cuposDisponibles && vigentes.length >= maximo && (
					<p role="status">No quedan cupos disponibles.</p>
				)}
				{mostrarAcciones &&
					cuposDisponibles &&
					admiteInscripciones(torneo) &&
					vigentes.length < maximo && (
						<div className="acciones mt-3">
							{rol === 'JUGADOR' ? (
								<Link
									className="boton boton-primario"
									to={'/inscripcion?torneo=' + torneo.tournamentId}
								>
									{juego?.jugadoresPorEquipo === 1 ? 'Inscribirme' : 'Inscribir a mi equipo'}
								</Link>
							) : rol === 'visitante' ? (
								<Link className="boton boton-primario" to="/login">
									Inicia sesión para inscribirte
								</Link>
							) : null}
						</div>
					)}
				{detalle.incompleto && (
					<p className="texto-secundario mt-3 mb-0">
						Algunos servicios no respondieron; se muestra la información disponible.
					</p>
				)}
			</section>

			<div className="row g-4">
				<section className="col-12 col-lg-6">
					<div className="panel h-100">
						<h2>Participantes inscritos</h2>
						{!cuposDisponibles ? (
							<p>No pudimos consultar las inscripciones. Intenta de nuevo más tarde.</p>
						) : vigentes.length === 0 ? (
							<p>Aún no hay participantes inscritos.</p>
						) : (
							<ul className="lista-limpia">
								{vigentes.map((i) => (
									<li
										key={i.registrationId}
										className="separador-fila d-flex justify-content-between gap-2"
									>
										<span>{nombreParticipante(i)}</span>
										<BadgeEstado estado={etiqueta(ESTADOS_INSCRIPCION, i.status)} />
									</li>
								))}
							</ul>
						)}
					</div>
				</section>
				<section className="col-12 col-lg-6">
					<div className="panel h-100">
						<h2>Premios</h2>
						{fallos.includes('premios') ? (
							<p>No pudimos consultar los premios.</p>
						) : premios.length === 0 ? (
							<p>Este torneo no tiene premios registrados.</p>
						) : (
							<ul className="lista-limpia">
								{premios.map((p) => (
									<li key={p.prizeId} className="separador-fila">
										<strong>{p.description}</strong>
										<br />
										<span className="texto-secundario">
											{etiqueta(TIPOS_PREMIO, p.type)}
											{p.amount > 0 ? ' · $' + p.amount.toLocaleString('es-CL') : ''} ·{' '}
											{etiqueta(ESTADOS_PREMIO, p.status)}
											{p.teamId ? ' · ' + nombreEquipo(equipos, p.teamId) : ''}
										</span>
									</li>
								))}
							</ul>
						)}
					</div>
				</section>
				<section className="col-12">
					<div className="panel">
						<h2>Clasificación</h2>
						<div className="table-responsive" role="region" aria-label="Clasificación" tabIndex="0">
							<table className="table">
								<thead>
									<tr>
										<th scope="col">Pos.</th>
										<th scope="col">Participante</th>
										<th scope="col">PJ</th>
										<th scope="col">Victorias</th>
										<th scope="col">Derrotas</th>
										<th scope="col">Puntos</th>
									</tr>
								</thead>
								<tbody>
									{ordenarRanking(ranking).map((fila, posicion) => (
										<tr key={fila.rankingId ?? fila.teamId}>
											<td>{posicion + 1}</td>
											<th scope="row">{nombreParticipante(fila)}</th>
											<td>{fila.matchesPlayed}</td>
											<td>{fila.wins}</td>
											<td>{fila.losses}</td>
											<td>{fila.points}</td>
										</tr>
									))}
								</tbody>
							</table>
							{ranking.length === 0 && (
								<p className="mt-2">
									{fallos.includes('ranking')
										? 'No pudimos consultar la clasificación.'
										: 'Aún no hay posiciones registradas.'}
								</p>
							)}
						</div>
					</div>
				</section>
				<section className="col-12">
					<div className="panel">
						<h2>Partidas y llaves</h2>
						{rondas.length > 0 && (
							<Campo
								id="ronda"
								nombre="ronda"
								etiqueta="Ronda visible"
								valor={ronda}
								onCambiar={(e) => setRondaElegida(e.target.value)}
								opciones={rondas.map((r) => ({ valor: r, etiqueta: r }))}
							/>
						)}
						<div role="tablist" aria-label="Rondas del torneo" className="acciones my-3">
							{rondas.map((r) => (
								<button
									type="button"
									key={r}
									role="tab"
									aria-selected={r === ronda}
									aria-controls="partidas-ronda"
									id={'ronda-' + rondas.indexOf(r)}
									className="boton boton-secundario"
									onClick={() => setRondaElegida(r)}
								>
									{r}
								</button>
							))}
						</div>
						{fallos.includes('partidas') ? (
							<p>No pudimos consultar las partidas.</p>
						) : partidas.length === 0 ? (
							<p>No hay partidas programadas.</p>
						) : (
							<ul className="lista-limpia" id="partidas-ronda" role="tabpanel" aria-label={ronda}>
								{partidas
									.filter((p) => (p.round || 'General') === ronda)
									.sort((a, b) => String(a.matchDate).localeCompare(String(b.matchDate)))
									.map((m) => (
										<li key={m.matchId} className="separador-fila">
											<LlaveTorneo local={nombreLocal(m)} visitante={nombreVisita(m)} />
											<BadgeEstado estado={etiqueta(ESTADOS_PARTIDA, m.status)} />{' '}
											<strong>{nombreLocal(m)}</strong> {m.homeScore ?? '-'} : {m.awayScore ?? '-'}{' '}
											<strong>{nombreVisita(m)}</strong>
											<br />
											<span className="texto-secundario">{formatearFechaHora(m.matchDate)}</span>
										</li>
									))}
							</ul>
						)}
					</div>
				</section>
			</div>
			{mostrarAcciones && (
				<p className="mt-4">
					<Link to="/torneos">← Volver al catálogo</Link>
				</p>
			)}
		</>
	)
}
export default DetalleTorneo
