import { validarInscripcion } from './inscripcion'

describe('validarInscripcion', () => {
  it('informa campos obligatorios inválidos', () => {
    expect(validarInscripcion({ correo: '', tipoParticipante: '' }).correo).toBeDefined()
  })
})
