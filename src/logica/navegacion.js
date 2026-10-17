import { catalogoTorneos } from './torneos.js'

export function resolverRuta(hash = '') {
  const [vista, parametros = ''] = hash.replace(/^#/, '').split('?')
  const vistas = ['inicio', 'torneos', 'detalle', 'inscripcion', 'equipos', 'perfil']
  const torneoId = new URLSearchParams(parametros).get('id')
  const existeTorneo = catalogoTorneos.some((torneo) => torneo.id === torneoId)
  if (vista === 'detalle' && !existeTorneo) return { vista: 'torneos', torneoId: null }
  return { vista: vistas.includes(vista) ? vista : 'inicio', torneoId: existeTorneo ? torneoId : null }
}
