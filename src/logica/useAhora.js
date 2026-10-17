import { useEffect, useState } from 'react'

// Actualiza los plazos visibles y recupera la hora real al volver a la pestaña.
export default function useAhora() {
  const [ahora, setAhora] = useState(Date.now)
  useEffect(() => {
    const actualizar = () => setAhora(Date.now())
    const intervalo = setInterval(actualizar, 1000)
    window.addEventListener('focus', actualizar)
    document.addEventListener('visibilitychange', actualizar)
    return () => {
      clearInterval(intervalo)
      window.removeEventListener('focus', actualizar)
      document.removeEventListener('visibilitychange', actualizar)
    }
  }, [])
  return ahora
}
