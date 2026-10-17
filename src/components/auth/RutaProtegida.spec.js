import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from './AuthContext'
import RutaProtegida from './RutaProtegida'
import { prepararDOM } from '../../pruebas/dom'
describe('RutaProtegida', () => {
  let dom
  beforeEach(() => { dom = prepararDOM() })
  afterEach(() => dom.limpiar())
  ;[['visitante', 'Login de prueba'], ['admin', '403'], ['jugador', 'Perfil permitido']].forEach(([rol, esperado]) => {
    it('resuelve acceso directo de ' + rol, () => {
      dom.renderizar(<AuthContext.Provider value={{ rol }}><MemoryRouter initialEntries={['/perfil']}><Routes><Route path="/perfil" element={<RutaProtegida>Perfil permitido</RutaProtegida>} /><Route path="/login" element={<p>Login de prueba</p>} /></Routes></MemoryRouter></AuthContext.Provider>)
      expect(dom.contenedor.textContent).toContain(esperado)
    })
  })
})
