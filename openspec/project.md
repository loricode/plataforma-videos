# Project Context — SolutionVideos (Academia FASI)

## Propósito
Plataforma de cursos en video. Un **instructor** crea cursos y sube lecciones desde el
**panel administrativo**; la plataforma convierte cada video a streaming **HLS** y lo publica
en el **portal de estudiantes**, donde cualquiera puede buscar cursos y verlos.

## Stack
| Capa | Tecnología |
|---|---|
| API | .NET 8, ASP.NET Core Web API, Clean Architecture (Domain / Application / Infrastructure / WebApi) |
| Persistencia | SQL Server 2022, EF Core 8 (migraciones), ASP.NET Identity (usuarios) |
| Autenticación | JWT HS256 (2 h) con roles `Instructor`/`Student`; rate limiting y lockout |
| Procesamiento | `BackgroundService` + FFmpeg/ffprobe → HLS adaptativo 360/720/1080p + miniatura; cola recuperable desde la BD |
| Almacenamiento | `IObjectStorage`: Local (`/data/storage`, `/data/images`) o S3 compatible (AWS/R2/RustFS) + CDN |
| Frontend | Workspace Angular 21 (`Frontend/`): apps `admin` y `portal` + librería `@shared`; Tailwind 4, hls.js, ngx-sonner (admin) |
| Pruebas | xUnit + WebApplicationFactory + SQLite (API), Playwright (E2E), GitHub Actions |
| Despliegue | Docker Compose (`db`, `api`, `portal`, `admin`) + overrides `s3` (almacenamiento de objetos) y `prod` (Caddy HTTPS) |

## Estructura del repositorio
```
Backend/Core/                 API .NET (DomainCore, ApplicationCore, InfrastructureCore, WebApiCore)
Backend/Tests/                Pruebas de integración (xUnit)
Frontend/                     Workspace Angular (angular.json, package.json únicos)
  portal-admin/               App "admin": panel del instructor
  portal-usuario/             App "portal": portal del estudiante
  shared/                     Librería común @shared (UI, utilidades, estilos Aurora Glass)
  e2e/                        Pruebas Playwright
deploy/Caddyfile              Proxy HTTPS de producción
.github/workflows/ci.yml      Integración continua
openspec/                     Especificaciones (este directorio)
  product/prd.md              Documento de requisitos de producto
  product/user-stories.md     Historias de usuario con criterios de aceptación
  specs/<capacidad>/spec.md   Comportamiento vigente del sistema (fuente de verdad)
  changes/<id>/               Cambios propuestos o aplicados (proposal, tasks, design, deltas)
docker-compose*.yml           Orquestación (base, s3, prod)
```

## Convenciones
- **Frontend**: código reutilizable en `Frontend/shared` (alias `@shared/*`); en cada app, capas `domain` (dtos/models) → `application/use-cases` → `infrastructure/repositories` → `presentation` (facades, pages, components). Las páginas solo hablan con *facades*.
- **Backend**: un caso de uso por clase (`Commands/` escritura, `Querys/` lectura), interfaz en `Interfaces/`, validación con FluentValidation, errores de dominio vía excepciones capturadas por `ExceptionMiddleware`.
- **UI**: sistema de diseño *Aurora Glass* (ver `specs/ui-design-system/spec.md`); iconos con `<app-icon>`; nada de colores sueltos fuera de los tokens.
- **Idioma**: interfaz y mensajes en español.
- **Estados de video**: `Uploading` → `Processing` → `Ready` | `Failed` (reintentable).
- **Seguridad**: el usuario siempre sale del JWT; recursos ajenos responden 404.

## Flujo de trabajo OpenSpec
1. Crear `changes/<fecha>-<verbo-tema>/proposal.md` (por qué / qué / impacto) y `tasks.md`.
2. Escribir los *deltas* en `changes/<id>/specs/<capacidad>/spec.md` con `## ADDED | MODIFIED | REMOVED Requirements`.
3. Implementar marcando las tareas.
4. Al terminar, fusionar los deltas en `specs/` y mover el cambio a `changes/archive/`.
