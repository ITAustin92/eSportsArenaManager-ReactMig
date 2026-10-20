import FormEquipo from './FormEquipo'
import { fixture } from '../../pruebas/fixtures'
import { prepararDOM, escribir, enviar, clicEn } from '../../pruebas/dom'
import { buscarBoton } from '../../pruebas/arena'

describe('formulario de equipo', () => {
	let dom, f, onGuardar, onCancelar
	beforeEach(() => {
		dom = prepararDOM()
		f = fixture()
		onGuardar = jasmine.createSpy('onGuardar')
		onCancelar = jasmine.createSpy('onCancelar')
	})
	afterEach(() => dom.limpiar())
	const campo = (id, valor) => escribir(dom.contenedor.querySelector('#equipo-' + id), valor)
	const clic = (texto) => clicEn(buscarBoton(dom.contenedor, texto))
	const montar = (equipo) =>
		dom.renderizar(
			<FormEquipo
				equipo={equipo}
				equipos={f.datos.equipos}
				juegos={f.datos.juegos}
				jugadores={f.jugadores}
				jugadorId={f.jugador.id}
				onGuardar={onGuardar}
				onCancelar={onCancelar}
			/>,
		)
	const claves = () => {
		campo('clave', 'Clave123!')
		campo('confirmar', 'Clave123!')
	}

	it('bloquea el envío vacío y enlaza el mensaje al nombre obligatorio', () => {
		montar()
		enviar(dom.contenedor.querySelector('form'))
		expect(onGuardar).not.toHaveBeenCalled()
		expect(dom.contenedor.querySelector('#equipo-nombre-error').textContent).toContain(
			'obligatorio',
		)
		expect(
			dom.contenedor.querySelector('#equipo-nombre').getAttribute('aria-describedby'),
		).toContain('equipo-nombre-error')
	})

	it('impide agregar sin seleccionar un jugador', () => {
		montar()
		clic('Agregar integrante')
		expect(dom.contenedor.textContent).toContain('Selecciona un jugador para agregar.')
		expect(dom.contenedor.textContent).toContain('Aún no has agregado integrantes.')
	})

	it('rechaza integrantes repetidos y permite quitarlos de la lista', () => {
		montar()
		campo('nuevo', f.jugador.id)
		clic('Agregar integrante')
		clic('Agregar integrante')
		expect(dom.contenedor.textContent).toContain('El integrante ya está en la lista.')
		expect(dom.contenedor.querySelectorAll('.lista-limpia li').length).toBe(1)
		clic('Quitar ' + f.jugador.nombre)
		expect(dom.contenedor.textContent).toContain('Aún no has agregado integrantes.')
	})

	it('crea una plantilla completa desde los controles y entrega sus datos al padre', () => {
		montar()
		campo('nombre', 'Escuadra nueva')
		campo('juego', f.juego.id)
		for (const miembro of f.equipo.integrantes) {
			campo('nuevo', miembro.id)
			clic('Agregar integrante')
		}
		claves()
		enviar(dom.contenedor.querySelector('form'))
		expect(onGuardar).toHaveBeenCalledTimes(1)
		const guardado = onGuardar.calls.mostRecent().args[0]
		expect(guardado.nombre).toBe('Escuadra nueva')
		expect(guardado.integrantes.map((miembro) => miembro.id)).toEqual(
			f.equipo.integrantes.map((miembro) => miembro.id),
		)
		expect(guardado.capitanId).toBe(f.jugador.id)
	})

	it('no guarda si las claves no coinciden y permite corregir el error', () => {
		montar(f.equipo)
		campo('clave', 'Clave123!')
		campo('confirmar', 'Diferente')
		enviar(dom.contenedor.querySelector('form'))
		expect(onGuardar).not.toHaveBeenCalled()
		expect(dom.contenedor.querySelector('#equipo-confirmar-error').textContent).toContain(
			'no coinciden',
		)
		campo('confirmar', 'Clave123!')
		enviar(dom.contenedor.querySelector('form'))
		expect(onGuardar).toHaveBeenCalledTimes(1)
	})

	it('no permite guardar un nombre que ya pertenece a otro equipo', () => {
		montar(f.equipo)
		campo('nombre', 'Equipo Incompleto')
		claves()
		enviar(dom.contenedor.querySelector('form'))
		expect(onGuardar).not.toHaveBeenCalled()
		expect(dom.contenedor.querySelector('#equipo-nombre-error').textContent).toContain('en uso')
	})

	it('incluye el suplente seleccionado y convierte la cantidad a número', () => {
		montar(f.equipo)
		campo('suplentes', '1')
		campo('rol', 'Suplente')
		campo('nuevo', 'p-sofia')
		clic('Agregar integrante')
		claves()
		enviar(dom.contenedor.querySelector('form'))
		expect(onGuardar).toHaveBeenCalledTimes(1)
		const guardado = onGuardar.calls.mostRecent().args[0]
		expect(guardado.suplentes).toBe(1)
		expect(guardado.integrantes.find((miembro) => miembro.id === 'p-sofia').rol).toBe('Suplente')
	})

	it('muestra un fallo del servicio conservando el borrador para reintentar', () => {
		onGuardar.and.throwError('No se pudo guardar el equipo')
		montar({ ...f.equipo, estado: 'inactivo' })
		claves()
		enviar(dom.contenedor.querySelector('form'))
		expect(dom.contenedor.textContent).toContain('No se pudo guardar el equipo')
		expect(dom.contenedor.querySelector('#equipo-nombre').value).toBe(f.equipo.nombre)
		expect(dom.contenedor.querySelector('#equipo-estado').value).toBe('inactivo')
		onGuardar.and.stub()
		enviar(dom.contenedor.querySelector('form'))
		expect(dom.contenedor.textContent).not.toContain('No se pudo guardar el equipo')
	})

	it('cancela la edición sin llamar a guardar', () => {
		montar(f.equipo)
		campo('nombre', 'Borrador')
		clic('Cancelar edición')
		expect(onCancelar).toHaveBeenCalledTimes(1)
		expect(onGuardar).not.toHaveBeenCalled()
		expect(f.equipo.nombre).toBe('Arena Demo')
	})
})
