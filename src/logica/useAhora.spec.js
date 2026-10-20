import { act } from 'react'
import useAhora from './useAhora'
import { prepararDOM } from '../pruebas/dom'

function RelojDePrueba() {
	return <p>{useAhora()}</p>
}

describe('reloj de las vistas', () => {
	let dom
	beforeEach(() => {
		jasmine.clock().install()
		jasmine.clock().mockDate(new Date('2030-01-01T12:00:00Z'))
		dom = prepararDOM()
	})
	afterEach(() => {
		dom.limpiar()
		jasmine.clock().uninstall()
	})
	it('actualiza el instante cada segundo', () => {
		dom.renderizar(<RelojDePrueba />)
		const antes = Number(dom.contenedor.textContent)
		act(() => jasmine.clock().tick(1000))
		expect(Number(dom.contenedor.textContent)).toBe(antes + 1000)
	})
	;['focus', 'visibilitychange'].forEach((evento) =>
		it('recupera la hora real al recibir ' + evento, () => {
			dom.renderizar(<RelojDePrueba />)
			jasmine.clock().mockDate(new Date('2030-02-01T12:00:00Z'))
			act(() => (evento === 'focus' ? window : document).dispatchEvent(new Event(evento)))
			expect(Number(dom.contenedor.textContent)).toBe(Date.now())
		}),
	)
})

describe('limpieza del reloj de las vistas', () => {
	let dom
	beforeEach(() => {
		dom = prepararDOM()
	})
	afterEach(() => dom.limpiar())

	// Espiar clearInterval dentro del reloj simulado hace que Jasmine restaure
	// el temporizador falso después de clock().uninstall(), contaminando otro caso.
	it('retira el temporizador y los listeners al desmontar', () => {
		spyOn(window, 'removeEventListener').and.callThrough()
		spyOn(document, 'removeEventListener').and.callThrough()
		const cancelar = spyOn(globalThis, 'clearInterval').and.callThrough()
		dom.renderizar(<RelojDePrueba />)
		dom.renderizar(null)
		expect(cancelar).toHaveBeenCalled()
		expect(window.removeEventListener).toHaveBeenCalledWith('focus', jasmine.any(Function))
		expect(document.removeEventListener).toHaveBeenCalledWith(
			'visibilitychange',
			jasmine.any(Function),
		)
	})
})
