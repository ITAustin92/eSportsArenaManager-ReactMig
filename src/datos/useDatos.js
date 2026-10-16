import { useEffect, useState } from 'react'
import { inicializarDatos, suscribirDatos } from './datos.js'

export default function useDatos() {
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let activo = true
    const desuscribir = suscribirDatos((siguiente) => { if (activo) setDatos(siguiente) })
    Promise.resolve().then(() => inicializarDatos()).then((iniciales) => {
      if (activo) setDatos(iniciales)
    }).catch(() => { if (activo) setError('No se pudieron cargar los datos.') })
    return () => { activo = false; desuscribir() }
  }, [])
  return { datos, error, cargando: !datos && !error }
}
