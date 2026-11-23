import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Campo from '../compartidos/Campo'
import Boton from '../compartidos/Boton'
import BadgeEstado from '../compartidos/BadgeEstado'
import BarraCupos from '../torneos/BarraCupos'
import EstadoCarga from '../compartidos/EstadoCarga'
import MensajeError from '../compartidos/MensajeError'
import useAuth from '../auth/useAuth'
import useCarga from '../../hooks/useCarga'
import useAhora from '../../logica/useAhora.js'
import { cargarCatalogo } from '../../servicios/catalogo.js'
import { equiposDeCapitan } from '../../servicios/equipos.js'
import {
	cancelarInscripcion,
	inscribirEquipo,
	inscribirJugador,
	inscripcionesDeEquipo,
	inscripcionesDeTorneo,
	misInscripcionesIndividuales,
} from '../../servicios/inscripciones.js'
import { ESTADOS_INSCRIPCION, etiqueta } from '../../logica/estados.js'
import {
	admiteInscripciones,
	cierreInscripcion,
	formatearFechaHora,
	inscripcionVigente,
} from '../../logica/torneos.js'

async function cargar(userId) {
	const [{ torneos, juegos }, equipos, individuales] = await Promise.all([
		cargarCatalogo(),
		equiposDeCapitan(userId),
		misInscripcionesIndividuales(),
	])
	const [porEquipo, porTorneo] = await Promise.all([
		Promise.all(equipos.map((e) => inscripcionesDeEquipo(e.equipoId))),
		Promise.all(
			torneos.filter(admiteInscripciones).map(async (t) => ({
				id: t.tournamentId,
				registros: await inscripcionesDeTorneo(t.tournamentId),
			})),
		),
	])
	return {
		torneos,
		juegos,
		equipos,
		inscripciones: [...individuales, ...porEquipo.flat()],
		porTorneo,
	}
}

export default function Inscripcion() {
	const { usuario } = useAuth()
	const [parametros] = useSearchParams()
	const carga = useCarga(() => cargar(usuario.userId), [usuario.userId])
	return (
		<>
			<p className="sobretitulo">Reserva tu lugar</p>
			<h1>Inscripción a torneo</h1>
			<EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar}>
				{carga.datos && (
					<Formulario
						datos={carga.datos}
						usuario={usuario}
						inicial={parametros.get('torneo') ?? ''}
						onCambio={carga.recargar}
					/>
				)}
			</EstadoCarga>
		</>
	)
}

