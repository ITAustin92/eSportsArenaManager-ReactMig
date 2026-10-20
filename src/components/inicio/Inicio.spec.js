import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { act } from 'react'
import Inicio from './Inicio'
import TorneosDestacados from './TorneosDestacados'
import AuthProvider from '../auth/AuthProvider'
import { fixture } from '../../pruebas/fixtures'
import { prepararDOM, clicEn } from '../../pruebas/dom'

describe('inicio y torneos destacados', () => {
	let dom, datos, reloj
	beforeEach(() => {
		dom = prepararDOM()
		datos = fixture().datos
		reloj = false
	})
	afterEach(() => {
		dom.limpiar()
		if (reloj) {
			jasmine.clock().uninstall()
		}
	})

	// El hero incluye la navegación, que consume la sesión igual que en la aplicación.
	const renderizar = (contenido) =>
		dom.renderizar(
			<MemoryRouter>
				<AuthProvider>{contenido}</AuthProvider>
			</MemoryRouter>,
		)
	const montar = () => renderizar(<Inicio datos={datos} />)

	it('destaca abiertos y en curso, excluyendo los finalizados', () => {
		montar()
		const nombres = [...dom.contenedor.querySelectorAll('.tarjeta-torneo h3')].map(
			(nodo) => nodo.textContent,
		)
		expect(nombres).toEqual(
			datos.torneos
				.filter((torneo) => torneo.estado !== 'Finalizado')
				.map((torneo) => torneo.nombre),
		)
		expect(dom.contenedor.querySelectorAll('h1').length).toBe(1)
		expect(dom.contenedor.querySelector('iframe').title).toBeTruthy()
	})

	it('ofrece inscripción al torneo con el cierre abierto más próximo sin alterar los datos', () => {
		const base = datos.torneos.find((torneo) => torneo.estado === 'Abierto')
		datos.torneos = [
			{ ...base, id: 'tarde', nombre: 'Cierre posterior', cierreISO: '2030-06-20T12:00:00Z' },
			{ ...base, id: 'pronto', nombre: 'Cierre próximo', cierreISO: '2030-06-10T12:00:00Z' },
		]
		const original = structuredClone(datos.torneos)
		renderizar(
			<Routes>
				<Route path="/" element={<Inicio datos={datos} />} />
				<Route path="/inscripcion" element={<p>Formulario de inscripción</p>} />
			</Routes>,
		)
		const enlace = dom.contenedor.querySelector('.inicio-banner a')
		expect(enlace.getAttribute('href')).toBe('/inscripcion?torneo=pronto')
		expect(dom.contenedor.querySelector('.inicio-banner h2').textContent).toBe('Cierre próximo')
		expect(datos.torneos).toEqual(original)
		clicEn(enlace)
		expect(dom.contenedor.textContent).toBe('Formulario de inscripción')
	})

	it('permite explorar el catálogo desde la portada', () => {
		renderizar(
			<Routes>
				<Route path="/" element={<Inicio datos={datos} />} />
				<Route path="/torneos" element={<p>Catálogo público</p>} />
			</Routes>,
		)
		clicEn(dom.contenedor.querySelector('.hero-acciones a[href="/torneos"]'))
		expect(dom.contenedor.textContent).toBe('Catálogo público')
	})

	it('oculta el próximo cierre cuando no hay torneos abiertos', () => {
		datos.torneos = datos.torneos.filter((torneo) => torneo.estado === 'En Curso')
		montar()
		expect(dom.contenedor.querySelector('.inicio-banner')).toBeNull()
		expect(dom.contenedor.querySelectorAll('.tarjeta-torneo').length).toBe(datos.torneos.length)
	})

	it('explica la ausencia de destacados sin dejar tarjetas vacías', () => {
		dom.renderizar(
			<MemoryRouter>
				<TorneosDestacados torneos={[]} juegos={datos.juegos} />
			</MemoryRouter>,
		)
		expect(dom.contenedor.textContent).toContain('No hay torneos destacados.')
		expect(dom.contenedor.textContent).toContain('0 competencias')
		expect(dom.contenedor.querySelector('.tarjeta-torneo')).toBeNull()
	})

	it('ordena los cierres por instante real aunque tengan zonas horarias diferentes', () => {
		const base = datos.torneos[0]
		datos.torneos = [
			{
				...base,
				id: 'posterior',
				nombre: 'Posterior',
				estado: 'Abierto',
				cierreISO: '2099-06-10T00:00:00-03:00',
			},
			{
				...base,
				id: 'anterior',
				nombre: 'Anterior',
				estado: 'Abierto',
				cierreISO: '2099-06-10T01:00:00Z',
			},
		]
		montar()
		expect(dom.contenedor.querySelector('.inicio-banner h2').textContent).toBe('Anterior')
	})

	it('no anuncia como próximo un torneo vencido ni uno sin cupos', () => {
		const base = datos.torneos[0]
		datos.torneos = [
			{ ...base, id: 'vencido', estado: 'Abierto', cierreISO: '2000-01-01T00:00:00Z' },
			{
				...base,
				id: 'lleno',
				estado: 'Abierto',
				cierreISO: '2099-01-01T00:00:00Z',
				cupoMax: base.inscritos.length,
			},
		]
		montar()
		expect(dom.contenedor.querySelector('.inicio-banner')).toBeNull()
	})

	it('retira el próximo cierre cuando vence con la página abierta', () => {
		jasmine.clock().install()
		reloj = true
		jasmine.clock().mockDate(new Date('2030-01-01T12:00:00Z'))
		datos.torneos = [{ ...datos.torneos[0], estado: 'Abierto', cierreISO: '2030-01-01T12:00:01Z' }]
		montar()
		expect(dom.contenedor.querySelector('.inicio-banner')).not.toBeNull()
		act(() => jasmine.clock().tick(2000))
		expect(dom.contenedor.querySelector('.inicio-banner')).toBeNull()
	})
})
