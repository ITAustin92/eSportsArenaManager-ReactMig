# eSports Arena Manager — React

Migración de las seis vistas HTML/CSS/JS a componentes funcionales de React.

## Ejecutar

Desde esta carpeta:

```sh
npm ci
npm run dev
```

Verificación:

```sh
npm test
npm run lint
npm run build
npm run preview
```

`npm test` ejecuta las pruebas de regresión de `tests/migracion.test.js` con el ejecutor integrado de Node, sin instalar dependencias adicionales. Los ejemplos originales de Jasmine en `src/logica/*.spec.js` se conservan como referencia; no forman parte de ese comando.

## Vistas

- `#inicio`: hero, aviso de inscripción, cuatro torneos destacados y video.
- `#torneos`: catálogo de cinco torneos; filtros combinados por nombre, juego, estado y fecha de cierre.
- `#detalle?id=copa-latam-valorant`: información, posiciones, participantes, partidas y premios del torneo elegido.
- `#inscripcion`: selector de torneo, validación de modalidad, equipo y correo; bloqueo por estado y cupos.
- `#equipos`: crear equipos con nombre único, capitán integrante y exactamente tres o cinco jugadores según el juego.
- `#perfil`: estadísticas, equipos, historial, sanciones, edición del apodo y vista previa del avatar.

Los enlaces admiten recarga, nuevas pestañas y Atrás/Adelante. Un identificador de detalle desconocido muestra el catálogo. El enlace de inscripción del detalle conserva el torneo seleccionado. El selector de inscripción usa los mismos identificadores del catálogo.

## Estado y alcance

Es una demostración de frontend con los datos simulados del proyecto original. No existe backend, autenticación real, envío de correos ni registro en una base de datos. Los mensajes de confirmación mantienen el texto original y representan una simulación.

Los equipos creados aparecen en el selector de inscripción y en el perfil. Equipos, apodo y avatar se mantienen al navegar durante la sesión de la aplicación; se restablecen al recargar. Los formularios se reinician al salir de su vista o cambiar de torneo. La inscripción no modifica los cupos ni el historial, igual que la simulación original.

Los equipos de ejemplo habilitado, incompleto y sancionado se conservan para probar las validaciones. Los equipos nuevos solo pueden inscribirse en su juego. Los premios se muestran únicamente cuando el torneo está finalizado.

## Diseño y organización

- `public/css/styles.css` y las cinco imágenes de `public/img/` son copias exactas del ZIP original.
- `index.html` carga la hoja original. Los estilos de la plantilla React (`App.css`, `index.css`, `utilidades.css`) se conservan, pero no se importan.
- Se mantienen las clases, los identificadores y los estilos en línea originales. Las clases de página antes situadas en `body` se aplican al `main` del layout.
- `src/components/` contiene el JSX declarativo, formularios controlados, listas y mensajes condicionales.
- `src/logica/` contiene los datos y validaciones independientes de la interfaz.
- `App.jsx` comparte equipos y perfil y sincroniza la navegación con el hash mediante hooks.
- La selección del nodo raíz en `main.jsx` es únicamente el montaje estándar de React. Los componentes no usan `innerHTML`, selectores DOM ni creación manual de nodos.

Se corrigieron dos limitaciones del flujo original: las fechas ahora filtran realmente el catálogo (límites inclusivos), y los detalles admiten enlaces directos y recarga sin consumir un permiso temporal en `sessionStorage`.

Las fuentes de Google y el video de YouTube requieren conexión a Internet.
