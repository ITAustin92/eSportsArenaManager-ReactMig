import './Hero.css'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { fondoHero } from './heroMedia'
import Navegacion from '../layout/Navegacion'

function IconoHero({ tipo }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {tipo === 'trofeo' ? <path d="M8 3h8v5a4 4 0 0 1-8 0V3ZM9 21h6M12 12v9M8 5H4v2a4 4 0 0 0 4 4M16 5h4v2a4 4 0 0 1-4 4" /> : tipo === 'equipo' ? <><circle cx="9" cy="7" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3H3ZM16 4a3 3 0 0 1 0 6M17 13a5 5 0 0 1 4 5v3h-3" /></> : <path d="M4 21V12h4v9M10 21V7h4v14M16 21V3h4v18M2 21h20" />}
  </svg>
}

function Hero() {
  const [actual, setActual] = useState(0)
  const [pausado, setPausado] = useState(false)
  const [movimientoReducido, setMovimientoReducido] = useState(false)
  const [visible, setVisible] = useState(true)
  const [paginaVisible, setPaginaVisible] = useState(true)
  const [videoFallido, setVideoFallido] = useState(false)
  const portada = useRef(null)
  const video = useRef(null)
  const usarVideo = fondoHero.tipo === 'video' && Boolean(fondoHero.videoSrc) && !videoFallido && !movimientoReducido
  const animar = !pausado && !movimientoReducido && visible && paginaVisible

  useEffect(() => {
    const preferencia = window.matchMedia('(prefers-reduced-motion: reduce)')
    const actualizarPreferencia = () => setMovimientoReducido(preferencia.matches)
    const actualizarVisibilidad = () => setPaginaVisible(!document.hidden)
    actualizarPreferencia()
    actualizarVisibilidad()
    preferencia.addEventListener('change', actualizarPreferencia)
    document.addEventListener('visibilitychange', actualizarVisibilidad)
    const observador = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entrada]) => setVisible(entrada.isIntersecting))
    if (portada.current) observador?.observe(portada.current)
    return () => {
      preferencia.removeEventListener('change', actualizarPreferencia)
      document.removeEventListener('visibilitychange', actualizarVisibilidad)
      observador?.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!animar || usarVideo || fondoHero.imagenes.length < 2) return
    const intervalo = window.setInterval(() => setActual((anterior) => (anterior + 1) % fondoHero.imagenes.length), fondoHero.intervalo)
    return () => window.clearInterval(intervalo)
  }, [animar, usarVideo])

  useEffect(() => {
    if (!usarVideo || !video.current) return
    const reproductor = video.current
    if (animar) reproductor.play()?.catch(() => setVideoFallido(true))
    else reproductor.pause()
    return () => reproductor.pause()
  }, [animar, usarVideo])

  return <section className="hero" ref={portada} aria-labelledby="hero-titulo">
    <div className="hero-fondo" aria-hidden="true">
      {fondoHero.imagenes.map((imagen, indice) => <img key={imagen.src} className={'hero-fotograma' + (indice === actual ? ' hero-fotograma--activo' : '')} src={imagen.src} alt="" width="1920" height="1080" fetchPriority={indice === 0 ? 'high' : 'low'} loading={indice === 0 ? 'eager' : 'lazy'} decoding="async" />)}
      {usarVideo && <video ref={video} className="hero-fotograma hero-fotograma--activo" src={fondoHero.videoSrc} poster={fondoHero.imagenes[0].src} muted loop playsInline preload="none" onError={() => setVideoFallido(true)} />}
    </div>
    <div className="hero-anuncio">Tu próximo desafío comienza aquí <span aria-hidden="true">↗</span></div>
    <header className="hero-cabecera"><Navegacion integrada /></header>
    <div className="hero-cuerpo container">
      <div className="hero-presentacion">
        <p className="hero-identidad">eSports Arena Manager</p>
        <h1 id="hero-titulo">Domina la <em>arena</em></h1>
        <p className="hero-descripcion">Forma tu equipo, encuentra tu torneo y vive la competencia.</p>
        <div className="hero-acciones">
          <Link className="boton boton-primario" to="/torneos">Explorar torneos <span aria-hidden="true">→</span></Link>
          <Link className="boton boton-secundario" to="/equipos">Crear mi equipo</Link>
        </div>
      </div>
      <div className="hero-pie">
        <ul className="hero-ventajas">
          <li><IconoHero tipo="trofeo" /><span>Torneos competitivos</span></li>
          <li><IconoHero tipo="equipo" /><span>Equipos y comunidad</span></li>
          <li><IconoHero tipo="ranking" /><span>Resultados y rankings</span></li>
        </ul>
        <div className="hero-controles" role="group" aria-label="Fondo de la portada">
          {!usarVideo && <div className="hero-indicadores">{fondoHero.imagenes.map((imagen, indice) => <button key={imagen.src} type="button" className={'hero-indicador' + (indice === actual ? ' hero-indicador--activo' : '')} aria-label={'Ver fondo ' + (indice + 1) + ': ' + imagen.nombre} aria-pressed={indice === actual} onClick={() => { setActual(indice); setPausado(true) }} />)}</div>}
          <button type="button" className="hero-pausa" onClick={() => setPausado((anterior) => !anterior)} aria-label={movimientoReducido ? 'Fondo estático por preferencia de movimiento reducido' : pausado ? 'Reanudar fondo automático' : 'Pausar fondo automático'} disabled={movimientoReducido}><span aria-hidden="true">{pausado || movimientoReducido ? '▷' : 'Ⅱ'}</span><span>{movimientoReducido ? 'Fondo estático' : pausado ? 'Reanudar' : 'Pausar'}</span></button>
        </div>
        <a className="hero-descubrir" href="#torneos-destacados">Descubre la arena <span aria-hidden="true">⌄</span></a>
      </div>
    </div>
  </section>
}
export default Hero
