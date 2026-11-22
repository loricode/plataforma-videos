# Course Management Specification

## Purpose
Permitir al instructor crear, editar, publicar y eliminar cursos con su portada.

## Requirements

### Requirement: Crear curso
`POST /Course/Create` (multipart: `title`, `description`, `state`, `file`; el dueño sale del JWT) SHALL
crear el curso, guardar la portada como `images/{courseId}/cover-{fecha}.{ext}` (solo JPG/PNG/WEBP/GIF,
máx. 12 MB en servidor y 10 MB en el panel) y devolver el `Guid` del curso.
El título SHALL ser obligatorio (2–200 caracteres) y la descripción ≤ 1000.

#### Scenario: Creación desde el panel
- **WHEN** el instructor completa el formulario con portada válida y guarda
- **THEN** se crea el curso y el panel navega a `admin/courses/{id}` (lecciones)

#### Scenario: Portada inválida
- **WHEN** el archivo no es JPG/PNG/WEBP/GIF o supera 10 MB
- **THEN** el panel muestra el error y no envía la solicitud

### Requirement: Listar cursos del instructor
`GET /Course/List` SHALL devolver los cursos del instructor autenticado (la ruta antigua `List/{userId}` ignora el parámetro) con `id`, `title`, `description`, `state` e `imgUrl`.

#### Scenario: Tarjetas con portada
- **WHEN** el instructor abre "Mis cursos"
- **THEN** ve tarjetas con portada, estado (Publicado/Borrador) y acciones Lecciones/Editar/Portada/Eliminar

#### Scenario: Búsqueda y filtro locales
- **WHEN** escribe en el buscador o elige Todos/Publicados/Borradores
- **THEN** la lista se filtra sin recargar; el parámetro `?q=` precarga la búsqueda

### Requirement: Editar y publicar
`PUT /Course/Update` SHALL actualizar título, descripción y estado solo si el curso pertenece al instructor autenticado (404 si no).

#### Scenario: Despublicar
- **WHEN** el estado pasa a `false`
- **THEN** el curso deja de aparecer en el portal público

### Requirement: Cambiar portada
`PUT /Course/UpdateImage` SHALL reemplazar las portadas previas (local o S3); el nombre con fecha evita la caché del navegador/CDN.

#### Scenario: Vista previa
- **WHEN** el instructor selecciona una imagen
- **THEN** ve la vista previa antes de confirmar

### Requirement: Eliminar curso
`DELETE /Course/Delete` SHALL eliminar el curso, sus videos (cascada) y sus carpetas de archivos.

#### Scenario: Confirmación
- **WHEN** el instructor pulsa eliminar
- **THEN** se muestra un modal de confirmación antes de llamar a la API

### Requirement: Dashboard
`GET /Course/Stats` SHALL devolver en una sola llamada: `courses`, `active`, `inactive`, `totalVideos`,
`ready`, `processing`, `failed`, `last7Days[{date,count}]` (UTC) y `recentCourses` (3, con
`videoCount`, `readyCount`, `lastActivity`). El panel SHALL mostrar en `/admin`: % de videos listos con desglose (listos/proceso/error),
totales (cursos, activos, videos), curso más reciente, videos subidos por día en los últimos 7 días,
conteo por estado y los 3 cursos con actividad más reciente.

#### Scenario: Gráfica de actividad
- **WHEN** el instructor pasa el mouse sobre una barra
- **THEN** ve la cantidad de videos de ese día; por defecto se resalta el día con más subidas
