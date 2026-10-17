# eSports Arena Manager — React EP2

Frontend de la Evaluación Parcial 2, DSY1104 Desarrollo FullStack II, Duoc UC.
Integrantes: Ángel Quintero, Luis Ahumada y Cristian Villavicencio.

## Instalar y ejecutar

Requisitos: Node compatible con Vite (20.19+ de la rama 20, o 22.12+; se verificó con 24.21.0), npm y Chrome para las pruebas Karma. Las cuentas son ficticias; no utilizar contraseñas reales.

```sh
npm ci
npm run dev
```

Abrir la dirección que indique Vite. Para comprobar la compilación:

```sh
npm run lint
npm run build
npm run preview
```

En hosting estático, configurar fallback a index.html para que /torneos/:id y las rutas privadas funcionen al recargar. No se usan rutas con #.

## Usuarios de prueba

| Rol | Correo | Clave ficticia |
|---|---|---|
| Administrador | admin@arena.example | Admin123! |
| Jugador Felipe | felipe@arena.example | Jugador123! |
| Jugadora Sofía | sofia@arena.example | Jugador123! |

Sofía tiene una sanción activa de ejemplo. Felipe puede administrar Arena Demo y los equipos de prueba incompleto, inactivo y sancionado. Para inscribirse en Valorant, elegir “Equipo completo” y “Arena Demo”.

## Rutas

| Ruta | Acceso |
|---|---|
| / | Público: inicio |
| /torneos | Público: catálogo y filtros |
| /torneos/:id | Público: detalle, ranking, llaves y premios |
| /login | Visitante; una sesión existente redirige |
| /inscripcion?torneo=copa-latam-valorant | Jugador |
| /equipos | Jugador: CRUD de sus equipos |
| /perfil | Jugador: avatar, apodo e inscripciones |
| /admin | Admin: CRUD de juegos y torneos |
| /admin/equipos | Admin: integrantes, sanciones y resultados |

Visitantes que abren una ruta privada van a login y conservan el destino. Un usuario con rol incompatible recibe 403. Cerrar sesión elimina sessionStorage y abre /login.

## Funcionalidades y límites

Se conservan las seis vistas de EP1, sus imágenes y la estructura de la base React. Se agregan roles, Bootstrap, estado compartido, validaciones puras y datos simulados con CRUD.

Los cambios se guardan en localStorage y actualizan las pantallas inmediatamente. La sesión se guarda en sessionStorage sin contraseña. No hay backend, cuentas reales, envío de correos, pago ni sincronización multiusuario. Las claves de equipo se validan, pero no se almacenan. El frontend no ofrece seguridad real frente a manipulación del navegador.

Los torneos abiertos reciben fechas futuras al inicializar la demostración; quedan fijadas al guardar. El ranking histórico y los marcadores detallados son datos ficticios de ejemplo. Consultar docs/DECISIONES.md para alcance y restricciones.

Para reiniciar únicamente esta demostración, abrir la consola en el sitio y ejecutar:

```js
localStorage.removeItem('arena-ep2-datos-v1')
sessionStorage.removeItem('arena-ep2-sesion-v1')
location.reload()
```

Esto descarta los cambios simulados y la sesión; no se debe hacer si se desea conservarlos.

## Pruebas Jasmine y Karma

```sh
npm test
npm run test:watch
npm run test:cov
```

Los specs están junto a la lógica/componentes y usan Jasmine 4.6 + Karma 6.4.4 + esbuild. La cobertura HTML queda en coverage/html/index.html, con resumen JSON y porcentajes por archivo. Los specs y helpers no se contabilizan como aplicación.

Si Chrome no se detecta, indicar su ubicación en PowerShell:

```powershell
$env:CHROME_BIN = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
npm test
```

Alternativa para obtener un navegador de pruebas: npx playwright install chromium. La ruta se consulta con:

```sh
node -e "console.log(require('playwright').chromium.executablePath())"
```

Asignar esa ruta a CHROME_BIN para Karma. No establecer CHROME_NO_SANDBOX en un equipo habitual: esa opción solo se usó en el contenedor aislado de verificación.

## Recorridos y capturas

```sh
npx playwright install chromium
npm run test:e2e
```

Playwright inicia Vite en el puerto 4173 y verifica permisos, sesión, CRUD, inscripciones, perfil y nueve vistas a 360/768/1280 px. Permite usar un Chrome existente con CHROME_BIN. Las capturas están en docs/capturas y el reporte regenerable en playwright-report.

Si ya se mantiene un servidor local en 4173, PowerShell permite usar $env:ARENA_EXTERNAL_SERVER = '1' antes de ejecutar los recorridos. Esta opción evita que Playwright administre ese servidor. El video externo se excluye de la prueba automatizada; su reproducción requiere Internet.

## Organización

```text
src/
  components/       inicio, torneos, inscripcion, equipos, perfil,
                    auth, admin, layout, compartidos
  datos/            semilla + CRUD + hook de suscripción
  logica/           validadores y reglas puras con specs adyacentes
  pruebas/          fixtures y helpers DOM
  styles/           utilidades compartidas
  App.jsx           rutas y datos compartidos
  main.jsx          Bootstrap, router y proveedor de sesión
tests/e2e/          recorridos Playwright
docs/               ERS, decisiones, defensa, pruebas y capturas
```

## Documentación y publicación

- docs/ERS_v2.md: requisitos, arquitectura, paleta y trazabilidad.
- docs/COBERTURA_TESTING.md: casos y cobertura real por archivo.
- docs/salida-pruebas.txt: salida de Karma.
- docs/salida-e2e.txt: salida de los recorridos finales.
- docs/GUIA_DEFENSA.md: demostración y explicación técnica.
- docs/DECISIONES.md: decisiones y límites.
- docs/capturas/LEEME.md: inventario de evidencia.

La entrega está en feature/ep2-react-completo con commits locales. Revisar los cambios antes de ejecutar:

```sh
git push -u origin feature/ep2-react-completo
```

Después crear el PR hacia main. No se hizo push automáticamente. Para un ZIP limpio de lo versionado:

```sh
git archive --format=zip --prefix=eSportsArenaManager-ReactMig/ --output=../eSportsArenaManager-EP2.zip HEAD
```

El paquete no necesita node_modules, .git, .idea, dist ni reportes regenerables; sí incluye código, lockfile, pruebas, documentos y capturas.