function Formulario({ datos, usuario, inicial, onCambio }) {
	useAhora()
	const [seleccion, setSeleccion] = useState({ torneo: inicial, equipo: '' })
	const [error, setError] = useState('')
	const [aviso, setAviso] = useState('')
	const [enviando, setEnviando] = useState(false)
	const abiertos = datos.torneos.filter(admiteInscripciones)
	const torneo = datos.torneos.find((t) => String(t.tournamentId) === seleccion.torneo)
	const juego = datos.juegos.find((j) => j.juegoId === torneo?.gameId)
	const individual = juego?.jugadoresPorEquipo === 1
	const compatibles = datos.equipos.filter(
		(e) => e.estado === 'ACTIVO' && e.juegoPrincipalId === torneo?.gameId,
	)
	const equipo = compatibles.find((e) => String(e.equipoId) === seleccion.equipo)
	const ocupados =
		datos.porTorneo.find((t) => t.id === torneo?.tournamentId)?.registros.filter(inscripcionVigente)
			.length ?? 0
	const completo = individual || equipo?.miembros.length === juego?.jugadoresPorEquipo
	const lleno = torneo && ocupados >= (torneo.maxParticipants ?? 16)
	const bloqueado = !admiteInscripciones(torneo) || lleno || !completo
	const nombreTorneo = (id) => datos.torneos.find((t) => t.tournamentId === id)?.name ?? '#' + id
	const nombreParticipante = (r) =>
		r.userId
			? usuario.nombre
			: (datos.equipos.find((e) => e.equipoId === r.teamId)?.nombre ?? 'Equipo #' + r.teamId)

	const enviar = async (evento) => {
		evento.preventDefault()
		setError('')
		setAviso('')
		if (bloqueado || (!individual && !equipo)) {
			setError('Selecciona un torneo con cupos y un participante válido.')
			return
		}
		const repetida = datos.inscripciones.some(
			(r) =>
				r.tournamentId === torneo.tournamentId &&
				inscripcionVigente(r) &&
				(individual ? r.userId === usuario.userId : r.teamId === equipo.equipoId),
		)
		if (repetida) {
			setError('El participante ya está inscrito.')
			return
		}
		setEnviando(true)
		try {
			const creada = individual
				? await inscribirJugador(usuario.userId, torneo.tournamentId)
				: await inscribirEquipo(equipo.equipoId, torneo.tournamentId)
			setAviso('Inscripción #' + creada.registrationId + ' enviada para revisión.')
			setSeleccion({ torneo: '', equipo: '' })
			onCambio()
		} catch (fallo) {
			setError(fallo.message)
		} finally {
			setEnviando(false)
		}
	}
	const cancelar = async (r) => {
		if (!window.confirm('¿Cancelar la inscripción en ' + nombreTorneo(r.tournamentId) + '?')) {
			return
		}
		setEnviando(true)
		setError('')
		try {
			await cancelarInscripcion(r.registrationId)
			setAviso('Inscripción cancelada.')
			onCambio()
		} catch (fallo) {
			setError(fallo.message)
		} finally {
			setEnviando(false)
		}
	}
	return (
		<>
			{aviso && <p role="status">{aviso}</p>}
			<form className="panel mb-4" onSubmit={enviar} noValidate>
				<Campo
					id="inscripcion-torneo"
					nombre="torneo"
					etiqueta="Torneo"
					valor={seleccion.torneo}
					onCambiar={(e) => setSeleccion({ torneo: e.target.value, equipo: '' })}
					opciones={[
						{ valor: '', etiqueta: 'Selecciona un torneo abierto' },
						...abiertos.map((t) => ({ valor: String(t.tournamentId), etiqueta: t.name })),
					]}
				/>
				{torneo && (
					<>
						<p>Cierre: {formatearFechaHora(cierreInscripcion(torneo))}</p>
						<p>
							{ocupados} de {torneo.maxParticipants ?? 16} cupos ocupados
						</p>
						<BarraCupos inscritos={ocupados} maximo={torneo.maxParticipants ?? 16} />
						{individual ? (
							<p>Modalidad 1v1: te inscribirás como {usuario.nombre}.</p>
						) : (
							<>
								<Campo
									id="inscripcion-equipo"
									nombre="equipo"
									etiqueta="Equipo"
									valor={seleccion.equipo}
									onCambiar={(e) => setSeleccion((a) => ({ ...a, equipo: e.target.value }))}
									ayuda={
										'Se requieren ' + juego?.jugadoresPorEquipo + ' integrantes de ' + juego?.nombre
									}
									opciones={[
										{ valor: '', etiqueta: 'Selecciona tu equipo' },
										...compatibles.map((e) => ({
											valor: String(e.equipoId),
											etiqueta: e.nombre,
										})),
									]}
								/>
								{equipo && !completo && (
									<MensajeError>
										El equipo no tiene la cantidad de integrantes requerida.
									</MensajeError>
								)}
								{compatibles.length === 0 && (
									<p>
										<Link to="/equipos">Crea o completa un equipo de este juego.</Link>
									</p>
								)}
							</>
						)}
						{lleno && <MensajeError>No quedan cupos disponibles.</MensajeError>}
						{!admiteInscripciones(torneo) && (
							<MensajeError>El plazo de inscripción terminó.</MensajeError>
						)}
					</>
				)}
				<MensajeError>{error}</MensajeError>
				<Boton type="submit" disabled={enviando || bloqueado}>
					{enviando ? 'Enviando…' : 'Confirmar inscripción'}
				</Boton>
			</form>
			<section className="panel">
				<h2>Mis inscripciones</h2>
				{datos.inscripciones.length === 0 ? (
					<p>Todavía no hay inscripciones.</p>
				) : (
					<div className="table-responsive">
						<table className="table">
							<thead>
								<tr>
									<th scope="col">Torneo</th>
									<th scope="col">Participante</th>
									<th scope="col">Estado</th>
									<th scope="col">Acción</th>
								</tr>
							</thead>
							<tbody>
								{[...datos.inscripciones]
									.sort((a, b) => b.registrationId - a.registrationId)
									.map((r) => (
										<tr key={r.registrationId}>
											<th scope="row">{nombreTorneo(r.tournamentId)}</th>
											<td>{nombreParticipante(r)}</td>
											<td>
												<BadgeEstado estado={etiqueta(ESTADOS_INSCRIPCION, r.status)} />
											</td>
											<td>
												{inscripcionVigente(r) && (
													<Boton
														variante="secundario"
														disabled={enviando}
														onClick={() => cancelar(r)}
													>
														Cancelar
													</Boton>
												)}
											</td>
										</tr>
									))}
							</tbody>
						</table>
					</div>
				)}
			</section>
		</>
	)
}
