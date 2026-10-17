export const catalogoTorneos = [
  { id: 'copa-latam-valorant', nombre: 'Copa Latam Valorant', juego: 'Valorant', modalidad: '5v5', cuposOcupados: 14, cuposMaximos: 16, fechaCierre: '2026-10-15', estado: 'Abierto', imagen: 'img/valorant.jpg' },
  { id: 'torneo-verano-lol', nombre: 'Torneo de Verano LoL', juego: 'League of Legends', modalidad: '5v5', cuposOcupados: 32, cuposMaximos: 32, fechaCierre: '2026-09-01', estado: 'En Curso', imagen: 'img/lol.png' },
  { id: 'liga-fin-de-semana', nombre: 'Liga Fin de Semana', juego: 'Rocket League', modalidad: '3v3', cuposOcupados: 4, cuposMaximos: 8, fechaCierre: '2026-11-20', estado: 'Abierto', imagen: 'img/rocket.png' },
  { id: 'clasificatorias-regionales', nombre: 'Clasificatorias Regionales', juego: 'Valorant', modalidad: '5v5', cuposOcupados: 16, cuposMaximos: 16, fechaCierre: '2026-08-10', estado: 'Finalizado', imagen: 'img/valorant.jpg' },
  { id: 'copa-rank-street-fighter-6', nombre: 'Copa Rank Street Fighter 6', juego: 'Street Fighter 6', modalidad: '1v1', cuposOcupados: 22, cuposMaximos: 32, fechaCierre: '2026-10-30', estado: 'Abierto', imagen: 'img/sf6.jpg' },
]

export function claseEstado(estado) {
  const clases = {
    Abierto: 'estado-abierto',
    'En Curso': 'estado-en-curso',
    Finalizado: 'estado-finalizado',
  }

  return clases[estado] || ''
}

export function fechasValidas({ fechaInicio, fechaFin }) {
  return !fechaInicio || !fechaFin || fechaInicio <= fechaFin
}

export function filtrarTorneos(torneos, filtros = {}) {
  const texto = (filtros.busqueda ?? '').toLowerCase()

  return torneos.filter((torneo) => (
    torneo.nombre.toLowerCase().includes(texto)
    && (!filtros.juego || filtros.juego === 'Todos' || torneo.juego === filtros.juego)
    && (!filtros.estado || filtros.estado === 'Todos' || torneo.estado === filtros.estado)
    && (!filtros.fechaInicio || torneo.fechaCierre >= filtros.fechaInicio)
    && (!filtros.fechaFin || torneo.fechaCierre <= filtros.fechaFin)
  ))
}
