/* Một lượt đập 60 giây — bố cục theo mockup màn chơi: tường hẻm, sân gạch, ghế đỏ bày mâm, hình nhân giữa sân,
   tay cầm dép ở góc dưới, thanh ĐỔI DÉP | DỪNG TAY.
   Trụ cột: muốn điểm thì đập tiếp, muốn sự thật thì dừng tay. Mỗi lượt có 2 lời thì thầm; chạm vào sân khi đang thì thầm = cắt lời.
   BẢN NGHIỆP BÁO (khó): né nhanh hơn + báo hiệu ngắn hơn, kiểu né thứ hai và vật ném từ lượt 2, vùng đập hẹp hơn,
   thanh NGHIỆP (đầy = thua lượt), nghe trọn lời gột nghiệp, 10 giây cuối "cơn giận" điểm ×2. */
(function (root) {
  const $ = (s, el = document) => el.querySelector(s);
  const ROUND_TIME = 60;
  const X_MIN = 100, X_MAX = 300; // vị trí hình nhân theo đơn vị 0–400 bề ngang sân
  const DIFF = [ // Nghiệp Báo, theo số lượt đã chơi với con đó
    { gap: [2, 2.8], fake: .15, hold: 1.1, tele: .32, mix: 0, chain: 0, throwGap: null, fly: 0 },
    { gap: [1.4, 2.1], fake: .25, hold: 1.2, tele: .27, mix: .35, chain: .15, throwGap: [7, 10], fly: 1.35 },
    { gap: [1, 1.6], fake: .35, hold: 1.3, tele: .22, mix: .45, chain: .3, throwGap: [4.5, 7], fly: 1.1 }
  ];
  const DUR = { side: .36, duck: .8, shield: 1.2, fade: .7 };
  const KARMA = { miss: 3, keng: 8, struck: 15, cut: 10, heard: -30, decay: 2.5 }; // thanh 0–100, cân bằng bằng mô phỏng (docs/NGHIEP_BAO.md)
  const RAGE_AT = 10, RAGE_GAP = .7, RAGE_PTS = 2; // 10 giây cuối
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const multHard = c => c >= 50 ? 4 : c >= 30 ? 3 : c >= 15 ? 2 : c >= 6 ? 1.5 : 1;
  const multNormal = c => c >= 35 ? 3 : c >= 20 ? 2 : c >= 10 ? 1.5 : 1;
  /* Hai chế độ chơi. 'thuong' = độ khó của bản gốc: né thưa, báo hiệu dài, vùng đập rộng, không nghiệp, không chỉ tiêu,
     không vật ném, không cơn giận cuối. 'kho' = Nghiệp Báo. Chọn ở trang đầu hoặc Cài đặt (State.S.mode). */
  const MODES = {
    thuong: {
      diff: [
        { gap: [3, 4], fake: 0, hold: 1, tele: .4, mix: 0, chain: 0, throwGap: null, fly: 0 },
        { gap: [2.2, 3], fake: .1, hold: 1.1, tele: .4, mix: 0, chain: 0, throwGap: null, fly: 0 },
        { gap: [1.6, 2.4], fake: .25, hold: 1.2, tele: .4, mix: 0, chain: 0, throwGap: null, fly: 0 }
      ],
      comboGap: .8, mult: multNormal, hit: { sx: .14, sy: .04, pad: 10 }, karma: false, quota: false, rage: false
    },
    kho: { diff: DIFF, comboGap: .6, mult: multHard, hit: { sx: .2, sy: .08, pad: 2 }, karma: true, quota: true, rage: true }
  };
  const modeOf = () => State.S.mode === 'kho' ? 'kho' : 'thuong';
  let mult = multHard; // gán theo chế độ khi bắt đầu lượt
  const HARD = STORY.HARD;
  const quotaOf = r => r < 3 ? HARD.quota[r] : 0;
  const weaponOf = () => STORY.ITEMS.weapons.find(x => x.id === State.S.slipper) || STORY.ITEMS.weapons[0];
  const handImg = w => w.id === 'r1c1' ? `<img src="img/play/hand_slipper.webp" class="hand-main" alt="" draggable="false">` : wImg(w);
  const wImg = (w, cls = '') => `<img src="${Art.weaponImg(w.id)}" class="${cls}" alt="" draggable="false">`;

  let R = null;

  function whisperPlan(d, r) {
    const S = State.S;
    if (r < 3) return [0, 1].map(i => ({ r, i, text: d.whispers[r][i] }));
    const all = [];
    d.whispers.forEach((pair, rr) => pair.forEach((text, i) => all.push({ r: rr, i, text })));
    const un = all.filter(w => !S.heard[State.heardKey(d.id, w.r, w.i)]);
    const pool = un.length ? un : all;
    const out = [];
    while (out.length < 2 && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    return out;
  }

  // tải trước mọi khung của hình nhân để lần đầu đổi tư thế không bị chớp trống
  const preloaded = new Set();
  function preload(d) {
    if (preloaded.has(d.id)) return;
    preloaded.add(d.id);
    const L = d.look || {}, files = new Set();
    for (const k in L) [].concat(L[k]).forEach(f => typeof f === 'string' && files.add(f));
    (L.tiers || []).forEach(f => files.add(f + '_idle'));
    files.forEach(f => { const im = new Image(); im.decoding = 'async'; im.src = Art.CHAR(f); });
  }

  function start(d, onEnd) {
    preload(d);
    const r = State.roundsOf(d.id);
    const mode = modeOf(), cfg = MODES[mode];
    mult = cfg.mult;
    const diff = cfg.diff[Math.min(r, 2)];
    R = {
      d, r, diff, onEnd, t: 0, last: performance.now(), raf: 0, over: false, paused: false,
      score: 0, hits: 0, misses: 0, combo: 0, maxCombo: 0, lastHit: -9, taps: 0,
      x: 200, tx: 200, face: 1, op: 1, state: 'idle', stateEnd: 0, nextDodge: rnd(1.5, 2.5), pose: '', poseLock: 0, runI: 0,
      plan: whisperPlan(d, r), wTimes: [rnd(14, 22), rnd(34, 44)], wIdx: 0, w: null,
      heard: [], cut: 0, lastTaunt: 0, nextBeat: 0, slow: 1,
      mode, cfg, hd: HARD.dolls[d.id] || {}, quota: cfg.quota ? quotaOf(r) : 0, quotaHit: false, comboClock: 9,
      karma: 0, karmaMax: 0, rage: false, projs: [], swats: 0, struck: 0,
      nextThrow: diff.throwGap ? rnd(3.5, 5) : Infinity,
      freeze: 0, kick: 0, kickY: 0, kickR: 0
    };
    render();
    setPose('base');
    say(pick(d.taunts), 1.4);
    banner(State.S.total === 0 ? 'CHẠM VÀO HÌNH NHÂN ĐỂ ĐẬP!' : R.quota ? `CHỈ TIÊU ${R.quota.toLocaleString('vi-VN')}` : 'ĐẬP!');
    Sfx.gong(); Sfx.music('round');
    State.log('round_start', { doll: d.id, n: r + 1, mode });
    R.raf = requestAnimationFrame(loop);
    R.iv = setInterval(tick, 100);
  }

  function render() {
    const { d, r } = R, sl = weaponOf();
    const P = n => `img/play/${n}.webp`, pi = (n, cls, alt = '') => `<img src="${P(n)}" class="${cls}" alt="${alt}" draggable="false">`;
    // bố cục theo mockup 5e894635…: nền hẻm, ghế đỏ bày mâm, hình nhân lơ lửng giữa sân, hai gối người chơi + tay cầm dép, thanh ĐỔI DÉP | DỪNG TAY
    $('#app').innerHTML = `<div class="screen play play-v4 hard">
      <div class="stage" id="stage" style="background-image:url(${P('bg')})">
        ${pi('stool', 'p-stool')}${pi('tray', 'p-tray')}
        <div class="r-mover" id="mover">${pi('shadow', 'p-shadow')}${Art.dollHTML(d, { tier: r, id: 'doll' })}<div class="h-shield" aria-hidden="true">HỒ SƠ</div></div>
        <div class="bubble" id="bubble"></div>
        <div class="taunt" id="taunt"></div>
        <div class="fx" id="fx"></div>
        <div class="slip-rest" id="slipRest">${handImg(sl)}</div>
        ${pi('knee_l', 'p-knee-l')}${pi('knee_r', 'p-knee-r')}
        <div class="slip" id="slip">${handImg(sl)}</div>
        ${State.S.total === 0 ? `<div class="tap-finger" id="finger">${Art.img('hand-point')}</div>` : ''}
      </div>
      <div class="hud">
        <div class="hud-score"><div class="p-plaque p-score" style="background-image:url(${P('plaque_score')})"><small>ĐIỂM</small><span class="score" id="score">0</span></div>
          <div class="p-plaque p-combo" id="comboBox" style="background-image:url(${P('plaque_combo')})"><span class="combo" id="combo">COMBO × 0</span></div></div>
        <div class="hud-mid"><div class="p-plaque p-time" style="background-image:url(${P('plaque_time')})"><span class="timer-txt" id="timeTxt">01:00</span></div>
          <div class="bar time"><i id="timeBar"></i></div><b class="hud-name">${d.name}</b>
          ${R.cfg.karma ? '<div class="karma" id="karma"><i id="karmaBar"></i><span>NGHIỆP</span></div>' : ''}
          ${R.quota ? `<div class="quota" id="quota">🎯 ${R.quota.toLocaleString('vi-VN')}</div>` : ''}</div>
        <button class="p-pause" id="pauseBtn" aria-label="Tạm dừng">${pi('btn_pause', '')}</button>
      </div>
      <div class="r-bar p-bar">
        <button id="swapBtn" aria-label="Đổi dép">${pi('btn_doi_dep', '')}</button>
        <button id="stopBtn" aria-label="Dừng tay">${pi('btn_dung_tay', '')}</button>
      </div>
    </div>`;
    const stage = $('#stage');
    stage.addEventListener('pointerdown', e => { e.preventDefault(); tap(e); });
    $('#pauseBtn').addEventListener('pointerdown', e => { e.stopPropagation(); pause(true); });
    $('#swapBtn').addEventListener('click', e => { e.stopPropagation(); swapSlipper(); });
    $('#stopBtn').addEventListener('click', e => { e.stopPropagation(); stopHand(); });
    document.addEventListener('visibilitychange', onHide);
  }
  const onHide = () => { if (document.hidden && R && !R.over) pause(true); };

  /* ---------- tư thế hình nhân (ảnh theo thiết kế) ---------- */
  function setPose(p, ms = 0) {
    if (!R) return;
    if (ms) R.poseLock = R.t + ms / 1000;
    else if (R.t < R.poseLock) return;
    const d = R.d, f = Art.frame(d, Art.hasPose(d, p) ? p : 'base', R.runI, R.r);
    const key = p + f;
    const doll = $('#doll'); if (!doll) return;
    doll.dataset.pose = p;
    if (R.pose === key) return;
    R.pose = key;
    const img = doll.querySelector('.rdoll-img');
    img.src = Art.CHAR(f);
    img.style.height = Art.lyingOf(f) * 100 + '%';
  }
  // chạy: lật qua 8 khung hoạt ảnh trong lúc né
  function stepRun(t) {
    const doll = $('#doll');
    if (!doll || doll.dataset.pose !== 'run' || t >= R.poseLock || t - (R.runT || 0) < .1) return;
    R.runT = t; R.runI++;
    const f = Art.frame(R.d, 'run', R.runI);
    doll.querySelector('.rdoll-img').src = Art.CHAR(f); R.pose = 'run' + f;
  }
  const basePose = () => R.hits >= 60 ? 'hurt' : 'base';
  const dollRect = () => {
    const r = $('#doll .rdoll-img')?.getBoundingClientRect(); if (!r) return null;
    const sx = r.width * R.cfg.hit.sx, sy = r.height * R.cfg.hit.sy; // ảnh có viền hiệu ứng, thu hẹp vùng đập theo chế độ
    return { left: r.left + sx, right: r.right - sx, top: r.top + sy, bottom: r.bottom, width: r.width - 2 * sx, height: r.height - sy };
  };

  /* ---------- vòng lặp ---------- */
  // đồng hồ theo thời gian thật; gọi từ khung hình và từ bộ đếm dự phòng (khi trình duyệt hãm rAF)
  function tick() {
    if (!R || R.over) return;
    const now = performance.now(), dt = Math.min(.1, (now - R.last) / 1000); R.last = now;
    if (!R.paused && dt > 0) update(dt * R.slow, dt);
  }
  function loop() {
    tick();
    if (R && !R.over) R.raf = requestAnimationFrame(loop);
  }

  function update(dt, realDt) {
    R.t += dt;
    const t = R.t, left = Math.max(0, ROUND_TIME - t);
    $('#timeBar').style.width = (left / ROUND_TIME * 100) + '%';
    const sec = Math.ceil(left); $('#timeTxt').textContent = String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');
    $('#timeBar').parentElement.classList.toggle('low', left < 10);
    // đồng hồ combo chỉ chạy khi hình nhân đập được: chờ nó né xong thì vẫn giữ combo, đập vào khoảng trống mới mất
    if (R.state === 'idle' || R.state === 'tele') R.comboClock += dt;
    if (R.combo && R.comboClock > R.cfg.comboGap) { R.combo = 0; paintCombo(); }

    // nghiệp tự vơi dần
    if (R.karma > 0) addKarma(-KARMA.decay * dt);
    if (R.over) return;

    // cơn giận cuối
    if (R.cfg.rage && !R.rage && left <= RAGE_AT) {
      R.rage = true; $('#stage').classList.add('rage');
      banner(STORY.UI.rage, 1500); Sfx.crit(); State.buzz('medium');
      if (R.state === 'idle') R.nextDodge = Math.min(R.nextDodge, t + .5);
    }

    // thì thầm
    if (!R.w && R.wIdx < R.plan.length && t >= R.wTimes[R.wIdx] && (R.state === 'idle' || R.state === 'tele')) beginWhisper();
    if (R.w) stepWhisper(realDt);

    // vật ném (từ lượt 2): không ném khi đang thì thầm, nhưng vật đã bay thì vẫn bay
    if (!R.w && t >= R.nextThrow && R.state === 'idle') throwThing();
    stepProjs(t);
    if (R.over) return;

    // né
    if (!R.w) {
      if (R.state === 'idle' && t >= R.nextDodge) {
        const tele = R.rage ? R.diff.tele * .85 : R.diff.tele;
        R.state = 'tele'; R.stateEnd = t + tele; setPose('tele', tele * 1000);
        $('#doll').classList.add('tele');
      } else if (R.state === 'tele' && t >= R.stateEnd) {
        $('#doll').classList.remove('tele');
        if (Math.random() < R.diff.fake) toIdle(); else dodge();
      } else if (R.state !== 'idle' && R.state !== 'tele' && t >= R.stateEnd) endDodge();
    }

    // di chuyển mượt; chạy thì đổi khung chạy
    // khựng hình chỉ là hình ảnh: hình nhân đứng yên ở thế bị hất, còn đồng hồ và luật chơi vẫn chạy (không làm lệch chỉ tiêu)
    const frozen = performance.now() < R.freeze;
    const k = Math.min(1, dt * (R.state === 'side' ? 9 : 12));
    stepRun(t);
    if (!frozen) R.x += (R.tx - R.x) * k;
    const bob = Math.sin(t * 5) * 1.2, tilt = Math.sin(t * 2.3) * 2;
    // bị hất sau nhát đập, hồi về nhanh
    const kd = frozen ? 0 : Math.min(1, realDt * 16); R.kick -= R.kick * kd; R.kickY -= R.kickY * kd; R.kickR -= R.kickR * kd;
    const mv = $('#mover');
    mv.style.left = (R.x / 4) + '%';
    mv.style.transform = `translate(calc(-50% + ${R.kick.toFixed(1)}px), ${(bob + R.kickY).toFixed(1)}px) rotate(${(tilt + R.kickR).toFixed(2)}deg) scaleX(${R.face})`;
    mv.style.opacity = R.op;
    const fg = $('#finger');
    if (fg) { const h = dollRect(), st = $('#stage').getBoundingClientRect(); if (h) { fg.style.left = ((h.left + h.right) / 2 - st.left) + 'px'; fg.style.top = ((h.top + h.bottom) / 2 - st.top) + 'px'; } }

    if (left <= 0) finish();
  }

  function dodge() {
    // từ lượt 2, xen kẽ kiểu né thứ hai để người chơi không đọc trước được
    const kind = R.hd.dodge2 && Math.random() < R.diff.mix ? R.hd.dodge2 : R.d.dodge, t = R.t, hold = R.diff.hold;
    if (kind === 'side' || kind === 'fade' || kind === 'duck') puff();
    R.state = kind;
    const doll = $('#doll');
    if (kind === 'side') {
      const dir = R.x < 160 ? 1 : R.x > 240 ? -1 : (Math.random() < .5 ? -1 : 1);
      R.tx = Math.max(X_MIN, Math.min(X_MAX, R.x + dir * rnd(90, 140)));
      R.face = -dir; R.runI = 0; R.runT = t; setPose('run', 520);
      R.stateEnd = t + DUR.side; Sfx.shake();
    } else if (kind === 'duck') {
      doll.classList.add('ducking'); setPose('duck', DUR.duck * hold * 1000); R.stateEnd = t + DUR.duck * hold; Sfx.shake();
    } else if (kind === 'shield') {
      doll.classList.add('shielding'); R.stateEnd = t + DUR.shield * hold;
    } else if (kind === 'fade') {
      R.op = .08; R.stateEnd = t + DUR.fade * hold;
    }
  }
  function endDodge() {
    const kind = R.state, doll = $('#doll');
    if (kind === 'duck') doll.classList.remove('ducking');
    if (kind === 'shield') doll.classList.remove('shielding');
    if (kind === 'fade') {
      let nx; do { nx = rnd(X_MIN, X_MAX); } while (Math.abs(nx - R.x) < 70);
      R.x = R.tx = nx; R.op = 1;
    }
    toIdle();
  }
  function toIdle() {
    R.state = 'idle';
    // lượt 3+: đôi khi né liền hai lần
    R.nextDodge = R.t + (Math.random() < R.diff.chain ? rnd(.3, .45) : rnd(...R.diff.gap) * (R.rage ? RAGE_GAP : 1));
    $('#doll')?.classList.remove('tele');
    setTimeout(() => { if (R && R.state === 'idle') R.face = 1; }, 400);
    setPose(basePose());
  }

  /* ---------- thì thầm ---------- */
  function beginWhisper() {
    const w = R.plan[R.wIdx++];
    // đưa hình nhân về trạng thái thường, đứng yên để nói
    const doll = $('#doll');
    doll.classList.remove('tele', 'shielding', 'ducking'); R.op = 1; R.state = 'idle'; R.face = 1;
    const first = !State.S.seen.s04;
    const dur = Math.max(2.6, Math.min(4.6, 1.2 + w.text.length * .055));
    R.w = { ...w, start: R.t, dur, shown: 0, first, done: false };
    R.slow = first ? .5 : 1;
    R.poseLock = 0; setPose('talk');
    const b = $('#bubble');
    b.className = 'bubble on';
    const face = R.d.look && R.d.look.face ? `<img class="w-face" src="${Art.CHAR(R.d.look.face)}" alt="">` : '';
    b.innerHTML = `<span class="w-name">${face}${R.d.name}</span><span class="w-txt"></span>`;
    placeBubble();
    $('#stage').classList.add('hush');
    $('#stopBtn').classList.add('glow');
    if (first) $('#stage').insertAdjacentHTML('beforeend', `<div class="stop-hint" id="stopHint">✋ ${STORY.UI.stopHint}</div>`);
    $('#taunt')?.classList.remove('on');
    Sfx.whisper(); Sfx.duck(true); R.nextBeat = 0;
  }
  function placeBubble() {
    const b = $('#bubble'), st = $('#stage').getBoundingClientRect(), hit = dollRect();
    if (!hit) return;
    const cx = (hit.left + hit.right) / 2 - st.left;
    b.style.left = Math.max(12, Math.min(st.width - 232, cx - 110)) + 'px';
    // neo theo đáy (ngay trên đầu hình nhân) để chữ dài ra thì bong bóng phình lên, không đè mặt; không lên quá HUD
    b.style.top = 'auto';
    b.style.bottom = Math.min(st.height - 150, st.bottom - hit.top + 8) + 'px';
  }
  function stepWhisper(dt) {
    const w = R.w; if (w.done) return;
    placeBubble(); // bám theo hình nhân (đổi tư thế, bị hất, lơ lửng) để bong bóng không che mặt
    w.el = (w.el || 0) + dt;
    const n = Math.min(w.text.length, Math.ceil(w.text.length * w.el / w.dur));
    if (n !== w.shown) { w.shown = n; $('#bubble .w-txt').textContent = w.text.slice(0, n); }
    R.nextBeat -= dt;
    if (R.nextBeat <= 0) { Sfx.heart(); R.nextBeat = .85; }
    if (w.el >= w.dur) endWhisper(true);
  }
  function endWhisper(heard) {
    const w = R.w; if (!w || w.done) return;
    w.done = true;
    const key = State.heardKey(R.d.id, w.r, w.i);
    const b = $('#bubble');
    if (heard) {
      State.S.heard[key] = 1; R.heard.push(key);
      b.classList.add('heard');
      $('#bubble .w-txt').textContent = w.text;
      b.insertAdjacentHTML('beforeend', `<span class="w-ok">✓ đã nghe${R.cfg.karma ? ' · nghiệp vơi' : ''}</span>`);
      State.buzz('medium');
      addKarma(KARMA.heard);
    } else {
      R.cut++;
      b.classList.add('torn');
      $('#bubble .w-txt').textContent = w.text.slice(0, w.shown) + '▒▒▒';
      Sfx.cut(); State.buzz('heavy');
      if (!R.over) addKarma(KARMA.cut);
    }
    State.log('whisper', { doll: R.d.id, key, res: heard ? 'heard' : 'cut', t: +R.t.toFixed(1), stopBtn: !!w.stopBtn });
    if (w.first) { State.S.seen.s04 = 1; $('#stopHint')?.remove(); }
    State.save();
    R.slow = 1; Sfx.duck(false);
    $('#stage').classList.remove('hush');
    $('#stopBtn')?.classList.remove('glow', 'on');
    setTimeout(() => { if (b) b.className = 'bubble'; }, heard ? 1500 : 800);
    R.w = null;
    R.nextDodge = R.t + rnd(.8, 1.4);
    setPose(heard ? 'talk' : 'angry', 1100);
  }

  /* ---------- nút dưới: ĐỔI DÉP / DỪNG TAY ---------- */
  // Dừng tay: khi hình nhân đang thì thầm thì hạ dép xuống (không cắt lời); lúc khác là tạm dừng.
  function stopHand() {
    if (!R || R.over) return;
    if (R.w && !R.w.done) { R.w.stopBtn = true; $('#stopBtn').classList.add('on'); $('#slipRest')?.classList.add('down'); return; }
    pause(true);
  }
  function swapSlipper() {
    if (!R || R.over) return;
    pause(true, true);
    const list = STORY.ITEMS.weapons;
    $('.pause-mask').innerHTML = `<div class="pm-title">Đổi vũ khí</div>
      <div class="swap-grid">${list.map(x => `<button class="swap-it ${x.id === State.S.slipper ? 'on' : ''}" data-id="${x.id}">${wImg(x)}<b>${x.name}</b></button>`).join('')}</div>
      <button class="btn gold" id="resume">▶ Đập tiếp</button>`;
    document.querySelectorAll('.swap-it').forEach(b => b.onclick = () => {
      State.S.slipper = b.dataset.id; State.save(); State.log('item', { tab: 'dep', id: b.dataset.id, inRound: true });
      const sl = weaponOf();
      $('#slip').innerHTML = handImg(sl); $('#slipRest').innerHTML = handImg(sl);
      document.querySelectorAll('.swap-it').forEach(x => x.classList.toggle('on', x === b));
      Sfx.coin();
    });
    $('#resume').onclick = () => { R.last = performance.now(); pause(false); };
  }

  /* ---------- chạm ---------- */
  function tap(e) {
    if (!R || R.over || R.paused) return;
    Sfx.unlock();
    R.taps++;
    const st = $('#stage').getBoundingClientRect();
    const px = e.clientX - st.left, py = e.clientY - st.top;
    swing(px, py);
    if (R.w && !R.w.done) endWhisper(false);
    if (R.over) return;
    if (swat(px, py)) return;

    const hit = dollRect(), pad = R.cfg.hit.pad;
    const inside = hit && e.clientX >= hit.left - pad && e.clientX <= hit.right + pad && e.clientY >= hit.top - pad && e.clientY <= hit.bottom + pad;
    const hidden = R.state === 'duck' || R.state === 'fade';
    if (!inside || hidden) return miss(px, py);
    if (R.state === 'shield') {
      R.combo = 0; paintCombo(); Sfx.keng(); State.buzz('medium');
      pop(STORY.UI.shieldWord, px, py, 'keng');
      addKarma(KARMA.keng);
      return;
    }
    // trúng
    const t = R.t;
    R.combo = R.comboClock <= R.cfg.comboGap ? R.combo + 1 : 1;
    R.comboClock = 0;
    R.lastHit = t; R.hits++; R.maxCombo = Math.max(R.maxCombo, R.combo);
    if (R.hits === 6) $('#finger')?.remove();
    const m = mult(R.combo), pts = Math.round(10 * m * (R.rage ? RAGE_PTS : 1));
    addScore(pts);
    paintCombo();
    Sfx.hitKind(weaponOf().snd, R.combo >= 20); State.buzz(R.combo >= 20 ? 'medium' : 'light');
    const lvl = impact(px, py);
    pop(R.hits % 6 === 0 ? pick(STORY.UI.hitWords) : '+' + pts, px, py, R.hits % 6 === 0 ? 'big' : m >= 3 ? 'hot' : m >= 2 ? 'warm' : '');
    if (R.hits % 6 === 0) fxImg('effect_hit_1', px, py, 120, [{ opacity: 1, transform: 'translate(-50%,-50%) scale(.5)' }, { opacity: 0, transform: 'translate(-50%,-50%) scale(1.25)' }], 380);
    shards(px, py, 5 + Math.round(lvl * 6) + (R.combo % 10 === 0 ? 6 : 0));
    const doll = $('#doll'); doll.classList.remove('hit-anim'); void doll.offsetWidth; doll.classList.add('hit-anim');
    if (!R.w && R.state === 'idle') { if (Art.hasPose(R.d, 'hit') && R.hits % 2 === 0) { R.runI++; setPose('hit', 180); } else setPose(basePose()); }
    if (R.combo && R.combo % 10 === 0) { burst(px, py); fxImg('effect_star', px + 40, py - 60, 80, [{ opacity: 1, transform: 'translate(-50%,-50%) rotate(0)' }, { opacity: 0, transform: 'translate(-50%,-90%) rotate(40deg)' }], 650); }
    if (R.combo && R.combo % 10 === 0) Sfx.crit(); // rung màn đã nằm trong impact()
    if (!R.w && R.hits % 14 === 0) { say(pick(R.d.taunts), 1); if (Art.hasPose(R.d, 'taunt')) setPose('taunt', 700); }
  }
  function miss(px, py) {
    R.misses++; R.combo = 0; paintCombo();
    Sfx.miss(); pop('trượt', px, py, 'miss');
    addKarma(KARMA.miss);
    if (R.over) return;
    if (R.t - (R.lastHut || -9) > 1.6) { R.lastHut = R.t; hutNe(); }
    if (!R.w && R.t - R.lastTaunt > 2.5 && Math.random() < .35) { say(pick(R.d.taunts), 1); if (Art.hasPose(R.d, 'happy')) setPose('happy', 600); }
  }
  function paintCombo() {
    const c = $('#combo'); if (!c) return;
    const m = mult(R.combo);
    c.textContent = `COMBO × ${R.combo}${m > 1 ? ` · x${m}` : ''}`;
    $('#comboBox')?.classList.toggle('on', R.combo >= 2);
    c.classList.toggle('hot', R.combo >= 30);
  }
  function addScore(pts) {
    R.score += pts;
    $('#score').textContent = R.score.toLocaleString('vi-VN');
    if (R.quota && !R.quotaHit && R.score >= R.quota) {
      R.quotaHit = true; $('#quota')?.classList.add('ok');
      banner(STORY.UI.quotaOk, 1100); Sfx.coin();
    }
  }

  /* ---------- NGHIỆP ---------- */
  function addKarma(v) {
    if (!R || R.over || !R.cfg.karma) return;
    R.karma = Math.max(0, Math.min(100, R.karma + v));
    R.karmaMax = Math.max(R.karmaMax, R.karma);
    const bar = $('#karmaBar'), box = $('#karma');
    if (bar) bar.style.width = R.karma + '%';
    if (box) { box.classList.toggle('warn', R.karma >= 70); if (v > 0) { box.classList.remove('bump'); void box.offsetWidth; box.classList.add('bump'); } }
    if (R.karma >= 100) finish('karma');
  }

  /* ---------- VẬT NÉM (lượt 2+) ---------- */
  // hình nhân ném lời đồn / KPI / giấy nợ… về phía tay người chơi. Chạm trúng để gạt; để rơi trúng tay = mất combo + nghiệp.
  function throwThing() {
    const h = dollRect(), st = $('#stage').getBoundingClientRect(); if (!h) return;
    const x0 = (h.left + h.right) / 2 - st.left, y0 = h.top - st.top + h.height * .3;
    const x1 = st.width * rnd(.22, .78), y1 = st.height * .8;
    const el = document.createElement('div');
    el.className = 'proj'; el.textContent = R.hd.throw || 'LỜI ĐỒN';
    $('#fx').appendChild(el);
    const dur = R.diff.fly * (R.rage ? .85 : 1);
    R.projs.push({ el, x0, y0, x1, y1, t0: R.t, dur, x: x0, y: y0 });
    R.nextThrow = R.t + rnd(...R.diff.throwGap) * (R.rage ? .7 : 1);
    if (Art.hasPose(R.d, 'taunt')) setPose('taunt', 400);
    if (R.hd.throwLine) say(R.hd.throwLine, .9);
    Sfx.shake();
  }
  function stepProjs(t) {
    for (const p of R.projs.slice()) {
      const k = Math.min(1, (t - p.t0) / p.dur), e = k * k; // rơi nhanh dần
      p.x = p.x0 + (p.x1 - p.x0) * k;
      p.y = p.y0 + (p.y1 - p.y0) * e - Math.sin(k * Math.PI) * 60;
      const s = .95 + k * .55;
      p.el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%,-50%) scale(${s.toFixed(2)}) rotate(${(Math.sin(k * 14) * 16).toFixed(0)}deg)`;
      if (k >= 1) struck(p);
      if (!R || R.over) return;
    }
  }
  function swat(px, py) {
    const p = R.projs.find(q => Math.hypot(q.x - px, q.y - py) < 48);
    if (!p) return false;
    dropProj(p);
    R.swats++;
    pop(STORY.UI.swat, px, py, 'big');
    addScore(Math.round(30 * (R.rage ? RAGE_PTS : 1)));
    burst(px, py); Sfx.keng(); State.buzz('medium');
    return true;
  }
  function struck(p) {
    dropProj(p);
    R.struck++; R.combo = 0; paintCombo();
    pop(STORY.UI.hurt, p.x1, p.y1 - 30, 'keng');
    const st = $('#stage');
    st.classList.remove('struck'); void st.offsetWidth; st.classList.add('struck');
    st.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(8px,-5px)' }, { transform: 'translate(-7px,4px)' }, { transform: 'none' }], { duration: 220 });
    Sfx.cut(); State.buzz('heavy');
    addKarma(KARMA.struck);
  }
  function dropProj(p) {
    R.projs.splice(R.projs.indexOf(p), 1);
    p.el.classList.add('gone'); setTimeout(() => p.el.remove(), 250);
  }

  /* ---------- hiệu ứng ---------- */
  // bụi và vệt chuyển động ở chỗ hình nhân vừa đứng
  function puff() {
    const hit = dollRect(), st = $('#stage').getBoundingClientRect();
    if (!hit) return;
    const x = (hit.left + hit.right) / 2 - st.left, y = hit.bottom - st.top - 30;
    fxImg('dust', x, y, 110, [{ opacity: .95, transform: 'translate(-50%,-50%) scale(.6)' }, { opacity: 0, transform: 'translate(-50%,-60%) scale(1.3)' }], 600);
    fxImg('motion-arcs', x + 60, y - 80, 40, [{ opacity: 1 }, { opacity: 0 }], 400);
  }
  // "HỤT NÈ CON!" + vệt quất cạnh hình nhân (như mockup)
  function hutNe() {
    const h = dollRect(), st = $('#stage').getBoundingClientRect(); if (!h) return;
    const cx = (h.left + h.right) / 2 - st.left, cy = h.top - st.top;
    fxImg2('img/play/txt_hut.webp', cx - h.width * .55, cy + 20, 92, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.6) rotate(-8deg)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.05) rotate(-8deg)', offset: .2 }, { opacity: 1, offset: .8 }, { opacity: 0 }], 1100);
    fxImg2('img/play/arc' + (1 + Math.floor(Math.random() * 4)) + '.webp', cx + h.width * .45, cy + h.height * .3, 60, [{ opacity: 1 }, { opacity: 0 }], 450);
    fxImg2('img/play/arc2.webp', cx - h.width * .2, h.bottom - st.top - 10, 46, [{ opacity: 1 }, { opacity: 0 }], 450);
  }
  function fxImg2(src, x, y, w, frames, ms) {
    const el = document.createElement('img');
    el.src = src; el.className = 'fx-img'; el.style.cssText = `left:${x}px;top:${y}px;width:${w}px`;
    $('#fx')?.appendChild(el); el.animate(frames, { duration: ms, easing: 'ease-out', fill: 'forwards' }); setTimeout(() => el.remove(), ms + 30);
  }
  function burst(x, y) {
    fxImg('burst-top', x, y - 30, 130, [{ opacity: 1, transform: 'translate(-50%,-50%) scale(.4) rotate(-10deg)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.1)', offset: .4 }, { opacity: 0, transform: 'translate(-50%,-50%) scale(1.3)' }], 450);
  }
  function fxImg(name, x, y, w, frames, ms) {
    const el = document.createElement('img');
    el.src = Art.IMG(name); el.className = 'fx-img'; el.style.cssText = `left:${x}px;top:${y}px;width:${w}px`;
    $('#fx')?.appendChild(el);
    el.animate(frames, { duration: ms, easing: 'ease-out', fill: 'forwards' });
    setTimeout(() => el.remove(), ms + 30);
  }
  function swing(x, y) {
    const s = $('#slip');
    s.style.left = (x - 42) + 'px'; s.style.top = (y - 40) + 'px'; // đế dép nằm ở góc trên-trái ảnh tay cầm dép
    s.classList.remove('go'); void s.offsetWidth; s.classList.add('go');
    const rest = $('#slipRest');
    if (rest) { rest.classList.add('hide'); clearTimeout(swing.to); swing.to = setTimeout(() => rest.classList.remove('hide'), 260); }
  }
  function pop(txt, x, y, cls) {
    const el = document.createElement('div');
    el.className = 'pop ' + (cls || ''); el.textContent = txt;
    el.style.left = x + 'px'; el.style.top = y + 'px';
    $('#fx').appendChild(el); setTimeout(() => el.remove(), 700);
  }
  /* ---------- lực đập: khựng hình, hất, lóe trắng, rung màn, vòng sóng, tiếng bộp. Trả về mức combo 0–1 ---------- */
  function impact(px, py) {
    const lvl = Math.min(1, R.combo / 30), big = R.combo >= 10 && R.combo % 10 === 0;
    const st = $('#stage'), sr = st.getBoundingClientRect(), h = dollRect();
    // khựng hình (hit-stop): cả cảnh đứng lại vài chục ms, nhát đập có "lực"
    const ms = big ? 95 : 40 + lvl * 25;
    R.freeze = performance.now() + ms;
    st.classList.add('frozen'); clearTimeout(impact.ft); impact.ft = setTimeout(() => st.classList.remove('frozen'), ms);
    // hất ra xa chỗ bị đập
    const cx = h ? (h.left + h.right) / 2 - sr.left : px, dir = px < cx ? 1 : -1;
    R.kick = dir * (7 + 7 * lvl) * (big ? 1.4 : 1); R.kickY = 7 + 6 * lvl; R.kickR = dir * (7 + 7 * lvl) * (big ? 1.4 : 1); // tối đa ~20px: vẫn nằm trong vùng đập
    // lóe trắng
    const img = $('#doll .rdoll-img');
    if (img) { img.classList.add('flash'); clearTimeout(impact.fl); impact.fl = setTimeout(() => img.classList.remove('flash'), 70); }
    // rung màn, mạnh dần theo combo
    const a = 2.5 + 4 * lvl + (big ? 5 : 0);
    st.animate([{ transform: 'none' }, { transform: `translate(${-a}px, ${a * .6}px)` }, { transform: `translate(${a * .7}px, ${-a * .5}px)` }, { transform: `translate(${-a * .3}px, ${a * .2}px)` }, { transform: 'none' }], { duration: big ? 220 : 130 });
    // vòng sóng va chạm
    const ring = document.createElement('i');
    ring.className = 'hit-ring' + (big ? ' big' : ''); ring.style.left = px + 'px'; ring.style.top = py + 'px';
    $('#fx')?.appendChild(ring); setTimeout(() => ring.remove(), 360);
    Sfx.thump(lvl, big);
    return lvl;
  }
  function shards(x, y, n = 5) {
    const fx = $('#fx');
    for (let i = 0; i < n; i++) {
      const el = document.createElement('i');
      el.className = 'shard'; el.style.left = x + 'px'; el.style.top = y + 'px';
      el.style.background = pick(['#c8261f', '#6a3a8f', '#fbf6ea', '#f5d36e']);
      fx.appendChild(el);
      const a = Math.random() * Math.PI * 2, d = rnd(30, 80);
      el.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d + 40}px) rotate(${rnd(-300, 300)}deg)`, opacity: 0 }], { duration: 520, easing: 'cubic-bezier(.2,.7,.4,1)' });
      setTimeout(() => el.remove(), 540);
    }
  }
  function banner(txt, ms = 1300) {
    const el = document.createElement('div');
    el.className = 'banner'; el.textContent = txt;
    $('#stage')?.appendChild(el); setTimeout(() => el.remove(), ms);
  }
  function say(txt, sec) {
    if (!R) return;
    R.lastTaunt = R.t;
    const el = $('#taunt'); if (!el) return;
    el.textContent = txt; el.classList.add('on');
    const h = dollRect(), st = $('#stage').getBoundingClientRect();
    if (h) { el.style.left = Math.max(90, Math.min(st.width - 90, (h.left + h.right) / 2 - st.left)) + 'px'; el.style.top = Math.max(84, h.top - st.top - 44) + 'px'; }
    clearTimeout(say.to); say.to = setTimeout(() => el.classList.remove('on'), sec * 1000);
  }

  /* ---------- tạm dừng / kết thúc ---------- */
  function pause(on, bare) {
    if (!R || R.over) return;
    R.paused = on;
    $('.pause-mask')?.remove();
    if (on) {
      $('#app').insertAdjacentHTML('beforeend', `<div class="pause-mask">${bare ? '' : `<div class="pm-title">Tạm dừng</div>
        <button class="btn gold big" id="resume">▶ Đập tiếp</button>
        <button class="btn ghost" id="quit">Bỏ lượt này</button><p class="muted" style="color:#fff5d6">Bỏ lượt sẽ không nhận mảnh ký ức.</p>`}</div>`);
      if (bare) return;
      $('#resume').onclick = () => { R.last = performance.now(); pause(false); };
      $('#quit').onclick = () => { const cb = R.onEnd; State.log('quit_round', { doll: R.d.id, t: +R.t.toFixed(1) }); cleanup(); cb(null); };
    }
  }
  // reason: 'time' (hết giờ) | 'karma' (nghiệp đầy, thua lượt)
  function finish(reason = 'time') {
    if (R.over) return;
    R.over = true;
    if (R.w && !R.w.done) endWhisper(false);
    R.projs.slice().forEach(dropProj);
    const burst = reason === 'karma';
    Sfx.gong(); State.buzz('heavy');
    if (burst) { $('#stage').classList.add('karma-burst'); Sfx.cut(); }
    banner(burst ? STORY.UI.karmaBurst : 'HẾT GIỜ!', 2000);
    R.poseLock = 0; setPose(burst ? (Art.hasPose(R.d, 'taunt') ? 'taunt' : 'base') : Art.hasPose(R.d, 'ko') && R.hits >= 40 ? 'ko' : basePose());
    if (burst) say(pick(R.d.taunts), 2);
    const passed = !burst && R.score >= R.quota;
    const res = { doll: R.d.id, n: R.r + 1, score: R.score, hits: R.hits, misses: R.misses, maxCombo: R.maxCombo, heard: R.heard.slice(), cut: R.cut, taps: R.taps,
      reason, quota: R.quota, passed, mode: R.mode, karmaMax: Math.round(R.karmaMax), swats: R.swats, struck: R.struck, t: +R.t.toFixed(1) };
    State.log('round_end', res);
    const cb = R.onEnd;
    setTimeout(() => { cleanup(); cb(res); }, burst ? 1800 : 1300);
  }
  function cleanup() {
    if (!R) return;
    cancelAnimationFrame(R.raf); clearInterval(R.iv); Sfx.duck(false);
    document.removeEventListener('visibilitychange', onHide);
    $('.pause-mask')?.remove();
    R.over = true;
    R = null;
  }

  root.Round = { start, ROUND_TIME, debug: () => R };
})(this);
