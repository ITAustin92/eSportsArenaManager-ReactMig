import { useState } from 'react'
import { Link } from 'react-router-dom'
import Campo from '../compartidos/Campo'
import Boton from '../compartidos/Boton'
import MensajeError from '../compartidos/MensajeError'
import { actualizarInscripcion, eliminarInscripcion } from '../../datos/datos.js'

function MisInscripciones({ datos, sesion }) {
  const [editando, setEditando] = useState(null)
  const [correo, setCorreo] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [confirmarId, setConfirmarId] = useState(null)
  const propias = datos.inscripciones.filter((item) => item.jugadorId === sesion.jugadorId)
  const guardar = (evento) => {
    evento.preventDefault()
    try { actualizarInscripcion(editando, { correo }, sesion); setEditando(null); setError(''); setMensaje('Contacto actualizado.') } catch (fallo) { setError(fallo.message) }
  }
  const cancelar = (id) => {
    try {
      eliminarInscripcion(id, sesion)
      if (editando === id) { setEditando(null); setCorreo('') }
      setConfirmarId(null); setError(''); setMensaje('Inscripción cancelada; el cupo volvió a estar disponible.')
    } catch (fallo) { setError(fallo.message) }
  }
  return <section className="panel"><h2>Mis inscripciones</h2><MensajeError>{error}</MensajeError>{mensaje && <p role="status">{mensaje}</p>}
    {propias.length === 0 ? <p>No tienes inscripciones.</p> : <ul className="lista-limpia">{propias.map((item) => <li className="separador-fila" key={item.id}><Link to={'/torneos/' + item.torneoId}>{datos.torneos.find((torneo) => torneo.id === item.torneoId)?.nombre}</Link><p>{item.correo}</p><div className="acciones"><Boton variante="secundario" onClick={() => { setEditando(item.id); setCorreo(item.correo); setError('') }}>Editar contacto</Boton><Boton variante="peligro" onClick={() => setConfirmarId(item.id)}>Cancelar inscripción</Boton></div>{confirmarId === item.id && <div className="confirmacion"><p>¿Cancelar esta inscripción y liberar su cupo?</p><div className="acciones"><Boton variante="peligro" onClick={() => cancelar(item.id)}>Sí, cancelar inscripción</Boton><Boton variante="secundario" onClick={() => setConfirmarId(null)}>Volver</Boton></div></div>}</li>)}</ul>}
    {editando && <form noValidate onSubmit={guardar}><Campo id="editar-correo" nombre="correo" error={error} etiqueta="Nuevo correo de contacto" valor={correo} onCambiar={(evento) => setCorreo(evento.target.value)} tipo="email" /><div className="acciones"><Boton type="submit">Guardar contacto</Boton><Boton variante="secundario" onClick={() => setEditando(null)}>Cancelar edición</Boton></div></form>}
  </section>
}
export default MisInscripciones
