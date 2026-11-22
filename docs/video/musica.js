// Música de fondo original para los reels (sintetizada: sin derechos de terceros).
// Uso: node musica.js [salida.wav] [segundos] [estilo]
//   estilo "alegre" (por defecto): Do–Sol–Lam–Fa a 104 BPM, marimba, campanitas, bajo, bombo y shaker.
//   estilo "calido": Fa maj7–Mi m7–Re m7–Do maj7 a 84 BPM, colchón suave, piano eléctrico, bajo y escobillas.
const fs = require('fs');

const OUT = process.argv[2] || 'musica.wav';
const SECONDS = Number(process.argv[3] || 40);
const STYLE = process.argv[4] || 'alegre';
const SR = 44100;
const BPM = STYLE === 'calido' ? 84 : 104;
const BEAT = 60 / BPM;
const N = Math.ceil(SECONDS * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);

const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

// Generador pseudoaleatorio con semilla: la pieza es siempre igual.
let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;

function add(start, dur, pan, gain, sample) {
  const s0 = Math.floor(start * SR);
  const len = Math.floor(dur * SR);
  const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = gain * Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < len && s0 + i < N; i++) {
    const v = sample(i / SR);
    L[s0 + i] += v * gl;
    R[s0 + i] += v * gr;
  }
}

// Marimba: fundamental + parcial en 4x, ataque rápido y caída exponencial.
const marimba = (f) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(2 * Math.PI * f * 4 * t) * Math.exp(-t * 18)) * Math.exp(-t * 5.5) * Math.min(1, t * 400);
// Campanita: parcial inarmónico 2.76x, caída más larga.
const bell = (f) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 6)) * Math.exp(-t * 3) * Math.min(1, t * 500);
const bass = (f) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t)) * Math.exp(-t * 2.2) * Math.min(1, t * 200);
const kick = (t) => Math.sin(2 * Math.PI * (48 + 90 * Math.exp(-t * 28)) * t) * Math.exp(-t * 9);
const shaker = (t) => rnd() * Math.exp(-t * 60);

// Acordes (MIDI): Do, Sol, Lam, Fa
const CHORDS = [
  [60, 64, 67], // C
  [55, 59, 62], // G
  [57, 60, 64], // Am
  [53, 57, 60], // F
];
const ROOTS = [36, 43, 45, 41];
// Melodía pentatónica, 8 corcheas por compás (null = silencio)
const MELODY = [
  [76, null, 79, null, 81, 79, 76, null],
  [74, null, 79, null, 76, null, 74, 72],
  [72, null, 76, null, 79, 81, 79, null],
  [77, null, 76, null, 74, null, 72, null],
];

const bars = Math.ceil(SECONDS / (BEAT * 4));

// ───────────── Estilo cálido ─────────────
// Colchón: senos levemente desafinados (coro) con ataque y salida lentos.
const pad = (f, dur) => (t) => {
  const env = Math.min(1, t / 0.8) * Math.min(1, Math.max(0, (dur - t) / 0.9));
  return (Math.sin(2 * Math.PI * f * t) + Math.sin(2 * Math.PI * f * 1.004 * t) + 0.5 * Math.sin(2 * Math.PI * f * 2 * t)) * env / 2.5;
};
// Piano eléctrico: fundamental + 2.º armónico con trémolo suave y caída larga.
const epiano = (f) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 2 * t) * Math.exp(-t * 3))
  * Math.exp(-t * 1.6) * (1 + 0.12 * Math.sin(2 * Math.PI * 5 * t)) * Math.min(1, t * 300);
const brush = (t) => rnd() * Math.exp(-t * 14) * Math.min(1, t * 80);
const WARM = [
  [53, 57, 60, 64], // Fmaj7
  [52, 55, 59, 62], // Em7
  [50, 53, 57, 60], // Dm7
  [48, 52, 55, 59], // Cmaj7
];
const WARM_ROOTS = [41, 40, 38, 36];
const WARM_MELODY = [
  [72, null, null, 76, null, 74, null, null],
  [71, null, null, null, 74, null, 72, null],
  [69, null, null, 72, null, 74, null, null],
  [76, null, 74, null, 72, null, null, null],
];

