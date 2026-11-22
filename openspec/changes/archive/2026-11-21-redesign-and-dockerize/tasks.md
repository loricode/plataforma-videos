# Tasks

## 1. Backend
- [x] 1.1 Rutas de almacenamiento desde configuración y creación de directorios
- [x] 1.2 Límite de subida 600 MB (Kestrel + FormOptions)
- [x] 1.3 `DatabaseInitializer`: migraciones con reintentos + usuario semilla
- [x] 1.4 `[Authorize]` en `CourseController` y `VideoController`
- [x] 1.5 `CreatedAt` al subir; DTO `CreatedAt`; orden por fecha
- [x] 1.6 Estado `Processing` antes de FFmpeg
- [x] 1.7 Catálogo público solo cursos activos (sin texto = todos los activos)
- [x] 1.8 Lecciones públicas solo `Ready` de cursos activos
- [x] 1.9 `ImgUrl` en `CourseDto`
- [x] 1.10 `GET /health` y `DisableHttpsRedirection`

## 2. Sistema de diseño
- [x] 2.1 `styles.css` Aurora Glass (tokens, glass, botones 3D, chips, orbes, campos, gráficas, animaciones)
- [x] 2.2 `<app-icon>` con 30 iconos SVG animados
- [x] 2.3 Directiva `appTilt`
- [x] 2.4 Soporte `prefers-reduced-motion`

## 3. Panel admin
- [x] 3.1 Navbar píldora + búsqueda + menú usuario + logout
- [x] 3.2 Interceptor: 401 → login
- [x] 3.3 Login sin credenciales precargadas
- [x] 3.4 Dashboard (KPIs, curso destacado, actividad 7 días, estados, cursos recientes)
- [x] 3.5 Mis cursos: tarjetas, búsqueda `?q=`, filtros, modal portada con vista previa
- [x] 3.6 Formulario de curso con vista previa 3D en vivo; al crear navega a lecciones
- [x] 3.7 Lecciones: KPIs, chips de estado con icono, auto-refresco 5 s, reproductor modal
- [x] 3.8 Subida con progreso y drag & drop

## 4. Portal estudiante
- [x] 4.1 Navbar, hero 3D, catálogo inicial, búsqueda con debounce
- [x] 4.2 Reproductor con playlist, anterior/siguiente, avance automático, progreso local
- [x] 4.3 Login restilizado sin credenciales

## 5. Docker
- [x] 5.1 Dockerfile API (.NET 8 + FFmpeg + healthcheck)
- [x] 5.2 Dockerfile + nginx de cada SPA (config `docker`, proxy `/api`)
- [x] 5.3 `docker-compose.yml`, `.env.example`, `.gitignore`
- [x] 5.4 Verificar arranque y flujo extremo a extremo
