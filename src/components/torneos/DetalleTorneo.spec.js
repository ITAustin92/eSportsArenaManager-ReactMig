import { MemoryRouter, Route, Routes } from 'react-router-dom'
import DetalleTorneo from './DetalleTorneo'
import { fixture } from '../../pruebas/fixtures'
import { prepararDOM, escribir } from '../../pruebas/dom'
describe('DetalleTorneo', () => {
  let dom, f
  beforeEach(() => { dom = prepararDOM(); f = fixture() })
  afterEach(() => dom.limpiar())
  it('cambia la ronda visible mediante estado local', () => {
    dom.renderizar(<MemoryRouter initialEntries={['/torneos/' + f.torneo.id]}><Routes><Route path="/torneos/:id" element={<DetalleTorneo datos={f.datos} />} /></Routes></MemoryRouter>)
    escribir(dom.contenedor.querySelector('#ronda'), 'Final')
    expect(dom.contenedor.textContent).toContain('Participante por definir')
    expect(dom.contenedor.querySelector('#ronda').value).toBe('Final')
    expect(dom.contenedor.querySelectorAll('h1').length).toBe(1)
  })
  it('redirige al listado solamente cuando el id no existe', () => {
    dom.renderizar(<MemoryRouter initialEntries={['/torneos/inventado']}><Routes><Route path="/torneos/:id" element={<DetalleTorneo datos={f.datos} />} /><Route path="/torneos" element={<p>Catálogo de prueba</p>} /></Routes></MemoryRouter>)
    expect(dom.contenedor.textContent).toBe('Catálogo de prueba')
  })
})
