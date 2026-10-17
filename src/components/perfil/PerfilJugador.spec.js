import { act } from 'react'
import PerfilJugador from './PerfilJugador'
import { claveDatos, obtenerDatos } from '../../datos/datos'
import { fixture } from '../../pruebas/fixtures'
import { prepararDOM, escribir, enviar } from '../../pruebas/dom'
import { montarVista } from '../../pruebas/arena'

describe('perfil del jugador', () => {
  let dom, f, storage
  const imagen = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a6WQAAAAASUVORK5CYII='
  beforeEach(() => { dom = prepararDOM(); f = fixture(new Date()) })
  afterEach(() => dom.limpiar())
  const montar = () => { storage = montarVista(dom, PerfilJugador, { datos: f.datos }) }
  const apodo = (valor) => { escribir(dom.contenedor.querySelector('#perfil-apodo'), valor); enviar(dom.contenedor.querySelector('form')) }
  const seleccionar = (archivo) => act(() => {
    const transferencia = new DataTransfer()
    if (archivo) transferencia.items.add(archivo)
    const campo = dom.contenedor.querySelector('#avatar-archivo')
    campo.files = transferencia.files
    campo.dispatchEvent(new Event('change', { bubbles: true }))
  })
  const lectorFalso = () => {
    const lector = { readAsDataURL: jasmine.createSpy('readAsDataURL') }
    spyOn(globalThis, 'FileReader').and.returnValue(lector)
    return lector
  }

  it('presenta contacto, equipos e historial del jugador autenticado', () => {
    montar()
    expect(dom.contenedor.querySelector('.perfil-correo').textContent).toBe(f.jugador.correo)
    expect(dom.contenedor.textContent).toContain('Arena Demo')
    expect(dom.contenedor.textContent).toContain('Participación histórica de ejemplo')
    expect(dom.contenedor.querySelector('a[href="/torneos/clasificatorias-regionales"]')).not.toBeNull()
  })

  it('explica los estados vacíos de equipos, historial y sanciones', () => {
    f.jugador.equipos = []; f.jugador.historial = []; f.jugador.sanciones = []
    montar()
    expect(dom.contenedor.textContent).toContain('Aún no perteneces a un equipo.')
    expect(dom.contenedor.textContent).toContain('Aún no hay resultados históricos.')
    expect(dom.contenedor.textContent).toContain('Sin sanciones')
  })

  it('muestra motivo y estado de sanciones vigentes y cumplidas', () => {
    f.jugador.sanciones = [
      { id: 'activa', motivo: 'Sanción de prueba vigente', vigente: true, desde: '2026-01-01', hasta: '2027-01-01' },
      { id: 'cumplida', motivo: 'Sanción cumplida de prueba', vigente: false, desde: '2020-01-01', hasta: '2020-02-01' },
    ]
    montar()
    expect(dom.contenedor.textContent).toContain('Sanción de prueba vigente')
    expect(dom.contenedor.textContent).toContain('Sanción cumplida de prueba')
    expect([...dom.contenedor.querySelectorAll('.badge-estado')].map((nodo) => nodo.textContent).join(' ')).toContain('Cumplida')
  })

  it('rechaza un apodo inválido sin modificar la ficha', () => {
    montar(); apodo('con espacio')
    expect(dom.contenedor.querySelector('#perfil-apodo-error').textContent).toContain('espacios')
    expect(dom.contenedor.querySelector('.perfil-apodo').textContent).toBe(f.jugador.apodo)
    expect(obtenerDatos().jugadores.find((item) => item.id === f.jugador.id).apodo).toBe(f.jugador.apodo)
  })

  it('actualiza el apodo, el avatar accesible y los integrantes de sus equipos', () => {
    montar(); apodo('CapitanNuevo')
    expect(dom.contenedor.querySelector('.perfil-apodo').textContent).toBe('CapitanNuevo')
    expect(dom.contenedor.querySelector('.avatar-retrato img').alt).toBe('Avatar de CapitanNuevo')
    expect(dom.contenedor.textContent).toContain('Apodo actualizado.')
    const guardado = JSON.parse(storage.getItem(claveDatos))
    expect(guardado.equipos.find((equipo) => equipo.id === 'e-demo').integrantes.find((item) => item.id === f.jugador.id).apodo).toBe('CapitanNuevo')
  })

  it('mantiene el apodo anterior cuando falla la persistencia', () => {
    montar(); spyOn(storage, 'setItem').and.throwError('Sin espacio'); apodo('Pendiente')
    expect(dom.contenedor.querySelector('#perfil-apodo-error').textContent).toContain('No se pudo guardar.')
    expect(dom.contenedor.querySelector('.perfil-apodo').textContent).toBe(f.jugador.apodo)
  })

  it('no lee ni guarda un archivo de tipo inválido', () => {
    montar(); const lector = lectorFalso()
    seleccionar(new File(['texto'], 'archivo.txt', { type: 'text/plain' }))
    expect(lector.readAsDataURL).not.toHaveBeenCalled()
    expect(dom.contenedor.querySelector('#avatar-archivo').getAttribute('aria-invalid')).toBe('true')
    expect(dom.contenedor.querySelector('#avatar-error')).not.toBeNull()
  })

  it('bloquea una imagen de más de 2 MB antes de leerla', () => {
    montar(); const lector = lectorFalso()
    seleccionar(new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'grande.png', { type: 'image/png' }))
    expect(lector.readAsDataURL).not.toHaveBeenCalled()
    expect(dom.contenedor.querySelector('#avatar-error').textContent).toContain('2 MB')
  })

  it('conserva el avatar al cerrar el selector sin elegir archivo', () => {
    montar(); const antes = storage.getItem(claveDatos); const lector = lectorFalso()
    seleccionar()
    expect(lector.readAsDataURL).not.toHaveBeenCalled()
    expect(storage.getItem(claveDatos)).toBe(antes)
  })

  it('guarda la foto leída y actualiza su imagen en pantalla', () => {
    montar(); const lector = lectorFalso(); const archivo = new File(['imagen'], 'foto.png', { type: 'image/png' })
    seleccionar(archivo)
    expect(lector.readAsDataURL).toHaveBeenCalledOnceWith(archivo)
    act(() => { lector.result = imagen; lector.onload() })
    expect(dom.contenedor.querySelector('.avatar-retrato img').getAttribute('src')).toBe(imagen)
    expect(dom.contenedor.textContent).toContain('Foto actualizada.')
    expect(JSON.parse(storage.getItem(claveDatos)).jugadores.find((item) => item.id === f.jugador.id).avatar).toBe(imagen)
  })

  it('muestra el error de lectura y conserva la imagen anterior', () => {
    montar(); const anterior = dom.contenedor.querySelector('.avatar-retrato img').getAttribute('src'); const lector = lectorFalso()
    seleccionar(new File(['imagen'], 'foto.png', { type: 'image/png' })); act(() => lector.onerror())
    expect(dom.contenedor.querySelector('#avatar-error').textContent).toBe('No se pudo leer la imagen.')
    expect(dom.contenedor.querySelector('.avatar-retrato img').getAttribute('src')).toBe(anterior)
  })

  it('informa si no puede persistir una imagen leída sin publicar el cambio', () => {
    montar(); const anterior = obtenerDatos(); const lector = lectorFalso()
    spyOn(storage, 'setItem').and.throwError('Sin espacio')
    seleccionar(new File(['imagen'], 'foto.png', { type: 'image/png' }))
    act(() => { lector.result = imagen; lector.onload() })
    expect(dom.contenedor.querySelector('#avatar-error').textContent).toContain('No se pudo guardar.')
    expect(obtenerDatos()).toEqual(anterior)
  })
})
