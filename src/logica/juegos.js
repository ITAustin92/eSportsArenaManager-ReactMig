import { normalizarNombre } from './equipos.js'

export function validarJuego(datos, juegos = []) {
  const errores = {}
  if (!datos.nombre?.trim()) errores.nombre = 'El nombre es obligatorio.'
  else if (juegos.some((juego) => juego.id !== datos.id && normalizarNombre(juego.nombre) === normalizarNombre(datos.nombre))) errores.nombre = 'Ese juego ya existe.'
  if (!['1v1', 'equipos'].includes(datos.modalidad)) errores.modalidad = 'Selecciona una modalidad válida.'
  const cantidad = Number(datos.jugadoresPorEquipo)
  if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 10 || (datos.modalidad === '1v1' && cantidad !== 1)) errores.jugadoresPorEquipo = 'Indica 1 para 1v1 o entre 1 y 10 jugadores por equipo.'
  return errores
}
