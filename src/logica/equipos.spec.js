import { agregarIntegrante, quitarIntegrante, equipoCompleto, validarEquipo } from './equipos'
import { fixture } from '../pruebas/fixtures'
describe('integrantes y equipoCompleto', () => {
	it('agrega al final sin mutar ni duplicar y quita por id', () => {
		const lista = [{ id: 'a' }]
		const siguiente = agregarIntegrante(lista, { id: 'b' })
		expect(siguiente).toEqual([{ id: 'a' }, { id: 'b' }])
		expect(lista).toEqual([{ id: 'a' }])
		expect(agregarIntegrante(lista, { id: 'a' })).toEqual(lista)
		expect(agregarIntegrante(lista, { id: 'a' })).not.toBe(lista)
		expect(quitarIntegrante(siguiente, 'a')).toEqual([{ id: 'b' }])
		expect(siguiente.length).toBe(2)
	})
	it('exige tamaño del juego, capitán único y sin repetidos', () => {
		const { equipo, juego } = fixture()
		expect(equipoCompleto(equipo, juego)).toBeTrue()
		expect(equipoCompleto(equipo, { ...juego, jugadoresPorEquipo: 3 })).toBeFalse()
		expect(equipoCompleto(null, juego)).toBeFalse()
		expect(equipoCompleto(equipo, { ...juego, id: 'otro' })).toBeFalse()
		equipo.integrantes[1] = equipo.integrantes[0]
		expect(equipoCompleto(equipo, juego)).toBeFalse()
	})
})
describe('validarEquipo', () => {
	let datos, juego
	beforeEach(() => {
		const f = fixture()
		juego = f.juego
		datos = { ...f.equipo, clave: '123456', confirmarClave: '123456' }
	})
	it('acepta clave de seis caracteres y equipo válido', () =>
		expect(validarEquipo(datos, [], juego)).toEqual({}))
	it('rechaza clave de cinco y confirmación diferente', () => {
		const errores = validarEquipo({ ...datos, clave: '12345' }, [], juego)
		expect(errores.clave).toBeTruthy()
		expect(errores.confirmarClave).toBeTruthy()
	})
	it('exige nombre y no permite duplicados ignorando tildes o mayúsculas', () => {
		expect(validarEquipo({ ...datos, nombre: '' }, [], juego).nombre).toBeTruthy()
		expect(
			validarEquipo(
				{ ...datos, nombre: ' ÁRENA DEMO ' },
				[{ id: 'otro', nombre: 'arena demo' }],
				juego,
			).nombre,
		).toBeTruthy()
	})
	it('permite conservar el nombre propio al editar', () =>
		expect(validarEquipo(datos, [datos], juego)).toEqual({}))
	;[-1, 3, 1.5].forEach((suplentes) =>
		it('rechaza suplentes ' + suplentes, () =>
			expect(validarEquipo({ ...datos, suplentes }, [], juego).suplentes).toBeTruthy(),
		),
	)
	it('acepta dos suplentes reales', () => {
		datos.suplentes = 2
		datos.integrantes = [
			...datos.integrantes,
			{ id: 's1', rol: 'Suplente' },
			{ id: 's2', rol: 'Suplente' },
		]
		expect(validarEquipo(datos, [], juego)).toEqual({})
	})
	it('rechaza suplentes declarados pero ausentes', () =>
		expect(validarEquipo({ ...datos, suplentes: 1 }, [], juego).suplentes).toBeTruthy())
	it('exige capitán titular y juego por equipos', () => {
		expect(validarEquipo({ ...datos, capitanId: 'otro' }, [], juego).capitanId).toBeTruthy()
		expect(validarEquipo(datos, [], { ...juego, modalidad: '1v1' }).juegoId).toBeTruthy()
	})
	it('rechaza integrantes repetidos o insuficientes', () => {
		datos.integrantes.push(datos.integrantes[0])
		expect(validarEquipo(datos, [], juego).integrantes).toContain('repetidos')
		datos.integrantes = []
		expect(validarEquipo(datos, [], juego).integrantes).toBeTruthy()
	})
})
