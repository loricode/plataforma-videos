# Videos tutoriales de Academia FASI

Tutoriales **horizontales (1920×1080)** grabados sobre la **aplicación real** con Playwright, con
**narración en español** (voz de Windows, sin conexión), subtítulos sincronizados y música de fondo
original sintetizada por código (`musica.js`, sin derechos de terceros). Quedan en `docs/videos/`.

| Video | Qué muestra | Duración | Archivo |
|---|---|---|---|
| Portal del estudiante | Portada, catálogo, buscador, crear cuenta, elegir curso, reproductor adaptativo, contenido del curso, progreso y cerrar sesión (11 pasos narrados) | ~93 s | `tutorial-portal-usuario.mp4` |

## Requisitos

- Stack Docker arriba (portal en `http://localhost:8200`, panel en `http://localhost:8300`).
- Microsoft Edge (o `NAVEGADOR=chrome`).
- Windows con una voz en español instalada (por defecto **Microsoft Helena Desktop**).
- `npm install` en esta carpeta (`playwright-core` + `ffmpeg-static`).

## Uso

```sh
node seed-demo.js              # crea 3 cursos demo con portada y lecciones (si no existen)
node seed-demo.js --limpiar    # además elimina cursos de prueba de las E2E
node tutorial-portal.js        # ../videos/tutorial-portal-usuario.mp4
```

| Variable | Por defecto | Uso |
|---|---|---|
| `PORTAL_URL` | `http://localhost:8200` | Portal a grabar |
| `ADMIN_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | `http://localhost:8300`, instructor semilla | Para `seed-demo.js` |
| `VOZ` | `Microsoft Helena Desktop` | Voz de Windows (`Get-InstalledVoices`) |
| `VELOCIDAD_VOZ` | `0` | -10 (lento) … 10 (rápido) |
| `NAVEGADOR` | `msedge` | `chrome` para Google Chrome |

## Cómo funciona

1. `narrar.ps1` genera un WAV por escena con `System.Speech` (todo local).
2. Cada escena del guion (`ESCENAS` en `tutorial-portal.js`) dura al menos lo que su locución.
3. La pantalla se captura con el *screencast* de Chromium (CDP) y se registra el instante de inicio de cada escena.
4. ffmpeg compone: fondo de marca + app con esquinas redondeadas + subtítulo de cada paso + tarjeta final,
   y mezcla las locuciones en su instante sobre la música (`calido`) a bajo volumen.

Para cambiar el texto o el orden, edita `ESCENAS` y las acciones de cada `escena(...)`.
Cada grabación registra una alumna nueva (`maria.<id>@ejemplo.com`) en la base de datos.
