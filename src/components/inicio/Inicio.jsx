import Hero from './Hero'
import TorneosDestacados from './TorneosDestacados'

function Inicio({ onExplorarTorneos, onInscribirse }) {
  const inscribirse = (evento) => {
    if (!onInscribirse || evento.button !== 0 || evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return

    evento.preventDefault()
    onInscribirse()
  }

  return (
    <div className="contenedor-principal">
      <Hero onExplorar={onExplorarTorneos} />

      <section className="modulo-detalle banner-destacado">
        <div className="banner-texto">
          <h2>⚠️ Próximo cierre de inscripción</h2>
          <p>Liga Valorant LATAM - Cierre: Hoy 23:59 hrs</p>
          <a
            href="#inscripcion"
            className="boton-primario"
            style={{ marginTop: 10 }}
            onClick={inscribirse}
          >
            Inscribirse ahora
          </a>
        </div>
        <img
          src="img/valorant-cierre.jpg"
          alt="Imagen promocional del torneo de Valorant"
          className="banner-imagen"
        />
      </section>

      <TorneosDestacados onExplorar={onExplorarTorneos} />

      <section className="modulo-detalle">
        <h2>Gran Final - Smash Ultimate</h2>
        <div className="contenedor-video">
          <iframe
            src="https://www.youtube.com/embed/m6CrWBOxecY"
            title="EVO 2019: Grand Final Smash Ultimate"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>
    </div>
  )
}

export default Inicio
