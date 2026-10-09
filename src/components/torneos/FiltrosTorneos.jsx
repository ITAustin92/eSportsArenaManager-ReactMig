function FiltrosTorneos({ filtros, onCambiar, onFiltrar, errorFechas }) {
  return (
    <section className="filtros-busqueda">
      <h2>Explorar Torneos</h2>
      <form id="form-filtros" className="contenedor-filtros" onSubmit={onFiltrar}>
        <div className="grupo-filtro">
          <label htmlFor="buscar-nombre">Buscar por nombre:</label>
          <input
            type="text"
            id="buscar-nombre"
            placeholder="Ej: Copa Latam..."
            value={filtros.busqueda}
            onChange={(evento) => onCambiar('busqueda', evento.target.value)}
          />
        </div>
        <div className="grupo-filtro">
          <label htmlFor="filtro-juego">Juego:</label>
          <select id="filtro-juego" value={filtros.juego} onChange={(evento) => onCambiar('juego', evento.target.value)}>
            {['Todos', 'Valorant', 'League of Legends', 'Rocket League', 'Street Fighter 6'].map((juego) => (
              <option key={juego} value={juego}>{juego}</option>
            ))}
          </select>
        </div>
        <div className="grupo-filtro">
          <label htmlFor="filtro-estado">Estado:</label>
          <select id="filtro-estado" value={filtros.estado} onChange={(evento) => onCambiar('estado', evento.target.value)}>
            {['Todos', 'Abierto', 'En Curso', 'Finalizado'].map((estado) => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
        </div>
        <div className="grupo-filtro">
          <label htmlFor="fecha-inicio">Desde:</label>
          <input
            type="date"
            id="fecha-inicio"
            value={filtros.fechaInicio}
            onChange={(evento) => onCambiar('fechaInicio', evento.target.value)}
            aria-invalid={errorFechas || undefined}
            aria-describedby={errorFechas ? 'mensaje-error-fechas' : undefined}
          />
        </div>
        <div className="grupo-filtro">
          <label htmlFor="fecha-fin">Hasta:</label>
          <input
            type="date"
            id="fecha-fin"
            value={filtros.fechaFin}
            onChange={(evento) => onCambiar('fechaFin', evento.target.value)}
            aria-invalid={errorFechas || undefined}
            aria-describedby={errorFechas ? 'mensaje-error-fechas' : undefined}
          />
        </div>
        <button type="submit" id="btn-filtrar" className="boton-primario">Filtrar</button>
      </form>
      {errorFechas && (
        <p id="mensaje-error-fechas" className="mensaje-error" role="alert">
          La fecha de inicio no puede ser posterior a la fecha de fin.
        </p>
      )}
    </section>
  )
}

export default FiltrosTorneos
