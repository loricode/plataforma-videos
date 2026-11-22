// Video tutorial (1920×1080) del PORTAL DEL ESTUDIANTE, grabado sobre la aplicación real,
// con narración en español (voz de Windows, offline), subtítulos y música de fondo original.
//
// Uso:  node tutorial-portal.js        → ../videos/tutorial-portal-usuario.mp4
// Requisitos: stack Docker arriba (portal en http://localhost:8200) con contenido (node seed-demo.js),
//             Microsoft Edge, Windows con voz en español (Microsoft Helena), `npm install` aquí.
// Variables: PORTAL_URL, VOZ ("Microsoft Helena Desktop"), VELOCIDAD_VOZ (-10..10), NAVEGADOR (msedge|chrome)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright-core');
const FFMPEG = require('ffmpeg-static');

const PORTAL = process.env.PORTAL_URL || 'http://localhost:8200';
const VOZ = process.env.VOZ || 'Microsoft Helena Desktop';
const VELOCIDAD = process.env.VELOCIDAD_VOZ || '0';
const VW = 1280, VH = 720, DSF = 1.5;              // ventana grabada
const OW = 1920, OH = 1080;                         // video final
const FRAME = { x: 200, y: 118, w: 1520, h: 855 };  // marco de la app (16:9)
const CAP_Y = 988;                                  // subtítulos bajo el marco
const END_CARD = 5;
const TMP = path.join(__dirname, 'tmp');
const OUT = path.join(__dirname, '..', 'videos', 'tutorial-portal-usuario.mp4');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const stamp = Date.now().toString(36).slice(-5);
const ALUMNA = { name: 'María Gómez', email: `maria.${stamp}@ejemplo.com`, password: 'Aprender2026!' };
const CURSO = 'Inglés técnico para principiantes';

// ───────────── Guion: una escena = una locución ─────────────
const ESCENAS = [
  { id: 's01', text: 'Bienvenido a Academia FASI. En este video aprenderás a usar el portal de estudiantes, paso a paso.' },
  { id: 's02', text: 'Al entrar verás los cursos disponibles. Cada tarjeta muestra la portada, el título y una breve descripción.' },
  { id: 's03', text: 'Para encontrar un tema, escribe en el buscador. Los resultados aparecen automáticamente mientras escribes.' },
  { id: 's04', text: 'Puedes ver los cursos sin cuenta, pero si te registras tu progreso se guarda en todos tus dispositivos. Haz clic en Crear cuenta.' },
  { id: 's05', text: 'Escribe tu nombre, tu correo y una contraseña segura. Cada requisito se marca en verde cuando lo cumples.' },
  { id: 's06', text: 'Listo. Ya iniciaste sesión, y tu nombre aparece en la parte superior.' },
  { id: 's07', text: 'Ahora elige un curso para comenzar.' },
  { id: 's08', text: 'Esta es la página del curso. El video se adapta a la velocidad de tu conexión, y la calidad actual se muestra en la esquina.' },
  { id: 's09', text: 'A la derecha está el contenido del curso. Puedes saltar a cualquier lección, o usar los botones Anterior y Siguiente.' },
  { id: 's10', text: 'Al terminar una lección, se marca como completada y la barra de progreso avanza. Si cierras el navegador, la próxima vez continuarás donde lo dejaste.' },
  { id: 's11', text: 'Cuando termines, abre tu perfil y elige Cerrar sesión.' },
  { id: 'fin', text: 'Academia FASI. Aprende a tu ritmo.' },
];

// ───────────── Gráficos (renderizados con el navegador) ─────────────
const C = { bg: '#07070d', violet: '#7c3aed', cyan: '#06b6d4', pink: '#db2777', lime: '#b7f34a' };
const FONT = `<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>*{margin:0;box-sizing:border-box}body{width:${OW}px;height:${OH}px;font-family:Outfit,'Segoe UI',sans-serif;overflow:hidden;color:#fff;background:transparent}</style>`;

const LOGO = (s) => `<div style="width:${s}px;height:${s}px;border-radius:50%;display:grid;place-items:center;
  background:radial-gradient(circle at 35% 30%,#e9e1ff,#a78bfa 55%,#6d28d9);box-shadow:inset 0 -6px 10px rgba(0,0,0,.25),inset 0 4px 8px rgba(255,255,255,.55),0 14px 30px -8px rgba(167,139,250,.8)">
  <svg width="${s * 0.5}" height="${s * 0.5}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" fill="none" stroke="#0b0b12" stroke-width="1.8"/><path d="M10 8.5v7l5.5-3.5z" fill="#0b0b12"/></svg></div>`;

