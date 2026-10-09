export const equiposIniciales = [
  { id: 'KRU', nombre: 'KRÜ Esports', etiqueta: 'KRÜ Esports (Completamente habilitado)' },
  { id: 'incompleto', nombre: 'Equipo Incompleto', etiqueta: 'Equipo Incompleto (Faltan jugadores)', incompleto: true },
  { id: 'sancionado', nombre: 'Equipo Sancionado', etiqueta: 'Equipo Sancionado (Bloqueado)', sancionado: true },
]

export function tipoPermitido(torneo) {
  return torneo.modalidad === '1v1' ? 'jugador' : 'equipo'
}

export function motivoBloqueo(torneo) {
  if (!torneo) return 'Selecciona un torneo válido.'
  const razones = []
  if (torneo.estado === 'En Curso') razones.push('el torneo ya está en curso')
  if (torneo.estado === 'Finalizado') razones.push('el torneo ya finalizó')
  if (torneo.cuposOcupados >= torneo.cuposMaximos) razones.push('no quedan cupos disponibles')
  return razones.length ? `No puedes inscribirte: ${razones.join(' y ')}.` : ''
}

export function validarInscripcion(datos, torneo, equipos = equiposIniciales) {
  const errores = {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo?.trim() ?? '')) errores.correo = 'Ingresa un correo electrónico válido.'
  if (!['jugador', 'equipo'].includes(datos.tipoParticipante)) errores.tipoParticipante = 'Debes seleccionar un tipo de participante.'
  else if (torneo && datos.tipoParticipante !== tipoPermitido(torneo)) {
    errores.tipoParticipante = tipoPermitido(torneo) === 'equipo'
      ? `${torneo.juego} es de modalidad equipo, no se aceptan inscripciones individuales.`
      : `${torneo.juego} es 1v1, no se aceptan inscripciones por equipo.`
  }
  if (datos.tipoParticipante === 'equipo') {
    const equipo = equipos.find((item) => item.id === datos.equipoSeleccionado)
    if (!equipo) errores.equipo = 'Debes seleccionar un equipo válido para inscribirte.'
    else if (equipo.sancionado) errores.equipo = 'Este equipo tiene una sanción vigente y no puede inscribirse.'
    else if (equipo.incompleto) errores.equipo = 'El equipo no cumple el mínimo de integrantes exigido por el juego.'
    else if (torneo && equipo.juego && equipo.juego !== torneo.juego) errores.equipo = 'El equipo debe competir en el mismo juego del torneo.'
  }
  if (torneo && motivoBloqueo(torneo)) errores.torneo = motivoBloqueo(torneo)
  return errores
}
