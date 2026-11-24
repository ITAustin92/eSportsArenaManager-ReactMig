import { useCallback, useEffect, useRef, useState } from 'react'

// Ejecuta una función asíncrona (una llamada a la API) y expone { datos, error, cargando, recargar }.
// - `dependencias`: vuelve a cargar cuando cambian (por ejemplo, el id de la URL) y descarta los
//   datos anteriores para no mostrar información de otro registro.
// - `recargar()`: vuelve a pedir los datos SIN desmontar la vista (los datos actuales siguen
//   visibles hasta que llega la respuesta nueva), así no se pierden mensajes ni formularios.
// - Si el componente se desmonta antes de que llegue la respuesta, la respuesta se ignora.
export default function useCarga(cargar, dependencias = []) {
	const [estado, setEstado] = useState({ datos: null, error: '', cargando: true, clave: null })
	const [version, setVersion] = useState(0)
	const clave = JSON.stringify(dependencias)
	const claveAnterior = useRef(clave)
	const recargar = useCallback(() => setVersion((v) => v + 1), [])
	useEffect(() => {
		let vigente = true
		const cambioDeRegistro = claveAnterior.current !== clave
		claveAnterior.current = clave
		setEstado((actual) =>
			cambioDeRegistro || actual.datos === null
				? { datos: null, error: '', cargando: true, clave }
				: { ...actual, error: '' },
		)
		Promise.resolve()
			.then(cargar)
			.then((datos) => vigente && setEstado({ datos, error: '', cargando: false, clave }))
			.catch(
				(fallo) =>
					vigente &&
					setEstado({
						datos: null,
						error: fallo?.message ?? 'Error al cargar.',
						cargando: false,
						clave,
					}),
			)
		return () => {
			vigente = false
		}
		// La función `cargar` se recrea en cada render; lo que decide recargar es `clave` y `version`.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [version, clave])
	return estado.clave !== clave
		? { datos: null, error: '', cargando: true, recargar }
		: { ...estado, recargar }
}
