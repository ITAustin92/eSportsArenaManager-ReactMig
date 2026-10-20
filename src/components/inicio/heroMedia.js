// Para usar un video local: tipo: 'video', videoSrc: '/video/arena.mp4'.
// El carrusel es el respaldo si el video falla o se reduce el movimiento.
export const fondoHero = {
	tipo: 'carrusel',
	videoSrc: '',
	intervalo: 8000,
	imagenes: [
		{ src: '/img/hero/valorant-champions.webp', nombre: 'Escenario de Champions' },
		{ src: '/img/hero/equipo-en-competencia.webp', nombre: 'Equipo en competencia' },
		{ src: '/img/hero/equipo-celebrando.webp', nombre: 'Celebración de equipo' },
	],
}
