import './Cabecera.css'
import { Link } from 'react-router-dom'
function Cabecera() {
	return (
		<header className="cabecera">
			<div className="container">
				<Link className="cabecera-marca" to="/">
					<span aria-hidden="true">◆</span> ESPORTS ARENA MANAGER
				</Link>
				<span className="cabecera-edicion">COMPITE · CONECTA · CRECE</span>
			</div>
		</header>
	)
}
export default Cabecera
