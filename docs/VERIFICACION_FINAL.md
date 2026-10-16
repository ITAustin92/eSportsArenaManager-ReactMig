# Verificación final

Fecha: 16 de octubre de 2026.

| Comprobación | Resultado |
|---|---|
| npm run lint | Aprobado, sin diagnósticos |
| npm run build | Aprobado; bundle de producción generado |
| npm test | 118 aprobadas |
| npm run test:cov | 118 aprobadas; líneas 90,68%, sentencias 84,55%, ramas 82,85%, funciones 80,72% |
| npm run test:e2e | 7 recorridos aprobados |
| Vistas responsivas | 9 vistas × 3 anchos; un h1 y sin desbordamiento de página |
| Capturas | 28 PNG reales |
| Permisos | Visitante, jugador y admin; URL directa, recarga y cierre de sesión |
| CRUD | Juegos, torneos, equipos e inscripciones verificados |
| CSS propio | Sin hex fuera de :root ni !important |
| JSX de aplicación | Sin estilos inline; listas de datos por id |
| Suites | Sin fit, xit, fdescribe ni xdescribe |

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

- salida-pruebas.txt: dos ejecuciones completas de 118 casos.
- salida-e2e.txt: siete recorridos finales.
- COBERTURA_TESTING.md: porcentajes por archivo.
- capturas/: vistas y validación.
- DECISIONES.md: incidencias del entorno y alcance.

La entrega es frontend simulado. No se publicó en Internet ni se hizo push o PR. El ZIP excluye node_modules, .git, .idea, dist y reportes regenerables.
