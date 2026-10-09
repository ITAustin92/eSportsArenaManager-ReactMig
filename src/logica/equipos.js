export function agregarIntegrante(integrantes, integrante) { return [...integrantes, integrante] }
export function quitarIntegrante(integrantes, id) { return integrantes.filter((integrante) => integrante.id !== id) }

export const jugadores = ['Felipe', 'Matias', 'Sofia', 'Juan', 'Valentina']
export const capitanes = ['Felipe', 'Matias', 'Sofia']
export const jugadoresPorJuego = { 'Rocket League': 3, Valorant: 5, 'League of Legends': 5 }

function normalizarNombre(nombre) {
  return nombre.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function validarEquipo(datos, equiposCreados = []) {
  const errores = {}
  const nombre = normalizarNombre(datos.nombre ?? '')
  const existentes = ['kru esports', 'leviatan', '9z team', ...equiposCreados.map((equipo) => normalizarNombre(equipo.nombre))]
  const integrantes = datos.integrantes ?? []
  const cantidad = jugadoresPorJuego[datos.juego] ?? 0
  if (!nombre) errores.nombre = 'El nombre del equipo es obligatorio.'
  else if (existentes.includes(nombre)) errores.nombre = 'Ese nombre ya está en uso por otro equipo.'
  if (!cantidad) errores.juego = 'Debes seleccionar un juego principal para definir la cantidad de integrantes requerida.'
  if (!capitanes.includes(datos.capitan)) errores.capitan = 'El equipo debe tener un capitán asignado'
  else if (!integrantes.includes(datos.capitan)) errores.capitan = 'El capitán debe estar agregado como integrante del equipo.'
  if (cantidad && integrantes.length !== cantidad) errores.integrantes = `Para ${datos.juego} debes registrar exactamente ${cantidad} integrantes. Actualmente hay ${integrantes.length}.`
  else if (new Set(integrantes).size !== integrantes.length) errores.integrantes = 'Este jugador ya está en la lista.'
  else if (integrantes.some((jugador) => !jugadores.includes(jugador))) errores.integrantes = 'Selecciona jugadores válidos para el equipo.'
  return errores
}
