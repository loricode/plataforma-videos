# UI Design System Specification — "Aurora Glass"

## Purpose
Dar a ambos portales una identidad visual oscura, colorida y con profundidad, inspirada en
dashboards glassmorphism, sin el resplandor amarillo de fondo de la referencia.

## Requirements

### Requirement: Tokens
Los estilos SHALL vivir en la librería compartida `Frontend/shared/styles/aurora.css`, importada por
el `src/styles.css` de cada app (`@import "tailwindcss"; @import "../../shared/styles/aurora.css";
@source "../../shared";`). Contenido:
- Fondo `#07070d` + aurora animada de 4 manchas difusas: violeta `#7c3aed`, cian `#06b6d4`,
  magenta `#db2777`, esmeralda `#10b981`. **No se usan amarillos/ámbar en el fondo.**
- Acentos: lima `#b7f34a`, cian `#3fe0f0`, violeta `#a78bfa`, rosa `#f472b6`.
- Texto: `ink-50` (principal), `ink-300/400` (secundario), `ink-500` (atenuado).
- Tipografía Outfit (fallback system-ui).

#### Scenario: Color de texto
- **WHEN** se muestra un valor o etiqueta
- **THEN** usa tokens de texto; los colores de acento solo marcan identidad o estado junto a un icono/texto

### Requirement: Componentes base
Clases utilitarias SHALL existir y reutilizarse: `.glass`, `.glass-inset`, `.glass-hover`,
`.btn` + (`.btn-3d`, `.btn-3d-violet`, `.btn-3d-danger`, `.btn-ghost`), `.icon-btn`, `.chip-*`,
`.orb-*` (esferas 3D con gradiente radial), `.field`, `.dropzone`, `.switch`, `.progress`,
`.pill-bar` (barras de gráfica tipo píldora), `.tip` (tooltip), `.shimmer` (skeleton).

### Requirement: Toques 3D
- `appTilt` SHALL inclinar tarjetas siguiendo el cursor (perspectiva 900px, máx. configurable) con brillo que sigue al puntero; `.pop`/`.pop-sm` elevan elementos en Z.
- Botones `.btn-3d` SHALL tener "canto" inferior que se hunde al presionar.
- Composiciones flotantes `.float-3d` en login, hero y estados vacíos.
- Modales SHALL entrar con rotación X y escala.

#### Scenario: Movimiento reducido
- **WHEN** el sistema tiene `prefers-reduced-motion: reduce`
- **THEN** se desactivan animaciones y la inclinación

### Requirement: Librería @shared
El workspace `Frontend/` SHALL exponer `@shared/ui/icon.component`, `@shared/ui/tilt.directive`,
`@shared/utils/date.util` y `@shared/utils/media.util` a ambos portales (alias en `tsconfig.json`).
No se usa Font Awesome. Los inputs SHALL ocultar el botón nativo de contraseña de Edge (`::-ms-reveal`).

### Requirement: Iconos SVG animados
`<app-icon name size stroke anim>` SHALL renderizar SVG propios (30 iconos) cuyo trazo se dibuja al
aparecer (`stroke-dashoffset`) y que ejecutan una micro-animación (bounce, wiggle, spin, pulse,
slide) al pasar el mouse sobre el contenedor `.ai-host`. `spinner` gira en bucle; `anim` admite
`ai-loop-pulse` y `ai-loop-float`.

### Requirement: Layout del panel
El panel SHALL usar barra superior tipo píldora (logo, buscador expandible, pestañas Dashboard/Cursos,
avatar con menú) en lugar de sidebar, con contenido máx. 1400 px.

### Requirement: Accesibilidad
Botones solo-icono SHALL tener `aria-label`; foco visible violeta; gráficas con `aria-label` que
resume los datos.
