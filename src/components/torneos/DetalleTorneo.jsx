import { detallesTorneos } from '../../logica/detallesTorneos'
import { claseEstado } from '../../logica/torneos'
import { motivoBloqueo } from '../../logica/inscripcion'

function DetalleTorneo({ torneo }) {
  const detalle = detallesTorneos[torneo.id]
  return (
    <>
      <section className="detalle-cabecera" id="info-general-torneo">
        <div className="detalle-cabecera-contenido">
          <span className={`badge-estado ${claseEstado(torneo.estado)}`}>{torneo.estado}</span>
          <h1>{torneo.nombre}</h1>
          <p>
            <strong>Juego:</strong> {torneo.juego}
            <span className="separador-detalle">|</span>
            <strong>Modalidad:</strong> {torneo.modalidad}
            <span className="separador-detalle">|</span>
            <strong>Inscripción:</strong> {detalle.infoGeneral.fechaCierre}
          </p>
          <div className="resumen-cupos-detalle">
            <span><strong>{torneo.cuposMaximos - torneo.cuposOcupados}</strong> cupos disponibles</span>
            <span>{torneo.cuposOcupados}/{torneo.cuposMaximos} ocupados</span>
          </div>
          {!motivoBloqueo(torneo) && (
            <a href={`#inscripcion?id=${encodeURIComponent(torneo.id)}`} className="boton-primario">
              {torneo.modalidad === '1v1' ? 'Inscribir Jugador' : 'Inscribir Equipo'}
            </a>
          )}
        </div>
      </section>
      <div className="contenedor-columnas-detalle">
        <div className="columna-principal">
          <section className="seccion-tabla">
            <h2>Tabla de Posiciones</h2>
            <table className="tabla-clasificacion">
              <thead><tr><th>Pos</th><th>Equipo/Jugador</th><th>Victorias</th><th>Derrotas</th><th>Puntos</th></tr></thead>
              <tbody id="cuerpo-tabla-posiciones">
                {detalle.posiciones.map((fila) => (
                  <tr key={fila.equipo}><td>{fila.pos}</td><td><strong>{fila.equipo}</strong></td><td>{fila.victorias}</td><td>{fila.derrotas}</td><td><strong>{fila.puntos}</strong></td></tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="seccion-lista">
            <h2>Participantes Inscritos <span id="contador-cupos" className="texto-secundario">({torneo.cuposOcupados}/{torneo.cuposMaximos})</span></h2>
            <ul id="lista-participantes" className="lista-equipos">
              {detalle.participantes.map((participante) => <li key={participante}>{participante}</li>)}
            </ul>
          </section>
          <section className="seccion-premios">
            <h2>Premios</h2>
            <div id="contenedor-premios" className="grilla-premios">
              {torneo.estado === 'Finalizado' ? detalle.premios.map((premio) => (
                <div key={premio.posicion} className="tarjeta-premio"><h3>{premio.posicion}</h3><p>{premio.recompensa}</p></div>
              )) : (
                <div className="mensaje-premios-pendientes"><strong>Premios aún no asignados.</strong><p>Los premios se mostrarán cuando el torneo finalice.</p></div>
              )}
            </div>
          </section>
        </div>
        <div className="columna-lateral">
          <section className="seccion-llaves">
            <h2>Próximas Partidas</h2>
            <div id="contenedor-llaves" className="lista-partidas">
              {detalle.partidas.map((partida) => (
                <div key={`${partida.equipo1}-${partida.equipo2}-${partida.fecha}`} className="tarjeta-partida">
                  <div><span className="equipo-partida">{partida.equipo1}</span><span className="vs"> VS </span><span className="equipo-partida">{partida.equipo2}</span><span className="fecha-partida">{partida.fecha} - {partida.ronda}</span></div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

export default DetalleTorneo
