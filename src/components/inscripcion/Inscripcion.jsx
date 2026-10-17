import { useSearchParams } from 'react-router-dom'
import Campo from '../compartidos/Campo'
import FormularioInscripcion from './FormularioInscripcion'
import ResumenTorneo from './ResumenTorneo'
import useAuth from '../auth/useAuth'
import { crearInscripcion } from '../../datos/datos.js'

function Inscripcion({ datos }) {
  const { sesion } = useAuth()
  const [parametros, setParametros] = useSearchParams()
  const torneoId = parametros.get('torneo') ?? datos.torneos[0]?.id
  const torneo = datos.torneos.find((item) => item.id === torneoId)
  const jugador = datos.jugadores.find((item) => item.id === sesion.jugadorId)
  const juego = datos.juegos.find((item) => item.id === torneo?.juegoId)
  return <><p className="sobretitulo">Reserva tu lugar</p><h1>Inscripción a torneo</h1>
    <Campo id="ins-torneo" nombre="torneoId" etiqueta="Torneo" valor={torneoId ?? ''} onCambiar={(evento) => setParametros({ torneo: evento.target.value })} opciones={[{ valor: '', etiqueta: 'Selecciona un torneo' }, ...datos.torneos.map((item) => ({ valor: item.id, etiqueta: item.nombre }))]} />
    {!torneo ? <p>No existe el torneo seleccionado. Elige otro de la lista.</p> : <div className="row g-4"><div className="col-12 col-lg-5"><ResumenTorneo torneo={torneo} juego={juego} /></div><div className="col-12 col-lg-7"><FormularioInscripcion key={torneo.id} torneo={torneo} juego={juego} equipos={datos.equipos} jugador={jugador} jugadores={datos.jugadores} inscripciones={datos.inscripciones} onEnviar={(registro) => crearInscripcion(registro, sesion)} /></div></div>}
  </>
}
export default Inscripcion
