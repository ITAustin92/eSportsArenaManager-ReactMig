# Decisiones de implementación — EP2

Fecha de cierre: 16 de octubre de 2026.

## Base y alcance

Se trabajó sobre el repositorio existente y su rama develop, cuyo último commit previo era d8e857d. Se conservan la estructura por áreas, Vite, React, oxlint, las imágenes originales, los nombres e identificadores de torneos y las seis vistas de EP1. El documento recibido describía una plantilla vacía, pero el repositorio ya contenía una migración funcional: se amplió esa base, sin sustituirla por otra plantilla.

Se agregan login, administración y consulta administrativa de equipos. No se implementa backend, pago, envío de correo, JWT real ni edición de resultados deportivos: corresponden a una fase posterior. El CRUD solicitado cubre juegos, torneos, equipos e inscripciones; el perfil permite actualizar apodo y avatar.

## Datos coherentes y persistencia

- Fuente única: src/datos/datos.js. Se retiró la segunda colección de detalles de src/logica/detallesTorneos.js.
- Los cupos ocupados se calculan desde inscritos. Se reemplazaron cifras de ocupación que no tenían participantes identificados por el número real de registros simulados.
- Un mismo nombre de equipo en juegos distintos tiene identificadores y plantillas diferentes.
- Los nombres de integrantes y todas las cuentas/correos son ficticios. Los equipos de prueba Arena Demo, Equipo Incompleto, Equipo Inactivo y Equipo Sancionado permiten demostrar los bloqueos.
- Los torneos abiertos reciben cierres 30–34 días posteriores a la primera carga. Los torneos iniciados o finalizados tienen fechas pasadas coherentes. Las fechas se fijan al guardar la semilla en localStorage y NO avanzan con cada recarga.
- Al vencer un torneo guardado, permanece cerrado por plazo aunque su estado todavía diga Abierto. Para una demostración nueva se puede borrar únicamente la clave arena-ep2-datos-v1, como indica el README.
- La tabla de ranking conserva el resumen histórico de EP1. Los marcadores detallados son una muestra ficticia parcial, no una reconstrucción de todos los encuentros históricos. No deben interpretarse como resultados deportivos reales.
- Las inscripciones modifican simultáneamente la colección de registros, los cupos y los torneos del equipo. La escritura al almacenamiento precede a la notificación a React. Si falla, no se publica un cambio parcial.
- El avatar se guarda como data URL con límite de 2 MB. La cuota de localStorage puede ser menor que el conjunto de archivos; los fallos de escritura se informan.
- No hay sincronización multiusuario ni entre pestañas para los datos. “Tiempo real” en EP2 significa actualización inmediata en la interfaz de la pestaña actual.

## Reglas de edición

El administrador no puede borrar juegos referenciados ni torneos iniciados o con inscritos. Las reglas críticas de un torneo iniciado quedan bloqueadas en formulario y servicio. No se retrocede un torneo finalizado. En un torneo abierto con participantes no se puede cambiar el juego ni reducir capacidad por debajo de los inscritos.

Solo el capitán puede crear, editar o eliminar sus equipos. La plantilla queda bloqueada mientras tenga inscripciones; se cancela primero la inscripción si el plazo lo permite. La clave del equipo se valida como ejercicio, pero NO se guarda ni se reutiliza como contraseña de acceso. Editar un equipo sancionado no elimina su historial de sanciones.

La inscripción individual usa el jugador autenticado; la grupal usa un equipo del que sea capitán. Se revisan sanciones del jugador, del equipo y de sus integrantes. El instante exacto de cierre todavía permite inscripción; se bloquea cuando el tiempo actual lo supera.

El perfil distingue historial histórico e inscripciones actuales; inscribirse no inventa una victoria ni un resultado.

## Rutas y sesión

BrowserRouter sustituye las rutas hash. Los enlaces antiguos #detalle/#perfil no se mantienen como interfaz paralela. Vite soporta recargas en rutas profundas; el hosting de producción debe devolver index.html en rutas que no sean archivos.

AuthContext conserva una sesión ficticia en sessionStorage, sin clave. Login respeta el destino solicitado si el rol puede acceder. El cierre de sesión lleva a /login. Menú y RutaProtegida consumen las mismas reglas puras.

Esta protección en frontend NO constituye seguridad real: una persona con herramientas del navegador puede alterar el código o el almacenamiento. En EP3, el backend autenticará, validará el JWT, autorizará cada operación y usará transacciones para cupos y duplicados.

## Formularios y estilos

Se usa la paleta Arena púrpura. El botón usa una variante más oscura del primario para superar el contraste de texto de 4,5:1; el primario original se conserva como variable. Bootstrap se carga antes de los estilos propios. No se utiliza su JavaScript: el menú móvil se controla con React.

Los componentes sin reglas visuales particulares usan utilidades compartidas; no se crearon archivos CSS vacíos. Los que tienen estilos propios los importan en su primera línea. Las tablas tienen desplazamiento horizontal local en pantallas pequeñas.

