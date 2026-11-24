import './App.css'
import { Link, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Inicio from './components/inicio/Inicio'
import CatalogoTorneos from './components/torneos/CatalogoTorneos'
import DetalleTorneo from './components/torneos/DetalleTorneo'
import Login from './components/auth/Login'
import Registro from './components/auth/Registro'
import RutaProtegida from './components/auth/RutaProtegida'
import MisEquipos from './components/jugador/MisEquipos'
import Inscripcion from './components/jugador/Inscripcion'
import Perfil from './components/jugador/Perfil'
import GestionTorneos from './components/gestion/GestionTorneos'
import DetalleTorneoGestion from './components/gestion/DetalleTorneoGestion'
import GestionInscripciones from './components/gestion/GestionInscripciones'
import DetalleInscripcion from './components/gestion/DetalleInscripcion'
import PanelAdmin from './components/admin/PanelAdmin'

// Mapa de rutas. Las mismas reglas están en logica/acceso.js (menú) y, sobre todo, en el backend.
const JUGADOR = ['JUGADOR']
const GESTION = ['ORGANIZADOR', 'ADMIN']
const ADMIN = ['ADMIN']

const protegida = (roles, elemento) => <RutaProtegida roles={roles}>{elemento}</RutaProtegida>

function App() {
	return (
		<Layout>
			<Routes>
				{/* Públicas: catálogo ("la tienda") */}
				<Route path="/" element={<Inicio />} />
				<Route path="/torneos" element={<CatalogoTorneos />} />
				<Route path="/torneos/:id" element={<DetalleTorneo />} />
				<Route path="/login" element={<Login />} />
				<Route path="/registro" element={<Registro />} />
				{/* Jugador (cliente) */}
				<Route path="/inscripcion" element={protegida(JUGADOR, <Inscripcion />)} />
				<Route path="/equipos" element={protegida(JUGADOR, <MisEquipos />)} />
				<Route path="/perfil" element={protegida(JUGADOR, <Perfil />)} />
				{/* Organizador (vendedor) y admin: lista y detalle de torneos e inscripciones */}
				<Route path="/gestion/torneos" element={protegida(GESTION, <GestionTorneos />)} />
				<Route path="/gestion/torneos/:id" element={protegida(GESTION, <DetalleTorneoGestion />)} />
				<Route
					path="/gestion/inscripciones"
					element={protegida(GESTION, <GestionInscripciones />)}
				/>
				<Route
					path="/gestion/inscripciones/:id"
					element={protegida(GESTION, <DetalleInscripcion />)}
				/>
				{/* Administrador: acceso total */}
				<Route path="/admin" element={protegida(ADMIN, <PanelAdmin />)} />
				<Route
					path="*"
					element={
						<section className="panel">
							<h1>Página no encontrada</h1>
							<p>Error 404. Esta dirección no existe.</p>
							<Link to="/">Volver al inicio</Link>
						</section>
					}
				/>
			</Routes>
		</Layout>
	)
}
export default App
