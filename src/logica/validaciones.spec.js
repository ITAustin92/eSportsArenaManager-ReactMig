import { validarEquipo, validarRegistro, validarTorneo } from './validaciones'

describe('validaciones de formularios', () => {
	it('registro: exige contraseñas iguales y correo válido', () => {
		const errores = validarRegistro({
			username: 'ab',
			nombre: '',
			correo: 'malo',
			password: '123456',
			confirmacion: '654321',
		})
		expect(Object.keys(errores).sort()).toEqual(['confirmacion', 'correo', 'nombre', 'username'])
	})
	it('torneo: el término no puede ser anterior al inicio ni un torneo nuevo empezar en el pasado', () => {
		const errores = validarTorneo(
			{
				name: 'Copa',
				gameId: '1',
				organizerId: '1',
				startDate: '2026-01-10',
				endDate: '2026-01-01',
				state: 'UPCOMING',
			},
			{ esNuevo: true, hoy: '2026-11-19' },
		)
		expect(errores.startDate).toBeDefined()
		expect(errores.endDate).toBeDefined()
	})
	it('equipo: no permite integrantes repetidos', () => {
		const errores = validarEquipo({
			nombre: 'Los Tigres',
			juegoPrincipalId: '1',
			miembros: [
				{ usuarioId: 2, rolDentroEquipo: 'Capitán' },
				{ usuarioId: 2, rolDentroEquipo: 'Titular' },
			],
		})
		expect(errores.miembros).toBeDefined()
	})
})
