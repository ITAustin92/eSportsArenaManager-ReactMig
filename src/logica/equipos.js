export function agregarIntegrante(integrantes, integrante) { return [...integrantes, integrante] }
export function quitarIntegrante(integrantes, id) { return integrantes.filter((integrante) => integrante.id !== id) }

export function validarEquipo(datos) {
  const errores = {}
  if (!datos.nombre?.trim()) errores.nombre = 'El nombre del equipo es obligatorio.'
  return errores
}
