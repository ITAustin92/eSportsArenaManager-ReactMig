import { validarTorneo } from '../logica/torneos.js'
import { validarJuego } from '../logica/juegos.js'
import { normalizarNombre, validarEquipo } from '../logica/equipos.js'
import { validarInscripcion } from '../logica/inscripcion.js'
import { validarApodo } from '../logica/perfil.js'
import { datosGuardadosValidos } from './validarDatos.js'

export const usuariosPrueba = [
  { id: 'u-admin', nombre: 'Administración Demo', correo: 'admin@arena.example', clave: 'Admin123!', rol: 'admin', jugadorId: null },
  { id: 'u-felipe', nombre: 'Felipe Demo', correo: 'felipe@arena.example', clave: 'Jugador123!', rol: 'jugador', jugadorId: 'p-felipe' },
  { id: 'u-sofia', nombre: 'Sofía Demo', correo: 'sofia@arena.example', clave: 'Jugador123!', rol: 'jugador', jugadorId: 'p-sofia' },
]

const plantillas = [
  {
    "id": "copa-latam-valorant",
    "nombre": "Copa Latam Valorant",
    "juego": "Valorant",
    "estado": "Abierto",
    "cupoMax": 16,
    "participantes": [
      "KRÜ Esports",
      "Leviatán",
      "9z Team",
      "Furious Gaming"
    ],
    "premios": [
      {
        "posicion": "1er Lugar",
        "recompensa": "$5,000 USD"
      },
      {
        "posicion": "2do Lugar",
        "recompensa": "$2,000 USD"
      },
      {
        "posicion": "3er Lugar",
        "recompensa": "$1,000 USD"
      }
    ],
    "ranking": [
      {
        "pos": 1,
        "equipo": "KRÜ Esports",
        "victorias": 3,
        "derrotas": 0,
        "puntos": 9
      },
      {
        "pos": 2,
        "equipo": "Leviatán",
        "victorias": 2,
        "derrotas": 1,
        "puntos": 6
      },
      {
        "pos": 3,
        "equipo": "9z Team",
        "victorias": 1,
        "derrotas": 2,
        "puntos": 3
      },
      {
        "pos": 4,
        "equipo": "Furious Gaming",
        "victorias": 0,
        "derrotas": 3,
        "puntos": 0
      }
    ],
    "partidas": [
      {
        "equipo1": "KRÜ Esports",
        "equipo2": "Leviatán",
        "fecha": "18 de Octubre, 18:00 hrs",
        "ronda": "Semifinal"
      },
      {
        "equipo1": "9z Team",
        "equipo2": "Furious Gaming",
        "fecha": "18 de Octubre, 20:00 hrs",
        "ronda": "Semifinal"
      }
    ]
  },
  {
    "id": "torneo-verano-lol",
    "nombre": "Torneo de Verano LoL",
    "juego": "League of Legends",
    "estado": "En Curso",
    "cupoMax": 32,
    "participantes": [
      "All Knights",
      "Isurus Gaming",
      "Estral Esports",
      "Furious Gaming"
    ],
    "premios": [
      {
        "posicion": "1er Lugar",
        "recompensa": "$4,000 USD"
      },
      {
        "posicion": "2do Lugar",
        "recompensa": "$1,500 USD"
      },
      {
        "posicion": "3er Lugar",
        "recompensa": "$750 USD"
      }
    ],
    "ranking": [
      {
        "pos": 1,
        "equipo": "All Knights",
        "victorias": 5,
        "derrotas": 1,
        "puntos": 15
      },
      {
        "pos": 2,
        "equipo": "Isurus Gaming",
        "victorias": 4,
        "derrotas": 2,
        "puntos": 12
      },
      {
        "pos": 3,
        "equipo": "Estral Esports",
        "victorias": 3,
        "derrotas": 3,
        "puntos": 9
      },
      {
        "pos": 4,
        "equipo": "Furious Gaming",
        "victorias": 2,
        "derrotas": 4,
        "puntos": 6
      }
    ],
    "partidas": [
      {
        "equipo1": "All Knights",
        "equipo2": "Estral Esports",
        "fecha": "10 de Septiembre, 19:00 hrs",
        "ronda": "Semifinal"
      },
      {
        "equipo1": "Isurus Gaming",
        "equipo2": "Furious Gaming",
        "fecha": "11 de Septiembre, 19:00 hrs",
        "ronda": "Semifinal"
      }
    ]
  },
  {
    "id": "liga-fin-de-semana",
    "nombre": "Liga Fin de Semana",
    "juego": "Rocket League",
    "estado": "Abierto",
    "cupoMax": 8,
    "participantes": [
      "Furia Rocket",
      "Andes FC",
      "Nova Wheels",
      "Team Condor"
    ],
    "premios": [
      {
        "posicion": "1er Lugar",
        "recompensa": "$1,500 USD"
      },
      {
        "posicion": "2do Lugar",
        "recompensa": "$700 USD"
      }
    ],
    "ranking": [
      {
        "pos": 1,
        "equipo": "Furia Rocket",
        "victorias": 2,
        "derrotas": 0,
        "puntos": 6
      },
      {
        "pos": 2,
        "equipo": "Andes FC",
        "victorias": 1,
        "derrotas": 1,
        "puntos": 3
      },
      {
        "pos": 3,
        "equipo": "Nova Wheels",
        "victorias": 0,
        "derrotas": 2,
        "puntos": 0
      }
    ],
    "partidas": [
      {
        "equipo1": "Furia Rocket",
        "equipo2": "Team Condor",
        "fecha": "21 de Noviembre, 16:00 hrs",
        "ronda": "Cuartos de final"
      },
      {
        "equipo1": "Andes FC",
        "equipo2": "Nova Wheels",
        "fecha": "21 de Noviembre, 18:00 hrs",
        "ronda": "Cuartos de final"
      }
    ]
  },
  {
    "id": "clasificatorias-regionales",
    "nombre": "Clasificatorias Regionales",
    "juego": "Valorant",
    "estado": "Finalizado",
    "cupoMax": 16,
    "participantes": [
      "Leviatán",
      "KRÜ Esports",
      "9z Team",
      "Lyon Gaming"
    ],
    "premios": [
      {
        "posicion": "1er Lugar",
        "recompensa": "$6,000 USD"
      },
      {
        "posicion": "2do Lugar",
        "recompensa": "$2,500 USD"
      },
      {
        "posicion": "3er Lugar",
        "recompensa": "$1,000 USD"
      }
    ],
    "ranking": [
      {
        "pos": 1,
        "equipo": "Leviatán",
        "victorias": 6,
        "derrotas": 1,
        "puntos": 18
      },
      {
        "pos": 2,
        "equipo": "KRÜ Esports",
        "victorias": 5,
        "derrotas": 2,
        "puntos": 15
      },
      {
        "pos": 3,
        "equipo": "9z Team",
        "victorias": 4,
        "derrotas": 3,
        "puntos": 12
      },
      {
        "pos": 4,
        "equipo": "Lyon Gaming",
        "victorias": 3,
        "derrotas": 4,
        "puntos": 9
      }
    ],
    "partidas": [
      {
        "equipo1": "Leviatán",
        "equipo2": "KRÜ Esports",
        "fecha": "15 de Agosto, 20:00 hrs",
        "ronda": "Final"
      },
      {
        "equipo1": "9z Team",
        "equipo2": "Lyon Gaming",
        "fecha": "15 de Agosto, 18:00 hrs",
        "ronda": "3er lugar"
      }
    ]
  },
  {
    "id": "copa-rank-street-fighter-6",
    "nombre": "Copa Rank Street Fighter 6",
    "juego": "Street Fighter 6",
    "estado": "Abierto",
    "cupoMax": 32,
    "participantes": [
      "DiegoV",
      "Kaiser",
      "Maki",
      "Rex",
      "SonicLeo",
      "Valkyrie"
    ],
    "premios": [
      {
        "posicion": "1er Lugar",
        "recompensa": "$2,000 USD"
      },
      {
        "posicion": "2do Lugar",
        "recompensa": "$800 USD"
      }
    ],
    "ranking": [
      {
        "pos": 1,
        "equipo": "DiegoV",
        "victorias": 4,
        "derrotas": 0,
        "puntos": 12
      },
      {
        "pos": 2,
        "equipo": "Kaiser",
        "victorias": 3,
        "derrotas": 1,
        "puntos": 9
      },
      {
        "pos": 3,
        "equipo": "Maki",
        "victorias": 2,
        "derrotas": 2,
        "puntos": 6
      },
      {
        "pos": 4,
        "equipo": "Rex",
        "victorias": 1,
        "derrotas": 3,
        "puntos": 3
      }
    ],
    "partidas": [
      {
        "equipo1": "DiegoV",
        "equipo2": "SonicLeo",
        "fecha": "31 de Octubre, 17:00 hrs",
        "ronda": "Cuartos de final"
      },
      {
        "equipo1": "Kaiser",
        "equipo2": "Valkyrie",
        "fecha": "31 de Octubre, 18:00 hrs",
        "ronda": "Cuartos de final"
      }
    ]
  }
]

