# Change: Rediseño "Aurora Glass", dashboard y despliegue Docker

## Why
- La interfaz era blanca/gris plana, sin jerarquía ni identidad.
- El dashboard del panel estaba vacío ("home works!").
- El portal solo mostraba cursos tras escribir ≥ 2 letras y exponía cursos en borrador y videos sin procesar.
- No se podía desplegar fuera de la máquina del desarrollador: rutas `C:\...` fijas, sin contenedores.
- Subidas > 30 MB fallaban por el límite por defecto de Kestrel.
- Los formularios de login traían credenciales reales precargadas.

## What Changes
- **UI** (ambos portales): sistema de diseño oscuro glassmorphism, aurora violeta/cian/rosa (sin amarillo), toques 3D (tilt, botones con canto, orbes, composiciones flotantes) e iconos SVG animados propios.
- **Panel**: barra superior tipo píldora con buscador y menú de usuario/logout, dashboard con KPIs y gráfica de 7 días, tarjetas de cursos con portada, vista previa en vivo, subida con progreso y drag & drop, auto-refresco de estados, reproductor en modal.
- **Portal**: hero 3D, catálogo inicial, búsqueda con debounce, reproductor con playlist, avance automático y progreso local.
- **API**: `[Authorize]` en `Course`/`Video`; `CreatedAt` asignado; DTO `CreatedAt` (antes `CreateAt`); estado `Processing`; catálogo solo activos; lecciones públicas solo `Ready`; `ImgUrl` en `CourseDto`; límites de subida 600 MB; rutas por configuración; migraciones automáticas + usuario semilla; `/health`.
- **Docker**: Dockerfile API (con FFmpeg), Dockerfiles nginx para cada SPA, `docker-compose.yml`, `.env.example`.
- **BREAKING**: endpoints de gestión ahora requieren JWT; `VideoDto.CreateAt` → `createdAt`.

## Impact
- Specs: `ui-design-system` (nueva), `deployment` (nueva), `auth`, `course-management`, `video-management`, `student-portal`.
- Código: `Backend/Core/**`, `Frontend/portal-admin/src/**`, `Frontend/portal-usuario/src/**`, archivos Docker.
