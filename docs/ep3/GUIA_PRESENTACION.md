# Presentación y defensa EP3

Duración sugerida: 13 minutos de exposición y demostración, dejando margen hasta los
15 minutos indicados en la pauta. Los tres integrantes deben poder explicar el flujo
completo. Los nombres se pueden intercambiar sin cambiar el reparto.

| Sección | Responsable | Tiempo | Qué mostrar |
| --- | --- | --- | --- |
| Contexto y cambio desde EP2 | Integrante 1 | 1 min | Una diapositiva con problema, usuarios y alcance |
| Arquitectura y base de datos | Integrante 1 | 3 min | React, gateway, servicios y almacenamiento |
| API y comunicación REST | Integrante 2 | 2 min | Swagger y una operación CRUD |
| Demostración y flujo de ejecución | Integrante 2 | 2 min | Evento, fetch, controlador, servicio y repositorio |
| Autenticación y sesión | Integrante 3 | 2 min | Login, JWT, recarga y renovación |
| Roles, pruebas y cierre | Integrante 3 | 3 min | 403, pruebas y límites del despliegue |

## Guion por secciones

### Contexto y cambio desde EP2

“Nuestro proyecto organiza torneos de eSports, equipos e inscripciones. En EP2
migramos la interfaz a React con datos simulados. En EP3 conectamos esa interfaz
con nuestro backend Spring Boot: ahora las operaciones se validan y se guardan en
el servidor, y la cuenta determina qué puede hacer cada persona.”

### Arquitectura y base de datos

“React se comunica con una sola entrada, el gateway. Este dirige cada solicitud al
servicio correspondiente. Cada servicio separa el controlador, la lógica de negocio
y el repositorio que accede a la base de datos. Auth mantiene credenciales y roles;
los servicios de dominio gestionan jugadores, equipos, torneos y competición.
En local usamos H2 para demostrar y probar. La configuración para una base
persistente debe validarse en el entorno final.”

Mostrar relaciones lógicas: juego → torneo → inscripción → partida → resultado →
clasificación. Explicar que los IDs que cruzan servicios se comprueban por REST;
no son claves foráneas entre bases distintas.

### API y comunicación REST

“Las rutas están versionadas y Swagger describe los campos y respuestas. Usamos
GET para consultar, POST para crear, PUT para editar y DELETE para dar de baja o
anular. El frontend centraliza las llamadas y presenta mensajes cuando el servidor
rechaza datos o no está disponible. El servidor vuelve a comprobar las reglas,
aunque alguien intente saltarse el formulario.”

Demostrar un juego creado y editado. Aclarar que desactivar conserva el registro y
las referencias históricas. No afirmar que todas las operaciones tienen idénticos
códigos: consultar el contrato de la ruta mostrada.

### Demostración y flujo de ejecución

Usar una inscripción individual o de equipo ya preparada. Mostrar estos archivos:

1. `src/components/jugador/Inscripcion.jsx`: el evento valida y llama al servicio.
2. `src/servicios/inscripciones.js`: arma la operación de inscripción.
3. `src/servicios/api.js`: serializa JSON, agrega Bearer y ejecuta fetch.
4. `RegistrationController`: recibe la solicitud y comprueba al titular.
5. `RegistrationServiceImpl`: valida cupos, plazo, modalidad y sanciones.
6. `RegistrationRepository`: guarda mediante JPA dentro de una transacción.
7. Respuesta JSON: React muestra el aviso y vuelve a consultar los datos.

“El estado de React controla qué se ve; la base de datos conserva la información.
Una validación de la interfaz ayuda al usuario, pero la regla definitiva está en
el backend.”

### Autenticación y sesión

“El login comprueba usuario y contraseña en el backend. La contraseña se almacena
con BCrypt. Si corresponde, se entrega un JWT firmado con identidad, roles y
vencimiento. El navegador guarda el token para sobrevivir a una recarga y lo envía
en cada petición protegida. El servidor comprueba su firma. Antes del vencimiento,
el frontend intenta renovarlo; si vence o deja de ser válido, vuelve a pedir login.”

Mostrar `AuthProvider.jsx`, `sesion.js` y una configuración `SecurityConfig`.
No mostrar secretos ni el token completo en una diapositiva. Aclarar que leer el
payload en el navegador no valida su firma, y que localStorage es accesible a JavaScript.

### Roles pruebas y cierre

“El jugador gestiona su actividad; el organizador consulta torneos e inscripciones;
el administrador mantiene el sistema. El menú y las rutas cambian según el rol,
y la API también rechaza las acciones no autorizadas. Probamos tanto la interfaz
como solicitudes directas. También verificamos duplicados, cupos simultáneos y
resultados individuales: corregir o anular un resultado actualiza los puntos sin
duplicarlos.”

Mostrar los resultados actuales: 84 pruebas frontend, 153 backend y 14 recorridos
de integración local. La cantidad de pruebas no es un porcentaje de cobertura ni
una garantía de nota. Distinguir el despliegue ya existente del frontend de la
validación pendiente del backend y la base persistente en producción.

## Preguntas que deberían poder responder los tres

| Pregunta | Respuesta breve |
| --- | --- |
| ¿Props y estado? | Props son datos recibidos; estado es información que cambia y provoca un nuevo render. |
| ¿Para qué useEffect? | Sincroniza el componente con operaciones externas; el hook de carga descarta respuestas que ya no corresponden. |
| ¿Qué guarda localStorage? | Solo el JWT, nunca la contraseña. Los datos operativos están en el backend. |
| ¿Autenticación y autorización? | Una comprueba quién eres; la otra, qué acciones te permiten tus roles y titularidad. |
| ¿401 y 403? | 401 señala una sesión ausente o no válida; 403, falta de permiso. |
| ¿Por qué no basta ocultar botones? | La persona puede llamar a la API directamente; el servidor debe comprobar la firma y los permisos. |
| ¿Cómo se evitan duplicados? | Reglas del servicio y restricciones de datos; el cupo se comprueba dentro de la transacción. |
| ¿Qué cambia en 1v1? | Se utilizan IDs de jugadores en inscripción, partida, resultado y ranking; los IDs de equipos se mantienen separados. |
| ¿Se duplican puntos al corregir? | Se reemplaza el aporte de la misma partida y se retira el anterior. |
| ¿Qué no se debe exagerar? | Producción, persistencia cloud, cobertura global, disponibilidad o pruebas que no se hayan ejecutado. |

## Preparación antes de presentar

Iniciar el entorno con antelación. Tener preparadas las cuentas de cada rol y un torneo
de demostración; comprobar Swagger y la respuesta del catálogo del gateway. Dejar
abiertos el navegador, el editor y los reportes. Cada integrante debe hacer una
práctica del recorrido completo antes de dividir la exposición.
