function Footer({ vistaActiva = 'inicio' }) {
	return (
		<footer>
			<div className="footer-columna">
				<h3>eSports Arena Manager</h3>
				<p>
					{['torneos', 'detalle', 'equipos'].includes(vistaActiva)
						? 'Plataforma de torneos competitivos'
						: 'Plataforma de torneos competitivos.'}
				</p>
			</div>
			<div className="footer-columna">
				<h3>Contacto</h3>
				<p>soporte@arenamanager.com</p>
			</div>
		</footer>
	)
}

export default Footer
