import { api } from './api.js'
import { cargarCatalogo, cargarDetalleTorneo } from './catalogo.js'

describe('catálogo: coordinación de microservicios', () => {
	let get
	beforeEach(() => {
		get = spyOn(api, 'get').and.callFake((ruta) =>
			Promise.resolve(ruta === '/api/v1/tournaments/7' ? { tournamentId: 7, gameId: 3 } : []),
		)
	})
	it('reúne el catálogo de torneos y juegos', async () => {
		expect(await cargarCatalogo()).toEqual({ torneos: [], juegos: [] })
		expect(get).toHaveBeenCalledWith('/api/v1/tournaments')
		expect(get).toHaveBeenCalledWith('/api/v1/games')
	})
	it('no confunde listas vacías con servicios caídos', async () => {
		const detalle = await cargarDetalleTorneo(7)
		expect(detalle.incompleto).toBeFalse()
		expect(detalle.fallos).toEqual([])
		expect(detalle.inscripciones).toEqual([])
	})
	it('conserva el torneo e identifica la parte que falló', async () => {
		get.and.callFake((ruta) =>
			ruta.includes('/registrations/')
				? Promise.reject(new Error('No disponible'))
				: Promise.resolve(ruta === '/api/v1/tournaments/7' ? { tournamentId: 7, gameId: 3 } : []),
		)
		const detalle = await cargarDetalleTorneo(7)
		expect(detalle.torneo.tournamentId).toBe(7)
		expect(detalle.fallos).toEqual(['inscripciones'])
		expect(detalle.incompleto).toBeTrue()
	})
	it('también avisa cuando falla el directorio de jugadores', async () => {
		get.and.callFake((ruta) =>
			ruta.endsWith('/users/public')
				? Promise.reject(new Error('No disponible'))
				: Promise.resolve(ruta === '/api/v1/tournaments/7' ? { tournamentId: 7, gameId: 3 } : []),
		)
		expect((await cargarDetalleTorneo(7)).fallos).toEqual(['jugadores'])
	})
	it('propaga el error cuando no se puede obtener el torneo principal', async () => {
		get.and.rejectWith(new Error('Torneo inexistente'))
		await expectAsync(cargarDetalleTorneo(7)).toBeRejectedWithError('Torneo inexistente')
		expect(get).toHaveBeenCalledTimes(1)
	})
})
