// Composes and synthesizes the background music: an original, gentle piano waltz in D major.
// Written from scratch here, so there are no licensing questions. Output: public/music.wav
//   npm run music
import { writeFileSync } from 'node:fs';

const SR = 44100;
const BPM = 68;
const BEAT = 60 / BPM;
const BAR = BEAT * 3;
const LENGTH = 60; // seconds, matches the video
const FADE_IN = 1.5;
const FADE_OUT = 3;

// Left hand voicings: bass note on beat 1, chord on beats 2 and 3
const CHORDS = {
  Dmaj7: { bass: 38, chord: [57, 61, 66] },
  Gmaj7: { bass: 43, chord: [59, 62, 66] },
  Bm7: { bass: 47, chord: [57, 62, 66] },
  Em7: { bass: 40, chord: [55, 59, 62] },
  A7: { bass: 45, chord: [55, 61, 64] },
  Asus4: { bass: 45, chord: [57, 62, 64] },
  'F#m7': { bass: 42, chord: [57, 61, 64] },
};

const PROGRESSION = [
  'Dmaj7', 'Gmaj7', 'Dmaj7', 'Gmaj7',
  'Bm7', 'Gmaj7', 'Em7', 'A7',
  'Dmaj7', 'Gmaj7', 'F#m7', 'Bm7',
  'Em7', 'Gmaj7', 'Asus4', 'A7',
  'Dmaj7', 'Gmaj7', 'Em7', 'Asus4', 'Dmaj7', 'Dmaj7',
];

// Right hand melody, from bar 5: [bar (1-based), beat (0-2), midi note, length in beats]
const MELODY = [
  [5, 0, 78, 2], [5, 2, 76, 1],
  [6, 0, 74, 3],
  [7, 0, 71, 1], [7, 1, 74, 1], [7, 2, 76, 1],
  [8, 0, 73, 3],
  [9, 0, 78, 2], [9, 2, 81, 1],
  [10, 0, 83, 2], [10, 2, 81, 1],
  [11, 0, 76, 2], [11, 2, 73, 1],
  [12, 0, 74, 3],
  [13, 0, 79, 2], [13, 2, 78, 1],
  [14, 0, 74, 2], [14, 2, 71, 1],
  [15, 0, 74, 3],
  [16, 0, 73, 2], [16, 2, 76, 1],
  [17, 0, 78, 3],
  [18, 0, 83, 2], [18, 2, 81, 1],
  [19, 0, 79, 2], [19, 2, 76, 1],
  [20, 0, 76, 2], [20, 2, 69, 1],
  [21, 0, 74, 3],
  [22, 0, 78, 4],
];

// Deterministic "random" so every run produces the same file
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const humanize = (amount) => (rand() * 2 - 1) * amount;

const notes = [];
PROGRESSION.forEach((name, i) => {
  const { bass, chord } = CHORDS[name];
  const start = i * BAR;
  const last = i === PROGRESSION.length - 1;
  notes.push({ midi: bass, start, dur: last ? BAR * 1.5 : BAR * 0.95, vel: 0.42, pan: -0.25 });
  for (const beat of last ? [1] : [1, 2]) {
    chord.forEach((midi, k) =>
      notes.push({ midi, start: start + beat * BEAT + k * 0.012, dur: last ? BAR : BEAT * 0.9, vel: 0.24, pan: -0.05 + k * 0.08 })
    );
  }
});
for (const [bar, beat, midi, beats] of MELODY) {
  notes.push({ midi, start: (bar - 1) * BAR + beat * BEAT, dur: beats * BEAT * 0.98, vel: 0.5, pan: 0.2 });
}

// Soft piano voice: decaying harmonics, two slightly detuned strings, damper on release
const total = Math.ceil(LENGTH * SR);
const left = new Float32Array(total);
const right = new Float32Array(total);

