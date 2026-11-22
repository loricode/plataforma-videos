# Deployment Specification

## Purpose
Ejecutar la plataforma de forma reproducible en desarrollo y producción.

## Requirements

### Requirement: Servicios base (`docker-compose.yml`)
| Servicio | Imagen / build | Puerto host | Función |
|---|---|---|---|
| `db` | `mssql/server:2022` | `${DB_PORT:-14333}` | SQL Server (volumen `sqldata`) |
| `api` | `Backend/Core/Dockerfile` | `${API_PORT:-5000}` | .NET 8 + FFmpeg/ffprobe (volumen `media` en `/data`) |
| `portal` | `Frontend/portal-usuario/Dockerfile` (contexto `Frontend/`) | `${PORTAL_PORT:-8200}` | nginx + SPA estudiante |
| `admin` | `Frontend/portal-admin/Dockerfile` (contexto `Frontend/`) | `${ADMIN_PORT:-8300}` | nginx + SPA instructor |

#### Scenario: Arranque
- **WHEN** se ejecuta `docker compose up -d --build` con `.env`
- **THEN** los servicios quedan saludables y `GET :5000/health` responde `{"status":"ok"}`

### Requirement: Configuración de la API por entorno
`ConnectionStrings__DefaultConnection`, `Jwt__Key`, `FFmpeg__PathOrigen`, `FFmpeg__PathProbe` (opcional),
`FFmpeg__PathVideos`, `Storage__BasePath`, `ObjectStorage__*`, `Seed__Admin*`, `DataProtection__KeysPath`,
`RateLimit__AuthPermitPerMinute`, `Cors__AllowedOrigins__N`, `Swagger__Enabled`,
`DisableHttpsRedirection`, `Database__AutoMigrate`. Ninguna ruta ni secreto fijo en código.

### Requirement: Migraciones y semillas
La API SHALL migrar al iniciar (20 reintentos × 5 s), crear roles, asignar `Instructor` a usuarios sin
rol y crear el instructor semilla.

### Requirement: Proxy de frontends (nginx)
Fallback SPA; `^~ /api/` → `http://api:8080/` sin prefijo, `client_max_body_size 600m`,
`proxy_request_buffering off`, timeouts 900 s; cabeceras `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy`, `Permissions-Policy`; `server_tokens off`.

### Requirement: Almacenamiento de objetos (`docker-compose.s3.yml`)
Con `ObjectStorage:Provider=S3` la API SHALL subir HLS, miniaturas y portadas al bucket
(`ServiceUrl`, `Bucket`, credenciales) y guardar URLs absolutas con `PublicBaseUrl` (CDN). Con
`EnsureBucket=true` crea el bucket con lectura pública. El override incluye MinIO (API 9000, consola 9001).

### Requirement: Producción (`docker-compose.prod.yml`)
Caddy SHALL terminar TLS automáticamente para `PORTAL_DOMAIN` y `ADMIN_DOMAIN` (HSTS, compresión) y
ser el único servicio expuesto; Swagger deshabilitado. Las llaves Data Protection SHALL persistir en
`/data/keys`. La API confía en `X-Forwarded-For/Proto` para la IP real (rate limiting).

### Requirement: Secretos
`.env` y certificados fuera del control de versiones (`.gitignore`); `.env.example` documenta todo.
