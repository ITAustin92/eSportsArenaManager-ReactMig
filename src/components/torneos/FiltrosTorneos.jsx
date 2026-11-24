import Campo from '../compartidos/Campo'
import { opcionesEstadoTorneo } from '../../logica/torneos.js'

function FiltrosTorneos({ filtros, juegos, onCambiar }) {
	return (
		<form className="panel row g-3 mx-0" noValidate onSubmit={(evento) => evento.preventDefault()}>
			<div className="col-12 col-md-4">
				<Campo
					id="filtro-busqueda"
					nombre="busqueda"
					etiqueta="Buscar torneo"
					valor={filtros.busqueda}
					onCambiar={onCambiar}
				/>
			</div>
			<div className="col-12 col-md-4">
				<Campo
					id="filtro-juego"
					nombre="juego"
					etiqueta="Juego"
					valor={filtros.juego}
					onCambiar={onCambiar}
					opciones={[
						{ valor: '', etiqueta: 'Todos los juegos' },
						...juegos.map((juego) => ({ valor: String(juego.juegoId), etiqueta: juego.nombre })),
					]}
				/>
			</div>
			<div className="col-12 col-md-4">
				<Campo
					id="filtro-estado"
					nombre="estado"
					etiqueta="Estado"
					valor={filtros.estado}
					onCambiar={onCambiar}
					opciones={[{ valor: '', etiqueta: 'Todos los estados' }, ...opcionesEstadoTorneo]}
				/>
			</div>
			<div className="col-12 col-md-6">
				<Campo
					id="filtro-desde"
					nombre="fechaInicio"
					etiqueta="Cierre desde"
					tipo="date"
					valor={filtros.fechaInicio ?? ''}
					onCambiar={onCambiar}
				/>
			</div>
			<div className="col-12 col-md-6">
				<Campo
					id="filtro-hasta"
					nombre="fechaFin"
					etiqueta="Cierre hasta"
					tipo="date"
					valor={filtros.fechaFin ?? ''}
					onCambiar={onCambiar}
					error={
						filtros.fechaInicio && filtros.fechaFin && filtros.fechaFin < filtros.fechaInicio
							? 'La fecha final debe ser igual o posterior a la inicial.'
							: ''
					}
				/>
			</div>
		</form>
	)
}
export default FiltrosTorneos
