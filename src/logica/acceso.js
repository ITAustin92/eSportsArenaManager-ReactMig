// Reglas de acceso del FRONTEND por rol. Son la primera barrera (qué se muestra y qué rutas se
// pueden abrir). La barrera real está en el backend: el gateway y cada microservicio vuelven a
// validar el JWT y el rol, así que forzar una URL o editar localStorage no da más permisos.
//
// Equivalencia con el enunciado:
//   Administrador -> ADMIN        : acceso total.
//   Vendedor      -> ORGANIZADOR  : solo ve la lista y el detalle de torneos e inscripciones.
//   Cliente       -> JUGADOR      : solo la "tienda" (catálogo de torneos) y su propia actividad.

export const RUTAS = [
	{ ruta: '/', roles: ['visitante', 'JUGADOR'] },
	{ ruta: '/torneos', roles: ['visitante', 'JUGADOR'] },
	{ patron: /^\/torneos\/\d+$/, roles: ['visitante', 'JUGADOR'] },
	{ ruta: '/login', roles: ['visitante'] },
	{ ruta: '/registro', roles: ['visitante'] },
	{ ruta: '/inscripcion', roles: ['JUGADOR'] },
	{ ruta: '/equipos', roles: ['JUGADOR'] },
	{ ruta: '/perfil', roles: ['JUGADOR'] },
	{ ruta: '/gestion/torneos', roles: ['ORGANIZADOR', 'ADMIN'] },
	{ patron: /^\/gestion\/torneos\/\d+$/, roles: ['ORGANIZADOR', 'ADMIN'] },
	{ ruta: '/gestion/inscripciones', roles: ['ORGANIZADOR', 'ADMIN'] },
	{ patron: /^\/gestion\/inscripciones\/\d+$/, roles: ['ORGANIZADOR', 'ADMIN'] },
	{ ruta: '/admin', roles: ['ADMIN'] },
]

export const INICIO_POR_ROL = {
	visitante: '/',
	JUGADOR: '/torneos',
	ORGANIZADOR: '/gestion/torneos',
	ADMIN: '/admin',
}

export function normalizarRuta(ruta = '/') {
	return ruta.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/'
}

export function reglaDe(ruta) {
	const camino = normalizarRuta(ruta)
	return RUTAS.find((r) => (r.ruta ? r.ruta === camino : r.patron.test(camino))) ?? null
}

export function puedeAcceder(rol = 'visitante', ruta = '/') {
	const regla = reglaDe(ruta)
	return Boolean(regla && regla.roles.includes(rol ?? 'visitante'))
}

// Tras iniciar sesión: vuelve a la ruta que se quería abrir si el rol puede; si no, a su inicio.
export function rutaDespuesDeIngresar(rol, desde) {
	const inicio = INICIO_POR_ROL[rol] ?? '/'
	if (!desde || ['/login', '/registro'].includes(normalizarRuta(desde))) {
		return inicio
	}
	return puedeAcceder(rol, desde) ? desde : inicio
}

// Menú principal: cada rol ve SOLO lo que puede usar (lo demás ni siquiera aparece).
export function menuPorRol(rol = 'visitante') {
	if (rol === 'ADMIN') {
		return [
			{ ruta: '/admin', etiqueta: 'Panel admin' },
			{ ruta: '/gestion/torneos', etiqueta: 'Torneos' },
			{ ruta: '/gestion/inscripciones', etiqueta: 'Inscripciones' },
		]
	}
	if (rol === 'ORGANIZADOR') {
		return [
			{ ruta: '/gestion/torneos', etiqueta: 'Torneos' },
			{ ruta: '/gestion/inscripciones', etiqueta: 'Inscripciones' },
		]
	}
	const publico = [
		{ ruta: '/', etiqueta: 'Inicio' },
		{ ruta: '/torneos', etiqueta: 'Torneos' },
	]
	if (rol === 'JUGADOR') {
		return [
			...publico,
			{ ruta: '/inscripcion', etiqueta: 'Inscribirme' },
			{ ruta: '/equipos', etiqueta: 'Mis equipos' },
			{ ruta: '/perfil', etiqueta: 'Mi perfil' },
		]
	}
	return publico
}
