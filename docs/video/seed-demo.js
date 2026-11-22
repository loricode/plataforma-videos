// Crea contenido de demostración en la plataforma (vía API, como instructor):
// 3 cursos publicados con portada y lecciones en video (diapositivas animadas generadas aquí).
//
// Uso:  node seed-demo.js            → crea los cursos que falten
//       node seed-demo.js --limpiar  → además elimina los cursos de prueba (E2E…, Curso HD en S3…)
// Variables: ADMIN_URL (http://localhost:8300), ADMIN_EMAIL, ADMIN_PASSWORD
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright-core');
const FFMPEG = require('ffmpeg-static');

const API = (process.env.ADMIN_URL || 'http://localhost:8300') + '/api';
const EMAIL = process.env.ADMIN_EMAIL || 'admin@academia.local';
const PASSWORD = process.env.ADMIN_PASSWORD || 'Admin12345!';
const TMP = path.join(__dirname, 'tmp-demo');
const LIMPIAR = process.argv.includes('--limpiar');
const PRUEBAS = [/^E2E Curso/i, /^Curso HD en S3/i, /^Ingl.s t.cnico \(demo\)/i, /^Ingl.s t.cnico demo/i];

const CURSOS = [
  {
    title: 'Inglés técnico para principiantes',
    description: 'Vocabulario, lectura de documentación y frases clave para trabajar en tecnología con confianza.',
    icon: '💬', grad: ['#4c1d95', '#0e7490'],
    lessons: ['Bienvenida al curso', 'Vocabulario esencial', 'Leer documentación técnica'],
  },
  {
    title: 'Fotografía con el celular',
    description: 'Aprende encuadre, luz natural y edición básica para lograr fotos increíbles con tu teléfono.',
    icon: '📷', grad: ['#831843', '#4c1d95'],
    lessons: ['Encuadre y composición', 'Aprovechar la luz natural', 'Edición rápida'],
  },
  {
    title: 'Excel desde cero',
    description: 'Hojas de cálculo, fórmulas y gráficos paso a paso, sin conocimientos previos.',
    icon: '📊', grad: ['#065f46', '#1e3a8a'],
    lessons: ['Tu primera hoja de cálculo', 'Fórmulas básicas'],
  },
];

const FONT = `<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
<style>*{margin:0;box-sizing:border-box}body{width:1280px;height:720px;overflow:hidden;font-family:Outfit,'Segoe UI',sans-serif;color:#fff}</style>`;

const portadaHtml = (c) => `<!doctype html><html><head>${FONT}</head><body>
<div style="position:relative;width:100%;height:100%;background:linear-gradient(135deg,${c.grad[0]},${c.grad[1]});overflow:hidden">
  <div style="position:absolute;width:620px;height:620px;border-radius:50%;background:#fff;opacity:.08;right:-160px;top:-200px"></div>
  <div style="position:absolute;width:420px;height:420px;border-radius:50%;background:#b7f34a;opacity:.12;filter:blur(30px);left:-120px;bottom:-160px"></div>
  <div style="position:absolute;left:90px;top:110px;font-size:150px;filter:drop-shadow(0 20px 30px rgba(0,0,0,.35))">${c.icon}</div>
  <div style="position:absolute;left:90px;bottom:120px;right:90px;font-weight:700;font-size:72px;line-height:1.05;letter-spacing:-1px;text-shadow:0 8px 24px rgba(0,0,0,.3)">${c.title}</div>
  <div style="position:absolute;left:90px;bottom:70px;font-size:26px;opacity:.85">Academia FASI</div>
</div></body></html>`;

const leccionHtml = (c, i, t) => `<!doctype html><html><head>${FONT}</head><body>
<div style="position:relative;width:100%;height:100%;background:radial-gradient(circle at 70% 30%,${c.grad[1]},#07070d 70%);overflow:hidden">
  <div style="position:absolute;width:520px;height:520px;border-radius:50%;background:${c.grad[0]};opacity:.55;filter:blur(80px);left:-100px;top:-100px"></div>
  <div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 110px;gap:22px">
    <div style="font-size:30px;letter-spacing:6px;text-transform:uppercase;color:#b7f34a">Lección ${i + 1}</div>
    <div style="font-weight:700;font-size:86px;line-height:1.02;letter-spacing:-2px">${t}</div>
    <div style="font-size:32px;opacity:.75">${c.icon}  ${c.title}</div>
  </div>
</div></body></html>`;

async function api(method, url, token, body, isForm) {
  const res = await fetch(API + url, {
    method,
    headers: { ...(isForm ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${url} → ${res.status} ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

const form = (fields, file, name, type) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.append(k, v);
  f.append('file', new Blob([fs.readFileSync(file)], { type }), name);
  return f;
};

async function render(browser, html, file) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: file });
  await page.close();
}

/** Diapositiva → video de 12 s con zoom suave y un tono ambiental muy bajo. */
function videoDesde(png, mp4) {
  execFileSync(FFMPEG, ['-y', '-loop', '1', '-i', png,
    '-f', 'lavfi', '-i', 'sine=frequency=220:sample_rate=44100',
    '-filter_complex', "[0:v]scale=2560:-1,zoompan=z='min(zoom+0.0006,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=360:s=1280x720:fps=30,format=yuv420p[v];[1:a]volume=0.03[a]",
    '-map', '[v]', '-map', '[a]', '-t', '12', '-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-c:a', 'aac', mp4], { stdio: 'ignore' });
}

(async () => {
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });

  const login = await api('POST', '/User/Login', null, { email: EMAIL, password: PASSWORD });
  const token = login.token;
  let mine = await api('GET', '/Course/List', token);

  if (LIMPIAR) {
    for (const c of mine.filter((c) => PRUEBAS.some((r) => r.test(c.title)))) {
      await api('DELETE', `/Course/Delete?courseId=${c.id}`, token);
      console.log(`🗑  eliminado: ${c.title}`);
    }
    mine = await api('GET', '/Course/List', token);
  }

  const browser = await chromium.launch({ channel: process.env.NAVEGADOR || 'msedge', headless: true });
  const creados = [];
  try {
    for (const [ci, c] of CURSOS.entries()) {
      if (mine.some((m) => m.title === c.title)) { console.log(`✓ ya existe: ${c.title}`); continue; }
      const cover = path.join(TMP, `cover-${ci}.png`);
      await render(browser, portadaHtml(c), cover);
      const id = await api('POST', '/Course/Create', token,
        form({ title: c.title, description: c.description, state: 'true' }, cover, 'cover.png', 'image/png'), true);
      console.log(`＋ curso: ${c.title}`);
      for (const [li, t] of c.lessons.entries()) {
        const png = path.join(TMP, `l-${ci}-${li}.png`);
        const mp4 = path.join(TMP, `l-${ci}-${li}.mp4`);
        await render(browser, leccionHtml(c, li, t), png);
        videoDesde(png, mp4);
        await api('POST', '/Video/Upload', token,
          form({ title: t, description: `${t} — ${c.title}`, courseId: id }, mp4, 'leccion.mp4', 'video/mp4'), true);
        console.log(`   ▸ lección: ${t}`);
      }
      creados.push(id);
    }
  } finally {
    await browser.close();
  }

  // Esperar a que FFmpeg termine en el servidor
  for (const id of creados) {
    for (let i = 0; i < 90; i++) {
      const vids = await api('GET', `/Video/List/${id}`, token);
      if (vids.every((v) => v.status === 'Ready' || v.status === 'Failed')) break;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  fs.rmSync(TMP, { recursive: true, force: true });
  console.log('✔ Contenido demo listo');
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
