import { crearDatosIniciales } from '../datos/datos.js'
export function fixture(hoy = new Date('2030-01-01T12:00:00Z')) {
  const datos = crearDatosIniciales(hoy)
  const torneo = datos.torneos.find((item) => item.juegoId === 'valorant' && item.estado === 'Abierto')
  const juego = datos.juegos.find((item) => item.id === 'valorant')
  const equipo = datos.equipos.find((item) => item.id === 'e-demo')
  const jugador = datos.jugadores.find((item) => item.id === 'p-felipe')
  return { datos, torneo, juego, equipo, jugador, jugadores: datos.jugadores, inscripciones: datos.inscripciones, hoy }
}
export function storageFalso() {
  const registros = new Map()
  return { getItem: (clave) => registros.get(clave) ?? null, setItem: (clave, valor) => registros.set(clave, valor), removeItem: (clave) => registros.delete(clave) }
}
