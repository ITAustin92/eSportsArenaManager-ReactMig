import { MemoryRouter, Route, Routes } from 'react-router-dom'
import DetalleTorneo from './DetalleTorneo'
import { fixture } from '../../pruebas/fixtures'
import { prepararDOM, escribir } from '../../pruebas/dom'
describe('DetalleTorneo', () => {
  let dom, f
  beforeEach(() => { dom = prepararDOM(); f = fixture() })
  afterEach(() => dom.limpiar())
  it('entrega la clasificación ordenada a la tabla sin modificar los datos del torneo', () => {
    f.torneo.ranking = [
      { participanteId: 'b', nombre: 'B', puntos: 3, aFavor: 2, enContra: 1, victorias: 1, derrotas: 1 },
      { participanteId: 'a', nombre: 'A', puntos: 3, aFavor: 3, enContra: 0, victorias: 1, derrotas: 1 },
      { participanteId: 'c', nombre: 'C', puntos: 6, aFavor: 2, enContra: 1, victorias: 2, derrotas: 0 },
    ]
    const original = structuredClone(f.torneo.ranking)
    dom.renderizar(<MemoryRouter initialEntries={['/torneos/' + f.torneo.id]}><Routes><Route path="/torneos/:id" element={<DetalleTorneo datos={f.datos} />} /></Routes></MemoryRouter>)
    expect([...dom.contenedor.querySelectorAll('tbody th')].map((th) => th.textContent)).toEqual(['C', 'A', 'B'])
    expect(f.torneo.ranking).toEqual(original)
  })
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
