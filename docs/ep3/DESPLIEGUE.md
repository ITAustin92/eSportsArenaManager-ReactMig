# Despliegue EP3 con Render y Supabase

La arquitectura acordada usa Vercel para React, Render para Spring Boot y
Supabase para PostgreSQL. El Blueprint del repositorio backend define un gateway
público y doce servicios privados en la misma región. Cada servicio con datos
utiliza su propio esquema `arena_<servicio>` y el perfil `prod`.

## Supabase

En el proyecto de Supabase, abrir **Connect → Session pooler**. Usar el host y el
usuario que muestra el panel. Para un proyecto nuevo, elegir una región cercana
a Render. Si el proyecto ya existe, revisar su región antes de aplicar el Blueprint.

| Variable | Valor en Render |
| --- | --- |
| `DB_URL` | `jdbc:postgresql://HOST_DEL_POOLER:5432/postgres?sslmode=require` |
| `DB_USUARIO` | Usuario completo del Session pooler, con el identificador de proyecto |
| `DB_CLAVE` | Contraseña de PostgreSQL |

Las tres variables se ingresan durante la creación del Blueprint para
`arena-ep3-user`. Render comparte sus valores con los otros servicios de datos.
El usuario de PostgreSQL necesita permiso para crear los esquemas y tablas.
El modo sesión permite conexiones IPv4 y usa el puerto 5432.
[Documentación de Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres)

## Render

1. Abrir **New → Blueprint** en Render y seleccionar el repositorio
   [eSportsArenaManager](https://github.com/ITAustin92/eSportsArenaManager).
   Seleccionar `main` y el archivo `render.yaml`.
2. Confirmar la región y revisar el costo estimado. El Blueprint separa las trece
   aplicaciones Spring Boot en instancias de pago. La sesión del profesor usa una
   sola aplicación Spring Boot como ejemplo.
3. Ingresar las variables de Supabase en el formulario seguro y aplicar el
   Blueprint una vez aprobado el costo. Render genera un secreto JWT compartido.
4. Tras activar `arena-ep3-user`, agregar a `arena-ep3-auth` las variables
   `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_NOMBRE` y `ADMIN_CORREO`.
   La contraseña inicial requiere al menos 12 caracteres. Verificar el acceso
   del administrador y retirar `ADMIN_PASSWORD` después de crearlo.
5. Copiar la URL HTTPS pública de `arena-ep3-gateway`. Probar
   `/actuator/health`, `/api/v1/games` y `/docs/swagger-ui.html`. Probar el
   catálogo además de la salud comprueba que el gateway enruta al servicio.

El perfil `prod` usa una base persistente, omite los datos de prueba y desactiva
Eureka. En una base nueva se crean esquemas y tablas. Preparar los juegos y
torneos de muestra mediante el panel de administración. Si se reutiliza una base
anterior, revisar primero la migración de datos y restricciones.
[Blueprints de Render](https://render.com/docs/blueprint-spec)

## Vercel

El gateway ya incluye `https://esports-arena-managerv2.vercel.app` en
`CORS_ORIGENES`. Si se prueba primero una vista previa, agregar también su origen
exacto, separado por coma. En el proyecto Vercel, configurar `VITE_API_URL` con la
URL HTTPS del gateway, sin el sufijo `/api`, porque el código ya agrega
`/api/v1`. Crear un nuevo despliegue de la revisión EP3 en `develop`. Si se
publica desde esa rama en el dominio principal, usar la configuración del
entorno de producción de Vercel.
[Variables de Vercel](https://vercel.com/docs/environment-variables)

## Verificación de entrega

- Consultar el catálogo desde Vercel y confirmar que la petición llega a Render.
- Iniciar sesión, recargar el perfil y verificar los permisos por rol.
- Crear un registro de prueba, reiniciar su servicio y comprobar que Supabase lo conserva.
- Probar la inscripción, registrar un resultado individual y consultar su clasificación.
- Guardar capturas de Network, login y persistencia con las URLs definitivas.
