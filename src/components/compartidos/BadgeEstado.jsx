import { claseEstado } from '../../logica/torneos'

function BadgeEstado({ estado }) {
  return <span className={`badge-estado ${claseEstado(estado)}`}>{estado}</span>
}

export default BadgeEstado
