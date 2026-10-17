export const claveSesion = 'arena-ep2-sesion-v1'

export function validarLogin(datos) {
  const errores = {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo?.trim() ?? '')) errores.correo = 'Ingresa un correo válido.'
  if ((datos.clave ?? '').length < 6) errores.clave = 'La clave debe tener al menos 6 caracteres.'
  return errores
}

export function autenticar(datos, usuarios) {
  const usuario = usuarios.find((item) => item.correo.toLowerCase() === datos.correo.trim().toLowerCase() && item.clave === datos.clave)
  if (!usuario) throw new Error('Correo o clave incorrectos.')
  // La sesión nunca guarda la clave; estas cuentas son únicamente una simulación de EP2.
  return { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol, jugadorId: usuario.jugadorId }
}

export function recuperarSesion(texto, usuarios) {
  try {
    const datos = JSON.parse(texto)
    const usuario = usuarios.find((item) => item.id === datos?.id && item.rol === datos.rol)
    if (!usuario) return null
    return { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol, jugadorId: usuario.jugadorId }
  } catch {
    return null
  }
}
