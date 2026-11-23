import { test, expect } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { basename } from 'node:path'

// Estas pruebas usan el gateway y las bases locales reales, sin interceptar fetch.
// Ejecutar solo contra datos de prueba: crean cuentas, equipos y torneos.
const API = process.env.ARENA_TEST_API_URL ?? 'http://localhost:8080'
const clave = 'Prueba123!'

async function capturar(page, opciones) {
	const path =
		process.env.ARENA_CAPTURE_EVIDENCE === '1'
			? opciones.path
			: test.info().outputPath(basename(opciones.path))
	return page.screenshot({ ...opciones, path })
}
const unico = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
const cabeceras = (cuenta) => ({ Authorization: 'Bearer ' + cuenta.token })

test.beforeAll(async ({ request }) => {
	test.setTimeout(120000)
	// Eureka puede tardar en descubrir procesos cuya salud ya responde correctamente.
	for (const ruta of [
		'/games',
		'/teams',
		'/tournaments',
		'/matches',
		'/results',
		'/users/public',
		'/rankings/tournament/1',
	]) {
		await expect
			.poll(
				async () => {
					try {
						return (await request.get(API + '/api/v1' + ruta, { timeout: 3000 })).status()
					} catch {
						return 0
					}
				},
				{ timeout: 90000, intervals: [1000, 2000, 5000] },
			)
			.toBe(200)
	}
})
const inscripcion = (participante, torneo) => ({
	...participante,
	tournamentId: torneo.tournamentId,
	registrationDate: new Date().toISOString().slice(0, 10),
	status: 'PENDING',
})

async function jsonOk(respuesta, estado) {
	expect(respuesta.status(), await respuesta.text()).toBe(estado)
	return respuesta.json()
}
async function loginApi(request, username = 'admin', password = 'admin123') {
	return jsonOk(
		await request.post(API + '/api/v1/auth/login', {
			data: { username, password },
		}),
		200,
	)
}
async function registrar(request) {
	const username = 'test_' + unico()
	return jsonOk(
		await request.post(API + '/api/v1/auth/register', {
			data: {
				username,
				password: clave,
				nombre: 'Jugador de prueba',
				correo: username + '@example.com',
			},
		}),
		201,
	)
}
async function loginUI(page, username, password) {
	await page.goto('/login')
	await page.getByLabel('Usuario', { exact: true }).fill(username)
	await page.getByLabel('Contraseña', { exact: true }).fill(password)
	await page.getByRole('button', { name: 'Entrar', exact: true }).click()
}
async function crearTorneo(request, admin, gameId = 5) {
	return jsonOk(
		await request.post(API + '/api/v1/tournaments', {
			headers: cabeceras(admin),
			data: {
				name: 'Copa prueba ' + unico(),
				gameId,
				organizerId: 11,
				startDate: '2099-12-20',
				endDate: '2099-12-21',
				state: 'UPCOMING',
				registrationDeadline: '2099-12-19T23:00:00Z',
				maxParticipants: 2,
			},
		}),
		201,
	)
}

test('catálogo público, detalle y redirección de una ruta privada', async ({ page }) => {
	await page.goto('/torneos')
	await expect(page.getByRole('heading', { name: 'Explorar torneos' })).toBeVisible()
	await expect(page.getByText('Liga Master LoL 2027', { exact: true })).toBeVisible()
	await page.goto('/torneos/4')
	await expect(
		page.getByRole('heading', { name: 'Copa Invierno Valorant', exact: true }),
	).toBeVisible()
	await expect(page.getByText('Algunos servicios no respondieron', { exact: false })).toHaveCount(0)
	await page.goto('/perfil')
	await expect(page).toHaveURL(/\/login$/)
})

test('registro desde la interfaz, sesión persistente y cierre', async ({ page }) => {
	const username = 'ui_' + unico()
	await page.goto('/registro')
	await page.getByLabel('Usuario (también será tu nickname)').fill(username)
	await page.getByLabel('Nombre completo').fill('Persona de Prueba')
	await page.getByLabel('Correo', { exact: true }).fill(username + '@example.com')
	await page.getByLabel('Contraseña', { exact: true }).fill(clave)
	await page.getByLabel('Repite la contraseña').fill(clave)
	await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click()
	await expect(page).toHaveURL(/\/torneos$/)
	await page.reload()
	await page.goto('/perfil')
	await expect(page.getByRole('heading', { name: 'Mi perfil', exact: true })).toBeVisible()
	await expect(page.getByText(username, { exact: true }).first()).toBeVisible()
	await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click()
	await page.goto('/perfil')
	await expect(page).toHaveURL(/\/login$/)
})

