# Design

## Identidad en el servidor
El `userId` se obtiene de `ClaimTypes.NameIdentifier`. Los formularios aún pueden enviar `userId`
(compatibilidad), pero el binding lo ignora. Los recursos ajenos responden **404** (no 403) para no
revelar su existencia.

## Cola: BD como fuente de verdad
El `Channel<Guid>` solo dispara trabajo. Al arrancar, `VideoBackgroundService` consulta los videos en
`Uploading`/`Processing` y los re-encola. Un apagado durante FFmpeg deja el estado en `Processing`
(no `Failed`), por lo que se reprocesa en el siguiente arranque. Para varias instancias de la API
se necesitaría una cola distribuida (ver PRD, riesgos).

## HLS adaptativo
Una sola ejecución de FFmpeg con `split` + `var_stream_map` genera `v0/`, `v1/`, `v2/` y
`playlist.m3u8` maestra (el nombre no cambia, así que las URLs existentes siguen válidas).
Escalera: 360p 800k · 720p 2.8M · 1080p 5M; nunca por encima de la resolución de origen.
GOP fijo de 48 y `sc_threshold 0` para segmentos alineados entre calidades.

## Almacenamiento de objetos
FFmpeg siempre trabaja en disco local; luego `IObjectStorage.PublishDirectoryAsync` sube el
resultado. `Local` = no-op (la API sirve `/storage`); `S3` = sube y borra la copia local. Las URLs
guardadas son relativas (Local) o absolutas a `PublicBaseUrl`/CDN (S3); los frontends usan
`mediaUrl()` para resolver ambos casos.

## Workspace Angular
Se eligió un workspace con dos aplicaciones y código compartido por alias `@shared/*` (sin librería
compilada) por simplicidad: los cambios en `shared/` se reflejan en ambos portales sin publicar
paquetes. Tailwind escanea `shared/` mediante `@source`.

## Pruebas de integración con SQLite
`WebApplicationFactory<Program>` + SQLite en memoria (`Database:EnsureCreated`). Las migraciones son
de SQL Server, por eso no se aplican en pruebas; el E2E sobre Docker cubre la BD real.
