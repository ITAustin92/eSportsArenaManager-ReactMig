import TarjetaTorneo from '../torneos/TarjetaTorneo'
function TorneosDestacados({ torneos, juegos }) {
  return <section><div className="encabezado-seccion"><div><p className="sobretitulo">En el radar</p><h2>Torneos destacados</h2></div><span className="texto-secundario">{torneos.length} competencias</span></div>
    {torneos.length === 0 ? <p>No hay torneos destacados.</p> : <div className="row g-4">{torneos.map((torneo) => <div key={torneo.id} className="col-12 col-md-6 col-lg-4 col-xl-3"><TarjetaTorneo torneo={torneo} juego={juegos.find((juego) => juego.id === torneo.juegoId)} /></div>)}</div>}
  </section>
}
export default TorneosDestacados
