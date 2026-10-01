function BadgeEstado({ estado }) { return <span className={`badge-estado estado-${estado?.toLowerCase().replaceAll(' ', '-')}`}>{estado}</span> }
export default BadgeEstado
