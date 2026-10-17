import Navegacion from './Navegacion'

function Header({ vistaActiva = 'inicio', onNavegar }) {
  return (
    <header>
      <div className="logo">{['torneos', 'inscripcion'].includes(vistaActiva) ? 'ARENA MANAGER' : 'ESPORTS ARENA MANAGER'}</div>
      <Navegacion vistaActiva={vistaActiva} onNavegar={onNavegar} />
    </header>
  )
}

export default Header
