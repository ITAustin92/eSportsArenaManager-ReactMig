import { useState } from 'react'
import { Link } from 'react-router-dom'
import BadgeEstado from '../compartidos/BadgeEstado'
import Boton from '../compartidos/Boton'
import Campo from '../compartidos/Campo'
import EstadoCarga from '../compartidos/EstadoCarga'
import MensajeError from '../compartidos/MensajeError'
import useCarga from '../../hooks/useCarga'
import {
	actualizarTorneo,
	cancelarTorneo,
	crearTorneo,
	listarJuegosActivos,
	listarTorneos,
} from '../../servicios/catalogo.js'
import { listarUsuarios } from '../../servicios/equipos.js'
import { ESTADOS_TORNEO, etiqueta } from '../../logica/estados.js'
import { formatearFecha, hoyISO, opcionesEstadoTorneo } from '../../logica/torneos.js'
import { hayErrores, validarTorneo } from '../../logica/validaciones.js'

// CRUD de torneos: POST/PUT/DELETE /api/v1/tournaments (solo ADMIN).
// DELETE no borra el registro: lo deja CANCELLED (las inscripciones conservan su referencia).
function AdminTorneos() {
	const { datos, error, cargando, recargar } = useCarga(async () => {
		const [torneos, juegos, usuarios] = await Promise.all([
			listarTorneos(),
			listarJuegosActivos(),
			listarUsuarios(),
		])
		return {
			torneos,
			juegos,
			organizadores: usuarios.filter(
				(u) => ['ADMIN', 'ORGANIZER'].includes(u.rol) && u.estado === 'ACTIVO',
			),
		}
	})
	const [formulario, setFormulario] = useState(null)
	const [errores, setErrores] = useState({})
	const [errorAccion, setErrorAccion] = useState('')
	const [aviso, setAviso] = useState('')
	const cambiar = (e) => setFormulario((a) => ({ ...a, [e.target.name]: e.target.value }))
	const abrir = (t) => {
		setErrores({})
		setErrorAccion('')
		setAviso('')
		setFormulario(
			t
				? {
						id: t.tournamentId,
						name: t.name,
						gameId: String(t.gameId),
						organizerId: String(t.organizerId),
						startDate: t.startDate,
						endDate: t.endDate,
						state: t.state,
						maxParticipants: t.maxParticipants ?? 16,
						registrationDeadline: t.registrationDeadline
							? new Date(
									new Date(t.registrationDeadline).getTime() -
										new Date(t.registrationDeadline).getTimezoneOffset() * 60000,
								)
									.toISOString()
									.slice(0, 16)
							: '',
					}
				: {
						name: '',
						gameId: datos.juegos[0] ? String(datos.juegos[0].juegoId) : '',
						organizerId: datos.organizadores[0] ? String(datos.organizadores[0].usuarioId) : '',
						startDate: '',
						endDate: '',
						state: 'UPCOMING',
						maxParticipants: 16,
						registrationDeadline: '',
					},
		)
	}
	const guardar = async (e) => {
		e.preventDefault()
		const encontrados = validarTorneo(formulario, { esNuevo: !formulario.id, hoy: hoyISO() })
		setErrores(encontrados)
		setErrorAccion('')
		if (hayErrores(encontrados)) {
			return
		}
		const cuerpo = {
			name: formulario.name.trim(),
			gameId: Number(formulario.gameId),
			organizerId: Number(formulario.organizerId),
			startDate: formulario.startDate,
			endDate: formulario.endDate,
			state: formulario.state,
			maxParticipants: Number(formulario.maxParticipants),
			registrationDeadline: formulario.registrationDeadline
				? new Date(formulario.registrationDeadline).toISOString()
				: null,
		}
		try {
			if (formulario.id) {
				await actualizarTorneo(formulario.id, cuerpo)
			} else {
				await crearTorneo(cuerpo)
			}
			setAviso(formulario.id ? 'Torneo actualizado.' : 'Torneo creado.')
			setFormulario(null)
			recargar()
		} catch (fallo) {
			setErrorAccion(fallo.message)
		}
	}
	const cancelar = async (t) => {
		if (!window.confirm('¿Cancelar el torneo "' + t.name + '"?')) {
			return
		}
		setErrorAccion('')
		try {
			await cancelarTorneo(t.tournamentId)
			setAviso('Torneo cancelado.')
			recargar()
		} catch (fallo) {
			setErrorAccion(fallo.message)
		}
	}
	return (
		<EstadoCarga cargando={cargando} error={error} onReintentar={recargar}>
			{datos && (
				<>
					{aviso && <p role="status">{aviso}</p>}
					<MensajeError>{errorAccion}</MensajeError>
					{formulario ? (
						<form className="panel formulario-admin mb-4" noValidate onSubmit={guardar}>
							<h2>{formulario.id ? 'Editar torneo #' + formulario.id : 'Nuevo torneo'}</h2>
							<div className="row g-3">
								<div className="col-12 col-md-6">
									<Campo
										id="torneo-nombre"
										nombre="name"
										etiqueta="Nombre"
										valor={formulario.name}
										onCambiar={cambiar}
										error={errores.name}
									/>
								</div>
								<div className="col-12 col-md-3">
									<Campo
										id="torneo-juego"
										nombre="gameId"
										etiqueta="Juego"
										valor={formulario.gameId}
										onCambiar={cambiar}
										error={errores.gameId}
										disabled={Boolean(formulario.id)}
										opciones={datos.juegos.map((j) => ({
											valor: String(j.juegoId),
											etiqueta: j.nombre,
										}))}
									/>
								</div>
								<div className="col-12 col-md-3">
									<Campo
										id="torneo-organizador"
										nombre="organizerId"
										etiqueta="Organizador"
										valor={formulario.organizerId}
										onCambiar={cambiar}
										error={errores.organizerId}
										disabled={Boolean(formulario.id)}
										opciones={datos.organizadores.map((u) => ({
											valor: String(u.usuarioId),
											etiqueta: u.nombre,
										}))}
									/>
								</div>
								<div className="col-12 col-md-4">
									<Campo
										id="torneo-inicio"
										nombre="startDate"
										etiqueta="Inicio"
										tipo="date"
										valor={formulario.startDate}
										onCambiar={cambiar}
										error={errores.startDate}
									/>
								</div>
								<div className="col-12 col-md-4">
									<Campo
										id="torneo-termino"
										nombre="endDate"
										etiqueta="Término"
										tipo="date"
										valor={formulario.endDate}
										onCambiar={cambiar}
										error={errores.endDate}
									/>
								</div>
								<div className="col-12 col-md-4">
									<Campo
										id="torneo-estado"
										nombre="state"
										etiqueta="Estado"
										valor={formulario.state}
										onCambiar={cambiar}
										error={errores.state}
										opciones={opcionesEstadoTorneo}
									/>
								</div>
							</div>
							<div className="row g-3">
								<div className="col-12 col-md-6">
									<Campo
										id="torneo-cupos"
										nombre="maxParticipants"
										etiqueta="Cupos máximos"
										tipo="number"
										valor={formulario.maxParticipants}
										onCambiar={cambiar}
										error={errores.maxParticipants}
									/>
								</div>
								<div className="col-12 col-md-6">
									<Campo
										id="torneo-cierre"
										nombre="registrationDeadline"
										etiqueta="Cierre de inscripción"
										tipo="datetime-local"
										valor={formulario.registrationDeadline}
										onCambiar={cambiar}
										ayuda="Hora local de tu dispositivo. Vacío: inicio del torneo en Chile."
										error={errores.registrationDeadline}
									/>
								</div>
							</div>
							<div className="acciones">
								<Boton type="submit">Guardar</Boton>
								<Boton variante="secundario" onClick={() => setFormulario(null)}>
									Cancelar
								</Boton>
							</div>
						</form>
					) : (
						<div className="acciones mb-4">
							<Boton onClick={() => abrir(null)}>Nuevo torneo</Boton>
						</div>
					)}
					<div className="panel table-responsive" role="region" aria-label="Torneos" tabIndex="0">
						<table className="table">
							<thead>
								<tr>
									<th scope="col">ID</th>
									<th scope="col">Torneo</th>
									<th scope="col">Fechas</th>
									<th scope="col">Estado</th>
									<th scope="col">Acciones</th>
								</tr>
							</thead>
							<tbody>
								{datos.torneos.map((t) => (
									<tr key={t.tournamentId}>
										<td>{t.tournamentId}</td>
										<th scope="row">
											<Link to={'/gestion/torneos/' + t.tournamentId}>{t.name}</Link>
										</th>
										<td>
											{formatearFecha(t.startDate)} – {formatearFecha(t.endDate)}
										</td>
										<td>
											<BadgeEstado estado={etiqueta(ESTADOS_TORNEO, t.state)} />
										</td>
										<td>
											<div className="tabla-acciones">
												<Boton variante="secundario" onClick={() => abrir(t)}>
													Editar
												</Boton>
												{t.state !== 'CANCELLED' && (
													<Boton variante="secundario" onClick={() => cancelar(t)}>
														Cancelar
													</Boton>
												)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</>
			)}
		</EstadoCarga>
	)
}
export default AdminTorneos
