export const estadosTorneo = ['Abierto', 'En Curso', 'Finalizado']
export const estadosPartida = ['Programada', 'En juego', 'Finalizada']

const formatoDia = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' })

export function fechaSantiago(fecha) {
  const partes = formatoDia.formatToParts(new Date(fecha))
  const valor = (tipo) => partes.find((parte) => parte.type === tipo).value
  return valor('year') + '-' + valor('month') + '-' + valor('day')
}

export function inscripcionAbierta(torneo, hoy = Date.now()) {
  const cierre = Date.parse(torneo.cierreISO)
  return torneo.estado === 'Abierto' && Number.isFinite(cierre) && new Date(hoy).getTime() <= cierre
}

export function claseEstado(estado = '') {
  return 'estado-' + estado.toLowerCase().replaceAll(' ', '-')
}

export function cuposDisponibles(torneo) {
  return Math.max(0, Number(torneo.cupoMax) - torneo.inscritos.length)
}

export function fechasValidas({ fechaInicio, fechaFin }) {
  return !fechaInicio || !fechaFin || fechaInicio <= fechaFin
}

export function validarFiltros(filtros) {
  return fechasValidas(filtros) ? {} : { fechaInicio: 'La fecha inicial no puede ser posterior a la final.' }
}

export function filtrarTorneos(torneos, filtros = {}) {
  if (!fechasValidas(filtros)) return []
  const texto = (filtros.busqueda ?? '').trim().toLocaleLowerCase('es')
  return torneos.filter((torneo) =>
    torneo.nombre.toLocaleLowerCase('es').includes(texto)
    && (!filtros.juego || torneo.juegoId === filtros.juego)
    && (!filtros.estado || torneo.estado === filtros.estado)
    && (!filtros.fechaInicio || fechaSantiago(torneo.cierreISO) >= filtros.fechaInicio)
    && (!filtros.fechaFin || fechaSantiago(torneo.cierreISO) <= filtros.fechaFin))
}

export function validarTorneo(datos, anterior = null, hoy = new Date()) {
  const errores = {}
  if (!datos.nombre?.trim()) errores.nombre = 'El nombre es obligatorio.'
  if (!datos.juegoId) errores.juegoId = 'Selecciona un juego.'
  if (!Number.isInteger(Number(datos.cupoMax)) || Number(datos.cupoMax) <= 0) errores.cupoMax = 'El cupo debe ser un entero positivo.'
  if (Number(datos.cupoMax) < (anterior?.inscritos.length ?? 0)) errores.cupoMax = 'No puedes reducir el cupo bajo las inscripciones existentes.'
  const cierre = Date.parse(datos.cierreISO)
  const inicio = Date.parse(datos.fechaInicio)
  if (!Number.isFinite(cierre)) errores.cierreISO = 'Ingresa un cierre válido.'
  else if ((!anterior || datos.cierreISO !== anterior.cierreISO) && cierre < new Date(hoy).getTime()) errores.cierreISO = 'El cierre debe estar en el futuro.'
  if (!Number.isFinite(inicio) || inicio <= cierre) errores.fechaInicio = 'El inicio debe ser posterior al cierre.'
  if (!estadosTorneo.includes(datos.estado)) errores.estado = 'Selecciona un estado válido.'
  if (anterior && anterior.estado !== 'Abierto') {
    for (const campo of ['juegoId', 'cupoMax', 'cierreISO', 'fechaInicio']) {
      if (String(datos[campo]) !== String(anterior[campo])) errores[campo] = 'Esta regla queda bloqueada al comenzar el torneo.'
    }
    if (datos.estado === 'Abierto' || (anterior.estado === 'Finalizado' && datos.estado !== 'Finalizado')) errores.estado = 'No se puede retroceder el estado del torneo.'
  }
  return errores
}

export function formatearFecha(fecha) {
  return new Date(fecha).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Santiago' })
}
