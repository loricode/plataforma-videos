# Change: Endurecimiento de la plataforma v1.2

## Why
Las 10 mejoras recomendadas tras la v1.1:
1. La API recibía `userId` del cliente y no validaba la propiedad del curso al subir video.
2. La cola de procesamiento vivía solo en memoria.
3. No se borraban archivos al eliminar lecciones y se conservaba el original tras el HLS.
4. Una sola calidad de video y sin miniaturas.
5. El dashboard hacía una llamada por curso.
6. Sin cuentas de estudiante: el progreso solo vivía en el navegador.
7. Sistema de diseño duplicado en ambos portales; Font Awesome sin uso.
8. Medios atados al disco del contenedor.
9. Faltaban HTTPS, llaves persistentes, límites por endpoint, rate limiting y CORS restringido.
10. Sin pruebas automáticas ni CI.

## What Changes
- **Seguridad**: roles `Instructor`/`Student` en el JWT; `[Authorize(Roles = Instructor)]` en Course/Video; `userId` siempre del claim (**BREAKING**: se ignora el del cliente); propiedad validada en subir/listar/borrar/reintentar; `CreateUser` solo para instructores; nombres de archivo saneados (fin del *path traversal*); el original `source.*` nunca se sirve; validación de extensiones en servidor; mensajes de login genéricos y bloqueo tras 5 intentos.
- **Cola persistente**: la BD es la fuente de verdad; al iniciar se re-encolan `Uploading`/`Processing`; `POST /Video/Reprocess` para lecciones con error.
- **Limpieza**: borrar lección/curso elimina sus carpetas (o prefijos S3); el original se borra al quedar `Ready`.
- **Video**: HLS adaptativo 360p/720p/1080p según la fuente con playlist maestra; miniatura JPG; duración (ffprobe).
- **Estadísticas**: `GET /Course/Stats` (totales, por estado, 7 días, cursos recientes).
- **Estudiantes**: `POST /User/Register`; `GET /Progress/Course/{id}`, `PUT /Progress`; portal con registro, login, sesión y progreso sincronizado (reanuda posición).
- **Frontend**: workspace Angular único (`Frontend/angular.json`, proyectos `portal` y `admin`) con librería `@shared` (UI, utilidades, estilos); sin Font Awesome ni NgRx en el portal.
- **Almacenamiento**: `IObjectStorage` con proveedores `Local` y `S3` (MinIO/AWS/R2) + `docker-compose.s3.yml`.
- **Producción**: `docker-compose.prod.yml` con Caddy (HTTPS automático), llaves Data Protection en volumen, `[RequestSizeLimit]` por endpoint, rate limiting de login/registro, CORS por configuración, cabeceras de seguridad en nginx, errores 500 sin detalles.
- **Calidad**: 22 pruebas de integración (xUnit + SQLite), E2E con Playwright, GitHub Actions (tests, builds, E2E sobre Docker, publicación en GHCR).

## Impact
- Specs: `auth`, `course-management`, `video-management`, `student-portal`, `ui-design-system`, `deployment`, `quality` (nueva).
- Migración EF `RolesProgressThumbnails` (columnas `ThumbnailUrl`, `DurationSeconds`; tabla `VideoProgress`; índice por `Status`).
- Usuarios existentes sin rol reciben `Instructor` automáticamente al iniciar.
