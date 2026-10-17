import './Hero.css'
import { Link } from 'react-router-dom'
function Hero() {
  return <section className="hero"><p className="sobretitulo">El próximo desafío comienza aquí</p><h1>Domina la arena</h1><p className="hero-descripcion">Compite con tu escuadra, sigue los resultados y encuentra tu próximo torneo.</p><Link className="boton boton-primario" to="/torneos">Explorar torneos <span aria-hidden="true">↗</span></Link></section>
}
export default Hero
