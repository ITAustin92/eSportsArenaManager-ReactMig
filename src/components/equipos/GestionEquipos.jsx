import { useState } from 'react'
import useAuth from '../auth/useAuth'
import FormEquipo from './FormEquipo'
import BadgeEstado from '../compartidos/BadgeEstado'
import Boton from '../compartidos/Boton'
import MensajeError from '../compartidos/MensajeError'
import { actualizarEquipo, crearEquipo, eliminarEquipo } from '../../datos/datos.js'

function GestionEquipos({ datos }) {
	const { sesion } = useAuth()
	const [editandoId, setEditandoId] = useState(null)
	const [version, setVersion] = useState(0)
	const [confirmarId, setConfirmarId] = useState(null)
	const [mensaje, setMensaje] = useState('')
	const [error, setError] = useState('')
	const propios = datos.equipos.filter((equipo) => equipo.capitanId === sesion.jugadorId)
	const editando = propios.find((equipo) => equipo.id === editandoId)
	const guardar = (equipo) => {
		if (editando) {
			actualizarEquipo(editando.id, equipo, sesion)
		} else {
			crearEquipo(equipo, sesion)
		}
		setEditandoId(null)
		setVersion((actual) => actual + 1)
		setMensaje('Equipo guardado. Ya aparece en tus equipos y en el selector de inscripción.')
	}
	const eliminar = (id) => {
		try {
			eliminarEquipo(id, sesion)
			setConfirmarId(null)
			setEditandoId(null)
			setError('')
			setMensaje('Equipo eliminado.')
		} catch (fallo) {
			setError(fallo.message)
		}
	}
	return (
		<>
			<p className="sobretitulo">Juega en equipo</p>
			<h1>Gestión de equipos</h1>
			{mensaje && <p role="status">{mensaje}</p>}
			<MensajeError>{error}</MensajeError>
			<div className="row g-4">
				<div className="col-12 col-lg-7">
					<FormEquipo
						key={(editandoId ?? 'nuevo') + version}
						equipo={editando}
						equipos={datos.equipos}
						juegos={datos.juegos}
						jugadores={datos.jugadores}
						jugadorId={sesion.jugadorId}
						onGuardar={guardar}
						onCancelar={editando ? () => setEditandoId(null) : undefined}
					/>
				</div>
				<section className="col-12 col-lg-5">
					<h2>Equipos que administras</h2>
					{propios.length === 0 ? (
						<p>Aún no has creado equipos.</p>
					) : (
						propios.map((equipo) => (
							<article key={equipo.id} className="panel mb-3">
								<h3>{equipo.nombre}</h3>
								<BadgeEstado estado={equipo.estado} />
								<p className="mt-2">
									{equipo.integrantes.length} integrantes ·{' '}
									{datos.juegos.find((juego) => juego.id === equipo.juegoId)?.nombre}
								</p>
								<div className="acciones">
									<Boton variante="secundario" onClick={() => setEditandoId(equipo.id)}>
										Editar {equipo.nombre}
									</Boton>
									<Boton variante="peligro" onClick={() => setConfirmarId(equipo.id)}>
										Eliminar {equipo.nombre}
									</Boton>
								</div>
								{confirmarId === equipo.id && (
									<div className="confirmacion">
										<p>¿Eliminar este equipo?</p>
										<div className="acciones">
											<Boton variante="peligro" onClick={() => eliminar(equipo.id)}>
												Sí, eliminar equipo
											</Boton>
											<Boton variante="secundario" onClick={() => setConfirmarId(null)}>
												Volver
											</Boton>
										</div>
									</div>
								)}
							</article>
						))
					)}
				</section>
			</div>
		</>
	)
}
export default GestionEquipos
