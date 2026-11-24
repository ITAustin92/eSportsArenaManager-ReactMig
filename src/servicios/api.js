import { API_URL } from '../config.js'
import { borrarSesion, leerSesion } from './sesion.js'

// Mensajes entendibles cuando el backend no envía uno propio.
const MENSAJES = {
	400: 'Revisa los datos ingresados.',
	401: 'Tu sesión no es válida o venció. Vuelve a iniciar sesión.',
	403: 'Tu rol no tiene permiso para realizar esta acción.',
	404: 'No encontramos lo que buscas.',
	409: 'La operación entra en conflicto con los datos actuales.',
	500: 'El servidor tuvo un problema. Intenta de nuevo en unos minutos.',
	503: 'Un servicio del backend no está disponible. Revisa que esté encendido.',
}

export class ErrorApi extends Error {
	constructor(estado, mensaje, campos) {
		super(mensaje)
		this.name = 'ErrorApi'
		this.estado = estado
		this.campos = campos ?? {}
	}
}

export function mensajePorEstado(estado) {
	if (MENSAJES[estado]) {
		return MENSAJES[estado]
	}
	return estado >= 500 ? MENSAJES[500] : 'Ocurrió un error inesperado.'
}

// Los microservicios responden {"error": "..."}; Spring por defecto usa "message".
function mensajeDelBackend(datos) {
	const texto = datos?.error ?? datos?.mensaje ?? datos?.message ?? datos?.detail
	// "Unauthorized", "Forbidden"... son nombres de estado, no mensajes útiles para la persona.
	return typeof texto === 'string' && texto.trim() && !/^[A-Z][a-z]+( [A-Z][a-z]+)*$/.test(texto)
		? texto
		: null
}

// Única puerta de salida hacia la API (patrón "cliente HTTP centralizado"):
// arma la URL del gateway, agrega el JWT en la cabecera Authorization y traduce los errores.
// `sesion: null` permite llamar sin token (login/registro). `traer` permite inyectar un fetch falso.
export async function solicitar(
	ruta,
	{ metodo = 'GET', cuerpo, sesion = leerSesion(), senal } = {},
	traer = globalThis.fetch,
) {
	if (!API_URL) {
		throw new ErrorApi(
			0,
			'Falta configurar VITE_API_URL con la dirección del gateway antes de compilar.',
		)
	}
	const headers = { Accept: 'application/json' }
	if (cuerpo !== undefined) {
		headers['Content-Type'] = 'application/json'
	}
	if (sesion?.token) {
		headers.Authorization = 'Bearer ' + sesion.token
	}
	let respuesta
	try {
		respuesta = await traer(API_URL + ruta, {
			method: metodo,
			headers,
			body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
			signal: senal,
		})
	} catch (fallo) {
		if (fallo?.name === 'AbortError') {
			throw fallo
		}
		throw new ErrorApi(
			0,
			'No pudimos conectar con el servidor. Revisa tu conexión o intenta de nuevo.',
		)
	}
	if (respuesta.status === 204) {
		return null
	}
	const texto = await respuesta.text().catch(() => '')
	let datos = null
	try {
		datos = texto ? JSON.parse(texto) : null
	} catch {
		datos = texto
	}
	if (!respuesta.ok) {
		// 401 con token = la sesión venció o fue invalidada: se cierra en toda la app.
		if (respuesta.status === 401 && sesion?.token && leerSesion()?.token === sesion.token) {
			borrarSesion()
			globalThis.dispatchEvent?.(new CustomEvent('sesion-expirada'))
		}
		throw new ErrorApi(
			respuesta.status,
			mensajeDelBackend(datos) ?? mensajePorEstado(respuesta.status),
			datos?.campos,
		)
	}
	return datos
}

// Atajos legibles para cada verbo HTTP.
export const api = {
	get: (ruta, opciones) => solicitar(ruta, opciones),
	post: (ruta, cuerpo, opciones) => solicitar(ruta, { ...opciones, metodo: 'POST', cuerpo }),
	put: (ruta, cuerpo, opciones) => solicitar(ruta, { ...opciones, metodo: 'PUT', cuerpo }),
	patch: (ruta, cuerpo, opciones) => solicitar(ruta, { ...opciones, metodo: 'PATCH', cuerpo }),
	delete: (ruta, opciones) => solicitar(ruta, { ...opciones, metodo: 'DELETE' }),
}
