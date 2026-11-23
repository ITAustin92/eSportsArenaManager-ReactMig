import { api } from './api.js'

// ---- Juegos (msvc-game-service) ----
export const listarJuegosActivos = () => api.get('/api/v1/games')
export async function listarTodosLosJuegos() {
	const [activos, inactivos] = await Promise.all([
		api.get('/api/v1/games'),
		api.get('/api/v1/games/estado/INACTIVO'),
	])
	return [...activos, ...inactivos].sort((a, b) => a.juegoId - b.juegoId)
}
export const crearJuego = (juego) => api.post('/api/v1/games', juego)
export const actualizarJuego = (id, juego) => api.put('/api/v1/games/' + id, juego)
export const eliminarJuego = (id) => api.delete('/api/v1/games/' + id)

// ---- Torneos (msvc-tournament-service) ----
export const listarTorneos = () => api.get('/api/v1/tournaments')
export const obtenerTorneo = (id) => api.get('/api/v1/tournaments/' + id)
export const crearTorneo = (torneo) => api.post('/api/v1/tournaments', torneo)
export const actualizarTorneo = (id, torneo) => api.put('/api/v1/tournaments/' + id, torneo)
export const cancelarTorneo = (id) => api.delete('/api/v1/tournaments/' + id)

// ---- Equipos (lectura pública) ----
export const listarEquipos = () => api.get('/api/v1/teams')

// Catálogo: torneos y juegos se piden EN PARALELO (Promise.all) para no esperar dos veces.
export async function cargarCatalogo() {
	const [torneos, juegos] = await Promise.all([listarTorneos(), listarJuegosActivos()])
	return { torneos, juegos }
}

// Si una parte opcional falla (por ejemplo el servicio de premios está apagado), el detalle se
// muestra igual con lo que sí llegó: Promise.allSettled en vez de Promise.all.
const valorO = (resultado, porDefecto) =>
	resultado.status === 'fulfilled' ? resultado.value : porDefecto

// Detalle de un torneo: 1 torneo + 7 consultas en paralelo a distintos microservicios.
export async function cargarDetalleTorneo(id) {
	const torneo = await obtenerTorneo(id)
	const [juego, inscripciones, ranking, partidas, premios, equipos, jugadores] =
		await Promise.allSettled([
			api.get('/api/v1/games/' + torneo.gameId),
			api.get('/api/v1/registrations/tournament/' + id),
			api.get('/api/v1/rankings/tournament/' + id),
			api.get('/api/v1/matches/tournament/' + id),
			api.get('/api/v1/prizes/tournament/' + id),
			listarEquipos(),
			api.get('/api/v1/users/public'),
		])
	const resultados = { juego, inscripciones, ranking, partidas, premios, equipos, jugadores }
	const fallos = Object.keys(resultados).filter((clave) => resultados[clave].status === 'rejected')
	return {
		torneo,
		juego: valorO(juego, null),
		inscripciones: valorO(inscripciones, []),
		ranking: valorO(ranking, []),
		partidas: valorO(partidas, []),
		premios: valorO(premios, []),
		equipos: valorO(equipos, []),
		jugadores: valorO(jugadores, []),
		fallos,
		incompleto: fallos.length > 0,
	}
}
