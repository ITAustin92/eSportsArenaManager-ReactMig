import './Login.css'
import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import Campo from '../compartidos/Campo'
import Boton from '../compartidos/Boton'
import MensajeError from '../compartidos/MensajeError'
import useAuth from './useAuth'
import { validarLogin, hayErrores } from '../../logica/validaciones.js'
import { rutaDespuesDeIngresar } from '../../logica/acceso.js'

function Login() {
	const { sesion, rol, iniciarSesion } = useAuth()
	const ubicacion = useLocation()
	const [datos, setDatos] = useState({ username: '', password: '' })
	const [errores, setErrores] = useState({})
	const [error, setError] = useState('')
	const [enviando, setEnviando] = useState(false)
	if (sesion) {
		return <Navigate to={rutaDespuesDeIngresar(rol, ubicacion.state?.desde)} replace />
	}
	const cambiar = (evento) =>
		setDatos((actual) => ({ ...actual, [evento.target.name]: evento.target.value }))
	const enviar = async (evento) => {
		evento.preventDefault()
		const encontrados = validarLogin(datos)
		setErrores(encontrados)
		setError('')
		if (hayErrores(encontrados)) {
			return
		}
		setEnviando(true)
		try {
			// POST /api/v1/auth/login -> { token, roles, ... }. Al guardar la sesión el componente
			// se vuelve a renderizar y <Navigate> lleva al inicio del rol.
			await iniciarSesion(datos)
		} catch (fallo) {
			setError(fallo.message)
			setEnviando(false)
		}
	}
	return (
		<section className="login panel">
			<p className="sobretitulo">Tu espacio en la arena</p>
			<h1>Iniciar sesión</h1>
			<form noValidate onSubmit={enviar}>
				<Campo
					id="login-usuario"
					nombre="username"
					etiqueta="Usuario"
					valor={datos.username}
					onCambiar={cambiar}
					error={errores.username}
					autoComplete="username"
				/>
				<Campo
					id="login-clave"
					nombre="password"
					etiqueta="Contraseña"
					tipo="password"
					valor={datos.password}
					onCambiar={cambiar}
					error={errores.password}
					autoComplete="current-password"
				/>
				<MensajeError>{error}</MensajeError>
				<Boton type="submit" disabled={enviando}>
					{enviando ? 'Validando…' : 'Entrar'}
				</Boton>
			</form>
			<p className="texto-secundario mt-3">
				¿No tienes cuenta? <Link to="/registro">Regístrate como jugador</Link>.
			</p>
		</section>
	)
}
export default Login
