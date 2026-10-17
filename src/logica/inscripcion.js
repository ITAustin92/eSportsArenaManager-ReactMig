import { cuposDisponibles } from './torneos.js'
import { equipoCompleto } from './equipos.js'

export function inscripcionFueraDePlazo(cierreISO, hoy = new Date()) {
  const cierre = Date.parse(cierreISO)
  return !Number.isFinite(cierre) || new Date(hoy).getTime() > cierre
}

export function tieneSancionActiva(sanciones = [], hoy = new Date()) {
  const ahora = new Date(hoy).getTime()
  return sanciones.some((sancion) => sancion.vigente
    && (!sancion.desde || Date.parse(sancion.desde) <= ahora)
    && (!sancion.hasta || Date.parse(sancion.hasta) >= ahora))
}

export function tipoPermitido(juego) {
  return juego?.modalidad === '1v1' ? 'jugador' : 'equipo'
}

export function validarInscripcion(datos, { torneo, juego, equipo, jugador, inscripciones = [], jugadores = [], hoy = new Date() } = {}) {
  const errores = {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo?.trim() ?? '')) errores.correo = 'Ingresa un correo electrónico válido.'
  if (!['jugador', 'equipo'].includes(datos.tipoParticipante)) errores.tipoParticipante = 'Selecciona un tipo de participante.'
  else if (datos.tipoParticipante !== tipoPermitido(juego)) errores.tipoParticipante = 'La modalidad no corresponde al juego.'
  if (!torneo || !juego) errores.torneo = 'Selecciona un torneo válido.'
  else if (torneo.estado !== 'Abierto') errores.torneo = 'El torneo no está abierto.'
  else if (inscripcionFueraDePlazo(torneo.cierreISO, hoy)) errores.torneo = 'El plazo de inscripción terminó.'
  else if (cuposDisponibles(torneo) === 0) errores.torneo = 'No quedan cupos disponibles.'
  if (!jugador) errores.jugador = 'Selecciona una sesión de jugador válida.'
  else if (tieneSancionActiva(jugador.sanciones, hoy)) errores.jugador = 'Tienes una sanción vigente.'
  if (datos.tipoParticipante === 'equipo') {
    if (!equipo) errores.equipoId = 'Selecciona un equipo.'
    else if (equipo.capitanId !== jugador?.id) errores.equipoId = 'Solo el capitán puede inscribir su equipo.'
    else if (equipo.estado === 'inactivo') errores.equipoId = 'El equipo está inactivo.'
    else if (equipo.estado === 'sancionado' || tieneSancionActiva(equipo.sanciones, hoy)) errores.equipoId = 'El equipo tiene una sanción vigente.'
    else if (equipo.estado === 'incompleto' || !equipoCompleto(equipo, juego)) errores.equipoId = 'El equipo está incompleto o no corresponde al juego.'
    else if (equipo.integrantes.some((miembro) => tieneSancionActiva(jugadores.find((item) => item.id === miembro.id)?.sanciones, hoy))) errores.equipoId = 'Un integrante tiene una sanción vigente.'
  }
  const participanteId = datos.tipoParticipante === 'equipo' ? equipo?.id : jugador?.id
  if (participanteId && (torneo?.inscritos.includes(participanteId)
    || inscripciones.some((item) => item.torneoId === torneo?.id && item.participanteId === participanteId))) errores.duplicidad = 'Este participante ya está inscrito.'
  return errores
}
