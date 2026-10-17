import './TarjetaTorneo.css'
import { Link } from 'react-router-dom'
import BadgeEstado from '../compartidos/BadgeEstado'
import BarraCupos from './BarraCupos'
import { cuposDisponibles, formatearFecha } from '../../logica/torneos.js'

function TarjetaTorneo({ torneo, juego }) {
  return <article className="tarjeta-torneo card h-100">
    {juego?.imagen ? <img className="tarjeta-torneo-imagen card-img-top" src={juego.imagen} alt={'Portada de ' + juego.nombre} loading="lazy" /> : <div className="tarjeta-torneo-portada" role="img" aria-label={'Torneo de ' + juego?.nombre}>{juego?.nombre}</div>}
    <div className="card-body d-flex flex-column"><div><BadgeEstado estado={torneo.estado} /></div><h3 className="tarjeta-torneo-titulo">{torneo.nombre}</h3>
      <dl className="tarjeta-torneo-datos"><dt>Juego</dt><dd>{juego?.nombre}</dd><dt>Modalidad</dt><dd>{juego?.modalidad === '1v1' ? '1v1' : juego?.jugadoresPorEquipo + 'v' + juego?.jugadoresPorEquipo}</dd><dt>Cupos</dt><dd>{torneo.inscritos.length} / {torneo.cupoMax}</dd><dt>Cierre</dt><dd>{formatearFecha(torneo.cierreISO)}</dd></dl>
      <p className="texto-acento">{cuposDisponibles(torneo)} cupos disponibles</p>
      <BarraCupos inscritos={torneo.inscritos.length} maximo={torneo.cupoMax} />
      <Link className="boton boton-primario mt-auto" to={'/torneos/' + torneo.id}>Ver detalles</Link>
    </div>
  </article>
}
export default TarjetaTorneo
