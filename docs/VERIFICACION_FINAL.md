# Verificación de EP2

Fecha: 16 de octubre de 2026.

## Correcciones de fechas, sanciones, edición y recuperación

TablaRanking ahora conserva el orden de las filas recibidas. DetalleTorneo ordena la clasificación por puntos y diferencia antes de entregarla a la tabla. Se actualizó el caso obligatorio de la tabla y se añadió una prueba de integración en el detalle que verifica el orden y la inmutabilidad de los datos originales.

Sobre esa base se añadieron 65 pruebas de comportamiento para inicio, equipos, inscripciones, perfil y administración. Las vistas se montan con el servicio real y almacenamiento en memoria; se comprueban interacciones, mensajes, persistencia y ausencia de cambios parciales cuando ocurre un error. El código de la aplicación no cambió en esta ampliación. Se ajustó el helper de clics para emitir eventos cancelables y comprobar enlaces de React Router.

Después se corrigieron los filtros por día de Santiago, el orden de cierres con zonas distintas, las etiquetas temporales de sanciones, el borrador de contacto al cancelar y la aceptación de datos incompletos. Las vistas actualizan el reloj cada segundo y al recuperar foco/visibilidad. Los datos inválidos se respaldan antes de regenerar la demostración. Estas correcciones añaden 47 regresiones unitarias y dos E2E.

| Comprobación ejecutada en esta corrección | Resultado |
|---|---|
| npm run lint | Código 0; sin errores ni advertencias |
| npm run build | Código 0; sin errores ni advertencias; bundle de producción generado |
| npm run test:cov | Código 0; 242 pruebas aprobadas; líneas 99,56%, sentencias 98,67%, ramas 94,81%, funciones 97,64% |
| npm run test:e2e | Código 0; 14 recorridos aprobados; capturas de las nueve vistas a 360/768/1280 px actualizadas |

Entorno de esta ejecución: Node 24.22.0 y Edge 155.0.0.0 mediante el launcher ChromeHeadless de Karma. Las pruebas se ejecutaron fuera del entorno restringido, con perfiles temporales y sin CHROME_NO_SANDBOX=1. npm test no se repitió por separado: test:cov ejecutó la misma suite con instrumentación. Playwright usó Edge mediante CHROME_BIN y emitió avisos de configuración de color NO_COLOR/FORCE_COLOR; no hubo pruebas fallidas.

Se corrigieron las referencias a develop y al PR #2, los archivos heredados que siguen presentes, el breakpoint navbar-expand-sm (576 px), el contrato T08 y la evidencia de cobertura. DECISIONES.md enlaza la configuración esbuild del profesor y explica la diferencia con el caso PDF.

La última ejecución incluye el botón Iniciar sesión, ubicado en el mismo espacio derecho y con el mismo componente Boton secundario que Cerrar sesión. El spec integrado verifica que abre el formulario desde el catálogo. Tras este ajuste se repitieron test:cov, lint y build con los resultados de la tabla.

Los catorce recorridos Playwright pasaron y se regeneraron las 31 capturas. Las comprobaciones automáticas recorrieron las nueve vistas a 360/768/1280 px. Las descripciones de restauración estética, inspección visual previa y mediciones de contraste siguientes se conservan como evidencia anterior; no se repitieron los cálculos de contraste.

## Restauración estética (evidencia anterior)

Referencia: css/styles.css y vista_6.html del proyecto EP1 original. El perfil tiene identidad centrada, avatar circular de 116 px con degradado y anillo, selector de archivo oculto visualmente pero operable por teclado, formulario oscuro y botón Guardar apodo de ancho completo. Se conservan textos, etiquetas y selectores existentes.

Cabecera y navegación comparten fondo e incorporan insignia con degradado. El menú es horizontal desde 576 px, con hamburguesa bajo ese ancho y un indicador activo accesible. Las tarjetas tienen radio de 16 px, elevación suave, imágenes originales y barras de cupos; los cuatro torneos destacados se distribuyen en una fila en escritorio amplio. Botones píldora de 16 px, focos visibles, badges con punto de estado y mensajes inmediatos completan las nueve vistas.

Las pestañas de rondas funcionan con clic, flechas, Home y End y comparten estado con el selector móvil #ronda. Se comprobaron la carga y persistencia de una foto, el rechazo de un archivo inválido, los filtros en vivo y la preferencia de movimiento reducido. La búsqueda estática de 59 archivos CSS/JSX no encontró colores hexadecimales fuera de :root ni !important; los degradados y sombras usan variables. Las cinco imágenes coinciden con EP1 mediante SHA-256.

