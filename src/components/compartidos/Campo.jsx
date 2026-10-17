import './Campo.css'
import MensajeError from './MensajeError'

function Campo({ id, nombre, etiqueta, valor, onCambiar, opciones, tipo = 'text', error, ayuda, ...atributos }) {
  const props = { id, name: nombre, value: valor, onChange: onCambiar, 'aria-invalid': Boolean(error), 'aria-describedby': [error && id + '-error', ayuda && id + '-ayuda'].filter(Boolean).join(' ') || undefined, ...atributos }
  return <div className="campo mb-3">
    <label className="form-label" htmlFor={id}>{etiqueta}</label>
    {opciones ? <select {...props} className="form-select">{opciones.map((opcion) => <option key={opcion.valor} value={opcion.valor} disabled={opcion.deshabilitada}>{opcion.etiqueta}</option>)}</select> : <input {...props} className="form-control" type={tipo} />}
    {ayuda && <small id={id + '-ayuda'} className="campo-ayuda">{ayuda}</small>}
    <MensajeError id={id + '-error'}>{error}</MensajeError>
  </div>
}
export default Campo
