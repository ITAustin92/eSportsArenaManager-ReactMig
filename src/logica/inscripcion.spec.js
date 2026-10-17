import { inscripcionFueraDePlazo, tieneSancionActiva, validarInscripcion, tipoPermitido, estadoSancion } from './inscripcion'
import { fixture } from '../pruebas/fixtures'
describe('inscripcionFueraDePlazo', () => {
  ;[['2029-12-31T23:59:59Z', false], ['2030-01-01T00:00:00Z', false], ['2030-01-01T00:00:01Z', true]].forEach(([hoy, esperado]) => it('evalúa el borde ' + hoy, () => expect(inscripcionFueraDePlazo('2030-01-01T00:00:00Z', hoy)).toBe(esperado)))
  it('rechaza una fecha inválida', () => expect(inscripcionFueraDePlazo('inválida')).toBeTrue())
})
describe('tieneSancionActiva', () => {
  it('mantiene la etiqueta coherente con el bloqueo antes, durante y después de la sanción', () => {
    const sancion = { vigente: true, desde: '2030-01-01T12:00:00Z', hasta: '2030-01-01T13:00:00Z' }
    expect(estadoSancion(sancion, '2030-01-01T11:00:00Z')).toBe('Programada')
    expect(estadoSancion(sancion, sancion.desde)).toBe('Vigente')
    expect(estadoSancion(sancion, sancion.hasta)).toBe('Vigente')
    expect(estadoSancion(sancion, '2030-01-01T13:00:00.001Z')).toBe('Cumplida')
    expect(estadoSancion({ ...sancion, vigente: false }, sancion.desde)).toBe('Cumplida')
  })
  it('bloquea vigente y permite cumplida, expirada o futura', () => {
    expect(tieneSancionActiva([{ vigente: true }])).toBeTrue()
    expect(tieneSancionActiva([{ vigente: false }])).toBeFalse()
    expect(tieneSancionActiva([{ vigente: true, hasta: '2020-01-01' }], '2030-01-01')).toBeFalse()
    expect(tieneSancionActiva([{ vigente: true, desde: '2040-01-01' }], '2030-01-01')).toBeFalse()
    expect(tieneSancionActiva()).toBeFalse()
  })
})
describe('validarInscripcion', () => {
  let contexto, entrada
  beforeEach(() => { contexto = fixture(); entrada = { tipoParticipante: 'equipo', equipoId: contexto.equipo.id, correo: 'contacto@arena.example' } })
  it('acepta al capitán de un equipo completo sin mutar datos', () => { const copia = structuredClone(contexto); expect(validarInscripcion(entrada, contexto)).toEqual({}); expect(contexto).toEqual(copia) })
  it('exige modalidad y correo válidos', () => { const errores = validarInscripcion({ tipoParticipante: '', correo: 'mal' }, contexto); expect(errores.correo).toBeTruthy(); expect(errores.tipoParticipante).toBeTruthy() })
  it('rechaza una modalidad incompatible', () => expect(validarInscripcion({ ...entrada, tipoParticipante: 'jugador' }, contexto).tipoParticipante).toBeTruthy())
  ;['incompleto', 'inactivo', 'sancionado'].forEach((estado) => it('bloquea equipo ' + estado, () => { contexto.equipo.estado = estado; expect(validarInscripcion(entrada, contexto).equipoId).toBeTruthy() }))
  it('bloquea equipos sin titulares suficientes y equipo ajeno', () => {
    contexto.equipo.integrantes.pop(); expect(validarInscripcion(entrada, contexto).equipoId).toBeTruthy()
    contexto.equipo.capitanId = 'otro'; expect(validarInscripcion(entrada, contexto).equipoId).toContain('capitán')
  })
  it('exige equipo y sesión de jugador', () => { expect(validarInscripcion(entrada, { ...contexto, equipo: null }).equipoId).toBeTruthy(); expect(validarInscripcion(entrada, { ...contexto, jugador: null }).jugador).toBeTruthy() })
  it('bloquea sanciones del jugador, del equipo y de un integrante', () => {
    contexto.jugador.sanciones = [{ vigente: true }]; expect(validarInscripcion(entrada, contexto).jugador).toBeTruthy()
    contexto.jugador.sanciones = []; contexto.equipo.sanciones = [{ vigente: true }]; expect(validarInscripcion(entrada, contexto).equipoId).toContain('sanción')
    contexto.equipo.sanciones = []; contexto.jugadores.find((item) => item.id === 'p-matias').sanciones = [{ vigente: true }]; expect(validarInscripcion(entrada, contexto).equipoId).toContain('integrante')
  })
  it('bloquea cupo cero, plazo vencido, estado cerrado y torneo inexistente', () => {
    contexto.torneo.cupoMax = contexto.torneo.inscritos.length; expect(validarInscripcion(entrada, contexto).torneo).toContain('cupos')
    contexto.torneo.cupoMax = 100; contexto.hoy = new Date('2099-01-01'); expect(validarInscripcion(entrada, contexto).torneo).toContain('plazo')
    contexto.torneo.estado = 'En Curso'; expect(validarInscripcion(entrada, contexto).torneo).toContain('abierto')
    expect(validarInscripcion(entrada, { ...contexto, torneo: null }).torneo).toBeTruthy()
  })
  it('detecta duplicidad en ambas fuentes', () => {
    contexto.torneo.inscritos.push(contexto.equipo.id); expect(validarInscripcion(entrada, contexto).duplicidad).toBeTruthy()
    contexto.torneo.inscritos.pop(); contexto.inscripciones.push({ torneoId: contexto.torneo.id, participanteId: contexto.equipo.id }); expect(validarInscripcion(entrada, contexto).duplicidad).toBeTruthy()
  })
  it('permite inscripción individual compatible', () => { contexto.juego.modalidad = '1v1'; expect(tipoPermitido(contexto.juego)).toBe('jugador'); expect(validarInscripcion({ ...entrada, tipoParticipante: 'jugador' }, contexto)).toEqual({}) })
})
