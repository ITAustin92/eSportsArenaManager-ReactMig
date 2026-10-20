import './PieDePagina.css'
import { useState } from 'react'
function PieDePagina() {
	const [anio] = useState(() => new Date().getFullYear())
	return (
		<footer className="pie-pagina">
			<div className="container row-gap-3">
				<div>
					<strong>eSports Arena Manager</strong>
					<p>Ángel Quintero · Luis Ahumada · Cristian Villavicencio</p>
				</div>
				<div>
					<p>© {anio} · DSY1104 · Duoc UC</p>
					<a href="mailto:soporte@arena.example">soporte@arena.example</a>
				</div>
			</div>
		</footer>
	)
}
export default PieDePagina