Las fechas administrativas se introducen en ISO con zona explícita, con ejemplo visible; así se conserva exactamente el instante original al editar reglas bloqueadas y se evita desplazarlo por la zona del equipo. La visualización pública usa America/Santiago. Los filtros de fecha usan la fecha ISO de cierre, tal como se almacena.

## Pruebas y entorno

Se conserva la combinación docente Jasmine 4.6 / Karma 6.4.4 / karma-jasmine 5.1 / karma-chrome-launcher 3.2 / karma-esbuild 2.3, con JSX automático. Los specs con JSX usan extensión .spec.js y el loader docente, porque la conversión de .spec.jsx a .spec.js de Karma interfería con la resolución de archivos.

Se usa singleBundle: false: el directorio temporal del contenedor Windows contiene llaves y el modo de bundle único producía una URL temporal no resuelta. No se sustituyó la cadena por webpack.

Cobertura: karma-coverage + esbuild-plugin-istanbul. Un plugin previo excluye specs y helpers de pruebas; la transformación interna del plugin de Istanbul no respetaba por sí sola esas exclusiones. Se verificó el JSON real, no solo el código de salida.

Chrome instalado no estaba disponible en su ubicación usual y Edge no arrancó dentro del contenedor restringido. La ejecución se realizó con Chrome for Testing 156, descargado fuera del repositorio. CHROME_BIN permite seleccionarlo. Solo en este contenedor aislado se habilitó CHROME_NO_SANDBOX=1; en un equipo habitual se usa ChromeHeadless sin esa variable. No se modificaron perfiles ni ajustes del navegador personal.

Playwright añade siete recorridos de integración y capturas, sin reemplazar Jasmine/Karma. El iframe externo se bloquea durante esos recorridos: no se verifica disponibilidad ni reproducción de YouTube. En el entorno restringido se mantuvo Vite en un proceso separado y se usó ARENA_EXTERNAL_SERVER=1 para evitar el cierre automático de procesos de Windows. Los comandos normales siguen disponibles para el equipo.

Se retiraron Header, Footer, FormInscripcion, el router hash, el CSS monolítico y las pruebas Node obsoletas. Son recuperables en el historial Git; los reemplazos están cubiertos por las nuevas suites.

## Corrección quirúrgica de cobertura y auditoría

Auditoría del 16 de octubre de 2026 sobre e9d9426. La línea base fue lint, 118 pruebas y build aprobados. No se reescribió ningún componente, regla de negocio, dato, helper ni spec existente. Se añadió únicamente MensajeError.spec.js con cuatro casos, para un total de 122 pruebas.

El resumen JSON previo ya excluía las pruebas, pero el HTML conservaba carpetas antiguas de components, datos, logica y pruebas junto a src. Se limpió coverage/ y test:cov ahora repite esa limpieza con fs.rmSync antes de cada ejecución. Las exclusiones de specs, helpers, main.jsx y node_modules quedan explícitas tanto en .nycrc.json como en el plugin previo a Istanbul; el filtro de instrumentación se limita a src. Se mantienen Jasmine, los specs como módulos, JSX automático, loader .js como JSX y singleBundle: false.

La línea base mostraba avisos 404 de imágenes y favicon. Karma ahora sirve public/ y un middleware previo redirige sus rutas al servidor estático de Karma. No se empleó el proxy HTTP de Karma porque su dependencia generaba una advertencia de obsolescencia con Node 24. No se silenciaron advertencias ni se cambiaron dependencias.

Para esta revisión se reutilizó Chrome Headless Shell 156 ya disponible fuera del repositorio mediante CHROME_BIN y CHROME_NO_SANDBOX=1. No se alteraron navegadores personales ni la selección normal de ChromeHeadless.

La auditoría estática no encontró hexadecimales fuera de :root en las hojas propias y JSX, !important ni estilos inline. La revisión de DOM en las nueve vistas confirmó un h1, aria-current="page" en el NavLink activo, botones primarios de 16 px, caption/scope, title del iframe, alt del avatar y autocomplete="nickname". Inicio ya obtiene su h1 de Hero y NavLink agrega aria-current automáticamente: no fue necesario modificar componentes o CSS. Header.jsx, Footer.jsx y FormInscripcion.jsx ya no existían.

.idea y coverage no estaban versionados. Se verificaron las exclusiones de Git, se eliminó .idea y se conservó un respaldo local de sus seis archivos en node_modules/.cache/ep2-auditoria/idea-antes-limpieza.zip. coverage/ se regeneró para revisión local y permanece ignorado. La verificación final de lint, test, test:cov y build terminó con código 0 y sin advertencias; el HTML y JSON incluyen solo 48 archivos de aplicación.

## Entrega y Git

Una sola rama de funcionalidad, feature/ep2-react-completo, evita subramas artificiales sin trabajo independiente. No se hizo push, merge ni PR. Los commits locales y el ZIP permiten revisar el resultado antes de publicar. La revisión final del docente y la confirmación de integrantes corresponden al equipo.
