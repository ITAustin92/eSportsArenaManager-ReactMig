import {
	cuposDisponibles,
	filtrarTorneos,
	validarFiltros,
	validarTorneo,
	claseEstado,
	formatearFecha,
	fechaSantiago,
	inscripcionAbierta,
} from './torneos'
import { fixture } from '../pruebas/fixtures'
describe('cuposDisponibles', () => {
	;[
		[8, 3, 5],
		[0, 0, 0],
		[2, 2, 0],
		[1, 2, 0],
	].forEach(([cupoMax, ocupados, esperado]) => {
		it('resta ' + cupoMax + ' menos ' + ocupados + ' sin valores negativos', () =>
			expect(cuposDisponibles({ cupoMax, inscritos: Array(ocupados) })).toBe(esperado),
		)
	})
})
describe('filtros de torneos', () => {
	let datos
	beforeEach(() => {
		datos = fixture().datos
	})
	it('combina búsqueda, juego, estado y fechas sin mutar', () => {
		const copia = structuredClone(datos.torneos)
		const resultado = filtrarTorneos(datos.torneos, {
			busqueda: ' LATAM ',
			juego: 'valorant',
			estado: 'Abierto',
			fechaInicio: '2029-01-01',
			fechaFin: '2031-01-01',
		})
		expect(resultado.length).toBe(1)
		expect(datos.torneos).toEqual(copia)
	})
	it('devuelve vacío y error para un rango invertido', () => {
		const filtros = { fechaInicio: '2031-01-01', fechaFin: '2030-01-01' }
		expect(validarFiltros(filtros).fechaInicio).toBeTruthy()
		expect(filtrarTorneos(datos.torneos, filtros)).toEqual([])
	})
	it('permite filtros vacíos y nombre que no existe', () => {
		expect(filtrarTorneos(datos.torneos).length).toBe(datos.torneos.length)
		expect(filtrarTorneos(datos.torneos, { busqueda: 'inexistente' })).toEqual([])
	})
	it('excluye por cada límite de fecha', () => {
		expect(filtrarTorneos(datos.torneos, { fechaInicio: '2099-01-01' })).toEqual([])
		expect(filtrarTorneos(datos.torneos, { fechaFin: '2000-01-01' })).toEqual([])
	})
	it('filtra por el día que se muestra en Santiago aunque el ISO sea del día siguiente', () => {
		const torneo = { ...datos.torneos[0], cierreISO: '2026-10-17T01:00:00Z' }
		expect(fechaSantiago(torneo.cierreISO)).toBe('2026-10-16')
		expect(filtrarTorneos([torneo], { fechaInicio: '2026-10-16', fechaFin: '2026-10-16' })).toEqual(
			[torneo],
		)
		expect(filtrarTorneos([torneo], { fechaInicio: '2026-10-17', fechaFin: '2026-10-17' })).toEqual(
			[],
		)
	})
	it('usa el mismo día para instantes equivalentes con zonas distintas y respeta el horario de invierno', () => {
		expect(fechaSantiago('2026-10-17T01:00:00Z')).toBe(fechaSantiago('2026-10-16T22:00:00-03:00'))
		expect(fechaSantiago('2026-07-17T02:00:00Z')).toBe('2026-07-16')
	})
})

describe('inscripción abierta por estado y plazo', () => {
	it('permite el instante exacto del cierre y bloquea después, fechas inválidas o estado cerrado', () => {
		const torneo = { estado: 'Abierto', cierreISO: '2030-01-01T12:00:00Z' }
		expect(inscripcionAbierta(torneo, torneo.cierreISO)).toBeTrue()
		expect(inscripcionAbierta(torneo, '2030-01-01T12:00:00.001Z')).toBeFalse()
		expect(inscripcionAbierta({ ...torneo, cierreISO: 'inválida' })).toBeFalse()
		expect(inscripcionAbierta({ ...torneo, estado: 'Finalizado' }, '2029-01-01')).toBeFalse()
	})
})
describe('validarTorneo', () => {
	let contexto
	beforeEach(() => {
		contexto = fixture()
	})
	it('acepta torneo futuro válido', () =>
		expect(validarTorneo(contexto.torneo, null, contexto.hoy)).toEqual({}))
	it('rechaza nombre, juego, cupo y fechas inválidas', () => {
		const errores = validarTorneo(
			{ nombre: '', juegoId: '', cupoMax: 0, cierreISO: '', fechaInicio: '', estado: 'Otro' },
			null,
			contexto.hoy,
		)
		expect(Object.keys(errores).sort()).toEqual([
			'cierreISO',
			'cupoMax',
			'estado',
			'fechaInicio',
			'juegoId',
			'nombre',
		])
	})
	it('rechaza inicio igual al cierre y cierre pasado', () => {
		expect(
			validarTorneo(
				{ ...contexto.torneo, fechaInicio: contexto.torneo.cierreISO },
				null,
				contexto.hoy,
			).fechaInicio,
		).toBeTruthy()
		expect(validarTorneo(contexto.torneo, null, '2040-01-01').cierreISO).toBeTruthy()
	})
	it('no reduce cupos bajo inscritos', () =>
		expect(
			validarTorneo({ ...contexto.torneo, cupoMax: 1 }, contexto.torneo, contexto.hoy).cupoMax,
		).toBeTruthy())
	it('bloquea reglas críticas y retrocesos de un torneo iniciado', () => {
		const anterior = { ...contexto.torneo, estado: 'En Curso' }
		const errores = validarTorneo(
			{
				...anterior,
				juegoId: 'otro',
				cupoMax: 100,
				cierreISO: '2030-12-01',
				fechaInicio: '2030-12-02',
				estado: 'Abierto',
			},
			anterior,
			contexto.hoy,
		)
		expect(Object.keys(errores).sort()).toEqual([
			'cierreISO',
			'cupoMax',
			'estado',
			'fechaInicio',
			'juegoId',
		])
	})
	it('no reabre un torneo finalizado y permite editar su nombre', () => {
		const anterior = { ...contexto.torneo, estado: 'Finalizado' }
		expect(
			validarTorneo({ ...anterior, estado: 'En Curso' }, anterior, contexto.hoy).estado,
		).toBeTruthy()
		expect(validarTorneo({ ...anterior, nombre: 'Nuevo' }, anterior, contexto.hoy)).toEqual({})
	})
	it('genera clase legible y fecha local', () => {
		expect(claseEstado('En Curso')).toBe('estado-en-curso')
		expect(formatearFecha(contexto.torneo.cierreISO)).toContain('2030')
	})
})
