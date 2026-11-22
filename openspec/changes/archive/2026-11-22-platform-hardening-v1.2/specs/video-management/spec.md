## ADDED Requirements

### Requirement: Recuperación de la cola
Al iniciar, el servicio SHALL re-encolar los videos en `Uploading` o `Processing`.

#### Scenario: Reinicio durante el procesamiento
- **WHEN** la API se reinicia con un video en `Processing`
- **THEN** el video se procesa de nuevo y termina en `Ready` o `Failed`

### Requirement: Limpieza de archivos
Eliminar una lección SHALL borrar `storage/{courseId}/{videoId}/`; al quedar `Ready` SHALL borrarse
el archivo original subido.

#### Scenario: Eliminar lección
- **WHEN** el instructor elimina una lección
- **THEN** su carpeta de HLS deja de existir en el volumen `media`
