# Despliegue EP3 con Render Free y Supabase

React se publica en Vercel. Render ejecuta `arena-web`, una aplicación Spring
Boot que reúne los módulos del backend bajo la misma API. PostgreSQL vive en
Supabase. El orden de despliegue sigue la sesión 3 del curso.

## 1. Obtener la conexión en Supabase

En el proyecto de Supabase, abrir **Connect → Session pooler** y copiar el host y
el usuario completos. Elegir regiones cercanas para Supabase y Render cuando sea
posible.

| Variable en Render | Valor |
| --- | --- |
| `DB_URL` | `jdbc:postgresql://HOST_DEL_POOLER:5432/postgres?sslmode=require` |
| `DB_USUARIO` | Usuario del pooler, normalmente `postgres.REFERENCIA_DEL_PROYECTO` |
| `DB_CLAVE` | Contraseña de PostgreSQL del proyecto |

El perfil de producción crea el esquema `arena_ep3` y sus tablas. Si se
reutiliza una base de un despliegue anterior con esquemas por módulo, migrar esos
datos antes de usarla para la entrega.

[Conexión a PostgreSQL en Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres)

## 2. Publicar el backend en Render

1. Ir a **New → Web Service** y conectar el repositorio
   [eSportsArenaManager](https://github.com/ITAustin92/eSportsArenaManager).
   Elegir la rama `main`, el runtime **Docker**, el plan **Free** y dejar
   **Root Directory** vacío. Render toma el `Dockerfile` desde la raíz.
2. En **Environment Variables**, agregar las tres variables de Supabase y las
   de la tabla siguiente. En **Health Check Path**, configurar `/actuator/health`.
3. Pulsar **Deploy Web Service**. Una vez en estado **Live**, abrir
   `https://TU-SERVICIO.onrender.com/actuator/health` y confirmar que devuelve
   `UP`. Abrir también `/docs/swagger-ui.html` para probar la API y
   `/api/v1/games` para verificar el catálogo.

| Variable | Valor |
| --- | --- |
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `JWT_SECRETO` | Secreto aleatorio propio de al menos 32 caracteres |
| `CORS_ORIGENES` | `https://esports-arena-managerv2.vercel.app` |
| `ADMIN_USERNAME` | Nombre de usuario del administrador inicial |
| `ADMIN_PASSWORD` | Contraseña inicial de al menos 12 caracteres |
| `ADMIN_CORREO` | Correo del administrador inicial |
| `ADMIN_NOMBRE` | Nombre que se mostrará. Es opcional |

Como alternativa, **New → Blueprint** lee `render.yaml` y prepara el mismo
servicio con plan Free. El Blueprint genera el secreto JWT y solicita los
valores privados. Usar uno de los dos caminos.

En una base nueva, iniciar sesión como administrador y crear un juego, una
cuenta organizadora y un torneo para la demostración. Después de comprobar
el acceso, quitar las variables de creación inicial `ADMIN_USERNAME`,
`ADMIN_PASSWORD`, `ADMIN_CORREO` y `ADMIN_NOMBRE` de Render.

[Plan Free de Render](https://render.com/docs/free)

## 3. Conectar el frontend en Vercel

1. Abrir el proyecto existente. Para publicar EP3 en el dominio principal,
   entrar en **Settings → Environments → Production → Branch Tracking** y
   seleccionar `develop`.
2. En **Settings → Environment Variables**, agregar
   `VITE_API_URL=https://TU-SERVICIO.onrender.com` al entorno **Production**.
   El código añade `/api/v1`.
3. Ir a **Deployments → Create Deployment** y seleccionar `develop` como
   referencia Git. Confirmar que esa rama aparece como origen del despliegue.
   Abrir el dominio principal y probar
   catálogo, registro, sesión tras recargar y permisos por rol.
4. Si se usa una vista previa, configurar la variable para **Preview** y
   agregar el origen exacto de esa vista a `CORS_ORIGENES` en Render,
   separado por coma del dominio principal.

[Configuración de la rama de producción](https://vercel.com/docs/git#customizing-the-production-branch) ·
[Variables de Vercel](https://vercel.com/docs/environment-variables)

## Verificación para la entrega

- Crear un dato de prueba, reiniciar el backend en Render y comprobar que se
  conserva en Supabase.
- Probar una inscripción y la actualización de la clasificación al registrar
  un resultado. Guardar evidencias con las URL públicas.
- Abrir el endpoint de salud antes de la defensa. Render Free suspende el
  servicio después de 15 minutos sin tráfico y el primer acceso puede tardar
  alrededor de un minuto.
