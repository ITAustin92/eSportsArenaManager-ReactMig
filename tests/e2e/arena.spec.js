import { test, expect } from '@playwright/test'
const jugador = { correo: 'felipe@arena.example', clave: 'Jugador123!' }
const admin = { correo: 'admin@arena.example', clave: 'Admin123!' }

test('filtra el cierre por el mismo día mostrado en Santiago', async ({ page }) => {
  await page.goto('/torneos')
  await expect(page.locator('.tarjeta-torneo')).toHaveCount(5)
  const nombre = await page.evaluate(() => {
    const datos = JSON.parse(localStorage.getItem('arena-ep2-datos-v1'))
    datos.torneos[0].cierreISO = '2030-01-02T01:00:00Z'
    datos.torneos[0].fechaInicio = '2030-01-03T01:00:00Z'
    localStorage.setItem('arena-ep2-datos-v1', JSON.stringify(datos))
    return datos.torneos[0].nombre
  })
  await page.reload()
  await page.getByLabel('Cierre desde', { exact: true }).fill('2030-01-01')
  await page.getByLabel('Cierre hasta', { exact: true }).fill('2030-01-01')
  await expect(page.locator('.tarjeta-torneo')).toHaveCount(1)
  await expect(page.locator('.tarjeta-torneo')).toContainText(nombre)
  await page.getByLabel('Cierre desde', { exact: true }).fill('2030-01-02')
  await page.getByLabel('Cierre hasta', { exact: true }).fill('2030-01-02')
  await expect(page.locator('.tarjeta-torneo')).toHaveCount(0)
})

test('recupera datos incompletos conservando un respaldo y permite abrir el perfil', async ({ page }) => {
  await entrar(page, jugador)
  const original = await page.evaluate(() => {
    const datos = JSON.parse(localStorage.getItem('arena-ep2-datos-v1'))
    datos.jugadores = [null]
    const texto = JSON.stringify(datos)
    localStorage.setItem('arena-ep2-datos-v1', texto)
    return texto
  })
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Perfil de jugador', exact: true })).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('arena-ep2-datos-v1-respaldo-invalido'))).toBe(original)
  await expect(page.getByText('felipe@arena.example', { exact: true })).toBeVisible()
})

async function entrar(page, usuario) {
  await page.goto('/login')
  await page.getByLabel('Correo', { exact: true }).fill(usuario.correo)
  await page.getByLabel('Clave', { exact: true }).fill(usuario.clave)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).not.toHaveURL(/\/login$/)
}
async function verVista(page, ruta) {
  await page.goto(ruta)
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.getByRole('heading', { name: 'Cargando la arena' })).toHaveCount(0)
}
test.beforeEach(async ({ page }) => {
  // Las pruebas no dependen de YouTube ni envían solicitudes de negocio.
  await page.route('https://www.youtube-nocookie.com/**', (route) => route.abort())
})

test('permisos por URL, retorno tras login, recarga y cierre de sesión', async ({ page }) => {
  await page.goto('/equipos')
  await expect(page).toHaveURL(/\/login$/)
  await page.getByLabel('Correo', { exact: true }).fill(jugador.correo)
  await page.getByLabel('Clave', { exact: true }).fill(jugador.clave)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/equipos$/)
  await page.reload(); await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gestión de equipos')
  for (const ruta of ['/admin', '/admin/equipos']) { await page.goto(ruta); await expect(page.getByRole('heading', { level: 1 })).toContainText('403') }
  await page.getByRole('button', { name: 'Cerrar sesión' }).click()
  await expect(page).toHaveURL(/\/login$/)
  await entrar(page, admin)
  for (const ruta of ['/perfil', '/inscripcion', '/equipos']) { await page.goto(ruta); await expect(page.getByRole('heading', { level: 1 })).toContainText('403') }
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Perfil', exact: true })).toHaveCount(0)
  await page.goto('/torneos/inexistente'); await expect(page).toHaveURL(/\/torneos$/)
})

