# Evidencias visuales

Las imágenes fueron generadas por recorridos Playwright del proyecto local, no son maquetas. Se captura un viewport de 900 px de alto; los contenidos inferiores se consultan desplazando la página.

## Archivos incluidos

Para cada ancho 360, 768 y 1280 px:

- inicio-ANCHO.png: hero y próximo cierre, visitante.
- catalogo-ANCHO.png: filtros y tarjetas, visitante.
- detalle-ANCHO.png: torneo público, visitante.
- login-ANCHO.png: acceso.
- perfil-ANCHO.png: jugador Felipe.
- equipos-ANCHO.png: gestión de equipo.
- inscripcion-ANCHO.png: formulario y resumen.
- administracion-ANCHO.png: CRUD administrativo.
- equipos-registrados-ANCHO.png: consulta del administrador.

validacion-equipo-incompleto.png muestra el envío bloqueado.

## Reproducir

Instalar Chromium de Playwright con npx playwright install chromium y ejecutar npm run test:e2e. Se puede usar un Chrome existente mediante CHROME_BIN.

La ejecución revisa un único h1 y que scrollWidth de la página no supere el viewport; las tablas conservan desplazamiento horizontal interno. El video de YouTube se bloquea durante las pruebas para no depender de un servicio externo.

## Para la presentación

Se incluyen 31 capturas: 27 de las nueve vistas en tres anchos, una del bloqueo por equipo incompleto y tres de página completa (inicio-restaurado-1280.png, perfil-restaurado-1280.png y detalle-restaurado-1280.png). Se regeneraron con los doce recorridos Playwright aprobados sobre la versión actual usando Edge mediante CHROME_BIN. Si el docente pide evidencia adicional, tomar también el estado 403, la confirmación de inscripción y el error de fechas. La salida auténtica de Karma está en ../salida-pruebas.txt y los porcentajes por archivo en ../COBERTURA_TESTING.md; el reporte visual de cobertura se regenera en coverage/html/index.html. Una captura de terminal debe mostrar el comando y el total, sin ocultar errores.

Los nombres y cuentas son ficticios. No añadir información personal real a las capturas.
