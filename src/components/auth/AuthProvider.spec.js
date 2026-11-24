import { act, useEffect } from 'react'
import AuthProvider from './AuthProvider.jsx'
import useAuth from './useAuth.js'
import { api } from '../../servicios/api.js'
import { claveSesion, guardarSesion, leerSesion } from '../../servicios/sesion.js'
import { tokenDePrueba } from '../../pruebas/jwt.js'
import { prepararDOM } from '../../pruebas/dom.jsx'

describe('AuthProvider: ciclo de sesión', () => {
	let vista, auth, anterior
	const inicio = Date.UTC(2026, 10, 23, 15)
	function respuesta(rol = 'JUGADOR', duracion = 120, emitido = inicio) {
		return {
			token: tokenDePrueba({
				sub: 'jugador',
				userId: 2,
				roles: ['ROLE_' + rol],
				iat: emitido / 1000,
				exp: emitido / 1000 + duracion,
			}),
		}
	}
	function Consumidor() {
		const contexto = useAuth()
		useEffect(() => {
			auth = contexto
		})
		return <p>{contexto.rol}</p>
	}
	const montar = () =>
		vista.renderizar(
			<AuthProvider>
				<Consumidor />
			</AuthProvider>,
		)
	beforeEach(() => {
		anterior = localStorage.getItem(claveSesion)
		localStorage.removeItem(claveSesion)
		jasmine.clock().install()
		jasmine.clock().mockDate(new Date(inicio))
		vista = prepararDOM()
	})
	afterEach(() => {
		vista.limpiar()
		jasmine.clock().uninstall()
		if (anterior === null) localStorage.removeItem(claveSesion)
		else localStorage.setItem(claveSesion, anterior)
	})

	it('inicia como visitante sin credenciales', () => {
		montar()
		expect(auth.rol).toBe('visitante')
	})
	it('recupera la sesión guardada al montar', () => {
		guardarSesion(respuesta('ADMIN'))
		montar()
		expect(auth.rol).toBe('ADMIN')
		expect(auth.usuario.userId).toBe(2)
	})
	it('inicia sesión y persiste únicamente el token', async () => {
		const post = spyOn(api, 'post').and.resolveTo(respuesta())
		montar()
		await act(async () => auth.iniciarSesion({ username: ' jugador ', password: 'secreto' }))
		expect(post).toHaveBeenCalledWith(
			'/api/v1/auth/login',
			{ username: 'jugador', password: 'secreto' },
			{ sesion: null },
		)
		expect(auth.rol).toBe('JUGADOR')
		expect(Object.keys(JSON.parse(localStorage.getItem(claveSesion)))).toEqual(['token'])
	})
	it('un login rechazado no crea una sesión', async () => {
		spyOn(api, 'post').and.rejectWith(new Error('Credenciales inválidas'))
		montar()
		await expectAsync(auth.iniciarSesion({ username: 'x', password: 'x' })).toBeRejectedWithError(
			'Credenciales inválidas',
		)
		expect(auth.rol).toBe('visitante')
		expect(leerSesion()).toBeNull()
	})
	it('el registro inicia una sesión con el JWT entregado', async () => {
		spyOn(api, 'post').and.resolveTo(respuesta())
		montar()
		await act(async () =>
			auth.registrarse({
				username: 'nuevo',
				password: 'clave123',
				nombre: ' Nuevo ',
				correo: ' nuevo@example.com ',
			}),
		)
		expect(auth.rol).toBe('JUGADOR')
	})
	it('renueva antes de vencer y utiliza el nuevo token', async () => {
		guardarSesion(respuesta())
		const nueva = respuesta('JUGADOR', 120, inicio + 90000)
		const post = spyOn(api, 'post').and.resolveTo(nueva)
		montar()
		await act(async () => jasmine.clock().tick(90000))
		expect(post).toHaveBeenCalledWith('/api/v1/auth/refresh')
		expect(auth.sesion.token).toBe(nueva.token)
		await act(async () => jasmine.clock().tick(30000))
		expect(auth.rol).toBe('JUGADOR')
	})
	it('cierra y avisa al vencer si no se puede renovar', async () => {
		guardarSesion(respuesta())
		spyOn(api, 'post').and.rejectWith(Object.assign(new Error('Sin permiso'), { estado: 403 }))
		montar()
		await act(async () => jasmine.clock().tick(90000))
		await act(async () => jasmine.clock().tick(30000))
		expect(auth.rol).toBe('visitante')
		expect(auth.expirada).toBeTrue()
		expect(leerSesion()).toBeNull()
		act(() => auth.cerrarAviso())
		expect(auth.expirada).toBeFalse()
	})
	it('reintenta una renovación tras un fallo temporal', async () => {
		guardarSesion(respuesta('JUGADOR', 240))
		const post = spyOn(api, 'post').and.returnValues(
			Promise.reject(new Error('Sin conexión')),
			Promise.resolve(respuesta('JUGADOR', 600)),
		)
		montar()
		await act(async () => jasmine.clock().tick(180000))
		await act(async () => jasmine.clock().tick(30000))
		expect(post).toHaveBeenCalledTimes(2)
		expect(auth.sesion.expira).toBe(inicio + 600000)
	})
	it('una renovación tardía no restaura una sesión cerrada', async () => {
		guardarSesion(respuesta())
		let resolver
		spyOn(api, 'post').and.returnValue(
			new Promise((resolve) => {
				resolver = resolve
			}),
		)
		montar()
		await act(async () => jasmine.clock().tick(90000))
		act(() => auth.cerrarSesion())
		await act(async () => resolver(respuesta('JUGADOR', 600)))
		expect(auth.rol).toBe('visitante')
		expect(leerSesion()).toBeNull()
	})
	it('sincroniza el cierre de otra pestaña', () => {
		guardarSesion(respuesta())
		montar()
		localStorage.removeItem(claveSesion)
		act(() => window.dispatchEvent(new StorageEvent('storage', { key: claveSesion })))
		expect(auth.rol).toBe('visitante')
	})
	it('reacciona al aviso de sesión inválida del cliente HTTP', () => {
		guardarSesion(respuesta())
		montar()
		act(() => window.dispatchEvent(new CustomEvent('sesion-expirada')))
		expect(auth.rol).toBe('visitante')
		expect(auth.expirada).toBeTrue()
	})
})
