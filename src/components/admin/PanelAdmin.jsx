import { useState } from 'react'
import AdminJuegos from './AdminJuegos'
import AdminTorneos from './AdminTorneos'
import AdminEquipos from './AdminEquipos'
import AdminCuentas from './AdminCuentas'

const SECCIONES = [
	{ id: 'torneos', etiqueta: 'Torneos', Componente: AdminTorneos },
	{ id: 'juegos', etiqueta: 'Juegos', Componente: AdminJuegos },
	{ id: 'equipos', etiqueta: 'Equipos', Componente: AdminEquipos },
	{ id: 'cuentas', etiqueta: 'Cuentas y roles', Componente: AdminCuentas },
]

// Panel exclusivo de ROLE_ADMIN (acceso total). Las inscripciones se administran en
// "Inscripciones" (confirmar / rechazar / cancelar desde su detalle).
function PanelAdmin() {
	const [activa, setActiva] = useState('torneos')
	const { Componente } = SECCIONES.find((s) => s.id === activa)
	return (
		<>
			<p className="sobretitulo">Rol administrador</p>
			<h1>Panel de administración</h1>
			<div className="pestanas" role="tablist" aria-label="Secciones de administración">
				{SECCIONES.map((s) => (
					<button
						key={s.id}
						id={'tab-' + s.id}
						type="button"
						role="tab"
						className="pestana"
						aria-selected={activa === s.id}
						aria-controls={'panel-' + s.id}
						onClick={() => setActiva(s.id)}
					>
						{s.etiqueta}
					</button>
				))}
			</div>
			<div id={'panel-' + activa} role="tabpanel" aria-labelledby={'tab-' + activa}>
				<Componente />
			</div>
		</>
	)
}
export default PanelAdmin
