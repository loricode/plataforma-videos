# PRD — Plataforma de cursos en video "Academia FASI"

| Campo | Valor |
|---|---|
| Versión | 1.2 |
| Fecha | 2026-11-22 |
| Estado | En desarrollo (MVP funcional) |
| Componentes | API .NET · Panel admin · Portal estudiante |

## 1. Problema
Los instructores necesitan publicar cursos en video sin depender de plataformas de terceros
(YouTube, Vimeo) que no les dan control sobre el contenido, la marca ni la experiencia.
Los estudiantes necesitan un lugar simple y atractivo para encontrar cursos y verlos con
buena calidad en cualquier dispositivo.

## 2. Objetivos
| # | Objetivo | Métrica de éxito |
|---|---|---|
| O1 | Que un instructor publique un curso con su primera lección en menos de 5 minutos | Tiempo desde login hasta primera lección `Ready` |
| O2 | Reproducción fluida en navegador y móvil | 100 % de videos `Ready` reproducibles vía HLS; < 2 s hasta primer frame en red local |
| O3 | Descubrimiento de contenido | El estudiante encuentra un curso por palabra clave en ≤ 2 interacciones |
| O4 | Despliegue reproducible | Todo el sistema arranca con `docker compose up` en una máquina limpia |

## 3. No objetivos (por ahora)
- Pagos, suscripciones o marketplace.
- Certificados, evaluaciones o foros.
- DRM y subtítulos.
- Aplicaciones móviles nativas.

## 4. Usuarios (personas)
- **Instructor (admin)** — crea cursos, sube lecciones, decide qué se publica. Se autentica.
- **Estudiante** — busca y ve cursos publicados sin cuenta; con cuenta (gratuita) conserva su progreso en el servidor.

## 5. Alcance funcional

### 5.1 Panel administrativo
| ID | Funcionalidad | Prioridad |
|---|---|---|
| F-A1 | Inicio de sesión con correo y contraseña (JWT) y cierre de sesión | Must |
| F-A2 | Dashboard: % de videos listos, cursos, activos, actividad 7 días, estado de procesamiento, cursos recientes | Should |
| F-A3 | CRUD de cursos (título, descripción, estado publicado/borrador, portada) | Must |
| F-A4 | Cambiar portada con vista previa | Should |
| F-A5 | Subir lección (título, descripción, video ≤ 500 MB) con barra de progreso y arrastrar-soltar | Must |
| F-A6 | Ver estado de cada lección y auto-refresco mientras procesa | Must |
| F-A7 | Previsualizar lección en reproductor HLS | Should |
| F-A8 | Eliminar lección / curso con confirmación | Must |

### 5.2 Portal del estudiante
| ID | Funcionalidad | Prioridad |
|---|---|---|
| F-P1 | Catálogo de cursos publicados visible al entrar | Must |
| F-P2 | Búsqueda por palabras (título/descripción) con debounce | Must |
| F-P3 | Página de curso con reproductor HLS y lista de lecciones | Must |
| F-P4 | Avance automático a la siguiente lección y navegación anterior/siguiente | Should |
| F-P5 | Progreso de lecciones (servidor con cuenta, local sin cuenta) y reanudación | Should |
| F-P6 | Registro e inicio de sesión de estudiantes | Should |
| F-P7 | Reproducción adaptativa (360p/720p/1080p), miniaturas y duración | Should |

### 5.3 Plataforma
| ID | Funcionalidad | Prioridad |
|---|---|---|
| F-S1 | Conversión asíncrona a HLS con FFmpeg y estados `Uploading/Processing/Ready/Failed` | Must |
| F-S2 | Solo cursos activos y videos `Ready` son públicos | Must |
| F-S3 | Endpoints de gestión protegidos con JWT | Must |
| F-S4 | Migraciones automáticas y usuario instructor semilla al arrancar | Should |
| F-S5 | Despliegue con Docker Compose | Must |
| F-S6 | Roles Instructor/Student y propiedad de recursos desde el JWT | Must |
| F-S7 | Cola de procesamiento recuperable y reintento manual | Must |
| F-S8 | Almacenamiento de objetos S3 compatible + CDN | Should |
| F-S9 | HTTPS automático (Caddy), rate limiting, límites por endpoint, CORS restringido | Must |
| F-S10 | Pruebas de integración, E2E y CI | Should |

## 6. Requisitos no funcionales
- **Seguridad**: JWT obligatorio en endpoints de gestión; secretos por variables de entorno; sin credenciales en el código.
- **Rendimiento**: subida en streaming (sin buffer en nginx), límite 600 MB por solicitud.
- **Accesibilidad**: foco visible, `aria-label` en botones de icono, estados con icono + texto (nunca solo color), respeto a `prefers-reduced-motion`.
- **Diseño**: tema oscuro *Aurora Glass* con glassmorphism, acentos lima/cian/violeta/rosa, toques 3D e iconos SVG animados.
- **Compatibilidad**: navegadores modernos (Chrome, Edge, Firefox, Safari con HLS nativo).

## 7. Dependencias y supuestos
- FFmpeg disponible en el contenedor de la API.
- Almacenamiento local (volumen Docker `media`). Para producción multi-nodo se requiere almacenamiento de objetos.
- La cola de procesamiento es en memoria: un reinicio pierde trabajos pendientes (ver riesgos).

## 8. Riesgos
| Riesgo | Impacto | Mitigación |
|---|---|---|
| Una sola instancia de la API procesa la cola | Escalado horizontal limitado | La BD ya es la fuente de verdad; siguiente paso: cola distribuida (RabbitMQ/Azure Queue) y workers separados |
| FFmpeg consume CPU en la misma máquina que la API | Latencia de la API durante el procesamiento | Mover el worker a un contenedor propio |
| Disco local en modo Local | Saturación | Modo S3 + CDN; el original se elimina tras generar HLS |
| JWT en localStorage | Robo de token ante XSS | CSP estricta / cookies HttpOnly + refresh tokens |

## 9. Hitos
1. **MVP** (hecho): CRUD, subida, HLS, portal con búsqueda.
2. **v1.1** (hecho): rediseño Aurora Glass, dashboard, progreso de subida, auto-refresco, Docker.
3. **v1.2** (hecho): roles y propiedad por JWT, cola recuperable, limpieza, HLS adaptativo + miniaturas, estadísticas, cuentas de estudiante, workspace con librería compartida, S3/CDN, endurecimiento de producción, pruebas y CI.
4. **v2**: worker de procesamiento separado, refresh tokens, subtítulos, certificados, analítica de visualización.
