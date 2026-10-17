import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../components/auth/AuthContext'
import { claveDatos, crearDatosIniciales, inicializarDatos } from '../datos/datos'
import { storageFalso } from './fixtures'
import VistaSuscrita from './VistaSuscrita'

// Monta las vistas contra el servicio real y almacenamiento en memoria.
// La suscripción permite comprobar que una escritura también actualice la pantalla.
export const sesionJugador = { id: 'u-felipe', nombre: 'Felipe Demo', rol: 'jugador', jugadorId: 'p-felipe' }
export const sesionAdmin = { id: 'u-admin', nombre: 'Administración Demo', rol: 'admin', jugadorId: null }

export function montarVista(dom, Componente, { datos = crearDatosIniciales(), sesion = sesionJugador, props = {} } = {}) {
  const storage = storageFalso()
  storage.setItem(claveDatos, JSON.stringify(datos))
  inicializarDatos(storage)
  dom.renderizar(
    <MemoryRouter>
      <AuthContext.Provider value={{ sesion, rol: sesion.rol }}>
        <VistaSuscrita Componente={Componente} props={{ sesion, ...props }} />
      </AuthContext.Provider>
    </MemoryRouter>,
  )
  return storage
}

export function buscarBoton(contenedor, texto) {
  const encontrado = [...contenedor.querySelectorAll('button')].find((elemento) => elemento.textContent === texto)
  if (!encontrado) throw new Error('No se encontró el botón: ' + texto)
  return encontrado
}
