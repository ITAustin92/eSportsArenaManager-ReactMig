import { ErrorApi, mensajePorEstado, solicitar } from './api'
import { claveSesion, guardarSesion, leerSesion } from './sesion'
import { tokenDePrueba } from '../pruebas/jwt'

function respuesta(status, cuerpo) {
	return Promise.resolve({
		status,
		ok: status >= 200 && status < 300,
		text: () => Promise.resolve(cuerpo === undefined ? '' : JSON.stringify(cuerpo)),
	})
}

describe('cliente HTTP hacia el API Gateway', () => {
	it('envía el JWT en la cabecera Authorization y el cuerpo como JSON', async () => {
		const fetchFalso = jasmine
			.createSpy('fetch')
			.and.returnValue(respuesta(201, { registrationId: 7 }))
		const datos = await solicitar(
			'/api/v1/registrations',
			{ metodo: 'POST', cuerpo: { teamId: 1 }, sesion: { token: 'abc' } },
			fetchFalso,
		)
		expect(datos.registrationId).toBe(7)
		const [url, opciones] = fetchFalso.calls.mostRecent().args
		expect(url).toMatch(/\/api\/v1\/registrations$/)
		expect(opciones.method).toBe('POST')
		expect(opciones.headers.Authorization).toBe('Bearer abc')
		expect(opciones.headers['Content-Type']).toBe('application/json')
		expect(JSON.parse(opciones.body)).toEqual({ teamId: 1 })
	})

	it('no envía Authorization en llamadas públicas', async () => {
		const fetchFalso = jasmine.createSpy('fetch').and.returnValue(respuesta(200, []))
		await solicitar('/api/v1/tournaments', { sesion: null }, fetchFalso)
		expect(fetchFalso.calls.mostRecent().args[1].headers.Authorization).toBeUndefined()
	})

	it('usa el mensaje {"error": ...} que devuelven los microservicios', async () => {
		const fetchFalso = () =>
			respuesta(400, { error: 'El equipo ya se encuentra inscrito en este torneo' })
		await expectAsync(solicitar('/x', { sesion: null }, fetchFalso)).toBeRejectedWith(
			jasmine.objectContaining({
				estado: 400,
				message: 'El equipo ya se encuentra inscrito en este torneo',
			}),
		)
	})

	it('un 401 con token cierra la sesión en toda la app', async () => {
		const anterior = localStorage.getItem(claveSesion)
		const token = tokenDePrueba({
			sub: 'jugador1',
			roles: ['ROLE_JUGADOR'],
			exp: Math.floor(Date.now() / 1000) + 3600,
		})
		guardarSesion({ token })
		const oyente = jasmine.createSpy('sesion-expirada')
		window.addEventListener('sesion-expirada', oyente)
		try {
			await solicitar('/x', { sesion: { token } }, () => respuesta(401))
			fail('debía rechazar')
		} catch (error) {
			expect(error).toEqual(jasmine.any(ErrorApi))
			expect(error.message).toBe(mensajePorEstado(401))
		} finally {
			window.removeEventListener('sesion-expirada', oyente)
			if (anterior === null) localStorage.removeItem(claveSesion)
			else localStorage.setItem(claveSesion, anterior)
		}
		expect(oyente).toHaveBeenCalledTimes(1)
	})

	it('traduce un fallo de red a un mensaje entendible', async () => {
		const sinRed = () => Promise.reject(new TypeError('Failed to fetch'))
		await expectAsync(solicitar('/x', { sesion: null }, sinRed)).toBeRejectedWith(
			jasmine.objectContaining({ estado: 0 }),
		)
	})

	it('un 401 tardío de un token anterior no borra una sesión renovada', async () => {
		const anterior = localStorage.getItem(claveSesion)
		const crearToken = (sub) =>
			tokenDePrueba({
				sub,
				roles: ['ROLE_JUGADOR'],
				exp: Math.floor(Date.now() / 1000) + 3600,
			})
		const viejo = crearToken('anterior')
		const nuevo = crearToken('actual')
		try {
			guardarSesion({ token: nuevo })
			await expectAsync(
				solicitar('/x', { sesion: { token: viejo } }, () => respuesta(401)),
			).toBeRejected()
			expect(leerSesion().token).toBe(nuevo)
		} finally {
			if (anterior === null) localStorage.removeItem(claveSesion)
			else localStorage.setItem(claveSesion, anterior)
		}
	})
	it('conserva los errores de validación por campo', async () => {
		await expectAsync(
			solicitar('/x', { sesion: null }, () =>
				respuesta(400, {
					error: 'Revisa los datos',
					campos: { correo: 'Correo inválido' },
				}),
			),
		).toBeRejectedWith(jasmine.objectContaining({ campos: { correo: 'Correo inválido' } }))
	})
	it('una respuesta 204 representa una operación correcta sin cuerpo', async () => {
		expect(
			await solicitar('/x', { metodo: 'DELETE', sesion: null }, () => respuesta(204)),
		).toBeNull()
	})
	it('no convierte una cancelación voluntaria en un error de conexión', async () => {
		const cancelacion = new DOMException('Cancelada', 'AbortError')
		await expectAsync(
			solicitar('/x', { sesion: null }, () => Promise.reject(cancelacion)),
		).toBeRejectedWith(cancelacion)
	})
})
