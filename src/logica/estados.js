// Traducción de los códigos del backend (inglés/mayúsculas) a etiquetas para la interfaz.
export const ESTADOS_TORNEO = {
	UPCOMING: 'Abierto',
	IN_PROGRESS: 'En curso',
	FINISHED: 'Finalizado',
	CANCELLED: 'Cancelado',
}
export const ESTADOS_INSCRIPCION = {
	PENDING: 'Pendiente',
	CONFIRMED: 'Confirmada',
	REJECTED: 'Rechazada',
	CANCELLED: 'Cancelada',
}
export const ESTADOS_PARTIDA = {
	SCHEDULED: 'Programada',
	IN_PROGRESS: 'En juego',
	FINISHED: 'Finalizada',
	CANCELLED: 'Cancelada',
}
export const ESTADOS_EQUIPO = { ACTIVO: 'Activo', INACTIVO: 'Inactivo', SANCIONADO: 'Sancionado' }
export const ESTADOS_JUEGO = { ACTIVO: 'Activo', INACTIVO: 'Inactivo' }
export const TIPOS_PREMIO = { MONEY: 'Dinero', TROPHY: 'Trofeo', MEDALS: 'Medallas' }
export const ESTADOS_PREMIO = { PENDING: 'Por entregar', DELIVERED: 'Entregado' }
export const NOMBRE_ROL = {
	ADMIN: 'Administrador',
	ORGANIZADOR: 'Organizador',
	JUGADOR: 'Jugador',
	visitante: 'Visitante',
}

export function etiqueta(mapa, codigo) {
	return mapa[codigo] ?? codigo ?? '—'
}

// Clase CSS del badge según la etiqueta: "En curso" -> "estado-en-curso".
export function claseEstado(texto = '') {
	return (
		'estado-' +
		String(texto).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-')
	)
}
