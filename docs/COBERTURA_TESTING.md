# Cobertura y pruebas — EP2

Fecha: 16 de octubre de 2026. Evidencia: ejecución real, no estimaciones.

## Resultado Jasmine/Karma

- npm test: 118 pruebas aprobadas.
- npm run test:cov: 118 pruebas aprobadas.
- Sentencias: 84.55% (794/939).
- Ramas: 82.85% (546/659).
- Funciones: 80.72% (268/332).
- Líneas: 90.68% (555/612).

No se incluyen specs, helpers de prueba, node_modules, CSS, imágenes ni main.jsx en estos porcentajes. App.spec.js importa la aplicación, por lo que se instrumentan también las vistas y formularios, no solamente las funciones puras. La cobertura de Playwright NO está agregada a estos números.

## Entorno y configuración

Node 24.21.0; Chrome for Testing 156 (el agente del navegador reporta Windows 10), Jasmine 4.6.1, Karma 6.4.4, karma-jasmine 5.1, karma-chrome-launcher 3.2, karma-esbuild 2.3, karma-coverage e esbuild-plugin-istanbul. Consultar package-lock.json para resoluciones exactas.

karma.conf.cjs conserva frameworks jasmine, patrón src/**/*.spec.js*, JSX automático y loader .js como JSX. singleRun es el valor por defecto; test:watch lo desactiva. singleBundle: false resuelve el problema de rutas temporales Windows documentado en DECISIONES.md.

La instrumentación Istanbul se activa con --coverage. Un plugin previo devuelve sin instrumentar los specs/helpers. Se comprobaron los archivos del resumen JSON para evitar contarlos artificialmente. Reportes: HTML, text-summary, JSON completo y JSON resumen.

La ejecución aislada utilizó CHROME_BIN hacia el Chrome de pruebas y CHROME_NO_SANDBOX=1. Esta última opción no es necesaria ni aconsejada para navegación habitual. No se cambió la seguridad del navegador del usuario.

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
| T08 | Tabla | Dos participantes desordenados | Dos filas en orden, caption y scope | Aprobado |
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

## Espías, aislamiento y async

FormularioInscripcion usa jasmine.createSpy para onEnviar; Boton para onClick. El CRUD usa almacenamiento en memoria y spyOn(storage, 'setItem').and.throwError. App.spec.js espía scrollTo y monta con act async mientras se resuelve la carga local.

Cada prueba crea fixtures frescos; las pruebas DOM desmontan la raíz dentro de act y eliminan el contenedor. Se comprueba inmutabilidad con copias y toEqual. El reloj de las reglas puras se inyecta como hoy. No se llama una API de negocio real.

## Porcentajes reales por archivo

Fuente: coverage/coverage-summary.json del último npm run test:cov. Todos los valores son porcentajes; no se redondearon a “100” las ramas pendientes.