const AURORA = `
  <div style="position:absolute;width:900px;height:900px;border-radius:50%;background:${C.violet};opacity:.45;filter:blur(140px);left:-300px;top:-380px"></div>
  <div style="position:absolute;width:800px;height:800px;border-radius:50%;background:${C.cyan};opacity:.3;filter:blur(140px);right:-300px;bottom:-400px"></div>
  <div style="position:absolute;width:520px;height:520px;border-radius:50%;background:${C.pink};opacity:.22;filter:blur(120px);left:55%;top:30%"></div>`;

const BG_HTML = `<!doctype html><html><head>${FONT}</head><body style="background:${C.bg}">
<div style="position:relative;width:100%;height:100%;overflow:hidden;background:${C.bg}">
  ${AURORA}
  <div style="position:absolute;top:30px;left:${FRAME.x}px;right:${OW - FRAME.x - FRAME.w}px;display:flex;align-items:center;gap:18px">
    ${LOGO(56)}
    <div style="font-weight:700;font-size:34px;letter-spacing:-.5px">Academia <span style="color:#a78bfa">FASI</span></div>
    <div style="margin-left:auto;font-weight:500;font-size:22px;padding:10px 22px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15)">Tutorial · Portal del estudiante</div>
  </div>
  <div style="position:absolute;left:${FRAME.x - 8}px;top:${FRAME.y - 8}px;width:${FRAME.w + 16}px;height:${FRAME.h + 16}px;border-radius:30px;
    background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.18);box-shadow:0 50px 100px -30px rgba(124,58,237,.7)"></div>
</div></body></html>`;

const MASK_HTML = `<!doctype html><html><head><style>*{margin:0}body{width:${FRAME.w}px;height:${FRAME.h}px;background:#000}</style></head>
<body><div style="width:100%;height:100%;border-radius:24px;background:#fff"></div></body></html>`;

const CAPTION_HTML = (text, n, total) => `<!doctype html><html><head>${FONT}</head><body>
<div style="position:absolute;left:0;right:0;top:${CAP_Y}px;display:flex;justify-content:center">
  <div style="max-width:1560px;display:flex;align-items:center;gap:18px;padding:12px 28px;border-radius:22px;
    background:rgba(10,10,18,.82);border:1px solid rgba(255,255,255,.14);box-shadow:0 12px 30px rgba(0,0,0,.4)">
    <span style="flex-shrink:0;font-weight:700;font-size:20px;color:#13200a;background:${C.lime};border-radius:999px;padding:4px 12px">${n}/${total}</span>
    <span style="font-weight:500;font-size:27px;line-height:1.25">${text}</span>
  </div>
</div></body></html>`;

const END_HTML = `<!doctype html><html><head>${FONT}</head><body style="background:${C.bg}">
<div style="position:relative;width:100%;height:100%;overflow:hidden;background:${C.bg};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px;text-align:center">
  ${AURORA}
  <div style="position:relative">${LOGO(190)}</div>
  <div style="position:relative;font-weight:700;font-size:120px;letter-spacing:-4px;line-height:1">Academia <span style="color:#a78bfa">FASI</span></div>
  <div style="position:relative;font-weight:500;font-size:44px;background:linear-gradient(90deg,#fff,#c4b5fd 40%,#67e8f9 80%);-webkit-background-clip:text;color:transparent">Aprende a tu ritmo</div>
  <div style="position:relative;margin-top:16px;font-weight:600;font-size:28px;color:#13200a;background:${C.lime};padding:14px 34px;border-radius:999px">Cursos en video · Progreso en la nube · Calidad adaptativa</div>
</div></body></html>`;

