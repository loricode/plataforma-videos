# Tasks

## 1. Seguridad
- [x] 1.1 Roles Instructor/Student (Identity + claims en JWT)
- [x] 1.2 `User.GetUserId()` y eliminación del `userId` del cliente en todos los endpoints
- [x] 1.3 Propiedad del curso en Upload, List, Delete y Reprocess
- [x] 1.4 `CreateUser` restringido a instructores; `Register` público para estudiantes
- [x] 1.5 Nombres de archivo seguros (`source.ext`, `cover-<fecha>.ext`) y extensiones permitidas
- [x] 1.6 Bloquear descarga de `source.*`
- [x] 1.7 Mensaje de login genérico + lockout de 5 intentos
- [x] 1.8 Asignar Instructor a usuarios previos sin rol

## 2. Procesamiento
- [x] 2.1 Re-encolar pendientes al iniciar
- [x] 2.2 `POST /Video/Reprocess`
- [x] 2.3 ffprobe (duración, alto, audio)
- [x] 2.4 HLS adaptativo con playlist maestra
- [x] 2.5 Miniatura
- [x] 2.6 Borrar original tras HLS; limpieza al eliminar lección/curso

## 3. API
- [x] 3.1 `GET /Course/Stats`
- [x] 3.2 `ProgressController` + tabla `VideoProgress`
- [x] 3.3 Migración `RolesProgressThumbnails`

## 4. Almacenamiento
- [x] 4.1 `IObjectStorage` + `LocalObjectStorage` + `S3ObjectStorage`
- [x] 4.2 `docker-compose.s3.yml` con MinIO

## 5. Producción
- [x] 5.1 Data Protection en volumen
- [x] 5.2 `[RequestSizeLimit]`/`[RequestFormLimits]` por endpoint
- [x] 5.3 Rate limiting (login/registro) + ForwardedHeaders
- [x] 5.4 CORS por configuración
- [x] 5.5 Cabeceras de seguridad nginx; errores 500 sin detalles
- [x] 5.6 `docker-compose.prod.yml` + `deploy/Caddyfile`

## 6. Frontend
- [x] 6.1 Workspace Angular + librería `@shared`; quitar Font Awesome y componentes sin uso
- [x] 6.2 Panel: sin `userId`, dashboard con `/Course/Stats`, miniaturas, duración, reintentar, login solo instructores
- [x] 6.3 Portal: registro, login, sesión, navbar con usuario, progreso en servidor con reanudación, miniaturas, indicador de calidad
- [x] 6.4 Ocultar el botón nativo de contraseña de Edge

## 7. Calidad
- [x] 7.1 Pruebas de integración (22)
- [x] 7.2 E2E Playwright
- [x] 7.3 GitHub Actions
- [x] 7.4 `.gitignore` completo
