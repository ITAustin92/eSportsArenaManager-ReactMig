import {
	borrarSesion,
	claveSesion,
	guardarSesion,
	leerPayload,
	leerSesion,
	rolPrincipal,
} from './sesion'
import { almacenFalso, tokenDePrueba } from '../pruebas/jwt'

describe('gestión de sesión (localStorage + JWT)', () => {
	const ahora = Date.UTC(2026, 10, 19, 12, 0, 0)
	beforeEach(() => {
		jasmine.clock().install()
		jasmine.clock().mockDate(new Date(ahora))
	})
	afterEach(() => jasmine.clock().uninstall())
	const segundos = (ms) => Math.floor(ms / 1000)
	const token = (extra = {}) =>
		tokenDePrueba({
			sub: 'jugador1',
			nombre: 'María González',
			userId: 2,
			roles: ['ROLE_JUGADOR'],
			iat: segundos(ahora),
			exp: segundos(ahora) + 3600,
			...extra,
		})

	it('lee el payload del JWT, incluidos caracteres con tilde', () => {
		expect(leerPayload(token()).nombre).toBe('María González')
		expect(leerPayload('no-es-un-jwt')).toBeNull()
	})

	it('elige el rol de más privilegio', () => {
		expect(rolPrincipal(['ROLE_JUGADOR', 'ROLE_ADMIN'])).toBe('ADMIN')
		expect(rolPrincipal(['ROLE_ORGANIZADOR'])).toBe('ORGANIZADOR')
		expect(rolPrincipal([])).toBeNull()
	})

	it('guarda solo el token y lo recupera tras una "recarga"', () => {
		const almacen = almacenFalso()
		guardarSesion({ token: token(), password: 'nunca-se-guarda' }, almacen)
		expect(almacen.getItem(claveSesion)).not.toContain('nunca-se-guarda')
		const sesion = leerSesion(almacen, ahora + 1000)
		expect(sesion.usuario).toEqual({
			username: 'jugador1',
			nombre: 'María González',
			userId: 2,
			roles: ['ROLE_JUGADOR'],
			rol: 'JUGADOR',
		})
		expect(sesion.expira).toBe((segundos(ahora) + 3600) * 1000)
	})

	it('descarta y borra un token vencido', () => {
		const almacen = almacenFalso()
		almacen.setItem(claveSesion, JSON.stringify({ token: token({ exp: segundos(ahora) - 1 }) }))
		expect(leerSesion(almacen, ahora)).toBeNull()
		expect(almacen.getItem(claveSesion)).toBeNull()
	})

	it('descarta datos manipulados o sin rol válido', () => {
		const almacen = almacenFalso()
		almacen.setItem(claveSesion, '{"token": "x.y.z"}')
		expect(leerSesion(almacen, ahora)).toBeNull()
		almacen.setItem(claveSesion, JSON.stringify({ token: token({ roles: ['ROLE_HACKER'] }) }))
		expect(leerSesion(almacen, ahora)).toBeNull()
	})

	it('cerrar sesión elimina la clave', () => {
		const almacen = almacenFalso()
		guardarSesion({ token: token() }, almacen)
		borrarSesion(almacen)
		expect(almacen.getItem(claveSesion)).toBeNull()
	})
})
