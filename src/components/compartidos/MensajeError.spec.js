import MensajeError from './MensajeError'
import { prepararDOM } from '../../pruebas/dom'

describe('MensajeError', () => {
  let dom
  beforeEach(() => { dom = prepararDOM() })
  afterEach(() => dom.limpiar())

  ;[
    { nombre: 'una cadena vacía', mensaje: '' },
    { nombre: 'null', mensaje: null },
    { nombre: 'undefined', mensaje: undefined },
  ].forEach(({ nombre, mensaje }) => {
    it('no crea nodos cuando recibe ' + nombre, () => {
      dom.renderizar(<MensajeError id="correo-error">{mensaje}</MensajeError>)
      expect(dom.contenedor.childNodes.length).toBe(0)
      expect(dom.contenedor.querySelector('[role="alert"]')).toBeNull()
    })
  })

  it('muestra el texto con role alert y el id recibido', () => {
    dom.renderizar(<MensajeError id="correo-error">Ingresa un correo válido.</MensajeError>)
    const alerta = dom.contenedor.querySelector('[role="alert"]')
    expect(alerta).not.toBeNull()
    expect(alerta.id).toBe('correo-error')
    expect(alerta.textContent).toBe('Ingresa un correo válido.')
  })
})
