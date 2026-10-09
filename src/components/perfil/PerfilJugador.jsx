import { useState } from 'react'
import AvatarJugador from './AvatarJugador'
import Estadisticas from './Estadisticas'
import MensajeError from '../compartidos/MensajeError'
import { validarApodo } from '../../logica/perfil'

function PerfilJugador({ jugador, equipos = [], archivoAvatar, onCambiarAvatar, onCambiarApodo }) {
  const [apodo, setApodo] = useState('')
  const [error, setError] = useState('')
  const [guardado, setGuardado] = useState(false)
  const guardar = (evento) => {
    evento.preventDefault()
    const mensaje = validarApodo(apodo)
    setError(mensaje)
    setGuardado(!mensaje)
    if (!mensaje) {
      onCambiarApodo(apodo)
      setApodo('')
    }
  }

  return (
    <div className="contenedor-principal dashboard-perfil">
      <aside className="columna-perfil">
        <div className="modulo-detalle tarjeta-jugador">
          <AvatarJugador archivo={archivoAvatar} onCambiar={onCambiarAvatar} />
          <h2 id="display-apodo">{jugador.apodo}</h2>
          <p className="tarjeta-info">{jugador.correo}</p>
          <hr className="separador-panel" />
          <h3>Actualizar Apodo</h3>
          <form id="form-perfil" noValidate onSubmit={guardar}>
            <div className="grupo-formulario">
              <label htmlFor="input-apodo">Nuevo Apodo:</label>
              <input type="text" id="input-apodo" name="apodo" placeholder="Ej: KunAguero" value={apodo} onChange={(evento) => { setApodo(evento.target.value); setError(''); setGuardado(false) }} className={error ? 'input-invalido' : undefined} aria-invalid={!!error} aria-describedby={error ? 'error-apodo' : undefined} />
              <span className="texto-ayuda">Obligatorio, sin espacios, entre 3 y 15 caracteres.</span>
              <MensajeError id="error-apodo">{error}</MensajeError>
            </div>
            <button type="submit" className="boton-primario boton-ancho">Guardar Cambios</button>
          </form>
          {guardado && <div id="mensaje-exito-perfil" style={{ marginTop: 15, padding: 10 }} className="alerta-exito" role="status"><h3 style={{ fontSize: 14, marginBottom: 0 }}>¡Apodo actualizado!</h3></div>}
        </div>
      </aside>
      <section className="columna-datos">
        <Estadisticas victorias={jugador.victorias} derrotas={jugador.derrotas} />
        <div className="modulo-detalle">
          <h2>Mis Equipos</h2>
          <ul id="lista-mis-equipos" className="lista-perfil">{[...jugador.equipos, ...equipos.map((equipo) => equipo.nombre)].map((equipo) => <li key={equipo} className="item-perfil"><strong>{equipo}</strong></li>)}</ul>
        </div>
        <div className="modulo-detalle">
          <h2>Historial de Torneos</h2>
          <ul id="lista-historial" className="lista-perfil">{jugador.historial.map((item) => <li key={item.torneo} className="item-perfil"><span>{item.torneo}</span><span className="badge-estado badge-secundario">{item.resultado}</span></li>)}</ul>
        </div>
        <div className="modulo-detalle">
          <h2>Sanciones</h2>
          <ul id="lista-sanciones" className="lista-perfil">{jugador.sanciones.map((sancion) => <li key={sancion.motivo} className="item-perfil" style={sancion.estado === 'Vigente' ? { borderLeft: '3px solid var(--color-error)' } : undefined}><span>{sancion.motivo}</span><span className={sancion.estado === 'Vigente' ? 'badge-sancion-vigente' : 'badge-sancion-cumplida'}>{sancion.estado}</span></li>)}</ul>
        </div>
      </section>
    </div>
  )
}

export default PerfilJugador
