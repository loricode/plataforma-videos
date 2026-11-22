# Academia FASI — Plataforma de cursos en video

Panel para instructores, portal para estudiantes y API .NET que convierte cada video a streaming HLS adaptativo.

| Servicio | URL (Docker) | Descripción |
|---|---|---|
| Portal estudiante | http://localhost:8200 | Catálogo, cuentas, reproductor con progreso |
| Panel instructor | http://localhost:8300 | Dashboard, cursos, lecciones |
| API + Swagger | http://localhost:5000/swagger | .NET 8 |
| SQL Server | `localhost,14333` | usuario `sa` |

Instructor inicial: el definido en `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

## Arranque rápido (Docker)

```bash
cp .env.example .env            # ajusta claves y el instructor semilla
docker compose up -d --build
```

| Variante | Comando |
|---|---|
| Base (medios en disco) | `docker compose up -d --build` |
| Almacenamiento S3 (RustFS local en :9100) | `docker compose -f docker-compose.yml -f docker-compose.s3.yml up -d --build` |
| Producción con HTTPS (Caddy) | `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build` |

- La API migra la base de datos al iniciar, crea los roles y el instructor semilla.
- Detener: `docker compose down` · Borrar datos: `docker compose down -v`.

## Desarrollo local

```bash
# API (appsettings.Development.json + FFmpeg/ffprobe locales)
cd Backend/Core/WebApiCore && dotnet run

# Frontend (workspace único)
cd Frontend && npm install
npm run start:portal     # http://localhost:4200
npm run start:admin      # http://localhost:4201
```

## Pruebas

```bash
dotnet test Backend/Tests/WebApiCore.Tests      # integración (no requiere SQL Server ni FFmpeg)

cd Frontend
npm run e2e:install                             # una vez: navegador Chromium
npm run e2e                                     # E2E contra el stack Docker
```

CI: `.github/workflows/ci.yml` (pruebas de la API, build de los portales, E2E sobre Docker y publicación de imágenes en GHCR).

## Video tutorial

[docs/videos/tutorial-portal-usuario.mp4](docs/videos/tutorial-portal-usuario.mp4): uso del portal del estudiante, narrado
(~93 s, 1920×1080). Para regenerarlo ver [docs/video/LEEME.md](docs/video/LEEME.md).

## Documentación (OpenSpec)

```
openspec/
├── project.md                    contexto, stack y convenciones
├── product/prd.md                requisitos de producto
├── product/user-stories.md       historias de usuario (Gherkin)
├── specs/<capacidad>/spec.md     comportamiento vigente
└── changes/archive/              cambios aplicados (proposal, tasks, design)
```
