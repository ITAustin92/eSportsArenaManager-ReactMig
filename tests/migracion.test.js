import test from 'node:test'
import assert from 'node:assert/strict'
import { catalogoTorneos, filtrarTorneos, fechasValidas, claseEstado } from '../src/logica/torneos.js'
import { detallesTorneos } from '../src/logica/detallesTorneos.js'
import { validarInscripcion, motivoBloqueo, tipoPermitido } from '../src/logica/inscripcion.js'
import { validarEquipo, agregarIntegrante, quitarIntegrante } from '../src/logica/equipos.js'
import { validarApodo } from '../src/logica/perfil.js'
import { resolverRuta } from '../src/logica/navegacion.js'

const valorant = catalogoTorneos[0]
const lol = catalogoTorneos[1]
const sf6 = catalogoTorneos.find(t => t.modalidad === '1v1')
const inscripcion = { tipoParticipante: 'equipo', equipoSeleccionado: 'KRU', correo: 'capitan@ejemplo.com' }
const equipo = { nombre: 'Nuevo Equipo', juego: 'Rocket League', capitan: 'Felipe', integrantes: ['Felipe', 'Matias', 'Sofia'] }

test('los cinco detalles coinciden con los datos del catálogo', () => {
  for (const torneo of catalogoTorneos) {
    const detalle = detallesTorneos[torneo.id]
    for (const campo of ['nombre', 'juego', 'modalidad', 'estado', 'cuposOcupados', 'cuposMaximos']) {
      assert.equal(detalle.infoGeneral[campo], torneo[campo])
    }
    assert.ok(detalle.posiciones.length && detalle.participantes.length && detalle.partidas.length && detalle.premios.length)
  }
})

test('búsqueda combinada y fechas inclusivas sin mutar los datos', () => {
  const original = JSON.stringify(catalogoTorneos)
  assert.deepEqual(filtrarTorneos(catalogoTorneos, { busqueda: 'COPA', juego: 'Valorant', estado: 'Abierto' }).map(t => t.id), [valorant.id])
  assert.deepEqual(filtrarTorneos(catalogoTorneos, { fechaInicio: '2026-10-15', fechaFin: '2026-10-30' }).map(t => t.id), [valorant.id, sf6.id])
  assert.equal(filtrarTorneos(catalogoTorneos, { busqueda: 'inexistente' }).length, 0)
  assert.equal(fechasValidas({ fechaInicio: '2026-12-01', fechaFin: '2026-10-01' }), false)
  assert.equal(fechasValidas({ fechaInicio: '2026-12-01', fechaFin: '' }), true)
  assert.equal(JSON.stringify(catalogoTorneos), original)
})

test('clases de estado originales, sin inventar clases para valores desconocidos', () => {
  assert.equal(claseEstado('En Curso'), 'estado-en-curso')
  assert.equal(claseEstado('Finalizado'), 'estado-finalizado')
  assert.equal(claseEstado('desconocido'), '')
})

test('inscripciones válidas de equipo e individual', () => {
  assert.deepEqual(validarInscripcion(inscripcion, valorant), {})
  assert.deepEqual(validarInscripcion({ tipoParticipante: 'jugador', correo: ' jugador@ejemplo.com ' }, sf6), {})
  assert.equal(tipoPermitido(sf6), 'jugador')
})

test('correo inválido y tipo obligatorio o incompatible', () => {
  for (const correo of ['', 'a@b', 'a b@ejemplo.com', 'a@@ejemplo.com']) {
    assert.ok(validarInscripcion({ ...inscripcion, correo }, valorant).correo)
  }
  assert.ok(validarInscripcion({ ...inscripcion, tipoParticipante: '' }, valorant).tipoParticipante)
  assert.ok(validarInscripcion({ ...inscripcion, tipoParticipante: 'jugador' }, valorant).tipoParticipante)
  assert.ok(validarInscripcion(inscripcion, sf6).tipoParticipante)
})

