# Video Management & Processing Specification

## Purpose
Subir lecciones, convertirlas a HLS adaptativo de forma asíncrona y gestionar su ciclo de vida.

## Requirements

### Requirement: Subir lección
`POST /Video/Upload` (multipart: `title`, `description`, `file`, `courseId`) SHALL:
validar que el curso pertenece al instructor (404 si no), aceptar solo `.mp4 .webm .mov .avi .mkv`
(400 si no), limitar a 600 MB (`[RequestSizeLimit]`), guardar el original como
`storage/{courseId}/{videoId}/source.{ext}` (nombre generado, nunca el del cliente), registrar
`Uploading` con `CreatedAt = UTC now`, encolar y devolver el `Guid`. Si la escritura falla, SHALL
eliminar el registro y la carpeta.

#### Scenario: Path traversal
- **WHEN** el nombre de archivo es `../../evil.mp4`
- **THEN** el archivo se guarda como `source.mp4` dentro de la carpeta del video

#### Scenario: Progreso de subida
- **WHEN** el instructor sube un archivo desde el panel
- **THEN** ve el porcentaje enviado

### Requirement: Procesamiento
`VideoBackgroundService` SHALL: marcar `Processing`; obtener duración/alto/audio con ffprobe;
generar miniatura `thumb.jpg` (640 px, al 10 % del video, máx. 5 s); generar HLS adaptativo con
playlist maestra `playlist.m3u8` y variantes `v0/` (360p), `v1/` (720p), `v2/` (1080p) sin superar la
resolución de origen; borrar el original; publicar con `IObjectStorage`; guardar `StreamUrl`,
`ThumbnailUrl`, `DurationSeconds` y `Ready`. Ante error: `Failed` (se conserva el original).

#### Scenario: Reinicio de la API
- **WHEN** la API arranca con videos en `Uploading` o `Processing`
- **THEN** se re-encolan automáticamente

#### Scenario: Apagado durante FFmpeg
- **WHEN** la API se detiene mientras procesa
- **THEN** el video queda en `Processing` y se reprocesa al siguiente arranque

### Requirement: Reintentar
`POST /Video/Reprocess?videoId=` SHALL re-encolar una lección propia en `Failed` cuyo original exista;
otros estados → 409.

### Requirement: Listado del instructor
`GET /Video/List/{courseId}` (solo dueño) SHALL devolver `id`, `title`, `description`, `status`,
`streamUrl`, `thumbnailUrl`, `durationSeconds`, `createdAt`, ordenados por creación.

#### Scenario: Auto-refresco
- **WHEN** hay lecciones `Uploading`/`Processing`
- **THEN** el panel consulta cada 5 s hasta que no queden pendientes

#### Scenario: Estado accesible
- **WHEN** se muestra un estado
- **THEN** usa chip con icono + texto (Listo, Procesando, En cola, Error) y, si hay error, botón Reintentar

### Requirement: Eliminar
`DELETE /Video/Delete?courseId=&videoId=` (solo dueño) SHALL borrar el registro, su progreso
(cascada) y todos sus archivos (carpeta local o prefijo S3).

### Requirement: Medios públicos
La API SHALL servir `/storage` y `/images` (proveedor Local) con caché larga en segmentos e imágenes
y 60 s en `.m3u8`, y SHALL responder 404 a cualquier `source.*`.
