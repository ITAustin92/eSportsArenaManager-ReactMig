import { api } from './api.js'
import { listarTorneos } from './catalogo.js'
import { listarEquipos, obtenerUsuario } from './equipos.js'

export async function cargarPerfil(userId) {
	const [perfil, todosLosEquipos, torneos] = await Promise.all([
		obtenerUsuario(userId),
		listarEquipos(),
		listarTorneos(),
	])
	const equipos = todosLosEquipos.filter((e) => e.miembros.some((m) => m.usuarioId === userId))
	const [partidas, sanciones] = await Promise.allSettled([
		api.get('/api/v1/matches'),
		api.get('/api/v1/sanctions/user/' + userId),
	])
	const ids = new Set(equipos.map((e) => e.equipoId))
	const jugadas =
		partidas.status === 'fulfilled'
			? partidas.value.filter(
					(p) =>
						p.status === 'FINISHED' &&
						p.homeScore != null &&
						p.awayScore != null &&
						(ids.has(p.homeTeamId) ||
							ids.has(p.awayTeamId) ||
							p.homeUserId === userId ||
							p.awayUserId === userId),
				)
			: null
	const victorias = jugadas?.filter((p) =>
		p.homeScore > p.awayScore
			? ids.has(p.homeTeamId) || p.homeUserId === userId
			: p.awayScore > p.homeScore && (ids.has(p.awayTeamId) || p.awayUserId === userId),
	).length
	const derrotas = jugadas?.filter((p) =>
		p.homeScore < p.awayScore
			? ids.has(p.homeTeamId) || p.homeUserId === userId
			: p.awayScore < p.homeScore && (ids.has(p.awayTeamId) || p.awayUserId === userId),
	).length
	return {
		perfil,
		equipos,
		victorias,
		derrotas,
		historial:
			jugadas && torneos.filter((t) => jugadas.some((p) => p.tournamentId === t.tournamentId)),
		sanciones: sanciones.status === 'fulfilled' ? sanciones.value : null,
	}
}