export const claveDatos = 'arena-ep2-datos-v1'
const copiar = (dato) => structuredClone(dato)
const idNombre = (nombre) => normalizarNombre(nombre).replace(/[^a-z0-9]+/g, '-')
const fechaRelativa = (hoy, dias) => new Date(new Date(hoy).getTime() + dias * 86400000).toISOString()

export function crearDatosIniciales(hoy = new Date()) {
  const juegos = [
    { id: 'valorant', nombre: 'Valorant', jugadoresPorEquipo: 5, modalidad: 'equipos', imagen: '/img/valorant.jpg' },
    { id: 'lol', nombre: 'League of Legends', jugadoresPorEquipo: 5, modalidad: 'equipos', imagen: '/img/lol.png' },
    { id: 'rocket', nombre: 'Rocket League', jugadoresPorEquipo: 3, modalidad: 'equipos', imagen: '/img/rocket.png' },
    { id: 'sf6', nombre: 'Street Fighter 6', jugadoresPorEquipo: 1, modalidad: '1v1', imagen: '/img/sf6.jpg' },
  ]
  const jugadores = ['Felipe', 'Matias', 'Sofia', 'Juan', 'Valentina', 'Pedro', 'Lucia'].map((nombre) => ({
    id: 'p-' + nombre.toLowerCase(), nombre: nombre + ' Demo', apodo: nombre === 'Felipe' ? 'FakerLATAM' : nombre + 'Arena',
    correo: nombre.toLowerCase() + '@arena.example', equipos: [], historial: [], victorias: nombre === 'Felipe' ? 42 : 0,
    derrotas: nombre === 'Felipe' ? 18 : 0, avatar: '', sanciones: nombre === 'Sofia'
      ? [{ id: 's-sofia', motivo: 'Abandono de partida (ejemplo)', vigente: true, desde: fechaRelativa(hoy, -2), hasta: fechaRelativa(hoy, 15) }]
      : [{ id: 's-' + nombre, motivo: 'Advertencia cumplida (ejemplo)', vigente: false, desde: fechaRelativa(hoy, -20), hasta: fechaRelativa(hoy, -10) }],
  }))
  const equipos = []
  const torneos = []
  const resultados = []
  const inscripciones = []
  for (const [numero, plantilla] of plantillas.entries()) {
    const juego = juegos.find((item) => item.nombre === plantilla.juego)
    const obtenerId = (nombre) => (juego.modalidad === '1v1' ? 'p-' : 'e-') + idNombre(nombre)
    const inscritos = plantilla.participantes.map((nombre) => {
      // Un mismo nombre en juegos distintos representa plantillas distintas.
      const id = juego.modalidad === '1v1' ? obtenerId(nombre) : obtenerId(nombre) + '-' + juego.id
      if (juego.modalidad === '1v1') {
        jugadores.push({ id, nombre, apodo: nombre, correo: id + '@arena.example', equipos: [], historial: [], victorias: 0, derrotas: 0, sanciones: [], avatar: '' })
      } else if (!equipos.some((item) => item.id === id)) {
        const integrantes = Array.from({ length: juego.jugadoresPorEquipo }, (_, indice) => ({
          id: id + '-p' + (indice + 1), nombre: nombre + ' jugador ' + (indice + 1),
          apodo: idNombre(nombre).slice(0, 8) + (indice + 1), correo: id + '-p' + (indice + 1) + '@arena.example', rol: indice === 0 ? 'Capitán' : 'Titular',
        }))
        equipos.push({ id, nombre, juegoId: juego.id, capitanId: integrantes[0].id, integrantes, estado: 'habilitado', suplentes: 0, torneosIds: [], sanciones: [] })
        jugadores.push(...integrantes.map((miembro) => ({ ...miembro, equipos: [id], historial: [], victorias: 0, derrotas: 0, sanciones: [], avatar: '' })))
      }
      if (juego.modalidad === 'equipos') equipos.find((item) => item.id === id).torneosIds.push(plantilla.id)
      inscripciones.push({ id: 'i-' + plantilla.id + '-' + id, torneoId: plantilla.id, participanteId: id, tipoParticipante: juego.modalidad === '1v1' ? 'jugador' : 'equipo', correo: id + '@arena.example', jugadorId: juego.modalidad === '1v1' ? id : equipos.find((item) => item.id === id).capitanId })
      return id
    })
    const idParticipante = (nombre) => obtenerId(nombre) + (juego.modalidad === '1v1' ? '' : '-' + juego.id)
    const terminado = plantilla.estado === 'Finalizado'
    const activo = plantilla.estado === 'En Curso'
    const partidas = plantilla.partidas.map((partida, indice) => ({
      id: 'partida-' + plantilla.id + '-' + indice, ronda: partida.ronda,
      localId: idParticipante(partida.equipo1), visitanteId: idParticipante(partida.equipo2),
      horario: fechaRelativa(hoy, terminado ? -5 : activo ? 1 : 35 + numero),
      estado: terminado ? 'Finalizada' : activo && indice === 0 ? 'En juego' : 'Programada',
    }))
    if (!terminado) partidas.push({ id: 'final-' + plantilla.id, ronda: 'Final', localId: null, visitanteId: null, horario: fechaRelativa(hoy, 40 + numero), estado: 'Programada' })
    if (terminado) for (const partida of partidas) resultados.push({ id: 'r-' + partida.id, torneoId: plantilla.id, partidaId: partida.id, localId: partida.localId, visitanteId: partida.visitanteId, puntajeLocal: 2, puntajeVisitante: 1, estado: 'Finalizada' })
    torneos.push({
      id: plantilla.id, nombre: plantilla.nombre, juegoId: juego.id, estado: plantilla.estado, cupoMax: plantilla.cupoMax, inscritos,
      cierreISO: fechaRelativa(hoy, terminado ? -15 : activo ? -3 : 30 + numero),
      fechaInicio: fechaRelativa(hoy, terminado ? -10 : activo ? -1 : 34 + numero),
      premios: plantilla.premios.map((premio, indice) => ({ id: plantilla.id + '-premio-' + indice, posicion: indice + 1, recompensa: premio.recompensa })),
      partidas, ranking: plantilla.ranking.map((fila) => ({
        participanteId: idParticipante(fila.equipo), nombre: fila.equipo, victorias: fila.victorias, derrotas: fila.derrotas,
        puntos: fila.puntos, aFavor: fila.victorias * 2, enContra: fila.derrotas * 2,
      })),
    })
  }
  const miembros = jugadores.filter((item) => ['p-felipe', 'p-matias', 'p-juan', 'p-valentina', 'p-pedro'].includes(item.id))
    .map((item) => ({ id: item.id, nombre: item.nombre, apodo: item.apodo, correo: item.correo, rol: item.id === 'p-felipe' ? 'Capitán' : 'Titular' }))
  for (const [id, nombre, estado] of [['e-demo', 'Arena Demo', 'habilitado'], ['e-incompleto', 'Equipo Incompleto', 'incompleto'], ['e-sancionado', 'Equipo Sancionado', 'sancionado'], ['e-inactivo', 'Equipo Inactivo', 'inactivo']]) {
    equipos.push({ id, nombre, juegoId: 'valorant', capitanId: 'p-felipe', integrantes: copiar(estado === 'incompleto' ? miembros.slice(0, 3) : miembros), estado, suplentes: 0, torneosIds: [], sanciones: estado === 'sancionado' ? [{ id: 's-equipo', motivo: 'Conducta antideportiva (ejemplo)', vigente: true, desde: fechaRelativa(hoy, -1), hasta: fechaRelativa(hoy, 20) }] : [] })
  }
  for (const jugador of jugadores) jugador.equipos = equipos.filter((equipo) => equipo.integrantes.some((miembro) => miembro.id === jugador.id)).map((equipo) => equipo.id)
  jugadores[0].historial = [{ id: 'hist-1', torneoId: 'clasificatorias-regionales', nombre: 'Clasificatorias Regionales', resultado: 'Participación histórica de ejemplo' }]
  return { version: 1, juegos, torneos, equipos, jugadores, inscripciones, resultados }
}

