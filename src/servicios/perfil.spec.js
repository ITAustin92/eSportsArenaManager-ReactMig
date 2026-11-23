import { api } from './api'
import { cargarPerfil } from './perfil'

describe('perfil: estadísticas calculadas desde el backend', () => {
	let respuestas
	beforeEach(() => {
		respuestas = {
			'/api/v1/users/2': { usuarioId: 2, nickname: 'jugador' },
			'/api/v1/teams': [
				{ equipoId: 1, miembros: [{ usuarioId: 2 }] },
				{ equipoId: 99, miembros: [{ usuarioId: 5 }] },
			],
			'/api/v1/tournaments': [{ tournamentId: 7 }, { tournamentId: 9 }],
			'/api/v1/matches': [
				{
					matchId: 1,
					tournamentId: 7,
					homeTeamId: 1,
					awayTeamId: 8,
					status: 'FINISHED',
					homeScore: 2,
					awayScore: 1,
				},
				{
					matchId: 2,
					tournamentId: 7,
					homeTeamId: 8,
					awayTeamId: 1,
					status: 'FINISHED',
					homeScore: 3,
					awayScore: 0,
				},
				{
					matchId: 3,
					tournamentId: 9,
					homeTeamId: 99,
					awayTeamId: 8,
					status: 'FINISHED',
					homeScore: 5,
					awayScore: 0,
				},
			],
			'/api/v1/sanctions/user/2': [],
		}
		spyOn(api, 'get').and.callFake((ruta) => {
			const valor = respuestas[ruta]
			return valor instanceof Error ? Promise.reject(valor) : Promise.resolve(valor)
		})
	})
	it('cuenta solo las partidas de los equipos del jugador', async () => {
		const perfil = await cargarPerfil(2)
		expect(perfil.victorias).toBe(1)
		expect(perfil.derrotas).toBe(1)
		expect(perfil.equipos.map((e) => e.equipoId)).toEqual([1])
		expect(perfil.historial).toEqual([{ tournamentId: 7 }])
	})
	it('incluye resultados individuales sin confundir IDs de jugadores y equipos', async () => {
		respuestas['/api/v1/matches'] = [
			{
				tournamentId: 7,
				homeUserId: 2,
				awayUserId: 8,
				status: 'FINISHED',
				homeScore: 3,
				awayScore: 1,
			},
			{
				tournamentId: 7,
				homeUserId: 9,
				awayUserId: 2,
				status: 'FINISHED',
				homeScore: 2,
				awayScore: 0,
			},
			{
				tournamentId: 9,
				homeUserId: 1,
				awayUserId: 8,
				status: 'FINISHED',
				homeScore: 4,
				awayScore: 0,
			},
		]
		const perfil = await cargarPerfil(2)
		expect(perfil.victorias).toBe(1)
		expect(perfil.derrotas).toBe(1)
		expect(perfil.historial).toEqual([{ tournamentId: 7 }])
	})
	it('no cuenta partidas pendientes ni marcadores incompletos', async () => {
		respuestas['/api/v1/matches'][0].status = 'SCHEDULED'
		respuestas['/api/v1/matches'][1].awayScore = null
		const perfil = await cargarPerfil(2)
		expect(perfil.victorias).toBe(0)
		expect(perfil.derrotas).toBe(0)
	})
	it('no presenta estadísticas cero cuando falla su servicio', async () => {
		respuestas['/api/v1/matches'] = new Error('No disponible')
		const perfil = await cargarPerfil(2)
		expect(perfil.victorias).toBeUndefined()
		expect(perfil.historial).toBeNull()
		expect(perfil.perfil.nickname).toBe('jugador')
	})
	it('distingue sanciones no disponibles de una lista vacía', async () => {
		respuestas['/api/v1/sanctions/user/2'] = new Error('No disponible')
		expect((await cargarPerfil(2)).sanciones).toBeNull()
	})
})
