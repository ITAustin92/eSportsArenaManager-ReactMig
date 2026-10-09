import { useEffect, useState } from 'react'
import Layout from './components/layout/Layout'
import Inicio from './components/inicio/Inicio'
import CatalogoTorneos from './components/torneos/CatalogoTorneos'
import DetalleTorneo from './components/torneos/DetalleTorneo'
import FormInscripcion from './components/inscripcion/FormInscripcion'
import FormEquipo from './components/equipos/FormEquipo'
import PerfilJugador from './components/perfil/PerfilJugador'
import { catalogoTorneos } from './logica/torneos'
import { equiposIniciales } from './logica/inscripcion'
import { jugadorInicial } from './logica/perfil'
import { resolverRuta } from './logica/navegacion'

const titulos = {
  inicio: 'Inicio',
  torneos: 'Listado de Torneos',
  detalle: 'Detalle de Torneo',
  inscripcion: 'Inscripción',
  equipos: 'Gestión de Equipo',
  perfil: 'Perfil de Jugador',
}

function leerRuta() {
  return resolverRuta(window.location.hash)
}

function App() {
  const [ruta, setRuta] = useState(leerRuta)
  const [equipos, setEquipos] = useState([])
  const [jugador, setJugador] = useState(jugadorInicial)
  const [archivoAvatar, setArchivoAvatar] = useState(null)

  useEffect(() => {
    const sincronizarRuta = () => setRuta(leerRuta())
    window.addEventListener('hashchange', sincronizarRuta)
    return () => window.removeEventListener('hashchange', sincronizarRuta)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [ruta.vista, ruta.torneoId])

  const navegar = (vista, torneoId) => {
    // El hash permite enlaces directos, recarga y Atrás/Adelante sin un servidor de rutas.
    window.location.hash = torneoId ? `${vista}?id=${encodeURIComponent(torneoId)}` : vista
  }

  const torneoSeleccionado = catalogoTorneos.find((torneo) => torneo.id === ruta.torneoId) ?? catalogoTorneos[0]

  return (
    <Layout vistaActiva={ruta.vista} onNavegar={navegar}>
      <title>{`${titulos[ruta.vista]} - eSports Arena Manager`}</title>
      {ruta.vista === 'inicio' && (
        <Inicio
          onExplorarTorneos={() => navegar('torneos')}
          onInscribirse={() => navegar('inscripcion')}
        />
      )}
      {ruta.vista === 'torneos' && (
        <CatalogoTorneos onSeleccionarTorneo={(id) => navegar('detalle', id)} />
      )}
      {ruta.vista === 'detalle' && <DetalleTorneo torneo={torneoSeleccionado} />}
      {ruta.vista === 'inscripcion' && (
        <FormInscripcion key={torneoSeleccionado.id} torneo={torneoSeleccionado} torneos={catalogoTorneos}
          equipos={[...equiposIniciales, ...equipos]} onCambiarTorneo={(id) => navegar('inscripcion', id)} />
      )}
      {ruta.vista === 'equipos' && <FormEquipo equipos={equipos} onGuardar={(equipo) => setEquipos((actuales) => [...actuales, equipo])} />}
      {ruta.vista === 'perfil' && (
        <PerfilJugador jugador={jugador} equipos={equipos} archivoAvatar={archivoAvatar}
          onCambiarAvatar={setArchivoAvatar} onCambiarApodo={(apodo) => setJugador((actual) => ({ ...actual, apodo }))} />
      )}
    </Layout>
  )
}

export default App
