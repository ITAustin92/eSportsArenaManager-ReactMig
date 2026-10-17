export function validarApodo(apodo) {
  if (!apodo?.trim()) return 'El apodo es obligatorio.'
  if (/\s/.test(apodo)) return 'El apodo no puede contener espacios.'
  if (apodo.length < 3 || apodo.length > 15) return 'El apodo debe tener entre 3 y 15 caracteres.'
  return ''
}

export const jugadorInicial = {
  apodo: 'FakerLATAM',
  correo: 'jugador@correo.com',
  victorias: 42,
  derrotas: 18,
  equipos: ['KRÜ Esports', 'Agentes Libres LATAM'],
  historial: [
    { torneo: 'Copa Latam Valorant', resultado: '1er Lugar' },
    { torneo: 'Torneo de Verano', resultado: 'Semifinalista' },
  ],
  sanciones: [
    { motivo: 'Abandono de partida (AFK)', estado: 'Cumplida' },
    { motivo: 'Comportamiento tóxico en chat', estado: 'Vigente' },
  ],
}
