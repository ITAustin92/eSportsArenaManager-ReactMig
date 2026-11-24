# eSports Arena Manager EP3

Integración de React con los microservicios Spring Boot, basada en la entrega EP2 y en
los ZIP de avance del equipo. Todo el tráfico del navegador pasa por el API Gateway.

## Organización

- `src/`: frontend React, cliente HTTP, autenticación, catálogo y vistas por rol.
- Backend independiente: [eSportsArenaManager](https://github.com/ITAustin92/eSportsArenaManager).
  Su copia local está en la carpeta hermana `../eSportsArenaManager`.
- `docs/ep2/`: documentos y evidencias históricas; no acreditan la cobertura de EP3.

## Ejecutar el frontend

Requiere Node 20.19+ (rama 20) o 22.12+ y el backend disponible.

```sh
npm ci
```

Copiar `.env.example` a `.env` y configurar `VITE_API_URL=http://localhost:8080`.

```sh
npm run dev
```

En Vercel, `VITE_API_URL` debe ser la URL HTTPS del servicio en Render, sin `/api` al final.
Las funciones de servicio agregan `/api/v1/...`. Cambiar la variable requiere un
nuevo build. `vercel.json` conserva las rutas de React al recargar.

## Ejecutar el backend

Consultar el README del repositorio backend o la [guía de despliegue](docs/ep3/DESPLIEGUE.md). El modo local trae datos ficticios; los perfiles
`mysql` y `prod` conservan las tablas y desactivan la carga de `data.sql`.

## Roles

| Rol | Funciones |
| --- | --- |
| Visitante | Inicio, catálogo y detalles; login y registro |
| JUGADOR | Perfil, equipos propios e inscripciones de equipo o individuales 1v1 |
| ORGANIZADOR | Consulta de torneos e inscripciones |
| ADMIN | Administración de juegos, torneos, equipos y cuentas; gestión de inscripciones |

La sesión conserva solo el JWT en `localStorage`; nunca guarda la contraseña. El
navegador lee sus claims para la interfaz. La firma y los permisos se comprueban en
el servidor. El almacenamiento local es accesible a JavaScript: debe mantenerse el
escape de React y evitar insertar HTML de usuarios.

## Funciones conservadas de EP2

Hero y carrusel, imágenes de juegos, filtros por fecha, video destacado, cupos y
cierre, rondas y llaves, avatar, estadísticas y consulta de sanciones. El perfil y
las pantallas operativas consumen la API; no se usa la antigua base simulada de EP2.
La inscripción comprueba en el servidor modalidad, juego, integrantes activos,
sanciones del torneo, plazo, cupos, duplicidad y propiedad del participante.

## Formato y compilación

```sh
npm run format
npm run format:check
npm run lint
npm run build
```

Prettier utiliza tabulaciones y un ancho objetivo de 100 caracteres. El backend
mantiene su propia configuración de formato para Java y YAML en su repositorio.

## Pruebas y evidencia

```sh
npm test
npm run test:cov
npm run test:e2e
```

Estos comandos ejecutan los specs actuales de EP3 y los componentes reutilizados.
La suite antigua de 242 pruebas corresponde al contrato de datos de EP2 y se conserva
en el historial Git. Las antiguas pruebas de navegación se archivaron en
`docs/ep2/pruebas-e2e/`, porque usan cuentas, rutas y selectores de aquella versión.

Verificación del 23 de noviembre de 2026:

| Comprobación | Resultado |
| --- | --- |
| Karma/Jasmine en Edge | 84 pruebas aprobadas |
| Maven/JUnit del backend separado | 153 pruebas aprobadas |
| Playwright con los 14 servicios locales reales | 14 recorridos aprobados |
| Compilación, lint y formato del frontend | Correctos |

Karma cubre sesión persistente, renovación y vencimiento, respuestas tardías, errores
HTTP, formularios, permisos, datos parciales y estadísticas. El informe de cobertura
se genera en `coverage/html/index.html`: mide los módulos importados por los specs,
no equivale a cobertura de todo el proyecto ni incluye los recorridos Playwright.

Los recorridos de integración no simulan respuestas de la API. Comprueban registro,
login, recarga y logout; CRUD de juegos, torneos y equipos; creación y eliminación
de cuentas; inscripción individual y por equipos; cancelación; acceso por rol,
propiedad de equipos, rechazo de JWT manipulado y tres solicitudes simultáneas para
dos cupos. También verifican partidas y resultados individuales, corrección del
ganador, reenvíos simultáneos sin puntos duplicados, actualización del perfil y
anulación de los puntos. El informe se genera en `playwright-report/index.html`.

Para repetir Playwright, iniciar primero el backend local con los datos ficticios y
las cuentas de demostración de su README. Agregar `http://localhost:4173` a
`CORS_ORIGENES` del backend. Con los módulos separados, el gateway debe responder
en `http://localhost:8080` y auth en `http://localhost:8099`.

Con `arena-web`, usar la misma URL base en `ARENA_TEST_API_URL` y
`ARENA_TEST_AUTH_URL`. Playwright inicia Vite en el puerto 4173 y usa Edge en
Windows. En otros sistemas se puede instalar Chromium con
`npx playwright install chromium`, o definir `CHROME_BIN`.

Estas pruebas crean datos ficticios; usar una instancia dedicada de demostración.
La ejecución documentada utilizó Java 21, H2 y Edge; no valida un despliegue cloud
ni el perfil PostgreSQL/MySQL. Maven usa bases H2 en memoria independientes de las
bases de desarrollo. `npm run test:evidencia` renueva expresamente las capturas
versionadas de la documentación; las pruebas habituales guardan imágenes solo en
`test-results/`.

## Documentación de EP3

Consultar [el índice de entrega](docs/ep3/README.md): ERS actualizada, manual con
capturas reales, documento de integración, planilla de APIs, contratos OpenAPI y
guía para la presentación y defensa. Los informes y capturas antiguos de EP2 se
conservan en `docs/ep2/` como evidencia histórica.

## Pendientes para la entrega

Completar el despliegue del backend con una base persistente, configurar la conexión
del frontend publicado y repetir las comprobaciones en producción. La documentación
identifica expresamente este pendiente. Los premios conservan su contrato por
equipos; el ciclo individual implementado cubre inscripción, partida, resultado,
clasificación y perfil. No se debe declarar una cobertura o una nota a partir de
los conteos de pruebas.
