/* Gửi sự kiện chơi ẩn danh về Supabase để cân bằng độ khó (dashboard: admin/).
   - Chỉ chạy khi js/config.js có url + anonKey, và người chơi không tắt trong Cài đặt.
   - Ẩn danh: một mã ngẫu nhiên cho mỗi trình duyệt, không tên, không email. Tên tự đặt cho hình nhân không bao giờ được gửi.
   - Gom thành lô (10 giây hoặc 20 sự kiện), gửi bù lần sau nếu mất mạng (giữ tối đa 500 sự kiện). */
(function (root) {
  const CFG = root.DTN_TELEMETRY || {};
  const ON = !!(CFG.url && CFG.anonKey);
  const APP = 'nghiepbao-0.3';
  const QKEY = 'dtn-telemetry-queue', PKEY = 'dtn-player-id';
  const MAX_Q = 500, BATCH = 20, EVERY = 10000;
  // sự kiện gửi lên và các trường được phép (lọc theo danh sách trắng để không lọt dữ liệu lạ)
  const ALLOW = {
    session_start: [],
    scene: ['id'],
    intro_skip: ['at'],
    npc: ['id', 'choice'],
    round_start: ['doll', 'n'],
    round_end: ['doll', 'n', 'score', 'hits', 'misses', 'maxCombo', 'cut', 'taps', 'reason', 'quota', 'passed', 'karmaMax', 'swats', 'struck', 't', 'heardN'],
    whisper: ['doll', 'key', 'res', 't', 'stopBtn'],
    quit_round: ['doll', 't'],
    ending: ['id'],
    rename: ['doll', 'custom'],
    item: ['tab', 'id', 'inRound']
  };

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* riêng tư / đầy */ } }
  };
  function playerId() {
    let id = store.get(PKEY);
    if (!id) {
      id = (root.crypto && crypto.randomUUID) ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });
      store.set(PKEY, id);
    }
    return id;
  }
  let queue = [];
  try { queue = JSON.parse(store.get(QKEY) || '[]'); } catch (e) { queue = []; }
  let sending = false, timer = 0;

  const enabled = () => ON && root.State && root.State.S.telemetry !== false;

  function track(ev, data = {}) {
    if (!enabled() || !ALLOW[ev]) return;
    const d = {};
    for (const k of ALLOW[ev]) if (data[k] !== undefined) d[k] = data[k];
    if (ev === 'round_end' && Array.isArray(data.heard)) d.heardN = data.heard.length;
    queue.push({ player: playerId(), session: (root.State && root.State.S.sid) || 0, ev, data: d, app: APP, client_t: Date.now() });
    if (queue.length > MAX_Q) queue.splice(0, queue.length - MAX_Q);
    store.set(QKEY, JSON.stringify(queue));
    if (queue.length >= BATCH) flush();
    else if (!timer) timer = setTimeout(flush, EVERY);
  }

  async function flush(keepalive = false) {
    clearTimeout(timer); timer = 0;
    if (!enabled() || sending || !queue.length) return;
    sending = true;
    const batch = queue.slice(0, 100);
    try {
      const r = await fetch(CFG.url.replace(/\/$/, '') + '/rest/v1/events', {
        method: 'POST', keepalive,
        headers: { apikey: CFG.anonKey, Authorization: 'Bearer ' + CFG.anonKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify(batch)
      });
      if (r.ok) { queue.splice(0, batch.length); store.set(QKEY, JSON.stringify(queue)); }
      else if (r.status >= 400 && r.status < 500 && r.status !== 429) { queue.splice(0, batch.length); store.set(QKEY, JSON.stringify(queue)); } // lô hỏng: bỏ, không thử lại mãi
    } catch (e) { /* mất mạng / bị chặn: để lần sau */ }
    sending = false;
    if (queue.length && !timer) timer = setTimeout(flush, EVERY);
  }

  if (ON) {
    document.addEventListener('visibilitychange', () => { if (document.hidden) flush(true); });
    root.addEventListener('pagehide', () => flush(true));
    if (queue.length) timer = setTimeout(flush, 3000);
  }
  root.Telemetry = { track, flush, configured: ON };
})(this);
