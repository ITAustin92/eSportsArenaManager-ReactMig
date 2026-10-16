# Verificación final

Fecha: 16 de octubre de 2026.

| Comprobación | Resultado |
|---|---|
| npm run lint | Código 0; sin errores ni advertencias |
| npm run build | Código 0; sin errores ni advertencias; bundle de producción generado |
| npm test | Código 0; 122 aprobadas; sin errores ni advertencias |
| npm run test:cov | Código 0; 122 aprobadas; sin errores ni advertencias; líneas 90,68%, sentencias 84,55%, ramas 82,85%, funciones 80,72% |
| npm run test:e2e | Evidencia previa: 7 recorridos aprobados |
| Vistas responsivas | Evidencia previa: 9 vistas × 3 anchos; un h1 y sin desbordamiento de página |
| Capturas | Evidencia previa conservada: 28 PNG reales |
| Permisos | Evidencia previa: visitante, jugador y admin; URL directa, recarga y cierre de sesión |
| CRUD | Evidencia previa: juegos, torneos, equipos e inscripciones verificados |
| CSS propio | Sin hex fuera de :root ni !important |
| JSX de aplicación | Sin estilos inline; listas de datos por id |
| Suites | Sin fit, xit, fdescribe ni xdescribe |

## Auditoría quirúrgica de esta revisión

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
| Error/superficie | 5.93:1 |
| Acento/fondo | 13.92:1 |
| Borde/superficie | 4.60:1 |

Esto valida los pares de color, no sustituye una auditoría completa WCAG. Bootstrap usa sus estilos internos; la revisión de hex e !important se aplica a las hojas propias, no a dependencias ni a SVG heredados.

## Recorridos de navegador

1. Acceso directo de visitante, retorno después del login, recarga, cierre y denegación de roles.
2. CRUD de juegos/torneos, fechas inválidas y protección de relaciones.
3. Inscripción completa, bloqueo incompleto, duplicidad, cambio de contacto, cancelación y perfil persistente.
4. CRUD de equipo con selección de cinco integrantes.
5. Nueve vistas a 360 px y menú colapsable.
6. Nueve vistas a 768 px.
7. Nueve vistas a 1280 px.

El último recorrido terminó con 7 passed (40.9s). Se inspeccionaron visualmente capturas de inicio, inscripción móvil y consulta administrativa, además de los controles automatizados. No se realizó un recorrido humano exhaustivo ni se certifica reproducción del video externo.

## Evidencias

- salida-pruebas.txt: salida completa del último test:cov, con 122 casos; solo se retiraron las secuencias de control ANSI.
- salida-e2e.txt: evidencia previa de siete recorridos.
- COBERTURA_TESTING.md: porcentajes por archivo.
- capturas/: vistas y validación.
- DECISIONES.md: incidencias del entorno y alcance.

La entrega es frontend simulado. No se publicó en Internet ni se hizo push o PR. El ZIP previo excluye node_modules, .git, .idea, dist y reportes regenerables; no se regeneró durante esta corrección.
