// Stitches clips into one video in the browser with title/CTA overlays and optional music.
const loadVideo = (url) => new Promise((res, rej) => {
  const v = document.createElement("video");
  v.crossOrigin = "anonymous";
  v.muted = true;
  v.playsInline = true;
  v.src = url;
  v.onloadeddata = () => res(v);
  v.onerror = () => rej(new Error("Could not load a clip"));
});

function overlay(ctx, w, h, text, sub) {
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(0, h * 0.38, w, h * 0.24);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = `bold ${Math.round(h * 0.08)}px Georgia, serif`;
  ctx.fillText(text, w / 2, h * 0.5);
  if (sub) {
    ctx.font = `${Math.round(h * 0.04)}px Arial, sans-serif`;
    ctx.fillText(sub, w / 2, h * 0.57);
  }
}

export async function stitchVideo({ clipUrls, musicUrl, title, cta, aspect = "16:9", onProgress }) {
  const [w, h] = aspect === "9:16" ? [720, 1280] : [1280, 720];
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  const stream = canvas.captureStream(30);

  let audio;
  if (musicUrl) {
    audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.src = musicUrl;
    const ac = new AudioContext();
    const dest = ac.createMediaStreamDestination();
    ac.createMediaElementSource(audio).connect(dest);
    dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
  }

  const videos = await Promise.all(clipUrls.map(loadVideo));
  const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") ? "video/webm;codecs=vp9,opus" : "video/webm";
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 5_000_000 });
  const chunks = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const done = new Promise((r) => (rec.onstop = r));
  rec.start();
  audio?.play();

  for (let i = 0; i < videos.length; i++) {
    const v = videos[i];
    v.currentTime = 0;
    await v.play();
    await new Promise((resolve) => {
      const draw = () => {
        if (v.ended) return resolve();
        ctx.drawImage(v, 0, 0, w, h);
        if (i === 0 && v.currentTime < 3) overlay(ctx, w, h, title);
        if (i === videos.length - 1 && v.duration - v.currentTime < 3) overlay(ctx, w, h, title, cta);
        onProgress?.((i + v.currentTime / v.duration) / videos.length);
        requestAnimationFrame(draw);
      };
      draw();
    });
  }
  rec.stop();
  audio?.pause();
  await done;
  return new Blob(chunks, { type: "video/webm" });
}