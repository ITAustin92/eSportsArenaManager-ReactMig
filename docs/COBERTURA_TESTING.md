# Cobertura y pruebas — EP2

Fecha: 16 de octubre de 2026. Evidencia: ejecución real, no estimaciones.

## Resultado Jasmine/Karma

- npm run test:cov: 242 pruebas aprobadas, distribuidas en 28 archivos spec; 51 archivos de aplicación instrumentados.
- La ejecución actual usa la misma suite Jasmine/Karma de npm test, con instrumentación de cobertura. No se repitió npm test por separado.
- Sentencias: 98.67% (1042/1056).
- Ramas: 94.81% (749/790).
- Funciones: 97.64% (373/382).
- Líneas: 99.56% (683/686).

Se corrigió una contaminación de temporizadores entre pruebas en useAhora.spec.js, separando el espía de limpieza del reloj simulado de Jasmine. Las 242 pruebas también aprobaron con las semillas aleatorias 1, 42 y 98765 (salida-orden-pruebas.txt), antes de repetir la ejecución de cobertura indicada arriba.

No se incluyen specs, helpers de prueba, node_modules, CSS, imágenes ni main.jsx en estos porcentajes. App.spec.js importa la aplicación, por lo que se instrumentan también las vistas y formularios, no solamente las funciones puras. La cobertura de Playwright NO está agregada a estos números.

## Entorno y configuración

Ejecución actual: Node 24.22.0 y Edge 155.0.0.0 (identificación reportada por Karma: Windows 10), mediante el launcher ChromeHeadless y el fallback Chromium de karma.conf.cjs. Jasmine 4.6.1, Karma 6.4.4, karma-jasmine 5.1, karma-chrome-launcher 3.2, karma-esbuild 2.3, karma-coverage y esbuild-plugin-istanbul. Consultar package-lock.json para resoluciones exactas.

karma.conf.cjs conserva frameworks jasmine, patrón src/**/*.spec.js*, JSX automático y loader .js como JSX. singleRun es el valor por defecto; test:watch lo desactiva. singleBundle: false resuelve el problema de rutas temporales Windows documentado en DECISIONES.md.

La instrumentación Istanbul se activa con --coverage. El plugin previo de Karma y .nycrc.json excluyen explícitamente `**/*.spec.js`, `**/*.spec.jsx`, `src/pruebas/**`, `src/main.jsx` y `node_modules/**`; el instrumentador solo recibe archivos dentro de src/. Reportes: HTML, text-summary, JSON completo y JSON resumen.

test:cov elimina coverage/ con Node antes de ejecutar Karma. El resumen JSON actual contiene 51 archivos de aplicación, sin specs ni helpers. La tabla siguiente corresponde a la ejecución de 242 pruebas posterior a las correcciones de fechas, sanciones, edición y recuperación de datos; se obtiene de coverage/coverage-summary.json.

El primer intento dentro del entorno restringido falló al iniciar Edge por errores de permisos, antes de ejecutar los casos. La suite se repitió fuera de ese entorno y terminó con código 0, sin CHROME_NO_SANDBOX=1 y usando el perfil temporal de Karma. Karma sirve las imágenes y el favicon locales para evitar avisos 404, sin silenciar advertencias. La configuración esbuild coincide con el repositorio docente enlazado en DECISIONES.md.

## Casos obligatorios

| ID | Descripción | Entrada | Esperado | Obtenido |
|---|---|---|---|---|
| T01 | Orden de ranking | Puntos iguales, diferencias distintas | Mayor diferencia primero; original intacto | Aprobado |
| T02 | Puntos por resultados | Victorias local/visitante, derrota, pendiente | 3 por victoria, 0 por derrota; pendiente ignorado | Aprobado |
| T03 | Cupos | 8–3, 0–0, 2–2, 1–2 | 5, 0, 0, 0 | Aprobado |
| T04 | Límite de plazo | Antes, igual y después del cierre | false, false, true | Aprobado |
| T05 | Sanciones | Vigente, cumplida, expirada, futura | Solo vigente dentro del intervalo bloquea | Aprobado |
| T06 | Plantilla completa | Tamaño correcto/incorrecto, capitán, repetidos | Solo plantilla válida se acepta | Aprobado |
| T07 | Tarjeta | Props de torneo y juego | Nombre, juego, estado, enlace y alt | Aprobado |
| T08 | Tabla | Participantes B, A, en orden distinto al de clasificación | Dos filas B, A conservando el orden recibido; posiciones 1, 2, caption y scope | Aprobado |
| T09 | Formulario bloqueado | Equipo incompleto + espía onEnviar | disabled y cero invocaciones | Aprobado |
| T10 | Llave pendiente | Rival nulo | Participante por definir | Aprobado |

## Casos adicionales

