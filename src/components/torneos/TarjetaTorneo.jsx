import BadgeEstado from '../compartidos/BadgeEstado'
function TarjetaTorneo({ torneo }) { return <article><BadgeEstado estado={torneo.estado} /><h2>{torneo.nombre}</h2></article> }
export default TarjetaTorneo
