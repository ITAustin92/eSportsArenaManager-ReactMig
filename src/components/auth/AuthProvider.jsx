import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext'
import {
	iniciarSesion as loginApi,
	registrarJugador,
	renovarToken,
} from '../../servicios/autenticacion.js'
import { borrarSesion, claveSesion, guardarSesion, leerSesion } from '../../servicios/sesion.js'

const QUINCE_MINUTOS = 15 * 60 * 1000

// Estado global de autenticación.
// - Al montar se lee localStorage UNA vez: por eso la sesión sobrevive a la recarga de página.
// - Antes de que el JWT venza se pide uno nuevo (POST /api/v1/auth/refresh). Si no se puede,
//   la sesión se cierra justo al vencer y se avisa a la persona.
// - Si cualquier llamada responde 401, api.js emite 'sesion-expirada' y aquí se cierra la sesión.
// - Si la sesión cambia en otra pestaña (evento 'storage'), esta pestaña se sincroniza.
function AuthProvider({ children }) {
	const [sesion, setSesion] = useState(() => leerSesion())
	const [expirada, setExpirada] = useState(false)
	const [errorSesion, setErrorSesion] = useState('')

	const aplicar = useCallback((respuesta) => {
		const nueva = guardarSesion(respuesta)
		setSesion(nueva)
		setExpirada(false)
		setErrorSesion('')
		return nueva
	}, [])

	const iniciarSesion = useCallback(
		async ({ username, password }) => aplicar(await loginApi(username, password)),
		[aplicar],
	)

	const registrarse = useCallback(
		async (datos) => aplicar(await registrarJugador(datos)),
		[aplicar],
	)

	const cerrarSesion = useCallback(() => {
		borrarSesion()
		setSesion(null)
	}, [])

	const cerrarAviso = useCallback(() => setExpirada(false), [])

	useEffect(() => {
		const alExpirar = () => {
			setSesion(null)
			setExpirada(true)
		}
		const alCambiarOtraPestana = (evento) => {
			if (evento.key === null || evento.key === claveSesion) {
				setSesion(leerSesion())
			}
		}
		window.addEventListener('sesion-expirada', alExpirar)
		window.addEventListener('storage', alCambiarOtraPestana)
		return () => {
			window.removeEventListener('sesion-expirada', alExpirar)
			window.removeEventListener('storage', alCambiarOtraPestana)
		}
	}, [])

	// Renovación silenciosa: se programa al iniciar sesión, al recargar y tras cada renovación.
	useEffect(() => {
		if (!sesion) {
			return undefined
		}
		const margen = Math.min(QUINCE_MINUTOS, (sesion.expira - sesion.emitido) / 4)
		const restante = sesion.expira - Date.now()
		let vigente = true
		let renovar
		const intentarRenovacion = async () => {
			try {
				const respuesta = await renovarToken()
				if (vigente && leerSesion()?.token === sesion.token) {
					aplicar(respuesta)
				}
			} catch (fallo) {
				if (vigente && ![401, 403].includes(fallo.estado) && Date.now() < sesion.expira) {
					renovar = setTimeout(intentarRenovacion, Math.min(30000, sesion.expira - Date.now()))
				}
			}
		}
		renovar = setTimeout(intentarRenovacion, Math.max(restante - margen, 0))
		const vencer = setTimeout(
			() => {
				borrarSesion()
				setSesion(null)
				setExpirada(true)
			},
			Math.max(restante, 0),
		)
		return () => {
			vigente = false
			clearTimeout(renovar)
			clearTimeout(vencer)
		}
	}, [sesion, aplicar])

	const valor = useMemo(
		() => ({
			sesion,
			usuario: sesion?.usuario ?? null,
			rol: sesion?.usuario?.rol ?? 'visitante',
			iniciarSesion,
			registrarse,
			cerrarSesion,
			expirada,
			cerrarAviso,
			errorSesion,
		}),
		[sesion, iniciarSesion, registrarse, cerrarSesion, expirada, cerrarAviso, errorSesion],
	)

	return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
export default AuthProvider
