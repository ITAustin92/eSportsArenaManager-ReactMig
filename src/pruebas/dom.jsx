import { act } from 'react'
import { createRoot } from 'react-dom/client'
globalThis.IS_REACT_ACT_ENVIRONMENT = true

export function prepararDOM() {
  const contenedor = document.createElement('div')
  document.body.appendChild(contenedor)
  const raiz = createRoot(contenedor)
  return {
    contenedor,
    renderizar: (elemento) => act(() => raiz.render(elemento)),
    limpiar: () => { act(() => raiz.unmount()); contenedor.remove() },
  }
}
export function clicEn(elemento) {
  act(() => elemento.dispatchEvent(new MouseEvent('click', { bubbles: true })))
}
export function escribir(elemento, valor) {
  act(() => {
    const prototipo = elemento.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype
    Object.getOwnPropertyDescriptor(prototipo, 'value').set.call(elemento, valor)
    elemento.dispatchEvent(new Event(elemento.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }))
  })
}
export function enviar(formulario) {
  act(() => formulario.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
}
