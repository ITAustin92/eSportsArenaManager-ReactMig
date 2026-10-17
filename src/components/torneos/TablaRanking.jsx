function TablaRanking({ ranking }) {
  return (
    <div className="table-responsive" role="region" aria-label="Clasificación del torneo" tabIndex="0">
      <table className="table">
        <caption>Clasificación por puntos; desempate por diferencia de puntaje.</caption>
        <thead>
          <tr>
            <th scope="col">Posición</th>
            <th scope="col">Participante</th>
            <th scope="col">Victorias</th>
            <th scope="col">Derrotas</th>
            <th scope="col">Diferencia</th>
            <th scope="col">Puntos</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((fila, posicion) => (
            <tr key={fila.participanteId}>
              <td>{posicion + 1}</td>
              <th scope="row">{fila.nombre}</th>
              <td>{fila.victorias}</td>
              <td>{fila.derrotas}</td>
              <td>{fila.aFavor - fila.enContra}</td>
              <td>{fila.puntos}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {ranking.length === 0 && <p>Aún no hay posiciones registradas.</p>}
    </div>
  )
}
export default TablaRanking