let base = null
let almacenamiento = null
const oyentes = new Set()

export function inicializarDatos(storage = globalThis.localStorage) {
  almacenamiento = storage
  let textoGuardado = null
  let recuperar = false
  try {
    textoGuardado = storage?.getItem(claveDatos) ?? null
    const guardado = JSON.parse(textoGuardado ?? 'null')
    const valido = datosGuardadosValidos(guardado, usuariosPrueba.filter((usuario) => usuario.jugadorId).map((usuario) => usuario.jugadorId))
    recuperar = Boolean(textoGuardado) && !valido
    base = valido ? guardado : crearDatosIniciales()
  } catch {
    recuperar = Boolean(textoGuardado)
    base = crearDatosIniciales()
  }
  // Fija las fechas de la demostración desde la primera carga.
  // Conserva el original inválido antes de sustituirlo. Si falla el respaldo, no lo sobrescribe.
  try {
    if (recuperar) storage?.setItem(claveDatos + '-respaldo-invalido', textoGuardado)
    storage?.setItem(claveDatos, JSON.stringify(base))
  } catch { /* Los próximos cambios informan si el almacenamiento sigue bloqueado. */ }
  return copiar(base)
}

export function obtenerDatos() {
  if (!base) inicializarDatos()
  return copiar(base)
}

