export function validarInscripcion(datos) {
  const errores = {}
  if (!datos.correo?.includes('@')) errores.correo = 'Ingresa un correo válido.'
  if (!datos.tipoParticipante) errores.tipoParticipante = 'Selecciona un tipo de participante.'
  return errores
}
