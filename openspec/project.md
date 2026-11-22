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
| Autenticación | JWT HS256 (2 h), validado con `JwtBearer` |
| Procesamiento | Cola en memoria (`Channel<Guid>`) + `BackgroundService` + FFmpeg → HLS (segmentos de 6 s) |
| Almacenamiento | Sistema de archivos (`/data/storage/{curso}/{video}` y `/data/images/{curso}`) servido como estáticos |
| Frontend admin | Angular 21 (standalone, signals), Tailwind 4, NgRx Store, hls.js, ngx-sonner |
| Frontend portal | Angular 21, Tailwind 4, hls.js |
| Despliegue | Docker Compose: `db`, `api`, `portal`, `admin` (nginx con proxy `/api`) |

## Estructura del repositorio
```
Backend/Core/                 API .NET (DomainCore, ApplicationCore, InfrastructureCore, WebApiCore)
Frontend/portal-admin/        Panel del instructor (Angular)
Frontend/portal-usuario/      Portal del estudiante (Angular)
openspec/                     Especificaciones (este directorio)
  product/prd.md              Documento de requisitos de producto
  product/user-stories.md     Historias de usuario con criterios de aceptación
  specs/<capacidad>/spec.md   Comportamiento vigente del sistema (fuente de verdad)
  changes/<id>/               Cambios propuestos o aplicados (proposal, tasks, design, deltas)
docker-compose.yml            Orquestación local / servidor
```

## Convenciones
- **Frontend**: capas `domain` (dtos/models) → `application/use-cases` → `infrastructure/repositories` → `presentation` (facades, pages, components). Las páginas solo hablan con *facades*.
- **Backend**: un caso de uso por clase (`Commands/` escritura, `Querys/` lectura), interfaz en `Interfaces/`, validación con FluentValidation, errores de dominio vía excepciones capturadas por `ExceptionMiddleware`.
- **UI**: sistema de diseño *Aurora Glass* (ver `specs/ui-design-system/spec.md`); iconos con `<app-icon>`; nada de colores sueltos fuera de los tokens.
- **Idioma**: interfaz y mensajes en español.
- **Estados de video**: `Uploading` → `Processing` → `Ready` | `Failed`.

## Flujo de trabajo OpenSpec
1. Crear `changes/<fecha>-<verbo-tema>/proposal.md` (por qué / qué / impacto) y `tasks.md`.
2. Escribir los *deltas* en `changes/<id>/specs/<capacidad>/spec.md` con `## ADDED | MODIFIED | REMOVED Requirements`.
3. Implementar marcando las tareas.
4. Al terminar, fusionar los deltas en `specs/` y mover el cambio a `changes/archive/`.
