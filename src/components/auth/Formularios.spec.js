import { act } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from './AuthContext'
import Login from './Login'
import Registro from './Registro'
import { prepararDOM, escribir, enviar } from '../../pruebas/dom'

describe('Formularios de autenticación', () => {
	let dom, iniciarSesion, registrarse
	beforeEach(() => {
		dom = prepararDOM()
		iniciarSesion = jasmine.createSpy().and.resolveTo()
		registrarse = jasmine.createSpy().and.resolveTo()
	})
	afterEach(() => dom.limpiar())
	function montar(componente) {
		dom.renderizar(
			<MemoryRouter>
				<AuthContext.Provider
					value={{
						sesion: null,
						rol: 'visitante',
						iniciarSesion,
						registrarse,
					}}
				>
					{componente}
				</AuthContext.Provider>
			</MemoryRouter>,
		)
	}
	const campo = (nombre, valor) =>
		escribir(dom.contenedor.querySelector(`[name="${nombre}"]`), valor)
	const enviarFormulario = () => act(async () => enviar(dom.contenedor.querySelector('form')))

	it('no consulta el backend con un login vacío', async () => {
		montar(<Login />)
		await enviarFormulario()
		expect(iniciarSesion).not.toHaveBeenCalled()
		expect(dom.contenedor.querySelectorAll('[aria-invalid="true"]').length).toBe(2)
	})
	it('muestra el error del servidor y permite volver a intentar', async () => {
		iniciarSesion.and.rejectWith(new Error('Credenciales incorrectas'))
		montar(<Login />)
		campo('username', 'jugador1')
		campo('password', 'jugador123')
		await enviarFormulario()
		expect(dom.contenedor.textContent).toContain('Credenciales incorrectas')
		expect(dom.contenedor.querySelector('button[type="submit"]').disabled).toBeFalse()
	})
	it('bloquea el botón mientras el login está pendiente', async () => {
		let resolver
		iniciarSesion.and.returnValue(
			new Promise((resolve) => {
				resolver = resolve
			}),
		)
		montar(<Login />)
		campo('username', 'jugador1')
		campo('password', 'jugador123')
		await enviarFormulario()
		expect(dom.contenedor.querySelector('button[type="submit"]').disabled).toBeTrue()
		await act(async () => resolver())
	})
	it('rechaza un registro con contraseñas diferentes', async () => {
		montar(<Registro />)
		campo('username', 'nuevo')
		campo('nombre', 'Nuevo Jugador')
		campo('correo', 'nuevo@example.com')
		campo('password', 'clave123')
		campo('confirmacion', 'otra1234')
		await enviarFormulario()
		expect(registrarse).not.toHaveBeenCalled()
		expect(dom.contenedor.querySelector('[name="confirmacion"]').getAttribute('aria-invalid')).toBe(
			'true',
		)
	})
	it('muestra los errores de campos devueltos por el backend', async () => {
		registrarse.and.rejectWith(
			Object.assign(new Error('Revisa los datos'), {
				campos: { username: 'El usuario ya existe' },
			}),
		)
		montar(<Registro />)
		campo('username', 'nuevo')
		campo('nombre', 'Nuevo Jugador')
		campo('correo', 'nuevo@example.com')
		campo('password', 'clave123')
		campo('confirmacion', 'clave123')
		await enviarFormulario()
		expect(registrarse).toHaveBeenCalledTimes(1)
		expect(dom.contenedor.textContent).toContain('El usuario ya existe')
		expect(dom.contenedor.querySelector('button[type="submit"]').disabled).toBeFalse()
	})
})
