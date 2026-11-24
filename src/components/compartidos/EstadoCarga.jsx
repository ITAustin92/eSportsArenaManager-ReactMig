import MensajeError from './MensajeError'
import Boton from './Boton'

// Muestra "cargando" o el error de una llamada a la API con opción de reintentar.
// Si no hay nada que mostrar, renderiza los hijos.
function EstadoCarga({ cargando, error, onReintentar, children }) {
	if (cargando) {
		return (
			<p role="status" aria-busy="true">
				Cargando datos desde el servidor…
			</p>
		)
	}
	if (error) {
		return (
			<div className="panel">
				<MensajeError>{error}</MensajeError>
				{onReintentar && (
					<Boton variante="secundario" onClick={onReintentar}>
						Reintentar
					</Boton>
				)}
			</div>
		)
	}
	return children
}
export default EstadoCarga