export function suscribirDatos(onCambiar) {
  oyentes.add(onCambiar)
  return () => oyentes.delete(onCambiar)
}

function guardar(siguiente) {
  // Guardamos antes de notificar: cupos e inscripciones se publican juntos.
  try {
    almacenamiento?.setItem(claveDatos, JSON.stringify(siguiente))
  } catch {
    throw new Error('No se pudo guardar. Revisa el espacio o los permisos del almacenamiento del navegador.')
  }
  base = siguiente
  oyentes.forEach((onCambiar) => onCambiar(obtenerDatos()))
}

function exigirRol(sesion, rol) {
  if (sesion?.rol !== rol) throw new Error('No tienes permiso para esta operación.')
}

function exigirValido(errores) {
  if (Object.keys(errores).length > 0) throw new Error(Object.values(errores)[0])
}

function buscar(lista, id) {
  const item = lista.find((valor) => valor.id === id)
  if (!item) throw new Error('El registro ya no existe.')
  return item
}

export const obtenerTorneos = () => obtenerDatos().torneos
export const obtenerTorneoPorId = (id) => obtenerTorneos().find((torneo) => torneo.id === id)
export const obtenerEquipos = () => obtenerDatos().equipos
export const obtenerEquipoPorId = (id) => obtenerEquipos().find((equipo) => equipo.id === id)
export const obtenerJuegos = () => obtenerDatos().juegos
export const obtenerJuegoPorId = (id) => obtenerJuegos().find((juego) => juego.id === id)
export const obtenerInscripciones = () => obtenerDatos().inscripciones
export const obtenerInscripcionPorId = (id) => obtenerInscripciones().find((item) => item.id === id)

