# Verificación final

Fecha: 16 de octubre de 2026.

| Comprobación | Resultado |
|---|---|
| npm run lint | Código 0; sin errores ni advertencias |
| npm run build | Código 0; sin errores ni advertencias; bundle de producción generado |
| npm test | Código 0; 129 aprobadas; sin errores ni advertencias |
| npm run test:cov | Código 0; 129 aprobadas; sin errores ni advertencias; líneas 90,88%, sentencias 84,81%, ramas 83,35%, funciones 81,06% |
| npm run test:e2e | 12 recorridos aprobados |
| Vistas responsivas | 9 vistas × 3 anchos (360, 768 y 1280 px); un h1 y sin desbordamiento de página |
| Capturas | 31 PNG actuales: 28 recorridos y 3 vistas completas restauradas |
| Permisos | Visitante, jugador y admin; URL directa, recarga y cierre de sesión |
| CRUD | Juegos, torneos, equipos e inscripciones verificados |
| CSS propio | Sin hex fuera de :root ni !important |
| JSX de aplicación | Un único estilo inline dinámico: ancho calculado de BarraCupos, con comentario en español |
| Suites | Sin fit, xit, fdescribe ni xdescribe |

## Restauración estética actual

Referencia: css/styles.css y vista_6.html del proyecto EP1 original. El perfil tiene identidad centrada, avatar circular de 116 px con degradado y anillo, selector de archivo oculto visualmente pero operable por teclado, formulario oscuro y botón Guardar apodo de ancho completo. Se conservan textos, etiquetas y selectores existentes.

Cabecera y navegación comparten fondo e incorporan insignia con degradado. El menú es horizontal desde 576 px, con hamburguesa bajo ese ancho y un indicador activo accesible. Las tarjetas tienen radio de 16 px, elevación suave, imágenes originales y barras de cupos; los cuatro torneos destacados se distribuyen en una fila en escritorio amplio. Botones píldora de 16 px, focos visibles, badges con punto de estado y mensajes inmediatos completan las nueve vistas.

Las pestañas de rondas funcionan con clic, flechas, Home y End y comparten estado con el selector móvil #ronda. Se comprobaron la carga y persistencia de una foto, el rechazo de un archivo inválido, los filtros en vivo y la preferencia de movimiento reducido. La búsqueda estática de 59 archivos CSS/JSX no encontró colores hexadecimales fuera de :root ni !important; los degradados y sombras usan variables. Las cinco imágenes coinciden con EP1 mediante SHA-256.

Se conservaron los 18 specs existentes, incluidos los diez casos obligatorios y MensajeError.spec.js. InteraccionesTorneo.spec.js añade siete casos; estetica.spec.js añade cinco recorridos. Datos, lógica de negocio, helpers y sus firmas permanecen intactos. La cobertura se limpió automáticamente y contiene 49 archivos de producción, sin specs, helpers ni árboles HTML duplicados.

.idea/ ya estaba ausente y tanto .idea como coverage estaban fuera del índice. Se verificó .gitignore; coverage/ quedó disponible localmente y fuera de Git. El respaldo anterior de .idea sigue en node_modules/.cache/ep2-auditoria/idea-antes-limpieza.zip.

## Auditoría previa de cobertura (conservada como historial)

La línea base sobre e9d9426 fue lint, 118 pruebas y build aprobados. Se ejecutaron lint y test después del ajuste de Karma y después de agregar el spec. La verificación cuádruple final volvió a ejecutar los cuatro comandos de la tabla, todos con código 0. Los 17 specs originales, src/datos/, src/logica/, los componentes existentes y los helpers de src/pruebas/ no se modificaron. MensajeError.spec.js agrega cuatro pruebas: cadena vacía, null, undefined y texto válido con role="alert" e id.

