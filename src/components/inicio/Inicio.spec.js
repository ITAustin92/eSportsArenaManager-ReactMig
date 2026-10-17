import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Inicio from './Inicio'
import TorneosDestacados from './TorneosDestacados'
import { fixture } from '../../pruebas/fixtures'
import { prepararDOM, clicEn } from '../../pruebas/dom'

describe('inicio y torneos destacados', () => {
  let dom, datos
  beforeEach(() => { dom = prepararDOM(); datos = fixture().datos })
  afterEach(() => dom.limpiar())

  const montar = () => dom.renderizar(<MemoryRouter><Inicio datos={datos} /></MemoryRouter>)

  it('destaca abiertos y en curso, excluyendo los finalizados', () => {
    montar()
    const nombres = [...dom.contenedor.querySelectorAll('.tarjeta-torneo h3')].map((nodo) => nodo.textContent)
    expect(nombres).toEqual(datos.torneos.filter((torneo) => torneo.estado !== 'Finalizado').map((torneo) => torneo.nombre))
    expect(dom.contenedor.querySelectorAll('h1').length).toBe(1)
    expect(dom.contenedor.querySelector('iframe').title).toBeTruthy()
  })

  it('ofrece inscripción al torneo con el cierre abierto más próximo sin alterar los datos', () => {
    const base = datos.torneos.find((torneo) => torneo.estado === 'Abierto')
    datos.torneos = [
      { ...base, id: 'tarde', nombre: 'Cierre posterior', cierreISO: '2030-06-20T12:00:00Z' },
      { ...base, id: 'pronto', nombre: 'Cierre próximo', cierreISO: '2030-06-10T12:00:00Z' },
    ]
    const original = structuredClone(datos.torneos)
    dom.renderizar(<MemoryRouter><Routes>
      <Route path="/" element={<Inicio datos={datos} />} />
      <Route path="/inscripcion" element={<p>Formulario de inscripción</p>} />
    </Routes></MemoryRouter>)
    const enlace = dom.contenedor.querySelector('.inicio-banner a')
    expect(enlace.getAttribute('href')).toBe('/inscripcion?torneo=pronto')
    expect(dom.contenedor.querySelector('.inicio-banner h2').textContent).toBe('Cierre próximo')
    expect(datos.torneos).toEqual(original)
    clicEn(enlace)
    expect(dom.contenedor.textContent).toBe('Formulario de inscripción')
  })

  it('permite explorar el catálogo desde la portada', () => {
    dom.renderizar(<MemoryRouter><Routes>
      <Route path="/" element={<Inicio datos={datos} />} />
      <Route path="/torneos" element={<p>Catálogo público</p>} />
    </Routes></MemoryRouter>)
    clicEn(dom.contenedor.querySelector('.hero a'))
    expect(dom.contenedor.textContent).toBe('Catálogo público')
  })

  it('oculta el próximo cierre cuando no hay torneos abiertos', () => {
    datos.torneos = datos.torneos.filter((torneo) => torneo.estado === 'En Curso')
    montar()
    expect(dom.contenedor.querySelector('.inicio-banner')).toBeNull()
    expect(dom.contenedor.querySelectorAll('.tarjeta-torneo').length).toBe(datos.torneos.length)
  })

  it('explica la ausencia de destacados sin dejar tarjetas vacías', () => {
    dom.renderizar(<MemoryRouter><TorneosDestacados torneos={[]} juegos={datos.juegos} /></MemoryRouter>)
    expect(dom.contenedor.textContent).toContain('No hay torneos destacados.')
    expect(dom.contenedor.textContent).toContain('0 competencias')
    expect(dom.contenedor.querySelector('.tarjeta-torneo')).toBeNull()
  })
})
