import { useEffect } from 'react'

export default function useApariciones(contenedor) {
  useEffect(() => {
    const raiz = contenedor.current
    if (!raiz || typeof IntersectionObserver === 'undefined') return
    const preferencia = window.matchMedia('(prefers-reduced-motion: reduce)')
    const elementos = [...raiz.querySelectorAll('[data-aparicion], .tarjeta-torneo')]
    const mostrarTodo = () => elementos.forEach((elemento) => elemento.classList.remove('inicio-aparicion--pendiente'))
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return
        entrada.target.classList.remove('inicio-aparicion--pendiente')
        observador.unobserve(entrada.target)
      })
    }, { threshold: .08, rootMargin: '0px 0px -28px 0px' })
    elementos.forEach((elemento) => {
      elemento.classList.add('inicio-aparicion')
      if (!preferencia.matches && elemento.getBoundingClientRect().top > window.innerHeight - 28) {
        elemento.classList.add('inicio-aparicion--pendiente')
        observador.observe(elemento)
      }
    })
    const cambiarPreferencia = () => { if (preferencia.matches) { mostrarTodo(); observador.disconnect() } }
    preferencia.addEventListener('change', cambiarPreferencia)
    return () => {
      observador.disconnect()
      preferencia.removeEventListener('change', cambiarPreferencia)
      mostrarTodo()
    }
  }, [contenedor])
}
