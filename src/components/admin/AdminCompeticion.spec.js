import { act } from 'react'
import AdminCompeticion from './AdminCompeticion'
import { api } from '../../servicios/api'
import { prepararDOM, escribir, enviar } from '../../pruebas/dom'

describe('administración de competición', () => {
	let dom, detalle, onCambio
	beforeEach(() => {
		dom = prepararDOM()
		onCambio = jasmine.createSpy('recargar torneo')
		detalle = {
			torneo: { tournamentId: 7, state: 'UPCOMING' },
			juego: { jugadoresPorEquipo: 1 },
			jugadores: [
				{ usuarioId: 2, nickname: 'uno' },
				{ usuarioId: 3, nickname: 'dos' },
			],
			equipos: [],
			partidas: [],
			inscripciones: [
				{ userId: 2, status: 'CONFIRMED' },
				{ userId: 3, status: 'PENDING' },
			],
		}
		spyOn(api, 'get').and.resolveTo([])
	})
	afterEach(() => dom.limpiar())
	async function montar() {
		await act(async () =>
			dom.renderizar(<AdminCompeticion detalle={detalle} onCambio={onCambio} />),
		)
	}
	it('rechaza programar una partida contra el mismo participante', async () => {
		const post = spyOn(api, 'post').and.resolveTo({})
		await montar()
		escribir(dom.contenedor.querySelector('[name="local"]'), '2')
		escribir(dom.contenedor.querySelector('[name="visita"]'), '2')
		escribir(dom.contenedor.querySelector('[name="fecha"]'), '2099-12-20T20:00')
		await act(async () => enviar(dom.contenedor.querySelector('form')))
		expect(post).not.toHaveBeenCalled()
		expect(dom.contenedor.textContent).toContain('dos participantes distintos')
	})
	it('envía IDs de jugadores para una partida individual', async () => {
		const post = spyOn(api, 'post').and.resolveTo({})
		await montar()
		escribir(dom.contenedor.querySelector('[name="local"]'), '2')
		escribir(dom.contenedor.querySelector('[name="visita"]'), '3')
		escribir(dom.contenedor.querySelector('[name="fecha"]'), '2099-12-20T20:00')
		await act(async () => enviar(dom.contenedor.querySelector('form')))
		expect(post).toHaveBeenCalledWith(
			'/api/v1/matches',
			jasmine.objectContaining({
				homeUserId: 2,
				awayUserId: 3,
				tournamentId: 7,
			}),
		)
		expect(post.calls.mostRecent().args[1].homeTeamId).toBeUndefined()
		expect(onCambio).toHaveBeenCalledTimes(1)
	})
	it('no envía resultados empatados', async () => {
		const post = spyOn(api, 'post').and.resolveTo({})
		detalle.partidas = [{ matchId: 10, homeUserId: 2, awayUserId: 3 }]
		await montar()
		const formulario = dom.contenedor.querySelector('[aria-label="Resultado partida 10"]')
		escribir(formulario.querySelector('[name="local"]'), '2')
		escribir(formulario.querySelector('[name="visita"]'), '2')
		await act(async () => enviar(formulario))
		expect(post).not.toHaveBeenCalled()
		expect(dom.contenedor.textContent).toContain('sin empate')
	})
})
