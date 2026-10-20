import FormularioInscripcion from './FormularioInscripcion'
import { act } from 'react'
import { fixture } from '../../pruebas/fixtures'
import { prepararDOM, escribir, enviar, clicEn } from '../../pruebas/dom'
describe('FormularioInscripcion', () => {
	let dom, f, onEnviar
	beforeEach(() => {
		dom = prepararDOM()
		f = fixture(new Date())
		onEnviar = jasmine.createSpy('onEnviar')
		dom.renderizar(
			<FormularioInscripcion
				torneo={f.torneo}
				juego={f.juego}
				equipos={f.datos.equipos}
				jugador={f.jugador}
				jugadores={f.jugadores}
				inscripciones={f.inscripciones}
				onEnviar={onEnviar}
			/>,
		)
	})
	afterEach(() => dom.limpiar())
	it('deshabilita envío con equipo incompleto y no llama onEnviar', () => {
		escribir(dom.contenedor.querySelector('#ins-tipo'), 'equipo')
		escribir(dom.contenedor.querySelector('#ins-equipo'), 'e-incompleto')
		const boton = dom.contenedor.querySelector('button[type="submit"]')
		expect(boton.disabled).toBeTrue()
		clicEn(boton)
		enviar(dom.contenedor.querySelector('form'))
		expect(onEnviar).not.toHaveBeenCalled()
		expect(dom.contenedor.textContent).toContain('incompleto')
	})
	it('actualiza el campo controlado y entrega registro válido por prop', () => {
		escribir(dom.contenedor.querySelector('#ins-tipo'), 'equipo')
		escribir(dom.contenedor.querySelector('#ins-equipo'), 'e-demo')
		escribir(dom.contenedor.querySelector('#ins-correo'), 'otro@arena.example')
		expect(dom.contenedor.querySelector('#ins-correo').value).toBe('otro@arena.example')
		enviar(dom.contenedor.querySelector('form'))
		expect(onEnviar).toHaveBeenCalledOnceWith({
			tipoParticipante: 'equipo',
			equipoId: 'e-demo',
			correo: 'otro@arena.example',
			torneoId: f.torneo.id,
		})
		expect(dom.contenedor.textContent).toContain('¡Inscripción confirmada!')
	})
	it('enlaza mensajes de error con el campo y muestra fallos del servicio', () => {
		escribir(dom.contenedor.querySelector('#ins-correo'), 'mal')
		enviar(dom.contenedor.querySelector('form'))
		expect(dom.contenedor.querySelector('#ins-correo').getAttribute('aria-describedby')).toContain(
			'ins-correo-error',
		)
		expect(dom.contenedor.querySelector('#ins-correo-error').getAttribute('role')).toBe('alert')
		escribir(dom.contenedor.querySelector('#ins-tipo'), 'equipo')
		escribir(dom.contenedor.querySelector('#ins-equipo'), 'e-demo')
		escribir(dom.contenedor.querySelector('#ins-correo'), 'a@arena.example')
		onEnviar.and.throwError('Error simulado')
		enviar(dom.contenedor.querySelector('form'))
		expect(dom.contenedor.textContent).toContain('Error simulado')
	})
})

describe('plazo de inscripción con la página abierta', () => {
	let dom, f, onEnviar
	beforeEach(() => {
		jasmine.clock().install()
		jasmine.clock().mockDate(new Date('2030-01-01T12:00:00Z'))
		dom = prepararDOM()
		f = fixture(new Date())
		f.torneo.cierreISO = '2030-01-01T12:00:01Z'
		onEnviar = jasmine.createSpy('onEnviar')
		dom.renderizar(
			<FormularioInscripcion
				torneo={f.torneo}
				juego={f.juego}
				equipos={f.datos.equipos}
				jugador={f.jugador}
				jugadores={f.jugadores}
				inscripciones={f.inscripciones}
				onEnviar={onEnviar}
			/>,
		)
		escribir(dom.contenedor.querySelector('#ins-tipo'), 'equipo')
		escribir(dom.contenedor.querySelector('#ins-equipo'), 'e-demo')
	})
	afterEach(() => {
		dom.limpiar()
		jasmine.clock().uninstall()
	})

	it('deshabilita el envío al superar el cierre sin recargar ni editar un campo', () => {
		expect(dom.contenedor.querySelector('button[type="submit"]').disabled).toBeFalse()
		act(() => jasmine.clock().tick(2000))
		expect(dom.contenedor.querySelector('button[type="submit"]').disabled).toBeTrue()
		expect(dom.contenedor.textContent).toContain('El plazo de inscripción terminó.')
		enviar(dom.contenedor.querySelector('form'))
		expect(onEnviar).not.toHaveBeenCalled()
	})

	it('actualiza el bloqueo al regresar a la ventana después de que venza el plazo', () => {
		jasmine.clock().mockDate(new Date('2030-01-01T13:00:00Z'))
		act(() => window.dispatchEvent(new Event('focus')))
		expect(dom.contenedor.querySelector('button[type="submit"]').disabled).toBeTrue()
		expect(dom.contenedor.textContent).toContain('El plazo de inscripción terminó.')
	})
})
