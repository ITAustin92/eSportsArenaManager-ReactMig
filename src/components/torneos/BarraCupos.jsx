import './BarraCupos.css'

function BarraCupos({ inscritos, maximo }) {
  const capacidad = Math.max(0, maximo)
  const ocupados = Math.min(capacidad, Math.max(0, inscritos))
  const porcentaje = capacidad > 0 ? ocupados / capacidad * 100 : 0
  // El ancho se calcula en ejecución con los cupos del torneo, por eso usa estilo dinámico.
  return <div className="barra-cupos" role="progressbar" aria-label="Cupos ocupados" aria-valuemin={0} aria-valuemax={100} aria-valuenow={porcentaje} aria-valuetext={ocupados + ' de ' + capacidad + ' cupos ocupados'}>
    <span className="barra-cupos-relleno" style={{ width: porcentaje + '%' }} />
  </div>
}
export default BarraCupos
