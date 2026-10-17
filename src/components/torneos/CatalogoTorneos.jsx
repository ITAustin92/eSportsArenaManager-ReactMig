import { useState } from 'react'
import FiltrosTorneos from './FiltrosTorneos'
import TarjetaTorneo from './TarjetaTorneo'
import { catalogoTorneos, fechasValidas, filtrarTorneos } from '../../logica/torneos'

const filtrosIniciales = { busqueda: '', juego: 'Todos', estado: 'Todos', fechaInicio: '', fechaFin: '' }

function CatalogoTorneos({ onSeleccionarTorneo }) {
  const [filtros, setFiltros] = useState(filtrosIniciales)
  const [filtrosAplicados, setFiltrosAplicados] = useState(filtrosIniciales)
  const [errorFechas, setErrorFechas] = useState(false)
  const resultados = filtrarTorneos(catalogoTorneos, filtrosAplicados)

  const cambiarFiltro = (campo, valor) => {
    const nuevosFiltros = { ...filtros, [campo]: valor }
    setFiltros(nuevosFiltros)
    if (fechasValidas(nuevosFiltros)) setErrorFechas(false)
  }

  const aplicarFiltros = (evento) => {
    evento.preventDefault()
    const sonValidas = fechasValidas(filtros)
    setErrorFechas(!sonValidas)
    if (sonValidas) setFiltrosAplicados({ ...filtros })
  }

  return (
    <>
      <FiltrosTorneos filtros={filtros} onCambiar={cambiarFiltro} onFiltrar={aplicarFiltros} errorFechas={errorFechas} />
      <section className="resultados-torneos">
        <div id="contenedor-listado-torneos" className="grilla-torneos">
          {resultados.map((torneo) => (
            <TarjetaTorneo key={torneo.id} torneo={torneo} onSeleccionar={onSeleccionarTorneo} />
          ))}
        </div>
        {resultados.length === 0 && (
          <div id="estado-vacio" className="mensaje-vacio" role="status">
            <h3>No se encontraron torneos</h3>
            <p>Intenta ajustar los filtros de búsqueda.</p>
          </div>
        )}
      </section>
    </>
  )
}

export default CatalogoTorneos
