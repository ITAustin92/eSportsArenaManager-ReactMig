import GestionEquipos from './GestionEquipos'
import { obtenerDatos, claveDatos } from '../../datos/datos'
import { fixture } from '../../pruebas/fixtures'
import { prepararDOM, escribir, enviar, clicEn } from '../../pruebas/dom'
import { montarVista, buscarBoton } from '../../pruebas/arena'

describe('gestión de equipos desde la vista', () => {
	let dom, f, storage
	beforeEach(() => {
		dom = prepararDOM()
		f = fixture(new Date())
	})
	afterEach(() => dom.limpiar())
	const montar = () => {
		storage = montarVista(dom, GestionEquipos, { datos: f.datos })
	}
	const clic = (texto) => clicEn(buscarBoton(dom.contenedor, texto))
	const campo = (id, valor) => escribir(dom.contenedor.querySelector('#equipo-' + id), valor)
	const guardar = () => {
		campo('clave', 'Clave123!')
		campo('confirmar', 'Clave123!')
		enviar(dom.contenedor.querySelector('form'))
	}

	it('crea un equipo y actualiza su lista y el almacenamiento', () => {
		montar()
		campo('nombre', 'Nueva escuadra')
		campo('juego', f.juego.id)
		for (const miembro of f.equipo.integrantes) {
			campo('nuevo', miembro.id)
			clic('Agregar integrante')
		}
		guardar()
		expect(
			[...dom.contenedor.querySelectorAll('h3')].some(
				(titulo) => titulo.textContent === 'Nueva escuadra',
			),
		).toBeTrue()
		const creado = JSON.parse(storage.getItem(claveDatos)).equipos.find(
			(equipo) => equipo.nombre === 'Nueva escuadra',
		)
		expect(creado.integrantes.length).toBe(5)
		expect(creado.clave).toBeUndefined()
		expect(dom.contenedor.querySelector('#equipo-nombre').value).toBe('')
		expect(dom.contenedor.textContent).toContain('Equipo guardado.')
	})

	it('edita su equipo sin duplicarlo y reinicia el formulario al guardar', () => {
		montar()
		const cantidad = obtenerDatos().equipos.length
		clic('Editar Arena Demo')
		campo('nombre', 'Arena renovada')
		guardar()
		expect(obtenerDatos().equipos.length).toBe(cantidad)
		expect(obtenerDatos().equipos.find((equipo) => equipo.id === 'e-demo').nombre).toBe(
			'Arena renovada',
		)
		expect(dom.contenedor.textContent).toContain('Arena renovada')
		expect(dom.contenedor.querySelector('#equipo-clave').value).toBe('')
		expect(dom.contenedor.querySelector('form h2').textContent).toBe('Crear nuevo equipo')
	})

	it('descarta el borrador al cancelar una edición', () => {
		montar()
		clic('Editar Arena Demo')
		campo('nombre', 'Cambio descartado')
		clic('Cancelar edición')
		expect(obtenerDatos().equipos.find((equipo) => equipo.id === 'e-demo').nombre).toBe(
			'Arena Demo',
		)
		expect(dom.contenedor.querySelector('#equipo-nombre').value).toBe('')
	})

	it('conserva el equipo si vuelve atrás en la confirmación de eliminación', () => {
		montar()
		const antes = storage.getItem(claveDatos)
		clic('Eliminar Arena Demo')
		clic('Volver')
		expect(storage.getItem(claveDatos)).toBe(antes)
		expect(dom.contenedor.querySelector('.confirmacion')).toBeNull()
	})

	it('elimina solo después de confirmar y retira la pertenencia del jugador', () => {
		montar()
		clic('Eliminar Arena Demo')
		expect(obtenerDatos().equipos.some((equipo) => equipo.id === 'e-demo')).toBeTrue()
		clic('Sí, eliminar equipo')
		expect(obtenerDatos().equipos.some((equipo) => equipo.id === 'e-demo')).toBeFalse()
		expect(
			obtenerDatos().jugadores.find((jugador) => jugador.id === f.jugador.id).equipos,
		).not.toContain('e-demo')
		expect(dom.contenedor.textContent).toContain('Equipo eliminado.')
	})

	it('explica por qué un equipo inscrito no se puede editar', () => {
		f.equipo.torneosIds.push(f.torneo.id)
		montar()
		clic('Editar Arena Demo')
		campo('nombre', 'Cambio bloqueado')
		guardar()
		expect(dom.contenedor.textContent).toContain('La plantilla queda bloqueada')
		expect(obtenerDatos().equipos.find((equipo) => equipo.id === 'e-demo').nombre).toBe(
			'Arena Demo',
		)
	})

	it('explica por qué un equipo inscrito no se puede eliminar', () => {
		f.equipo.torneosIds.push(f.torneo.id)
		montar()
		clic('Eliminar Arena Demo')
		clic('Sí, eliminar equipo')
		expect(dom.contenedor.textContent).toContain('sin inscripciones')
		expect(obtenerDatos().equipos.some((equipo) => equipo.id === 'e-demo')).toBeTrue()
	})

	it('conserva el equipo y el borrador si falla la persistencia', () => {
		montar()
		spyOn(storage, 'setItem').and.throwError('Sin espacio')
		clic('Editar Arena Demo')
		campo('nombre', 'Nombre pendiente')
		guardar()
		expect(dom.contenedor.textContent).toContain('No se pudo guardar.')
		expect(dom.contenedor.querySelector('#equipo-nombre').value).toBe('Nombre pendiente')
		expect(obtenerDatos().equipos.find((equipo) => equipo.id === 'e-demo').nombre).toBe(
			'Arena Demo',
		)
	})

	it('muestra un estado vacío y no ofrece editar equipos ajenos', () => {
		f.datos.equipos = f.datos.equipos.filter((equipo) => equipo.capitanId !== f.jugador.id)
		montar()
		expect(dom.contenedor.textContent).toContain('Aún no has creado equipos.')
		expect(dom.contenedor.querySelector('article')).toBeNull()
	})
})
