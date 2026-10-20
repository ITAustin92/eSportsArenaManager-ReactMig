import { act } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import BarraCupos from './BarraCupos'
import DetalleTorneo from './DetalleTorneo'
import { fixture } from '../../pruebas/fixtures'
import { prepararDOM, clicEn, escribir } from '../../pruebas/dom'

describe('cupos accesibles y navegación de rondas', () => {
	let dom
	beforeEach(() => {
		dom = prepararDOM()
	})
	afterEach(() => dom.limpiar())
	const montarDetalle = (datos = fixture().datos) =>
		dom.renderizar(
			<MemoryRouter initialEntries={['/torneos/copa-latam-valorant']}>
				<Routes>
					<Route path="/torneos/:id" element={<DetalleTorneo datos={datos} />} />
				</Routes>
			</MemoryRouter>,
		)

	it('actualiza los cupos anunciados cuando cambia la ocupación', () => {
		dom.renderizar(<BarraCupos inscritos={3} maximo={8} />)
		const barra = dom.contenedor.querySelector('[role="progressbar"]')
		expect(barra.getAttribute('aria-valuenow')).toBe('37.5')
		expect(barra.getAttribute('aria-valuetext')).toBe('3 de 8 cupos ocupados')
		dom.renderizar(<BarraCupos inscritos={8} maximo={8} />)
		expect(barra.getAttribute('aria-valuenow')).toBe('100')
		expect(barra.getAttribute('aria-valuetext')).toBe('8 de 8 cupos ocupados')
	})
	;[
		{ inscritos: 0, maximo: 0, esperado: '0' },
		{ inscritos: -1, maximo: 8, esperado: '0' },
		{ inscritos: 9, maximo: 8, esperado: '100' },
	].forEach(({ inscritos, maximo, esperado }) =>
		it('mantiene la barra entre 0 y 100 con ' + inscritos + '/' + maximo, () => {
			dom.renderizar(<BarraCupos inscritos={inscritos} maximo={maximo} />)
			expect(
				dom.contenedor.querySelector('[role="progressbar"]').getAttribute('aria-valuenow'),
			).toBe(esperado)
		}),
	)
	it('sincroniza las pestañas, el selector móvil y las partidas', () => {
		montarDetalle()
		const final = [...dom.contenedor.querySelectorAll('[role="tab"]')].find(
			(tab) => tab.textContent === 'Final',
		)
		clicEn(final)
		expect(final.getAttribute('aria-selected')).toBe('true')
		expect(dom.contenedor.querySelector('#ronda').value).toBe('Final')
		expect(dom.contenedor.querySelector('[role="tabpanel"]').textContent).toContain(
			'Participante por definir',
		)
		escribir(dom.contenedor.querySelector('#ronda'), 'Semifinal')
		expect(final.getAttribute('aria-selected')).toBe('false')
		expect(dom.contenedor.querySelector('[aria-selected="true"]').textContent).toBe('Semifinal')
	})
	it('mueve selección y foco con flechas, Home y End, sin capturar Tab', () => {
		montarDetalle()
		const tabs = [...dom.contenedor.querySelectorAll('[role="tab"]')]
		const tecla = (tab, key) =>
			act(() =>
				tab.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })),
			)
		tecla(tabs[0], 'ArrowLeft')
		expect(document.activeElement).toBe(tabs.at(-1))
		tecla(tabs.at(-1), 'ArrowRight')
		expect(document.activeElement).toBe(tabs[0])
		tecla(tabs[0], 'End')
		expect(document.activeElement).toBe(tabs.at(-1))
		tecla(tabs.at(-1), 'Home')
		expect(document.activeElement).toBe(tabs[0])
		tecla(tabs[0], 'Tab')
		expect(tabs[0].getAttribute('aria-selected')).toBe('true')
		expect(tabs.filter((tab) => tab.tabIndex === 0).length).toBe(1)
	})
	it('explica la ausencia de partidas sin crear pestañas vacías', () => {
		const { datos } = fixture()
		datos.torneos.find((torneo) => torneo.id === 'copa-latam-valorant').partidas = []
		montarDetalle(datos)
		expect(dom.contenedor.querySelector('[role="tablist"]')).toBeNull()
		expect(dom.contenedor.querySelector('[role="tabpanel"]').textContent).toContain(
			'No hay partidas programadas',
		)
	})
})
