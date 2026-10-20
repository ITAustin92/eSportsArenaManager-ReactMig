import PanelAdmin from './PanelAdmin'
import { obtenerDatos } from '../../datos/datos'
import { fixture } from '../../pruebas/fixtures'
import { prepararDOM, escribir, enviar, clicEn } from '../../pruebas/dom'
import { montarVista, buscarBoton, sesionAdmin } from '../../pruebas/arena'

describe('operaciones del panel de administración', () => {
	let dom, f, storage
	beforeEach(() => {
		dom = prepararDOM()
		f = fixture(new Date())
	})
	afterEach(() => dom.limpiar())
	const montar = () => {
		storage = montarVista(dom, PanelAdmin, { datos: f.datos, sesion: sesionAdmin })
	}
	const clic = (texto) => clicEn(buscarBoton(dom.contenedor, texto))
	const campo = (id, valor) => escribir(dom.contenedor.querySelector('#' + id), valor)
	const guardar = (id) => enviar(dom.contenedor.querySelector('#' + id).closest('form'))

	it('crea un torneo que aparece en la lista y reinicia su formulario', () => {
		montar()
		campo('torneo-nombre', 'Copa nueva')
		campo('torneo-juego', f.juego.id)
		campo('torneo-cierre', f.torneo.cierreISO)
		campo('torneo-inicio', f.torneo.fechaInicio)
		guardar('torneo-nombre')
		expect(obtenerDatos().torneos.some((torneo) => torneo.nombre === 'Copa nueva')).toBeTrue()
		expect(dom.contenedor.querySelector('#torneo-nombre').value).toBe('')
		expect(dom.contenedor.textContent).toContain('Torneo guardado.')
		expect(
			[...dom.contenedor.querySelectorAll('h3')].some(
				(titulo) => titulo.textContent === 'Copa nueva',
			),
		).toBeTrue()
	})

	it('actualiza un torneo existente conservando sus inscritos', () => {
		montar()
		clic('Editar ' + f.torneo.nombre)
		campo('torneo-nombre', 'Copa renombrada')
		guardar('torneo-nombre')
		const actualizado = obtenerDatos().torneos.find((torneo) => torneo.id === f.torneo.id)
		expect(actualizado.nombre).toBe('Copa renombrada')
		expect(actualizado.inscritos).toEqual(f.torneo.inscritos)
		expect(dom.contenedor.textContent).toContain('Copa renombrada')
	})

	it('descarta la edición de torneo sin persistir el borrador', () => {
		montar()
		const antes = obtenerDatos()
		clic('Editar ' + f.torneo.nombre)
		campo('torneo-nombre', 'Descartado')
		clic('Cancelar edición de torneo')
		expect(obtenerDatos()).toEqual(antes)
		expect(dom.contenedor.querySelector('#torneo-nombre').value).toBe('')
	})

	it('actualiza un juego referenciado conservando sus reglas', () => {
		montar()
		clic('Editar ' + f.juego.nombre)
		campo('juego-nombre', 'Juego renombrado')
		guardar('juego-nombre')
		const actualizado = obtenerDatos().juegos.find((juego) => juego.id === f.juego.id)
		expect(actualizado.nombre).toBe('Juego renombrado')
		expect(actualizado.jugadoresPorEquipo).toBe(f.juego.jugadoresPorEquipo)
		expect(dom.contenedor.textContent).toContain('Juego guardado.')
	})

	it('descarta la edición de juego sin persistir el borrador', () => {
		montar()
		clic('Editar ' + f.juego.nombre)
		campo('juego-nombre', 'Descartado')
		clic('Cancelar edición de juego')
		expect(obtenerDatos().juegos.find((juego) => juego.id === f.juego.id).nombre).toBe(
			f.juego.nombre,
		)
		expect(dom.contenedor.querySelector('#juego-nombre').value).toBe('')
	})

	it('conserva el registro si se cancela la confirmación de eliminación', () => {
		montar()
		const antes = obtenerDatos()
		clic('Eliminar ' + f.juego.nombre)
		clic('Cancelar eliminación')
		expect(dom.contenedor.querySelector('[aria-label="Confirmar eliminación"]')).toBeNull()
		expect(obtenerDatos()).toEqual(antes)
	})

	it('elimina un torneo abierto sin inscritos después de confirmar', () => {
		f.datos.torneos.push({
			...f.torneo,
			id: 'torneo-vacio',
			nombre: 'Copa sin inscritos',
			inscritos: [],
			partidas: [],
			ranking: [],
			premios: [],
		})
		montar()
		clic('Eliminar Copa sin inscritos')
		clic('Confirmar eliminación')
		expect(obtenerDatos().torneos.some((torneo) => torneo.id === 'torneo-vacio')).toBeFalse()
		expect(dom.contenedor.textContent).toContain('Registro eliminado.')
	})

	it('informa el bloqueo al eliminar un juego con torneos asociados', () => {
		montar()
		clic('Eliminar ' + f.juego.nombre)
		clic('Confirmar eliminación')
		expect(dom.contenedor.textContent).toContain('asociados')
		expect(obtenerDatos().juegos.some((juego) => juego.id === f.juego.id)).toBeTrue()
	})

	it('explica la ausencia de juegos y torneos', () => {
		f.datos.juegos = []
		f.datos.torneos = []
		f.datos.equipos = []
		montar()
		expect(dom.contenedor.textContent).toContain('No hay torneos.')
		expect(dom.contenedor.textContent).toContain('No hay juegos.')
	})

	it('no publica un torneo si falla la persistencia', () => {
		montar()
		const antes = obtenerDatos()
		spyOn(storage, 'setItem').and.throwError('Sin espacio')
		campo('torneo-nombre', 'Copa pendiente')
		campo('torneo-juego', f.juego.id)
		campo('torneo-cierre', f.torneo.cierreISO)
		campo('torneo-inicio', f.torneo.fechaInicio)
		guardar('torneo-nombre')
		expect(dom.contenedor.textContent).toContain('No se pudo guardar.')
		expect(obtenerDatos()).toEqual(antes)
	})
})
