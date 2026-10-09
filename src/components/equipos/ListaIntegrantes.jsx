function ListaIntegrantes({ integrantes = [], capitan, onQuitar }) {
  return (
    <ul id="lista-jugadores" className="lista-integrantes-equipo">
      {integrantes.map((jugador, index) => (
        <li key={jugador} className="item-integrante">
          <div className="item-integrante-info"><span className="item-nombre">{jugador}</span><span className="item-rol">{capitan === jugador ? 'Capitán' : 'Jugador'}</span></div>
          <button type="button" className="btn-eliminar-jugador" data-index={index} onClick={() => onQuitar(jugador)} aria-label={`Quitar a ${jugador}`}>Quitar</button>
        </li>
      ))}
    </ul>
  )
}

export default ListaIntegrantes
