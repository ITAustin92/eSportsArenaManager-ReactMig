import FormTorneo from './FormTorneo'
import FormJuego from './FormJuego'
import { fixture } from '../../pruebas/fixtures'
import { prepararDOM, escribir, enviar, clicEn } from '../../pruebas/dom'
import { buscarBoton } from '../../pruebas/arena'

describe('formularios de administración', () => {
  let dom, f, onGuardar, onCancelar
  beforeEach(() => { dom = prepararDOM(); f = fixture(new Date()); onGuardar = jasmine.createSpy('onGuardar'); onCancelar = jasmine.createSpy('onCancelar') })
  afterEach(() => dom.limpiar())
  const campo = (id, valor) => escribir(dom.contenedor.querySelector('#' + id), valor)
  const enviarFormulario = () => enviar(dom.contenedor.querySelector('form'))
  const montarTorneo = (torneo) => dom.renderizar(<FormTorneo torneo={torneo} juegos={f.datos.juegos} onGuardar={onGuardar} onCancelar={onCancelar} />)
  const montarJuego = (juego, bloqueado = false) => dom.renderizar(<FormJuego juego={juego} juegos={f.datos.juegos} bloqueado={bloqueado} onGuardar={onGuardar} onCancelar={onCancelar} />)

  it('bloquea el torneo sin nombre, juego ni fechas', () => {
    montarTorneo(); enviarFormulario()
    expect(onGuardar).not.toHaveBeenCalled()
    for (const id of ['torneo-nombre', 'torneo-juego', 'torneo-cierre', 'torneo-inicio']) expect(dom.contenedor.querySelector('#' + id + '-error')).not.toBeNull()
  })

  it('no guarda un inicio igual al cierre y permite corregirlo', () => {
    montarTorneo(); campo('torneo-nombre', 'Nueva copa'); campo('torneo-juego', f.juego.id); campo('torneo-cupo', '12')
    campo('torneo-cierre', f.torneo.cierreISO); campo('torneo-inicio', f.torneo.cierreISO); enviarFormulario()
    expect(onGuardar).not.toHaveBeenCalled()
    expect(dom.contenedor.querySelector('#torneo-inicio-error').textContent).toContain('posterior')
    campo('torneo-inicio', f.torneo.fechaInicio); enviarFormulario()
    expect(onGuardar).toHaveBeenCalledOnceWith(jasmine.objectContaining({ nombre: 'Nueva copa', cupoMax: 12, juegoId: f.juego.id }))
  })

  it('bloquea las reglas críticas de un torneo iniciado pero deja editar su nombre', () => {
    montarTorneo({ ...f.torneo, estado: 'En Curso' })
    for (const id of ['torneo-juego', 'torneo-cupo', 'torneo-cierre', 'torneo-inicio']) expect(dom.contenedor.querySelector('#' + id).disabled).toBeTrue()
    campo('torneo-nombre', 'Nombre actualizado'); enviarFormulario()
    expect(onGuardar).toHaveBeenCalledOnceWith(jasmine.objectContaining({ nombre: 'Nombre actualizado', estado: 'En Curso' }))
  })

  it('muestra un fallo al guardar el torneo y mantiene su borrador', () => {
    onGuardar.and.throwError('Error de guardado del torneo'); montarTorneo(f.torneo)
    campo('torneo-nombre', 'Nombre pendiente'); enviarFormulario()
    expect(dom.contenedor.textContent).toContain('Error de guardado del torneo')
    expect(dom.contenedor.querySelector('#torneo-nombre').value).toBe('Nombre pendiente')
    onGuardar.and.stub(); enviarFormulario()
    expect(dom.contenedor.textContent).not.toContain('Error de guardado del torneo')
  })

  it('cancela el torneo sin enviar sus cambios', () => {
    montarTorneo(f.torneo); clicEn(buscarBoton(dom.contenedor, 'Cancelar edición de torneo'))
    expect(onCancelar).toHaveBeenCalledTimes(1); expect(onGuardar).not.toHaveBeenCalled()
  })

  it('rechaza un juego sin nombre', () => {
    montarJuego(); enviarFormulario()
    expect(dom.contenedor.querySelector('#juego-nombre-error').textContent).toContain('obligatorio')
    expect(onGuardar).not.toHaveBeenCalled()
  })

  it('crea un juego por equipos con tamaño numérico desde los controles', () => {
    montarJuego(); campo('juego-nombre', 'Juego nuevo'); campo('juego-modalidad', 'equipos'); campo('juego-tamano', '4'); enviarFormulario()
    expect(onGuardar).toHaveBeenCalledOnceWith({ nombre: 'Juego nuevo', modalidad: 'equipos', jugadoresPorEquipo: 4 })
  })

  it('no cambia modalidad ni tamaño de un juego referenciado', () => {
    montarJuego(f.juego, true)
    expect(dom.contenedor.querySelector('#juego-modalidad').disabled).toBeTrue()
    expect(dom.contenedor.querySelector('#juego-tamano').disabled).toBeTrue()
    campo('juego-nombre', 'Juego renombrado'); enviarFormulario()
    expect(onGuardar).toHaveBeenCalledOnceWith(jasmine.objectContaining({ nombre: 'Juego renombrado', modalidad: f.juego.modalidad, jugadoresPorEquipo: f.juego.jugadoresPorEquipo }))
  })

  it('muestra errores del servicio al guardar juegos y permite reintentar', () => {
    montarJuego(f.juego); onGuardar.and.throwError('Error de guardado del juego'); enviarFormulario()
    expect(dom.contenedor.textContent).toContain('Error de guardado del juego')
    onGuardar.and.stub(); enviarFormulario()
    expect(dom.contenedor.textContent).not.toContain('Error de guardado del juego')
  })

  it('cancela el juego sin guardar el borrador', () => {
    montarJuego(f.juego); clicEn(buscarBoton(dom.contenedor, 'Cancelar edición de juego'))
    expect(onCancelar).toHaveBeenCalledTimes(1); expect(onGuardar).not.toHaveBeenCalled()
  })
})
