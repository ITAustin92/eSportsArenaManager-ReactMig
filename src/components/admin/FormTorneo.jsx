import { useState } from 'react'
import Campo from '../compartidos/Campo'
import Boton from '../compartidos/Boton'
import MensajeError from '../compartidos/MensajeError'
import { estadosTorneo, validarTorneo } from '../../logica/torneos.js'

function FormTorneo({ torneo, juegos, onGuardar, onCancelar }) {
	const [datos, setDatos] = useState(() =>
		torneo
			? { ...torneo }
			: { nombre: '', juegoId: '', cupoMax: 8, cierreISO: '', fechaInicio: '', estado: 'Abierto' },
	)
	const [errores, setErrores] = useState({})
	const [error, setError] = useState('')
	const bloqueado = Boolean(torneo && torneo.estado !== 'Abierto')
	const cambiar = ({ target: { name, value, type } }) =>
		setDatos((actual) => ({ ...actual, [name]: type === 'number' ? Number(value) : value }))
	const guardar = (evento) => {
		evento.preventDefault()
		const fallos = validarTorneo(datos, torneo)
		setErrores(fallos)
		if (Object.keys(fallos).length > 0) {
			return
		}
		try {
			onGuardar(datos)
			setError('')
		} catch (fallo) {
			setError(fallo.message)
		}
	}
	return (
		<form className="panel" noValidate onSubmit={guardar}>
			<h2>{torneo ? 'Editar torneo' : 'Crear torneo'}</h2>
			<p>
				Fechas ISO con zona horaria, por ejemplo 2027-12-01T18:00:00-03:00. Se muestran en horario
				de Santiago.
			</p>
			{bloqueado && <p role="status">Las reglas del torneo iniciado están bloqueadas.</p>}
			<Campo
				id="torneo-nombre"
				nombre="nombre"
				etiqueta="Nombre del torneo"
				valor={datos.nombre}
				onCambiar={cambiar}
				error={errores.nombre}
			/>
			<Campo
				id="torneo-juego"
				nombre="juegoId"
				etiqueta="Juego del torneo"
				valor={datos.juegoId}
				onCambiar={cambiar}
				error={errores.juegoId}
				disabled={bloqueado || Boolean(torneo?.inscritos.length)}
				opciones={[
					{ valor: '', etiqueta: 'Selecciona un juego' },
					...juegos.map((juego) => ({ valor: juego.id, etiqueta: juego.nombre })),
				]}
			/>
			<Campo
				id="torneo-cupo"
				nombre="cupoMax"
				etiqueta="Cupo máximo"
				tipo="number"
				min="1"
				step="1"
				valor={datos.cupoMax}
				onCambiar={cambiar}
				error={errores.cupoMax}
				disabled={bloqueado}
			/>
			<Campo
				id="torneo-cierre"
				nombre="cierreISO"
				etiqueta="Cierre de inscripciones (ISO)"
				valor={datos.cierreISO}
				onCambiar={cambiar}
				error={errores.cierreISO}
				disabled={bloqueado}
			/>
			<Campo
				id="torneo-inicio"
				nombre="fechaInicio"
				etiqueta="Inicio del torneo (ISO)"
				valor={datos.fechaInicio}
				onCambiar={cambiar}
				error={errores.fechaInicio}
				disabled={bloqueado}
			/>
			<Campo
				id="torneo-estado"
				nombre="estado"
				etiqueta="Estado del torneo"
				valor={datos.estado}
				onCambiar={cambiar}
				error={errores.estado}
				opciones={estadosTorneo.map((estado) => ({ valor: estado, etiqueta: estado }))}
			/>
			<MensajeError>{error}</MensajeError>
			<div className="acciones">
				<Boton type="submit">Guardar torneo</Boton>
				{onCancelar && (
					<Boton variante="secundario" onClick={onCancelar}>
						Cancelar edición de torneo
					</Boton>
				)}
			</div>
		</form>
	)
}
export default FormTorneo
