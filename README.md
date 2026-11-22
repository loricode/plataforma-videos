# Academia FASI — Plataforma de cursos en video

Panel para instructores + portal para estudiantes + API .NET con conversión automática a streaming HLS.

| Servicio | URL (Docker) | Descripción |
|---|---|---|
| Portal estudiante | http://localhost:8200 | Catálogo, búsqueda y reproductor |
| Panel instructor | http://localhost:8300 | Dashboard, cursos, lecciones |
| API + Swagger | http://localhost:5000/swagger | .NET 8 |
| SQL Server | `localhost,14333` | usuario `sa` |

## Arranque rápido (Docker)

```bash
cp .env.example .env        # ajusta claves y el usuario instructor semilla
docker compose up -d --build
```

- La API aplica las migraciones sola y crea el instructor definido en `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- Videos e imágenes se guardan en el volumen `media`; la base de datos en `sqldata`.
- Detener: `docker compose down` · Borrar datos: `docker compose down -v`.

## Desarrollo local (sin Docker)

```bash
# API (usa appsettings.Development.json y FFmpeg local)
cd Backend/Core/WebApiCore && dotnet run

# Panel / Portal
cd Frontend/portal-admin   && npm install && npm start
cd Frontend/portal-usuario && npm install && npm start
```

## Documentación (OpenSpec)

```
openspec/
├── project.md                       contexto, stack y convenciones
├── product/prd.md                   requisitos de producto
├── product/user-stories.md          historias de usuario (Gherkin)
├── specs/<capacidad>/spec.md        comportamiento vigente
└── changes/                         propuestas y cambios archivados
```
