import TablaRanking from './TablaRanking'
import { prepararDOM } from '../../pruebas/dom'
describe('TablaRanking', () => {
  let dom
  beforeEach(() => { dom = prepararDOM() })
  afterEach(() => dom.limpiar())
  it('renderiza una fila por participante respetando el orden recibido', () => {
    const ranking = [{ participanteId: 'b', nombre: 'B', puntos: 3, aFavor: 2, enContra: 1 }, { participanteId: 'a', nombre: 'A', puntos: 3, aFavor: 3, enContra: 0 }]
    dom.renderizar(<TablaRanking ranking={ranking} />)
    expect([...dom.contenedor.querySelectorAll('tbody th')].map((th) => th.textContent)).toEqual(['B', 'A'])
    expect([...dom.contenedor.querySelectorAll('tbody td:first-child')].map((td) => td.textContent)).toEqual(['1', '2'])
    expect(ranking.map((fila) => fila.nombre)).toEqual(['B', 'A'])
    expect(dom.contenedor.querySelectorAll('tbody tr').length).toBe(2)
    expect(dom.contenedor.querySelector('caption')).not.toBeNull()
    expect(dom.contenedor.querySelectorAll('thead th[scope="col"]').length).toBe(6)
  })
  it('explica el estado vacío', () => { dom.renderizar(<TablaRanking ranking={[]} />); expect(dom.contenedor.textContent).toContain('Aún no hay') })
})
