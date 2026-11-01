// Composes mood-based instrumental music in the browser (no external API).
const MOODS = [
  { match: /dark|tense|suspense|thrill|horror|ominous|mystery/i, root: 45, minor: true, bpm: 70, prog: [0, 5, 3, 4] },
  { match: /epic|heroic|adventure|triumph|action|intense/i, root: 43, minor: true, bpm: 96, prog: [0, 5, 2, 6] },
  { match: /romantic|love|tender|warm|hopeful|uplift/i, root: 48, minor: false, bpm: 78, prog: [0, 4, 5, 3] },
  { match: /sad|melanchol|reflective|somber|emotional/i, root: 50, minor: true, bpm: 62, prog: [0, 3, 5, 4] },
  { match: /happy|playful|light|fun|whimsical|joy/i, root: 52, minor: false, bpm: 108, prog: [0, 3, 4, 0] },
];
const DEFAULT = { root: 48, minor: false, bpm: 84, prog: [0, 5, 3, 4] };
const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const MINOR = [0, 2, 3, 5, 7, 8, 10];
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

export const pickStyle = (mood = "") => MOODS.find((m) => m.match.test(mood)) || DEFAULT;

function note(ctx, out, freq, start, len, type, gain) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gain, start + Math.min(0.4, len / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, start + len);
  o.connect(g).connect(out);
  o.start(start);
  o.stop(start + len + 0.05);
}

function kick(ctx, out, t) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.setValueAtTime(120, t);
  o.frequency.exponentialRampToValueAtTime(40, t + 0.3);
  g.gain.setValueAtTime(0.5, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + 0.4);
}

function toWav(buf) {
  const ch = buf.numberOfChannels, len = buf.length * ch * 2 + 44;
  const view = new DataView(new ArrayBuffer(len));
  const w = (o, s) => [...s].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF"); view.setUint32(4, len - 8, true); w(8, "WAVEfmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, ch, true);
  view.setUint32(24, buf.sampleRate, true); view.setUint32(28, buf.sampleRate * ch * 2, true);
  view.setUint16(32, ch * 2, true); view.setUint16(34, 16, true); w(36, "data");
  view.setUint32(40, len - 44, true);
  const data = [...Array(ch)].map((_, i) => buf.getChannelData(i));
  let off = 44;
  for (let i = 0; i < buf.length; i++) for (let c = 0; c < ch; c++) {
    const s = Math.max(-1, Math.min(1, data[c][i]));
    view.setInt16(off, s * 0x7fff, true); off += 2;
  }
  return new Blob([view], { type: "audio/wav" });
}

export async function composeMusic({ mood, seconds = 30, energy = "medium" }) {
  const style = pickStyle(mood);
  const rate = 44100;
  const ctx = new OfflineAudioContext(2, rate * seconds, rate);
  const master = ctx.createGain();
  master.gain.value = 0.6;
  master.connect(ctx.destination);
  const scale = style.minor ? MINOR : MAJOR;
  const deg = (d) => style.root + scale[d % 7] + 12 * Math.floor(d / 7);
  const beat = 60 / style.bpm, bar = beat * 4;
  const bars = Math.ceil(seconds / bar);

  for (let b = 0; b < bars; b++) {
    const t = b * bar, d = style.prog[b % style.prog.length];
    [d, d + 2, d + 4].forEach((x) => note(ctx, master, hz(deg(x)), t, bar * 1.1, "triangle", 0.12));
    note(ctx, master, hz(deg(d) - 12), t, bar, "sine", 0.25);
    if (energy !== "low" && b > 0) {
      for (let i = 0; i < 8; i++) note(ctx, master, hz(deg(d + [0, 2, 4, 7][i % 4]) + 12), t + i * beat / 2, beat, "sine", 0.06);
    }
    if (energy === "high" || (energy === "medium" && b >= bars / 2)) {
      for (let i = 0; i < 4; i++) kick(ctx, master, t + i * beat);
    }
  }
  master.gain.setValueAtTime(0.6, Math.max(0, seconds - 2));
  master.gain.linearRampToValueAtTime(0, seconds);
  return toWav(await ctx.startRendering());
}