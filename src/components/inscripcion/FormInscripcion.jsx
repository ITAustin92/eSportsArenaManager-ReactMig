import { useState } from 'react'
import ResumenTorneo from './ResumenTorneo'
import MensajeError from '../compartidos/MensajeError'
import { motivoBloqueo, tipoPermitido, validarInscripcion } from '../../logica/inscripcion'

function FormInscripcion({ torneo, torneos, equipos, onCambiarTorneo }) {
  const [datos, setDatos] = useState({ tipoParticipante: '', equipoSeleccionado: '', correo: '' })
  const [errores, setErrores] = useState({})
  const [confirmacion, setConfirmacion] = useState(null)
  const bloqueo = motivoBloqueo(torneo)
  const tipo = tipoPermitido(torneo)
  const cambiar = (campo, valor) => {
    setDatos((actuales) => ({ ...actuales, [campo]: valor }))
    setErrores((actuales) => ({ ...actuales, [campo === 'equipoSeleccionado' ? 'equipo' : campo]: undefined }))
  }
  const enviar = (evento) => {
    evento.preventDefault()
    const nuevosErrores = validarInscripcion(datos, torneo, equipos)
    setErrores(nuevosErrores)
    if (!Object.keys(nuevosErrores).length) setConfirmacion({ ...datos, correo: datos.correo.trim() })
  }

  return (
    <div className="contenedor-principal layout-inscripcion">
      <ResumenTorneo torneo={torneo} torneos={torneos} onCambiar={onCambiarTorneo} />
      <section className="panel-formulario">
        <h2>Formulario de Inscripción</h2>
        <MensajeError id="aviso-inscripcion-bloqueada" className="mensaje-error-campo mensaje-bloqueo-torneo">{bloqueo}</MensajeError>
        {!confirmacion ? (
          <form id="form-inscripcion" noValidate onSubmit={enviar}>
            <div className="grupo-formulario">
              <label htmlFor="tipo-participante">Inscribirse como:</label>
              <select id="tipo-participante" name="tipoParticipante" value={datos.tipoParticipante} onChange={(evento) => cambiar('tipoParticipante', evento.target.value)} disabled={!!bloqueo} className={errores.tipoParticipante ? 'input-invalido' : undefined} aria-invalid={!!errores.tipoParticipante} aria-describedby={errores.tipoParticipante ? 'error-tipo' : 'ayuda-tipo-participante'}>
                <option value="">Selecciona una opción...</option>
                <option value="jugador" disabled={tipo === 'equipo'}>Jugador Solitario (Agente Libre)</option>
                <option value="equipo" disabled={tipo === 'jugador'}>Equipo Completo</option>
              </select>
              <span className="texto-ayuda" id="ayuda-tipo-participante">{tipo === 'equipo' ? `${torneo.juego} se juega en modalidad de equipo (${torneo.modalidad}). No se aceptan inscripciones de jugador solitario.` : `${torneo.juego} es un torneo 1v1. No se aceptan inscripciones por equipo.`}</span>
              <MensajeError id="error-tipo">{errores.tipoParticipante}</MensajeError>
            </div>
            {datos.tipoParticipante === 'equipo' && (
              <div className="grupo-formulario" id="contenedor-equipo">
                <label htmlFor="selector-equipo">Selecciona tu equipo:</label>
                <select id="selector-equipo" name="equipoSeleccionado" value={datos.equipoSeleccionado} onChange={(evento) => cambiar('equipoSeleccionado', evento.target.value)} disabled={!!bloqueo} className={errores.equipo ? 'input-invalido' : undefined} aria-invalid={!!errores.equipo} aria-describedby={errores.equipo ? 'error-equipo' : undefined}>
                  <option value="">Selecciona tu equipo...</option>
                  {equipos.map((equipo) => <option key={equipo.id} value={equipo.id}>{equipo.etiqueta ?? equipo.nombre}</option>)}
                </select>
                <span className="texto-ayuda">Solo aparecen los equipos de los que eres capitán.</span>
                <MensajeError id="error-equipo">{errores.equipo}</MensajeError>
              </div>
            )}
            <div className="grupo-formulario">
              <label htmlFor="correo-contacto">Correo electrónico de contacto:</label>
              <input type="email" id="correo-contacto" name="correo" autoComplete="email" placeholder="ejemplo@correo.com" value={datos.correo} onChange={(evento) => cambiar('correo', evento.target.value)} disabled={!!bloqueo} className={errores.correo ? 'input-invalido' : undefined} aria-invalid={!!errores.correo} aria-describedby={errores.correo ? 'error-correo' : undefined} />
              <span className="texto-ayuda">Aquí enviaremos la confirmación y los accesos a las llaves.</span>
              <MensajeError id="error-correo">{errores.correo}</MensajeError>
            </div>
            <button type="submit" className="boton-primario boton-ancho" disabled={!!bloqueo}>Confirmar Inscripción</button>
          </form>
        ) : (
          <div id="mensaje-exito" className="alerta-exito" role="status">
            <h3>¡Inscripción Exitosa!</h3>
            <p id="detalle-confirmacion">Te inscribiste en {torneo.nombre} como {confirmacion.tipoParticipante === 'equipo' ? 'equipo' : 'jugador solitario'}. Enviaremos la confirmación a {confirmacion.correo}.</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default FormInscripcion
