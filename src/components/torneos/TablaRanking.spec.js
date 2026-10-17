import TablaRanking from './TablaRanking'
import { prepararDOM } from '../../pruebas/dom'
describe('TablaRanking', () => {
  let dom
  beforeEach(() => { dom = prepararDOM() })
  afterEach(() => dom.limpiar())
  it('renderiza una fila por participante ordenada por puntos y diferencia', () => {
    const ranking = [{ participanteId: 'b', nombre: 'B', puntos: 3, aFavor: 2, enContra: 1 }, { participanteId: 'a', nombre: 'A', puntos: 3, aFavor: 3, enContra: 0 }]
    dom.renderizar(<TablaRanking ranking={ranking} />)
    expect([...dom.contenedor.querySelectorAll('tbody th')].map((th) => th.textContent)).toEqual(['A', 'B'])
    expect(dom.contenedor.querySelectorAll('tbody tr').length).toBe(2)
    expect(dom.contenedor.querySelector('caption')).not.toBeNull()
    expect(dom.contenedor.querySelectorAll('thead th[scope="col"]').length).toBe(6)
  })
  it('explica el estado vacío', () => { dom.renderizar(<TablaRanking ranking={[]} />); expect(dom.contenedor.textContent).toContain('Aún no hay') })
})
