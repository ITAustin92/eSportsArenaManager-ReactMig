const rutasPublicas = ['/', '/torneos']
const rutasJugador = ['/inscripcion', '/equipos', '/perfil']
const rutasAdmin = ['/admin', '/admin/equipos']

export function puedeAcceder(rol = 'visitante', ruta = '/') {
	const camino = ruta.split('?')[0].replace(/\/$/, '') || '/'
	if (rutasPublicas.includes(camino) || /^\/torneos\/[^/]+$/.test(camino)) {
		return true
	}
	if (camino === '/login') {
		return rol === 'visitante'
	}
	if (rol === 'jugador') {
		return rutasJugador.includes(camino)
	}
	if (rol === 'admin') {
		return rutasAdmin.includes(camino)
	}
	return false
}

export function menuPorRol(rol = 'visitante') {
	const menu = [
		{ ruta: '/', etiqueta: 'Inicio' },
		{ ruta: '/torneos', etiqueta: 'Torneos' },
	]
	if (rol === 'jugador') {
		return [
			...menu,
			{ ruta: '/inscripcion', etiqueta: 'Inscripción' },
			{ ruta: '/equipos', etiqueta: 'Equipos' },
			{ ruta: '/perfil', etiqueta: 'Perfil' },
		]
	}
	if (rol === 'admin') {
		return [
			...menu,
			{ ruta: '/admin', etiqueta: 'Administración' },
			{ ruta: '/admin/equipos', etiqueta: 'Equipos registrados' },
		]
	}
	return [...menu, { ruta: '/login', etiqueta: 'Iniciar sesión' }]
}
