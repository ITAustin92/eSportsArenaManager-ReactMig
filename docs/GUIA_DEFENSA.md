# Guía de defensa — EP2

## Demostración sugerida (8–10 minutos)

1. Mostrar Inicio y el catálogo como visitante. Combinar filtros y producir un rango de fechas invertido.
2. Abrir un detalle mediante URL, recargar y cambiar la ronda a Final. Explicar “Participante por definir”, caption y scope de la tabla.
3. Entrar a /equipos sin sesión: aparece login. Usar felipe@arena.example / Jugador123! y comprobar retorno al destino.
4. Ir a /inscripcion?torneo=copa-latam-valorant. Elegir Equipo Incompleto: envío deshabilitado. Elegir Arena Demo: confirmar; volver e intentar duplicar.
5. Mostrar la inscripción en Perfil, editar contacto y cancelarla. Explicar devolución del cupo. Cambiar el apodo y recargar.
6. Crear un equipo agregando los cinco titulares y clave de prueba; editarlo/eliminarlo si no está inscrito.
7. Cerrar sesión. Entrar con admin@arena.example / Admin123!. Crear un juego individual y un torneo futuro. Demostrar validación de inicio/cierre y bloqueo al eliminar el juego referenciado.
8. Abrir Equipos registrados, buscar un equipo y mostrar integrantes, sanciones, torneos y resultados.
9. Escribir /perfil como admin y /admin como jugador: demostrar 403, no solo un menú oculto.
10. Ejecutar las pruebas y abrir el informe de cobertura. Mostrar las capturas a los tres anchos.

Sofía (sofia@arena.example / Jugador123!) ilustra una sanción activa. Todas estas cuentas son públicas y ficticias.

## Explicar un componente

Abrir FormularioInscripcion. Recibe torneo, juego, equipos, jugador, jugadores, inscripciones y onEnviar por props. Su estado contiene el borrador, errores y confirmación. escribir cambia el estado con [name]: value y React vuelve a renderizar. El equipo seleccionado y los bloqueos se calculan desde props y borrador.

Al enviar se llama validarInscripcion otra vez con el tiempo actual. Solo sin errores se invoca onEnviar. El padre entrega una función que llama crearInscripcion. El servicio publica una copia nueva y App se actualiza mediante useDatos.

No se altera el arreglo de props, ni se usa useEffect para calcular permisos/cupos. El efecto de useDatos sincroniza con el almacenamiento/servicio y elimina la suscripción al desmontar.

## Estado levantado

App posee la instantánea compartida; un cambio hecho en Inscripción se refleja en Perfil y Detalle sin mantener tres copias independientes. En Gestión de equipos, el padre mantiene qué equipo se edita y FormEquipo avisa con onGuardar; ListaIntegrantes solo recibe integrantes y onQuitar.

Los borradores pertenecen a sus formularios, el selector de ronda al detalle y la expansión del menú a Navegacion. No todo el estado necesita estar en App.

## Defender el espía obligatorio

Abrir FormularioInscripcion.spec.js:

- beforeEach crea datos nuevos, un div y una raíz React.
- jasmine.createSpy('onEnviar') representa el callback del padre.
- escribir despacha eventos reales de input/change dentro de act.
- Se selecciona Equipo Incompleto.
- Se comprueba disabled y que el espía NO haya sido llamado, incluso al intentar submit.
- El siguiente caso usa Arena Demo y verifica el objeto completo recibido por el espía.
- afterEach desmonta con act y elimina el div.

La prueba demuestra comportamiento observable y contrato de props, no una implementación interna.

## Ejecutar y leer pruebas

```sh
npm ci
npm run lint
npm run build
npm test
npm run test:cov
```

Abrir coverage/html/index.html. “Líneas” indica qué líneas instrumentadas se ejecutaron; “ramas” indica alternativas de condicionales. Un porcentaje alto no prueba ausencia de errores. Los tests/helpers se excluyen y el arranque main.jsx no se instrumenta. Los recorridos de Playwright se reportan por separado, no se suman artificialmente a Jasmine.

Si Chrome no se encuentra, establecer CHROME_BIN con la ruta real. Las opciones especiales del contenedor están documentadas, pero no son necesarias en un equipo habitual con Chrome.

## Bootstrap a tres anchos

Mostrar src/main.jsx: Bootstrap primero, luego index.css y utilidades. Mostrar col-12 col-md-6 col-lg-4 del catálogo: una columna móvil, dos en tablet y tres en escritorio. Mostrar navbar-expand-md, estado expandida y aria-expanded. Las tablas usan table-responsive; no ensanchan toda la página.

Comparar docs/capturas/catalogo-360.png, catalogo-768.png y catalogo-1280.png. La grilla viene de Bootstrap; los colores, tarjetas y botones vienen de las variables propias.

## Camino de la regla de roles

1. sesion.js valida las credenciales ficticias.
2. AuthProvider conserva únicamente la sesión sin clave.
3. menuPorRol determina enlaces visibles.
4. puedeAcceder determina permisos por URL.
5. RutaProtegida redirige visitante o muestra 403.
6. El servicio CRUD exige el rol y la propiedad pertinentes.

Aclaración indispensable: en un frontend estático esta doble comprobación mejora la experiencia, no impide manipular el navegador. En EP3 el backend debe validar JWT, permisos y reglas de negocio.

## Historial y publicación

```sh
git branch --show-current
git log --oneline -5
git status --short
git diff main...feature/ep2-react-completo --stat
```

La rama de entrega es feature/ep2-react-completo, creada desde develop. Los commits están en español. Antes del PR revisar diferencias respecto de main: pueden incluir avances anteriores de develop. No se debe fusionar a ciegas.

Cuando el equipo haya revisado la entrega:

```sh
git push -u origin feature/ep2-react-completo
```

Crear después el PR hacia main. El agente no hizo ese push ni publicó un PR.

## Preguntas frecuentes

- ¿Por qué cambia una pantalla al guardar en otra? Ambas reciben la misma instantánea actualizada de useDatos.
- ¿Por qué copiar antes de sort? sort modifica el arreglo; ordenarRanking trabaja con [...ranking].
- ¿Por qué no usar índice como key? Un id estable mantiene la identidad al agregar/eliminar/reordenar.
- ¿Qué ocurre con un cupo lleno? validarInscripcion lo bloquea y el servicio vuelve a validar al escribir.
- ¿Qué ocurre con un equipo sancionado? No se puede inscribir; el perfil/admin muestra el motivo y fechas.
- ¿Por qué algunos marcadores no reconstruyen el ranking histórico? Son fixtures parciales de EP1; está declarado en DECISIONES.md.
- ¿Qué falta para producción? API, autorización servidor, transacciones multiusuario, base de datos, almacenamiento seguro y revisión de seguridad.
