import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from './AuthContext'
import RutaProtegida from './RutaProtegida'
import { prepararDOM } from '../../pruebas/dom'

describe('RutaProtegida', () => {
	let dom
	beforeEach(() => {
		dom = prepararDOM()
	})
	afterEach(() => dom.limpiar())
	;[
		['visitante', 'Login de prueba'],
		['JUGADOR', '403'],
		['ORGANIZADOR', '403'],
		['ADMIN', 'Panel permitido'],
	].forEach(([rol, esperado]) => {
		it('resuelve el acceso directo de ' + rol + ' a /admin', () => {
			dom.renderizar(
				<AuthContext.Provider value={{ rol }}>
					<MemoryRouter initialEntries={['/admin']}>
						<Routes>
							<Route
								path="/admin"
								element={<RutaProtegida roles={['ADMIN']}>Panel permitido</RutaProtegida>}
							/>
							<Route path="/login" element={<p>Login de prueba</p>} />
						</Routes>
					</MemoryRouter>
				</AuthContext.Provider>,
			)
			expect(dom.contenedor.textContent).toContain(esperado)
		})
	})
})
