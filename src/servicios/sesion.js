// Persistencia de la sesión en el navegador.
//
// Se guarda solo { token } en localStorage para que la sesión SOBREVIVA a una recarga
// (F5) y a cerrar la pestaña. El usuario se reconstruye desde el JWT; nunca se guarda la contraseña.
// Al leerla se revisa el vencimiento (claim "exp" del JWT): un token vencido se borra y la
// persona vuelve a ser visitante. La firma NO se verifica aquí (el navegador no tiene la clave):
// la verifican el gateway y cada microservicio en cada petición.
// Riesgo conocido: un ataque XSS podría leer localStorage. Por eso React escapa todo el texto y
// el proyecto no usa dangerouslySetInnerHTML con datos del usuario.
export const claveSesion = 'arena-ep3-sesion'

// El JWT tiene tres partes separadas por puntos; la segunda (payload) es JSON en base64url.
export function leerPayload(token) {
	try {
		const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
		const relleno = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
		const bytes = Uint8Array.from(atob(relleno), (c) => c.charCodeAt(0))
		return JSON.parse(new TextDecoder().decode(bytes))
	} catch {
		return null
	}
}

const ROLES = ['ROLE_ADMIN', 'ROLE_ORGANIZADOR', 'ROLE_JUGADOR']

// ROLE_ADMIN -> 'ADMIN'. Si hubiera varios roles, gana el de más privilegio.
export function rolPrincipal(roles = []) {
	const lista = [].concat(roles ?? [])
	const encontrado = ROLES.find((rol) => lista.includes(rol))
	return encontrado ? encontrado.replace('ROLE_', '') : null
}

// Construye el usuario de la sesión a partir del token (fuente de verdad) y la respuesta del login.
export function usuarioDesdeToken(token, extra = {}) {
	const payload = leerPayload(token)
	if (typeof payload?.sub !== 'string' || !payload.sub || !Number.isFinite(payload?.exp)) {
		return null
	}
	const roles = payload.roles ?? extra.roles ?? []
	const rol = rolPrincipal(roles)
	if (!rol) {
		return null
	}
	return {
		username: payload.sub,
		nombre: payload.nombre ?? extra.nombre ?? payload.sub,
		userId: payload.userId ?? extra.userId ?? null,
		roles: [].concat(roles),
		rol,
	}
}

// Devuelve { token, usuario, expira, emitido } o null. Si el token venció, lo borra.
// Los parámetros permiten usar un almacén y una hora falsos en las pruebas.
export function leerSesion(almacen = globalThis.localStorage, ahora = Date.now()) {
	try {
		const guardada = JSON.parse(almacen?.getItem(claveSesion) ?? 'null')
		if (!guardada?.token) {
			return null
		}
		const payload = leerPayload(guardada.token)
		const usuario = usuarioDesdeToken(guardada.token)
		if (!Number.isFinite(payload?.exp) || !usuario || payload.exp * 1000 <= ahora) {
			almacen.removeItem(claveSesion)
			return null
		}
		return {
			token: guardada.token,
			usuario,
			expira: payload.exp * 1000,
			emitido: (payload.iat ?? payload.exp) * 1000,
		}
	} catch {
		return null
	}
}

// Recibe la respuesta de /login, /register o /refresh: { token, username, nombre, userId, roles, ... }
export function guardarSesion(respuesta, almacen = globalThis.localStorage) {
	const usuario = usuarioDesdeToken(respuesta?.token, respuesta)
	if (!usuario) {
		throw new Error('El servidor entregó un token inválido.')
	}
	almacen.setItem(claveSesion, JSON.stringify({ token: respuesta.token }))
	return leerSesion(almacen)
}

export function borrarSesion(almacen = globalThis.localStorage) {
	try {
		almacen?.removeItem(claveSesion)
	} catch {
		/* almacenamiento bloqueado: la sesión en memoria igual se descarta */
	}
}
