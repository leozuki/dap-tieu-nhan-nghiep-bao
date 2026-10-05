/* Âm thanh tổng hợp bằng WebAudio – không cần file âm thanh.
   - Mở khóa ở lần chạm đầu tiên bất kỳ (trình duyệt chặn âm thanh trước thao tác người dùng).
   - iPhone: Web Audio bị tắt khi gạt nút im lặng → đặt audioSession = 'playback' và phát kèm một <audio> câm
     để iOS chuyển sang kênh "media" (giống video), nên vẫn nghe được khi máy để im lặng.
   - Nhạc nền tổng hợp (ngũ cung), tự nhỏ lại khi hình nhân thì thầm. */
(function (root) {
  let ctx = null, master = null, sfxBus = null, musicBus = null, silentEl = null;
  const S = { muted: false };

  // WAV câm 0,1 giây (8 kHz, 8-bit) để kích hoạt phiên phát media trên iOS
  const SILENT_WAV = 'data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSADAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';

  function ac() {
    try {
      if (!ctx) {
        const C = root.AudioContext || root.webkitAudioContext; if (!C) return null;
        ctx = new C();
        const comp = ctx.createDynamicsCompressor();
        master = ctx.createGain(); master.gain.value = S.muted ? 0 : 1;
        sfxBus = ctx.createGain(); sfxBus.gain.value = .9;
        musicBus = ctx.createGain(); musicBus.gain.value = 0;
        sfxBus.connect(master); musicBus.connect(master); master.connect(comp).connect(ctx.destination);
      }
      if (ctx.state !== 'running') ctx.resume().catch(() => {});
      return ctx;
    } catch (e) { return null; }
  }

  function unlock() {
    const a = ac(); if (!a) return;
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* Safari < 17 */ }
    try { // bộ đệm câm: cách mở khóa kinh điển cho iOS cũ
      const b = a.createBuffer(1, 1, 22050), s = a.createBufferSource(); s.buffer = b; s.connect(a.destination); s.start(0);
    } catch (e) { /* bỏ qua */ }
    if (!silentEl) {
      try {
        silentEl = document.createElement('audio');
        silentEl.src = SILENT_WAV; silentEl.loop = true; silentEl.setAttribute('playsinline', ''); silentEl.volume = 0.01;
        silentEl.play().catch(() => { silentEl = null; });
      } catch (e) { silentEl = null; }
    }
    if (pendingMood && !S.muted) startMusic(pendingMood);
  }
  // mở khóa ở mọi thao tác đầu tiên
  ['pointerdown', 'touchend', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, unlock, { capture: true, passive: true }));
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend().catch(() => {});
    else ctx.resume().catch(() => {});
  });

  function out(dest) { return dest || sfxBus; }
  function noise(len, band, low, gain = .6, curve = 2) {
    const a = ac(); if (!a || S.muted) return;
    const t = a.currentTime, n = Math.max(1, Math.floor(a.sampleRate * len));
    const buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, curve);
    const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    src.buffer = buf; f.type = 'bandpass'; f.frequency.value = band; f.Q.value = .8; g.gain.value = gain;
    src.connect(f).connect(g).connect(out()); src.start(t);
    if (low) tone(low, .14, 'sine', gain * 1.2, low * .5);
  }
  function tone(freq, len, type = 'sine', gain = .3, to = null, delay = 0, dest) {
    const a = ac(); if (!a || S.muted) return;
    const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + len);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + len);
    o.connect(g).connect(out(dest)); o.start(t); o.stop(t + len + .03);
  }

  S.hit = (evil) => { noise(.16, 900 + Math.random() * 900, evil ? 120 : 190, evil ? .9 : .7); };
  S.crit = () => { noise(.3, 600, 90, .9, 1.4); tone(880, .25, 'square', .08, 220); };
  S.miss = () => noise(.2, 3200, 0, .3, .6);
  S.keng = () => { tone(1320, .35, 'triangle', .22); tone(1980, .25, 'sine', .1); };
  S.tear = () => noise(.35, 2200, 0, .5, 1.2);
  S.gong = () => { tone(110, 1.4, 'sine', .45, 90); tone(220, 1, 'triangle', .12, 180); tone(330, .8, 'sine', .07); };
  S.coin = () => { tone(1320, .08, 'square', .07); tone(1760, .18, 'square', .07, null, .08); };
  S.bad = () => { tone(300, .35, 'sawtooth', .15, 120); };
  S.win = () => [523, 659, 784, 1046].forEach((f, i) => tone(f, .25, 'triangle', .16, null, i * .11));
  S.lose = () => [392, 330, 262].forEach((f, i) => tone(f, .35, 'triangle', .15, null, i * .16));
  // tiếng "bộp" trầm chồng lên tiếng dép: to và trầm dần theo combo (lvl 0–1), thêm tiếng nện khi combo chẵn 10
  S.thump = (lvl = 0, big = false) => { tone(150 - lvl * 30, .13, 'sine', .55 + lvl * .35, 42); noise(.07, 260, 0, .45 + lvl * .3, 3); if (big) tone(68, .32, 'sine', .7, 32); };
  S.shake = () => noise(.08, 1500 + Math.random() * 800, 0, .3, 1);
  S.heart = () => { tone(62, .16, 'sine', .55, 40); tone(58, .14, 'sine', .4, 38, .2); };
  S.whisper = () => { tone(660, .9, 'sine', .06, 520); tone(990, .7, 'sine', .035, 880, .1); };
  S.cut = () => { noise(.25, 2600, 0, .5, .8); tone(220, .2, 'sawtooth', .07, 110); };
  S.page = () => noise(.18, 4000, 0, .2, 2.5);
  S.click = () => tone(880, .06, 'triangle', .08);
  // tiếng đập theo chất liệu vũ khí
  S.hitKind = (k, evil) => {
    switch (k) {
      case 'kimloai': tone(620 + Math.random() * 200, .3, 'triangle', .22, 520); noise(.1, 2400, 0, .4, 1.6); break;
      case 'go': noise(.12, 700 + Math.random() * 300, 160, .8, 2.2); tone(240, .09, 'square', .08, 180); break;
      case 'da': noise(.2, 400, 90, .9, 1.4); break;
      case 'bong': noise(.18, 500, 0, .5, 1.2); break;
      case 'giay_bao': noise(.14, 3000, 0, .45, 1.8); break;
      case 'nhua': noise(.1, 1600, 220, .6, 2); tone(500, .08, 'sine', .1, 900); break;
      case 'rau': noise(.16, 900, 120, .7, 1); tone(180, .12, 'sine', .15, 90); break;
      case 'cao_su': tone(900 + Math.random() * 300, .22, 'sawtooth', .12, 1500); tone(1400, .15, 'square', .05, 700, .08); break;
      default: S.hit(evil);
    }
    if (evil) tone(90, .15, 'sine', .3, 60);
  };
  S.unlock = unlock;

  /* ---------- nhạc nền tổng hợp ---------- */
  // ngũ cung Việt (đô - rê - fa - sol - la), mỗi không khí một nhịp & âm sắc
  const MOODS = {
    hem: { bpm: 92, root: 220, scale: [0, 2, 5, 7, 9], lead: 'triangle', bass: true, vol: .16, pattern: [0, 2, 4, 2, 3, -1, 1, -1, 0, 2, 4, 5, 3, -1, 2, -1] },
    round: { bpm: 132, root: 247, scale: [0, 2, 5, 7, 9], lead: 'square', bass: true, vol: .09, pattern: [0, 2, 3, 4, 3, 2, 0, -1, 4, 3, 2, 0, 1, 2, 0, -1] },
    dark: { bpm: 60, root: 147, scale: [0, 1, 5, 7, 8], lead: 'sine', bass: false, vol: .14, pattern: [0, -1, -1, 2, -1, -1, 1, -1, 0, -1, -1, 3, -1, -1, 2, -1] }
  };
  let mood = null, pendingMood = null, step = 0, timer = 0, ducked = false;
  function startMusic(m) {
    const a = ac(); if (!a) { pendingMood = m; return; }
    pendingMood = m;
    if (mood === m && timer) return;
    stopTimer(); mood = m; step = 0;
    if (a.state !== 'running' || S.muted) return; // sẽ chạy sau khi mở khóa
    musicBus.gain.cancelScheduledValues(a.currentTime);
    musicBus.gain.setTargetAtTime(ducked ? MOODS[m].vol * .25 : MOODS[m].vol, a.currentTime, .4);
    const M = MOODS[m], beat = 60 / M.bpm / 2;
    timer = setInterval(() => {
      if (!ctx || ctx.state !== 'running' || S.muted) return;
      const p = M.pattern[step % M.pattern.length];
      if (p >= 0) {
        const oct = p >= M.scale.length ? 2 : 1, deg = M.scale[p % M.scale.length];
        tone(M.root * oct * Math.pow(2, deg / 12), beat * 1.8, M.lead, .5, null, 0, musicBus);
      }
      if (M.bass && step % 4 === 0) tone(M.root / 2 * Math.pow(2, M.scale[(step / 4) % 2 ? 3 : 0] / 12), beat * 3.5, 'sine', .7, null, 0, musicBus);
      if (m === 'round' && step % 2 === 1) noise(.05, 6000, 0, .12, 3); // hi-hat
      step++;
    }, beat * 1000);
  }
  function stopTimer() { clearInterval(timer); timer = 0; }
  S.music = m => { if (!m) { stopTimer(); mood = null; pendingMood = null; if (musicBus && ctx) musicBus.gain.setTargetAtTime(0, ctx.currentTime, .2); return; } startMusic(m); };
  S.duck = on => { ducked = on; if (!ctx || !mood) return; musicBus.gain.setTargetAtTime(on ? MOODS[mood].vol * .25 : MOODS[mood].vol, ctx.currentTime, .25); };
  S.setMuted = on => {
    S.muted = on;
    if (ctx) master.gain.setTargetAtTime(on ? 0 : 1, ctx.currentTime, .05);
    if (!on && pendingMood) { mood = null; startMusic(pendingMood); }
  };
  S.state = () => ({ ctx: ctx ? ctx.state : 'none', mood, playing: !!timer, muted: S.muted, silentEl: !!silentEl });

  root.Sfx = S;
})(this);
