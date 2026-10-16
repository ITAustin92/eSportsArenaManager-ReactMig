import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../auth/useAuth'
import AvatarJugador from './AvatarJugador'
import Estadisticas from './Estadisticas'
import Campo from '../compartidos/Campo'
import Boton from '../compartidos/Boton'
import BadgeEstado from '../compartidos/BadgeEstado'
import MisInscripciones from '../inscripcion/MisInscripciones'
import { validarApodo, validarAvatar } from '../../logica/perfil.js'
import { actualizarJugador } from '../../datos/datos.js'
import { formatearFecha } from '../../logica/torneos.js'

function PerfilJugador({ datos }) {
  const { sesion } = useAuth()
  const jugador = datos.jugadores.find((item) => item.id === sesion.jugadorId)
  const [apodo, setApodo] = useState(jugador.apodo)
  const [error, setError] = useState('')
  const [errorAvatar, setErrorAvatar] = useState('')
  const [mensaje, setMensaje] = useState('')
  const guardar = (evento) => {
    evento.preventDefault()
    const encontrado = validarApodo(apodo)
    setError(encontrado)
    if (encontrado) return
    try { actualizarJugador(jugador.id, { apodo }, sesion); setMensaje('Apodo actualizado.') } catch (fallo) { setError(fallo.message) }
  }
  const cambiarAvatar = (evento) => {
    const archivo = evento.target.files?.[0]
    if (!archivo) return
    const encontrado = validarAvatar(archivo)
    setErrorAvatar(encontrado)
    if (encontrado) return
    const lector = new FileReader()
    lector.onload = () => { try { actualizarJugador(jugador.id, { avatar: lector.result }, sesion); setMensaje('Foto actualizada.') } catch (fallo) { setErrorAvatar(fallo.message) } }
    lector.onerror = () => setErrorAvatar('No se pudo leer la imagen.')
    lector.readAsDataURL(archivo)
  }
  return <><p className="sobretitulo">Tu trayectoria</p><h1>Perfil de jugador</h1><div className="row g-4"><section className="col-12 col-lg-4"><div className="panel"><AvatarJugador src={jugador.avatar} apodo={jugador.apodo} onCambiar={cambiarAvatar} error={errorAvatar} /><h2 className="mt-3">{jugador.apodo}</h2><p>{jugador.correo}</p><form onSubmit={guardar} noValidate><Campo id="perfil-apodo" nombre="apodo" etiqueta="Nuevo apodo" valor={apodo} onCambiar={(evento) => setApodo(evento.target.value)} error={error} autoComplete="nickname" ayuda="Entre 3 y 15 caracteres, sin espacios." /><Boton type="submit">Guardar apodo</Boton></form>{mensaje && <p className="mt-3" role="status">{mensaje}</p>}</div></section>
    <div className="col-12 col-lg-8"><Estadisticas victorias={jugador.victorias} derrotas={jugador.derrotas} /><section className="panel mt-4"><h2>Mis equipos</h2>{jugador.equipos.length === 0 ? <p>Aún no perteneces a un equipo.</p> : <ul>{datos.equipos.filter((equipo) => jugador.equipos.includes(equipo.id)).map((equipo) => <li key={equipo.id}>{equipo.nombre} · <BadgeEstado estado={equipo.estado} /></li>)}</ul>}</section>
    <section className="panel my-4"><h2>Historial de torneos</h2>{jugador.historial.length === 0 ? <p>Aún no hay resultados históricos.</p> : <ul>{jugador.historial.map((item) => <li key={item.id}><Link to={'/torneos/' + item.torneoId}>{item.nombre}</Link> · {item.resultado}</li>)}</ul>}</section>
    <section className="panel mb-4"><h2>Sanciones</h2>{jugador.sanciones.length === 0 ? <p>Sin sanciones</p> : <ul className="lista-limpia">{jugador.sanciones.map((sancion) => <li key={sancion.id} className="separador-fila"><BadgeEstado estado={sancion.vigente ? 'Vigente' : 'Cumplida'} /><p>{sancion.motivo}</p><p className="texto-secundario">{formatearFecha(sancion.desde)} — {formatearFecha(sancion.hasta)}</p></li>)}</ul>}</section>
    <MisInscripciones datos={datos} sesion={sesion} /></div></div></>
}
export default PerfilJugador
