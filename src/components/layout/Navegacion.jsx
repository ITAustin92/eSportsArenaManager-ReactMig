import './Navegacion.css'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { menuPorRol } from '../../logica/acceso.js'
import useAuth from '../auth/useAuth'
import Boton from '../compartidos/Boton'

function Navegacion() {
  const { rol, sesion, cerrarSesion } = useAuth()
  const [expandida, setExpandida] = useState(false)
  const navigate = useNavigate()
  const salir = () => { cerrarSesion(); setExpandida(false); navigate('/login', { replace: true }) }
  const entrar = () => { setExpandida(false); navigate('/login') }
  return <nav data-bs-theme="dark" className="navegacion navbar navbar-expand-sm" aria-label="Principal"><div className="container">
    <button className="navbar-toggler" type="button" aria-label="Abrir menú" aria-controls="menu-principal" aria-expanded={expandida} onClick={() => setExpandida((actual) => !actual)}><span className="navbar-toggler-icon" /></button>
    <div id="menu-principal" className={'navbar-collapse collapse' + (expandida ? ' show' : '')}>
      <ul className="navbar-nav me-auto">{menuPorRol(rol).filter((item) => item.ruta !== '/login').map((item) => <li key={item.ruta} className="nav-item"><NavLink end={item.ruta !== '/torneos'} to={item.ruta} className="nav-link" onClick={() => setExpandida(false)}>{item.etiqueta}</NavLink></li>)}</ul>
      <div className="navegacion-sesion">{sesion ? <><span>{sesion.nombre} · {rol}</span><Boton variante="secundario" onClick={salir}>Cerrar sesión</Boton></> : <Boton variante="secundario" onClick={entrar}>Iniciar sesión</Boton>}</div>
    </div>
  </div></nav>
}
export default Navegacion
