import Hero from './Hero'
import TorneosDestacados from './TorneosDestacados'

function Inicio({ onExplorarTorneos, onSeleccionarTorneo }) {
  return <><Hero onExplorar={onExplorarTorneos} /><TorneosDestacados onSeleccionar={onSeleccionarTorneo} /></>
}

export default Inicio