test('CRUD completo de juegos y torneos desde administración', async ({ page }) => {
  await entrar(page, admin)
  await page.getByLabel('Nombre del juego', { exact: true }).fill('Juego E2E')
  await page.getByRole('button', { name: 'Guardar juego', exact: true }).click()
  await page.getByRole('button', { name: 'Editar Juego E2E', exact: true }).click()
  await page.getByLabel('Nombre del juego', { exact: true }).fill('Juego E2E editado')
  await page.getByRole('button', { name: 'Guardar juego', exact: true }).click()
  const opciones = page.locator('#torneo-juego option')
  const juegoId = await opciones.filter({ hasText: 'Juego E2E editado' }).getAttribute('value')
  await page.getByLabel('Nombre del torneo', { exact: true }).fill('Copa E2E')
  await page.getByLabel('Juego del torneo', { exact: true }).selectOption(juegoId)
  await page.getByLabel('Cupo máximo').fill('8')
  const cierre = new Date(Date.now() + 45 * 86400000).toISOString()
  const inicio = new Date(Date.now() + 46 * 86400000).toISOString()
  await page.getByLabel('Cierre de inscripciones (ISO)').fill(cierre)
  await page.getByLabel('Inicio del torneo (ISO)').fill(cierre)
  await page.getByRole('button', { name: 'Guardar torneo', exact: true }).click()
  await expect(page.locator('#torneo-inicio-error')).toContainText('posterior')
  await page.getByLabel('Inicio del torneo (ISO)').fill(inicio)
  await page.getByRole('button', { name: 'Guardar torneo', exact: true }).click()
  await page.reload()
  await page.getByRole('button', { name: 'Editar Copa E2E', exact: true }).click()
  await page.getByLabel('Nombre del torneo', { exact: true }).fill('Copa E2E editada')
  await page.getByRole('button', { name: 'Guardar torneo', exact: true }).click()
  await page.getByRole('button', { name: 'Eliminar Juego E2E editado', exact: true }).click()
  await page.getByRole('button', { name: 'Confirmar eliminación', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('asociados')
  await page.getByRole('button', { name: 'Cancelar eliminación', exact: true }).click()
  for (const nombre of ['Copa E2E editada', 'Juego E2E editado']) {
    await page.getByRole('button', { name: 'Eliminar ' + nombre, exact: true }).click()
    await page.getByRole('button', { name: 'Confirmar eliminación', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Editar ' + nombre, exact: true })).toHaveCount(0)
  }
})

test('inscripción válida, bloqueo incompleto, edición, cancelación y perfil persistente', async ({ page }) => {
  await entrar(page, jugador)
  await page.goto('/inscripcion?torneo=copa-latam-valorant')
  await page.getByLabel('Inscribirse como').selectOption('equipo')
  await page.getByLabel('Equipo', { exact: true }).selectOption('e-incompleto')
  await expect(page.getByRole('button', { name: 'Confirmar inscripción' })).toBeDisabled()
  await page.screenshot({ path: 'docs/capturas/validacion-equipo-incompleto.png' })
  await page.getByLabel('Equipo', { exact: true }).selectOption('e-demo')
  await page.getByRole('button', { name: 'Confirmar inscripción' }).click()
  await expect(page.getByRole('heading', { name: '¡Inscripción confirmada!' })).toBeVisible()
  await page.goto('/inscripcion?torneo=copa-latam-valorant')
  await page.getByLabel('Inscribirse como').selectOption('equipo')
  await page.getByLabel('Equipo', { exact: true }).selectOption('e-demo')
  await expect(page.getByRole('button', { name: 'Confirmar inscripción' })).toBeDisabled()
  await expect(page.getByText('Este participante ya está inscrito.')).toBeVisible()
  await page.goto('/perfil')
  await page.getByRole('button', { name: 'Editar contacto', exact: true }).click()
  await page.getByLabel('Nuevo correo de contacto').fill('nuevo@arena.example')
  await page.getByRole('button', { name: 'Guardar contacto', exact: true }).click()
  await expect(page.getByText('Contacto actualizado.')).toBeVisible()
  await page.getByRole('button', { name: 'Cancelar inscripción', exact: true }).click()
  await page.getByRole('button', { name: 'Sí, cancelar inscripción', exact: true }).click()
  await expect(page.getByText('No tienes inscripciones.')).toBeVisible()
  await page.getByLabel('Nuevo apodo').fill('ArenaE2E')
  await page.getByRole('button', { name: 'Guardar apodo', exact: true }).click()
  await page.reload(); await expect(page.getByRole('heading', { name: 'ArenaE2E', exact: true })).toBeVisible()
})

test('creación, edición y eliminación de equipo con integrantes controlados', async ({ page }) => {
  await entrar(page, jugador); await page.goto('/equipos')
  await page.getByLabel('Nombre del equipo', { exact: true }).fill('Escuadra E2E')
  await page.getByLabel('Juego principal').selectOption('valorant')
  for (const id of ['p-felipe', 'p-matias', 'p-juan', 'p-valentina', 'p-pedro']) {
    await page.getByLabel('Jugador para agregar').selectOption(id)
    await page.getByRole('button', { name: 'Agregar integrante', exact: true }).click()
  }
  await page.getByLabel('Clave del equipo', { exact: true }).fill('Clave123!')
  await page.getByLabel('Confirmar clave', { exact: true }).fill('Clave123!')
  await page.getByRole('button', { name: 'Guardar equipo', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Escuadra E2E', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Editar Escuadra E2E', exact: true }).click()
  await page.getByLabel('Nombre del equipo', { exact: true }).fill('Escuadra editada')
  await page.getByLabel('Clave del equipo', { exact: true }).fill('Clave123!')
  await page.getByLabel('Confirmar clave', { exact: true }).fill('Clave123!')
  await page.getByRole('button', { name: 'Guardar equipo', exact: true }).click()
  await page.getByRole('button', { name: 'Eliminar Escuadra editada', exact: true }).click()
  await page.getByRole('button', { name: 'Sí, eliminar equipo', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Escuadra editada', exact: true })).toHaveCount(0)
})

for (const ancho of [360, 768, 1280]) {
  test('vistas y navegación responsivas a ' + ancho + ' px', async ({ page }) => {
    await page.setViewportSize({ width: ancho, height: 900 })
    const errores = []
    page.on('pageerror', (error) => errores.push(error.message))
    const capturar = async (ruta, nombre) => {
      await verVista(page, ruta)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
      await page.screenshot({ path: 'docs/capturas/' + nombre + '-' + ancho + '.png' })
    }
    for (const [ruta, nombre] of [['/', 'inicio'], ['/torneos', 'catalogo'], ['/torneos/copa-latam-valorant', 'detalle'], ['/login', 'login']]) await capturar(ruta, nombre)
    if (ancho === 360) { await page.getByRole('button', { name: 'Abrir menú' }).click(); await expect(page.getByRole('link', { name: 'Torneos', exact: true })).toBeVisible() }
    await entrar(page, jugador)
    for (const [ruta, nombre] of [['/perfil', 'perfil'], ['/equipos', 'equipos'], ['/inscripcion?torneo=copa-latam-valorant', 'inscripcion']]) await capturar(ruta, nombre)
    await page.evaluate(() => sessionStorage.removeItem('arena-ep2-sesion-v1'))
    await entrar(page, admin)
    for (const [ruta, nombre] of [['/admin', 'administracion'], ['/admin/equipos', 'equipos-registrados']]) await capturar(ruta, nombre)
    expect(errores).toEqual([])
  })
}
