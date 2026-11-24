import { useState } from 'react'
import Boton from '../compartidos/Boton'
import Campo from '../compartidos/Campo'
import EstadoCarga from '../compartidos/EstadoCarga'
import MensajeError from '../compartidos/MensajeError'
import useAuth from '../auth/useAuth'
import useCarga from '../../hooks/useCarga'
import { crearCuenta, eliminarCuenta, listarCuentas } from '../../servicios/autenticacion.js'
import { NOMBRE_ROL } from '../../logica/estados.js'
import { hayErrores, validarCuenta } from '../../logica/validaciones.js'

const vacio = { username: '', nombre: '', correo: '', password: '', rol: 'ROLE_ORGANIZADOR' }
const ROLES = [
	{ valor: 'ROLE_ADMIN', etiqueta: 'Administrador' },
	{ valor: 'ROLE_ORGANIZADOR', etiqueta: 'Organizador' },
	{ valor: 'ROLE_JUGADOR', etiqueta: 'Jugador' },
]

// Cuentas de acceso (msvc-auth-service): GET/POST /api/v1/auth/users, DELETE /api/v1/auth/users/{id}.
// Es el único lugar donde se puede asignar ROLE_ADMIN u ROLE_ORGANIZADOR.
function AdminCuentas() {
	const { usuario } = useAuth()
	const { datos, error, cargando, recargar } = useCarga(listarCuentas)
	const [formulario, setFormulario] = useState(null)
	const [errores, setErrores] = useState({})
	const [errorAccion, setErrorAccion] = useState('')
	const [aviso, setAviso] = useState('')
	const cambiar = (e) => setFormulario((a) => ({ ...a, [e.target.name]: e.target.value }))
	const guardar = async (e) => {
		e.preventDefault()
		const encontrados = validarCuenta(formulario)
		setErrores(encontrados)
		setErrorAccion('')
		if (hayErrores(encontrados)) {
			return
		}
		try {
			await crearCuenta({
				username: formulario.username.trim(),
				nombre: formulario.nombre.trim(),
				correo: formulario.correo.trim(),
				password: formulario.password,
				rol: formulario.rol,
			})
			setAviso('Cuenta "' + formulario.username.trim() + '" creada.')
			setFormulario(null)
			recargar()
		} catch (fallo) {
			setErrores(fallo.campos ?? {})
			setErrorAccion(fallo.message)
		}
	}
	const eliminar = async (cuenta) => {
		if (
			!window.confirm('¿Eliminar la cuenta "' + cuenta.username + '"? Ya no podrá iniciar sesión.')
		) {
			return
		}
		setErrorAccion('')
		try {
			await eliminarCuenta(cuenta.id)
			setAviso('Cuenta eliminada.')
			recargar()
		} catch (fallo) {
			setErrorAccion(fallo.message)
		}
	}
	const campo = (nombre, etiquetaCampo, extra = {}) => (
		<Campo
			id={'cuenta-' + nombre}
			nombre={nombre}
			etiqueta={etiquetaCampo}
			valor={formulario[nombre]}
			onCambiar={cambiar}
			error={errores[nombre]}
			{...extra}
		/>
	)
	return (
		<EstadoCarga cargando={cargando} error={error} onReintentar={recargar}>
			{datos && (
				<>
					{aviso && <p role="status">{aviso}</p>}
					<MensajeError>{errorAccion}</MensajeError>
					{formulario ? (
						<form className="panel formulario-admin mb-4" noValidate onSubmit={guardar}>
							<h2>Nueva cuenta</h2>
							<div className="row g-3">
								<div className="col-12 col-md-4">{campo('username', 'Usuario')}</div>
								<div className="col-12 col-md-4">{campo('nombre', 'Nombre')}</div>
								<div className="col-12 col-md-4">
									{campo('correo', 'Correo', { tipo: 'email' })}
								</div>
								<div className="col-12 col-md-6">
									{campo('password', 'Contraseña inicial', {
										tipo: 'password',
										autoComplete: 'new-password',
									})}
								</div>
								<div className="col-12 col-md-6">{campo('rol', 'Rol', { opciones: ROLES })}</div>
							</div>
							<div className="acciones">
								<Boton type="submit">Crear cuenta</Boton>
								<Boton variante="secundario" onClick={() => setFormulario(null)}>
									Cancelar
								</Boton>
							</div>
						</form>
					) : (
						<div className="acciones mb-4">
							<Boton
								onClick={() => {
									setErrores({})
									setAviso('')
									setFormulario({ ...vacio })
								}}
							>
								Nueva cuenta
							</Boton>
						</div>
					)}
					<div className="panel table-responsive" role="region" aria-label="Cuentas" tabIndex="0">
						<table className="table">
							<thead>
								<tr>
									<th scope="col">ID</th>
									<th scope="col">Usuario</th>
									<th scope="col">Nombre</th>
									<th scope="col">Rol</th>
									<th scope="col">Perfil</th>
									<th scope="col">Acciones</th>
								</tr>
							</thead>
							<tbody>
								{datos.map((c) => (
									<tr key={c.id}>
										<td>{c.id}</td>
										<th scope="row">{c.username}</th>
										<td>{c.nombre ?? '—'}</td>
										<td>
											{c.roles.map((r) => NOMBRE_ROL[r.replace('ROLE_', '')] ?? r).join(', ')}
										</td>
										<td>{c.perfilId ?? '—'}</td>
										<td>
											{c.username === usuario.username ? (
												<span className="texto-secundario">Tu cuenta</span>
											) : (
												<Boton variante="secundario" onClick={() => eliminar(c)}>
													Eliminar
												</Boton>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</>
			)}
		</EstadoCarga>
	)
}
export default AdminCuentas
