import MisInscripciones from './MisInscripciones'
import { claveDatos, obtenerDatos } from '../../datos/datos'
import { fixture } from '../../pruebas/fixtures'
import { prepararDOM, escribir, enviar, clicEn } from '../../pruebas/dom'
import { montarVista, buscarBoton } from '../../pruebas/arena'

describe('inscripciones del jugador', () => {
	let dom, f, storage, registro
	beforeEach(() => {
		dom = prepararDOM()
		f = fixture(new Date())
		registro = {
			id: 'i-propia',
			torneoId: f.torneo.id,
			participanteId: f.equipo.id,
			tipoParticipante: 'equipo',
			jugadorId: f.jugador.id,
			correo: f.jugador.correo,
		}
		f.datos.inscripciones.push(registro)
		f.torneo.inscritos.push(f.equipo.id)
		f.equipo.torneosIds.push(f.torneo.id)
	})
	afterEach(() => dom.limpiar())
	const montar = () => {
		storage = montarVista(dom, MisInscripciones, { datos: f.datos })
	}
	const clic = (texto) => clicEn(buscarBoton(dom.contenedor, texto))
	const contacto = (valor) => {
		clic('Editar contacto')
		escribir(dom.contenedor.querySelector('#editar-correo'), valor)
		enviar(dom.contenedor.querySelector('form'))
	}

	it('lista únicamente las inscripciones propias con enlace al torneo', () => {
		montar()
		const enlaces = dom.contenedor.querySelectorAll('a')
		expect(enlaces.length).toBe(1)
		expect(enlaces[0].getAttribute('href')).toBe('/torneos/' + f.torneo.id)
		expect(dom.contenedor.querySelectorAll('li').length).toBe(1)
	})

	it('edita el correo, persiste el cambio y cierra el formulario', () => {
		montar()
		contacto('nuevo@arena.example')
		expect(dom.contenedor.textContent).toContain('Contacto actualizado.')
		expect(dom.contenedor.textContent).toContain('nuevo@arena.example')
		expect(dom.contenedor.querySelector('form')).toBeNull()
		expect(
			JSON.parse(storage.getItem(claveDatos)).inscripciones.find((item) => item.id === registro.id)
				.correo,
		).toBe('nuevo@arena.example')
	})

	it('rechaza un correo inválido sin cambiar la inscripción y permite corregirlo', () => {
		montar()
		contacto('incorrecto')
		expect(dom.contenedor.querySelector('#editar-correo-error').textContent).toContain(
			'correo válido',
		)
		expect(dom.contenedor.querySelector('#editar-correo').getAttribute('aria-invalid')).toBe('true')
		expect(obtenerDatos().inscripciones.find((item) => item.id === registro.id).correo).toBe(
			registro.correo,
		)
		escribir(dom.contenedor.querySelector('#editar-correo'), 'corregido@arena.example')
		enviar(dom.contenedor.querySelector('form'))
		expect(dom.contenedor.textContent).toContain('Contacto actualizado.')
	})

	it('descarta la edición del contacto sin guardar el borrador', () => {
		montar()
		const antes = storage.getItem(claveDatos)
		clic('Editar contacto')
		escribir(dom.contenedor.querySelector('#editar-correo'), 'borrador@arena.example')
		clic('Cancelar edición')
		expect(dom.contenedor.querySelector('form')).toBeNull()
		expect(storage.getItem(claveDatos)).toBe(antes)
	})

	it('permite volver atrás sin cancelar la inscripción', () => {
		montar()
		clic('Cancelar inscripción')
		clic('Volver')
		expect(dom.contenedor.querySelector('.confirmacion')).toBeNull()
		expect(obtenerDatos().inscripciones.some((item) => item.id === registro.id)).toBeTrue()
	})

	it('al confirmar la cancelación libera el cupo y actualiza las relaciones y la vista', () => {
		montar()
		const antes = obtenerDatos().torneos.find((item) => item.id === f.torneo.id).inscritos.length
		clic('Cancelar inscripción')
		clic('Sí, cancelar inscripción')
		const despues = obtenerDatos()
		expect(despues.inscripciones.some((item) => item.id === registro.id)).toBeFalse()
		expect(despues.torneos.find((item) => item.id === f.torneo.id).inscritos.length).toBe(antes - 1)
		expect(despues.equipos.find((item) => item.id === f.equipo.id).torneosIds).not.toContain(
			f.torneo.id,
		)
		expect(dom.contenedor.textContent).toContain('No tienes inscripciones.')
		expect(dom.contenedor.textContent).toContain('el cupo volvió a estar disponible')
	})

	it('impide editar el contacto después del cierre del torneo', () => {
		f.torneo.cierreISO = '2000-01-01T00:00:00Z'
		montar()
		contacto('nuevo@arena.example')
		expect(dom.contenedor.textContent).toContain('La inscripción ya no se puede modificar.')
		expect(obtenerDatos().inscripciones.find((item) => item.id === registro.id).correo).toBe(
			registro.correo,
		)
	})

	it('impide cancelar después del cierre y conserva el cupo ocupado', () => {
		f.torneo.cierreISO = '2000-01-01T00:00:00Z'
		montar()
		clic('Cancelar inscripción')
		clic('Sí, cancelar inscripción')
		expect(dom.contenedor.textContent).toContain('La inscripción ya no se puede modificar.')
		expect(obtenerDatos().torneos.find((item) => item.id === f.torneo.id).inscritos).toContain(
			f.equipo.id,
		)
	})

	it('informa un fallo al guardar el correo y conserva el borrador', () => {
		montar()
		spyOn(storage, 'setItem').and.throwError('Sin espacio')
		contacto('pendiente@arena.example')
		expect(dom.contenedor.textContent).toContain('No se pudo guardar.')
		expect(dom.contenedor.querySelector('#editar-correo').value).toBe('pendiente@arena.example')
		expect(obtenerDatos().inscripciones.find((item) => item.id === registro.id).correo).toBe(
			registro.correo,
		)
	})

	it('no publica una cancelación ni libera cupos si falla el almacenamiento', () => {
		montar()
		const antes = obtenerDatos()
		spyOn(storage, 'setItem').and.throwError('Sin espacio')
		clic('Cancelar inscripción')
		clic('Sí, cancelar inscripción')
		expect(dom.contenedor.textContent).toContain('No se pudo guardar.')
		expect(obtenerDatos()).toEqual(antes)
		expect(dom.contenedor.querySelector('.confirmacion')).not.toBeNull()
	})

	it('cierra el borrador de contacto al cancelar la misma inscripción', () => {
		montar()
		clic('Editar contacto')
		escribir(dom.contenedor.querySelector('#editar-correo'), 'borrador@arena.example')
		clic('Cancelar inscripción')
		clic('Sí, cancelar inscripción')
		expect(dom.contenedor.querySelector('form')).toBeNull()
		expect(dom.contenedor.textContent).toContain('No tienes inscripciones.')
	})

	it('conserva el formulario de contacto cuando la cancelación falla', () => {
		montar()
		clic('Editar contacto')
		escribir(dom.contenedor.querySelector('#editar-correo'), 'pendiente@arena.example')
		spyOn(storage, 'setItem').and.throwError('Sin espacio')
		clic('Cancelar inscripción')
		clic('Sí, cancelar inscripción')
		expect(dom.contenedor.querySelector('#editar-correo').value).toBe('pendiente@arena.example')
		expect(obtenerDatos().inscripciones.some((item) => item.id === registro.id)).toBeTrue()
	})
})
