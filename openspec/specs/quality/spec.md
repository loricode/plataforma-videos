# Quality Specification

## Purpose
Garantizar que cada cambio conserve la seguridad y los flujos principales.

## Requirements

### Requirement: Pruebas de integración de la API
`Backend/Tests/WebApiCore.Tests` (xUnit + `WebApplicationFactory` + SQLite en memoria) SHALL cubrir:
autenticación y roles (401/403), propiedad de recursos con `userId` ajeno, registro y política de
contraseñas, mensaje genérico de login, rate limiting (429), extensiones no permitidas,
path traversal, no exposición de `source.*`, catálogo solo activos, lecciones públicas solo `Ready`,
limpieza de archivos al borrar lección/curso, reemplazo de portada, reintento solo en `Failed`,
estadísticas y progreso del estudiante.

#### Scenario: Ejecución local
- **WHEN** se ejecuta `dotnet test Backend/Tests/WebApiCore.Tests`
- **THEN** todas las pruebas pasan sin SQL Server ni FFmpeg

### Requirement: Pruebas E2E
`Frontend/e2e` (Playwright, Chromium) SHALL validar contra el stack Docker: login del instructor,
creación de curso con portada, subida de lección hasta `Listo` con miniatura, registro de un
estudiante, búsqueda, reproducción, progreso persistido tras recargar, y rechazo de estudiantes en
el panel.

### Requirement: Integración continua
`.github/workflows/ci.yml` SHALL ejecutar en cada push/PR: pruebas de la API, build de ambos portales,
`docker compose up` + E2E, y en `main` publicar las imágenes en GHCR.
