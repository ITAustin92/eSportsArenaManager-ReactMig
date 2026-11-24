import { useState } from 'react'
import { Link } from 'react-router-dom'
import Campo from '../compartidos/Campo'
import Boton from '../compartidos/Boton'
import BadgeEstado from '../compartidos/BadgeEstado'
import EstadoCarga from '../compartidos/EstadoCarga'
import MensajeError from '../compartidos/MensajeError'
import useAuth from '../auth/useAuth'
import useCarga from '../../hooks/useCarga'
import { actualizarUsuario } from '../../servicios/equipos.js'
import { cargarPerfil } from '../../servicios/perfil.js'
import AvatarJugador from '../perfil/AvatarJugador'
import Estadisticas from '../perfil/Estadisticas'
import { validarAvatar } from '../../logica/perfil.js'
import { ESTADOS_EQUIPO, NOMBRE_ROL, etiqueta } from '../../logica/estados.js'
import { formatearFechaHora } from '../../logica/torneos.js'

// Perfil del jugador: datos de msvc-user-service (GET/PUT /api/v1/users/{id}) y estado de la sesión.
function Perfil() {
	const { usuario, sesion, rol } = useAuth()
	const { datos, error, cargando, recargar } = useCarga(
		() => cargarPerfil(usuario.userId),
		[usuario.userId],
	)
	return (
		<>
			<p className="sobretitulo">Rol jugador</p>
			<h1>Mi perfil</h1>
			<div className="row g-4">
				<section className="col-12 col-lg-5">
					<div className="panel h-100">
						<h2>Sesión</h2>
						<dl className="datos-definicion">
							<dt>Usuario</dt>
							<dd>{usuario.username}</dd>
							<dt>Rol</dt>
							<dd>{NOMBRE_ROL[rol]}</dd>
							<dt>Token emitido</dt>
							<dd>{formatearFechaHora(sesion.emitido)}</dd>
							<dt>Token vence</dt>
							<dd>{formatearFechaHora(sesion.expira)}</dd>
						</dl>
						<p className="texto-secundario mt-3 mb-0">
							La sesión se mantiene al recargar la página y se renueva automáticamente antes de
							vencer.
						</p>
					</div>
				</section>
				<section className="col-12 col-lg-7">
					<EstadoCarga cargando={cargando} error={error} onReintentar={recargar}>
						{datos && <FormPerfil perfil={datos.perfil} onGuardado={recargar} />}
					</EstadoCarga>
				</section>
				{datos && (
					<section className="col-12">
						<div className="panel">
							<h2>Mis equipos</h2>
							{datos.equipos.length === 0 ? (
								<p className="mb-0">
									Aún no tienes equipos. <Link to="/equipos">Crea uno</Link>.
								</p>
							) : (
								<ul className="lista-limpia mb-0">
									{datos.equipos.map((e) => (
										<li
											key={e.equipoId}
											className="separador-fila d-flex gap-2 justify-content-between"
										>
											<span>{e.nombre}</span>
											<BadgeEstado estado={etiqueta(ESTADOS_EQUIPO, e.estado)} />
										</li>
									))}
								</ul>
							)}
						</div>
					</section>
				)}
				{datos && (
					<section className="col-12">
						{datos.historial ? (
							<>
								<Estadisticas victorias={datos.victorias} derrotas={datos.derrotas} />
								<div className="panel my-4">
									<h2>Historial de torneos</h2>
									{datos.historial.length === 0 ? (
										<p>Aún no hay resultados históricos.</p>
									) : (
										<ul>
											{datos.historial.map((t) => (
												<li key={t.tournamentId}>
													<Link to={'/torneos/' + t.tournamentId}>{t.name}</Link>
												</li>
											))}
										</ul>
									)}
								</div>
							</>
						) : (
							<p role="status">No se pudieron cargar las estadísticas ni el historial.</p>
						)}
						<div className="panel">
							<h2>Sanciones</h2>
							{datos.sanciones === null ? (
								<p role="status">No se pudo consultar el servicio de sanciones.</p>
							) : datos.sanciones.length === 0 ? (
								<p>Sin sanciones registradas.</p>
							) : (
								<ul>
									{datos.sanciones.map((s) => (
										<li key={s.sanctionId}>
											{s.reason} · {s.status}
										</li>
									))}
								</ul>
							)}
						</div>
					</section>
				)}
			</div>
		</>
	)
}

function FormPerfil({ perfil, onGuardado }) {
	const [datos, setDatos] = useState({
		nombre: perfil.nombre,
		nickname: perfil.nickname,
		correo: perfil.correo,
	})
	const [error, setError] = useState('')
	const [aviso, setAviso] = useState('')
	const [guardando, setGuardando] = useState(false)
	const [errorAvatar, setErrorAvatar] = useState('')
	const cambiarAvatar = (evento) => {
		const archivo = evento.target.files?.[0]
		if (!archivo) {
			return
		}
		const encontrado = validarAvatar(archivo)
		setErrorAvatar(encontrado)
		if (encontrado) {
			return
		}
		const lector = new FileReader()
		lector.onerror = () => setErrorAvatar('No se pudo leer la imagen.')
		lector.onload = async () => {
			setGuardando(true)
			try {
				await actualizarUsuario(perfil.usuarioId, { ...perfil, avatar: lector.result })
				setAviso('Foto actualizada.')
				onGuardado()
			} catch (fallo) {
				setErrorAvatar(fallo.message)
			} finally {
				setGuardando(false)
			}
		}
		lector.readAsDataURL(archivo)
	}
	const cambiar = (evento) =>
		setDatos((actual) => ({ ...actual, [evento.target.name]: evento.target.value }))
	const enviar = async (evento) => {
		evento.preventDefault()
		setError('')
		setAviso('')
		if (
			!datos.nombre.trim() ||
			!datos.nickname.trim() ||
			!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)
		) {
			setError('Completa nombre, nickname y un correo válido.')
			return
		}
		setGuardando(true)
		try {
			// El backend conserva el rol y el estado: un jugador no puede cambiárselos.
			await actualizarUsuario(perfil.usuarioId, {
				rol: perfil.rol,
				estado: perfil.estado,
				nombre: datos.nombre.trim(),
				nickname: datos.nickname.trim(),
				correo: datos.correo.trim(),
			})
			setAviso('Perfil actualizado.')
			onGuardado()
		} catch (fallo) {
			setError(fallo.message)
		} finally {
			setGuardando(false)
		}
	}
	return (
		<form className="panel h-100" noValidate onSubmit={enviar}>
			<h2>Datos del jugador</h2>
			<AvatarJugador
				src={perfil.avatar}
				apodo={perfil.nickname}
				onCambiar={cambiarAvatar}
				error={errorAvatar}
			/>
			{aviso && <p role="status">{aviso}</p>}
			<Campo
				id="perfil-nombre"
				nombre="nombre"
				etiqueta="Nombre"
				valor={datos.nombre}
				onCambiar={cambiar}
			/>
			<Campo
				id="perfil-nickname"
				nombre="nickname"
				etiqueta="Nickname"
				valor={datos.nickname}
				onCambiar={cambiar}
			/>
			<Campo
				id="perfil-correo"
				nombre="correo"
				etiqueta="Correo"
				tipo="email"
				valor={datos.correo}
				onCambiar={cambiar}
			/>
			<p className="texto-secundario">Estado de la cuenta: {perfil.estado}</p>
			<MensajeError>{error}</MensajeError>
			<Boton type="submit" disabled={guardando}>
				{guardando ? 'Guardando…' : 'Guardar cambios'}
			</Boton>
		</form>
	)
}
export default Perfil