export function crearTorneo(datos, sesion) {
  exigirRol(sesion, 'admin')
  const siguiente = obtenerDatos()
  buscar(siguiente.juegos, datos.juegoId)
  exigirValido(validarTorneo(datos))
  const torneo = { ...datos, nombre: datos.nombre.trim(), cupoMax: Number(datos.cupoMax), id: crypto.randomUUID(), inscritos: [], premios: [], partidas: [], ranking: [] }
  siguiente.torneos.push(torneo)
  guardar(siguiente)
  return copiar(torneo)
}

export function actualizarTorneo(id, datos, sesion) {
  exigirRol(sesion, 'admin')
  const siguiente = obtenerDatos()
  const anterior = buscar(siguiente.torneos, id)
  exigirValido(validarTorneo(datos, anterior))
  buscar(siguiente.juegos, datos.juegoId)
  if (datos.juegoId !== anterior.juegoId && anterior.inscritos.length > 0) throw new Error('No se puede cambiar el juego de un torneo con inscritos.')
  siguiente.torneos = siguiente.torneos.map((torneo) => torneo.id === id ? { ...anterior, nombre: datos.nombre.trim(), juegoId: datos.juegoId, cupoMax: Number(datos.cupoMax), cierreISO: datos.cierreISO, fechaInicio: datos.fechaInicio, estado: datos.estado } : torneo)
  guardar(siguiente)
}

