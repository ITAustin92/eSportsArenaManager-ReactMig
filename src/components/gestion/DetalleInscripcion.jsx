import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BadgeEstado from '../compartidos/BadgeEstado'
import Boton from '../compartidos/Boton'
import EstadoCarga from '../compartidos/EstadoCarga'
import MensajeError from '../compartidos/MensajeError'
import useAuth from '../auth/useAuth'
import useCarga from '../../hooks/useCarga'
import { obtenerTorneo } from '../../servicios/catalogo.js'
import { listarUsuarios, obtenerEquipo, obtenerUsuario } from '../../servicios/equipos.js'
import {
	cambiarEstadoInscripcion,
	cancelarInscripcion,
	obtenerInscripcion,
} from '../../servicios/inscripciones.js'
import {
	ESTADOS_EQUIPO,
	ESTADOS_INSCRIPCION,
	ESTADOS_TORNEO,
	etiqueta,
} from '../../logica/estados.js'
import { formatearFecha } from '../../logica/torneos.js'

async function cargar(id) {
	const inscripcion = await obtenerInscripcion(id)
	const [equipo, torneo, usuarios] = await Promise.all([
		inscripcion.teamId
			? obtenerEquipo(inscripcion.teamId)
			: obtenerUsuario(inscripcion.userId).then((u) => ({
					nombre: u.nickname,
					capitanId: u.usuarioId,
					estado: u.estado,
					miembros: [{ usuarioId: u.usuarioId, rolDentroEquipo: 'Jugador' }],
				})),
		obtenerTorneo(inscripcion.tournamentId),
		listarUsuarios(),
	])
	return { inscripcion, equipo, torneo, usuarios }
}

// Detalle de una inscripción ("orden"). El ORGANIZADOR solo la ve; el ADMIN además puede
// confirmarla, rechazarla o cancelarla (PATCH /registrations/{id}/status, DELETE /registrations/{id}).
function DetalleInscripcion() {
	const { id } = useParams()
	const { rol } = useAuth()
	const { datos, error, cargando, recargar } = useCarga(() => cargar(id), [id])
	const [errorAccion, setErrorAccion] = useState('')
	const [aviso, setAviso] = useState('')
	const accion = async (fn, texto) => {
		setErrorAccion('')
		setAviso('')
		try {
			await fn()
			setAviso(texto)
			recargar()
		} catch (fallo) {
			setErrorAccion(fallo.message)
		}
	}
	const usuario = (uid) => datos?.usuarios.find((u) => u.usuarioId === uid)
	return (
		<>
			<p>
				<Link to="/gestion/inscripciones">← Volver a inscripciones</Link>
			</p>
			<EstadoCarga cargando={cargando} error={error} onReintentar={recargar}>
				{datos && (
					<div className="row g-4">
						<section className="col-12">
							<div className="panel detalle-cabecera">
								<p className="sobretitulo">Inscripción #{datos.inscripcion.registrationId}</p>
								<h1>
									{datos.equipo.nombre} → {datos.torneo.name}
								</h1>
								<BadgeEstado estado={etiqueta(ESTADOS_INSCRIPCION, datos.inscripcion.status)} />
								<dl className="datos-definicion mt-3">
									<dt>Fecha de inscripción</dt>
									<dd>{formatearFecha(datos.inscripcion.registrationDate)}</dd>
									<dt>Estado del torneo</dt>
									<dd>{etiqueta(ESTADOS_TORNEO, datos.torneo.state)}</dd>
									<dt>Fechas del torneo</dt>
									<dd>
										{formatearFecha(datos.torneo.startDate)} –{' '}
										{formatearFecha(datos.torneo.endDate)}
									</dd>
								</dl>
								{aviso && (
									<p role="status" className="mt-3">
										{aviso}
									</p>
								)}
								<MensajeError>{errorAccion}</MensajeError>
								{rol === 'ADMIN' && datos.inscripcion.status !== 'CANCELLED' && (
									<div className="acciones mt-3">
										{datos.inscripcion.status !== 'CONFIRMED' && (
											<Boton
												onClick={() =>
													accion(
														() => cambiarEstadoInscripcion(id, 'CONFIRMED'),
														'Inscripción confirmada.',
													)
												}
											>
												Confirmar
											</Boton>
										)}
										{datos.inscripcion.status !== 'REJECTED' && (
											<Boton
												variante="secundario"
												onClick={() =>
													accion(
														() => cambiarEstadoInscripcion(id, 'REJECTED'),
														'Inscripción rechazada.',
													)
												}
											>
												Rechazar
											</Boton>
										)}
										<Boton
											variante="secundario"
											onClick={() =>
												window.confirm('¿Cancelar esta inscripción?') &&
												accion(() => cancelarInscripcion(id), 'Inscripción cancelada.')
											}
										>
											Cancelar
										</Boton>
									</div>
								)}
							</div>
						</section>
						<section className="col-12 col-lg-6">
							<div className="panel h-100">
								<h2>Equipo</h2>
								<BadgeEstado estado={etiqueta(ESTADOS_EQUIPO, datos.equipo.estado)} />
								<p className="mt-2">
									Capitán:{' '}
									<strong>
										{usuario(datos.equipo.capitanId)?.nombre ?? '#' + datos.equipo.capitanId}
									</strong>
								</p>
								<ul className="lista-limpia mb-0">
									{datos.equipo.miembros.map((m) => (
										<li key={m.miembroId ?? m.usuarioId} className="separador-fila">
											{usuario(m.usuarioId)?.nombre ?? 'Usuario #' + m.usuarioId}{' '}
											<span className="texto-secundario">
												@{usuario(m.usuarioId)?.nickname ?? '—'} · {m.rolDentroEquipo}
											</span>
										</li>
									))}
								</ul>
							</div>
						</section>
						<section className="col-12 col-lg-6">
							<div className="panel h-100">
								<h2>Torneo</h2>
								<p>{datos.torneo.name}</p>
								<Link to={'/gestion/torneos/' + datos.torneo.tournamentId}>
									Ver detalle del torneo →
								</Link>
							</div>
						</section>
					</div>
				)}
			</EstadoCarga>
		</>
	)
}
export default DetalleInscripcion
