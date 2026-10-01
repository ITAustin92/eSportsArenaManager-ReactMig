import { useState } from 'react'
import Layout from './components/layout/Layout'
import Inicio from './components/inicio/Inicio'
import './App.css'

// Este componente centralizará la navegación y el torneo seleccionado.
function App() {
  const [vistaActiva, setVistaActiva] = useState('inicio')
  const [torneoSeleccionadoId, setTorneoSeleccionadoId] = useState(null)

  const abrirTorneo = (id) => {
    setTorneoSeleccionadoId(id)
    setVistaActiva('detalle')
  }

  return (
    <Layout vistaActiva={vistaActiva} onNavegar={setVistaActiva}>
      <Inicio onExplorarTorneos={() => setVistaActiva('torneos')} onSeleccionarTorneo={abrirTorneo} />
      {torneoSeleccionadoId && <span className="sr-only">Torneo seleccionado: {torneoSeleccionadoId}</span>}
    </Layout>
  )
}

export default App
