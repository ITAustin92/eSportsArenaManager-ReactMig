import { useState } from 'react'
import Campo from '../compartidos/Campo'
import Boton from '../compartidos/Boton'
import MensajeError from '../compartidos/MensajeError'
import { tipoPermitido, validarInscripcion } from '../../logica/inscripcion.js'
import useAhora from '../../logica/useAhora.js'

function FormularioInscripcion({ torneo, juego, equipos, jugador, jugadores, inscripciones, onEnviar }) {
  const [datos, setDatos] = useState({ tipoParticipante: '', equipoId: '', correo: jugador.correo })
  const [errores, setErrores] = useState({})
  const [errorEnvio, setErrorEnvio] = useState('')
  const [confirmacion, setConfirmacion] = useState(null)
  const hoy = useAhora()
  const equipo = equipos.find((item) => item.id === datos.equipoId)
  const contexto = { torneo, juego, equipo, jugador, jugadores, inscripciones }
  const validacion = validarInscripcion(datos, { ...contexto, hoy })
  const bloqueos = [errores.torneo ?? validacion.torneo, errores.jugador ?? validacion.jugador, errores.duplicidad ?? validacion.duplicidad, datos.equipoId && validacion.equipoId].filter(Boolean)
  const cambiar = (evento) => {
    setDatos((actual) => ({ ...actual, [evento.target.name]: evento.target.value }))
    setErrores({})
    setErrorEnvio('')
  }
  const enviar = (evento) => {
    evento.preventDefault()
    const encontrados = validarInscripcion(datos, contexto)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return
    try {
      onEnviar({ ...datos, torneoId: torneo.id })
      setConfirmacion({ nombre: torneo.nombre, correo: datos.correo, participante: equipo?.nombre ?? jugador.apodo })
    } catch (fallo) { setErrorEnvio(fallo.message) }
  }
  if (confirmacion) return <div className="panel" role="status"><h2>¡Inscripción confirmada!</h2><p>{confirmacion.participante} · {confirmacion.nombre}</p><p>Contacto registrado: {confirmacion.correo}</p><p>Tu inscripción ya aparece en el perfil. Esta demostración no envía correos.</p></div>
  return <form className="panel" noValidate onSubmit={enviar}><h2>Datos de inscripción</h2>
    <Campo id="ins-tipo" nombre="tipoParticipante" etiqueta="Inscribirse como" valor={datos.tipoParticipante} onCambiar={cambiar} error={errores.tipoParticipante} ayuda={'Este juego permite inscripción de ' + tipoPermitido(juego) + '.'}
      opciones={[{ valor: '', etiqueta: 'Selecciona una opción' }, { valor: 'equipo', etiqueta: 'Equipo completo', deshabilitada: tipoPermitido(juego) !== 'equipo' }, { valor: 'jugador', etiqueta: 'Jugador solitario', deshabilitada: tipoPermitido(juego) !== 'jugador' }]} />
    {datos.tipoParticipante === 'equipo' && <Campo id="ins-equipo" nombre="equipoId" etiqueta="Equipo" valor={datos.equipoId} onCambiar={cambiar} error={errores.equipoId ?? (datos.equipoId ? validacion.equipoId : '')} opciones={[{ valor: '', etiqueta: 'Selecciona un equipo' }, ...equipos.filter((item) => item.capitanId === jugador.id).map((item) => ({ valor: item.id, etiqueta: item.nombre + ' · ' + item.estado }))]} />}
    <Campo id="ins-correo" nombre="correo" etiqueta="Correo de contacto" tipo="email" valor={datos.correo} onCambiar={cambiar} error={errores.correo} autoComplete="email" />
    {bloqueos.map((bloqueo) => <MensajeError key={bloqueo}>{bloqueo}</MensajeError>)}
    <MensajeError>{errorEnvio}</MensajeError><Boton type="submit" disabled={bloqueos.length > 0}>Confirmar inscripción</Boton>
  </form>
}
export default FormularioInscripcion
