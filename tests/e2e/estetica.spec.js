import { test, expect } from '@playwright/test'

async function entrar(page) {
	await page.goto('/login')
	await page.getByLabel('Correo', { exact: true }).fill('felipe@arena.example')
	await page.getByLabel('Clave', { exact: true }).fill('Jugador123!')
	await page.getByRole('button', { name: 'Entrar', exact: true }).click()
	await expect(page).toHaveURL(/\/perfil$/)
}
test.beforeEach(async ({ page }) => {
	await page.route('https://www.youtube-nocookie.com/**', (route) => route.abort())
})

test('perfil centrado, selector accesible y foto persistente sin control blanco', async ({
	page,
}) => {
	await page.setViewportSize({ width: 1280, height: 900 })
	await entrar(page)
	const tarjeta = page.locator('.perfil-identidad')
	const avatar = page.locator('.avatar-retrato')
	const cajaTarjeta = await tarjeta.boundingBox()
	const cajaAvatar = await avatar.boundingBox()
	expect(cajaAvatar.width).toBe(116)
	expect(cajaAvatar.height).toBe(116)
	expect(Math.abs(cajaAvatar.x + 58 - cajaTarjeta.x - cajaTarjeta.width / 2)).toBeLessThan(1)
	await expect(page.locator('#perfil-apodo')).toHaveAttribute('autocomplete', 'nickname')
	await expect(page.locator('.perfil-edicion .boton')).toHaveCSS('font-size', '16px')
	await page.screenshot({ path: 'docs/capturas/perfil-restaurado-1280.png', fullPage: true })
	const campoFoto = page.getByLabel('Cambiar foto', { exact: true })
	await expect(campoFoto).toHaveCSS('clip-path', 'inset(50%)')
	await page.locator('#perfil-apodo').focus()
	await page.keyboard.press('Shift+Tab')
	await expect(campoFoto).toBeFocused()
	await expect(page.locator('.avatar-cambiar')).toHaveCSS('outline-style', 'solid')
	const selectorTeclado = page.waitForEvent('filechooser')
	await campoFoto.press('Enter')
	await (await selectorTeclado).setFiles([])
	const selector = page.waitForEvent('filechooser')
	await page.locator('label[for="avatar-archivo"]').click()
	await (await selector).setFiles('public/img/sf6.jpg')
	await expect(page.getByRole('status')).toHaveText('Foto actualizada.')
	await expect(avatar.locator('img')).toHaveAttribute('src', /^data:image\/jpeg/)
	await page.reload()
	await expect(avatar.locator('img')).toHaveAttribute('src', /^data:image\/jpeg/)
	await campoFoto.setInputFiles({
		name: 'archivo.txt',
		mimeType: 'text/plain',
		buffer: Buffer.from('no es una imagen'),
	})
	await expect(page.locator('#avatar-error')).toBeVisible()
	await expect(campoFoto).toHaveAttribute('aria-invalid', 'true')
})

test('menú horizontal desde 576 px y hamburguesa solo en móviles estrechos', async ({ page }) => {
	await entrar(page)
	for (const width of [360, 575, 576, 768, 1280]) {
		await page.setViewportSize({ width, height: 900 })
		const menu = page.getByRole('button', { name: 'Abrir menú' })
		if (width < 576) {
			await expect(menu).toBeVisible()
			await menu.click()
			await expect(
				page.getByRole('navigation').getByRole('link', { name: 'Perfil', exact: true }),
			).toBeVisible()
			await menu.click()
		} else {
			await expect(menu).toBeHidden()
			await expect(page.locator('.navbar-nav')).toHaveCSS('flex-direction', 'row')
			await expect(
				page.getByRole('navigation').getByRole('link', { name: 'Perfil', exact: true }),
			).toBeVisible()
		}
		await expect(page.locator('nav a[aria-current="page"]')).toHaveCount(1)
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
	}
})

test('rondas accesibles con mouse, teclado y selector móvil sincronizados', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 })
	await page.goto('/torneos/copa-latam-valorant')
	const final = page.getByRole('tab', { name: 'Final', exact: true })
	await final.click()
	await expect(final).toHaveAttribute('aria-selected', 'true')
	await expect(page.getByRole('tabpanel')).toContainText('Participante por definir')
	await page.screenshot({ path: 'docs/capturas/detalle-restaurado-1280.png', fullPage: true })
	await final.press('Home')
	const primera = page.getByRole('tab').first()
	await expect(primera).toBeFocused()
	await expect(primera).toHaveAttribute('aria-selected', 'true')
	await page.setViewportSize({ width: 360, height: 900 })
	await page.getByLabel('Ronda visible').selectOption('Final')
	await expect(page.getByRole('tabpanel')).toContainText('Participante por definir')
	await page.setViewportSize({ width: 576, height: 900 })
	await expect(final).toBeVisible()
	await expect(final).toHaveAttribute('aria-selected', 'true')
})

test('imágenes EP1 visibles, cupos accesibles y filtros inmediatos', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 })
	await page.goto('/torneos')
	await expect(page.locator('.tarjeta-torneo')).toHaveCount(5)
	for (const archivo of ['lol.png', 'rocket.png', 'sf6.jpg', 'valorant.jpg']) {
		const imagen = page.locator('img[src="/img/' + archivo + '"]').first()
		await imagen.scrollIntoViewIfNeeded()
		await expect
			.poll(() => imagen.evaluate((img) => img.complete && img.naturalWidth > 0))
			.toBe(true)
	}
	await expect(page.getByRole('progressbar')).toHaveCount(5)
	await page.getByLabel('Buscar torneo').fill('Valorant')
	await expect(page.locator('.tarjeta-torneo')).toHaveCount(1)
	await expect(page.getByRole('status')).toContainText('1 de 5')
	await page.getByLabel('Buscar torneo').fill('sin coincidencias')
	await expect(page.getByRole('heading', { name: 'No se encontraron torneos' })).toBeVisible()
	await page.goto('/')
	const banner = page.locator('img[src="/img/valorant-cierre.jpg"]')
	await expect.poll(() => banner.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true)
	await page.screenshot({ path: 'docs/capturas/inicio-restaurado-1280.png', fullPage: true })
})

test('tarjetas con elevación y respeto de movimiento reducido', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 })
	await page.goto('/torneos')
	const tarjeta = page.locator('.tarjeta-torneo').first()
	await tarjeta.hover()
	await expect(tarjeta).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -3)')
	await page.emulateMedia({ reducedMotion: 'reduce' })
	await expect(tarjeta).toHaveCSS('transform', 'none')
	await expect(tarjeta).toHaveCSS('transition-duration', '0s, 0s, 0s')
	const boton = tarjeta.getByRole('link', { name: 'Ver detalles' })
	await boton.focus()
	await expect(boton).toHaveCSS('outline-style', 'solid')
	await expect(boton).toHaveCSS('font-size', '16px')
})