if (STYLE === 'calido') {
  for (let b = 0; b < bars; b++) {
    const c = b % 4;
    const t0 = b * BEAT * 4;
    WARM[c].forEach((m) => add(t0, BEAT * 4 + 0.6, 0, 0.09, pad(hz(m), BEAT * 4 + 0.6)));
    // Piano eléctrico: acorde en el 1 y en el "y" del 2 (síncopa suave)
    for (const at of [0, BEAT * 1.5, BEAT * 3]) WARM[c].forEach((m, i) => add(t0 + at + i * 0.012, 2.2, i % 2 ? 0.25 : -0.25, 0.05, epiano(hz(m + 12))));
    add(t0, BEAT * 2, 0, 0.3, bass(hz(WARM_ROOTS[c])));
    add(t0 + BEAT * 2, BEAT * 2, 0, 0.24, bass(hz(WARM_ROOTS[c] + 7)));
    if (b >= 1) {
      add(t0 + BEAT, 0.5, -0.3, 0.05, brush);
      add(t0 + BEAT * 3, 0.5, -0.3, 0.05, brush);
      add(t0, 0.5, 0, 0.18, kick);
    }
    if (b >= 2 && b % 8 !== 7) WARM_MELODY[c].forEach((m, i) => m && add(t0 + i * (BEAT / 2), 2.4, 0.3, 0.07, bell(hz(m))));
  }
}

for (let b = 0; b < bars && STYLE !== 'calido'; b++) {
  const c = b % 4;
  const t0 = b * BEAT * 4;
  const chord = CHORDS[c];
  // Arpegio en corcheas, sube y baja por dos octavas
  const arp = [chord[0], chord[1], chord[2], chord[0] + 12, chord[2], chord[1] + 12, chord[2] + 12, chord[1] + 12];
  arp.forEach((m, i) => add(t0 + i * (BEAT / 2), 1.2, -0.35, 0.16, marimba(hz(m))));
  // Bajo en los tiempos 1 y 3
  add(t0, BEAT * 2, 0, 0.32, bass(hz(ROOTS[c])));
  add(t0 + BEAT * 2, BEAT * 2, 0, 0.26, bass(hz(ROOTS[c])));
  // Percusión: entra en el segundo compás
  if (b >= 1) {
    add(t0, 0.5, 0, 0.32, kick);
    add(t0 + BEAT * 2, 0.5, 0, 0.26, kick);
    for (let k = 0; k < 8; k++) add(t0 + k * (BEAT / 2) + BEAT / 4, 0.08, 0.4, k % 2 ? 0.05 : 0.035, shaker);
  }
  // Melodía de campanitas a partir del compás 3 (se toma un respiro cada 8 compases)
  if (b >= 2 && b % 8 !== 7) MELODY[c].forEach((m, i) => m && add(t0 + i * (BEAT / 2), 1.6, 0.35, 0.13, bell(hz(m))));
}

// Eco estéreo cruzado (a 3/4 de tiempo) para dar espacio
const D = Math.floor(BEAT * 0.75 * SR);
for (let i = D; i < N; i++) {
  L[i] += R[i - D] * 0.22;
  R[i] += L[i - D] * 0.22;
}

// Entrada (1 s) y salida (2.5 s) graduales + normalización a -3 dBFS
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const g = Math.min(1, t / 1) * Math.min(1, (SECONDS - t) / 2.5);
  L[i] *= g;
  R[i] *= g;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = peak ? 0.708 / peak : 1;

// WAV PCM 16 bits estéreo
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8);
buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm)) * 32767), 46 + i * 4);
}
fs.writeFileSync(OUT, buf);
console.log(`${OUT} · ${SECONDS} s · ${BPM} BPM · ${STYLE}`);