export function eliminarTorneo(id, sesion) {
  exigirRol(sesion, 'admin')
  const siguiente = obtenerDatos()
  const torneo = buscar(siguiente.torneos, id)
  if (torneo.estado !== 'Abierto' || torneo.inscritos.length > 0) throw new Error('Solo se puede eliminar un torneo abierto sin inscritos.')
  siguiente.torneos = siguiente.torneos.filter((item) => item.id !== id)
  guardar(siguiente)
}

export function crearJuego(datos, sesion) {
  exigirRol(sesion, 'admin')
  const siguiente = obtenerDatos()
  exigirValido(validarJuego(datos, siguiente.juegos))
  const juego = { ...datos, nombre: datos.nombre.trim(), jugadoresPorEquipo: Number(datos.jugadoresPorEquipo), id: crypto.randomUUID(), imagen: '' }
  siguiente.juegos.push(juego)
  guardar(siguiente)
  return copiar(juego)
}

export function actualizarJuego(id, datos, sesion) {
  exigirRol(sesion, 'admin')
  const siguiente = obtenerDatos()
  const anterior = buscar(siguiente.juegos, id)
  exigirValido(validarJuego({ ...datos, id }, siguiente.juegos))
  const referenciado = siguiente.torneos.some((torneo) => torneo.juegoId === id) || siguiente.equipos.some((equipo) => equipo.juegoId === id)
  if (referenciado && (anterior.modalidad !== datos.modalidad || anterior.jugadoresPorEquipo !== Number(datos.jugadoresPorEquipo))) throw new Error('No se puede cambiar la modalidad o el tamaño de un juego que ya tiene equipos o torneos.')
  siguiente.juegos = siguiente.juegos.map((juego) => juego.id === id ? { ...anterior, nombre: datos.nombre.trim(), modalidad: datos.modalidad, jugadoresPorEquipo: Number(datos.jugadoresPorEquipo) } : juego)
  guardar(siguiente)
}

