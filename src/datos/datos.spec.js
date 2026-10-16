import * as servicio from './datos'
import { storageFalso } from '../pruebas/fixtures'
describe('fuente única y CRUD simulado', () => {
  let storage, datos, admin, jugador, torneo, equipo, entrada
  beforeEach(() => {
    storage = storageFalso()
    datos = servicio.inicializarDatos(storage)
    admin = { rol: 'admin' }; jugador = { rol: 'jugador', jugadorId: 'p-felipe' }
    torneo = datos.torneos.find((item) => item.juegoId === 'valorant' && item.estado === 'Abierto')
    equipo = datos.equipos.find((item) => item.id === 'e-demo')
    entrada = { torneoId: torneo.id, equipoId: equipo.id, tipoParticipante: 'equipo', correo: 'contacto@arena.example' }
  })
  it('carga copias, conserva datos al recargar y recupera JSON corrupto', () => {
    const copia = servicio.obtenerDatos(); copia.torneos.length = 0
    expect(servicio.obtenerDatos().torneos.length).toBeGreaterThan(0)
    expect(servicio.inicializarDatos(storage)).toEqual(datos)
    expect(servicio.inicializarDatos({ getItem: () => '{' }).juegos.length).toBe(4)
  })
  it('notifica escrituras y limpia la suscripción', () => {
    const espia = jasmine.createSpy('onCambiar'); const limpiar = servicio.suscribirDatos(espia)
    servicio.crearJuego({ nombre: 'Nuevo', modalidad: '1v1', jugadoresPorEquipo: 1 }, admin)
    expect(espia).toHaveBeenCalledTimes(1); limpiar()
    servicio.crearJuego({ nombre: 'Otro', modalidad: '1v1', jugadoresPorEquipo: 1 }, admin)
    expect(espia).toHaveBeenCalledTimes(1)
  })
  it('no modifica memoria cuando falla el almacenamiento', () => {
    spyOn(storage, 'setItem').and.throwError('Sin espacio')
    expect(() => servicio.crearInscripcion(entrada, jugador)).toThrowError(/guardar/)
    expect(servicio.obtenerDatos()).toEqual(datos)
  })
  it('crea, consulta, actualiza y elimina un juego', () => {
    const nuevo = servicio.crearJuego({ nombre: 'Prueba', modalidad: '1v1', jugadoresPorEquipo: 1 }, admin)
    expect(servicio.obtenerJuegoPorId(nuevo.id).nombre).toBe('Prueba')
    servicio.actualizarJuego(nuevo.id, { ...nuevo, nombre: 'Renombrado' }, admin)
    expect(servicio.obtenerJuegos().find((item) => item.id === nuevo.id).nombre).toBe('Renombrado')
    servicio.eliminarJuego(nuevo.id, admin); expect(servicio.obtenerJuegoPorId(nuevo.id)).toBeUndefined()
  })
  it('protege juegos referenciados y operaciones de otro rol', () => {
    const juego = datos.juegos[0]
    expect(() => servicio.eliminarJuego(juego.id, admin)).toThrowError(/asociados/)
    expect(() => servicio.actualizarJuego(juego.id, { ...juego, jugadoresPorEquipo: 4 }, admin)).toThrow()
    expect(() => servicio.crearJuego(juego, jugador)).toThrowError(/permiso/)
    expect(() => servicio.eliminarJuego('inexistente', admin)).toThrowError(/existe/)
  })
  it('crea, consulta, actualiza y elimina torneo sin participantes', () => {
    const nuevo = servicio.crearTorneo({ ...torneo, nombre: 'Copa de prueba' }, admin)
    expect(servicio.obtenerTorneoPorId(nuevo.id).inscritos).toEqual([])
    servicio.actualizarTorneo(nuevo.id, { ...nuevo, nombre: 'Copa editada' }, admin)
    expect(servicio.obtenerTorneos().find((item) => item.id === nuevo.id).nombre).toBe('Copa editada')
    servicio.eliminarTorneo(nuevo.id, admin); expect(servicio.obtenerTorneoPorId(nuevo.id)).toBeUndefined()
  })
  it('protege torneo con inscripciones y reglas en curso', () => {
    expect(() => servicio.eliminarTorneo(torneo.id, admin)).toThrowError(/sin inscritos/)
    expect(() => servicio.actualizarTorneo(torneo.id, { ...torneo, juegoId: 'lol' }, admin)).toThrowError(/juego/)
    const iniciado = datos.torneos.find((item) => item.estado === 'En Curso')
    expect(() => servicio.actualizarTorneo(iniciado.id, { ...iniciado, cupoMax: 100 }, admin)).toThrowError(/bloqueada/)
  })
  it('crea, actualiza y elimina equipo; no guarda claves', () => {
    const nuevo = servicio.crearEquipo({ ...equipo, id: undefined, nombre: 'Nuevo equipo', clave: '123456', confirmarClave: '123456' }, jugador)
    expect(servicio.obtenerEquipoPorId(nuevo.id).clave).toBeUndefined()
    expect(servicio.obtenerDatos().jugadores.find((item) => item.id === jugador.jugadorId).equipos).toContain(nuevo.id)
    servicio.actualizarEquipo(nuevo.id, { ...nuevo, nombre: 'Equipo editado', clave: '123456', confirmarClave: '123456' }, jugador)
    expect(servicio.obtenerEquipos().find((item) => item.id === nuevo.id).nombre).toBe('Equipo editado')
    servicio.eliminarEquipo(nuevo.id, jugador); expect(servicio.obtenerEquipoPorId(nuevo.id)).toBeUndefined()
  })
  it('rechaza editar equipos ajenos, capitán incorrecto y estado inválido', () => {
    const entradaEquipo = { ...equipo, clave: '123456', confirmarClave: '123456' }
    expect(() => servicio.actualizarEquipo(equipo.id, entradaEquipo, { rol: 'jugador', jugadorId: 'otro' })).toThrowError(/capitán/)
    expect(() => servicio.crearEquipo({ ...entradaEquipo, capitanId: 'otro' }, jugador)).toThrowError(/capitán/)
    expect(() => servicio.actualizarEquipo(equipo.id, { ...entradaEquipo, estado: 'otro' }, jugador)).toThrowError(/Estado/)
    expect(() => servicio.eliminarEquipo(equipo.id, { rol: 'jugador', jugadorId: 'otro' })).toThrowError(/propios/)
  })
  it('inscribe, actualiza contacto, evita duplicados y devuelve el cupo al cancelar', () => {
    const registro = servicio.crearInscripcion(entrada, jugador)
    expect(servicio.obtenerTorneoPorId(torneo.id).inscritos.length).toBe(torneo.inscritos.length + 1)
    expect(servicio.obtenerEquipoPorId(equipo.id).torneosIds).toContain(torneo.id)
    expect(servicio.obtenerInscripcionPorId(registro.id).correo).toBe(entrada.correo)
    expect(() => servicio.crearInscripcion(entrada, jugador)).toThrowError(/inscrito/)
    servicio.actualizarInscripcion(registro.id, { correo: 'nuevo@arena.example' }, jugador)
    expect(servicio.obtenerInscripcionPorId(registro.id).correo).toBe('nuevo@arena.example')
    servicio.eliminarInscripcion(registro.id, jugador)
    expect(servicio.obtenerInscripcionPorId(registro.id)).toBeUndefined()
    expect(servicio.obtenerTorneoPorId(torneo.id).inscritos).toEqual(torneo.inscritos)
    expect(servicio.obtenerEquipoPorId(equipo.id).torneosIds).not.toContain(torneo.id)
  })
  it('protege inscripciones ajenas y equipo registrado; valida contacto', () => {
    const registro = servicio.crearInscripcion(entrada, jugador)
    expect(() => servicio.actualizarInscripcion(registro.id, { correo: 'mal' }, jugador)).toThrowError(/correo/)
    expect(() => servicio.eliminarInscripcion(registro.id, { rol: 'jugador', jugadorId: 'otro' })).toThrowError(/otro/)
    expect(() => servicio.actualizarEquipo(equipo.id, equipo, jugador)).toThrowError(/bloqueada/)
    expect(() => servicio.eliminarEquipo(equipo.id, jugador)).toThrowError(/inscripciones/)
    servicio.actualizarTorneo(torneo.id, { ...torneo, estado: 'En Curso' }, admin)
    expect(() => servicio.eliminarInscripcion(registro.id, jugador)).toThrowError(/modificar/)
  })
  it('actualiza perfil propio y propaga el apodo, nunca el rol', () => {
    servicio.actualizarJugador(jugador.jugadorId, { apodo: 'NuevoApodo', avatar: 'data:image/png;base64,AA', rol: 'admin' }, jugador)
    expect(servicio.obtenerEquipoPorId(equipo.id).integrantes.find((item) => item.id === jugador.jugadorId).apodo).toBe('NuevoApodo')
    expect(servicio.obtenerDatos().jugadores.find((item) => item.id === jugador.jugadorId).rol).not.toBe('admin')
    expect(() => servicio.actualizarJugador('otro', {}, jugador)).toThrowError(/propio/)
    expect(() => servicio.actualizarJugador(jugador.jugadorId, { apodo: '' }, jugador)).toThrowError(/obligatorio/)
  })
  it('resuelve participante o texto pendiente', () => {
    expect(servicio.nombreParticipante(datos, equipo.id)).toBe(equipo.nombre)
    expect(servicio.nombreParticipante(datos, jugador.jugadorId)).toBeTruthy()
    expect(servicio.nombreParticipante(datos, null)).toBe('Participante por definir')
    expect(servicio.nombreParticipante(datos, 'otro')).toBe('Participante por definir')
  })
})
