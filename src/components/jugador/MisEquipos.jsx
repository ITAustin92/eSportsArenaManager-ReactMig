import { useState } from 'react'
import BadgeEstado from '../compartidos/BadgeEstado'
import Boton from '../compartidos/Boton'
import EstadoCarga from '../compartidos/EstadoCarga'
import MensajeError from '../compartidos/MensajeError'
import FormEquipo from './FormEquipo'
import useAuth from '../auth/useAuth'
import useCarga from '../../hooks/useCarga'
import { listarJuegosActivos } from '../../servicios/catalogo.js'
import {
	actualizarEquipo,
	crearEquipo,
	desactivarEquipo,
	equiposDeCapitan,
	listarUsuarios,
} from '../../servicios/equipos.js'
import { ESTADOS_EQUIPO, etiqueta } from '../../logica/estados.js'

// CRUD de los equipos donde la persona es capitana (rol JUGADOR).
// GET /teams/capitan/{userId} · POST /teams · PUT /teams/{id} · DELETE /teams/{id}
function MisEquipos() {
	const { usuario } = useAuth()
	const { datos, error, cargando, recargar } = useCarga(async () => {
		const [equipos, juegos, usuarios] = await Promise.all([
			equiposDeCapitan(usuario.userId),
			listarJuegosActivos(),
			listarUsuarios(),
		])
		return { equipos, juegos, usuarios }
	}, [usuario.userId])
	const [editando, setEditando] = useState(null) // null | 'nuevo' | equipo
	const [aviso, setAviso] = useState('')
	const [errorAccion, setErrorAccion] = useState('')

	const guardar = async (cuerpo) => {
		if (editando === 'nuevo') {
			await crearEquipo(cuerpo)
			setAviso('Equipo creado.')
		} else {
			await actualizarEquipo(editando.equipoId, cuerpo)
			setAviso('Equipo actualizado.')
		}
		setEditando(null)
		recargar()
	}
	const desactivar = async (equipo) => {
		if (!window.confirm('¿Desactivar "' + equipo.nombre + '"? No podrá inscribirse en torneos.')) {
			return
		}
		setErrorAccion('')
		try {
			await desactivarEquipo(equipo.equipoId)
			setAviso('Equipo desactivado.')
			recargar()
		} catch (fallo) {
			setErrorAccion(fallo.message)
		}
	}
	const nombreJuego = (id) => datos?.juegos.find((j) => j.juegoId === id)?.nombre ?? 'Juego #' + id
	const nombreUsuario = (id) =>
		datos?.usuarios.find((u) => u.usuarioId === id)?.nickname ?? '#' + id

	return (
		<>
			<p className="sobretitulo">Rol jugador</p>
			<h1>Mis equipos</h1>
			{!usuario.userId ? (
				<MensajeError>Tu cuenta no tiene un perfil de jugador asociado.</MensajeError>
			) : (
				<EstadoCarga cargando={cargando} error={error} onReintentar={recargar}>
					{datos && (
						<>
							{aviso && <p role="status">{aviso}</p>}
							<MensajeError>{errorAccion}</MensajeError>
							{editando ? (
								<FormEquipo
									key={editando === 'nuevo' ? 'nuevo' : editando.equipoId}
									inicial={
										editando === 'nuevo'
											? null
											: {
													nombre: editando.nombre,
													juegoPrincipalId: String(editando.juegoPrincipalId),
													estado: editando.estado === 'INACTIVO' ? 'INACTIVO' : 'ACTIVO',
													miembros: editando.miembros.map((m) => ({
														usuarioId: m.usuarioId,
														rolDentroEquipo: m.rolDentroEquipo,
													})),
												}
									}
									juegos={datos.juegos}
									usuarios={datos.usuarios}
									capitan={usuario}
									onGuardar={guardar}
									onCancelar={() => setEditando(null)}
								/>
							) : (
								<div className="acciones mb-4">
									<Boton
										onClick={() => {
											setAviso('')
											setEditando('nuevo')
										}}
									>
										Crear equipo
									</Boton>
								</div>
							)}
							{datos.equipos.length === 0 ? (
								<div className="panel">
									<p className="mb-0">Todavía no eres capitán de ningún equipo.</p>
								</div>
							) : (
								<div className="row g-4">
									{datos.equipos.map((equipo) => (
										<article key={equipo.equipoId} className="col-12 col-md-6">
											<div className="panel h-100">
												<BadgeEstado estado={etiqueta(ESTADOS_EQUIPO, equipo.estado)} />
												<h2 className="mt-2">{equipo.nombre}</h2>
												<p className="texto-secundario">{nombreJuego(equipo.juegoPrincipalId)}</p>
												<ul className="lista-etiquetas">
													{equipo.miembros.map((m) => (
														<li key={m.miembroId ?? m.usuarioId}>
															@{nombreUsuario(m.usuarioId)} · {m.rolDentroEquipo}
														</li>
													))}
												</ul>
												<div className="acciones">
													<Boton
														variante="secundario"
														onClick={() => {
															setAviso('')
															setEditando(equipo)
														}}
													>
														Editar
													</Boton>
													{equipo.estado !== 'INACTIVO' && (
														<Boton variante="secundario" onClick={() => desactivar(equipo)}>
															Desactivar
														</Boton>
													)}
												</div>
											</div>
										</article>
									))}
								</div>
							)}
						</>
					)}
				</EstadoCarga>
			)}
		</>
	)
}
export default MisEquipos
