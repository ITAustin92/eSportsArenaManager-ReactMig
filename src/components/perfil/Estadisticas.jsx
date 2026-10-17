function Estadisticas({ victorias, derrotas }) {
  return (
    <div className="grilla-estadisticas">
      <div className="modulo-detalle caja-stat"><h3>Victorias</h3><div className="numero-stat acento" id="stat-victorias">{victorias}</div></div>
      <div className="modulo-detalle caja-stat"><h3>Derrotas</h3><div className="numero-stat error" id="stat-derrotas">{derrotas}</div></div>
    </div>
  )
}

export default Estadisticas
