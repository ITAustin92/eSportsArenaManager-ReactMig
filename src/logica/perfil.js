export function validarApodo(apodo) {
	if (!apodo?.trim()) {
		return 'El apodo es obligatorio.'
	}
	if (/\s/.test(apodo)) {
		return 'El apodo no puede contener espacios.'
	}
	if (apodo.length < 3 || apodo.length > 15) {
		return 'El apodo debe tener entre 3 y 15 caracteres.'
	}
	return ''
}

export function validarAvatar(archivo) {
	if (!archivo || !['image/png', 'image/jpeg', 'image/webp'].includes(archivo.type)) {
		return 'Selecciona una imagen PNG, JPEG o WebP.'
	}
	if (archivo.size > 2 * 1024 * 1024) {
		return 'La imagen no puede superar 2 MB.'
	}
	return ''
}
