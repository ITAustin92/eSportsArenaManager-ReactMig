import './Estadisticas.css'
function Estadisticas({ victorias, derrotas }) {
	return (
		<div className="row g-3">
			<div className="col-6">
				<div className="estadisticas-caja panel">
					<h2>Victorias</h2>
					<strong>{victorias}</strong>
				</div>
			</div>
			<div className="col-6">
				<div className="estadisticas-caja panel">
					<h2>Derrotas</h2>
					<strong>{derrotas}</strong>
				</div>
			</div>
		</div>
	)
}
export default Estadisticas
