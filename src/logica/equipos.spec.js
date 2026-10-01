import { agregarIntegrante } from './equipos'

describe('agregarIntegrante', () => {
  it('devuelve una lista nueva', () => {
    expect(agregarIntegrante([], { id: 1 })).toEqual([{ id: 1 }])
  })
})
