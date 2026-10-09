import { detallesTorneos } from '../../logica/detallesTorneos'

function ResumenTorneo({ torneo, torneos, onCambiar }) {
  return (
    <section className="panel-formulario banner-resumen" id="resumen-torneo">
      <div className="grupo-formulario">
        <label htmlFor="selector-torneo">Torneo:</label>
        <select id="selector-torneo" name="torneoSeleccionado" autoComplete="off" value={torneo.id} onChange={(evento) => onCambiar(evento.target.value)}>
          {torneos.map((item) => <option key={item.id} value={item.id}>{item.nombre} ({item.juego})</option>)}
        </select>
        <span className="texto-ayuda">Elige el torneo al que quieres inscribirte.</span>
      </div>
      <h2 id="nombre-torneo-resumen">{torneo.nombre}</h2>
      <div className="etiquetas-resumen">
        <span className="badge-estado" id="badge-estado-torneo">{torneo.estado === 'Abierto' ? 'Inscripciones Abiertas' : torneo.estado}</span>
        <span className="badge-estado badge-secundario" id="badge-modalidad-torneo">{torneo.modalidad}</span>
      </div>
      <p className="tarjeta-info"><strong>Cierre de inscripción:</strong> <span id="fecha-cierre-torneo">{detallesTorneos[torneo.id].infoGeneral.fechaCierre}</span></p>
      <p className="tarjeta-info"><strong>Cupos disponibles:</strong> <span id="cupos-torneo">{torneo.cuposMaximos - torneo.cuposOcupados}</span></p>
    </section>
  )
}

export default ResumenTorneo
