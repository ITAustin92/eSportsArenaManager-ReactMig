import './AvatarJugador.css'
function AvatarJugador({ src, apodo, onCambiar, error }) {
	return (
		<div className="avatar-jugador">
			<div className="avatar-retrato">
				<img
					className={!src || src === '/favicon.svg' ? 'avatar-predeterminado' : undefined}
					src={src || '/favicon.svg'}
					alt={'Avatar de ' + apodo}
				/>
			</div>
			<div className="avatar-control">
				<input
					id="avatar-archivo"
					className="avatar-archivo"
					type="file"
					accept="image/png,image/jpeg,image/webp"
					onChange={onCambiar}
					aria-describedby={error ? 'avatar-error' : 'avatar-ayuda'}
					aria-invalid={Boolean(error)}
				/>
				<label htmlFor="avatar-archivo" className="avatar-cambiar">
					Cambiar foto
				</label>
			</div>
			<small id="avatar-ayuda">PNG, JPEG o WebP; máximo 2 MB.</small>
			{error && (
				<p id="avatar-error" className="mensaje-error" role="alert">
					{error}
				</p>
			)}
		</div>
	)
}
export default AvatarJugador
