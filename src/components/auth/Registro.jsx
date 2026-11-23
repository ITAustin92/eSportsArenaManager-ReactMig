import './Login.css'
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Campo from '../compartidos/Campo'
import Boton from '../compartidos/Boton'
import MensajeError from '../compartidos/MensajeError'
import useAuth from './useAuth'
import { validarRegistro, hayErrores } from '../../logica/validaciones.js'
import { INICIO_POR_ROL } from '../../logica/acceso.js'

const vacio = { username: '', nombre: '', correo: '', password: '', confirmacion: '' }

// Registro público: el backend SIEMPRE crea la cuenta con ROLE_JUGADOR (no se puede elegir rol).
function Registro() {
	const { sesion, rol, registrarse } = useAuth()
	const [datos, setDatos] = useState(vacio)
	const [errores, setErrores] = useState({})
	const [error, setError] = useState('')
	const [enviando, setEnviando] = useState(false)
	if (sesion) {
		return <Navigate to={INICIO_POR_ROL[rol] ?? '/'} replace />
	}
	const cambiar = (evento) =>
		setDatos((actual) => ({ ...actual, [evento.target.name]: evento.target.value }))
	const enviar = async (evento) => {
		evento.preventDefault()
		const encontrados = validarRegistro(datos)
		setErrores(encontrados)
		setError('')
		if (hayErrores(encontrados)) {
			return
		}
		setEnviando(true)
		try {
			await registrarse(datos)
		} catch (fallo) {
			setErrores(fallo.campos ?? {})
			setError(fallo.message)
			setEnviando(false)
		}
	}
	const campo = (nombre, etiqueta, extra = {}) => (
		<Campo
			id={'registro-' + nombre}
			nombre={nombre}
			etiqueta={etiqueta}
			valor={datos[nombre]}
			onCambiar={cambiar}
			error={errores[nombre]}
			{...extra}
		/>
	)
	return (
		<section className="login panel">
			<p className="sobretitulo">Únete a la arena</p>
			<h1>Crear cuenta de jugador</h1>
			<form noValidate onSubmit={enviar}>
				{campo('username', 'Usuario (también será tu nickname)', { autoComplete: 'username' })}
				{campo('nombre', 'Nombre completo', { autoComplete: 'name' })}
				{campo('correo', 'Correo', { tipo: 'email', autoComplete: 'email' })}
				{campo('password', 'Contraseña', { tipo: 'password', autoComplete: 'new-password' })}
				{campo('confirmacion', 'Repite la contraseña', {
					tipo: 'password',
					autoComplete: 'new-password',
				})}
				<MensajeError>{error}</MensajeError>
				<Boton type="submit" disabled={enviando}>
					{enviando ? 'Creando cuenta…' : 'Crear cuenta'}
				</Boton>
			</form>
			<p className="texto-secundario mt-3">
				¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>.
			</p>
		</section>
	)
}
export default Registro
