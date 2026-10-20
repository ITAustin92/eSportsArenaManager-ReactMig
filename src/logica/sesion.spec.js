import { autenticar, recuperarSesion, validarLogin } from './sesion'
import { usuariosPrueba } from '../datos/datos'
describe('sesión ficticia', () => {
	it('valida formato y mínimo de clave', () => {
		expect(Object.keys(validarLogin({ correo: '', clave: '12345' }))).toEqual(['correo', 'clave'])
		expect(validarLogin({ correo: 'a@b.example', clave: '123456' })).toEqual({})
	})
	it('autentica sin guardar la clave y normaliza correo', () => {
		const sesion = autenticar(
			{ correo: ' ADMIN@arena.example ', clave: 'Admin123!' },
			usuariosPrueba,
		)
		expect(sesion.rol).toBe('admin')
		expect(sesion.clave).toBeUndefined()
		expect(recuperarSesion(JSON.stringify(sesion), usuariosPrueba)).toEqual(sesion)
	})
	it('rechaza credenciales inválidas y sesión alterada o corrupta', () => {
		expect(() =>
			autenticar({ correo: 'nadie@arena.example', clave: '123456' }, usuariosPrueba),
		).toThrowError('Correo o clave incorrectos.')
		expect(recuperarSesion('{', usuariosPrueba)).toBeNull()
		expect(recuperarSesion('{"id":"u-felipe","rol":"admin"}', usuariosPrueba)).toBeNull()
		expect(recuperarSesion(null, usuariosPrueba)).toBeNull()
	})
})
