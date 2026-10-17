import { validarJuego } from './juegos'
describe('validarJuego', () => {
  it('acepta individual con un titular', () => expect(validarJuego({ nombre: 'Juego', modalidad: '1v1', jugadoresPorEquipo: 1 })).toEqual({}))
  it('rechaza nombre duplicado y acepta edición propia', () => { const juego = { id: 'a', nombre: 'Juego', modalidad: 'equipos', jugadoresPorEquipo: 5 }; expect(validarJuego({ ...juego, id: 'b' }, [juego]).nombre).toBeTruthy(); expect(validarJuego(juego, [juego])).toEqual({}) })
  it('rechaza valores vacíos, modalidad desconocida y tamaño fraccional', () => expect(Object.keys(validarJuego({ nombre: '', modalidad: '', jugadoresPorEquipo: 1.5 })).sort()).toEqual(['jugadoresPorEquipo', 'modalidad', 'nombre']))
  ;[0, 2, 11].forEach((jugadoresPorEquipo) => it('rechaza tamaño individual ' + jugadoresPorEquipo, () => expect(validarJuego({ nombre: 'Juego', modalidad: '1v1', jugadoresPorEquipo }).jugadoresPorEquipo).toBeTruthy()))
})
