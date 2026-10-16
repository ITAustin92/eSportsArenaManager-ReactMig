import './AvatarJugador.css'
function AvatarJugador({ src, apodo, onCambiar, error }) {
  return <div className="avatar-jugador"><img src={src || '/favicon.svg'} alt={'Avatar de ' + apodo} /><label htmlFor="avatar-archivo" className="form-label">Cambiar foto</label><input id="avatar-archivo" className="form-control" type="file" accept="image/png,image/jpeg,image/webp" onChange={onCambiar} aria-describedby={error ? 'avatar-error' : 'avatar-ayuda'} aria-invalid={Boolean(error)} /><small id="avatar-ayuda">PNG, JPEG o WebP; máximo 2 MB.</small>{error && <p id="avatar-error" className="mensaje-error" role="alert">{error}</p>}</div>
}
export default AvatarJugador