| ID | Comportamiento | Entrada / límite | Resultado |
|---|---|---|---|
| T11 | Equipos y suplentes | Duplicados; -1, 0, 1.5, 2, 3; suplentes reales | Aprobado |
| T12 | Claves | Longitud 5/6 y confirmación distinta | Aprobado |
| T13 | Apodo/avatar | 2/3/15/16 caracteres; espacios; tipo y 2 MB | Aprobado |
| T14 | Filtros | Rango invertido, límites, búsqueda inexistente | Aprobado |
| T15 | Roles | Matriz de tres roles, rutas públicas/privadas, menú | Aprobado |
| T16 | Sesión | JSON corrupto, rol alterado, clave incorrecta | Aprobado |
| T17 | RutaProtegida | Visitante, admin y jugador abren perfil | Aprobado |
| T18 | Estado y eventos | Escribir contacto, callback válido, cambiar ronda | Aprobado |
| T19 | CRUD | Crear/leer/editar/eliminar las cuatro entidades | Aprobado |
| T20 | Integridad | Juego referenciado, cupo bajo inscritos, reglas iniciadas | Aprobado |
| T21 | Atomicidad | Storage simulado arroja error al escribir | No hay cambio parcial; aprobado |
| T22 | Propiedad | Equipo/inscripción/perfil ajenos | Operación rechazada; aprobado |
| T23 | Suscripción | Notificación y posterior limpieza | Solo una notificación; aprobado |
| T24 | Integración React | Login con retorno, perfil, búsqueda admin y CRUD juego | Aprobado |
| T25 | MensajeError.spec.js: sin error | Cadena vacía, null, undefined (tres pruebas) | Cero nodos DOM; aprobado |
| T26 | MensajeError.spec.js: con error | Texto e id correo-error | Texto exacto, role="alert" e id recibido; aprobado |
| T27 | BarraCupos | Cambio de ocupación, capacidad cero, ocupación negativa o excesiva | Porcentaje entre 0 y 100 y texto accesible actualizado; aprobado |
| T28 | Rondas sincronizadas | Clic, selector móvil, flechas, Home, End y Tab | Partidas, selección y foco coherentes; aprobado |
| T29 | Rondas vacías | Torneo sin partidas | Mensaje de ausencia y sin pestañas vacías; aprobado |
| T30 | Clasificación en el detalle | Ranking B, A, C con diferencias y puntos distintos | DetalleTorneo entrega C, A, B a la tabla sin modificar el ranking original; aprobado |
| T31 | Inicio: 8 casos | Destacados, próximos cierres, enlaces, ausencia de abiertos, vacío, zonas horarias y vencimiento | Contenido correcto, cierres disponibles y navegación sin alterar los datos; aprobado |
| T32 | FormEquipo: 9 casos | Obligatorios, selección, duplicados, creación, claves, nombre único, suplentes, error y cancelación | Callback solo válido, errores accesibles y borrador conservado; aprobado |
| T33 | GestionEquipos: 9 casos | Crear/editar/eliminar, cancelar, equipo inscrito, fallo de persistencia y vacío | Lista y relaciones actualizadas; operaciones bloqueadas sin cambios parciales; aprobado |
| T34 | MisInscripciones: 12 casos | Propiedad, edición, correo inválido, cancelación, plazo, borrador abierto y fallos de almacenamiento | Contacto persistido o cupo liberado solo después de guardar correctamente; borrador retirado solo al cancelar con éxito; aprobado |
| T35 | PerfilJugador: 14 casos | Datos, vacíos, sanciones, apodo, tipo/tamaño de archivo, lectura y persistencia de foto | Ficha, relaciones y avatar actualizados; sanciones vencidas/futuras bien etiquetadas; errores conservan el estado anterior; aprobado |
| T36 | Formularios admin: 10 casos | Campos, fechas, reglas bloqueadas, tamaño, callbacks, reintento y cancelación | Solo se entregan borradores válidos y se explican fallos; aprobado |
| T37 | PanelAdmin: 10 casos | Crear/editar/eliminar torneo, editar juego, descartar, relaciones, vacíos y almacenamiento | CRUD reflejado en pantalla, sin persistir operaciones rechazadas; aprobado |
| T38 | Fechas y plazos | Día de Santiago, horario de invierno, ISO equivalentes y límite exacto | Filtro coherente con la fecha visible y orden por instante real; aprobado |
| T39 | Reloj de vistas: 4 casos | Avance simulado, foco, visibilidad y desmontaje | Hora actualizada y temporizadores/listeners retirados; aprobado |
| T40 | Datos guardados: 28 casos | Campos/arreglos anidados, ids, referencias, JSON ilegible, respaldo, fallo al respaldar y recarga válida | Se rechaza el contenido inválido y se conserva su original antes de regenerar; los cambios válidos persisten; aprobado |
| T41 | Formulario y detalle al vencer | Cierre alcanzado con vista abierta y regreso a la ventana | Se retira o bloquea la acción y se explica el plazo vencido; aprobado |