// Cursor y efecto de clic dentro de la app
const OVERLAY = `(() => {
  if (document.getElementById('rx')) return;
  const css = document.createElement('style');
  css.textContent = \`
    #rx-cur{position:fixed;left:0;top:0;z-index:2147483647;width:28px;height:28px;pointer-events:none;
      transition:left .6s cubic-bezier(.3,.7,.3,1), top .6s cubic-bezier(.3,.7,.3,1);filter:drop-shadow(0 3px 5px rgba(0,0,0,.6))}
    .rx-rip{position:fixed;z-index:2147483646;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;
      border:3px solid ${C.lime};background:rgba(183,243,74,.2);pointer-events:none;animation:rxr .6s ease-out forwards}
    @keyframes rxr{from{transform:scale(.3);opacity:1}to{transform:scale(1.6);opacity:0}}\`;
  document.head.appendChild(css);
  const root = document.createElement('div'); root.id = 'rx';
  root.innerHTML = '<svg id="rx-cur" viewBox="0 0 24 24"><path d="M4 2l16 9-7 2-3 7z" fill="#fff" stroke="#4c1d95" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  document.body.appendChild(root);
  const s = window.__rx || { x: 640, y: 360 };
  const cur = document.getElementById('rx-cur'); cur.style.left = s.x + 'px'; cur.style.top = s.y + 'px';
})()`;

async function renderizar(browser, html, w, h, file, transparent = false) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: file, omitBackground: transparent });
  await page.close();
}

const wavDur = (file) => (fs.statSync(file).size - 44) / (44100 * 2);

