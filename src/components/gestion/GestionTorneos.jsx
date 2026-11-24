import { useState } from 'react'
import { Link } from 'react-router-dom'
import BadgeEstado from '../compartidos/BadgeEstado'
import Campo from '../compartidos/Campo'
import EstadoCarga from '../compartidos/EstadoCarga'
import useAuth from '../auth/useAuth'
import useCarga from '../../hooks/useCarga'
import { listarTodosLosJuegos, listarTorneos } from '../../servicios/catalogo.js'
import { listarInscripciones } from '../../servicios/inscripciones.js'
import { ESTADOS_TORNEO, etiqueta } from '../../logica/estados.js'
import { filtrarTorneos, formatearFecha, opcionesEstadoTorneo } from '../../logica/torneos.js'

// Lista de torneos (los "productos") para ORGANIZADOR y ADMIN. Solo lectura:
// el organizador no ve botones de crear/editar/eliminar (y el backend respondería 403).
function GestionTorneos() {
	const { rol } = useAuth()
	const { datos, error, cargando, recargar } = useCarga(async () => {
		const [torneos, juegos, inscripciones] = await Promise.all([
			listarTorneos(),
			listarTodosLosJuegos(),
			listarInscripciones(),
		])
		return { torneos, juegos, inscripciones }
	})
	const [filtros, setFiltros] = useState({ busqueda: '', estado: '' })
	const cambiar = (e) => setFiltros((a) => ({ ...a, [e.target.name]: e.target.value }))
	return (
		<>
			<p className="sobretitulo">
				{rol === 'ADMIN' ? 'Administración' : 'Organizador · solo lectura'}
			</p>
			<h1>Torneos</h1>
			{rol === 'ADMIN' && (
				<p>
					Para crear o editar torneos usa el <Link to="/admin">panel de administración</Link>.
				</p>
			)}
			<EstadoCarga cargando={cargando} error={error} onReintentar={recargar}>
				{datos && (
					<>
						<form className="panel row g-3 mx-0 mb-4" onSubmit={(e) => e.preventDefault()}>
							<div className="col-12 col-md-6">
								<Campo
									id="gestion-busqueda"
									nombre="busqueda"
									etiqueta="Buscar"
									valor={filtros.busqueda}
									onCambiar={cambiar}
								/>
							</div>
							<div className="col-12 col-md-6">
								<Campo
									id="gestion-estado"
									nombre="estado"
									etiqueta="Estado"
									valor={filtros.estado}
									onCambiar={cambiar}
									opciones={[{ valor: '', etiqueta: 'Todos' }, ...opcionesEstadoTorneo]}
								/>
							</div>
						</form>
						<div className="panel table-responsive" role="region" aria-label="Torneos" tabIndex="0">
							<table className="table">
								<thead>
									<tr>
										<th scope="col">ID</th>
										<th scope="col">Torneo</th>
										<th scope="col">Juego</th>
										<th scope="col">Inicio</th>
										<th scope="col">Término</th>
										<th scope="col">Inscritos</th>
										<th scope="col">Estado</th>
										<th scope="col">Detalle</th>
									</tr>
								</thead>
								<tbody>
									{filtrarTorneos(datos.torneos, filtros).map((t) => (
										<tr key={t.tournamentId}>
											<td>{t.tournamentId}</td>
											<th scope="row">{t.name}</th>
											<td>
												{datos.juegos.find((j) => j.juegoId === t.gameId)?.nombre ?? '#' + t.gameId}
											</td>
											<td>{formatearFecha(t.startDate)}</td>
											<td>{formatearFecha(t.endDate)}</td>
											<td>
												{
													datos.inscripciones.filter(
														(i) => i.tournamentId === t.tournamentId && i.status !== 'CANCELLED',
													).length
												}
											</td>
											<td>
												<BadgeEstado estado={etiqueta(ESTADOS_TORNEO, t.state)} />
											</td>
											<td>
												<Link to={'/gestion/torneos/' + t.tournamentId}>Ver</Link>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</>
				)}
			</EstadoCarga>
		</>
	)
}
export default GestionTorneos