Se recorrieron de nuevo las nueve vistas en un navegador aislado a 1280 px: Inicio, CatalogoTorneos, DetalleTorneo, Login, PerfilJugador, GestionEquipos, Inscripcion, PanelAdmin y EquiposRegistrados. Todas mostraron exactamente un h1 y un enlace de navegación activo con aria-current="page". Los botones primarios presentes midieron 16 px. También se comprobaron caption y scope="col" en el ranking, title del iframe, alt no vacío del avatar y autocomplete="nickname" del apodo. No hubo errores de React. El video externo se bloqueó; no se evalúa su reproducción. Esta comprobación puntual no repitió los siete recorridos E2E ni renovó las capturas anteriores.

La búsqueda estática revisó 55 archivos .css/.jsx: cero hexadecimales fuera de :root en src/index.css, cero !important y cero estilos inline. No fue necesario cambiar CSS o JSX de producción. Los diez casos obligatorios del caso están presentes y pasan. No existen Header.jsx, Footer.jsx ni FormInscripcion.jsx obsoletos.

Cobertura limpia: 48 entradas de aplicación en coverage-summary.json y sus 48 páginas HTML, sin specs, helpers, main.jsx ni node_modules. coverage/html/ contiene únicamente src/ como directorio de fuentes, sin árboles duplicados. Los porcentajes por archivo coinciden con COBERTURA_TESTING.md.

.gitignore incluye node_modules/, dist/, coverage/, .idea/ y .DS_Store. .idea y coverage ya estaban fuera del índice; git rm --cached --ignore-unmatch no retiró archivos versionados. Se eliminó .idea/ del disco y se respaldaron sus seis archivos en node_modules/.cache/ep2-auditoria/idea-antes-limpieza.zip, ignorado por Git. Ese respaldo es local y se pierde si se borra node_modules. coverage/ se regeneró y permanece disponible en disco, ignorado por Git.

## Contraste de la paleta

Cálculo de luminancia sRGB y relación (Lmayor + 0,05) / (Lmenor + 0,05). Se verificaron estos pares opacos usados por la interfaz:

| Par | Relación |
|---|---:|
| Texto/superficie | 15.25:1 |
| Secundario/superficie | 9.71:1 |
| Texto/botón | 6.09:1 |
| Texto/extremo oscuro del degradado de botón | 7.98:1 |
| Error/superficie | 5.93:1 |
| Acento/fondo | 13.92:1 |
| Borde de controles/fondo | 5.09:1 |

Esto valida los pares de color, no sustituye una auditoría completa WCAG. Bootstrap usa sus estilos internos; la revisión de hex e !important se aplica a las hojas propias, no a dependencias ni a SVG heredados.

## Recorridos de navegador

1. Acceso directo de visitante, retorno después del login, recarga, cierre y denegación de roles.
2. CRUD de juegos/torneos, fechas inválidas y protección de relaciones.
3. Inscripción completa, bloqueo incompleto, duplicidad, cambio de contacto, cancelación y perfil persistente.
4. CRUD de equipo con selección de cinco integrantes.
5. Nueve vistas a 360 px y menú colapsable.
6. Nueve vistas a 768 px.
7. Nueve vistas a 1280 px.
8. Perfil centrado, selector de foto por teclado y clic, persistencia y rechazo de archivo inválido.
9. Menú a 360, 575, 576, 768 y 1280 px.
10. Pestañas de rondas y selector móvil sincronizados.
11. Imágenes originales visibles, barras de cupos y filtros inmediatos.
12. Elevación de tarjetas, foco visible y movimiento reducido.

La ejecución actual terminó con 12 passed. Se inspeccionaron visualmente capturas de las nueve vistas, incluido el perfil comparado con EP1. El iframe externo se bloquea en las pruebas: no se certifica su reproducción ni se presenta esta revisión como una auditoría WCAG completa.

## Evidencias

- salida-pruebas.txt: salida real del último test:cov, con 129 casos; sin secuencias de control ANSI.
- salida-e2e.txt: salida real de los doce recorridos actuales.
- COBERTURA_TESTING.md: porcentajes por archivo.
- capturas/: vistas y validación.
- DECISIONES.md: incidencias del entorno y alcance.

La entrega es frontend simulado. No se publicó en Internet ni se hizo push o PR. El ZIP previo excluye node_modules, .git, .idea, dist y reportes regenerables; no se regeneró durante esta corrección.
