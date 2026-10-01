export function validarApodo(apodo) {
  if (!apodo?.trim()) return 'El apodo es obligatorio.'
  if (/\s/.test(apodo)) return 'El apodo no puede contener espacios.'
  if (apodo.length < 3 || apodo.length > 15) return 'El apodo debe tener entre 3 y 15 caracteres.'
  return ''
}
