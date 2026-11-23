import { useState } from 'react'
import { api } from '../../servicios/api'
import useCarga from '../../hooks/useCarga'
import Campo from '../compartidos/Campo'
import Boton from '../compartidos/Boton'
import EstadoCarga from '../compartidos/EstadoCarga'
import MensajeError from '../compartidos/MensajeError'
import { inscripcionVigente } from '../../logica/torneos'

// Solo ADMIN puede programar partidas o registrar/corregir resultados.
export default function AdminCompeticion({ detalle, onCambio }) {
	const carga = useCarga(() => api.get('/api/v1/results'), [detalle.torneo.tournamentId])
	const [formulario, setFormulario] = useState({ local: '', visita: '', fecha: '', ronda: '' })
	const [enviando, setEnviando] = useState(false)
	const [error, setError] = useState('')
	const [aviso, setAviso] = useState('')
	const individual = detalle.juego?.jugadoresPorEquipo === 1
	const participantes = detalle.inscripciones.filter(inscripcionVigente)
	const nombre = (id) =>
		individual
			? (detalle.jugadores.find((j) => j.usuarioId === id)?.nickname ?? 'Jugador #' + id)
			: (detalle.equipos.find((e) => e.equipoId === id)?.nombre ?? 'Equipo #' + id)
	const opciones = [
		{ valor: '', etiqueta: 'Selecciona participante' },
		...participantes.map((r) => {
			const id = individual ? r.userId : r.teamId
			return { valor: String(id), etiqueta: nombre(id) }
		}),
	]
	const cambiar = (e) => setFormulario((a) => ({ ...a, [e.target.name]: e.target.value }))
	const ejecutar = async (accion, mensaje) => {
		setEnviando(true)
		setError('')
		setAviso('')
		try {
			await accion()
			setAviso(mensaje)
			carga.recargar()
			onCambio()
		} catch (fallo) {
			setError(fallo.message)
		} finally {
			setEnviando(false)
		}
	}
	const programar = (e) => {
		e.preventDefault()
		if (
			!formulario.local ||
			!formulario.visita ||
			formulario.local === formulario.visita ||
			!formulario.fecha
		) {
			setError('Selecciona dos participantes distintos y una fecha.')
			return
		}
		const campos = individual
			? { homeUserId: Number(formulario.local), awayUserId: Number(formulario.visita) }
			: { homeTeamId: Number(formulario.local), awayTeamId: Number(formulario.visita) }
		ejecutar(async () => {
			await api.post('/api/v1/matches', {
				...campos,
				tournamentId: detalle.torneo.tournamentId,
				matchDate: formulario.fecha,
				round: formulario.ronda.trim() || 'General',
				status: 'SCHEDULED',
			})
			setFormulario({ local: '', visita: '', fecha: '', ronda: '' })
		}, 'Partida programada.')
	}
	return (
		<section className="panel mt-4">
			<h2>Administrar competición</h2>
			{aviso && <p role="status">{aviso}</p>}
			<MensajeError>{error}</MensajeError>
			{['UPCOMING', 'IN_PROGRESS'].includes(detalle.torneo.state) && !detalle.incompleto && (
				<form onSubmit={programar} className="mb-4">
					<h3>Programar partida</h3>
					<div className="row g-3">
						{[
							['local', 'Participante local'],
							['visita', 'Participante visitante'],
						].map(([campo, etiqueta]) => (
							<div className="col-md-6" key={campo}>
								<Campo
									id={'partida-' + campo}
									nombre={campo}
									etiqueta={etiqueta}
									valor={formulario[campo]}
									onCambiar={cambiar}
									opciones={opciones}
								/>
							</div>
						))}
						<div className="col-md-6">
							<Campo
								id="partida-fecha"
								nombre="fecha"
								etiqueta="Fecha de partida"
								tipo="datetime-local"
								valor={formulario.fecha}
								onCambiar={cambiar}
							/>
						</div>
						<div className="col-md-6">
							<Campo
								id="partida-ronda"
								nombre="ronda"
								etiqueta="Ronda"
								valor={formulario.ronda}
								onCambiar={cambiar}
							/>
						</div>
					</div>
					<Boton type="submit" disabled={enviando}>
						Programar partida
					</Boton>
				</form>
			)}
			<EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar}>
				{carga.datos &&
					detalle.partidas
						.filter((p) => p.status !== 'CANCELLED')
						.map((partida) => {
							const resultado = carga.datos.find((r) => r.matchId === partida.matchId)
							return (
								<ResultadoPartida
									key={
										partida.matchId +
										':' +
										resultado?.status +
										':' +
										resultado?.homeScore +
										':' +
										resultado?.awayScore
									}
									partida={partida}
									resultado={resultado}
									individual={individual}
									nombre={nombre}
									ejecutar={ejecutar}
									enviando={enviando}
								/>
							)
						})}
			</EstadoCarga>
		</section>
	)
}

