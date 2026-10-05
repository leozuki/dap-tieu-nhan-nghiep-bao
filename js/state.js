/* Lưu tiến trình (localStorage), nhật ký sự kiện cho playtest, rung.
   Bản Nghiệp Báo lưu riêng (khóa khác) để không đè tiến trình bản thường. */
(function (root) {
  const KEY = 'dtn-nghiepbao-v1';
  // kết thúc ẩn cần nghe trọn bao nhiêu lời: Nghiệp Báo 90%, Bình thường 80%
  const hiddenRatio = () => S.mode === 'kho' ? .9 : .8;
  const LOG_MAX = 3000;
  const fresh = () => ({
    rounds: {}, best: {}, heard: {}, seen: {}, endings: {},
    total: 0, muted: false, haptics: true, playerName: '', sid: 0, log: [],
    slipper: 'r1c1', tray: 'thuong', names: {}, mode: 'thuong'
  });
  let S;
  try { S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = fresh(); }

  if (!/^r\d+c\d+$/.test(S.slipper)) S.slipper = 'r1c1'; // tiến trình cũ (bộ dép v1)
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* hết chỗ / chế độ riêng tư */ } }
  function log(ev, data = {}) {
    S.log.push({ ev, t: Date.now(), sid: S.sid, ...data });
    if (S.log.length > LOG_MAX) S.log.splice(0, S.log.length - LOG_MAX);
    save();
    root.Telemetry && root.Telemetry.track(ev, data); // gửi ẩn danh nếu đã cấu hình (js/config.js) và người chơi không tắt
  }
  function reset() { const keep = { muted: S.muted, haptics: S.haptics, log: S.log, sid: S.sid, slipper: S.slipper, tray: S.tray, names: S.names, telemetry: S.telemetry, mode: S.mode }; S = Object.assign(fresh(), keep); root.State.S = S; save(); applyNames(); }

  const roundsOf = id => S.rounds[id] || 0;
  const heardKey = (id, r, i) => `${id}-${r}-${i}`;
  const heardCount = () => Object.keys(S.heard).length;
  const storyDone = () => STORY.DOLLS.every(d => roundsOf(d.id) >= 3);
  const hiddenOpen = () => heardCount() >= Math.ceil(STORY.DOLLS.reduce((n, d) => n + d.whispers.flat().length, 0) * hiddenRatio()) && S.seen.s05 && S.seen.s06;

  /* Tên tự đặt cho hình nhân: chỉ lưu trên máy, không ghi vào nhật ký playtest.
     Thay tên gốc trong thẻ tên, lời khấn, lời kể, mảnh ký ức và kết cục; giữ bản gốc để đổi lại được. */
  const NAME_MAX = 16;
  const cleanName = v => String(v || '').replace(/[<>"&]/g, '').replace(/\s+/g, ' ').trim().slice(0, NAME_MAX);
  const reEsc = v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function applyNames() {
    STORY.DOLLS.forEach(d => {
      if (!d.orig) d.orig = JSON.parse(JSON.stringify({ name: d.name, intro: d.intro, vows: d.vows, frags: d.frags, end: d.end, thay: d.thay || [] }));
      const o = d.orig, name = S.names[d.id] || o.name;
      const sub = t => t && name !== o.name ? t.replace(new RegExp(reEsc(o.name), 'g'), name) : t;
      d.name = name; d.intro = sub(o.intro); d.vows = o.vows.map(sub); d.end = sub(o.end); d.thay = o.thay.map(sub);
      d.frags = o.frags.map(f => ({ ...f, text: sub(f.text), title: sub(f.title) }));
    });
  }
  function setName(id, v) {
    const n = cleanName(v), d = STORY.DOLLS.find(x => x.id === id);
    if (!d) return;
    if (!n || n === (d.orig || d).name) delete S.names[id]; else S.names[id] = n;
    save(); applyNames();
  }
  applyNames();

  // Capacitor Haptics trên iOS, navigator.vibrate trên Android/web
  function buzz(kind = 'light') {
    if (!S.haptics) return;
    const H = root.Capacitor?.Plugins?.Haptics;
    try {
      if (H) H.impact({ style: kind === 'heavy' ? 'HEAVY' : kind === 'medium' ? 'MEDIUM' : 'LIGHT' });
      else navigator.vibrate?.(kind === 'heavy' ? 40 : kind === 'medium' ? 20 : 8);
    } catch (e) { /* bỏ qua */ }
  }

  S.sid = (S.sid || 0) + 1; save();
  root.State = { S, save, log, reset, roundsOf, heardKey, heardCount, storyDone, hiddenOpen, buzz, hiddenRatio, setName, applyNames, NAME_MAX };
  root.Telemetry && root.Telemetry.track('session_start');
})(this);