## Espías, aislamiento y async

FormularioInscripcion usa jasmine.createSpy para onEnviar; Boton para onClick. El CRUD usa almacenamiento en memoria y spyOn(storage, 'setItem').and.throwError. App.spec.js espía scrollTo y monta con act async mientras se resuelve la carga local.

Cada prueba crea fixtures frescos; las pruebas DOM desmontan la raíz dentro de act y eliminan el contenedor. Se comprueba inmutabilidad con copias y toEqual. El reloj de las reglas puras se inyecta como hoy. No se llama una API de negocio real.

MensajeError.spec.js reutiliza prepararDOM/renderizar de src/pruebas/dom.jsx y su configuración IS_REACT_ACT_ENVIRONMENT. Durante esta restauración se conservaron intactos los 18 specs existentes, incluido MensajeError.spec.js, y se añadió InteraccionesTorneo.spec.js con siete casos. La búsqueda en todo src/ no encontró fit, xit, fdescribe ni xdescribe.

Playwright verifica catorce recorridos: los doce anteriores de permisos, CRUD, inscripción, vistas responsivas, avatar, menú, rondas, imágenes y movimiento reducido, más dos regresiones de filtro por fecha de Santiago y recuperación de datos incompletos con respaldo. Sus resultados no se mezclan con la cobertura unitaria.

La corrección previa de TablaRanking pasó de 129 a 130 pruebas; la ampliación de comportamiento añadió 65 casos, llegando a 195. Las correcciones actuales suman 47 regresiones y elevan el total a 242. Los catorce recorridos Playwright pasaron y se actualizaron las 31 capturas. La salida actual está en salida-e2e.txt.

La suite también incluye el acceso a sesión: Iniciar sesión es un botón secundario en el mismo espacio derecho que Cerrar sesión. App.spec.js comprueba que abre el formulario desde el catálogo; la prueba de inicio/cierre sigue comprobando el flujo autenticado.

Los helpers arena.jsx y VistaSuscrita.jsx montan las vistas con contexto de sesión, router y suscripción al servicio real usando almacenamiento en memoria. Cada vista recibe las escrituras publicadas por el servicio, permitiendo comprobar pantalla y persistencia juntas. El desmontaje elimina la suscripción y cada caso prepara datos nuevos. Los fallos de almacenamiento se provocan con spyOn; FileReader se sustituye por un espía para controlar éxito y error sin temporizadores. clicEn ahora genera un MouseEvent cancelable, necesario para que React Router intercepte los enlaces igual que en un clic real; antes este detalle causó una recarga de Karma al probar la navegación de inicio.

| Área reforzada | Líneas antes | Líneas actuales |
|---|---:|---:|
| Inicio, Hero y TorneosDestacados | 0% | 100% |
| FormEquipo | 44.44% | 100% |
| GestionEquipos | 66.66% | 100% |
| MisInscripciones | 64.28% | 100% |
| PerfilJugador | 65.38% | 100% |
| FormTorneo | 64.28% | 100% |
| PanelAdmin | 73.33% | 100% |

## Porcentajes reales por archivo

Fuente: coverage/coverage-summary.json del último npm run test:cov. Todos los valores son porcentajes; no se redondearon a “100” las ramas pendientes.

