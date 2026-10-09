import { useEffect, useState } from 'react'
import MensajeError from '../compartidos/MensajeError'

function AvatarJugador({ archivo, onCambiar }) {
  const [src, setSrc] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!archivo) return
    const lector = new FileReader()
    lector.onload = () => setSrc(lector.result)
    lector.onerror = () => setError('No se pudo leer la imagen seleccionada.')
    lector.readAsDataURL(archivo)
    return () => {
      lector.onload = null
      lector.onerror = null
      if (lector.readyState === FileReader.LOADING) lector.abort()
    }
  }, [archivo])

  const seleccionar = (evento) => {
    const imagen = evento.target.files?.[0]
    if (!imagen) return
    if (!imagen.type.startsWith('image/')) {
      setError('Selecciona un archivo de imagen válido.')
      return
    }
    setError('')
    onCambiar(imagen)
  }

  return (
    <>
      <div className="contenedor-avatar">
        <div className="avatar-jugador" id="avatar-preview" style={src ? { backgroundImage: `url("${src}")` } : undefined} role="img" aria-label="Avatar del jugador" />
        <label htmlFor="input-avatar" className="overlay-avatar"><span>Cambiar foto</span></label>
        <input type="file" id="input-avatar" accept="image/*" style={{ display: 'none' }} onChange={seleccionar} />
      </div>
      <MensajeError>{error}</MensajeError>
    </>
  )
}

export default AvatarJugador
