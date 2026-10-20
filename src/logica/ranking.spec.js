import { ordenarRanking, calcularPuntos } from './ranking'
describe('ordenarRanking', () => {
	it('ordena por puntos y desempata por diferencia sin mutar', () => {
		const original = [
			{ nombre: 'B', puntos: 6, aFavor: 4, enContra: 3 },
			{ nombre: 'A', puntos: 6, aFavor: 9, enContra: 2 },
			{ nombre: 'C', puntos: 9, aFavor: 1, enContra: 0 },
		]
		const copia = structuredClone(original)
		expect(ordenarRanking(original).map((fila) => fila.nombre)).toEqual(['C', 'A', 'B'])
		expect(original).toEqual(copia)
		expect(ordenarRanking(original)).not.toBe(original)
	})
	it('desempata por nombre y admite una lista vacía', () => {
		expect(ordenarRanking([])).toEqual([])
		expect(
			ordenarRanking(
				['Z', 'A'].map((nombre) => ({ nombre, puntos: 0, aFavor: 0, enContra: 0 })),
			).map((fila) => fila.nombre),
		).toEqual(['A', 'Z'])
	})
})
describe('calcularPuntos', () => {
	let resultados
	beforeEach(() => {
		resultados = [
			{
				estado: 'Finalizada',
				localId: 'a',
				visitanteId: 'b',
				puntajeLocal: 2,
				puntajeVisitante: 1,
			},
			{
				estado: 'Finalizada',
				localId: 'b',
				visitanteId: 'a',
				puntajeLocal: 0,
				puntajeVisitante: 2,
			},
			{
				estado: 'Programada',
				localId: 'a',
				visitanteId: 'b',
				puntajeLocal: 0,
				puntajeVisitante: 0,
			},
		]
	})
	it('suma victoria local y visitante, sin contar partidos pendientes', () => {
		expect(calcularPuntos(resultados, 'a')).toBe(6)
		expect(calcularPuntos(resultados, 'b')).toBe(0)
	})
	it('acepta puntaje de derrota configurable y participante ajeno', () => {
		expect(calcularPuntos(resultados, 'b', { victoria: 2, derrota: 1 })).toBe(2)
		expect(calcularPuntos(resultados, 'c')).toBe(0)
	})
})
