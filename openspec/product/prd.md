# PRD — Plataforma de cursos en video "Academia FASI"

| Campo | Valor |
|---|---|
| Versión | 1.1 |
| Fecha | 2026-11-21 |
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
- Transcodificación multi-bitrate (ABR) y DRM.
- Aplicaciones móviles nativas.

## 4. Usuarios (personas)
- **Instructor (admin)** — crea cursos, sube lecciones, decide qué se publica. Se autentica.
- **Estudiante (visitante)** — busca y ve cursos publicados. Hoy no requiere cuenta.

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
| F-P5 | Progreso de lecciones vistas (local al navegador) | Could |

### 5.3 Plataforma
| ID | Funcionalidad | Prioridad |
|---|---|---|
| F-S1 | Conversión asíncrona a HLS con FFmpeg y estados `Uploading/Processing/Ready/Failed` | Must |
| F-S2 | Solo cursos activos y videos `Ready` son públicos | Must |
| F-S3 | Endpoints de gestión protegidos con JWT | Must |
| F-S4 | Migraciones automáticas y usuario instructor semilla al arrancar | Should |
| F-S5 | Despliegue con Docker Compose | Must |

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
| Cola en memoria se pierde al reiniciar | Videos quedan en `Uploading` | Re-encolar pendientes al iniciar / cola persistente |
| El `userId` llega desde el cliente | Un usuario autenticado podría operar sobre recursos ajenos si conoce el id | Tomar el `userId` del claim del JWT |
| Videos grandes saturan disco | Caída del servicio | Cuotas, limpieza del archivo original tras HLS, almacenamiento de objetos |
| Un solo bitrate | Mala experiencia en redes lentas | HLS multi-bitrate |

## 9. Hitos
1. **MVP** (hecho): CRUD, subida, HLS, portal con búsqueda.
2. **v1.1** (este cambio): rediseño Aurora Glass, dashboard, progreso de subida, auto-refresco, Docker.
3. **v1.2** (propuesto): seguridad por claims, cola persistente, limpieza de archivos, roles.
4. **v2**: cuentas de estudiante, progreso en servidor, ABR, CDN.
