import { useState } from 'react'
import Campo from '../compartidos/Campo'
import Boton from '../compartidos/Boton'
import MensajeError from '../compartidos/MensajeError'
import { buscarUsuarioPorNickname } from '../../servicios/equipos.js'
import { validarEquipo, hayErrores } from '../../logica/validaciones.js'

// Formulario para crear o editar un equipo propio. El capitán es siempre la persona de la sesión
// (el backend lo fuerza aunque alguien manipule el cuerpo de la petición).
function FormEquipo({ inicial, juegos, usuarios, capitan, onGuardar, onCancelar }) {
	const [datos, setDatos] = useState(
		() =>
			inicial ?? {
				nombre: '',
				juegoPrincipalId: juegos[0] ? String(juegos[0].juegoId) : '',
				estado: 'ACTIVO',
				miembros: [{ usuarioId: capitan.userId, rolDentroEquipo: 'Capitán' }],
			},
	)
	const [hallados, setHallados] = useState([])
	const [nickname, setNickname] = useState('')
	const [rolNuevo, setRolNuevo] = useState('Titular')
	const [errores, setErrores] = useState({})
	const [error, setError] = useState('')
	const [guardando, setGuardando] = useState(false)
	const nombreDe = (id) => {
		const u = [...usuarios, ...hallados].find((x) => x.usuarioId === id)
		return u ? u.nombre + ' (@' + u.nickname + ')' : 'Usuario #' + id
	}
	const cambiar = (evento) =>
		setDatos((actual) => ({ ...actual, [evento.target.name]: evento.target.value }))
	const agregar = async () => {
		setError('')
		if (!nickname.trim()) {
			setError('Escribe el nickname del integrante.')
			return
		}
		try {
			// GET /api/v1/users/nickname/{nickname} en msvc-user-service
			const usuario = await buscarUsuarioPorNickname(nickname)
			if (datos.miembros.some((m) => m.usuarioId === usuario.usuarioId)) {
				setError('Ese jugador ya está en el equipo.')
				return
			}
			if (usuario.estado !== 'ACTIVO') {
				setError('Ese usuario no está activo (' + usuario.estado + ').')
				return
			}
			setHallados((actual) => [...actual, usuario])
			setDatos((actual) => ({
				...actual,
				miembros: [...actual.miembros, { usuarioId: usuario.usuarioId, rolDentroEquipo: rolNuevo }],
			}))
			setNickname('')
		} catch (fallo) {
			setError(fallo.estado === 400 ? 'No existe un usuario con ese nickname.' : fallo.message)
		}
	}
	const quitar = (usuarioId) =>
		setDatos((actual) => ({
			...actual,
			miembros: actual.miembros.filter((m) => m.usuarioId !== usuarioId),
		}))
	const enviar = async (evento) => {
		evento.preventDefault()
		const encontrados = validarEquipo(datos)
		setErrores(encontrados)
		setError('')
		if (hayErrores(encontrados)) {
			return
		}
		setGuardando(true)
		try {
			await onGuardar({
				nombre: datos.nombre.trim(),
				capitanId: capitan.userId,
				juegoPrincipalId: Number(datos.juegoPrincipalId),
				estado: datos.estado,
				miembros: datos.miembros.map((m) => ({
					usuarioId: m.usuarioId,
					rolDentroEquipo: m.rolDentroEquipo.trim(),
				})),
			})
		} catch (fallo) {
			setError(fallo.message)
			setGuardando(false)
		}
	}
	return (
		<form className="panel formulario-admin mb-4" noValidate onSubmit={enviar}>
			<h2>{inicial ? 'Editar equipo' : 'Nuevo equipo'}</h2>
			<div className="row g-3">
				<div className="col-12 col-md-6">
					<Campo
						id="equipo-nombre"
						nombre="nombre"
						etiqueta="Nombre del equipo"
						valor={datos.nombre}
						onCambiar={cambiar}
						error={errores.nombre}
					/>
				</div>
				<div className="col-12 col-md-3">
					<Campo
						id="equipo-juego"
						nombre="juegoPrincipalId"
						etiqueta="Juego principal"
						valor={datos.juegoPrincipalId}
						onCambiar={cambiar}
						error={errores.juegoPrincipalId}
						disabled={Boolean(inicial)}
						opciones={juegos.map((j) => ({ valor: String(j.juegoId), etiqueta: j.nombre }))}
					/>
				</div>
				<div className="col-12 col-md-3">
					<Campo
						id="equipo-estado"
						nombre="estado"
						etiqueta="Estado"
						valor={datos.estado}
						onCambiar={cambiar}
						disabled={!inicial}
						opciones={[
							{ valor: 'ACTIVO', etiqueta: 'Activo' },
							{ valor: 'INACTIVO', etiqueta: 'Inactivo' },
						]}
					/>
				</div>
			</div>
			<h3 className="mt-2">Integrantes</h3>
			<ul className="lista-limpia">
				{datos.miembros.map((m) => (
					<li
						key={m.usuarioId}
						className="separador-fila d-flex flex-wrap gap-2 align-items-center"
					>
						<span className="flex-grow-1">
							{nombreDe(m.usuarioId)} · {m.rolDentroEquipo}
						</span>
						{m.usuarioId !== capitan.userId && (
							<Boton variante="secundario" onClick={() => quitar(m.usuarioId)}>
								Quitar
							</Boton>
						)}
					</li>
				))}
			</ul>
			<MensajeError>{errores.miembros}</MensajeError>
			<div className="row g-3 align-items-end">
				<div className="col-12 col-md-5">
					<Campo
						id="equipo-nickname"
						nombre="nickname"
						etiqueta="Agregar integrante por nickname"
						valor={nickname}
						onCambiar={(e) => setNickname(e.target.value)}
						ayuda="Ejemplo: dtapia_gol"
					/>
				</div>
				<div className="col-12 col-md-4">
					<Campo
						id="equipo-rol"
						nombre="rolNuevo"
						etiqueta="Rol en el equipo"
						valor={rolNuevo}
						onCambiar={(e) => setRolNuevo(e.target.value)}
						opciones={['Titular', 'Suplente', 'Estratega / IGL', 'Soporte'].map((r) => ({
							valor: r,
							etiqueta: r,
						}))}
					/>
				</div>
				<div className="col-12 col-md-3 mb-3">
					<Boton variante="secundario" onClick={agregar}>
						Agregar
					</Boton>
				</div>
			</div>
			<MensajeError>{error}</MensajeError>
			<div className="acciones">
				<Boton type="submit" disabled={guardando}>
					{guardando ? 'Guardando…' : 'Guardar equipo'}
				</Boton>
				<Boton variante="secundario" onClick={onCancelar}>
					Cancelar
				</Boton>
			</div>
		</form>
	)
}
export default FormEquipo
