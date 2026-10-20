export function ordenarRanking(ranking) {
	return [...ranking].sort(
		(a, b) =>
			b.puntos - a.puntos ||
			b.aFavor - b.enContra - (a.aFavor - a.enContra) ||
			a.nombre.localeCompare(b.nombre),
	)
}

export function calcularPuntos(resultados, participanteId, reglas = { victoria: 3, derrota: 0 }) {
	return resultados
		.filter(
			(resultado) =>
				resultado.estado === 'Finalizada' &&
				[resultado.localId, resultado.visitanteId].includes(participanteId),
		)
		.reduce((total, resultado) => {
			const esLocal = resultado.localId === participanteId
			const propio = esLocal ? resultado.puntajeLocal : resultado.puntajeVisitante
			const rival = esLocal ? resultado.puntajeVisitante : resultado.puntajeLocal
			return total + (propio > rival ? reglas.victoria : reglas.derrota)
		}, 0)
}
