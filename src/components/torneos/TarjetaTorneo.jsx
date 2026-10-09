import { claseEstado } from '../../logica/torneos'

function TarjetaTorneo({ torneo, onSeleccionar }) {
  const abrirDetalle = (evento) => {
    if (!onSeleccionar || evento.button !== 0 || evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return

    evento.preventDefault()
    onSeleccionar(torneo.id)
  }

  return (
    <article className={`tarjeta-torneo ${claseEstado(torneo.estado)}`}>
      {torneo.imagen ? (
        <img src={torneo.imagen} alt={`Portada del juego ${torneo.juego}`} className="imagen-torneo" />
      ) : (
        <div className="imagen-torneo-placeholder" role="img" aria-label={`Portada del juego ${torneo.juego}`}>
          {torneo.juego}
        </div>
      )}
      <div className="contenido-tarjeta-torneo">
        <span className={`badge-estado ${claseEstado(torneo.estado)}`} style={{ marginBottom: 14 }}>{torneo.estado}</span>
        <h3>{torneo.nombre}</h3>
        <p><strong>Juego:</strong> {torneo.juego}</p>
        <p><strong>Modalidad:</strong> {torneo.modalidad}</p>
        <p><strong>Cupos:</strong> {torneo.cuposOcupados} / {torneo.cuposMaximos}</p>
        <p><strong>Cierre inscripción:</strong> {torneo.fechaCierre}</p>
        <a
          href={`#detalle?id=${encodeURIComponent(torneo.id)}`}
          className="boton-primario"
          data-torneo-id={torneo.id}
          style={{ marginTop: 15 }}
          onClick={abrirDetalle}
        >
          Ver detalles
        </a>
      </div>
    </article>
  )
}

export default TarjetaTorneo
