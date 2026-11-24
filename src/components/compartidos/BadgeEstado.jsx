import './BadgeEstado.css'
import { claseEstado } from '../../logica/estados.js'
// Recibe la etiqueta ya traducida ("Abierto", "Pendiente"...).
function BadgeEstado({ estado }) {
	return <span className={'badge badge-estado ' + claseEstado(estado)}>{estado}</span>
}
export default BadgeEstado