for (const note of notes) {
  const start = note.start + humanize(0.008);
  const vel = note.vel * (1 + humanize(0.08));
  const f0 = 440 * 2 ** ((note.midi - 69) / 12);
  const baseDecay = Math.min(4.5, 3.2 * (440 / f0) ** 0.35);
  const release = 0.45;
  const span = Math.min(note.dur + release * 5, baseDecay * 4);
  const s0 = Math.max(0, Math.floor(start * SR));
  const s1 = Math.min(total, s0 + Math.floor(span * SR));
  const gL = Math.cos(((note.pan + 1) * Math.PI) / 4);
  const gR = Math.sin(((note.pan + 1) * Math.PI) / 4);

  const partials = [];
  for (let n = 1; n <= 8; n++) {
    const freq = n * f0 * Math.sqrt(1 + 0.0004 * n * n);
    if (freq > 9000) break;
    const amp = (1 / n ** 1.5) * vel ** ((n - 1) * 0.35) * (n === 1 ? 1 : 0.8);
    partials.push({ freq, amp, decay: baseDecay / (1 + 0.7 * (n - 1)) });
  }

  for (let s = s0; s < s1; s++) {
    const t = (s - s0) / SR;
    const attack = Math.min(1, t / 0.008);
    const damper = t > note.dur ? Math.exp(-(t - note.dur) / release) : 1;
    let v = 0;
    for (const p of partials) {
      const env = p.amp * Math.exp(-t / p.decay);
      v += env * (Math.sin(2 * Math.PI * p.freq * t) + 0.6 * Math.sin(2 * Math.PI * p.freq * 1.0006 * t));
    }
    v *= vel * attack * damper;
    left[s] += v * gL;
    right[s] += v * gR;
  }
}

// Warmth: gentle one-pole low-pass
const lowpass = (buf, cutoff) => {
  const a = 1 - Math.exp((-2 * Math.PI * cutoff) / SR);
  let y = 0;
  for (let i = 0; i < buf.length; i++) buf[i] = y += a * (buf[i] - y);
};
lowpass(left, 4500);
lowpass(right, 4500);

// Room: small Freeverb-style reverb (parallel combs + series all-passes), offset per channel for width
const reverb = (input, offset) => {
  const out = new Float32Array(input.length);
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map((d) => ({ buf: new Float32Array(d + offset), i: 0, store: 0 }));
  for (let s = 0; s < input.length; s++) {
    let acc = 0;
    for (const c of combs) {
      const y = c.buf[c.i];
      c.store = y * 0.6 + c.store * 0.4; // damping
      c.buf[c.i] = input[s] * 0.015 + c.store * 0.86; // feedback = room size
      c.i = (c.i + 1) % c.buf.length;
      acc += y;
    }
    out[s] = acc;
  }
  for (const d of [556, 441, 341, 225]) {
    const buf = new Float32Array(d + offset);
    let i = 0;
    for (let s = 0; s < out.length; s++) {
      const delayed = buf[i];
      const x = out[s];
      buf[i] = x + delayed * 0.5;
      out[s] = delayed - x;
      i = (i + 1) % buf.length;
    }
  }
  return out;
};
const wetL = reverb(left, 0);
const wetR = reverb(right, 23);

// Mix, fade, normalize to -3 dB, write 16-bit stereo WAV
let peak = 0;
for (let s = 0; s < total; s++) {
  const t = s / SR;
  const fade = Math.min(1, t / FADE_IN) * Math.min(1, Math.max(0, (LENGTH - t) / FADE_OUT));
  left[s] = (left[s] * 0.75 + wetL[s] * 0.35) * fade;
  right[s] = (right[s] * 0.75 + wetR[s] * 0.35) * fade;
  peak = Math.max(peak, Math.abs(left[s]), Math.abs(right[s]));
}
const gain = 0.708 / peak;

const data = Buffer.alloc(total * 4);
for (let s = 0; s < total; s++) {
  data.writeInt16LE(Math.round(left[s] * gain * 32767), s * 4);
  data.writeInt16LE(Math.round(right[s] * gain * 32767), s * 4 + 2);
}
const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + data.length, 4);
header.write('WAVEfmt ', 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20); // PCM
header.writeUInt16LE(2, 22); // stereo
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write('data', 36);
header.writeUInt32LE(data.length, 40);

const outPath = new URL('../public/music.wav', import.meta.url);
writeFileSync(outPath, Buffer.concat([header, data]));
console.log(`[Music] ${notes.length} notes, ${LENGTH}s -> public/music.wav`);
