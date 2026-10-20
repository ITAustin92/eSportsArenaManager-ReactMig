import './MensajeError.css'
function MensajeError({ children, id }) {
	return children ? (
		<p id={id} className="mensaje-error" role="alert">
			{children}
		</p>
	) : null
}
export default MensajeError