test('jugador crea, edita y desactiva su equipo; otro jugador no puede modificarlo', async ({
	page,
	request,
}) => {
	const cuenta = await registrar(request)
	const otra = await registrar(request)
	const nombre = 'Equipo ' + unico()
	await loginUI(page, cuenta.username, clave)
	await expect(page).toHaveURL(/\/torneos$/)
	await page.goto('/equipos')
	await page.getByRole('button', { name: 'Crear equipo', exact: true }).click()
	await page.getByLabel('Nombre del equipo').fill(nombre)
	await page.getByRole('button', { name: 'Guardar equipo', exact: true }).click()
	await expect(page.getByText('Equipo creado.', { exact: true })).toBeVisible()
	const equipos = await jsonOk(
		await request.get(API + '/api/v1/teams/capitan/' + cuenta.userId, {
			headers: cabeceras(cuenta),
		}),
		200,
	)
	const equipo = equipos.find((e) => e.nombre === nombre)
	expect(equipo).toBeTruthy()
	const ajena = await request.put(API + '/api/v1/teams/' + equipo.equipoId, {
		headers: cabeceras(otra),
		data: { ...equipo, nombre: 'Intento ajeno' },
	})
	expect(ajena.status()).toBe(403)
	await page.getByRole('button', { name: 'Editar', exact: true }).click()
	await page.getByLabel('Nombre del equipo').fill(nombre + ' editado')
	await page.getByRole('button', { name: 'Guardar equipo', exact: true }).click()
	await expect(page.getByRole('heading', { name: nombre + ' editado', exact: true })).toBeVisible()
	page.once('dialog', (dialog) => dialog.accept())
	await page.getByRole('button', { name: 'Desactivar', exact: true }).click()
	await expect(page.getByText('Equipo desactivado.', { exact: true })).toBeVisible()
})

