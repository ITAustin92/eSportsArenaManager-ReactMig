import { useState } from 'react'
import BadgeEstado from '../compartidos/BadgeEstado'
import Boton from '../compartidos/Boton'
import EstadoCarga from '../compartidos/EstadoCarga'
import MensajeError from '../compartidos/MensajeError'
import useCarga from '../../hooks/useCarga'
import { listarTodosLosJuegos } from '../../servicios/catalogo.js'
import {
	actualizarEquipo,
	desactivarEquipo,
	listarEquipos,
	listarUsuarios,
} from '../../servicios/equipos.js'
import { ESTADOS_EQUIPO, etiqueta } from '../../logica/estados.js'

// Equipos registrados: el ADMIN puede sancionar, reactivar o desactivar cualquier equipo.
function AdminEquipos() {
	const { datos, error, cargando, recargar } = useCarga(async () => {
		const [equipos, juegos, usuarios] = await Promise.all([
			listarEquipos(),
			listarTodosLosJuegos(),
			listarUsuarios(),
		])
		return { equipos, juegos, usuarios }
	})
	const [errorAccion, setErrorAccion] = useState('')
	const [aviso, setAviso] = useState('')
	const cambiarEstado = async (equipo, estado) => {
		setErrorAccion('')
		try {
			if (estado === 'INACTIVO') {
				await desactivarEquipo(equipo.equipoId)
			} else {
				await actualizarEquipo(equipo.equipoId, {
					nombre: equipo.nombre,
					capitanId: equipo.capitanId,
					juegoPrincipalId: equipo.juegoPrincipalId,
					estado,
					miembros: equipo.miembros.map((m) => ({
						usuarioId: m.usuarioId,
						rolDentroEquipo: m.rolDentroEquipo,
					})),
				})
			}
			setAviso(
				'"' +
					equipo.nombre +
					'" ahora está ' +
					etiqueta(ESTADOS_EQUIPO, estado).toLowerCase() +
					'.',
			)
			recargar()
		} catch (fallo) {
			setErrorAccion(fallo.message)
		}
	}
	const usuario = (id) => datos?.usuarios.find((u) => u.usuarioId === id)
	return (
		<EstadoCarga cargando={cargando} error={error} onReintentar={recargar}>
			{datos && (
				<>
					{aviso && <p role="status">{aviso}</p>}
					<MensajeError>{errorAccion}</MensajeError>
					<div className="panel table-responsive" role="region" aria-label="Equipos" tabIndex="0">
						<table className="table">
							<thead>
								<tr>
									<th scope="col">ID</th>
									<th scope="col">Equipo</th>
									<th scope="col">Juego</th>
									<th scope="col">Capitán</th>
									<th scope="col">Integrantes</th>
									<th scope="col">Estado</th>
									<th scope="col">Acciones</th>
								</tr>
							</thead>
							<tbody>
								{datos.equipos.map((e) => (
									<tr key={e.equipoId}>
										<td>{e.equipoId}</td>
										<th scope="row">{e.nombre}</th>
										<td>
											{datos.juegos.find((j) => j.juegoId === e.juegoPrincipalId)?.nombre ??
												'#' + e.juegoPrincipalId}
										</td>
										<td>{usuario(e.capitanId)?.nombre ?? '#' + e.capitanId}</td>
										<td>{e.miembros.length}</td>
										<td>
											<BadgeEstado estado={etiqueta(ESTADOS_EQUIPO, e.estado)} />
										</td>
										<td>
											<div className="tabla-acciones">
												{e.estado !== 'ACTIVO' && (
													<Boton variante="secundario" onClick={() => cambiarEstado(e, 'ACTIVO')}>
														Activar
													</Boton>
												)}
												{e.estado !== 'SANCIONADO' && (
													<Boton
														variante="secundario"
														onClick={() => cambiarEstado(e, 'SANCIONADO')}
													>
														Sancionar
													</Boton>
												)}
												{e.estado !== 'INACTIVO' && (
													<Boton variante="secundario" onClick={() => cambiarEstado(e, 'INACTIVO')}>
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
export default AdminEquipos
