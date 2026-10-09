// Datos originales de js/inicio.js. Son estáticos: no necesitan estado ni efectos.
const torneosSimulados = [
  { nombre: 'Copa Latam Valorant', juego: 'Valorant', estado: 'Abierto', cupos: '14/16', imagen: 'img/valorant.jpg' },
  { nombre: 'Torneo de Verano LoL', juego: 'League of Legends', estado: 'En Curso', cupos: '32/32', imagen: 'img/lol.png' },
  { nombre: 'Liga Fin de Semana', juego: 'Rocket League', estado: 'Abierto', cupos: '4/8', imagen: 'img/rocket.png' },
  { nombre: 'Copa Rank Street Fighter 6', juego: 'Street Fighter 6', estado: 'Abierto', cupos: '22/32', imagen: 'img/sf6.jpg' },
]

function claseEstado(estado) {
  const mapa = {
    Abierto: 'estado-abierto',
    'En Curso': 'estado-en-curso',
    Finalizado: 'estado-finalizado',
  }

  return mapa[estado] || ''
}

function TorneosDestacados({ onExplorar, torneos = torneosSimulados }) {
  const explorar = (evento) => {
    if (!onExplorar || evento.button !== 0 || evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return

    evento.preventDefault()
    onExplorar()
  }

  return (
    <section className="modulo-detalle">
      <h2>Torneos Destacados</h2>
      <div id="contenedor-torneos" className="grilla-torneos">
        {torneos.map((torneo) => (
          <article key={torneo.nombre} className={`tarjeta-torneo ${claseEstado(torneo.estado)}`}>
            {torneo.imagen ? (
              <img src={torneo.imagen} alt={`Portada del juego ${torneo.juego}`} className="imagen-torneo" />
            ) : (
              <div className="imagen-torneo-placeholder" role="img" aria-label={`Portada del juego ${torneo.juego}`}>
                {torneo.juego}
              </div>
            )}
            <div className="tarjeta-contenido">
              <span className={`badge-estado ${claseEstado(torneo.estado)}`}>{torneo.estado}</span>
              <h3>{torneo.nombre}</h3>
              <p><strong>Juego:</strong> {torneo.juego}</p>
              <p><strong>Cupos:</strong> {torneo.cupos}</p>
              <a href="#torneos" className="boton-primario" onClick={explorar}>
                Explorar torneos
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default TorneosDestacados
