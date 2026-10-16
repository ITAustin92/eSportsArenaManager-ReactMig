import { useState } from 'react'
import Campo from '../compartidos/Campo'
import Boton from '../compartidos/Boton'
import MensajeError from '../compartidos/MensajeError'
import ListaIntegrantes from './ListaIntegrantes'
import { agregarIntegrante, quitarIntegrante, validarEquipo } from '../../logica/equipos.js'

function FormEquipo({ equipo, equipos, juegos, jugadores, jugadorId, onGuardar, onCancelar }) {
  const [datos, setDatos] = useState(() => equipo ? { ...equipo, estado: equipo.estado === 'inactivo' ? 'inactivo' : 'habilitado', clave: '', confirmarClave: '' } : { nombre: '', juegoId: '', capitanId: jugadorId, integrantes: [], suplentes: 0, clave: '', confirmarClave: '', estado: 'habilitado' })
  const [nuevo, setNuevo] = useState({ jugadorId: '', rol: 'Titular' })
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const juego = juegos.find((item) => item.id === datos.juegoId)
  const cambiar = (evento) => {
    const { name, value, type } = evento.target
    setDatos((actual) => ({ ...actual, [name]: type === 'number' ? Number(value) : value }))
    setErrores({})
  }
  const agregar = () => {
    const jugador = jugadores.find((item) => item.id === nuevo.jugadorId)
    if (!jugador) { setError('Selecciona un jugador para agregar.'); return }
    if (datos.integrantes.some((item) => item.id === jugador.id)) { setError('El integrante ya está en la lista.'); return }
    setDatos((actual) => ({ ...actual, integrantes: agregarIntegrante(actual.integrantes, { id: jugador.id, nombre: jugador.nombre, apodo: jugador.apodo, correo: jugador.correo, rol: nuevo.rol }) }))
    setError('')
  }
  const guardar = (evento) => {
    evento.preventDefault()
    const encontrados = validarEquipo(datos, equipos, juego)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return
    try { onGuardar(datos); setError('') } catch (fallo) { setError(fallo.message) }
  }
  return <form className="panel" onSubmit={guardar} noValidate><h2>{equipo ? 'Editar equipo' : 'Crear nuevo equipo'}</h2>
    <Campo id="equipo-nombre" nombre="nombre" etiqueta="Nombre del equipo" valor={datos.nombre} onCambiar={cambiar} error={errores.nombre} />
    <Campo id="equipo-juego" nombre="juegoId" etiqueta="Juego principal" valor={datos.juegoId} onCambiar={cambiar} error={errores.juegoId} opciones={[{ valor: '', etiqueta: 'Selecciona un juego' }, ...juegos.filter((item) => item.modalidad === 'equipos').map((item) => ({ valor: item.id, etiqueta: item.nombre }))]} />
    <Campo id="equipo-capitan" nombre="capitanId" etiqueta="Capitán" valor={datos.capitanId} onCambiar={cambiar} error={errores.capitanId} ayuda="Debes ser capitán para gestionar este equipo." opciones={[{ valor: '', etiqueta: 'Selecciona un capitán' }, ...jugadores.filter((item) => item.id === jugadorId).map((item) => ({ valor: item.id, etiqueta: item.nombre }))]} />
    <Campo id="equipo-suplentes" nombre="suplentes" etiqueta="Cantidad de suplentes (0–2)" tipo="number" min="0" max="2" step="1" valor={datos.suplentes} onCambiar={cambiar} error={errores.suplentes} />
    <Campo id="equipo-estado" nombre="estado" etiqueta="Estado" valor={datos.estado} onCambiar={cambiar} opciones={[{ valor: 'habilitado', etiqueta: 'Habilitado' }, { valor: 'inactivo', etiqueta: 'Inactivo' }]} />
    <h3>Integrantes</h3><p>{juego ? juego.jugadoresPorEquipo + ' titulares y ' + datos.suplentes + ' suplentes requeridos.' : 'Selecciona un juego para conocer la plantilla requerida.'}</p>
    <Campo id="equipo-nuevo" nombre="jugadorId" aria-describedby={errores.integrantes ? "equipo-integrantes-error" : undefined} etiqueta="Jugador para agregar" valor={nuevo.jugadorId} onCambiar={(evento) => setNuevo((actual) => ({ ...actual, [evento.target.name]: evento.target.value }))} opciones={[{ valor: '', etiqueta: 'Selecciona un jugador' }, ...jugadores.map((item) => ({ valor: item.id, etiqueta: item.nombre + ' · ' + item.apodo }))]} />
    <Campo id="equipo-rol" nombre="rol" etiqueta="Rol del integrante" valor={nuevo.rol} onCambiar={(evento) => setNuevo((actual) => ({ ...actual, [evento.target.name]: evento.target.value }))} opciones={[{ valor: 'Titular', etiqueta: 'Titular' }, { valor: 'Suplente', etiqueta: 'Suplente' }]} />
    <Boton variante="secundario" onClick={agregar}>Agregar integrante</Boton>
    <ListaIntegrantes integrantes={datos.integrantes} capitanId={datos.capitanId} onQuitar={(id) => setDatos((actual) => ({ ...actual, integrantes: quitarIntegrante(actual.integrantes, id) }))} /><MensajeError id="equipo-integrantes-error">{errores.integrantes}</MensajeError>
    <Campo id="equipo-clave" nombre="clave" etiqueta="Clave del equipo" tipo="password" valor={datos.clave} onCambiar={cambiar} error={errores.clave} autoComplete="new-password" ayuda="Mínimo 6 caracteres. Usa una clave ficticia para esta demostración." />
    <Campo id="equipo-confirmar" nombre="confirmarClave" etiqueta="Confirmar clave" tipo="password" valor={datos.confirmarClave} onCambiar={cambiar} error={errores.confirmarClave} autoComplete="new-password" />
    <MensajeError>{error}</MensajeError><div className="acciones"><Boton type="submit">Guardar equipo</Boton>{onCancelar && <Boton variante="secundario" onClick={onCancelar}>Cancelar edición</Boton>}</div>
  </form>
}
export default FormEquipo