// ───────────── Grabación ─────────────
async function grabar(browser, dur) {
  const context = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: DSF, locale: 'es-ES' });
  const page = await context.newPage();
  page.on('load', () => page.evaluate(OVERLAY).catch(() => {}));
  await page.goto(PORTAL + '/');
  await page.locator('article').first().waitFor({ timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(OVERLAY);
  await sleep(2500); // animaciones de entrada

  const frames = [];
  const cdp = await context.newCDPSession(page);
  cdp.on('Page.screencastFrame', async (f) => {
    const file = path.join(TMP, `f${String(frames.length).padStart(6, '0')}.jpg`);
    fs.writeFileSync(file, Buffer.from(f.data, 'base64'));
    frames.push({ file, t: f.metadata.timestamp });
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: VW * DSF, maxHeight: VH * DSF, everyNthFrame: 1 });
  while (frames.length === 0) await sleep(50);
  const t0 = frames[0].t;

  // Cada escena dura al menos lo que dura su locución
  const marcas = [];
  let escenaInicio = 0, escenaId = '';
  const escena = async (id, accion) => {
    escenaId = id;
    escenaInicio = Date.now() / 1000;
    marcas.push({ id, start: escenaInicio - t0 });
    await accion();
    const restante = dur[id] + 0.5 - (Date.now() / 1000 - escenaInicio);
    if (restante > 0) await sleep(restante * 1000);
  };

  const mover = async (loc) => {
    await loc.waitFor({ state: 'visible', timeout: 20000 });
    await loc.scrollIntoViewIfNeeded();
    const b = await loc.boundingBox();
    const x = b.x + Math.min(b.width / 2, 90), y = b.y + b.height / 2;
    await page.evaluate(([x, y]) => { window.__rx = { x, y }; const c = document.getElementById('rx-cur'); if (c) { c.style.left = (x - 4) + 'px'; c.style.top = (y - 2) + 'px'; } }, [x, y]);
    await page.mouse.move(x, y, { steps: 10 });
    await sleep(650);
    return { x, y };
  };
  const clic = async (loc, pausa = 600) => {
    const { x, y } = await mover(loc);
    await page.evaluate(([x, y]) => { const r = document.createElement('div'); r.className = 'rx-rip'; r.style.left = x + 'px'; r.style.top = y + 'px'; document.body.appendChild(r); setTimeout(() => r.remove(), 700); }, [x, y]);
    await loc.click();
    await sleep(pausa);
  };
  const escribir = async (loc, texto) => { await clic(loc, 200); await loc.pressSequentially(texto, { delay: 55 }); };
  const scrollSuave = async (dy, pasos = 20) => { for (let i = 0; i < pasos; i++) { await page.mouse.wheel(0, dy / pasos); await sleep(35); } };

  // 1. Portada
  await escena('s01', async () => { await sleep(800); await mover(page.getByLabel('Buscar cursos')); });

  // 2. Catálogo
  await escena('s02', async () => {
    await scrollSuave(560); await sleep(600);
    await mover(page.locator('article').first()); await sleep(900);
    await mover(page.locator('article').nth(1)); await sleep(700);
  });

  // 3. Buscador
  await escena('s03', async () => {
    await scrollSuave(-560); await sleep(400);
    await escribir(page.getByLabel('Buscar cursos'), 'Excel');
    await sleep(1200); await scrollSuave(360); await sleep(800);
    await scrollSuave(-360);
    await page.getByLabel('Buscar cursos').fill(''); await sleep(600);
  });

  // 4. Ir a crear cuenta
  await escena('s04', async () => {
    await sleep(1500);
    await clic(page.getByRole('link', { name: 'Crear cuenta' }).first(), 900);
  });

  // 5. Formulario de registro
  await escena('s05', async () => {
    await escribir(page.getByPlaceholder('Tu nombre'), ALUMNA.name);
    await escribir(page.getByPlaceholder('tu@correo.com'), ALUMNA.email);
    await escribir(page.getByPlaceholder('Mínimo 8 caracteres'), ALUMNA.password);
    await escribir(page.getByPlaceholder('Repite la contraseña'), ALUMNA.password);
    await sleep(500);
  });

  // 6. Sesión iniciada
  await escena('s06', async () => {
    await clic(page.getByRole('button', { name: 'Crear cuenta' }), 400);
    const avatar = page.getByRole('button', { name: new RegExp(ALUMNA.name) });
    await avatar.waitFor({ timeout: 20000 });
    await sleep(500);
    await mover(avatar);
  });

  // 7. Elegir curso
  await escena('s07', async () => {
    await scrollSuave(560); await sleep(500);
    await clic(page.locator('article', { hasText: CURSO }), 400);
    await page.locator('video').waitFor();
  });

  // 8. Reproductor
  await escena('s08', async () => {
    const video = page.locator('video');
    await page.waitForFunction(() => (document.querySelector('video')?.readyState ?? 0) > 1, null, { timeout: 30000 });
    await video.evaluate((v) => { v.muted = true; return v.play().catch(() => {}); });
    await sleep(1800);
    const calidad = page.locator('main span.chip', { hasText: /\d+p/ });
    if (await calidad.count()) await mover(calidad.first());
  });

  // 9. Contenido del curso
  await escena('s09', async () => {
    await mover(page.getByText('Contenido del curso')); await sleep(800);
    await clic(page.getByRole('button', { name: /Vocabulario esencial/ }), 1600);
    await clic(page.getByRole('button', { name: /Anterior/ }), 1200);
  });

  // 10. Progreso
  await escena('s10', async () => {
    await page.locator('video').evaluate((v) => { v.muted = true; v.play().catch(() => {}); v.currentTime = Math.max(0, v.duration - 0.6); });
    await page.getByText(/1\/3 completadas/).waitFor({ timeout: 20000 });
    await mover(page.getByText(/completadas/)); await sleep(1200);
  });

  // 11. Cerrar sesión
  await escena('s11', async () => {
    await page.locator('video').evaluate((v) => v.pause());
    await clic(page.getByRole('button', { name: new RegExp(ALUMNA.name) }), 1200);
    await mover(page.getByRole('button', { name: 'Cerrar sesión' }));
    await sleep(900);
    await clic(page.getByRole('button', { name: 'Cerrar sesión' }), 1200);
  });

  await cdp.send('Page.stopScreencast');
  await context.close();
  return { frames, marcas, appDur: frames[frames.length - 1].t - t0 + 0.6 };
}

(async () => {
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });

  console.log('Generando la narración…');
  const guion = path.join(TMP, 'guion.json');
  fs.writeFileSync(guion, JSON.stringify(ESCENAS), 'utf8');
  execFileSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(__dirname, 'narrar.ps1'),
    guion, path.join(TMP, 'voz'), VOZ, VELOCIDAD], { stdio: 'inherit' });
  const dur = Object.fromEntries(ESCENAS.map((e) => [e.id, wavDur(path.join(TMP, 'voz', `${e.id}.wav`))]));

  const browser = await chromium.launch({ channel: process.env.NAVEGADOR || 'msedge', headless: true });
  let rec;
  try {
    console.log('Generando gráficos…');
    await renderizar(browser, BG_HTML, OW, OH, path.join(TMP, 'bg.png'));
    await renderizar(browser, MASK_HTML, FRAME.w, FRAME.h, path.join(TMP, 'mask.png'));
    await renderizar(browser, END_HTML, OW, OH, path.join(TMP, 'end.png'));
    const pasos = ESCENAS.filter((e) => e.id !== 'fin');
    for (const [i, e] of pasos.entries())
      await renderizar(browser, CAPTION_HTML(e.text, i + 1, pasos.length), OW, OH, path.join(TMP, `cap-${e.id}.png`), true);
    console.log('Grabando el portal…');
    rec = await grabar(browser, dur);
  } finally {
    await browser.close();
  }

  // Cuadros con su duración real → video de la app
  const { frames, marcas, appDur } = rec;
  const lista = frames.map((f, i) => `file '${f.file.replace(/\\/g, '/')}'\nduration ${Math.max(0.001, i + 1 < frames.length ? frames[i + 1].t - f.t : 0.6).toFixed(4)}`);
  lista.push(`file '${frames[frames.length - 1].file.replace(/\\/g, '/')}'`);
  fs.writeFileSync(path.join(TMP, 'lista.txt'), lista.join('\n'));
  const raw = path.join(TMP, 'app.mp4');
  execFileSync(FFMPEG, ['-y', '-f', 'concat', '-safe', '0', '-i', path.join(TMP, 'lista.txt'), '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', raw], { stdio: 'ignore' });

  const finStart = appDur;
  const total = Math.round((appDur + Math.max(END_CARD, dur.fin + 1.5)) * 10) / 10;
  marcas.push({ id: 'fin', start: finStart + 0.6 });

  console.log('Componiendo música…');
  const musica = path.join(TMP, 'musica.wav');
  execFileSync(process.execPath, [path.join(__dirname, 'musica.js'), musica, String(Math.ceil(total) + 1), 'calido'], { stdio: 'ignore' });

  console.log('Componiendo el video…');
  // Entradas: 0 bg, 1 app, 2 mask, 3 end, 4 música, 5.. subtítulos, luego locuciones
  const pasos = marcas.filter((m) => m.id !== 'fin');
  const inputs = [
    '-loop', '1', '-framerate', '30', '-i', path.join(TMP, 'bg.png'),
    '-i', raw,
    '-loop', '1', '-framerate', '30', '-i', path.join(TMP, 'mask.png'),
    '-loop', '1', '-framerate', '30', '-i', path.join(TMP, 'end.png'),
    '-i', musica,
  ];
  pasos.forEach((m) => inputs.push('-loop', '1', '-framerate', '30', '-i', path.join(TMP, `cap-${m.id}.png`)));
  const vozBase = 5 + pasos.length;
  marcas.forEach((m) => inputs.push('-i', path.join(TMP, 'voz', `${m.id}.wav`)));

  const f = [
    `[1:v]scale=${FRAME.w}:${FRAME.h}:flags=lanczos,tpad=stop_mode=clone:stop_duration=${END_CARD + 3},format=rgba[app]`,
    `[2:v]scale=${FRAME.w}:${FRAME.h},format=gray[mask]`,
    `[app][mask]alphamerge,fade=in:st=0:d=0.8:alpha=1[appr]`,
    `[0:v][appr]overlay=${FRAME.x}:${FRAME.y}[b0]`,
  ];
  let last = 'b0';
  pasos.forEach((m, i) => {
    const next = marcas[marcas.indexOf(m) + 1];
    const end = Math.min(next ? next.start : finStart, m.start + dur[m.id] + 1.2);
    f.push(`[${5 + i}:v]format=rgba[c${i}]`);
    f.push(`[${last}][c${i}]overlay=0:0:enable='between(t,${m.start.toFixed(2)},${end.toFixed(2)})'[b${i + 1}]`);
    last = `b${i + 1}`;
  });
  f.push(`[3:v]format=rgba,fade=in:st=${finStart.toFixed(2)}:d=0.8:alpha=1[end]`);
  f.push(`[${last}][end]overlay=0:0,format=yuv420p[v]`);
  // Audio: locuciones en su instante + música baja
  marcas.forEach((m, i) => {
    const ms = Math.round(m.start * 1000) + 250;
    f.push(`[${vozBase + i}:a]aresample=48000,adelay=${ms}|${ms},volume=1.6[n${i}]`);
  });
  f.push(`[4:a]aresample=48000,volume=0.16,atrim=0:${total},afade=in:d=1.5,afade=out:st=${Math.max(0, total - 2.5).toFixed(2)}:d=2.5[mus]`);
  f.push(`[mus]${marcas.map((_, i) => `[n${i}]`).join('')}amix=inputs=${marcas.length + 1}:normalize=0:duration=first,alimiter=limit=0.95[a]`);

  execFileSync(FFMPEG, ['-y', ...inputs, '-filter_complex', f.join(';'), '-map', '[v]', '-map', '[a]',
    '-t', String(total), '-r', '30', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', OUT], { stdio: 'ignore' });

  fs.rmSync(TMP, { recursive: true, force: true });
  console.log(`✔ ${OUT} · ${total} s · ${OW}×${OH}`);
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
