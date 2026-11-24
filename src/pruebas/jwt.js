// Crea un JWT de PRUEBA (firma falsa): el frontend solo lee el payload, la firma la valida el backend.
export function tokenDePrueba(payload) {
	const b64 = (objeto) =>
		btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(objeto))))
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '')
	return b64({ alg: 'HS256', typ: 'JWT' }) + '.' + b64(payload) + '.firma-de-prueba'
}

export function almacenFalso() {
	const registros = new Map()
	return {
		getItem: (clave) => registros.get(clave) ?? null,
		setItem: (clave, valor) => registros.set(clave, String(valor)),
		removeItem: (clave) => registros.delete(clave),
	}
}
