import { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { autenticar, claveSesion, recuperarSesion } from '../../logica/sesion.js'
import { usuariosPrueba } from '../../datos/datos.js'

function AuthProvider({ children }) {
	const [sesion, setSesion] = useState(() => {
		try {
			return recuperarSesion(sessionStorage.getItem(claveSesion), usuariosPrueba)
		} catch {
			return null
		}
	})
	const [errorSesion, setErrorSesion] = useState('')
	useEffect(() => {
		const sincronizar = () =>
			setSesion(recuperarSesion(sessionStorage.getItem(claveSesion), usuariosPrueba))
		window.addEventListener('storage', sincronizar)
		return () => window.removeEventListener('storage', sincronizar)
	}, [])
	const iniciarSesion = (datos) => {
		const siguiente = autenticar(datos, usuariosPrueba)
		try {
			sessionStorage.setItem(claveSesion, JSON.stringify(siguiente))
		} catch {
			throw new Error('El navegador no permite guardar la sesión.')
		}
		setSesion(siguiente)
		setErrorSesion('')
		return siguiente
	}
	const cerrarSesion = () => {
		try {
			sessionStorage.removeItem(claveSesion)
		} catch {
			setErrorSesion('No se pudo borrar la sesión guardada. Cierra esta pestaña para descartarla.')
		}
		setSesion(null)
	}
	return (
		<AuthContext.Provider
			value={{ sesion, rol: sesion?.rol ?? 'visitante', iniciarSesion, cerrarSesion, errorSesion }}
		>
			{children}
		</AuthContext.Provider>
	)
}
export default AuthProvider