function ResultadoPartida({ partida, resultado, individual, nombre, ejecutar, enviando }) {
	const [marcador, setMarcador] = useState({
		local: String(resultado?.homeScore ?? ''),
		visita: String(resultado?.awayScore ?? ''),
	})
	const local = individual ? partida.homeUserId : partida.homeTeamId
	const visita = individual ? partida.awayUserId : partida.awayTeamId
	const guardar = (e) => {
		e.preventDefault()
		const homeScore = Number(marcador.local),
			awayScore = Number(marcador.visita)
		ejecutar(async () => {
			if (
				marcador.local === '' ||
				marcador.visita === '' ||
				!Number.isInteger(homeScore) ||
				!Number.isInteger(awayScore) ||
				homeScore < 0 ||
				awayScore < 0 ||
				homeScore === awayScore
			)
				throw new Error('Ingresa marcadores enteros no negativos, sin empate.')
			const ganador = homeScore > awayScore ? local : visita
			const cuerpo = {
				matchId: partida.matchId,
				homeScore,
				awayScore,
				status: 'CONFIRMED',
				...(individual ? { winnerUserId: ganador } : { winnerTeamId: ganador }),
			}
			if (resultado) await api.put('/api/v1/results/' + resultado.resultId, cuerpo)
			else await api.post('/api/v1/results', cuerpo)
		}, 'Resultado guardado. Clasificación actualizada.')
	}
	return (
		<form
			onSubmit={guardar}
			className="separador-fila"
			aria-label={'Resultado partida ' + partida.matchId}
		>
			<h3>
				Partida #{partida.matchId}: {nombre(local)} vs {nombre(visita)}
			</h3>
			<div className="row g-3">
				{[
					['local', nombre(local)],
					['visita', nombre(visita)],
				].map(([campo, etiqueta]) => (
					<div className="col-md-6" key={campo}>
						<Campo
							id={'marcador-' + partida.matchId + '-' + campo}
							nombre={campo}
							etiqueta={'Marcador ' + etiqueta}
							tipo="number"
							min="0"
							step="1"
							valor={marcador[campo]}
							onCambiar={(e) => setMarcador((a) => ({ ...a, [campo]: e.target.value }))}
						/>
					</div>
				))}
			</div>
			<div className="acciones">
				<Boton type="submit" disabled={enviando}>
					Guardar resultado
				</Boton>
				{resultado?.status === 'CONFIRMED' && (
					<Boton
						variante="secundario"
						disabled={enviando}
						onClick={() => {
							if (window.confirm('¿Anular el resultado y retirar sus puntos?'))
								ejecutar(
									() => api.delete('/api/v1/results/' + resultado.resultId),
									'Resultado anulado. Puntos retirados.',
								)
						}}
					>
						Anular resultado
					</Boton>
				)}
			</div>
		</form>
	)
}
