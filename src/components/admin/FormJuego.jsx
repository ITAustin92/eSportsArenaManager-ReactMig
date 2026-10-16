import { useState } from 'react'
import Campo from '../compartidos/Campo'
import Boton from '../compartidos/Boton'
import MensajeError from '../compartidos/MensajeError'
import { validarJuego } from '../../logica/juegos.js'

function FormJuego({ juego, juegos, bloqueado, onGuardar, onCancelar }) {
  const [datos, setDatos] = useState(() => juego ? { ...juego } : { nombre: '', modalidad: '1v1', jugadoresPorEquipo: 1 })
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const cambiar = ({ target: { name, value, type } }) => setDatos((actual) => ({ ...actual, [name]: type === 'number' ? Number(value) : value }))
  const guardar = (evento) => {
    evento.preventDefault()
    const fallos = validarJuego(datos, juegos)
    setErrores(fallos)
    if (Object.keys(fallos).length > 0) return
    try { onGuardar(datos); setError('') } catch (fallo) { setError(fallo.message) }
  }
  return <form className="panel" onSubmit={guardar} noValidate><h2>{juego ? 'Editar juego' : 'Crear juego'}</h2>
    {bloqueado && <p>Modalidad y tamaño bloqueados: este juego tiene equipos o torneos asociados.</p>}
    <Campo id="juego-nombre" nombre="nombre" etiqueta="Nombre del juego" valor={datos.nombre} onCambiar={cambiar} error={errores.nombre} />
    <Campo id="juego-modalidad" nombre="modalidad" etiqueta="Modalidad" valor={datos.modalidad} onCambiar={cambiar} error={errores.modalidad} disabled={bloqueado} opciones={[{ valor: '1v1', etiqueta: '1v1' }, { valor: 'equipos', etiqueta: 'Equipos' }]} />
    <Campo id="juego-tamano" nombre="jugadoresPorEquipo" etiqueta="Titulares por participante" tipo="number" min="1" max="10" step="1" valor={datos.jugadoresPorEquipo} onCambiar={cambiar} error={errores.jugadoresPorEquipo} disabled={bloqueado} />
    <MensajeError>{error}</MensajeError><div className="acciones"><Boton type="submit">Guardar juego</Boton>{onCancelar && <Boton variante="secundario" onClick={onCancelar}>Cancelar edición de juego</Boton>}</div>
  </form>
}
export default FormJuego
