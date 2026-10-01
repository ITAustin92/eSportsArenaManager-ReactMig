import { claseEstado } from './torneos'

describe('claseEstado', () => {
  it('convierte el estado en una clase CSS', () => {
    expect(claseEstado('En Curso')).toBe('estado-en-curso')
  })
})
