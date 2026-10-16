import './LlaveTorneo.css'
function LlaveTorneo({ local, visitante }) {
  return <div className="llave-torneo"><strong>{local || 'Participante por definir'}</strong><span className="texto-acento">VS</span><strong>{visitante || 'Participante por definir'}</strong></div>
}
export default LlaveTorneo
