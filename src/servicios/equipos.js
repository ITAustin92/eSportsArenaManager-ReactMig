import { api } from './api.js'

// msvc-team-service. El backend verifica que un JUGADOR solo modifique equipos donde es capitán.
export const listarEquipos = () => api.get('/api/v1/teams')
export const equiposDeCapitan = (capitanId) => api.get('/api/v1/teams/capitan/' + capitanId)
export const obtenerEquipo = (id) => api.get('/api/v1/teams/' + id)
export const crearEquipo = (equipo) => api.post('/api/v1/teams', equipo)
export const actualizarEquipo = (id, equipo) => api.put('/api/v1/teams/' + id, equipo)
// El backend no borra físicamente: deja el equipo INACTIVO.
export const desactivarEquipo = (id) => api.delete('/api/v1/teams/' + id)

// msvc-user-service: buscar integrantes por nickname y ver perfiles.
export const buscarUsuarioPorNickname = (nickname) =>
	api.get('/api/v1/users/nickname/' + encodeURIComponent(nickname.trim()))
export const obtenerUsuario = (id) => api.get('/api/v1/users/' + id)
export const actualizarUsuario = (id, usuario) => api.put('/api/v1/users/' + id, usuario)
export const listarUsuarios = () => api.get('/api/v1/users')
