export function claseEstado(estado) { return `estado-${estado.toLowerCase().replaceAll(' ', '-')}` }

export function filtrarTorneos(torneos, filtros) {
  const texto = (filtros.busqueda ?? '').toLowerCase()
  return torneos.filter((torneo) => torneo.nombre.toLowerCase().includes(texto))
}