| Archivo | Sentencias | Ramas | Funciones | Líneas |
|---|---:|---:|---:|---:|
| src/App.jsx | 100 | 75 | 100 | 100 |
| src/components/admin/EquiposRegistrados.jsx | 100 | 94.44 | 100 | 100 |
| src/components/admin/FormJuego.jsx | 100 | 100 | 100 | 100 |
| src/components/admin/FormTorneo.jsx | 100 | 100 | 100 | 100 |
| src/components/admin/PanelAdmin.jsx | 98 | 96 | 94.73 | 100 |
| src/components/auth/AuthContext.js | 100 | 100 | 100 | 100 |
| src/components/auth/AuthProvider.jsx | 84 | 100 | 85.71 | 100 |
| src/components/auth/Login.jsx | 100 | 70 | 100 | 100 |
| src/components/auth/RutaProtegida.jsx | 100 | 100 | 100 | 100 |
| src/components/auth/useAuth.js | 100 | 100 | 100 | 100 |
| src/components/compartidos/BadgeEstado.jsx | 100 | 100 | 100 | 100 |
| src/components/compartidos/Boton.jsx | 100 | 100 | 100 | 100 |
| src/components/compartidos/Campo.jsx | 100 | 100 | 100 | 100 |
| src/components/compartidos/MensajeError.jsx | 100 | 100 | 100 | 100 |
| src/components/equipos/FormEquipo.jsx | 100 | 95 | 100 | 100 |
| src/components/equipos/GestionEquipos.jsx | 100 | 100 | 100 | 100 |
| src/components/equipos/ListaIntegrantes.jsx | 100 | 100 | 100 | 100 |
| src/components/inicio/Hero.jsx | 100 | 100 | 100 | 100 |
| src/components/inicio/Inicio.jsx | 100 | 100 | 100 | 100 |
| src/components/inicio/TorneosDestacados.jsx | 100 | 100 | 100 | 100 |
| src/components/inscripcion/FormularioInscripcion.jsx | 100 | 95 | 100 | 100 |
| src/components/inscripcion/Inscripcion.jsx | 84.61 | 66.66 | 71.42 | 88.88 |
| src/components/inscripcion/MisInscripciones.jsx | 100 | 100 | 100 | 100 |
| src/components/inscripcion/ResumenTorneo.jsx | 100 | 100 | 100 | 100 |
| src/components/layout/Cabecera.jsx | 100 | 100 | 100 | 100 |
| src/components/layout/Layout.jsx | 100 | 50 | 100 | 100 |
| src/components/layout/Navegacion.jsx | 81.25 | 75 | 62.5 | 87.5 |
| src/components/layout/PieDePagina.jsx | 100 | 100 | 100 | 100 |
| src/components/perfil/AvatarJugador.jsx | 100 | 100 | 100 | 100 |
| src/components/perfil/Estadisticas.jsx | 100 | 100 | 100 | 100 |
| src/components/perfil/PerfilJugador.jsx | 100 | 100 | 100 | 100 |
| src/components/torneos/BarraCupos.jsx | 100 | 100 | 100 | 100 |
| src/components/torneos/CatalogoTorneos.jsx | 100 | 100 | 100 | 100 |
| src/components/torneos/DetalleTorneo.jsx | 100 | 87.17 | 100 | 100 |
| src/components/torneos/FiltrosTorneos.jsx | 75 | 100 | 75 | 100 |
| src/components/torneos/ListaPartidas.jsx | 100 | 100 | 100 | 100 |
| src/components/torneos/LlaveTorneo.jsx | 100 | 75 | 100 | 100 |
| src/components/torneos/TablaRanking.jsx | 100 | 100 | 100 | 100 |
| src/components/torneos/TarjetaTorneo.jsx | 100 | 75 | 100 | 100 |
| src/datos/datos.js | 99.64 | 96.91 | 100 | 100 |
| src/datos/useDatos.js | 88.23 | 50 | 85.71 | 90 |
| src/datos/validarDatos.js | 100 | 100 | 100 | 100 |
| src/logica/acceso.js | 100 | 94.73 | 100 | 100 |
| src/logica/equipos.js | 100 | 91.83 | 100 | 100 |
| src/logica/inscripcion.js | 100 | 93.05 | 100 | 100 |
| src/logica/juegos.js | 100 | 100 | 100 | 100 |
| src/logica/perfil.js | 100 | 100 | 100 | 100 |
| src/logica/ranking.js | 100 | 100 | 100 | 100 |
| src/logica/sesion.js | 100 | 87.5 | 100 | 100 |
| src/logica/torneos.js | 100 | 98.38 | 100 | 100 |
| src/logica/useAhora.js | 100 | 100 | 100 | 100 |

## Interpretación y límites

Las tres líneas sin cubrir corresponden a caminos de Inscripcion, Navegacion y useDatos. Las ramas restantes incluyen alternativas de permisos/sesión, algunos valores por defecto, estados de inscripción y errores de carga. Los formularios principales, FileReader, fallos de persistencia y confirmaciones de edición/cancelación ahora tienen pruebas de comportamiento. La línea JSX puede contener varios callbacks: por eso líneas, funciones y ramas miden aspectos diferentes. El 100% de líneas de una vista no significa que todas sus ramas o todos los escenarios posibles estén cubiertos.

Los diez casos obligatorios pasan, pero eso no certifica accesibilidad completa, seguridad, compatibilidad en todos los navegadores ni reproducción de YouTube. Los recorridos responsivos y la inspección de capturas complementan la suite.

## Reproducción

1. npm ci.
2. Instalar Chrome o definir CHROME_BIN.
3. npm run lint y npm run build.
4. npm test y npm run test:cov.
5. Abrir coverage/html/index.html.
6. npm run test:e2e para los recorridos; instalar antes el Chromium de Playwright o usar CHROME_BIN.

Los logs completos están en salida-pruebas.txt y salida-e2e.txt. DECISIONES.md registra las adaptaciones del entorno y el alcance real.
