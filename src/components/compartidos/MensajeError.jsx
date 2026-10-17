function MensajeError({ children, id, className = 'mensaje-error-campo', style }) {
  return children ? <div id={id} className={className} style={{ display: 'block', ...style }} role="alert">{children}</div> : null
}
export default MensajeError
