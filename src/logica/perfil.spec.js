import { validarApodo, validarAvatar } from './perfil'
describe('validarApodo', () => {
  ;['', 'aa', 'a b', 'a'.repeat(16)].forEach((apodo) => it('rechaza apodo inválido ' + JSON.stringify(apodo), () => expect(validarApodo(apodo)).not.toBe('')))
  ;['abc', 'a'.repeat(15)].forEach((apodo) => it('acepta el borde de ' + apodo.length + ' caracteres', () => expect(validarApodo(apodo)).toBe('')))
})
describe('validarAvatar', () => {
  it('admite imagen hasta dos MB', () => expect(validarAvatar({ type: 'image/png', size: 2 * 1024 * 1024 })).toBe(''))
  it('rechaza tipo y tamaño no permitidos', () => { expect(validarAvatar({ type: 'text/html', size: 10 })).not.toBe(''); expect(validarAvatar({ type: 'image/jpeg', size: 2 * 1024 * 1024 + 1 })).not.toBe(''); expect(validarAvatar(null)).not.toBe('') })
})
