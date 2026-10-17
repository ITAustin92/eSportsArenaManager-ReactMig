const enlaces = [
  { vista: 'inicio', texto: 'Inicio' },
  { vista: 'torneos', texto: 'Torneos' },
  { vista: 'inscripcion', texto: 'Inscripción' },
  { vista: 'equipos', texto: 'Equipos' },
  { vista: 'perfil', texto: 'Perfil' },
]

function Navegacion({ vistaActiva, onNavegar }) {
  const navegar = (evento, vista) => {
    if (!onNavegar || evento.button !== 0 || evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return
    evento.preventDefault()
    onNavegar(vista)
  }

  return (
    <nav aria-label="Principal">
      {enlaces.map(({ vista, texto }) => (
        <a key={vista} href={'#' + vista} aria-current={vista === (vistaActiva === 'detalle' ? 'torneos' : vistaActiva) ? 'page' : undefined} onClick={(evento) => navegar(evento, vista)}>
          {texto}
        </a>
      ))}
    </nav>
  )
}

export default Navegacion
