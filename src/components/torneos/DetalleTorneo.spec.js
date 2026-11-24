import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../auth/AuthContext'
import { ContenidoDetalle } from './DetalleTorneo'
import { prepararDOM } from '../../pruebas/dom'

describe('Detalle público: información parcial', () => {
	let dom, detalle
	beforeEach(() => {
		dom = prepararDOM()
		detalle = {
			torneo: {
				tournamentId: 1,
				name: 'Copa',
				state: 'UPCOMING',
				startDate: '2099-12-31',
				endDate: '2100-01-01',
				maxParticipants: 8,
			},
			juego: { nombre: 'Juego', modalidad: '1v1', jugadoresPorEquipo: 1 },
			inscripciones: [],
			ranking: [],
			partidas: [],
			premios: [],
			equipos: [],
			jugadores: [],
			fallos: [],
		}
	})
	afterEach(() => dom.limpiar())
	function montar() {
		dom.renderizar(
			<MemoryRouter>
				<AuthContext.Provider value={{ rol: 'JUGADOR' }}>
					<ContenidoDetalle detalle={detalle} />
				</AuthContext.Provider>
			</MemoryRouter>,
		)
	}
	it('ofrece inscripción individual cuando el juego es 1v1', () => {
		montar()
		expect(dom.contenedor.querySelector('a[href="/inscripcion?torneo=1"]').textContent).toBe(
			'Inscribirme',
		)
	})
	it('no anuncia cupos libres si el servicio de inscripciones falla', () => {
		detalle.fallos = ['inscripciones']
		montar()
		expect(dom.contenedor.textContent).toContain('Información no disponible')
		expect(dom.contenedor.querySelector('a[href^="/inscripcion"]')).toBeNull()
		expect(dom.contenedor.textContent).not.toContain('Aún no hay participantes inscritos')
	})
	it('distingue premios, posiciones y partidas no disponibles de datos vacíos', () => {
		detalle.fallos = ['premios', 'ranking', 'partidas']
		montar()
		expect(dom.contenedor.textContent).toContain('No pudimos consultar los premios')
		expect(dom.contenedor.textContent).toContain('No pudimos consultar la clasificación')
		expect(dom.contenedor.textContent).toContain('No pudimos consultar las partidas')
	})
	it('no ofrece inscripción en un torneo lleno', () => {
		detalle.torneo.maxParticipants = 1
		detalle.inscripciones = [{ registrationId: 1, userId: 2, status: 'CONFIRMED' }]
		montar()
		expect(dom.contenedor.textContent).toContain('No quedan cupos disponibles')
		expect(dom.contenedor.querySelector('a[href^="/inscripcion"]')).toBeNull()
	})
})
