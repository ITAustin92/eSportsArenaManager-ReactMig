import './App.css'
import { Link, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Inicio from './components/inicio/Inicio'
import CatalogoTorneos from './components/torneos/CatalogoTorneos'
import DetalleTorneo from './components/torneos/DetalleTorneo'
import Inscripcion from './components/inscripcion/Inscripcion'
import GestionEquipos from './components/equipos/GestionEquipos'
import PerfilJugador from './components/perfil/PerfilJugador'
import Login from './components/auth/Login'
import RutaProtegida from './components/auth/RutaProtegida'
import PanelAdmin from './components/admin/PanelAdmin'
import EquiposRegistrados from './components/admin/EquiposRegistrados'
import useDatos from './datos/useDatos'

function App() {
	const { datos, error, cargando } = useDatos()
	return (
		<Layout>
			{cargando ? (
				<section aria-busy="true">
					<h1>Cargando la arena</h1>
					<p role="status">Preparando datos…</p>
				</section>
			) : error ? (
				<section>
					<h1>No se pudo cargar</h1>
					<p role="alert">{error}</p>
				</section>
			) : (
				<Routes>
					<Route path="/" element={<Inicio datos={datos} />} />
					<Route path="/torneos" element={<CatalogoTorneos datos={datos} />} />
					<Route path="/torneos/:id" element={<DetalleTorneo datos={datos} />} />
					<Route path="/login" element={<Login />} />
					<Route
						path="/inscripcion"
						element={
							<RutaProtegida>
								<Inscripcion datos={datos} />
							</RutaProtegida>
						}
					/>
					<Route
						path="/equipos"
						element={
							<RutaProtegida>
								<GestionEquipos datos={datos} />
							</RutaProtegida>
						}
					/>
					<Route
						path="/perfil"
						element={
							<RutaProtegida>
								<PerfilJugador datos={datos} />
							</RutaProtegida>
						}
					/>
					<Route
						path="/admin"
						element={
							<RutaProtegida>
								<PanelAdmin datos={datos} />
							</RutaProtegida>
						}
					/>
					<Route
						path="/admin/equipos"
						element={
							<RutaProtegida>
								<EquiposRegistrados datos={datos} />
							</RutaProtegida>
						}
					/>
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
			)}
		</Layout>
	)
}
export default App
