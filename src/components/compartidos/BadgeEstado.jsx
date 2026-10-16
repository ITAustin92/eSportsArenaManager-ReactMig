import './BadgeEstado.css'
import { claseEstado } from '../../logica/torneos.js'
function BadgeEstado({ estado }) {
  return <span className={'badge badge-estado ' + claseEstado(estado)}>{estado}</span>
}
export default BadgeEstado
