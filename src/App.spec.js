import { act } from 'react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import AuthProvider from './components/auth/AuthProvider'
import { claveSesion, autenticar } from './logica/sesion'
import { claveDatos, usuariosPrueba, crearDatosIniciales } from './datos/datos'
import { prepararDOM, escribir, enviar, clicEn } from './pruebas/dom'

describe('aplicación integrada', () => {
  let dom
  beforeEach(() => {
    dom = prepararDOM()
    localStorage.setItem(claveDatos, JSON.stringify(crearDatosIniciales()))
    sessionStorage.removeItem(claveSesion)
    spyOn(window, 'scrollTo')
  })
  afterEach(() => { dom.limpiar(); localStorage.removeItem(claveDatos); sessionStorage.removeItem(claveSesion) })
  const montar = async (ruta, usuario = null) => {
    if (usuario) sessionStorage.setItem(claveSesion, JSON.stringify(autenticar(usuario, usuariosPrueba)))
    await act(async () => { dom.renderizar(<MemoryRouter initialEntries={[ruta]}><AuthProvider><App /></AuthProvider></MemoryRouter>); await Promise.resolve() })
  }
  const jugador = { correo: 'felipe@arena.example', clave: 'Jugador123!' }
  const admin = { correo: 'admin@arena.example', clave: 'Admin123!' }
  const boton = (nombre) => [...dom.contenedor.querySelectorAll('button')].find((item) => item.textContent === nombre)
  ;[
    ['/torneos', null, 'Explorar torneos'],
    ['/torneos/copa-latam-valorant', null, 'Copa Latam Valorant'],
    ['/login', null, 'Iniciar sesión'],
    ['/perfil', jugador, 'Perfil de jugador'],
    ['/equipos', jugador, 'Gestión de equipos'],
    ['/inscripcion', jugador, 'Inscripción a torneo'],
    ['/admin', admin, 'Gestionar la arena'],
    ['/admin/equipos', admin, 'Equipos registrados'],
    ['/no-existe', null, 'Página no encontrada'],
  ].forEach(([ruta, usuario, titulo]) => it('carga ' + ruta + ' con un solo título principal', async () => {
    await montar(ruta, usuario); expect(dom.contenedor.querySelectorAll('h1').length).toBe(1); expect(dom.contenedor.querySelector('h1').textContent).toContain(titulo)
  }))
  it('filtra catálogo y muestra error del rango invertido', async () => {
    await montar('/torneos')
    const campos = dom.contenedor.querySelectorAll('input')
    const buscador = [...campos].find((campo) => campo.name === 'busqueda')
    escribir(buscador, 'no existe nada'); expect(dom.contenedor.textContent).toContain('No se encontraron')
    escribir(dom.contenedor.querySelector('[name="fechaInicio"]'), '2030-02-01')
    escribir(dom.contenedor.querySelector('[name="fechaFin"]'), '2020-01-01')
    expect(dom.contenedor.textContent).toContain('posterior a la final')
  })
  it('inicia sesión, mantiene destino original y cierra sesión', async () => {
    await montar('/equipos')
    expect(dom.contenedor.querySelector('h1').textContent).toBe('Iniciar sesión')
    escribir(dom.contenedor.querySelector('#login-correo'), jugador.correo)
    escribir(dom.contenedor.querySelector('#login-clave'), jugador.clave)
    enviar(dom.contenedor.querySelector('form'))
    expect(dom.contenedor.querySelector('h1').textContent).toBe('Gestión de equipos')
    expect(sessionStorage.getItem(claveSesion)).toContain('jugador')
    clicEn(boton('Cerrar sesión'))
    expect(sessionStorage.getItem(claveSesion)).toBeNull()
  })
  it('distingue formato inválido de credenciales incorrectas', async () => {
    await montar('/torneos')
    clicEn(boton('Iniciar sesión'))
    expect(dom.contenedor.querySelector('h1').textContent).toBe('Iniciar sesión')
    enviar(dom.contenedor.querySelector('form'))
    expect(dom.contenedor.textContent).toContain('al menos 6')
    escribir(dom.contenedor.querySelector('#login-correo'), jugador.correo); escribir(dom.contenedor.querySelector('#login-clave'), 'incorrecta')
    enviar(dom.contenedor.querySelector('form')); expect(dom.contenedor.textContent).toContain('Correo o clave incorrectos')
  })
  it('edita perfil y refleja el cambio en el encabezado del perfil', async () => {
    await montar('/perfil', jugador)
    escribir(dom.contenedor.querySelector('#perfil-apodo'), 'ApodoNuevo'); enviar(dom.contenedor.querySelector('form'))
    expect(dom.contenedor.textContent).toContain('Apodo actualizado.')
    expect(JSON.parse(localStorage.getItem(claveDatos)).jugadores.find((item) => item.id === 'p-felipe').apodo).toBe('ApodoNuevo')
  })
  it('admin busca equipo, integrantes, sanciones y vacío', async () => {
    await montar('/admin/equipos', admin)
    escribir(dom.contenedor.querySelector('#buscar-equipo'), 'Equipo Sancionado')
    expect(dom.contenedor.textContent).toContain('Conducta antideportiva')
    expect(dom.contenedor.querySelector('th[scope="col"]').textContent).toBe('Nombre')
    escribir(dom.contenedor.querySelector('#buscar-equipo'), 'nada coincide')
    expect(dom.contenedor.textContent).toContain('No hay equipos')
  })
  it('admin crea un juego y lo elimina con confirmación', async () => {
    await montar('/admin', admin)
    escribir(dom.contenedor.querySelector('#juego-nombre'), 'Juego Unitario')
    enviar(dom.contenedor.querySelector('#juego-nombre').closest('form'))
    expect(dom.contenedor.textContent).toContain('Juego guardado.')
    clicEn(boton('Eliminar Juego Unitario')); clicEn(boton('Confirmar eliminación'))
    expect(dom.contenedor.textContent).toContain('Registro eliminado.')
    expect(boton('Editar Juego Unitario')).toBeUndefined()
  })
})
