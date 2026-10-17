import './Inicio.css'
import { Link } from 'react-router-dom'
import Hero from './Hero'
import TorneosDestacados from './TorneosDestacados'
import { cuposDisponibles, formatearFecha, inscripcionAbierta } from '../../logica/torneos.js'
import useAhora from '../../logica/useAhora.js'

function Inicio({ datos }) {
  const ahora = useAhora()
  const proximos = datos.torneos.filter((torneo) => inscripcionAbierta(torneo, ahora) && cuposDisponibles(torneo) > 0).sort((a, b) => Date.parse(a.cierreISO) - Date.parse(b.cierreISO))
  return <><Hero />
    {proximos.length > 0 && <section className="inicio-banner card"><div className="inicio-banner-texto"><p className="sobretitulo">Próximo cierre</p><h2>{proximos[0].nombre}</h2><p>{formatearFecha(proximos[0].cierreISO)}</p><Link className="boton boton-primario" to={'/inscripcion?torneo=' + proximos[0].id}>Inscribirse ahora</Link></div><img src="/img/valorant-cierre.jpg" alt="Escena competitiva de Valorant" /></section>}
    <TorneosDestacados torneos={datos.torneos.filter((torneo) => torneo.estado !== 'Finalizado')} juegos={datos.juegos} />
    <section className="panel mt-5"><p className="sobretitulo">La emoción de competir</p><h2>Gran Final · Smash Ultimate</h2><div className="ratio ratio-16x9 mt-3"><iframe src="https://www.youtube-nocookie.com/embed/m6CrWBOxecY" title="EVO 2019: Gran Final de Smash Ultimate" loading="lazy" allow="fullscreen; picture-in-picture" allowFullScreen /></div></section>
  </>
}
export default Inicio
