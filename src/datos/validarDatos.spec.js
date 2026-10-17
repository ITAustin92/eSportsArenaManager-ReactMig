import { crearDatosIniciales, inicializarDatos, claveDatos, actualizarJugador } from './datos'
import { datosGuardadosValidos } from './validarDatos'
import { storageFalso } from '../pruebas/fixtures'

describe('validación de datos persistidos', () => {
  let datos
  beforeEach(() => { datos = crearDatosIniciales() })
  it('acepta la semilla, incluidos equipos incompletos y rivales por definir', () => {
    expect(datosGuardadosValidos(datos, ['p-felipe', 'p-sofia'])).toBeTrue()
  })

  const defectos = [
    ['registro de jugador nulo', (base) => { base.jugadores[0] = null }],
    ['campo de texto ausente', (base) => { delete base.jugadores[0].apodo }],
    ['sanciones sin arreglo', (base) => { base.jugadores[0].sanciones = {} }],
    ['sanción mal formada', (base) => { base.jugadores[0].sanciones[0].vigente = 'sí' }],
    ['fecha de sanción inválida', (base) => { base.jugadores[0].sanciones[0].hasta = 'ayer' }],
    ['historial incompleto', (base) => { base.jugadores[0].historial = [{ id: 'h' }] }],
    ['equipo sin integrantes', (base) => { delete base.equipos[0].integrantes }],
    ['integrante incompleto', (base) => { base.equipos[0].integrantes[0] = { id: 'p-invalido' } }],
    ['juego inexistente', (base) => { base.torneos[0].juegoId = 'inexistente' }],
    ['capitán inexistente', (base) => { base.equipos[0].capitanId = 'inexistente' }],
    ['integrante sin jugador', (base) => { base.equipos[0].integrantes[0].id = 'inexistente' }],
    ['juego con tamaño inválido', (base) => { base.juegos[0].jugadoresPorEquipo = 'cinco' }],
    ['id duplicado', (base) => { base.juegos.push({ ...base.juegos[0] }) }],
    ['id vacío', (base) => { base.juegos[0].id = '' }],
    ['torneo con fecha inválida', (base) => { base.torneos[0].cierreISO = 'nunca' }],
    ['torneo sin inscritos', (base) => { base.torneos[0].inscritos = null }],
    ['ranking inválido', (base) => { base.torneos[0].ranking = [null] }],
    ['ranking sin puntaje numérico', (base) => { base.torneos[0].ranking[0].puntos = 'tres' }],
    ['premio incompleto', (base) => { base.torneos[0].premios = [{ id: 'p' }] }],
    ['partida incompleta', (base) => { base.torneos[0].partidas = [{ id: 'p' }] }],
    ['inscripción sin participante', (base) => { delete base.inscripciones[0].participanteId }],
    ['resultado con marcador inválido', (base) => { base.resultados[0].puntajeLocal = -1 }],
  ]
  defectos.forEach(([nombre, alterar]) => it('rechaza ' + nombre, () => {
    alterar(datos)
    expect(datosGuardadosValidos(datos)).toBeFalse()
  }))

  it('rechaza un formato antiguo o la ausencia de un jugador de las cuentas de prueba', () => {
    expect(datosGuardadosValidos(null)).toBeFalse()
    expect(datosGuardadosValidos({ ...datos, version: 0 })).toBeFalse()
    expect(datosGuardadosValidos(datos, ['jugador-ausente'])).toBeFalse()
  })

  it('recupera una estructura incompleta y respalda su texto original antes de sustituirla', () => {
    const storage = storageFalso(); datos.jugadores = [null]
    const texto = JSON.stringify(datos); storage.setItem(claveDatos, texto)
    const recuperados = inicializarDatos(storage)
    expect(datosGuardadosValidos(recuperados, ['p-felipe', 'p-sofia'])).toBeTrue()
    expect(storage.getItem(claveDatos + '-respaldo-invalido')).toBe(texto)
    expect(datosGuardadosValidos(JSON.parse(storage.getItem(claveDatos)))).toBeTrue()
  })

  it('conserva también un respaldo del JSON ilegible', () => {
    const storage = storageFalso(); storage.setItem(claveDatos, '{ilegible')
    expect(datosGuardadosValidos(inicializarDatos(storage))).toBeTrue()
    expect(storage.getItem(claveDatos + '-respaldo-invalido')).toBe('{ilegible')
  })

  it('no sobrescribe el original inválido si no puede guardar su respaldo', () => {
    const storage = storageFalso(); storage.setItem(claveDatos, '{ilegible')
    spyOn(storage, 'setItem').and.throwError('Sin espacio')
    expect(datosGuardadosValidos(inicializarDatos(storage))).toBeTrue()
    expect(storage.getItem(claveDatos)).toBe('{ilegible')
    expect(storage.setItem).toHaveBeenCalledTimes(1)
  })

  it('conserva los cambios válidos al recargar, sin generar un respaldo', () => {
    const storage = storageFalso(); inicializarDatos(storage)
    actualizarJugador('p-felipe', { apodo: 'ApodoGuardado' }, { rol: 'jugador', jugadorId: 'p-felipe' })
    const texto = storage.getItem(claveDatos)
    expect(inicializarDatos(storage).jugadores.find((item) => item.id === 'p-felipe').apodo).toBe('ApodoGuardado')
    expect(storage.getItem(claveDatos)).toBe(texto)
    expect(storage.getItem(claveDatos + '-respaldo-invalido')).toBeNull()
  })
})
