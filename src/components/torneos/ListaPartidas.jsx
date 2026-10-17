import LlaveTorneo from './LlaveTorneo'
import BadgeEstado from '../compartidos/BadgeEstado'
import { formatearFecha } from '../../logica/torneos.js'
import { nombreParticipante } from '../../datos/datos.js'
function ListaPartidas({ partidas, datos }) {
  return partidas.length === 0 ? <p>No hay partidas programadas en esta ronda.</p> : <ul className="lista-limpia">{partidas.map((partida) => <li key={partida.id} className="panel mb-3"><BadgeEstado estado={partida.estado} /><LlaveTorneo local={nombreParticipante(datos, partida.localId)} visitante={nombreParticipante(datos, partida.visitanteId)} /><p className="texto-secundario mb-0">{formatearFecha(partida.horario)} · {partida.ronda}</p></li>)}</ul>
}
export default ListaPartidas
