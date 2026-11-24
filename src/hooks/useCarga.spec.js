import { act, useEffect } from 'react'
import useCarga from './useCarga.js'
import { prepararDOM } from '../pruebas/dom.jsx'

function pendiente() {
	let resolver, rechazar
	const promesa = new Promise((resolve, reject) => {
		resolver = resolve
		rechazar = reject
	})
	return { promesa, resolver, rechazar }
}

describe('useCarga: respuestas asíncronas', () => {
	let vista, actual
	function Consumidor({ cargar, id = 1 }) {
		const carga = useCarga(cargar, [id])
		useEffect(() => {
			actual = carga
		})
		return <p>{carga.error || carga.datos || 'Cargando'}</p>
	}
	beforeEach(() => {
		vista = prepararDOM()
	})
	afterEach(() => vista.limpiar())
	const montar = (cargar, id) =>
		act(async () => {
			vista.renderizar(<Consumidor cargar={cargar} id={id} />)
		})

	it('expone la carga inicial y luego los datos', async () => {
		const solicitud = pendiente()
		await montar(() => solicitud.promesa)
		expect(actual.cargando).toBeTrue()
		await act(async () => solicitud.resolver('Torneo'))
		expect(actual.datos).toBe('Torneo')
		expect(actual.cargando).toBeFalse()
	})

	it('permite reintentar después de un error', async () => {
		const cargar = jasmine
			.createSpy()
			.and.returnValues(Promise.reject(new Error('Servicio caído')), Promise.resolve('Recuperado'))
		await montar(cargar)
		expect(actual.error).toBe('Servicio caído')
		await act(async () => actual.recargar())
		expect(actual.error).toBe('')
		expect(actual.datos).toBe('Recuperado')
	})

	it('mantiene los datos durante una recarga del mismo registro', async () => {
		const solicitud = pendiente()
		const cargar = jasmine
			.createSpy()
			.and.returnValues(Promise.resolve('Anterior'), solicitud.promesa)
		await montar(cargar)
		await act(async () => actual.recargar())
		expect(actual.datos).toBe('Anterior')
		await act(async () => solicitud.resolver('Actualizado'))
		expect(actual.datos).toBe('Actualizado')
	})

	it('descarta una respuesta tardía al cambiar de registro', async () => {
		const primero = pendiente()
		await montar(() => primero.promesa, 1)
		await montar(() => Promise.resolve('Segundo'), 2)
		await act(async () => primero.resolver('Primero'))
		expect(actual.datos).toBe('Segundo')
	})

	it('vacía los datos al cambiar de registro mientras llega la nueva respuesta', async () => {
		await montar(() => Promise.resolve('Primero'), 1)
		const segundo = pendiente()
		await montar(() => segundo.promesa, 2)
		expect(actual.datos).toBeNull()
		expect(actual.cargando).toBeTrue()
		await act(async () => segundo.resolver('Segundo'))
	})
})
