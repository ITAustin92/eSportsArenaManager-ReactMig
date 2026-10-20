import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../auth/useAuth'
import FormJuego from './FormJuego'
import FormTorneo from './FormTorneo'
import Boton from '../compartidos/Boton'
import BadgeEstado from '../compartidos/BadgeEstado'
import MensajeError from '../compartidos/MensajeError'
import {
	crearJuego,
	actualizarJuego,
	eliminarJuego,
	crearTorneo,
	actualizarTorneo,
	eliminarTorneo,
} from '../../datos/datos.js'

function PanelAdmin({ datos }) {
	const { sesion } = useAuth()
	const [juegoId, setJuegoId] = useState(null)
	const [torneoId, setTorneoId] = useState(null)
	const [version, setVersion] = useState(0)
	const [confirmar, setConfirmar] = useState(null)
	const [mensaje, setMensaje] = useState('')
	const [error, setError] = useState('')
	const juego = datos.juegos.find((item) => item.id === juegoId)
	const torneo = datos.torneos.find((item) => item.id === torneoId)
	const avisar = (texto) => {
		setMensaje(texto)
		setError('')
		setVersion((actual) => actual + 1)
	}
	const guardarJuego = (formulario) => {
		if (juego) {
			actualizarJuego(juego.id, formulario, sesion)
		} else {
			crearJuego(formulario, sesion)
		}
		setJuegoId(null)
		avisar('Juego guardado.')
	}
	const guardarTorneo = (formulario) => {
		if (torneo) {
			actualizarTorneo(torneo.id, formulario, sesion)
		} else {
			crearTorneo(formulario, sesion)
		}
		setTorneoId(null)
		avisar('Torneo guardado.')
	}
	const eliminar = () => {
		try {
			if (confirmar.tipo === 'juego') {
				eliminarJuego(confirmar.id, sesion)
				setJuegoId(null)
			} else {
				eliminarTorneo(confirmar.id, sesion)
				setTorneoId(null)
			}
			setConfirmar(null)
			avisar('Registro eliminado.')
		} catch (fallo) {
			setError(fallo.message)
		}
	}
	return (
		<>
			<p className="sobretitulo">Administración</p>
			<h1>Gestionar la arena</h1>
			<p>Los cambios de esta demostración se guardan en este navegador.</p>
			<Link to="/admin/equipos">Ver equipos registrados y resultados →</Link>
			{mensaje && (
				<p className="mt-3" role="status">
					{mensaje}
				</p>
			)}
			<MensajeError>{error}</MensajeError>
			{confirmar && (
				<section className="panel my-3" aria-label="Confirmar eliminación">
					<h2>¿Eliminar {confirmar.nombre}?</h2>
					<p>La operación solo se permite si no rompe relaciones existentes.</p>
					<div className="acciones">
						<Boton variante="peligro" onClick={eliminar}>
							Confirmar eliminación
						</Boton>
						<Boton variante="secundario" onClick={() => setConfirmar(null)}>
							Cancelar eliminación
						</Boton>
					</div>
				</section>
			)}
			<div className="row g-4 mt-2">
				<div className="col-12 col-lg-7">
					<FormTorneo
						key={(torneoId ?? 'nuevo') + version}
						torneo={torneo}
						juegos={datos.juegos}
						onGuardar={guardarTorneo}
						onCancelar={torneo ? () => setTorneoId(null) : undefined}
					/>
				</div>
				<section className="col-12 col-lg-5">
					<h2>Torneos disponibles</h2>
					{datos.torneos.length === 0 ? (
						<p>No hay torneos.</p>
					) : (
						datos.torneos.map((item) => (
							<article className="panel mb-3" key={item.id}>
								<h3>
									<Link to={'/torneos/' + item.id}>{item.nombre}</Link>
								</h3>
								<BadgeEstado estado={item.estado} />
								<p>
									{item.inscritos.length}/{item.cupoMax} inscritos
								</p>
								<div className="acciones">
									<Boton variante="secundario" onClick={() => setTorneoId(item.id)}>
										Editar {item.nombre}
									</Boton>
									<Boton
										variante="peligro"
										onClick={() =>
											setConfirmar({ tipo: 'torneo', id: item.id, nombre: item.nombre })
										}
									>
										Eliminar {item.nombre}
									</Boton>
								</div>
							</article>
						))
					)}
				</section>
			</div>
			<div className="row g-4 mt-4">
				<div className="col-12 col-lg-7">
					<FormJuego
						key={(juegoId ?? 'nuevo') + version}
						juego={juego}
						juegos={datos.juegos}
						bloqueado={Boolean(
							juego &&
							(datos.torneos.some((item) => item.juegoId === juego.id) ||
								datos.equipos.some((item) => item.juegoId === juego.id)),
						)}
						onGuardar={guardarJuego}
						onCancelar={juego ? () => setJuegoId(null) : undefined}
					/>
				</div>
				<section className="col-12 col-lg-5">
					<h2>Juegos disponibles</h2>
					{datos.juegos.length === 0 ? (
						<p>No hay juegos.</p>
					) : (
						datos.juegos.map((item) => (
							<article className="panel mb-3" key={item.id}>
								<h3>{item.nombre}</h3>
								<p>
									{item.modalidad} · {item.jugadoresPorEquipo} titulares
								</p>
								<div className="acciones">
									<Boton variante="secundario" onClick={() => setJuegoId(item.id)}>
										Editar {item.nombre}
									</Boton>
									<Boton
										variante="peligro"
										onClick={() =>
											setConfirmar({ tipo: 'juego', id: item.id, nombre: item.nombre })
										}
									>
										Eliminar {item.nombre}
									</Boton>
								</div>
							</article>
						))
					)}
				</section>
			</div>
		</>
	)
}
export default PanelAdmin