| Archivo | Sentencias | Ramas | Funciones | Líneas |
|---|---:|---:|---:|---:|
| src/App.jsx | 100 | 75 | 100 | 100 |
| src/components/admin/EquiposRegistrados.jsx | 100 | 95 | 100 | 100 |
| src/components/admin/FormJuego.jsx | 88.88 | 50 | 100 | 100 |
| src/components/admin/FormTorneo.jsx | 47.61 | 43.75 | 57.14 | 64.28 |
| src/components/admin/PanelAdmin.jsx | 66 | 60 | 52.63 | 73.33 |
| src/components/auth/AuthContext.js | 100 | 100 | 100 | 100 |
| src/components/auth/AuthProvider.jsx | 84 | 100 | 85.71 | 100 |
| src/components/auth/Login.jsx | 100 | 70 | 100 | 100 |
| src/components/auth/RutaProtegida.jsx | 100 | 100 | 100 | 100 |
| src/components/auth/useAuth.js | 100 | 100 | 100 | 100 |
| src/components/compartidos/BadgeEstado.jsx | 100 | 100 | 100 | 100 |
| src/components/compartidos/Boton.jsx | 100 | 100 | 100 | 100 |
| src/components/compartidos/Campo.jsx | 100 | 100 | 100 | 100 |
| src/components/compartidos/MensajeError.jsx | 100 | 100 | 100 | 100 |
| src/components/equipos/FormEquipo.jsx | 34.04 | 25 | 38.09 | 44.44 |
| src/components/equipos/GestionEquipos.jsx | 44.11 | 50 | 38.46 | 66.66 |
| src/components/equipos/ListaIntegrantes.jsx | 33.33 | 16.66 | 33.33 | 100 |
| src/components/inicio/Hero.jsx | 0 | 100 | 0 | 0 |
| src/components/inicio/Inicio.jsx | 0 | 0 | 0 | 0 |
| src/components/inicio/TorneosDestacados.jsx | 0 | 0 | 0 | 0 |
| src/components/inscripcion/FormularioInscripcion.jsx | 100 | 95 | 100 | 100 |
| src/components/inscripcion/Inscripcion.jsx | 84.61 | 66.66 | 71.42 | 88.88 |
| src/components/inscripcion/MisInscripciones.jsx | 30.3 | 37.5 | 16.66 | 64.28 |
| src/components/inscripcion/ResumenTorneo.jsx | 100 | 100 | 100 | 100 |
| src/components/layout/Cabecera.jsx | 100 | 100 | 100 | 100 |
| src/components/layout/Layout.jsx | 100 | 50 | 100 | 100 |
| src/components/layout/Navegacion.jsx | 75 | 75 | 50 | 85.71 |
| src/components/layout/PieDePagina.jsx | 100 | 100 | 100 | 100 |
| src/components/perfil/AvatarJugador.jsx | 100 | 66.66 | 100 | 100 |
| src/components/perfil/Estadisticas.jsx | 100 | 100 | 100 | 100 |
| src/components/perfil/PerfilJugador.jsx | 55 | 43.75 | 72.72 | 65.38 |
| src/components/torneos/CatalogoTorneos.jsx | 100 | 100 | 100 | 100 |
| src/components/torneos/DetalleTorneo.jsx | 100 | 66.66 | 100 | 100 |
| src/components/torneos/FiltrosTorneos.jsx | 75 | 100 | 75 | 100 |
| src/components/torneos/ListaPartidas.jsx | 100 | 50 | 100 | 100 |
| src/components/torneos/LlaveTorneo.jsx | 100 | 75 | 100 | 100 |
| src/components/torneos/TablaRanking.jsx | 100 | 100 | 100 | 100 |
| src/components/torneos/TarjetaTorneo.jsx | 100 | 75 | 100 | 100 |
| src/datos/datos.js | 99.63 | 95.56 | 100 | 100 |
| src/datos/useDatos.js | 88.23 | 50 | 85.71 | 90 |
| src/logica/acceso.js | 100 | 94.73 | 100 | 100 |
| src/logica/equipos.js | 100 | 91.83 | 100 | 100 |
| src/logica/inscripcion.js | 100 | 93.84 | 100 | 100 |
| src/logica/juegos.js | 100 | 100 | 100 | 100 |
| src/logica/perfil.js | 100 | 100 | 100 | 100 |
| src/logica/ranking.js | 100 | 100 | 100 | 100 |
| src/logica/sesion.js | 100 | 87.5 | 100 | 100 |
| src/logica/torneos.js | 100 | 98.27 | 100 | 100 |

## Interpretación y límites

Las ramas no cubiertas incluyen errores de almacenamiento/sesión del navegador, algunos caminos alternativos de formularios administrativos, FileReader y confirmaciones de edición. El CRUD central y las reglas críticas sí tienen suites específicas. La línea JSX puede contener varios callbacks: por eso líneas, funciones y ramas miden aspectos diferentes.

Los diez casos obligatorios pasan, pero eso no certifica accesibilidad completa, seguridad, compatibilidad en todos los navegadores ni reproducción de YouTube. Los recorridos responsivos y la inspección de capturas complementan la suite.

## Reproducción

1. npm ci.
2. Instalar Chrome o definir CHROME_BIN.
3. npm run lint y npm run build.
4. npm test y npm run test:cov.
5. Abrir coverage/html/index.html.
6. npm run test:e2e para los recorridos; instalar antes el Chromium de Playwright o usar CHROME_BIN.

Los logs completos están en salida-pruebas.txt y salida-e2e.txt. DECISIONES.md registra las adaptaciones del entorno y el alcance real.
