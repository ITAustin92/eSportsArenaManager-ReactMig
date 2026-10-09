import { useState } from 'react'
import ListaIntegrantes from './ListaIntegrantes'
import MensajeError from '../compartidos/MensajeError'
import { jugadores, capitanes, jugadoresPorJuego, validarEquipo } from '../../logica/equipos'

function FormEquipo({ equipos = [], onGuardar }) {
  const [datos, setDatos] = useState({ nombre: '', juego: '', capitan: '', integrantes: [] })
  const [nuevoJugador, setNuevoJugador] = useState('')
  const [errores, setErrores] = useState({})
  const [guardado, setGuardado] = useState(false)
  const cantidad = jugadoresPorJuego[datos.juego] ?? 0

  const cambiar = (campo, valor) => {
    setDatos((actuales) => ({ ...actuales, [campo]: valor }))
    setErrores((actuales) => ({ ...actuales, [campo]: undefined }))
    if (campo === 'juego') {
      const requerida = jugadoresPorJuego[valor] ?? 0
      setErrores((actuales) => ({ ...actuales, integrantes: requerida && datos.integrantes.length > requerida
        ? `El equipo tiene ${datos.integrantes.length} integrantes, pero ${valor} exige exactamente ${requerida}. Quita ${datos.integrantes.length - requerida} integrante(s).`
        : undefined }))
    }
  }

  const agregar = () => {
    let error = ''
    if (!nuevoJugador) return
    if (datos.integrantes.includes(nuevoJugador)) error = 'Este jugador ya está en la lista.'
    else if (!cantidad) error = 'Primero debes seleccionar el juego principal del equipo.'
    else if (datos.integrantes.length >= cantidad) error = `No puedes agregar más jugadores: ${datos.juego} exige exactamente ${cantidad} integrantes.`
    setErrores((actuales) => ({ ...actuales, integrantes: error }))
    if (!error) {
      setDatos((actuales) => ({ ...actuales, integrantes: [...actuales.integrantes, nuevoJugador] }))
      setNuevoJugador('')
    }
  }

  const quitar = (jugador) => {
    setDatos((actuales) => ({ ...actuales, integrantes: actuales.integrantes.filter((nombre) => nombre !== jugador) }))
    setErrores((actuales) => ({ ...actuales, integrantes: undefined }))
  }

  const guardar = (evento) => {
    evento.preventDefault()
    const nuevosErrores = validarEquipo(datos, equipos)
    setErrores(nuevosErrores)
    if (!Object.keys(nuevosErrores).length) {
      onGuardar({ ...datos, nombre: datos.nombre.trim(), id: crypto.randomUUID() })
      setGuardado(true)
    }
  }

  return (
    <div className="contenedor-principal layout-inscripcion">
      <section className="panel-formulario">
        <h2>Crear Nuevo Equipo</h2>
        {!guardado ? (
          <form id="form-equipo" noValidate onSubmit={guardar}>
            <div className="grupo-formulario">
              <label htmlFor="nombre-equipo">Nombre del Equipo:</label>
              <input type="text" id="nombre-equipo" name="nombre" placeholder="Ej: Los Pinguinos Tácticos" autoComplete="off" value={datos.nombre} onChange={(evento) => cambiar('nombre', evento.target.value)} className={errores.nombre ? 'input-invalido' : undefined} aria-invalid={!!errores.nombre} aria-describedby={errores.nombre ? 'error-nombre' : undefined} />
              <MensajeError id="error-nombre">{errores.nombre}</MensajeError>
            </div>
            <div className="grupo-formulario">
              <label htmlFor="juego-principal">Juego Principal:</label>
              <select id="juego-principal" name="juego" value={datos.juego} onChange={(evento) => cambiar('juego', evento.target.value)} className={errores.juego ? 'input-invalido' : undefined} aria-invalid={!!errores.juego} aria-describedby={errores.juego ? 'error-juego' : undefined}>
                <option value="">Selecciona un juego...</option>
                {['Valorant', 'League of Legends', 'Rocket League'].map((juego) => <option key={juego} value={juego}>{juego}</option>)}
              </select>
              <MensajeError id="error-juego">{errores.juego}</MensajeError>
            </div>
            <div className="grupo-formulario">
              <label htmlFor="capitan-equipo">Capitán del Equipo:</label>
              <select id="capitan-equipo" name="capitan" value={datos.capitan} onChange={(evento) => cambiar('capitan', evento.target.value)} className={errores.capitan ? 'input-invalido' : undefined} aria-invalid={!!errores.capitan} aria-describedby={errores.capitan ? 'error-capitan' : undefined}>
                <option value="">Selecciona un jugador...</option>
                {capitanes.map((capitan) => <option key={capitan} value={capitan}>{capitan}</option>)}
              </select>
              <MensajeError id="error-capitan">{errores.capitan}</MensajeError>
            </div>
            <hr className="separador-panel" />
            <h3>Integrantes del Equipo</h3>
            <p id="ayuda-integrantes" className="texto-ayuda">{cantidad ? `Este juego requiere ${cantidad} integrantes Actualmente: ${datos.integrantes.length}/${cantidad}.` : 'Selecciona un juego para conocer la cantidad exacta de jugadores requerida.'}</p>
            <div className="gestor-agregado">
              <div className="grupo-formulario" style={{ flexGrow: 1, marginBottom: 0 }}>
                <select id="nuevo-jugador" aria-label="Seleccionar jugador para invitar" aria-describedby="ayuda-integrantes" value={nuevoJugador} onChange={(evento) => setNuevoJugador(evento.target.value)}>
                  <option value="">Seleccionar jugador para invitar...</option>
                  {jugadores.map((jugador) => <option key={jugador} value={jugador}>{jugador}</option>)}
                </select>
              </div>
              <button type="button" id="btn-agregar-jugador" className="boton-primario boton-secundario" disabled={cantidad > 0 && datos.integrantes.length >= cantidad} onClick={agregar}>Agregar</button>
            </div>
            <MensajeError id="error-integrantes" style={{ marginBottom: 15 }}>{errores.integrantes}</MensajeError>
            <ListaIntegrantes integrantes={datos.integrantes} capitan={datos.capitan} onQuitar={quitar} />
            <button type="submit" className="boton-primario boton-ancho" style={{ marginTop: 20 }}>Guardar Equipo</button>
          </form>
        ) : (
          <div id="mensaje-exito-equipo" className="alerta-exito" role="status"><h3>¡Equipo Creado!</h3><p>Tu equipo ha sido registrado exitosamente en la plataforma.</p></div>
        )}
      </section>
    </div>
  )
}

export default FormEquipo
