import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import TablaRanking from './TablaRanking'
import ListaPartidas from './ListaPartidas'
import BadgeEstado from '../compartidos/BadgeEstado'
import Campo from '../compartidos/Campo'
import { cuposDisponibles, formatearFecha } from '../../logica/torneos.js'
import { nombreParticipante } from '../../datos/datos.js'

function DetalleTorneo({ datos }) {
  const { id } = useParams()
  const [rondaElegida, setRondaElegida] = useState('')
  const torneo = datos.torneos.find((item) => item.id === id)
  if (!torneo) return <Navigate to="/torneos" replace />
  const juego = datos.juegos.find((item) => item.id === torneo.juegoId)
  const rondas = [...new Set(torneo.partidas.map((partida) => partida.ronda))]
  const ronda = rondas.includes(rondaElegida) ? rondaElegida : rondas[0] ?? ''
  return <><Link to="/torneos">← Volver a torneos</Link><section className="panel my-4"><BadgeEstado estado={torneo.estado} /><h1 className="mt-3">{torneo.nombre}</h1><p>{juego.nombre} · {juego.modalidad === '1v1' ? '1v1' : juego.jugadoresPorEquipo + 'v' + juego.jugadoresPorEquipo}</p><p>Cierre: {formatearFecha(torneo.cierreISO)} · Inicio: {formatearFecha(torneo.fechaInicio)}</p><p>{cuposDisponibles(torneo)} cupos disponibles · {torneo.inscritos.length}/{torneo.cupoMax} ocupados</p>{torneo.estado === 'Abierto' && <Link className="boton boton-primario" to={'/inscripcion?torneo=' + torneo.id}>{juego.modalidad === '1v1' ? 'Inscribirse' : 'Inscribir equipo'}</Link>}</section>
    <div className="row g-4"><div className="col-12 col-lg-8"><section className="panel"><h2>Tabla de posiciones</h2><TablaRanking ranking={torneo.ranking} /></section><section className="panel mt-4"><h2>Participantes inscritos</h2>{torneo.inscritos.length === 0 ? <p>Aún no hay participantes.</p> : <ul className="lista-etiquetas">{torneo.inscritos.map((participanteId) => <li key={participanteId}>{nombreParticipante(datos, participanteId)}</li>)}</ul>}</section><section className="panel mt-4"><h2>Premios por posición</h2><p>{torneo.estado === 'Finalizado' ? 'Premios asignados según la clasificación final.' : 'Premios anunciados; se asignarán al finalizar.'}</p>{torneo.premios.length === 0 ? <p>Premios por anunciar.</p> : <ul className="lista-limpia">{torneo.premios.map((premio) => <li key={premio.id}>{premio.posicion}º lugar · {premio.recompensa}</li>)}</ul>}</section></div>
    <section className="col-12 col-lg-4"><h2>Partidas y llaves</h2><Campo id="ronda" nombre="ronda" etiqueta="Ronda visible" valor={ronda} onCambiar={(evento) => setRondaElegida(evento.target.value)} opciones={rondas.map((nombre) => ({ valor: nombre, etiqueta: nombre }))} /><ListaPartidas partidas={torneo.partidas.filter((partida) => partida.ronda === ronda)} datos={datos} /></section></div>
  </>
}
export default DetalleTorneo