En esa restauración se conservaron los 18 specs existentes y se añadió InteraccionesTorneo.spec.js con siete casos; estetica.spec.js añadió cinco recorridos. La suite pasó después de 129 a 130 y a 195 pruebas. Actualmente contiene 242 casos en 28 archivos spec, con 51 archivos de producción instrumentados, sin specs ni helpers.

El commit f6ef8f3 retiró coverage/, playwright-report/ y test-results/ del índice conservando sus archivos locales. .gitignore contiene sus exclusiones. Las afirmaciones previas de que coverage/ ya estaba fuera de Git eran incorrectas; los documentos y logs requeridos siguen versionados en docs/.

## Auditoría previa de cobertura (conservada como historial)

La línea base sobre e9d9426 fue lint, 118 pruebas y build aprobados. En aquella auditoría se registraron lint, test, test:cov y build con código 0. Los 17 specs originales, src/datos/, src/logica/, los componentes existentes y los helpers de src/pruebas/ no se modificaron en esa fase. MensajeError.spec.js agregó cuatro pruebas: cadena vacía, null, undefined y texto válido con role="alert" e id.

Se recorrieron de nuevo las nueve vistas en un navegador aislado a 1280 px: Inicio, CatalogoTorneos, DetalleTorneo, Login, PerfilJugador, GestionEquipos, Inscripcion, PanelAdmin y EquiposRegistrados. Todas mostraron exactamente un h1 y un enlace de navegación activo con aria-current="page". Los botones primarios presentes midieron 16 px. También se comprobaron caption y scope="col" en el ranking, title del iframe, alt no vacío del avatar y autocomplete="nickname" del apodo. No hubo errores de React. El video externo se bloqueó; no se evalúa su reproducción. Esta comprobación puntual no repitió los siete recorridos E2E ni renovó las capturas anteriores.

El registro anterior describía una búsqueda de estilos y comprobaciones de las vistas. La aplicación actual incluye un estilo inline calculado y justificado en BarraCupos. Header.jsx, Footer.jsx y FormInscripcion.jsx siguen presentes como archivos heredados, aunque App utiliza sus reemplazos; se corrige la afirmación anterior de que habían sido eliminados. La prueba T08 ahora comprueba el orden recibido exigido por el caso.

En aquella auditoría se registraron 48 entradas de aplicación y sus páginas HTML, sin specs, helpers, main.jsx ni node_modules. La ejecución actual contiene 51 archivos; COBERTURA_TESTING.md publica los porcentajes actuales por archivo.

.gitignore incluye node_modules/, dist/, coverage/, playwright-report/, test-results/, .idea/ y .DS_Store. La retirada de los reportes del índice se realizó en f6ef8f3; coverage/ se regeneró localmente al ejecutar la suite actual.

## Contraste de la paleta (medición anterior)

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

## Recorridos de navegador (ejecución actual)

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
13. Filtro de cierre coherente con el día mostrado en Santiago.
14. Recuperación de datos incompletos, respaldo del original y acceso al perfil.

La ejecución actual terminó con 14 passed, según salida-e2e.txt. Se actualizaron las capturas de las nueve vistas. El iframe externo se bloquea en los E2E: no se certifica su reproducción ni se presenta esta revisión como una auditoría WCAG completa.

## Evidencias

- Se reprodujo y corrigió un fallo dependiente del orden en useAhora.spec.js: el espía de clearInterval restauraba un temporizador simulado después de desmontar el reloj de Jasmine. La prueba de limpieza quedó en un bloque separado con temporizadores reales. Las 242 pruebas pasaron con las semillas 1, 42 y 98765; después se repitieron test:cov y lint con código 0. No cambió el código de producción por esta corrección.
- salida-orden-pruebas.txt: salida de las tres ejecuciones con semillas explícitas, todas con código 0.
- salida-pruebas.txt: salida real del último test:cov, con 242 casos; sin secuencias de control ANSI.
- salida-e2e.txt: salida real de los catorce recorridos actuales.
- COBERTURA_TESTING.md: porcentajes por archivo.
- capturas/: vistas y validación.
- DECISIONES.md: incidencias del entorno y alcance.

La entrega es un frontend simulado. La base de EP2 ya se integró en develop mediante el PR #2; los reportes generados se retiraron del índice en f6ef8f3. Esta corrección queda en el árbol de trabajo para su revisión. No se generó un ZIP actualizado: debe empaquetarse el commit que se entregue, como indica README.md.
