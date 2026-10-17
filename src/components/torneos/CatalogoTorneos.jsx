import { useState } from 'react'
import FiltrosTorneos from './FiltrosTorneos'
import TarjetaTorneo from './TarjetaTorneo'
import { filtrarTorneos, validarFiltros } from '../../logica/torneos.js'

function CatalogoTorneos({ datos }) {
  const [filtros, setFiltros] = useState({ busqueda: '', juego: '', estado: '', fechaInicio: '', fechaFin: '' })
  const errores = validarFiltros(filtros)
  const resultados = filtrarTorneos(datos.torneos, filtros)
  const cambiar = (evento) => setFiltros((actual) => ({ ...actual, [evento.target.name]: evento.target.value }))
  return <><p className="sobretitulo">Encuentra tu próximo desafío</p><h1>Explorar torneos</h1>
    <FiltrosTorneos filtros={filtros} juegos={datos.juegos} errores={errores} onCambiar={cambiar} />
    <p className="texto-secundario mt-4" role="status">{resultados.length} de {datos.torneos.length} torneos</p>
    {resultados.length === 0 ? <div className="panel"><h2>No se encontraron torneos</h2><p>Prueba otros filtros.</p></div> : <div className="row g-4">{resultados.map((torneo) => <div key={torneo.id} className="col-12 col-md-6 col-lg-4"><TarjetaTorneo torneo={torneo} juego={datos.juegos.find((juego) => juego.id === torneo.juegoId)} /></div>)}</div>}
  </>
}
export default CatalogoTorneos
