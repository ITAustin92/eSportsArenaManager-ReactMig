import './DetalleTorneo.css'
import { useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import TablaRanking from './TablaRanking'
import ListaPartidas from './ListaPartidas'
import BadgeEstado from '../compartidos/BadgeEstado'
import BarraCupos from './BarraCupos'
import Campo from '../compartidos/Campo'
import { cuposDisponibles, formatearFecha, inscripcionAbierta } from '../../logica/torneos.js'
import { ordenarRanking } from '../../logica/ranking.js'
import { nombreParticipante } from '../../datos/datos.js'
import useAhora from '../../logica/useAhora.js'

function DetalleTorneo({ datos }) {
  const { id } = useParams()
  const ahora = useAhora()
  const [rondaElegida, setRondaElegida] = useState('')
  const pestanas = useRef([])
  const torneo = datos.torneos.find((item) => item.id === id)
  if (!torneo) return <Navigate to="/torneos" replace />
  const juego = datos.juegos.find((item) => item.id === torneo.juegoId)
  const rondas = [...new Set(torneo.partidas.map((partida) => partida.ronda))]
  const ronda = rondas.includes(rondaElegida) ? rondaElegida : rondas[0] ?? ''
  const navegarRondas = (evento, indice) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(evento.key)) return
    evento.preventDefault()
    const siguiente = evento.key === 'Home' ? 0 : evento.key === 'End' ? rondas.length - 1 : (indice + (evento.key === 'ArrowRight' ? 1 : -1) + rondas.length) % rondas.length
    setRondaElegida(rondas[siguiente])
    pestanas.current[siguiente].focus()
  }
  return <><Link to="/torneos">← Volver a torneos</Link><section className="panel detalle-cabecera my-4"><BadgeEstado estado={torneo.estado} /><h1 className="mt-3">{torneo.nombre}</h1><p>{juego.nombre} · {juego.modalidad === '1v1' ? '1v1' : juego.jugadoresPorEquipo + 'v' + juego.jugadoresPorEquipo}</p><p>Cierre: {formatearFecha(torneo.cierreISO)} · Inicio: {formatearFecha(torneo.fechaInicio)}</p><p>{cuposDisponibles(torneo)} cupos disponibles · {torneo.inscritos.length}/{torneo.cupoMax} ocupados</p><BarraCupos inscritos={torneo.inscritos.length} maximo={torneo.cupoMax} />{inscripcionAbierta(torneo, ahora) && cuposDisponibles(torneo) > 0 && <Link className="boton boton-primario" to={'/inscripcion?torneo=' + torneo.id}>{juego.modalidad === '1v1' ? 'Inscribirse' : 'Inscribir equipo'}</Link>}{torneo.estado === 'Abierto' && !inscripcionAbierta(torneo, ahora) && <p role="status">El plazo de inscripción terminó.</p>}{inscripcionAbierta(torneo, ahora) && cuposDisponibles(torneo) === 0 && <p role="status">No quedan cupos disponibles.</p>}</section>
    <div className="row g-4"><div className="col-12 col-lg-8"><section className="panel"><h2>Tabla de posiciones</h2><TablaRanking ranking={ordenarRanking(torneo.ranking)} /></section><section className="panel mt-4"><h2>Participantes inscritos</h2>{torneo.inscritos.length === 0 ? <p>Aún no hay participantes.</p> : <ul className="lista-etiquetas">{torneo.inscritos.map((participanteId) => <li key={participanteId}>{nombreParticipante(datos, participanteId)}</li>)}</ul>}</section><section className="panel mt-4"><h2>Premios por posición</h2><p>{torneo.estado === 'Finalizado' ? 'Premios asignados según la clasificación final.' : 'Premios anunciados; se asignarán al finalizar.'}</p>{torneo.premios.length === 0 ? <p>Premios por anunciar.</p> : <ul className="lista-limpia">{torneo.premios.map((premio) => <li key={premio.id}>{premio.posicion}º lugar · {premio.recompensa}</li>)}</ul>}</section></div>
    <section className="col-12 col-lg-4 detalle-rondas"><h2>Partidas y llaves</h2>
      <div className="ronda-selector"><Campo id="ronda" nombre="ronda" etiqueta="Ronda visible" valor={ronda} onCambiar={(evento) => setRondaElegida(evento.target.value)} opciones={rondas.map((nombre) => ({ valor: nombre, etiqueta: nombre }))} /></div>
      {rondas.length > 0 && <div className="rondas-pestanas" role="tablist" aria-label="Rondas del torneo">{rondas.map((nombre, indice) => <button key={nombre} ref={(elemento) => { pestanas.current[indice] = elemento }} id={'ronda-tab-' + indice} className="ronda-pestana" type="button" role="tab" aria-selected={ronda === nombre} aria-controls="partidas-ronda" tabIndex={ronda === nombre ? 0 : -1} onClick={() => setRondaElegida(nombre)} onKeyDown={(evento) => navegarRondas(evento, indice)}>{nombre}</button>)}</div>}
      <div id="partidas-ronda" role="tabpanel" aria-label={'Partidas: ' + (ronda || 'sin ronda')} tabIndex={0}><ListaPartidas partidas={torneo.partidas.filter((partida) => partida.ronda === ronda)} datos={datos} /></div>
    </section></div>
  </>
}
export default DetalleTorneo
