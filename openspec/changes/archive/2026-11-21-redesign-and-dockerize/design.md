# Design

## Un nginx por SPA con proxy `/api`
Cada frontend llama a rutas relativas `/api/...`. Evita CORS, sirve HLS e imágenes por el mismo
origen y permite que la misma imagen funcione en cualquier host/puerto. Alternativa descartada:
un gateway único con sub-rutas (`/admin/`), que obliga a cambiar `baseHref` y rutas del panel.

## Sistema de diseño duplicado en ambas apps
`styles.css`, `icon.component.ts`, `tilt.directive.ts` y `date.util.ts` se copian idénticos. Es lo
más simple con dos proyectos Angular independientes. Siguiente paso: workspace Angular con una
librería `ui` compartida.

## Iconos SVG propios en vez de Font Awesome
Permiten animar el trazo (`pathLength=100` + `stroke-dashoffset`) y micro-animaciones por icono sin
dependencias. Font Awesome sigue instalado pero las vistas rediseñadas ya no lo usan.

## Dashboard calculado en el cliente
Se combinan `Course/List` + `Video/List/{id}` por curso con `forkJoin`. Suficiente para decenas de
cursos; para más, crear `GET /Course/Stats`.

## Gráfica de actividad
Una sola serie → sin leyenda; barra pico resaltada y tooltip por barra; `aria-label` con todos los
valores. Los estados siempre llevan icono + texto.

## Fechas
El API guarda `DateTime.UtcNow` y lo serializa sin `Z`; `parseApiDate` lo interpreta como UTC y
descarta `0001-01-01` (videos antiguos sin fecha).