test('bloquea equipos incompletos, sancionados e inexistentes', () => {
  for (const equipoSeleccionado of ['', 'incompleto', 'sancionado', 'inventado']) {
    assert.ok(validarInscripcion({ ...inscripcion, equipoSeleccionado }, valorant).equipo)
  }
})

test('bloquea torneos en curso, finalizados o sin cupos', () => {
  assert.ok(motivoBloqueo(lol))
  assert.ok(motivoBloqueo(catalogoTorneos[3]))
  assert.ok(motivoBloqueo({ ...valorant, cuposOcupados: 16 }))
  assert.ok(validarInscripcion(inscripcion, lol).torneo)
  assert.equal(motivoBloqueo(valorant), '')
})

test('permite inscribir un equipo creado solo en su juego', () => {
  const creados = [{ ...equipo, id: 'nuevo' }]
  const datos = { ...inscripcion, equipoSeleccionado: 'nuevo' }
  assert.deepEqual(validarInscripcion(datos, catalogoTorneos[2], creados), {})
  assert.ok(validarInscripcion(datos, valorant, creados).equipo)
})

test('equipo requiere nombre único, juego y capitán integrante', () => {
  assert.deepEqual(validarEquipo(equipo), {})
  assert.ok(validarEquipo({ ...equipo, nombre: ' KRÜ Esports ' }).nombre)
  assert.ok(validarEquipo(equipo, [{ nombre: 'NUEVO EQUIPO' }]).nombre)
  assert.ok(validarEquipo({ ...equipo, juego: '' }).juego)
  assert.ok(validarEquipo({ ...equipo, capitan: '' }).capitan)
  assert.ok(validarEquipo({ ...equipo, integrantes: ['Matias', 'Sofia', 'Juan'] }).capitan)
})

test('equipo exige cantidad exacta y no acepta jugadores duplicados', () => {
  assert.ok(validarEquipo({ ...equipo, integrantes: ['Felipe', 'Matias'] }).integrantes)
  assert.ok(validarEquipo({ ...equipo, integrantes: ['Felipe', 'Matias', 'Sofia', 'Juan'] }).integrantes)
  assert.ok(validarEquipo({ ...equipo, integrantes: ['Felipe', 'Felipe', 'Sofia'] }).integrantes)
  assert.ok(validarEquipo({ ...equipo, juego: 'Valorant' }).integrantes)
  assert.deepEqual(validarEquipo({ ...equipo, juego: 'Valorant', integrantes: ['Felipe', 'Matias', 'Sofia', 'Juan', 'Valentina'] }), {})
})

test('agregar y quitar integrantes conserva la lista anterior', () => {
  const anterior = [{ id: 1 }]
  assert.deepEqual(agregarIntegrante(anterior, { id: 2 }), [{ id: 1 }, { id: 2 }])
  assert.deepEqual(quitarIntegrante(anterior, 1), [])
  assert.deepEqual(anterior, [{ id: 1 }])
})

test('apodo obligatorio, sin espacios y entre 3 y 15 caracteres', () => {
  for (const apodo of ['', '   ', 'ab', 'dos palabras', 'a'.repeat(16)]) assert.ok(validarApodo(apodo))
  for (const apodo of ['abc', 'FakerLATAM', 'a'.repeat(15)]) assert.equal(validarApodo(apodo), '')
})

test('enlaces directos conservan el torneo y rutas inválidas tienen fallback', () => {
  assert.deepEqual(resolverRuta('#detalle?id=' + sf6.id), { vista: 'detalle', torneoId: sf6.id })
  assert.equal(resolverRuta('#detalle?id=inexistente').vista, 'torneos')
  assert.equal(resolverRuta('#detalle?id=__proto__').vista, 'torneos')
  assert.equal(resolverRuta('#detalle').vista, 'torneos')
  assert.equal(resolverRuta('#inscripcion?id=' + sf6.id).torneoId, sf6.id)
  assert.equal(resolverRuta('#desconocida').vista, 'inicio')
  for (const vista of ['inicio', 'torneos', 'inscripcion', 'equipos', 'perfil']) assert.equal(resolverRuta('#' + vista).vista, vista)
})
