import { validarApodo } from './perfil'

describe('validarApodo', () => {
  it('acepta un apodo válido', () => {
    expect(validarApodo('FakerLATAM')).toBe('')
  })
})
