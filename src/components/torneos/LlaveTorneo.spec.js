import LlaveTorneo from './LlaveTorneo'
import { prepararDOM } from '../../pruebas/dom'
describe('LlaveTorneo', () => {
	let dom
	beforeEach(() => {
		dom = prepararDOM()
	})
	afterEach(() => dom.limpiar())
	it('muestra Participante por definir si falta rival', () => {
		dom.renderizar(<LlaveTorneo local="Arena" visitante={null} />)
		expect(dom.contenedor.textContent).toContain('Participante por definir')
		expect(dom.contenedor.textContent).toContain('Arena')
	})
})
