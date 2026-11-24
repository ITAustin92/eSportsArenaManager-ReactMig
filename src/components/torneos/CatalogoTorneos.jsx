import { useState } from 'react'
import FiltrosTorneos from './FiltrosTorneos'
import TarjetaTorneo from './TarjetaTorneo'
import EstadoCarga from '../compartidos/EstadoCarga'
import useCarga from '../../hooks/useCarga'
import { cargarCatalogo } from '../../servicios/catalogo.js'
import { filtrarTorneos } from '../../logica/torneos.js'

// Catálogo público ("la tienda"): GET /api/v1/tournaments y GET /api/v1/games en paralelo.
// Los filtros se aplican en el navegador sobre la lista ya descargada (sin más peticiones).
function CatalogoTorneos() {
	const { datos, error, cargando, recargar } = useCarga(cargarCatalogo)
	const [filtros, setFiltros] = useState({ busqueda: '', juego: '', estado: '' })
	const cambiar = (evento) =>
		setFiltros((actual) => ({ ...actual, [evento.target.name]: evento.target.value }))
	return (
		<>
			<p className="sobretitulo">Encuentra tu próximo desafío</p>
			<h1>Explorar torneos</h1>
			<EstadoCarga cargando={cargando} error={error} onReintentar={recargar}>
				{datos && <ListaFiltrada datos={datos} filtros={filtros} onCambiar={cambiar} />}
			</EstadoCarga>
		</>
	)
}

function ListaFiltrada({ datos, filtros, onCambiar }) {
	const resultados = filtrarTorneos(datos.torneos, filtros)
	return (
		<>
			<FiltrosTorneos filtros={filtros} juegos={datos.juegos} onCambiar={onCambiar} />
			<p className="texto-secundario mt-4" role="status">
				{resultados.length} de {datos.torneos.length} torneos
			</p>
			{resultados.length === 0 ? (
				<div className="panel">
					<h2>No se encontraron torneos</h2>
					<p>Prueba otros filtros.</p>
				</div>
			) : (
				<div className="row g-4">
					{resultados.map((torneo) => (
						<div key={torneo.tournamentId} className="col-12 col-md-6 col-lg-4">
							<TarjetaTorneo
								torneo={torneo}
								juego={datos.juegos.find((juego) => juego.juegoId === torneo.gameId)}
							/>
						</div>
					))}
				</div>
			)}
		</>
	)
}
export default CatalogoTorneos
