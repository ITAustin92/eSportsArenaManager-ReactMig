import Boton from './Boton'
import MensajeError from './MensajeError'
import { prepararDOM, clicEn } from '../../pruebas/dom'
describe('componentes compartidos', () => {
	let dom
	beforeEach(() => {
		dom = prepararDOM()
	})
	afterEach(() => dom.limpiar())
	it('el botón recibe etiqueta y avisa mediante espía', () => {
		const onClick = jasmine.createSpy('onClick')
		dom.renderizar(<Boton onClick={onClick}>Guardar</Boton>)
		clicEn(dom.contenedor.querySelector('button'))
		expect(onClick).toHaveBeenCalledTimes(1)
		expect(dom.contenedor.textContent).toBe('Guardar')
	})
	it('MensajeError solo aparece si existe un error', () => {
		dom.renderizar(<MensajeError />)
		expect(dom.contenedor.textContent).toBe('')
		dom.renderizar(<MensajeError>Error de prueba</MensajeError>)
		expect(dom.contenedor.querySelector('[role="alert"]').textContent).toBe('Error de prueba')
	})
})