export function eliminarJuego(id, sesion) {
  exigirRol(sesion, 'admin')
  const siguiente = obtenerDatos()
  buscar(siguiente.juegos, id)
  if (siguiente.torneos.some((torneo) => torneo.juegoId === id) || siguiente.equipos.some((equipo) => equipo.juegoId === id)) throw new Error('No se puede eliminar un juego con equipos o torneos asociados.')
  siguiente.juegos = siguiente.juegos.filter((item) => item.id !== id)
  guardar(siguiente)
}

function prepararEquipo(datos, siguiente, sesion, anterior) {
  exigirRol(sesion, 'jugador')
  if (anterior && anterior.capitanId !== sesion.jugadorId) throw new Error('Solo el capitán puede modificar el equipo.')
  if (datos.capitanId !== sesion.jugadorId) throw new Error('Debes ser el capitán de tu equipo.')
  if (anterior?.torneosIds.length > 0) throw new Error('La plantilla queda bloqueada mientras el equipo esté inscrito.')
  exigirValido(validarEquipo(datos, siguiente.equipos, buscar(siguiente.juegos, datos.juegoId)))
  if (!['habilitado', 'inactivo'].includes(datos.estado)) throw new Error('Estado no válido.')
  // La clave se valida como ejercicio; no se almacena ni autentica usuarios.
  return {
    id: anterior?.id ?? crypto.randomUUID(), nombre: datos.nombre.trim(), juegoId: datos.juegoId,
    capitanId: datos.capitanId, suplentes: Number(datos.suplentes), estado: datos.estado,
    integrantes: datos.integrantes.map((miembro) => {
      const jugador = buscar(siguiente.jugadores, miembro.id)
      return { id: jugador.id, nombre: jugador.nombre, apodo: jugador.apodo, correo: jugador.correo, rol: miembro.id === datos.capitanId ? 'Capitán' : miembro.rol === 'Suplente' ? 'Suplente' : 'Titular' }
    }),
    torneosIds: anterior?.torneosIds ?? [], sanciones: anterior?.sanciones ?? [],
  }
}

function sincronizarPertenencias(siguiente) {
  siguiente.jugadores = siguiente.jugadores.map((jugador) => ({ ...jugador, equipos: siguiente.equipos.filter((equipo) => equipo.integrantes.some((miembro) => miembro.id === jugador.id)).map((equipo) => equipo.id) }))
}

export function crearEquipo(datos, sesion) {
  const siguiente = obtenerDatos()
  const equipo = prepararEquipo(datos, siguiente, sesion)
  siguiente.equipos.push(equipo)
  sincronizarPertenencias(siguiente)
  guardar(siguiente)
  return copiar(equipo)
}

export function actualizarEquipo(id, datos, sesion) {
  const siguiente = obtenerDatos()
  const equipo = prepararEquipo({ ...datos, id }, siguiente, sesion, buscar(siguiente.equipos, id))
  siguiente.equipos = siguiente.equipos.map((item) => item.id === id ? equipo : item)
  sincronizarPertenencias(siguiente)
  guardar(siguiente)
}

export function eliminarEquipo(id, sesion) {
  exigirRol(sesion, 'jugador')
  const siguiente = obtenerDatos()
  const equipo = buscar(siguiente.equipos, id)
  if (equipo.capitanId !== sesion.jugadorId || equipo.torneosIds.length > 0) throw new Error('Solo puedes eliminar equipos propios sin inscripciones.')
  siguiente.equipos = siguiente.equipos.filter((item) => item.id !== id)
  sincronizarPertenencias(siguiente)
  guardar(siguiente)
}

