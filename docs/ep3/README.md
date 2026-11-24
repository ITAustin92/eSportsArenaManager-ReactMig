# Entrega EP3

Esta carpeta corresponde a la integración React y Spring Boot verificada el 23 de
noviembre de 2026. La evidencia de EP2 se conserva aparte en `../ep2/`.

## Documentos

- [ERS actualizada](entregables/ERS_eSports_Arena_Manager_EP3.docx).
- [Manual de usuario con capturas](entregables/Manual_Usuario_EP3.docx).
- [Documentación de APIs e integración](entregables/Documentacion_APIs_Integracion_EP3.docx).
- [Planilla de APIs](entregables/Documentacion_APIs_EP3.xlsx): 138 operaciones.
- [Guía para la presentación y defensa](GUIA_PRESENTACION.md): reparto entre tres
  integrantes, demostración del código y preguntas frecuentes.
- [Preparación del despliegue](DESPLIEGUE.md).

## Evidencia

Se aprobaron 84 pruebas Karma/Jasmine, 153 pruebas Maven/JUnit y 14 recorridos
Playwright con los 14 servicios locales reales. Los recorridos incluyen un ciclo
individual con resultado, reenvíos simultáneos, corrección, perfil y anulación.
Estos conteos no representan cobertura global ni garantizan una calificación.

Los archivos `openapi/*.json` se obtuvieron de los doce servicios en ejecución.
La planilla conserva la estructura del Anexo 3 y contrasta los permisos con las
configuraciones de seguridad y los controladores. Las respuestas de la planilla
son las declaradas en Swagger; los errores comunes se explican en su cabecera.

Las capturas de `capturas/` son imágenes reales de la demostración local con datos
ficticios. Los documentos utilizan fragmentos legibles de esas pantallas. Para
renovarlas ejecutar `npm run test:evidencia` con el backend de demostración encendido.
Las pruebas habituales no reemplazan los archivos de esta carpeta.

## Estado del despliegue

Los documentos distinguen la verificación local de producción. Quedan pendientes
la elección o acceso a la infraestructura del backend, la base persistente y la
validación de la nueva conexión desde Vercel. La URL ya existente del frontend
no demuestra que la versión EP3 esté publicada y conectada.

Los ZIP finales se generan por separado desde las revisiones publicadas de cada
repositorio; no incluyen dependencias instaladas, secretos, bases locales ni reportes
regenerables.
