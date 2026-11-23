import { api } from '../../servicios/api.js'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import BadgeEstado from '../compartidos/BadgeEstado'
import Campo from '../compartidos/Campo'
import EstadoCarga from '../compartidos/EstadoCarga'
import useAuth from '../auth/useAuth'
import useCarga from '../../hooks/useCarga'
import { listarEquipos, listarTorneos } from '../../servicios/catalogo.js'
import { listarInscripciones } from '../../servicios/inscripciones.js'
import { ESTADOS_INSCRIPCION, etiqueta } from '../../logica/estados.js'
import { formatearFecha, nombreEquipo } from '../../logica/torneos.js'

const opcionesEstado = Object.entries(ESTADOS_INSCRIPCION).map(([valor, texto]) => ({
	valor,
	etiqueta: texto,
}))

// Lista de inscripciones (las "órdenes"): GET /api/v1/registrations (ADMIN y ORGANIZADOR).
function GestionInscripciones() {
	const { rol } = useAuth()
	const [parametros] = useSearchParams()
	const { datos, error, cargando, recargar } = useCarga(async () => {
		const [inscripciones, torneos, equipos, jugadores] = await Promise.all([
			listarInscripciones(),
			listarTorneos(),
			listarEquipos(),
			api.get('/api/v1/users/public'),
		])
		return { inscripciones, torneos, equipos, jugadores }
	})
	const [filtros, setFiltros] = useState({ torneo: parametros.get('torneo') ?? '', estado: '' })
	const cambiar = (e) => setFiltros((a) => ({ ...a, [e.target.name]: e.target.value }))
	const visibles = (datos?.inscripciones ?? [])
		.filter(
			(i) =>
				(!filtros.torneo || String(i.tournamentId) === filtros.torneo) &&
				(!filtros.estado || i.status === filtros.estado),
		)
		.sort((a, b) => b.registrationId - a.registrationId)
	return (
		<>
			<p className="sobretitulo">
				{rol === 'ADMIN' ? 'Administración' : 'Organizador · solo lectura'}
			</p>
			<h1>Inscripciones</h1>
			<EstadoCarga cargando={cargando} error={error} onReintentar={recargar}>
				{datos && (
					<>
						<form className="panel row g-3 mx-0 mb-4" onSubmit={(e) => e.preventDefault()}>
							<div className="col-12 col-md-6">
								<Campo
									id="inscripciones-torneo"
									nombre="torneo"
									etiqueta="Torneo"
									valor={filtros.torneo}
									onCambiar={cambiar}
									opciones={[
										{ valor: '', etiqueta: 'Todos' },
										...datos.torneos.map((t) => ({
											valor: String(t.tournamentId),
											etiqueta: t.name,
										})),
									]}
								/>
							</div>
							<div className="col-12 col-md-6">
								<Campo
									id="inscripciones-estado"
									nombre="estado"
									etiqueta="Estado"
									valor={filtros.estado}
									onCambiar={cambiar}
									opciones={[{ valor: '', etiqueta: 'Todos' }, ...opcionesEstado]}
								/>
							</div>
						</form>
						<p className="texto-secundario" role="status">
							{visibles.length} de {datos.inscripciones.length} inscripciones
						</p>
						<div
							className="panel table-responsive"
							role="region"
							aria-label="Inscripciones"
							tabIndex="0"
						>
							<table className="table">
								<thead>
									<tr>
										<th scope="col">#</th>
										<th scope="col">Equipo</th>
										<th scope="col">Torneo</th>
										<th scope="col">Fecha</th>
										<th scope="col">Estado</th>
										<th scope="col">Detalle</th>
									</tr>
								</thead>
								<tbody>
									{visibles.map((i) => (
										<tr key={i.registrationId}>
											<td>{i.registrationId}</td>
											<th scope="row">
												{i.userId
													? (datos.jugadores.find((j) => j.usuarioId === i.userId)?.nickname ??
														'Jugador #' + i.userId)
													: nombreEquipo(datos.equipos, i.teamId)}
											</th>
											<td>
												{datos.torneos.find((t) => t.tournamentId === i.tournamentId)?.name ??
													'#' + i.tournamentId}
											</td>
											<td>{formatearFecha(i.registrationDate)}</td>
											<td>
												<BadgeEstado estado={etiqueta(ESTADOS_INSCRIPCION, i.status)} />
											</td>
											<td>
												<Link to={'/gestion/inscripciones/' + i.registrationId}>Ver</Link>
											</td>
										</tr>
									))}
								</tbody>
							</table>
							{visibles.length === 0 && (
								<p className="mt-2">No hay inscripciones con esos filtros.</p>
							)}
						</div>
					</>
				)}
			</EstadoCarga>
		</>
	)
}
export default GestionInscripciones
