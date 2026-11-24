import './Inicio.css'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import Hero from './Hero'
import TarjetaTorneo from '../torneos/TarjetaTorneo'
import EstadoCarga from '../compartidos/EstadoCarga'
import useApariciones from './useApariciones'
import useCarga from '../../hooks/useCarga'
import useAuth from '../auth/useAuth'
import { cargarCatalogo } from '../../servicios/catalogo.js'
import {
	admiteInscripciones,
	cierreInscripcion,
	filtrarTorneos,
	formatearFecha,
} from '../../logica/torneos.js'

function Inicio() {
	const secciones = useRef(null)
	useApariciones(secciones)
	const { rol } = useAuth()
	const { datos, error, cargando, recargar } = useCarga(cargarCatalogo)
	const vigentes = datos
		? filtrarTorneos(datos.torneos).filter((t) => ['UPCOMING', 'IN_PROGRESS'].includes(t.state))
		: []
	const proximo = vigentes
		.filter((t) => admiteInscripciones(t))
		.sort((a, b) => Date.parse(cierreInscripcion(a)) - Date.parse(cierreInscripcion(b)))[0]
	return (
		<>
			<Hero />
			<div className="container inicio-secciones" ref={secciones} id="torneos-destacados">
				<EstadoCarga cargando={cargando} error={error} onReintentar={recargar}>
					{proximo && (
						<section className="inicio-banner card" data-aparicion>
							<div className="inicio-banner-texto">
								<p className="sobretitulo">Inscripciones abiertas</p>
								<h2>{proximo.name}</h2>
								<p>Comienza el {formatearFecha(proximo.startDate)}</p>
								<Link
									className="boton boton-primario"
									to={
										rol === 'JUGADOR'
											? '/inscripcion?torneo=' + proximo.tournamentId
											: '/torneos/' + proximo.tournamentId
									}
								>
									{rol === 'JUGADOR' ? 'Inscribir a mi equipo' : 'Ver torneo'}
								</Link>
							</div>
						</section>
					)}
					<section>
						<div className="encabezado-seccion">
							<div>
								<p className="sobretitulo">En el radar</p>
								<h2>Torneos destacados</h2>
							</div>
							<span className="texto-secundario">{vigentes.length} competencias</span>
						</div>
						{vigentes.length === 0 ? (
							<p>No hay torneos abiertos ni en curso.</p>
						) : (
							<div className="row g-4">
								{vigentes.slice(0, 4).map((torneo) => (
									<div key={torneo.tournamentId} className="col-12 col-md-6 col-lg-4 col-xl-3">
										<TarjetaTorneo
											torneo={torneo}
											juego={datos.juegos.find((j) => j.juegoId === torneo.gameId)}
										/>
									</div>
								))}
							</div>
						)}
					</section>
				</EstadoCarga>
				<section className="panel mt-5" data-aparicion>
					<p className="sobretitulo">La emoción de competir</p>
					<h2>Video destacado</h2>
					<div className="ratio ratio-16x9 mt-3">
						<iframe
							src="https://www.youtube-nocookie.com/embed/m6CrWBOxecY"
							title="EVO 2019: Gran Final de Smash Ultimate"
							loading="lazy"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowFullScreen
						/>
					</div>
				</section>
			</div>
		</>
	)
}
export default Inicio
