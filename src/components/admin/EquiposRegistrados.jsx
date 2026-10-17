import { useState } from 'react'
import { Link } from 'react-router-dom'
import Campo from '../compartidos/Campo'
import BadgeEstado from '../compartidos/BadgeEstado'
import { formatearFecha } from '../../logica/torneos.js'
import { ordenarRanking } from '../../logica/ranking.js'
import { nombreParticipante } from '../../datos/datos.js'
import { estadoSancion } from '../../logica/inscripcion.js'
import useAhora from '../../logica/useAhora.js'

function EquiposRegistrados({ datos }) {
  const [busqueda, setBusqueda] = useState('')
  const ahora = useAhora()
  const equipos = datos.equipos.filter((equipo) => equipo.nombre.toLocaleLowerCase('es').includes(busqueda.trim().toLocaleLowerCase('es')))
  return <><p className="sobretitulo">Control de participación</p><h1>Equipos registrados</h1><Campo id="buscar-equipo" nombre="busqueda" etiqueta="Buscar equipo por nombre" valor={busqueda} onCambiar={(evento) => setBusqueda(evento.target.value)} />
    <p role="status">{equipos.length} equipos encontrados.</p>
    {equipos.length === 0 ? <p>No hay equipos que coincidan con la búsqueda.</p> : equipos.map((equipo) => {
      const sanciones = [...equipo.sanciones.map((sancion) => ({ ...sancion, sujeto: equipo.nombre })), ...equipo.integrantes.flatMap((miembro) => (datos.jugadores.find((jugador) => jugador.id === miembro.id)?.sanciones ?? []).map((sancion) => ({ ...sancion, id: miembro.id + sancion.id, sujeto: miembro.nombre })))]
      const torneos = datos.torneos.filter((torneo) => equipo.torneosIds.includes(torneo.id))
      return <article className="panel mb-4" key={equipo.id}><h2>{equipo.nombre}</h2><p>{datos.juegos.find((juego) => juego.id === equipo.juegoId)?.nombre}</p><BadgeEstado estado={equipo.estado} />
        <div className="table-responsive mt-3" tabIndex="0" role="region" aria-label={'Integrantes de ' + equipo.nombre}><table className="table"><caption>Integrantes de {equipo.nombre}</caption><thead><tr><th scope="col">Nombre</th><th scope="col">Apodo</th><th scope="col">Correo</th><th scope="col">Rol</th></tr></thead><tbody>{equipo.integrantes.map((miembro) => <tr key={miembro.id}><th scope="row">{miembro.nombre}</th><td>{miembro.apodo}</td><td>{miembro.correo}</td><td>{miembro.rol}</td></tr>)}</tbody></table></div>
        <h3>Sanciones</h3>{sanciones.length === 0 ? <p>Sin sanciones</p> : <ul>{sanciones.map((sancion) => <li key={sancion.id}>{sancion.sujeto}: {sancion.motivo} · {formatearFecha(sancion.desde)} – {formatearFecha(sancion.hasta)} · {estadoSancion(sancion, ahora)}</li>)}</ul>}
        <h3>Torneos y resultados</h3>{torneos.length === 0 ? <p>Sin torneos inscritos.</p> : torneos.map((torneo) => {
          const posicion = ordenarRanking(torneo.ranking).findIndex((fila) => fila.participanteId === equipo.id) + 1
          const premio = torneo.premios.find((item) => item.posicion === posicion)
          const resultados = datos.resultados.filter((resultado) => resultado.torneoId === torneo.id && [resultado.localId, resultado.visitanteId].includes(equipo.id))
          return <section className="separador mt-3" key={torneo.id}><h4><Link to={'/torneos/' + torneo.id}>{torneo.nombre}</Link></h4><p>{torneo.estado} · {posicion > 0 ? 'Posición: ' + posicion : 'Sin posición registrada'}{torneo.estado === 'Finalizado' && ' · Premio: ' + (premio?.recompensa ?? 'Sin premio')}</p>
            {resultados.length === 0 ? <p>Sin resultados registrados.</p> : <ul>{resultados.map((resultado) => <li key={resultado.id}>{nombreParticipante(datos, resultado.localId)} {resultado.puntajeLocal} – {resultado.puntajeVisitante} {nombreParticipante(datos, resultado.visitanteId)} · {resultado.estado}</li>)}</ul>}
          </section>
        })}</article>
    })}
  </>
}
export default EquiposRegistrados
