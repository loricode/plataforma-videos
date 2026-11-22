# Student Portal Specification

## Purpose
Permitir a cualquier visitante descubrir y ver cursos, y a los estudiantes registrados conservar
su progreso en todos sus dispositivos.

## Requirements

### Requirement: Catálogo público
`GET /Course/Search?parameter=` SHALL devolver hasta 20 cursos **activos** ordenados por título; sin
texto, todos los activos; con texto, cada palabra debe coincidir en título o descripción.

#### Scenario: Entrada al portal
- **WHEN** el visitante abre `/`
- **THEN** ve el hero, el buscador (debounce 400 ms) y la grilla de cursos

### Requirement: Cuentas de estudiante
El portal SHALL ofrecer `/auth` (ingresar) y `/auth/register` (crear cuenta) con los requisitos de
contraseña visibles (icono + texto). Tras ingresar SHALL volver a la página de origen (`?redirect=`).
La barra superior SHALL mostrar "Ingresar / Crear cuenta" o el avatar con menú y "Cerrar sesión".

### Requirement: Página de curso
`GET /Video/ListByCourseId?parameter=` SHALL devolver `titleCourse`, `descriptionCourse` e `items`
(`id`, `title`, `description`, `streamUrl`, `thumbnailUrl`, `durationSeconds`) solo de videos
`Ready` de cursos activos.

#### Scenario: Reproducción adaptativa
- **WHEN** se reproduce una lección
- **THEN** hls.js selecciona la calidad según el ancho de banda (limitada al tamaño del reproductor) y la UI muestra la calidad activa (p. ej. "720p")

#### Scenario: Continuar donde quedé
- **WHEN** el estudiante abre un curso
- **THEN** se selecciona la primera lección no completada y se reanuda en la posición guardada

#### Scenario: Avance automático
- **WHEN** termina una lección
- **THEN** se marca completada y comienza la siguiente

### Requirement: Progreso
- Con sesión: `GET /Progress/Course/{courseId}` y `PUT /Progress { videoId, positionSeconds, completed }`.
  Se guarda cada 10 s de reproducción, al pausar, al cambiar de lección y al salir. ≥ 90 % visto = completada;
  una lección completada no vuelve a pendiente. Solo se acepta progreso de lecciones públicas (404 si no).
- Sin sesión: `localStorage` (`progress:{courseId}`, migra el formato anterior `watched:{courseId}`) y
  aviso para crear cuenta.
