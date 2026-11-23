# Preparación del despliegue EP3

La configuración de producción está preparada en el backend, pero todavía no se
ha ejecutado ni validado en una plataforma cloud. Para cerrar este paso se necesita
identificar la plataforma, la base de datos y las URLs de los servicios. Este
documento describe la configuración existente del proyecto, no promete costos ni
disponibilidad de un proveedor.

## Backend y base persistente

El perfil `prod` usa PostgreSQL. Cada uno de los doce servicios con persistencia
utiliza un esquema propio `arena_<servicio>` y un máximo de dos conexiones por
instancia. La base y el usuario deben permitir crear los esquemas y tablas
necesarios. Revisar el límite total de conexiones antes de iniciar todas las
instancias. El perfil `mysql` es otra configuración del proyecto y requiere su
propia validación; no se mezcla con las variables del perfil PostgreSQL.

1. Preparar una base PostgreSQL y el acceso de sus servicios. Configurar el canal
   seguro de conexión que requiera la plataforma.
2. Compilar con Java 21: `./mvnw.cmd package` desde el backend.
3. Publicar los doce servicios de identidad y dominio y el gateway. Eureka se
   utiliza en la demostración local; el perfil `prod` lo desactiva y usa las URLs
   configuradas.
4. Establecer `SPRING_PROFILES_ACTIVE=prod`, `DB_URL`, `DB_USUARIO`, `DB_CLAVE` y
   el mismo `JWT_SECRETO` en los servicios que correspondan. El secreto debe tener
   al menos 32 bytes para HS256. Usar variables privadas de la plataforma.
5. Completar las variables `*_SERVICE_URL` de `.env.example` del backend con las
   direcciones base, sin `/api/v1` añadido. Las conexiones internas tienen que ser
   accesibles entre los servicios.
6. Configurar `CORS_ORIGENES` del gateway con el origen exacto del frontend
   publicado, sin rutas ni barra final.
7. Crear el administrador inicial con las variables `ADMIN_USERNAME`,
   `ADMIN_PASSWORD`, `ADMIN_NOMBRE` y `ADMIN_CORREO` de auth. La contraseña de
   bootstrap requiere al menos 12 caracteres. Iniciar users antes de completar
   este alta y retirar la contraseña de bootstrap después de crear la cuenta.

El perfil `prod` desactiva las cuentas de demostración y `data.sql`; no se debe
esperar que aparezcan los datos ficticios del entorno local. Preparar los juegos,
cuentas y torneos del entorno de entrega desde las funciones autorizadas.

Si se reutiliza una base anterior, revisar las nuevas columnas de participantes
individuales y la tabla de contribuciones del ranking antes de migrar. Los campos
de equipos deben aceptar nulos cuando el participante es un jugador. La migración
con datos existentes y el perfil PostgreSQL todavía necesitan pruebas específicas.

## Frontend de Vercel

Configurar `VITE_API_URL` con la URL HTTPS del gateway, sin `/api` al final, y
generar un nuevo build. Las variables de Vite se incorporan al compilar. `vercel.json`
conserva las rutas de BrowserRouter cuando se abre un enlace directo o se recarga.

El trabajo del frontend se publica en `develop`. La instrucción de conservar las
otras ramas sigue vigente: no se modifica `main` para activar el despliegue de
producción. Con la configuración habitual del proyecto, será necesario seleccionar
una vista previa de `develop` o que el equipo decida después cómo publicar esa
revisión en producción.

Referencias oficiales para esta configuración:
[ramas de producción y vista previa](https://vercel.com/docs/git),
[variables por entorno](https://vercel.com/docs/environment-variables) y
[Vite en Vercel](https://vercel.com/docs/frameworks/frontend/vite).

## Comprobación final en el entorno público

- Verificar salud, Swagger y catálogo a través del gateway; no basta que los
  procesos respondan de forma individual.
- Crear una cuenta, iniciar sesión y recargar el perfil. Comprobar errores 401/403
  y que cada rol muestre solo sus opciones.
- Crear y editar datos, reiniciar el servicio y verificar que siguen guardados.
- Repetir inscripción, duplicados, cupos y el ciclo de partida, resultado,
  clasificación, corrección y anulación.
- Sustituir las referencias locales de los documentos por las URLs definitivas y
  obtener evidencia del despliegue. Las cuentas ficticias de las pruebas locales
  no deben usarse como prueba de que funciona la configuración de producción.
