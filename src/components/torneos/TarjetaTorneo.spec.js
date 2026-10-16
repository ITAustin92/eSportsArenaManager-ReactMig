import { MemoryRouter } from 'react-router-dom'
import TarjetaTorneo from './TarjetaTorneo'
import { fixture } from '../../pruebas/fixtures'
import { prepararDOM } from '../../pruebas/dom'
describe('TarjetaTorneo', () => {
  let dom
  beforeEach(() => { dom = prepararDOM() })
  afterEach(() => dom.limpiar())
  it('renderiza nombre, juego, estado y enlace de detalle', () => {
    const { torneo, juego } = fixture()
    dom.renderizar(<MemoryRouter><TarjetaTorneo torneo={torneo} juego={juego} /></MemoryRouter>)
    ;[torneo.nombre, juego.nombre, torneo.estado].forEach((texto) => expect(dom.contenedor.textContent).toContain(texto))
    expect(dom.contenedor.querySelector('a').getAttribute('href')).toBe('/torneos/' + torneo.id)
    expect(dom.contenedor.querySelector('img').alt).toBeTruthy()
  })
})
