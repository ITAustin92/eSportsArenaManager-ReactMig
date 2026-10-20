const objeto = (valor) => valor !== null && typeof valor === 'object' && !Array.isArray(valor)
const texto = (valor) => typeof valor === 'string'
const id = (valor) => texto(valor) && valor.trim().length > 0
const numero = (valor) => Number.isFinite(valor) && valor >= 0
const fecha = (valor) => texto(valor) && Number.isFinite(Date.parse(valor))
const textos = (valor) => Array.isArray(valor) && valor.every(texto)
const campos = (registro, nombres) => nombres.every((nombre) => texto(registro[nombre]))
const lista = (valor, validar) =>
	Array.isArray(valor) &&
	valor.every((item) => objeto(item) && id(item.id) && validar(item)) &&
	new Set(valor.map((item) => item.id)).size === valor.length
const sanciones = (valor) =>
	lista(
		valor,
		(item) =>
			texto(item.motivo) &&
			typeof item.vigente === 'boolean' &&
			(item.desde === undefined || fecha(item.desde)) &&
			(item.hasta === undefined || fecha(item.hasta)),
	)

// Revisa las estructuras que las vistas leen antes de aceptar el JSON del navegador.
// No exige plantillas completas: los equipos incompletos son casos válidos de la demo.
export function datosGuardadosValidos(datos, jugadoresRequeridos = []) {
	if (!objeto(datos) || datos.version !== 1) {
		return false
	}
	if (
		!lista(
			datos.juegos,
			(item) =>
				campos(item, ['nombre', 'imagen']) &&
				['equipos', '1v1'].includes(item.modalidad) &&
				Number.isInteger(item.jugadoresPorEquipo) &&
				item.jugadoresPorEquipo > 0,
		)
	) {
		return false
	}
	if (
		!lista(
			datos.jugadores,
			(item) =>
				campos(item, ['nombre', 'apodo', 'correo', 'avatar']) &&
				textos(item.equipos) &&
				numero(item.victorias) &&
				numero(item.derrotas) &&
				sanciones(item.sanciones) &&
				lista(item.historial, (fila) => campos(fila, ['torneoId', 'nombre', 'resultado'])),
		)
	) {
		return false
	}
	if (
		!lista(
			datos.equipos,
			(item) =>
				campos(item, ['nombre', 'juegoId', 'capitanId']) &&
				['habilitado', 'inactivo', 'incompleto', 'sancionado'].includes(item.estado) &&
				numero(item.suplentes) &&
				textos(item.torneosIds) &&
				sanciones(item.sanciones) &&
				lista(item.integrantes, (miembro) => campos(miembro, ['nombre', 'apodo', 'correo', 'rol'])),
		)
	) {
		return false
	}
	if (
		!lista(
			datos.torneos,
			(item) =>
				campos(item, ['nombre', 'juegoId']) &&
				['Abierto', 'En Curso', 'Finalizado'].includes(item.estado) &&
				Number.isInteger(item.cupoMax) &&
				item.cupoMax > 0 &&
				textos(item.inscritos) &&
				fecha(item.cierreISO) &&
				fecha(item.fechaInicio) &&
				lista(
					item.premios,
					(premio) =>
						Number.isInteger(premio.posicion) && premio.posicion > 0 && texto(premio.recompensa),
				) &&
				lista(
					item.partidas,
					(partida) =>
						campos(partida, ['ronda', 'estado']) &&
						fecha(partida.horario) &&
						[partida.localId, partida.visitanteId].every((valor) => valor === null || id(valor)),
				) &&
				Array.isArray(item.ranking) &&
				item.ranking.every(
					(fila) =>
						objeto(fila) &&
						campos(fila, ['participanteId', 'nombre']) &&
						['victorias', 'derrotas', 'puntos', 'aFavor', 'enContra'].every((clave) =>
							numero(fila[clave]),
						),
				),
		)
	) {
		return false
	}
	if (
		!lista(
			datos.inscripciones,
			(item) =>
				campos(item, ['torneoId', 'participanteId', 'jugadorId', 'correo']) &&
				['jugador', 'equipo'].includes(item.tipoParticipante),
		)
	) {
		return false
	}
	if (
		!lista(
			datos.resultados,
			(item) =>
				campos(item, ['torneoId', 'partidaId', 'localId', 'visitanteId', 'estado']) &&
				numero(item.puntajeLocal) &&
				numero(item.puntajeVisitante),
		)
	) {
		return false
	}

	const juegos = new Set(datos.juegos.map((item) => item.id))
	const jugadores = new Set(datos.jugadores.map((item) => item.id))
	// Juego y jugador son referencias que las vistas usan sin un estado alternativo.
	return (
		jugadoresRequeridos.every((valor) => jugadores.has(valor)) &&
		datos.torneos.every((item) => juegos.has(item.juegoId)) &&
		datos.equipos.every(
			(item) =>
				juegos.has(item.juegoId) &&
				jugadores.has(item.capitanId) &&
				item.integrantes.every((miembro) => jugadores.has(miembro.id)),
		)
	)
}