test('inscripción individual desde React, duplicados y cancelación', async ({ page, request }) => {
	const admin = await loginApi(request)
	const cuenta = await registrar(request)
	const torneo = await crearTorneo(request, admin)
	await loginUI(page, cuenta.username, clave)
	await expect(page).toHaveURL(/\/torneos$/)
	await page.goto('/inscripcion?torneo=' + torneo.tournamentId)
	await page.getByRole('button', { name: 'Confirmar inscripción', exact: true }).click()
	await expect(page.getByText(/Inscripción #\d+ enviada para revisión/)).toBeVisible()
	const duplicada = await request.post(API + '/api/v1/registrations', {
		headers: cabeceras(cuenta),
		data: inscripcion({ userId: cuenta.userId }, torneo),
	})
	expect(duplicada.status()).toBe(409)
	page.once('dialog', (dialog) => dialog.accept())
	await page.getByRole('button', { name: 'Cancelar', exact: true }).click()
	await expect(page.getByText('Inscripción cancelada.', { exact: true })).toBeVisible()
	const registros = await jsonOk(
		await request.get(API + '/api/v1/registrations/mine', {
			headers: cabeceras(cuenta),
		}),
		200,
	)
	expect(registros.find((r) => r.tournamentId === torneo.tournamentId).status).toBe('CANCELLED')
})

test('roles: administrador, organizador y barreras reales de la API', async ({ page, request }) => {
	await loginUI(page, 'organizador1', 'org123')
	await expect(page).toHaveURL(/\/gestion\/torneos$/)
	await expect(page.getByText('Liga Master LoL 2027', { exact: true })).toBeVisible()
	await page.goto('/gestion/inscripciones')
	await expect(page.getByRole('heading', { name: /inscripciones/i }).first()).toBeVisible()
	await page.goto('/admin')
	await expect(page.getByRole('heading', { name: 'Acceso denegado' })).toBeVisible()
	const organizador = await loginApi(request, 'organizador1', 'org123')
	expect(
		(await request.get(API + '/api/v1/auth/users', { headers: cabeceras(organizador) })).status(),
	).toBe(403)
	expect((await request.get(API + '/api/v1/auth/users')).status()).toBe(401)
	await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click()
	await loginUI(page, 'admin', 'admin123')
	await expect(page).toHaveURL(/\/admin$/)
	await expect(page.getByRole('heading', { name: 'Panel de administración' })).toBeVisible()
	await page.getByRole('tab', { name: 'Cuentas y roles' }).click()
	await expect(page.getByRole('rowheader', { name: 'admin', exact: true })).toBeVisible()
})

test('JWT real: credenciales erróneas, renovación y perfil desactivado', async ({ request }) => {
	expect(
		(
			await request.post(API + '/api/v1/auth/login', {
				data: { username: 'admin', password: 'incorrecta' },
			})
		).status(),
	).toBe(401)
	const cuenta = await registrar(request)
	const nueva = await jsonOk(
		await request.post(API + '/api/v1/auth/refresh', {
			headers: cabeceras(cuenta),
		}),
		200,
	)
	expect(nueva.roles).toContain('ROLE_JUGADOR')
	const admin = await loginApi(request)
	expect(
		(
			await request.delete(API + '/api/v1/users/' + cuenta.userId, {
				headers: cabeceras(admin),
			})
		).status(),
	).toBe(204)
	expect(
		(
			await request.post(API + '/api/v1/auth/refresh', {
				headers: cabeceras(cuenta),
			})
		).status(),
	).toBe(403)
})

test('administrador crea, edita y desactiva juegos desde React', async ({ page, request }) => {
	const nombre = 'Juego prueba ' + unico()
	await loginUI(page, 'admin', 'admin123')
	await expect(page).toHaveURL(/\/admin$/)
	await page.getByRole('tab', { name: 'Juegos', exact: true }).click()
	await page.getByRole('button', { name: 'Nuevo juego', exact: true }).click()
	await page.getByLabel('Nombre', { exact: true }).fill(nombre)
	await page.getByLabel('Género', { exact: true }).fill('Deportes')
	await page.getByRole('button', { name: 'Guardar', exact: true }).click()
	await expect(page.getByText('Juego creado.', { exact: true })).toBeVisible()
	await page
		.getByRole('row')
		.filter({ hasText: nombre })
		.getByRole('button', { name: 'Editar' })
		.click()
	await page.getByLabel('Nombre', { exact: true }).fill(nombre + ' editado')
	await page.getByRole('button', { name: 'Guardar', exact: true }).click()
	await expect(page.getByText('Juego actualizado.', { exact: true })).toBeVisible()
	page.once('dialog', (dialog) => dialog.accept())
	await page
		.getByRole('row')
		.filter({ hasText: nombre + ' editado' })
		.getByRole('button', { name: 'Desactivar' })
		.click()
	await expect(page.getByText('Juego desactivado.', { exact: true })).toBeVisible()
	const activos = await jsonOk(await request.get(API + '/api/v1/games'), 200)
	expect(activos.some((j) => j.nombre === nombre + ' editado')).toBe(false)
})

test('cupos: tres solicitudes simultáneas no exceden dos plazas', async ({ request }) => {
	const admin = await loginApi(request)
	const torneo = await crearTorneo(request, admin)
	const cuentas = await Promise.all([registrar(request), registrar(request), registrar(request)])
	const respuestas = await Promise.all(
		cuentas.map((cuenta) =>
			request.post(API + '/api/v1/registrations', {
				headers: cabeceras(cuenta),
				data: inscripcion({ userId: cuenta.userId }, torneo),
			}),
		),
	)
	expect(respuestas.map((r) => r.status()).sort()).toEqual([201, 201, 409])
	const inscritos = await jsonOk(
		await request.get(API + '/api/v1/registrations/tournament/' + torneo.tournamentId),
		200,
	)
	expect(inscritos).toHaveLength(2)
})

test('equipos: inscripción válida, confirmación y rechazo de un equipo incompleto', async ({
	request,
}) => {
	const admin = await loginApi(request)
	const capitan = await registrar(request)
	const integrante = await registrar(request)
	const juego = await jsonOk(
		await request.post(API + '/api/v1/games', {
			headers: cabeceras(admin),
			data: {
				nombre: 'Duelos ' + unico(),
				genero: 'Deportes',
				modalidad: '2v2',
				jugadoresPorEquipo: 2,
				estado: 'ACTIVO',
			},
		}),
		201,
	)
	const torneo = await crearTorneo(request, admin, juego.juegoId)
	const cuerpo = {
		nombre: 'Duo ' + unico(),
		capitanId: capitan.userId,
		juegoPrincipalId: juego.juegoId,
		estado: 'ACTIVO',
		miembros: [{ usuarioId: capitan.userId, rolDentroEquipo: 'Capitán' }],
	}
	const equipo = await jsonOk(
		await request.post(API + '/api/v1/teams', {
			headers: cabeceras(capitan),
			data: cuerpo,
		}),
		201,
	)
	const incompleta = await request.post(API + '/api/v1/registrations', {
		headers: cabeceras(capitan),
		data: inscripcion({ teamId: equipo.equipoId }, torneo),
	})
	expect(incompleta.status(), await incompleta.text()).toBe(409)
	await jsonOk(
		await request.put(API + '/api/v1/teams/' + equipo.equipoId, {
			headers: cabeceras(capitan),
			data: {
				...cuerpo,
				miembros: [
					...cuerpo.miembros,
					{ usuarioId: integrante.userId, rolDentroEquipo: 'Titular' },
				],
			},
		}),
		200,
	)
	const registro = await jsonOk(
		await request.post(API + '/api/v1/registrations', {
			headers: cabeceras(capitan),
			data: inscripcion({ teamId: equipo.equipoId }, torneo),
		}),
		201,
	)
	const confirmado = await jsonOk(
		await request.patch(
			API + '/api/v1/registrations/' + registro.registrationId + '/status?status=CONFIRMED',
			{
				headers: cabeceras(admin),
			},
		),
		200,
	)
	expect(confirmado.status).toBe('CONFIRMED')
	expect(
		(
			await request.delete(API + '/api/v1/registrations/' + registro.registrationId, {
				headers: cabeceras(integrante),
			})
		).status(),
	).toBe(403)
})

test('administrador crea, edita y cancela torneos desde React', async ({ page }) => {
	const nombre = 'Torneo UI ' + unico()
	await loginUI(page, 'admin', 'admin123')
	await expect(page).toHaveURL(/\/admin$/)
	await page.getByRole('button', { name: 'Nuevo torneo', exact: true }).click()
	await page.getByLabel('Nombre', { exact: true }).fill(nombre)
	await page.getByLabel('Inicio', { exact: true }).fill('2099-12-20')
	await page.getByLabel('Término', { exact: true }).fill('2099-12-21')
	await page.getByLabel('Cupos máximos').fill('8')
	await page.getByLabel('Cierre de inscripción').fill('2099-12-19T20:00')
	await page.getByRole('button', { name: 'Guardar', exact: true }).click()
	await expect(page.getByText('Torneo creado.', { exact: true })).toBeVisible()
	await page
		.getByRole('row')
		.filter({ hasText: nombre })
		.getByRole('button', { name: 'Editar' })
		.click()
	await page.getByLabel('Nombre', { exact: true }).fill(nombre + ' editado')
	await page.getByLabel('Cupos máximos').fill('12')
	await page.getByRole('button', { name: 'Guardar', exact: true }).click()
	await expect(page.getByText('Torneo actualizado.', { exact: true })).toBeVisible()
	page.once('dialog', (dialog) => dialog.accept())
	await page
		.getByRole('row')
		.filter({ hasText: nombre + ' editado' })
		.getByRole('button', { name: 'Cancelar', exact: true })
		.click()
	await expect(page.getByText('Torneo cancelado.', { exact: true })).toBeVisible()
})

test('administrador crea una cuenta organizadora y la elimina desde React', async ({
	page,
	request,
}) => {
	const username = 'org_' + unico()
	await loginUI(page, 'admin', 'admin123')
	await expect(page).toHaveURL(/\/admin$/)
	await page.getByRole('tab', { name: 'Cuentas y roles' }).click()
	await page.getByRole('button', { name: 'Nueva cuenta', exact: true }).click()
	await page.getByLabel('Usuario', { exact: true }).fill(username)
	await page.getByLabel('Nombre', { exact: true }).fill('Organizador de prueba')
	await page.getByLabel('Correo', { exact: true }).fill(username + '@example.com')
	await page.getByLabel('Contraseña inicial').fill(clave)
	await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click()
	await expect(page.getByRole('rowheader', { name: username, exact: true })).toBeVisible()
	expect((await loginApi(request, username, clave)).roles).toContain('ROLE_ORGANIZADOR')
	page.once('dialog', (dialog) => dialog.accept())
	await page
		.getByRole('row')
		.filter({ hasText: username })
		.getByRole('button', { name: 'Eliminar' })
		.click()
	await expect(page.getByRole('rowheader', { name: username, exact: true })).toHaveCount(0)
	expect(
		(
			await request.post(API + '/api/v1/auth/login', {
				data: { username, password: clave },
			})
		).status(),
	).toBe(401)
})

test('un JWT manipulado no gana permisos ni accede al microservicio directamente', async ({
	request,
}) => {
	const cuenta = await registrar(request)
	const partes = cuenta.token.split('.')
	const payload = JSON.parse(Buffer.from(partes[1], 'base64url').toString())
	payload.roles = ['ROLE_ADMIN']
	partes[1] = Buffer.from(JSON.stringify(payload)).toString('base64url')
	const headers = { Authorization: 'Bearer ' + partes.join('.') }
	expect((await request.get(API + '/api/v1/auth/users', { headers })).status()).toBe(401)
	// El puerto interno también valida la firma; no basta con saltarse el gateway.
	expect((await request.get('http://localhost:8099/api/v1/auth/users', { headers })).status()).toBe(
		401,
	)
})

test('ciclo individual completo: partida, resultado, corrección, perfil y anulación', async ({
	page,
	request,
}) => {
	const admin = await loginApi(request)
	const local = await registrar(request),
		visita = await registrar(request)
	const torneo = await crearTorneo(request, admin)
	for (const jugador of [local, visita]) {
		await jsonOk(
			await request.post(API + '/api/v1/registrations', {
				headers: cabeceras(jugador),
				data: inscripcion({ userId: jugador.userId }, torneo),
			}),
			201,
		)
	}
	await loginUI(page, 'admin', 'admin123')
	await expect(page).toHaveURL(/\/admin$/)
	await page.goto('/gestion/torneos/' + torneo.tournamentId)
	await page.getByLabel('Participante local', { exact: true }).selectOption(String(local.userId))
	await page.getByLabel('Participante visitante').selectOption(String(visita.userId))
	await page.getByLabel('Fecha de partida').fill('2099-12-20T20:00')
	await page.getByLabel('Ronda', { exact: true }).fill('Final')
	await page.getByRole('button', { name: 'Programar partida', exact: true }).click()
	await expect(page.getByText('Partida programada.', { exact: true })).toBeVisible()
	const formulario = page.getByRole('form', { name: /Resultado partida/ })
	await formulario.getByLabel('Marcador ' + local.username, { exact: true }).fill('3')
	await formulario.getByLabel('Marcador ' + visita.username, { exact: true }).fill('1')
	await formulario.getByRole('button', { name: 'Guardar resultado' }).click()
	await expect(page.getByText('Resultado guardado. Clasificación actualizada.')).toBeVisible()
	const obtenerRanking = async () =>
		jsonOk(await request.get(API + '/api/v1/rankings/tournament/' + torneo.tournamentId), 200)
	let tabla = await obtenerRanking()
	expect(tabla.find((r) => r.userId === local.userId).points).toBe(3)
	const partidas = await jsonOk(
		await request.get(API + '/api/v1/matches/tournament/' + torneo.tournamentId),
		200,
	)
	const resultado = await jsonOk(
		await request.get(API + '/api/v1/results/match/' + partidas[0].matchId),
		200,
	)
	const repetidas = await Promise.all(
		[1, 2].map(() =>
			request.put(API + '/api/v1/results/' + resultado.resultId, {
				headers: cabeceras(admin),
				data: { ...resultado, homeScore: 3, awayScore: 1 },
			}),
		),
	)
	expect(repetidas.map((r) => r.status())).toEqual([200, 200])
	expect((await obtenerRanking()).find((r) => r.userId === local.userId).points).toBe(3)
	// Guardar el mismo resultado otra vez conserva un solo partido y tres puntos.
	await formulario.getByRole('button', { name: 'Guardar resultado' }).click()
	await expect(page.getByText('Resultado guardado. Clasificación actualizada.')).toBeVisible()
	tabla = await obtenerRanking()
	expect(tabla.find((r) => r.userId === local.userId).matchesPlayed).toBe(1)
	await formulario.getByLabel('Marcador ' + local.username, { exact: true }).fill('0')
	await formulario.getByLabel('Marcador ' + visita.username, { exact: true }).fill('2')
	await formulario.getByRole('button', { name: 'Guardar resultado' }).click()
	await expect(page.getByText('Resultado guardado. Clasificación actualizada.')).toBeVisible()
	tabla = await obtenerRanking()
	expect(tabla.find((r) => r.userId === local.userId).points).toBe(0)
	expect(tabla.find((r) => r.userId === visita.userId).points).toBe(3)
	await mkdir('docs/ep3/capturas', { recursive: true })
	await capturar(page, { path: 'docs/ep3/capturas/competicion-individual.png', fullPage: true })
	// El detalle público debe mostrar nicknames, sin tratar al jugador como un equipo.
	await page.goto('/torneos/' + torneo.tournamentId)
	await expect(page.getByRole('rowheader', { name: visita.username, exact: true })).toBeVisible()
	await capturar(page, { path: 'docs/ep3/capturas/ranking-individual.png', fullPage: true })
	await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click()
	await loginUI(page, visita.username, clave)
	await expect(page).toHaveURL(/\/torneos$/)
	await page.goto('/perfil')
	await expect(page.getByRole('heading', { name: 'Mi perfil', exact: true })).toBeVisible()
	await expect(page.getByText(torneo.name, { exact: true })).toBeVisible()
	await capturar(page, { path: 'docs/ep3/capturas/perfil-individual.png', fullPage: true })
	await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click()
	await loginUI(page, 'admin', 'admin123')
	await expect(page).toHaveURL(/\/admin$/)
	await page.goto('/gestion/torneos/' + torneo.tournamentId)
	page.once('dialog', (dialog) => dialog.accept())
	await page.getByRole('button', { name: 'Anular resultado' }).click()
	await expect(page.getByText('Resultado anulado. Puntos retirados.')).toBeVisible()
	tabla = await obtenerRanking()
	expect(tabla.every((r) => r.points === 0 && r.matchesPlayed === 0)).toBe(true)
})

test('capturas actuales para el manual y la integración', async ({ page }) => {
	await mkdir('docs/ep3/capturas', { recursive: true })
	for (const [ruta, archivo, titulo] of [
		['/login', 'login', 'Iniciar sesión'],
		['/registro', 'registro', 'Crear cuenta de jugador'],
		['/torneos', 'catalogo', 'Explorar torneos'],
	]) {
		await page.goto(ruta)
		await expect(page.getByRole('heading', { name: titulo, exact: true })).toBeVisible()
		if (archivo === 'catalogo')
			await expect(page.getByText('Liga Master LoL 2027', { exact: true })).toBeVisible()
		await capturar(page, { path: 'docs/ep3/capturas/' + archivo + '.png', fullPage: true })
	}
	await loginUI(page, 'jugador1', 'jugador123')
	await expect(page).toHaveURL(/\/torneos$/)
	for (const [ruta, archivo, titulo] of [
		['/equipos', 'equipos', 'Mis equipos'],
		['/inscripcion', 'inscripcion', 'Inscripción a torneo'],
		['/perfil', 'perfil', 'Mi perfil'],
		['/admin', 'acceso-denegado', 'Acceso denegado'],
	]) {
		await page.goto(ruta)
		await expect(page.getByRole('heading', { name: titulo, exact: true })).toBeVisible()
		await expect(page.locator('[aria-busy="true"]')).toHaveCount(0)
		await capturar(page, { path: 'docs/ep3/capturas/' + archivo + '.png', fullPage: true })
	}
	await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click()
	await loginUI(page, 'organizador1', 'org123')
	await expect(page).toHaveURL(/\/gestion\/torneos$/)
	await expect(page.getByText('Liga Master LoL 2027', { exact: true })).toBeVisible()
	await capturar(page, { path: 'docs/ep3/capturas/organizador.png', fullPage: true })
	await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click()
	await loginUI(page, 'admin', 'admin123')
	await page.getByRole('link', { name: 'Panel admin', exact: true }).click()
	await expect(page).toHaveURL(/\/admin$/)
	await expect(page.getByText('Liga Master LoL 2027', { exact: true })).toBeVisible()
	await capturar(page, { path: 'docs/ep3/capturas/admin.png', fullPage: true })
})
