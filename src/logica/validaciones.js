// Validaciones de formularios en el navegador: dan respuesta inmediata, pero el backend vuelve a
// validar todo (@Valid + reglas de negocio). Cada función devuelve { campo: 'mensaje' }.
const correoValido = (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((valor ?? '').trim())

export function validarLogin({ username, password }) {
	const errores = {}
	if (!username?.trim()) {
		errores.username = 'Ingresa tu usuario.'
	}
	if (!password) {
		errores.password = 'Ingresa tu contraseña.'
	}
	return errores
}

export function validarRegistro(datos) {
	const errores = {}
	const usuario = datos.username?.trim() ?? ''
	if (!/^[a-zA-Z0-9_.-]{4,30}$/.test(usuario)) {
		errores.username = 'Entre 4 y 30 caracteres: letras, números, punto, guion o guion bajo.'
	}
	if (!datos.nombre?.trim()) {
		errores.nombre = 'El nombre es obligatorio.'
	}
	if (!correoValido(datos.correo)) {
		errores.correo = 'Ingresa un correo válido.'
	}
	if ((datos.password ?? '').length < 6) {
		errores.password = 'La contraseña debe tener al menos 6 caracteres.'
	}
	if (datos.confirmacion !== datos.password) {
		errores.confirmacion = 'Las contraseñas no coinciden.'
	}
	return errores
}

export function validarCuenta(datos) {
	const errores = validarRegistro({ ...datos, confirmacion: datos.password })
	if (!['ROLE_ADMIN', 'ROLE_ORGANIZADOR', 'ROLE_JUGADOR'].includes(datos.rol)) {
		errores.rol = 'Selecciona un rol.'
	}
	return errores
}

export function validarJuego(datos) {
	const errores = {}
	if (!datos.nombre?.trim()) {
		errores.nombre = 'El nombre es obligatorio.'
	}
	if (!datos.genero?.trim()) {
		errores.genero = 'El género es obligatorio.'
	}
	if (!/^\d+v\d+$/.test(datos.modalidad?.trim() ?? '')) {
		errores.modalidad = 'Usa el formato 5v5, 3v3 o 1v1.'
	}
	const tamano = Number(datos.jugadoresPorEquipo)
	if (!Number.isInteger(tamano) || tamano <= 0) {
		errores.jugadoresPorEquipo = 'Debe ser un entero positivo.'
	}
	if (!['ACTIVO', 'INACTIVO'].includes(datos.estado)) {
		errores.estado = 'Selecciona un estado.'
	}
	return errores
}

export function validarTorneo(datos, { esNuevo = true, hoy = '' } = {}) {
	const errores = {}
	if (!datos.name?.trim()) {
		errores.name = 'El nombre es obligatorio.'
	}
	if (!datos.gameId) {
		errores.gameId = 'Selecciona un juego.'
	}
	if (!datos.organizerId || Number(datos.organizerId) <= 0) {
		errores.organizerId = 'Indica el id del organizador.'
	}
	if (!datos.startDate) {
		errores.startDate = 'Indica la fecha de inicio.'
	} else if (esNuevo && hoy && datos.startDate < hoy) {
		errores.startDate = 'Un torneo nuevo no puede comenzar en el pasado.'
	}
	if (!datos.endDate) {
		errores.endDate = 'Indica la fecha de término.'
	} else if (datos.startDate && datos.endDate < datos.startDate) {
		errores.endDate = 'El término no puede ser anterior al inicio.'
	}
	if (!datos.state) {
		errores.state = 'Selecciona un estado.'
	}
	if (
		datos.maxParticipants != null &&
		(!Number.isInteger(Number(datos.maxParticipants)) || Number(datos.maxParticipants) < 2)
	) {
		errores.maxParticipants = 'Los cupos deben ser un entero mayor o igual a 2.'
	}
	if (datos.registrationDeadline && !Number.isFinite(Date.parse(datos.registrationDeadline))) {
		errores.registrationDeadline = 'Selecciona una fecha y hora válidas.'
	}

	return errores
}

export function validarEquipo(datos) {
	const errores = {}
	const nombre = datos.nombre?.trim() ?? ''
	if (nombre.length < 3 || nombre.length > 40) {
		errores.nombre = 'El nombre debe tener entre 3 y 40 caracteres.'
	}
	if (!datos.juegoPrincipalId) {
		errores.juegoPrincipalId = 'Selecciona el juego principal.'
	}
	const ids = (datos.miembros ?? []).map((m) => m.usuarioId)
	if (new Set(ids).size !== ids.length) {
		errores.miembros = 'Hay integrantes repetidos.'
	}
	if ((datos.miembros ?? []).some((m) => !m.rolDentroEquipo?.trim())) {
		errores.miembros = 'Cada integrante necesita un rol dentro del equipo.'
	}
	return errores
}

export const hayErrores = (errores) => Object.keys(errores).length > 0
