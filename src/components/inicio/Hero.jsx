function Hero({ onExplorar }) {
  const explorar = (evento) => {
    if (!onExplorar || evento.button !== 0 || evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return

    evento.preventDefault()
    onExplorar()
  }

  return (
    <section className="hero">
      <h1>DOMINA LA ARENA</h1>
      <p>Compite en los mejores torneos de la región.</p>
      <a href="#torneos" className="boton-primario" onClick={explorar}>
        Ver todos los torneos
      </a>
    </section>
  )
}

export default Hero
