import { api } from './api.js'

// msvc-registration-service. Las inscripciones son las "órdenes" del sistema.
export const listarInscripciones = () => api.get('/api/v1/registrations')
export const obtenerInscripcion = (id) => api.get('/api/v1/registrations/' + id)
export const inscripcionesDeEquipo = (teamId) => api.get('/api/v1/registrations/team/' + teamId)
export const misInscripcionesIndividuales = () => api.get('/api/v1/registrations/mine')
export const inscribirJugador = (userId, tournamentId) =>
	api.post('/api/v1/registrations', {
		userId: Number(userId),
		tournamentId: Number(tournamentId),
		registrationDate: new Date().toISOString().slice(0, 10),
		status: 'PENDING',
	})
export const inscripcionesDeTorneo = (tournamentId) =>
	api.get('/api/v1/registrations/tournament/' + tournamentId)

// La entidad exige fecha y estado (@NotNull/@NotBlank); el backend los reemplaza por hoy y PENDING.
export const inscribirEquipo = (teamId, tournamentId) =>
	api.post('/api/v1/registrations', {
		teamId: Number(teamId),
		tournamentId: Number(tournamentId),
		registrationDate: new Date().toISOString().slice(0, 10),
		status: 'PENDING',
	})

// El backend no borra: marca la inscripción como CANCELLED.
export const cancelarInscripcion = (id) => api.delete('/api/v1/registrations/' + id)

// Solo ADMIN: confirmar o rechazar.
export const cambiarEstadoInscripcion = (id, estado) =>
	api.patch('/api/v1/registrations/' + id + '/status?status=' + encodeURIComponent(estado))
