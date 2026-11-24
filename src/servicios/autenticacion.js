import { api } from './api.js'

// msvc-auth-service (a través del gateway). sesion: null evita mandar un token viejo
// y que un 401 por credenciales malas se confunda con una sesión vencida.
export const iniciarSesion = (username, password) =>
	api.post('/api/v1/auth/login', { username: username.trim(), password }, { sesion: null })

export const registrarJugador = (datos) =>
	api.post(
		'/api/v1/auth/register',
		{
			username: datos.username.trim(),
			password: datos.password,
			nombre: datos.nombre.trim(),
			correo: datos.correo.trim(),
		},
		{ sesion: null },
	)

// Con un token vigente entrega uno nuevo (renovación silenciosa).
export const renovarToken = () => api.post('/api/v1/auth/refresh')

// Gestión de cuentas: solo ADMIN (el backend responde 403 a otros roles).
export const listarCuentas = () => api.get('/api/v1/auth/users')
export const crearCuenta = (datos) => api.post('/api/v1/auth/users', datos)
export const eliminarCuenta = (id) => api.delete('/api/v1/auth/users/' + id)
