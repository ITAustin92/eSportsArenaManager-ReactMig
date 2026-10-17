import { puedeAcceder, menuPorRol } from './acceso'
describe('puedeAcceder por rol', () => {
  ;['visitante', 'jugador', 'admin'].forEach((rol) => {
    it(rol + ' accede a todas las rutas públicas', () => { ['/', '/torneos', '/torneos/copa-latam-valorant'].forEach((ruta) => expect(puedeAcceder(rol, ruta)).toBeTrue()) })
    it(rol + ' respeta las rutas privadas', () => {
      ['/perfil', '/equipos', '/inscripcion?torneo=uno'].forEach((ruta) => expect(puedeAcceder(rol, ruta)).toBe(rol === 'jugador'))
      ;['/admin', '/admin/equipos'].forEach((ruta) => expect(puedeAcceder(rol, ruta)).toBe(rol === 'admin'))
      expect(puedeAcceder(rol, '/login')).toBe(rol === 'visitante')
      expect(puedeAcceder(rol, '/ruta-inventada')).toBeFalse()
    })
    it('menú ' + rol + ' solo contiene rutas permitidas', () => { expect(menuPorRol(rol).every((item) => puedeAcceder(rol, item.ruta))).toBeTrue() })
  })
  it('evita confundir prefijos y acepta barra final', () => { expect(puedeAcceder('admin', '/admin/')).toBeTrue(); expect(puedeAcceder('admin', '/admin/otra')).toBeFalse(); expect(puedeAcceder()).toBeTrue() })
})
