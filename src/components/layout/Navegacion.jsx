const vistas = ['inicio', 'torneos', 'inscripcion', 'equipos', 'perfil']

function Navegacion({ vistaActiva, onNavegar }) {
  return (
    <nav className="contenedor-principal" aria-label="Principal">
      {vistas.map((vista) => (
        <button key={vista} type="button" aria-pressed={vista === vistaActiva} onClick={() => onNavegar(vista)}>
          {vista}
        </button>
      ))}
    </nav>
  )
}

export default Navegacion
