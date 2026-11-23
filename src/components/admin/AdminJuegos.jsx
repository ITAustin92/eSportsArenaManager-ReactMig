import { useState } from 'react'
import BadgeEstado from '../compartidos/BadgeEstado'
import Boton from '../compartidos/Boton'
import Campo from '../compartidos/Campo'
import EstadoCarga from '../compartidos/EstadoCarga'
import MensajeError from '../compartidos/MensajeError'
import useCarga from '../../hooks/useCarga'
import {
	actualizarJuego,
	crearJuego,
	eliminarJuego,
	listarTodosLosJuegos,
} from '../../servicios/catalogo.js'
import { ESTADOS_JUEGO, etiqueta } from '../../logica/estados.js'
import { hayErrores, validarJuego } from '../../logica/validaciones.js'

const vacio = {
	nombre: '',
	genero: '',
	modalidad: '5v5',
	jugadoresPorEquipo: '5',
	estado: 'ACTIVO',
}

// CRUD de juegos: GET/POST /api/v1/games, PUT/DELETE /api/v1/games/{id} (solo ADMIN).
// DELETE es una baja lógica: el juego queda INACTIVO (los torneos antiguos conservan su referencia).
function AdminJuegos() {
	const { datos, error, cargando, recargar } = useCarga(listarTodosLosJuegos)
	const [formulario, setFormulario] = useState(null) // null | { id?, ...campos }
	const [errores, setErrores] = useState({})
	const [errorAccion, setErrorAccion] = useState('')
	const [aviso, setAviso] = useState('')
	const cambiar = (e) => setFormulario((a) => ({ ...a, [e.target.name]: e.target.value }))
	const abrir = (juego) => {
		setErrores({})
		setErrorAccion('')
		setAviso('')
		setFormulario(
			juego
				? {
						id: juego.juegoId,
						nombre: juego.nombre,
						genero: juego.genero,
						modalidad: juego.modalidad,
						jugadoresPorEquipo: String(juego.jugadoresPorEquipo),
						estado: juego.estado,
					}
				: { ...vacio },
		)
	}
	const guardar = async (e) => {
		e.preventDefault()
		const encontrados = validarJuego(formulario)
		setErrores(encontrados)
		setErrorAccion('')
		if (hayErrores(encontrados)) {
			return
		}
		const cuerpo = {
			nombre: formulario.nombre.trim(),
			genero: formulario.genero.trim(),
			modalidad: formulario.modalidad.trim(),
			jugadoresPorEquipo: Number(formulario.jugadoresPorEquipo),
			estado: formulario.estado,
		}
		try {
			if (formulario.id) {
				await actualizarJuego(formulario.id, cuerpo)
			} else {
				await crearJuego(cuerpo)
			}
			setAviso(formulario.id ? 'Juego actualizado.' : 'Juego creado.')
			setFormulario(null)
			recargar()
		} catch (fallo) {
			setErrorAccion(fallo.message)
		}
	}
	const eliminar = async (juego) => {
		if (
			!window.confirm(
				'¿Desactivar el juego "' + juego.nombre + '"? Dejará de aparecer en el catálogo.',
			)
		) {
			return
		}
		setErrorAccion('')
		try {
			await eliminarJuego(juego.juegoId)
			setAviso('Juego desactivado.')
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
							<h2>{formulario.id ? 'Editar juego #' + formulario.id : 'Nuevo juego'}</h2>
							<div className="row g-3">
								<div className="col-12 col-md-4">
									<Campo
										id="juego-nombre"
										nombre="nombre"
										etiqueta="Nombre"
										valor={formulario.nombre}
										onCambiar={cambiar}
										error={errores.nombre}
									/>
								</div>
								<div className="col-12 col-md-4">
									<Campo
										id="juego-genero"
										nombre="genero"
										etiqueta="Género"
										valor={formulario.genero}
										onCambiar={cambiar}
										error={errores.genero}
									/>
								</div>
								<div className="col-6 col-md-2">
									<Campo
										id="juego-modalidad"
										nombre="modalidad"
										etiqueta="Modalidad"
										valor={formulario.modalidad}
										onCambiar={cambiar}
										error={errores.modalidad}
									/>
								</div>
								<div className="col-6 col-md-2">
									<Campo
										id="juego-tamano"
										nombre="jugadoresPorEquipo"
										etiqueta="Por equipo"
										tipo="number"
										min="1"
										valor={formulario.jugadoresPorEquipo}
										onCambiar={cambiar}
										error={errores.jugadoresPorEquipo}
									/>
								</div>
								<div className="col-12 col-md-4">
									<Campo
										id="juego-estado"
										nombre="estado"
										etiqueta="Estado"
										valor={formulario.estado}
										onCambiar={cambiar}
										error={errores.estado}
										opciones={[
											{ valor: 'ACTIVO', etiqueta: 'Activo' },
											{ valor: 'INACTIVO', etiqueta: 'Inactivo' },
										]}
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
							<Boton onClick={() => abrir(null)}>Nuevo juego</Boton>
						</div>
					)}
					<div className="panel table-responsive" role="region" aria-label="Juegos" tabIndex="0">
						<table className="table">
							<thead>
								<tr>
									<th scope="col">ID</th>
									<th scope="col">Nombre</th>
									<th scope="col">Género</th>
									<th scope="col">Modalidad</th>
									<th scope="col">Estado</th>
									<th scope="col">Acciones</th>
								</tr>
							</thead>
							<tbody>
								{datos.map((j) => (
									<tr key={j.juegoId}>
										<td>{j.juegoId}</td>
										<th scope="row">{j.nombre}</th>
										<td>{j.genero}</td>
										<td>
											{j.modalidad} ({j.jugadoresPorEquipo})
										</td>
										<td>
											<BadgeEstado estado={etiqueta(ESTADOS_JUEGO, j.estado)} />
										</td>
										<td>
											<div className="tabla-acciones">
												<Boton variante="secundario" onClick={() => abrir(j)}>
													Editar
												</Boton>
												{j.estado === 'ACTIVO' && (
													<Boton variante="secundario" onClick={() => eliminar(j)}>
														Desactivar
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
export default AdminJuegos
