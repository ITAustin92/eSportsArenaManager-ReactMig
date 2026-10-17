import FormularioInscripcion from './FormularioInscripcion'
import { fixture } from '../../pruebas/fixtures'
import { prepararDOM, escribir, enviar, clicEn } from '../../pruebas/dom'
describe('FormularioInscripcion', () => {
  let dom, f, onEnviar
  beforeEach(() => {
    dom = prepararDOM(); f = fixture(new Date()); onEnviar = jasmine.createSpy('onEnviar')
    dom.renderizar(<FormularioInscripcion torneo={f.torneo} juego={f.juego} equipos={f.datos.equipos} jugador={f.jugador} jugadores={f.jugadores} inscripciones={f.inscripciones} onEnviar={onEnviar} />)
  })
  afterEach(() => dom.limpiar())
  it('deshabilita envío con equipo incompleto y no llama onEnviar', () => {
    escribir(dom.contenedor.querySelector('#ins-tipo'), 'equipo')
    escribir(dom.contenedor.querySelector('#ins-equipo'), 'e-incompleto')
    const boton = dom.contenedor.querySelector('button[type="submit"]')
    expect(boton.disabled).toBeTrue(); clicEn(boton); enviar(dom.contenedor.querySelector('form'))
    expect(onEnviar).not.toHaveBeenCalled(); expect(dom.contenedor.textContent).toContain('incompleto')
  })
  it('actualiza el campo controlado y entrega registro válido por prop', () => {
    escribir(dom.contenedor.querySelector('#ins-tipo'), 'equipo')
    escribir(dom.contenedor.querySelector('#ins-equipo'), 'e-demo')
    escribir(dom.contenedor.querySelector('#ins-correo'), 'otro@arena.example')
    expect(dom.contenedor.querySelector('#ins-correo').value).toBe('otro@arena.example')
    enviar(dom.contenedor.querySelector('form'))
    expect(onEnviar).toHaveBeenCalledOnceWith({ tipoParticipante: 'equipo', equipoId: 'e-demo', correo: 'otro@arena.example', torneoId: f.torneo.id })
    expect(dom.contenedor.textContent).toContain('¡Inscripción confirmada!')
  })
  it('enlaza mensajes de error con el campo y muestra fallos del servicio', () => {
    escribir(dom.contenedor.querySelector('#ins-correo'), 'mal'); enviar(dom.contenedor.querySelector('form'))
    expect(dom.contenedor.querySelector('#ins-correo').getAttribute('aria-describedby')).toContain('ins-correo-error')
    expect(dom.contenedor.querySelector('#ins-correo-error').getAttribute('role')).toBe('alert')
    escribir(dom.contenedor.querySelector('#ins-tipo'), 'equipo'); escribir(dom.contenedor.querySelector('#ins-equipo'), 'e-demo'); escribir(dom.contenedor.querySelector('#ins-correo'), 'a@arena.example')
    onEnviar.and.throwError('Error simulado'); enviar(dom.contenedor.querySelector('form'))
    expect(dom.contenedor.textContent).toContain('Error simulado')
  })
})
