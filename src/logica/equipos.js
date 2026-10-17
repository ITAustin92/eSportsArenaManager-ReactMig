export function normalizarNombre(nombre = '') {
  return nombre.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function agregarIntegrante(integrantes, integrante) {
  return integrantes.some((item) => item.id === integrante.id) ? [...integrantes] : [...integrantes, integrante]
}

export function quitarIntegrante(integrantes, id) {
  return integrantes.filter((integrante) => integrante.id !== id)
}

export function equipoCompleto(equipo, juego) {
  if (!equipo || !juego || equipo.juegoId !== juego.id) return false
  const titulares = equipo.integrantes.filter((miembro) => miembro.rol !== 'Suplente')
  return titulares.length === juego.jugadoresPorEquipo
    && new Set(equipo.integrantes.map((miembro) => miembro.id)).size === equipo.integrantes.length
    && equipo.integrantes.filter((miembro) => miembro.rol === 'Capitán').length === 1
}

export function validarEquipo(datos, equipos = [], juego) {
  const errores = {}
  const nombre = normalizarNombre(datos.nombre)
  if (!nombre) errores.nombre = 'El nombre del equipo es obligatorio.'
  else if (equipos.some((equipo) => equipo.id !== datos.id && normalizarNombre(equipo.nombre) === nombre)) errores.nombre = 'Ese nombre ya está en uso.'
  if (!juego || juego.modalidad !== 'equipos') errores.juegoId = 'Selecciona un juego por equipos.'
  const integrantes = datos.integrantes ?? []
  if (!datos.capitanId || !integrantes.some((miembro) => miembro.id === datos.capitanId && miembro.rol !== 'Suplente')) errores.capitanId = 'El capitán debe ser un integrante titular.'
  if (new Set(integrantes.map((miembro) => miembro.id)).size !== integrantes.length) errores.integrantes = 'No se aceptan integrantes repetidos.'
  else if (juego && integrantes.filter((miembro) => miembro.rol !== 'Suplente').length !== juego.jugadoresPorEquipo) errores.integrantes = 'Debes completar exactamente ' + juego.jugadoresPorEquipo + ' titulares.'
  const suplentes = Number(datos.suplentes)
  if (!Number.isInteger(suplentes) || suplentes < 0 || suplentes > 2) errores.suplentes = 'Los suplentes deben ser un entero entre 0 y 2.'
  else if (integrantes.filter((miembro) => miembro.rol === 'Suplente').length !== suplentes) errores.suplentes = 'Agrega la cantidad de suplentes indicada.'
  if ((datos.clave ?? '').length < 6) errores.clave = 'La clave debe tener al menos 6 caracteres.'
  if (datos.confirmarClave !== datos.clave) errores.confirmarClave = 'Las claves no coinciden.'
  return errores
}
