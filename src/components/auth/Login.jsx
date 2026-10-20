import './Login.css'
import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import Campo from '../compartidos/Campo'
import Boton from '../compartidos/Boton'
import MensajeError from '../compartidos/MensajeError'
import useAuth from './useAuth'
import { validarLogin } from '../../logica/sesion.js'
import { puedeAcceder } from '../../logica/acceso.js'

function Login() {
	const { sesion, iniciarSesion } = useAuth()
	const ubicacion = useLocation()
	const [datos, setDatos] = useState({ correo: '', clave: '' })
	const [errores, setErrores] = useState({})
	const [error, setError] = useState('')
	const destino = ubicacion.state?.desde
	if (sesion) {
		return (
			<Navigate
				to={
					destino && puedeAcceder(sesion.rol, destino)
						? destino
						: sesion.rol === 'admin'
							? '/admin'
							: '/perfil'
				}
				replace
			/>
		)
	}
	const cambiar = (evento) =>
		setDatos((actual) => ({ ...actual, [evento.target.name]: evento.target.value }))
	const enviar = (evento) => {
		evento.preventDefault()
		const encontrados = validarLogin(datos)
		setErrores(encontrados)
		setError('')
		if (Object.keys(encontrados).length > 0) {
			return
		}
		try {
			iniciarSesion(datos)
		} catch (fallo) {
			setError(fallo.message)
		}
	}
	return (
		<section className="login panel">
			<p className="sobretitulo">Tu espacio en la arena</p>
			<h1>Iniciar sesión</h1>
			<p>Accede con una cuenta de prueba de tu equipo.</p>
			<form noValidate onSubmit={enviar}>
				<Campo
					id="login-correo"
					nombre="correo"
					etiqueta="Correo"
					tipo="email"
					valor={datos.correo}
					onCambiar={cambiar}
					error={errores.correo}
					autoComplete="username"
				/>
				<Campo
					id="login-clave"
					nombre="clave"
					etiqueta="Clave"
					tipo="password"
					valor={datos.clave}
					onCambiar={cambiar}
					error={errores.clave}
					autoComplete="current-password"
				/>
				<MensajeError>{error}</MensajeError>
				<Boton type="submit">Entrar</Boton>
			</form>
			<p className="texto-secundario mt-3">
				Demostración académica. Las cuentas ficticias están en el README.
			</p>
		</section>
	)
}
export default Login
