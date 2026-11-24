import { ESTADOS_TORNEO } from './estados.js'

const zona = 'America/Santiago'

// '2027-02-01' -> '1 feb 2027'. Las fechas LocalDate del backend no tienen hora: se leen
// como mediodía para que la zona horaria no las corra un día.
export function formatearFecha(fecha) {
	if (!fecha) {
		return '—'
	}
	const valor = /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? fecha + 'T12:00:00' : fecha
	const fechaJs = new Date(valor)
	if (Number.isNaN(fechaJs.getTime())) {
		return String(fecha)
	}
	return fechaJs.toLocaleDateString('es-CL', { dateStyle: 'medium', timeZone: zona })
}

export function formatearFechaHora(fecha) {
	if (!fecha) {
		return '—'
	}
	const fechaJs = new Date(fecha)
	if (Number.isNaN(fechaJs.getTime())) {
		return String(fecha)
	}
	return fechaJs.toLocaleString('es-CL', {
		dateStyle: 'medium',
		timeStyle: 'short',
		timeZone: zona,
	})
}

export function hoyISO(ahora = new Date()) {
	const partes = new Intl.DateTimeFormat('en-CA', {
		timeZone: zona,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).format(ahora)
	return partes
}

// Un torneo admite inscripciones solo en estado UPCOMING (regla del registration-service).
export function cierreInscripcion(torneo) {
	return (
		torneo?.registrationDeadline ??
		(torneo?.startDate ? torneo.startDate + 'T00:00:00-03:00' : null)
	)
}

export const admiteInscripciones = (torneo) =>
	torneo?.state === 'UPCOMING' && Date.parse(cierreInscripcion(torneo)) > Date.now()

export const inscripcionVigente = (inscripcion) =>
	!['CANCELLED', 'REJECTED'].includes(inscripcion.status)

export function imagenJuego(juego) {
	if (juego?.imagen?.startsWith('/img/')) {
		return juego.imagen
	}
	const nombre = juego?.nombre?.toLowerCase() ?? ''
	if (nombre.includes('valorant')) {
		return '/img/valorant.jpg'
	}
	if (nombre.includes('league')) {
		return '/img/lol.png'
	}
	if (nombre.includes('rocket')) {
		return '/img/rocket.png'
	}
	if (nombre.includes('street')) {
		return '/img/sf6.jpg'
	}
	return '/img/hero/equipo-en-competencia.webp'
}

export function filtrarTorneos(torneos, filtros = {}) {
	const texto = (filtros.busqueda ?? '').trim().toLocaleLowerCase('es')
	return torneos
		.filter(
			(t) =>
				t.name.toLocaleLowerCase('es').includes(texto) &&
				(!filtros.juego || String(t.gameId) === String(filtros.juego)) &&
				(!filtros.estado || t.state === filtros.estado) &&
				(!filtros.fechaInicio || cierreInscripcion(t)?.slice(0, 10) >= filtros.fechaInicio) &&
				(!filtros.fechaFin || cierreInscripcion(t)?.slice(0, 10) <= filtros.fechaFin),
		)
		.sort((a, b) => ordenEstado(a) - ordenEstado(b) || a.startDate.localeCompare(b.startDate))
}

const ORDEN = { UPCOMING: 0, IN_PROGRESS: 1, FINISHED: 2, CANCELLED: 3 }
const ordenEstado = (t) => ORDEN[t.state] ?? 9

export const opcionesEstadoTorneo = Object.entries(ESTADOS_TORNEO).map(([valor, texto]) => ({
	valor,
	etiqueta: texto,
}))

// Ranking: puntos, luego victorias, luego menos derrotas.
export function ordenarRanking(filas = []) {
	return [...filas].sort(
		(a, b) =>
			b.points - a.points ||
			b.wins - a.wins ||
			a.losses - b.losses ||
			(a.userId ?? a.teamId) - (b.userId ?? b.teamId),
	)
}

export function nombreEquipo(equipos, id) {
	return equipos.find((e) => e.equipoId === id)?.nombre ?? 'Equipo #' + id
}