export function crearInscripcion(datos, sesion) {
  exigirRol(sesion, 'jugador')
  const siguiente = obtenerDatos()
  const torneo = buscar(siguiente.torneos, datos.torneoId)
  const juego = buscar(siguiente.juegos, torneo.juegoId)
  const jugador = buscar(siguiente.jugadores, sesion.jugadorId)
  const equipo = siguiente.equipos.find((item) => item.id === datos.equipoId)
  exigirValido(validarInscripcion(datos, { torneo, juego, jugador, equipo, inscripciones: siguiente.inscripciones, jugadores: siguiente.jugadores }))
  const participanteId = datos.tipoParticipante === 'equipo' ? equipo.id : jugador.id
  const registro = { id: crypto.randomUUID(), torneoId: torneo.id, participanteId, tipoParticipante: datos.tipoParticipante, correo: datos.correo.trim(), jugadorId: jugador.id }
  siguiente.inscripciones.push(registro)
  torneo.inscritos = [...torneo.inscritos, participanteId]
  if (equipo && datos.tipoParticipante === 'equipo') equipo.torneosIds = [...equipo.torneosIds, torneo.id]
  guardar(siguiente)
  return copiar(registro)
}

function inscripcionEditable(siguiente, id, sesion) {
  exigirRol(sesion, 'jugador')
  const registro = buscar(siguiente.inscripciones, id)
  if (registro.jugadorId !== sesion.jugadorId) throw new Error('Esta inscripción pertenece a otro jugador.')
  const torneo = buscar(siguiente.torneos, registro.torneoId)
  if (torneo.estado !== 'Abierto' || Date.now() > Date.parse(torneo.cierreISO)) throw new Error('La inscripción ya no se puede modificar.')
  return { registro, torneo }
}

export function actualizarInscripcion(id, datos, sesion) {
  const siguiente = obtenerDatos()
  inscripcionEditable(siguiente, id, sesion)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo?.trim() ?? '')) throw new Error('Ingresa un correo válido.')
  siguiente.inscripciones = siguiente.inscripciones.map((item) => item.id === id ? { ...item, correo: datos.correo.trim() } : item)
  guardar(siguiente)
}

export function eliminarInscripcion(id, sesion) {
  const siguiente = obtenerDatos()
  const { registro, torneo } = inscripcionEditable(siguiente, id, sesion)
  siguiente.inscripciones = siguiente.inscripciones.filter((item) => item.id !== id)
  torneo.inscritos = torneo.inscritos.filter((participanteId) => participanteId !== registro.participanteId)
  siguiente.equipos = siguiente.equipos.map((equipo) => equipo.id === registro.participanteId ? { ...equipo, torneosIds: equipo.torneosIds.filter((torneoId) => torneoId !== torneo.id) } : equipo)
  guardar(siguiente)
}

export function actualizarJugador(id, cambios, sesion) {
  exigirRol(sesion, 'jugador')
  if (id !== sesion.jugadorId) throw new Error('Solo puedes editar tu propio perfil.')
  const siguiente = obtenerDatos()
  const anterior = buscar(siguiente.jugadores, id)
  if (cambios.apodo !== undefined) {
    const error = validarApodo(cambios.apodo)
    if (error) throw new Error(error)
  }
  const jugador = { ...anterior, apodo: cambios.apodo ?? anterior.apodo, avatar: cambios.avatar ?? anterior.avatar }
  siguiente.jugadores = siguiente.jugadores.map((item) => item.id === id ? jugador : item)
  siguiente.equipos = siguiente.equipos.map((equipo) => ({ ...equipo, integrantes: equipo.integrantes.map((miembro) => miembro.id === id ? { ...miembro, apodo: jugador.apodo } : miembro) }))
  guardar(siguiente)
}

export function nombreParticipante(datos, id) {
  if (!id) return 'Participante por definir'
  return datos.equipos.find((equipo) => equipo.id === id)?.nombre ?? datos.jugadores.find((jugador) => jugador.id === id)?.apodo ?? 'Participante por definir'
}
