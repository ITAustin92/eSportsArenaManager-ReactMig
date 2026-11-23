import { menuPorRol, puedeAcceder, rutaDespuesDeIngresar } from './acceso'

describe('restricciones de acceso por rol', () => {
	it('el visitante solo ve el catálogo, login y registro', () => {
		expect(puedeAcceder('visitante', '/torneos/3')).toBeTrue()
		expect(puedeAcceder('visitante', '/equipos')).toBeFalse()
		expect(puedeAcceder('visitante', '/admin')).toBeFalse()
	})
	it('el jugador (cliente) accede a la tienda y a su actividad, no a la gestión', () => {
		expect(puedeAcceder('JUGADOR', '/inscripcion?torneo=2')).toBeTrue()
		expect(puedeAcceder('JUGADOR', '/gestion/inscripciones')).toBeFalse()
		expect(puedeAcceder('JUGADOR', '/admin')).toBeFalse()
	})
	it('el organizador (vendedor) solo ve torneos e inscripciones', () => {
		expect(puedeAcceder('ORGANIZADOR', '/gestion/torneos/1')).toBeTrue()
		expect(puedeAcceder('ORGANIZADOR', '/gestion/inscripciones/4')).toBeTrue()
		expect(puedeAcceder('ORGANIZADOR', '/admin')).toBeFalse()
		expect(puedeAcceder('ORGANIZADOR', '/equipos')).toBeFalse()
		expect(menuPorRol('ORGANIZADOR').map((m) => m.ruta)).toEqual([
			'/gestion/torneos',
			'/gestion/inscripciones',
		])
	})
	it('el admin tiene acceso total a la gestión', () => {
		expect(puedeAcceder('ADMIN', '/admin')).toBeTrue()
		expect(puedeAcceder('ADMIN', '/gestion/inscripciones/9')).toBeTrue()
	})
	it('después del login vuelve a la ruta pedida solo si el rol puede abrirla', () => {
		expect(rutaDespuesDeIngresar('JUGADOR', '/equipos')).toBe('/equipos')
		expect(rutaDespuesDeIngresar('ORGANIZADOR', '/admin')).toBe('/gestion/torneos')
		expect(rutaDespuesDeIngresar('ADMIN', '/login')).toBe('/admin')
	})
})
