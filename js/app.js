/* Điều hướng các màn: trang đầu, hẻm (bàn đỏ), hình nhân, mâm cúng, kết quả, cảnh truyện, kết thúc, hồ sơ, cài đặt.
   Bản Nghiệp Báo: lượt chỉ được tính (mở mảnh, tăng tiến trình) khi đủ chỉ tiêu và không bị nghiệp quật. */
(function (root) {
  const $ = (s, el = document) => el.querySelector(s);
  const app = $('#app');
  const { DOLLS, SCENES, ENDINGS, UI } = STORY;
  const byId = id => DOLLS.find(d => d.id === id);
  const S = () => State.S;
  const esc = Art.esc;
  const fmt = s => esc(s).replace(/~~(.+?)~~/g, '<s>$1</s>');
  const paras = s => s.split('\n\n').map(p => `<p>${fmt(p).replace(/\n/g, '<br>')}</p>`).join('');
  const VERSION = '0.2.0-nghiepbao';
  const { HARD } = STORY;
  const SLOTS = [44, 122, 200, 278, 356]; // vị trí 5 hình nhân trên bàn
  const TOTAL_W = DOLLS.reduce((n, d) => n + d.whispers.flat().length, 0);
  const TIERS = [2500, 3300, 4000]; // ngưỡng Đã tay / Hả giận / Trút sạch (người chơi giỏi ≈ 2.900–3.400)
  const hiddenN = () => Math.ceil(TOTAL_W * State.hiddenRatio());
  const isHard = () => S().mode === 'kho';
  // chọn chế độ: Bình thường (độ khó gốc) / Nghiệp Báo (thanh nghiệp, chỉ tiêu, vật ném)
  const modePicker = () => `<div class="mode-pick" role="radiogroup" aria-label="Chế độ chơi">
    <button role="radio" aria-checked="${!isHard()}" data-mode="thuong"><b>Bình thường</b><small>Đập cho đã tay</small></button>
    <button role="radio" aria-checked="${isHard()}" data-mode="kho"><b>☯ Nghiệp Báo</b><small>Đập bừa là nghiệp quật</small></button></div>`;
  function bindModePicker(after) {
    app.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => {
      Sfx.unlock(); S().mode = b.dataset.mode; State.save(); State.log('mode', { mode: b.dataset.mode }); Sfx.page(); after();
    }));
  }

  Sfx.setMuted(S().muted);

  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.style.display = 'block';
    clearTimeout(toast.t); toast.t = setTimeout(() => t.style.display = 'none', 2200);
  }
  function show(html, cls = '') { app.className = cls; app.innerHTML = html; app.scrollTop = 0; }
  function on(sel, fn) { app.querySelectorAll(sel).forEach(el => el.addEventListener('click', e => { Sfx.unlock(); fn(e, el); })); }
  const tierOf = d => S().seen.s07 ? 4 : Math.min(3, State.roundsOf(d.id));
  const skipBtn = `<button class="img-btn skip" data-act="skip" aria-label="Bỏ qua">${Art.img('btn-bo-qua')}</button>`;
  function bindSkip(next) {
    const b = app.querySelector('[data-act=skip]'); if (!b) return;
    b.addEventListener('click', e => { e.stopPropagation(); next.all(); b.remove(); });
  }
  const dollSVG = (d, opt, vb = '-100 -320 200 330') => `<svg viewBox="${vb}" preserveAspectRatio="xMidYMax meet">${Art.doll(d, opt)}</svg>`;

  // màn nhỏ: câu mới có thể nằm dưới mép màn hình -> cuộn tới nó
  const reveal = el => { try { el && el.scrollIntoView({ block: 'nearest' }); } catch (e) { /* trình duyệt cũ */ } };

  /* Lần lượt từng câu, chạm để qua câu tiếp theo */
  function lines(list, el, done, cls = '') {
    let i = 0, fin = false;
    const next = () => {
      if (fin) return;
      el.insertAdjacentHTML('beforeend', `<p class="line ${cls}">${fmt(list[i++])}</p>`);
      reveal(el.lastElementChild);
      Sfx.page();
      if (i >= list.length) { fin = true; setTimeout(done, 400); }
    };
    next.all = () => { while (!fin) next(); };
    next();
    return next;
  }

  const SCREENS = {
    /* ================= TRANG ĐẦU ================= */
    title() {
      show(`<div class="screen title-screen">
        <div class="topbar"><span class="grow"></span><button class="icon-btn" data-act="settings" aria-label="Cài đặt">⚙️</button></div>
        <div class="logo"><div class="logo-sm">Trò chơi xả stress</div>${Art.img('logo', 'logo-img', 'Đập Tiểu Nhân')}${isHard() ? '<div class="hard-badge">☯ BẢN NGHIỆP BÁO</div>' : ''}<div class="tag">Đập xả stress. <b>“Sự thật”</b> stress hơn.</div></div>
        <div class="hero hero-v2">${Art.img('mam_cung_full', 'hero-altar')}<div class="hero-dolls">${DOLLS.map((d, i) => Art.dollHTML(d, { pose: i % 2 ? 'taunt' : 'base' })).join('')}</div><div class="hero-table"></div></div>
        <button class="img-btn pulse" data-act="go" aria-label="Vào hẻm">${Art.img('btn-vao-hem')}</button>
        ${modePicker()}
        ${isHard() ? rulesHTML() : ''}
        <p class="note">${esc(UI.contentNote)}</p>
      </div>`, 'is-title');
      on('[data-act=settings]', () => go('settings'));
      bindModePicker(() => go('title'));
      on('[data-act=go]', () => {
        if (!S().seen.intro) return go('intro', () => scene('s01', () => go('hub')));
        if (!S().seen.s01) return scene('s01', () => go('hub'));
        go('hub');
      });
    },

    /* ================= MỞ ĐẦU: giới thiệu câu chuyện ================= */
    // Chạm để hiện từng câu; hết câu của một cảnh thì sang cảnh sau. Chỉ tự hiện lần đầu, xem lại trong Cài đặt.
    intro(then) {
      const L = STORY.INTRO, s = S();
      const rich = t => fmt(t).replace(/&lt;(\/?)b&gt;/g, '<$1b>');
      const art = k => k === 'dolls' ? `<div class="in-dolls">${DOLLS.map((d, i) => Art.dollHTML(d, { pose: i % 2 ? 'taunt' : 'base' })).join('')}</div>`
        : k === 'altar' ? Art.img('mam_cung_full', 'in-altar')
        : k === 'slipper' ? `<img src="img/play/hand_slipper.webp" class="in-slip" alt="" draggable="false">`
        : k === 'night' ? Art.img('alley-street', 'in-bg') + `<img src="${Art.weaponImg('r1c1')}" class="in-night-slip" alt="" draggable="false">`
        : Art.img('alley-street', 'in-bg') + Art.img('sign-hem', 'in-sign');
      const lineHTML = t => t === '{accuse}'
        ? `<ul class="in-accuse line">${DOLLS.map(d => `<li><b>${esc(d.name)}</b> ${esc(d.intro)}</li>`).join('')}</ul>`
        : `<p class="line">${rich(t)}</p>`;
      let k = -1, i = 0, done = false;
      State.log('scene', { id: 'intro' });
      const finish = () => { if (done) return; done = true; s.seen.intro = 1; State.save(); then ? then() : go('title'); };
      const slide = () => {
        k++; i = 0;
        if (k >= L.length) return finish();
        const sl = L[k];
        show(`<div class="screen story intro ${sl.dark ? 'dark' : ''}" id="tapzone">
          <div class="in-art art-${sl.art}">${art(sl.art)}</div>
          <div class="lines" id="lines"></div>
          <div class="in-foot"><span class="in-dots">${L.map((_, j) => `<i class="${j === k ? 'on' : ''}"></i>`).join('')}</span><span class="tap-more" id="more">chạm để tiếp ›</span></div>
          ${skipBtn}
        </div>`, sl.dark ? 'is-dark' : '');
        Sfx.music(sl.dark ? 'dark' : 'hem');
        app.querySelector('[data-act=skip]').addEventListener('click', e => { e.stopPropagation(); State.log('intro_skip', { at: k }); finish(); });
        $('#tapzone').addEventListener('click', next);
        next();
      };
      function next() {
        const sl = L[k];
        if (i >= sl.lines.length) return slide();
        $('#lines').insertAdjacentHTML('beforeend', lineHTML(sl.lines[i++]));
        reveal($('#lines').lastElementChild);
        Sfx.page();
        if (i >= sl.lines.length) $('#more').textContent = k === L.length - 1 ? 'chạm để vào hẻm ›' : 'chạm để tiếp ›';
      }
      slide();
    },

    /* ================= HẺM / BÀN ĐỎ ================= */
    hub() {
      const s = S(), first = s.total === 0;
      const xs = SLOTS;
      const ev = DOLLS.map((d, i) => State.roundsOf(d.id) >= 3 ? `<g transform="translate(${xs[i]} 486) scale(.62)" class="ev">${evidenceSVG(d.frags[2].item)}</g>` : '').join('');
      const dolls = DOLLS.map((d, i) => Art.dollSVGImg(d, { x: xs[i], y: 440, h: 150, tier: tierOf(d), pose: 'base', cls: `pick${first && d.id !== 'batam' ? ' locked' : ''}`, attrs: `data-id="${d.id}"` })).join('');
      const paperOn = s.seen.s05, trashOn = s.seen.s06;
      const hint = first ? `Chạm vào <b>${esc(byId('batam').name)}</b> để bắt đầu.`
        : State.storyDone() && !s.seen.s07 ? 'Có gì đó trên bàn vừa thay đổi…'
        : State.storyDone() ? 'Hình nhân trắng vẫn đang chờ một cái tên.'
        : 'Chọn một hình nhân để đập.';
      show(`<div class="screen hub">
        <div class="hub-stage">
          ${Art.scene({ h: 600, tableY: 440, fit: 'meet', shadow: Math.min(3, s.total / 3), reflect: s.seen.s07,
            inner: Art.sprite('sign-hem', 8, 120, 86) + Art.sprite('lamp-red', 290, 96, 104) + dolls + (first ? Art.sprite('hand-point', 78, 330, 52, 0, 'finger-svg') : ''),
            front: ev + (paperOn ? `<g class="tap-obj" data-obj="paper" transform="translate(66 548) rotate(-8)">${evidenceSVG('paper')}</g>` : (s.total >= 3 ? `<g transform="translate(58 556) rotate(-8) scale(.7)" opacity=".7">${evidenceSVG('paper')}</g>` : ''))
              + (trashOn ? `<g class="tap-obj" data-obj="trash" transform="translate(350 540)"><path d="M-24 -30 h48 l-6 52 h-36Z" fill="#5d6a70" stroke="#3a4448" stroke-width="2"/><rect x="-28" y="-36" width="56" height="8" rx="3" fill="#3a4448"/></g>` : '') })}
          <div class="hub-head"><span class="chip">Hẻm 27</span><span class="chip">🥿 ${s.total} lượt</span><span class="grow"></span><button class="icon-btn" data-act="settings" aria-label="Cài đặt">⚙️</button></div>
        </div>
        <div class="hub-bottom">
          <p class="hint">${hint}</p>
          ${State.storyDone() ? `<button class="btn ${s.seen.s07 ? 'dark' : 'big pulse dark'}" data-act="finale">${s.seen.s07 ? '✎ Tên cuối cùng' : '…'}</button>` : ''}
          <nav class="navbar">
            <button class="img-btn" data-act="home" aria-label="Trang chủ">${Art.img('btn_trang_chu')}</button>
            <button class="btn ghost" data-act="journal">📜 Hồ sơ</button>
            <button class="img-btn" data-act="items" aria-label="Vật phẩm">${Art.img('btn_vat_pham')}</button>
          </nav>
        </div>
      </div>`, 'is-hub');
      app.querySelectorAll('.pick').forEach(g => g.addEventListener('click', () => {
        Sfx.unlock();
        const d = byId(g.dataset.id);
        if (first && d.id !== 'batam') return toast(`Bắt đầu với ${byId('batam').name} nhé.`);
        go('sheet', d);
      }));
      app.querySelectorAll('.tap-obj').forEach(g => g.addEventListener('click', () => g.dataset.obj === 'paper' ? scene('s05', () => go('hub')) : scene('s06', () => go('hub'))));
      on('[data-act=settings]', () => go('settings'));
      on('[data-act=journal]', () => go('journal'));
      on('[data-act=home]', () => go('title'));
      on('[data-act=items]', () => go('items'));
      on('[data-act=finale]', () => s.seen.s07 ? go('final') : go('s07'));
    },

    /* ================= HÌNH NHÂN ================= */
    sheet(d) {
      const r = State.roundsOf(d.id), tier = tierOf(d), s = S();
      const heard = d.whispers.flatMap((p, rr) => p.map((_, i) => s.heard[State.heardKey(d.id, rr, i)] ? 1 : 0)).reduce((a, b) => a + b, 0);
      const frags = d.frags.map((f, i) => i < r
        ? `<div class="frag"><span class="kind">${f.kind}</span>${f.title ? `<b>${esc(f.title)}</b> ` : ''}${esc(f.text)}</div>`
        : `<div class="frag locked"><span class="kind">${f.kind}</span>Lượt ${i + 1}${isHard() ? ` đạt ${HARD.quota[i].toLocaleString('vi-VN')} điểm` : ''} sẽ mở mảnh này.</div>`).join('');
      show(`<div class="screen sheet">
        <div class="topbar"><button class="icon-btn" data-act="back" aria-label="Quay lại">←</button><span class="grow"></span></div>
        <div class="sheet-doll">${Art.dollHTML(d, { tier, pose: 'base' })}</div>
        ${d.look.face ? `<div class="sheet-faces">${['face', 'faceAngry', 'faceScared', 'faceCry'].filter(k => d.look[k]).map(k => `<img src="${Art.CHAR(d.look[k])}" alt="">`).join('')}</div>` : ''}
        <h2 class="sheet-name">${esc(d.name)} <small>· ${esc(d.role)}</small> <button class="name-edit" data-act="rename" aria-label="Sửa tên">✎</button></h2>
        <form class="rename" id="rename" hidden>
          <input class="name-in" id="dn" maxlength="${State.NAME_MAX}" value="${esc(d.name)}" placeholder="${esc(d.orig.name)}" autocomplete="off" enterkeyhint="done" aria-label="Tên trên hình nhân">
          <div class="row"><button type="button" class="btn ghost grow" data-act="orig">Tên gốc</button><button type="submit" class="btn gold grow">✎ Viết tên</button></div>
          <p class="muted center">Tên chỉ lưu trên máy này, chỉ hiện trên hình nhân.</p>
        </form>
        <p class="accuse">“${esc(d.intro)}”</p>
        <div class="row wrap" style="justify-content:center;gap:6px;margin:6px 0 10px">
          <span class="chip">Mảnh ký ức ${Math.min(r, 3)}/3</span>${r < 3 && isHard() ? `<span class="chip quota-chip">🎯 ${HARD.quota[r].toLocaleString('vi-VN')}</span>` : ''}<span class="chip">👂 ${heard}/6 lời</span>${s.best[d.id] ? `<span class="chip gold">🏆 ${s.best[d.id].toLocaleString('vi-VN')}</span>` : ''}
        </div>
        <div class="frags">${frags}</div>
        <button class="btn big" data-act="play" style="margin-top:12px">Bày mâm & đập</button>
      </div>`);
      on('[data-act=back]', () => go('hub'));
      on('[data-act=play]', () => go('altar', d));
      on('[data-act=rename]', () => { const f = $('#rename'); f.hidden = !f.hidden; if (!f.hidden) $('#dn').select(); });
      on('[data-act=orig]', () => { $('#dn').value = d.orig.name; });
      $('#rename').addEventListener('submit', e => {
        e.preventDefault();
        const was = d.name;
        State.setName(d.id, $('#dn').value);
        State.log('rename', { doll: d.id, custom: !!s.names[d.id] }); // không ghi tên vào nhật ký
        Sfx.page(); State.buzz('light');
        if (d.name !== was) toast(`Đã viết tên “${d.name}” lên hình nhân`);
        go('sheet', d);
      });
    },

    /* ================= MÂM CÚNG ================= */
    altar(d) {
      const r = State.roundsOf(d.id), vow = d.vows[Math.min(r, 2)];
      const parts = vow.match(/[^.?!…]+[.?!…]*\s*/g) || [vow];
      const steps = [['incense', 'Thắp nhang'], ['votive-papers', 'Đặt giấy vàng'], ['fruit-plate', 'Bày trái cây']];
      let k = 0;
      show(`<div class="screen altar">
        <div class="topbar"><button class="icon-btn" data-act="back" aria-label="Quay lại">←</button><span class="grow"></span><span class="chip">Lượt ${r + 1}</span></div>
        <h2 class="center">Bày mâm cúng</h2>
        <div class="tray ${S().tray === 'du_le' ? 'full' : ''}">${S().tray === 'du_le' ? Art.img('mam_cung_full', 'deco tray-full') : Art.img('red-banner', 'deco banner-l') + Art.img('oil-lamps', 'deco lamps-r')}<div class="tray-doll">${Art.dollHTML(d, { tier: tierOf(d), pose: 'base' })}</div>
          <div class="tray-items">${steps.map((s, i) => `<span class="ti" id="ti${i}">${Art.img(s[0])}</span>`).join('')}</div></div>
        ${thayHTML(UI.askVow[Math.min(r, 2)])}
        <div class="vow" id="vow"></div>
        ${S().total === 0 ? (isHard() ? '<p class="muted center">Mẹo: đập nhanh nhưng đừng đập bừa. Hình nhân né thì <b>chờ</b>: combo vẫn giữ, đập vào khoảng trống mới mất combo và tăng nghiệp.</p>' : '<p class="muted center">Mẹo: chạm thật nhanh vào hình nhân để giữ combo. Né thì chờ nó hiện lại.</p>') : ''}
        ${r === 1 && isHard() ? `<p class="muted center">Từ lượt này ${esc(d.name)} sẽ né kiểu khác và ném <b>${esc((HARD.dolls[d.id] || {}).throw || 'đồ')}</b> vào tay bạn. Chạm vào để gạt.</p>` : ''}
        <button class="btn big gold" id="step">${steps[0][1]}</button>
      </div>`);
      on('[data-act=back]', () => go('sheet', d));
      const btn = $('#step'), vowEl = $('#vow');
      const per = Math.ceil(parts.length / 3);
      btn.addEventListener('click', () => {
        Sfx.unlock();
        if (k < 3) {
          $('#ti' + k).classList.add('on'); Sfx.page(); State.buzz('light');
          vowEl.innerHTML += parts.slice(k * per, (k + 1) * per).map(p => `<span class="vp">${fmt(p)}</span>`).join('');
          k++;
          if (k < 3) btn.textContent = steps[k][1];
          else { btn.textContent = 'ĐẬP!'; btn.className = 'btn big pulse'; }
        } else {
          Round.start(d, res => go('result', { d, res }));
        }
      });
    },

    /* ================= KẾT QUẢ ================= */
    result({ d, res }) {
      if (!res) return go('hub');
      const s = S(), r = State.roundsOf(d.id);
      if (!res.passed) return failResult(d, res, r);
      const isBest = res.score > (s.best[d.id] || 0);
      if (isBest) s.best[d.id] = res.score;
      const newFrag = r < 3 ? d.frags[r] : null;
      s.rounds[d.id] = r + 1; s.total++;
      State.save();
      const tierIdx = res.score >= TIERS[2] ? 2 : res.score >= TIERS[1] ? 1 : res.score >= TIERS[0] ? 0 : -1;
      const acc = res.hits + res.misses ? Math.round(res.hits / (res.hits + res.misses) * 100) : 0;
      Sfx.win();
      const pose = tierIdx >= 2 ? 'ko' : tierIdx >= 1 ? 'cry' : tierIdx === 0 ? 'hurt' : 'happy';
      show(`<div class="screen result">
        <div class="res-pic">${Art.dollHTML(d, { tier: Math.min(r, 3), pose })}</div>
        <h2 class="center">${tierIdx >= 0 ? UI.tiers[tierIdx] + '!' : 'Hết giờ'}</h2>
        <div class="big-score">${res.score.toLocaleString('vi-VN')}${isBest ? '<span class="chip gold">kỷ lục</span>' : ''}</div>
        <div class="stats"><div><b>${res.hits}</b>nhát</div><div><b>${res.maxCombo}</b>combo</div><div><b>${acc}%</b>trúng</div><div><b>${res.heard.length}/2</b>đã nghe</div></div>
        ${res.mode === 'kho' ? `<p class="muted center">Nghiệp cao nhất ${res.karmaMax}% · gạt ${res.swats} · bị ném trúng ${res.struck}</p>` : ''}
        ${newFrag ? `<div class="frag new"><span class="kind">Mảnh ký ức mới · ${newFrag.kind}</span>
          ${newFrag.item ? `<div class="ev-ico">${Art.item(newFrag.item, 1.1)}</div><b>${esc(newFrag.title)}</b><br>` : ''}${esc(newFrag.text)}</div>`
          : `<div class="frag"><span class="kind">Không có mảnh mới</span>Bạn đã đập đủ ba lượt với ${esc(d.name)}. Lượt thêm chỉ để lấy điểm, và để nghe lại những lời chưa nghe trọn.</div>`}
        ${heardHTML(d, res)}
        ${newFrag && d.thay ? thayHTML(d.thay[r]) : ''}
        ${res.cut ? `<p class="muted center">Bạn đã cắt ngang ${res.cut} lời. Lần sau thử dừng tay xem?</p>` : ''}
        <div class="row" style="margin-top:auto"><button class="btn ghost grow" data-act="again">Đập lại</button><button class="btn grow" data-act="next">Về bàn</button></div>
      </div>`);
      on('[data-act=again]', () => go('altar', d));
      on('[data-act=next]', () => afterRound());
    },

    /* ================= 07 · MỘT GIỌNG, BỐN MIỆNG ================= */
    s07() {
      const sc = SCENES.s07;
      State.log('scene', { id: 's07' });
      show(`<div class="screen story dark" id="tapzone">
        <div class="hub-stage short tall">${Art.scene({ h: 600, tableY: 440, reflect: true, dim: .45,
          inner: DOLLS.map((d, i) => `<g transform="rotate(${[-6, 4, -3, 7, -4][i]} ${SLOTS[i]} 440)">${Art.dollSVGImg(d, { x: SLOTS[i], y: 440, h: 150, tier: 4, pose: 'base' })}</g>`).join('') })}</div>
        <h2 class="center">${sc.title}</h2><div class="lines" id="lines"></div><p class="tap-more" id="more">chạm để tiếp ›</p>${skipBtn}
      </div>`, 'is-dark');
      Sfx.gong();
      const next = lines(sc.lines, $('#lines'), () => {
        $('#more').textContent = '';
        setTimeout(() => {
          S().seen.s07 = 1; State.save();
          $('#lines').insertAdjacentHTML('beforeend', `<h3 class="center" style="margin-top:14px">Họ bây giờ</h3>` + DOLLS.map(d => `<div class="frag dark"><span class="kind">${esc(d.name)}</span>${esc(d.end)}</div>`).join('') +
            `<button class="btn big dark" id="toFinal" style="margin-top:12px">Tiếp</button>`);
          $('#toFinal').onclick = () => go('final');
          reveal($('#toFinal'));
        }, 600);
      });
      bindSkip(next);
      $('#tapzone').addEventListener('click', e => { if (e.target.id !== 'toFinal') next(); });
    },

    /* ================= 08 · TÊN CUỐI CÙNG ================= */
    final() {
      const s = S(), open = State.hiddenOpen(), heard = State.heardCount();
      State.log('scene', { id: 's08' });
      show(`<div class="screen story dark">
        <div class="topbar"><button class="icon-btn" data-act="back" aria-label="Quay lại">←</button></div>
        <h2 class="center">${SCENES.s08.title}</h2>
        <div class="white-doll"><div class="rdoll"><img class="rdoll-img" src="${Art.CHAR(STORY.VY.look.white)}" alt="Hình nhân trắng"></div><span class="pen">🖍️</span><img class="slipper-ico2" src="${Art.weaponImg('r1c1')}" alt=""></div>
        <p class="center">${esc(SCENES.s08.text)}</p>
        <div class="choices">
          <button class="btn dark" data-end="A">🥿 Cầm dép lên</button>
          <button class="btn dark" data-end="B">✋ Đặt dép xuống</button>
          ${open ? '<button class="btn gold" data-end="H">🖍️ Cầm bút đỏ, viết tên mình</button>'
            : `<p class="muted center">🖍️ Cây bút đỏ nằm đó… nhưng bạn chưa hiểu đủ để viết.<br>(cần nghe trọn ${hiddenN()}/${TOTAL_W} lời, đã nghe ${heard}${!s.seen.s05 || !s.seen.s06 ? ', vẫn còn vật chứng chưa xem' : ''})</p>`}
        </div>
      </div>`, 'is-dark');
      on('[data-act=back]', () => go('hub'));
      on('[data-end]', (e, el) => el.dataset.end === 'H' ? go('hidden') : go('ending', el.dataset.end));
    },

    /* ================= KẾT THÚC A / B ================= */
    ending(k) {
      const E = ENDINGS[k];
      State.log('ending', { id: k });
      show(`<div class="screen story dark" id="tapzone"><div class="lines big" id="lines"></div><p class="tap-more" id="more">chạm để tiếp ›</p>${skipBtn}</div>`, 'is-dark');
      const next = lines(E.lines, $('#lines'), () => {
        $('#more').remove();
        S().endings[k] = 1; State.save();
        setTimeout(() => endCard(E.title), 900);
      });
      bindSkip(next);
      $('#tapzone').addEventListener('click', () => next());
    },

    /* ================= KẾT THÚC ẨN: VIẾT TÊN MÌNH ================= */
    hidden() {
      const s = S();
      show(`<div class="screen story dark">
        <h2 class="center">Viết tên mình</h2>
        <div class="white-doll" id="wd"><div class="rdoll"><img class="rdoll-img" src="${Art.CHAR(STORY.VY.look.white)}" alt=""></div></div>
        <input class="name-in" id="nm" maxlength="16" placeholder="tên của bạn" value="${esc(s.playerName)}" autocomplete="off">
        <button class="btn gold big" id="write">🖍️ Viết</button>
      </div>`, 'is-dark');
      $('#write').onclick = () => {
        const name = $('#nm').value.trim() || 'Vy';
        s.playerName = name; State.save(); Sfx.page();
        State.log('ending_hidden_name', { len: name.length });
        hiddenScene(name);
      };
    },

    /* ================= VẬT PHẨM (trang trí, miễn phí trong demo) ================= */
    items(tab = 'dep') {
      const s = S(), I = STORY.ITEMS, isTray = tab === 'mam';
      const list = isTray ? I.trays : I.weapons.filter(w => w.cat === tab);
      const curW = I.weapons.find(w => w.id === s.slipper) || I.weapons[0], curT = I.trays.find(t => t.id === s.tray) || I.trays[0];
      const pic = x => isTray ? Art.img(x.img) : `<img src="${Art.weaponImg(x.id)}" alt="" draggable="false">`;
      show(`<div class="screen items">
        <div class="topbar"><button class="icon-btn" data-act="back" aria-label="Quay lại">←</button><span class="grow"></span><span class="chip">${I.weapons.length} vũ khí</span></div>
        <div class="sign-title">VẬT PHẨM</div>
        <div class="tabs">${I.cats.map(([k, n]) => `<button class="tab ${tab === k ? 'on' : ''}" data-tab="${k}">${n}</button>`).join('')}<button class="tab ${isTray ? 'on' : ''}" data-tab="mam">Mâm cúng</button></div>
        <div class="item-hero">${isTray ? Art.img(curT.img) : `<img src="${Art.weaponImg(curW.id)}" alt="">`}<div><b>${esc(isTray ? curT.name : curW.name)}</b><span class="using">ĐANG DÙNG</span></div></div>
        <div class="item-grid">${list.map(x => `<button class="item-card ${x.id === (isTray ? s.tray : s.slipper) ? 'on' : ''}" data-id="${x.id}">${pic(x)}<b>${esc(x.name)}</b>${x.note ? `<small>${esc(x.note)}</small>` : ''}</button>`).join('')}</div>
        <p class="muted center">Bản demo: dùng thử miễn phí. Vật phẩm chỉ để trang trí, không mua được sự thật.</p>
      </div>`);
      on('[data-act=back]', () => go('hub'));
      on('[data-tab]', (e, el) => go('items', el.dataset.tab));
      on('.item-card', (e, el) => {
        if (isTray) s.tray = el.dataset.id; else { s.slipper = el.dataset.id; Sfx.hitKind((I.weapons.find(w => w.id === el.dataset.id) || {}).snd); }
        State.save(); State.log('item', { tab, id: el.dataset.id }); State.buzz('light');
        if (isTray) Sfx.coin();
        go('items', tab);
      });
    },

    /* ================= HỒ SƠ ================= */
    journal() {
      const s = S();
      const dollBlocks = DOLLS.map(d => {
        const r = State.roundsOf(d.id);
        const ws = d.whispers.flatMap((p, rr) => p.map((t, i) => s.heard[State.heardKey(d.id, rr, i)] ? `<li>“${esc(t)}”</li>` : `<li class="torn">▒▒▒▒▒▒▒▒</li>`)).join('');
        return `<details class="card j" ${r ? 'open' : ''}><summary><b>${esc(d.name)}</b> <span class="muted">· ${r >= 3 ? 3 : r}/3 mảnh</span></summary>
          ${d.frags.map((f, i) => i < r ? `<div class="frag"><span class="kind">${f.kind}</span>${f.title ? `<b>${esc(f.title)}</b> ` : ''}${esc(f.text)}</div>` : `<div class="frag locked"><span class="kind">${f.kind}</span>???</div>`).join('')}
          ${s.seen.s07 ? `<div class="frag dark"><span class="kind">Kết cục</span>${esc(d.end)}</div>` : ''}
          <p class="muted" style="margin:8px 0 2px">Lời thì thầm</p><ul class="ws">${ws}</ul></details>`;
      }).join('');
      const endN = Object.keys(s.endings).length;
      show(`<div class="screen journal">
        <div class="topbar"><button class="icon-btn" data-act="back" aria-label="Quay lại">←</button><h2 class="grow" style="margin:0">Hồ sơ</h2><span class="chip">👂 ${State.heardCount()}/${TOTAL_W}</span></div>
        ${dollBlocks}
        ${s.seen.s05 ? `<div class="card j"><b>Tờ báo</b><pre class="paper">${esc(SCENES.s05.paper)}</pre></div>` : ''}
        ${s.seen.s06 ? `<div class="card j"><b>Thùng rác</b>${SCENES.s06.items.map(it => `<div class="row" style="margin-top:6px">${Art.item(it.icon, .7)}<div><b>${esc(it.name)}</b><br><span class="muted">${esc(it.text)}</span></div></div>`).join('')}</div>` : ''}
        <div class="card j"><b>Kết thúc</b> <span class="muted">${endN}/3</span><div class="row wrap" style="margin-top:6px;gap:6px">${['A', 'B', 'H'].map(k => `<span class="chip ${s.endings[k] ? 'gold' : ''}">${s.endings[k] ? ENDINGS[k].title : '???'}</span>`).join('')}</div></div>
      </div>`);
      on('[data-act=back]', () => go('hub'));
    },

    /* ================= CÀI ĐẶT ================= */
    settings() {
      const s = S();
      const dbg = /debug/.test(location.search + location.hash);
      show(`<div class="screen settings">
        <div class="topbar"><button class="icon-btn" data-act="back" aria-label="Quay lại">←</button><h2 class="grow" style="margin:0">Cài đặt</h2></div>
        <div class="card"><label class="row"><span class="grow">Âm thanh</span><input type="checkbox" id="snd" ${s.muted ? '' : 'checked'}></label>
          <label class="row" style="margin-top:8px"><span class="grow">Rung</span><input type="checkbox" id="hap" ${s.haptics ? 'checked' : ''}></label></div>
        <div class="card"><b>Chế độ chơi</b><p class="muted" style="margin:4px 0 8px">Đổi lúc nào cũng được, áp dụng từ lượt đập tiếp theo. Tiến trình truyện giữ nguyên.</p>${modePicker()}</div>
        ${window.Telemetry && Telemetry.configured ? `<div class="card"><label class="row"><span class="grow">Gửi số liệu chơi ẩn danh</span><input type="checkbox" id="tele" ${s.telemetry === false ? '' : 'checked'}></label>
          <p class="muted" style="margin:6px 0 0">Điểm, số lượt, lời đã nghe… kèm một mã ngẫu nhiên, không có tên hay email, để nhóm làm game cân bằng độ khó.</p></div>` : ''}
        <div class="card"><b>Lưu ý nội dung</b><p class="muted">${esc(UI.contentNote)}</p></div>
        ${helpHTML()}
        <div class="card"><b>Hỗ trợ & góp ý</b><p class="muted" style="margin:4px 0 0">Báo lỗi hoặc góp ý tại trang GitHub của game: <span class="sel">github.com/leozuki/dap-tieu-nhan-nghiep-bao/issues</span></p></div>
        <div class="card"><b>Dữ liệu playtest</b><p class="muted">${s.log.length} sự kiện. Gửi đoạn này cho nhóm phát triển sau khi chơi.</p>
          <button class="btn ghost" id="export">Xuất dữ liệu test</button><textarea id="dump" class="dump" readonly style="display:none"></textarea></div>
        ${dbg ? `<div class="card"><b>Debug</b><div class="row wrap" style="margin-top:6px">
          <button class="btn ghost" data-dbg="r2">Mỗi con 2 lượt</button><button class="btn ghost" data-dbg="r3">Đủ ${DOLLS.length * 3} lượt</button><button class="btn ghost" data-dbg="all">+ nghe đủ ${TOTAL_W}</button></div></div>` : ''}
        <button class="btn ghost" id="replayIntro" style="margin-top:8px">📖 Xem lại phần mở đầu</button>
        <button class="btn ghost" id="reset" style="margin-top:8px">Chơi lại từ đầu</button>
        <p class="muted center" style="margin-top:auto">Đập Tiểu Nhân · bản ${VERSION}</p>
      </div>`);
      on('[data-act=back]', () => go(s.seen.s01 ? 'hub' : 'title'));
      $('#snd').onchange = e => { s.muted = !e.target.checked; Sfx.setMuted(s.muted); State.save(); if (!s.muted) { Sfx.unlock(); Sfx.coin(); } };
      $('#hap').onchange = e => { s.haptics = e.target.checked; State.save(); };
      bindModePicker(() => go('settings'));
      $('#tele') && ($('#tele').onchange = e => { s.telemetry = e.target.checked; State.save(); });
      $('#export').onclick = async () => {
        const txt = JSON.stringify({ app: VERSION, ua: navigator.userAgent, progress: { total: s.total, rounds: s.rounds, heard: State.heardCount(), endings: s.endings }, log: s.log });
        const ta = $('#dump'); ta.style.display = 'block'; ta.value = txt; ta.select();
        try { if (navigator.share) await navigator.share({ title: 'DTN playtest', text: txt }); else { await navigator.clipboard.writeText(txt); toast('Đã chép vào bộ nhớ tạm'); } } catch (e) { /* người dùng hủy */ }
      };
      $('#replayIntro').onclick = () => go('intro', () => go('settings'));
      $('#reset').onclick = () => { if (confirm('Xóa toàn bộ tiến trình?')) { State.reset(); toast('Đã xóa tiến trình'); go('title'); } };
      on('[data-dbg]', (e, el) => {
        const n = el.dataset.dbg === 'r2' ? 2 : 3;
        DOLLS.forEach(d => { s.rounds[d.id] = n; });
        s.total = n * DOLLS.length; s.seen.intro = s.seen.s01 = s.seen.s03 = s.seen.s04 = 1;
        if (n >= 2) s.seen.s05 = 1;
        if (n >= 3) s.seen.s06 = 1;
        if (el.dataset.dbg === 'all') DOLLS.forEach(d => d.whispers.forEach((p, rr) => p.forEach((_, i) => { s.heard[State.heardKey(d.id, rr, i)] = 1; })));
        State.save(); toast('Đã đặt tiến trình test'); go('hub');
      });
    }
  };

  /* ---------- cảnh truyện chung (01, 03, 05, 06) ---------- */
  function scene(id, then) {
    const sc = SCENES[id], s = S();
    Sfx.music(id === 's06' ? 'dark' : 'hem');
    State.log('scene', { id });
    let body = `<div class="lines" id="sceneText" ${sc.npc ? 'style="display:none"' : ''}>${paras(sc.text)}</div>`;
    if (sc.npc) body = `<div class="npc-box"><span class="npc-name">${esc(sc.npc.name)}</span><p id="npcLine">${esc(sc.npc.line)}</p>
      <div class="npc-choices">${sc.npc.choices.map((c, i) => `<button class="npc-choice" data-i="${i}">${esc(c.t)}</button>`).join('')}</div></div>` + body;
    if (id === 's05') body += `<pre class="paper reveal">${esc(sc.paper)}</pre><p class="after">${esc(sc.after)}</p>`;
    if (id === 's06') body += `<div class="trash-items">${sc.items.map((it, i) => `<button class="trash-it" data-i="${i}">${Art.item(it.icon)}<span>${esc(it.name)}</span></button>`).join('')}</div><div id="trashTxt"></div><div class="after" id="after6" style="display:none">${paras(sc.after)}</div>`;
    show(`<div class="screen story">
      ${sc.npc ? `<div class="npc-stage">${Art.img('alley-street', 'npc-bg')}${Art.img('sign-hem', 'npc-sign')}${Art.img(sc.npc.img, 'npc-img', sc.npc.name)}</div>` : ''}
      <h2 class="center">${esc(sc.title)}</h2>${body}
      <button class="btn big" id="cont" style="margin-top:auto">${id === 's01' ? 'Vào bàn' : 'Tiếp'}</button>
    </div>`, id === 's06' ? 'is-dim' : '');
    Sfx.page();
    if (sc.npc) {
      $('#cont').style.visibility = 'hidden';
      app.querySelectorAll('.npc-choice').forEach(b => b.addEventListener('click', () => {
        const c = sc.npc.choices[+b.dataset.i]; Sfx.page();
        State.log('npc', { id, choice: +b.dataset.i });
        app.querySelector('.npc-choices').innerHTML = `<p class="npc-you">— ${esc(c.t)}</p>`;
        $('#npcLine').textContent = c.reply;
        $('#sceneText').style.display = ''; $('#cont').style.visibility = '';
      }));
    }
    if (id === 's06') {
      const seenI = new Set(); $('#cont').style.visibility = 'hidden';
      app.querySelectorAll('.trash-it').forEach(b => b.addEventListener('click', () => {
        const it = sc.items[+b.dataset.i]; seenI.add(b.dataset.i); b.classList.add('on'); Sfx.page();
        $('#trashTxt').innerHTML = `<div class="frag"><b>${esc(it.name)}</b> ${esc(it.text)}</div>`;
        if (seenI.size === sc.items.length) { $('#after6').style.display = ''; $('#cont').style.visibility = ''; }
      }));
    }
    $('#cont').onclick = () => { s.seen[id] = 1; State.save(); then(); };
  }

  // lượt không được tính: nghiệp quật hoặc thiếu chỉ tiêu. Lời đã nghe trọn vẫn được giữ.
  function failResult(d, res, r) {
    const burst = res.reason === 'karma';
    const acc = res.hits + res.misses ? Math.round(res.hits / (res.hits + res.misses) * 100) : 0;
    Sfx.miss();
    show(`<div class="screen result fail">
      <div class="res-pic">${Art.dollHTML(d, { tier: Math.min(r, 3), pose: Art.hasPose(d, 'taunt') ? 'taunt' : 'happy' })}</div>
      <h2 class="center">${burst ? 'Nghiệp quật!' : 'Chưa đủ chỉ tiêu'}</h2>
      <div class="big-score">${res.score.toLocaleString('vi-VN')}${res.quota ? `<small class="need"> / ${res.quota.toLocaleString('vi-VN')}</small>` : ''}</div>
      <div class="stats"><div><b>${res.hits}</b>nhát</div><div><b>${res.maxCombo}</b>combo</div><div><b>${acc}%</b>trúng</div><div><b>${res.heard.length}/2</b>đã nghe</div></div>
      <div class="frag locked"><span class="kind">Lượt không được tính</span>${burst
        ? `Nghiệp đầy ở giây ${Math.floor(res.t)}. Trượt ${res.misses} lần, bị ném trúng ${res.struck} lần${res.cut ? `, cắt ngang ${res.cut} lời` : ''}. Đập bừa thì nghiệp quật lại mình.`
        : `Thiếu ${(res.quota - res.score).toLocaleString('vi-VN')} điểm. Mảnh ký ức vẫn khóa.`}</div>
      ${res.heard.length ? `<p class="muted center">Những lời đã nghe trọn vẫn được ghi vào Hồ sơ.</p>` : ''}
      <div class="row" style="margin-top:auto"><button class="btn ghost grow" data-act="next">Về bàn</button><button class="btn grow" data-act="again">Đập lại</button></div>
    </div>`);
    on('[data-act=again]', () => go('altar', d));
    on('[data-act=next]', () => go('hub'));
  }
  // lời bà thầy (người dẫn chuyện; cảnh 07 lộ ra đó là giọng của chính Vy)
  const thayHTML = t => t ? `<div class="thay"><span class="thay-name">${esc(UI.thay)}</span><p>${esc(t)}</p></div>` : '';
  // những lời thì thầm vừa nghe trọn trong lượt, đọc lại cho rõ
  function heardHTML(d, res) {
    const ws = (res.heard || []).map(k => { const [, rr, i] = k.split('-').map(Number); return d.whispers[rr] && d.whispers[rr][i]; }).filter(Boolean);
    return ws.length ? `<div class="heard-box"><span class="kind">${esc(d.name)} thì thầm</span>${ws.map(w => `<p>“${esc(w)}”</p>`).join('')}</div>` : '';
  }
  // đường dây hỗ trợ tâm lý: trong Cài đặt và ở mọi màn kết thúc. Số hiện thành chữ chọn được, kèm liên kết gọi.
  function helpHTML(compact) {
    const H = UI.help;
    return `<div class="${compact ? 'help compact' : 'card help'}"><b>${esc(H.title)}</b>${H.lines.map(l =>
      `<div class="help-line"><span><b>${esc(l.name)}</b><small>${esc(l.note)}</small></span><a class="help-tel sel" href="tel:${l.tel}">${esc(l.show)}</a></div>`).join('')}
      ${compact ? '' : `<p class="muted" style="margin:6px 0 0">${esc(H.foot)}</p>`}</div>`;
  }
  function rulesHTML() {
    return `<details class="rules card"><summary>Luật bản Nghiệp Báo</summary>${HARD.rules.map(([i, t]) => `<p><span>${i}</span>${t}</p>`).join('')}</details>`;
  }

  // sau mỗi lượt: lần lượt bật các cảnh theo tiến trình
  function afterRound() {
    const s = S();
    if (s.total >= 1 && !s.seen.s03) return scene('s03', afterRound);
    if (s.total >= 5 && !s.seen.s05) return scene('s05', afterRound);
    if (s.total >= 8 && !s.seen.s06) return scene('s06', afterRound);
    if (State.storyDone() && !s.seen.s07) return go('s07');
    go('hub');
  }

  function hiddenScene(name) {
    const H = ENDINGS.H;
    show(`<div class="screen story dark" id="tapzone">
      <div class="white-doll" id="wd"><div class="rdoll"><img class="rdoll-img" src="${Art.CHAR(STORY.VY.look.white)}" alt=""><span class="ntag"><b>${esc(name)}</b></span></div></div>
      <p class="quote">${esc(H.quote)}</p><div class="lines" id="lines"></div><p class="tap-more" id="more">chạm để tiếp ›</p>
    </div>`, 'is-dark');
    const zone = $('#tapzone');
    const next = lines(H.lines, $('#lines'), () => {
      $('#more').remove();
      zone.removeEventListener('click', onTap);
      $('#lines').insertAdjacentHTML('beforeend', '<button class="btn dark" id="lift">🥿 Nhấc dép</button>');
      let tries = 0;
      $('#lift').onclick = () => {
        tries++; Sfx.miss(); State.buzz('heavy');
        $('#wd').animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], { duration: 260 });
        if (tries === 3) {
          $('#lift').remove();
          $('#lines').insertAdjacentHTML('beforeend', '<p class="line">Dép rơi xuống bàn.</p><button class="btn gold big" id="call">📞 Gọi về nhà</button>');
          $('#call').onclick = () => callHome();
        }
      };
    });
    const onTap = () => next();
    zone.addEventListener('click', onTap);
  }
  function callHome() {
    const H = ENDINGS.H;
    Sfx.music('hem');
    show(`<div class="screen story" id="tapzone"><div class="vy-home"><div class="rdoll"><img class="rdoll-img" src="${Art.CHAR(STORY.VY.look.white)}" alt=""><span class="ntag"><b>${esc(S().playerName || 'Vy')}</b></span></div></div><div class="lines big" id="lines"></div><p class="tap-more" id="more">chạm để tiếp ›</p></div>`, 'is-dawn');
    const next = lines(H.call, $('#lines'), () => {
      $('#more').remove();
      S().endings.H = 1; State.save(); State.log('ending', { id: 'H' });
      Sfx.win();
      setTimeout(() => endCard(H.title), 1100);
    });
    $('#tapzone').addEventListener('click', () => next());
  }
  function endCard(title) {
    const n = Object.keys(S().endings).length;
    app.querySelector('.screen').insertAdjacentHTML('beforeend', `<div class="end-card"><div class="muted">Kết thúc</div><h2>${esc(title)}</h2><p>Đã mở ${n}/3 kết thúc</p>
      ${helpHTML(true)}
      <div class="row"><button class="btn ghost grow" id="toJ">📜 Hồ sơ</button><button class="btn grow" id="toH">Về hẻm</button></div></div>`);
    $('#toJ').onclick = () => go('journal');
    $('#toH').onclick = () => go('hub');
  }

  function evidenceSVG(k) {
    const svg = Art.item(k);
    return svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  }

  // nhạc nền theo màn
  const MOOD = { title: 'hem', hub: 'hem', sheet: 'hem', altar: 'hem', result: 'hem', items: 'hem', journal: 'hem', settings: 'hem', s07: 'dark', final: 'dark', ending: 'dark', hidden: 'dark' };
  function go(screen, arg) { if (MOOD[screen]) Sfx.music(MOOD[screen]); SCREENS[screen](arg); }

  // ?shot=<màn>: dựng sẵn một màn với tiến trình mẫu để chụp ảnh cửa hàng (tools/store-shots.sh).
  // Chỉ chạy khi URL có tham số này; không lưu gì vào máy, không gửi số liệu.
  const shot = new URLSearchParams(location.search).get('shot');
  if (shot) setupShot(shot); else go(S().seen.s01 ? 'hub' : 'title');
  function setupShot(name) {
    const s = S(); s.telemetry = false; State.save = () => {};
    document.head.insertAdjacentHTML('beforeend', '<style>#app{max-width:none}</style>'); // ảnh chụp: game giãn hết khung
    Object.assign(s.seen, { intro: 1, s01: 1, s03: 1, s04: 1 });
    const tapDoll = (n, gap = 110) => new Promise(done => { let k = 0; const iv = setInterval(() => {
      const img = document.querySelector('#doll .rdoll-img'), st = document.querySelector('#stage'); if (!img || !st) return;
      const r = img.getBoundingClientRect(); st.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, clientX: r.left + r.width * (k % 2 ? .4 : .6), clientY: r.top + r.height * .45 }));
      if (++k >= n) { clearInterval(iv); done(); } }, gap); });
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    ({
      title() { s.mode = 'thuong'; s.seen = {}; go('title'); },
      intro() { go('intro', () => {}); const z = () => document.querySelector('#tapzone'); setTimeout(() => { z().click(); setTimeout(() => { z().click(); setTimeout(() => z().click(), 150); }, 150); }, 200); },
      hub() { s.mode = 'thuong'; s.total = 3; s.rounds = { batam: 1, sep: 1, dongnghiep: 1 }; go('hub'); },
      async play() {
        s.mode = 'thuong'; s.total = 1; s.rounds = { batam: 1 };
        Round.start(byId('batam'), () => {}); await sleep(500);
        const R = Round.debug(); R.nextDodge = 99; R.wTimes = [R.t + 4.2, 99];
        await tapDoll(16);
      },
      async nghiepbao() {
        s.mode = 'kho'; s.total = 4; s.rounds = { batam: 1, sep: 2 };
        Round.start(byId('sep'), () => {}); await sleep(500);
        const R = Round.debug(); R.nextDodge = 99; R.wTimes = [99, 99]; R.t = 44.5; R.karma = 0;
        await tapDoll(22, 100); R.nextThrow = R.t + .1;
        const st = document.querySelector('#stage').getBoundingClientRect();
        for (let i = 0; i < 9; i++) document.querySelector('#stage').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, clientX: st.left + 24, clientY: st.top + st.height * .55 }));
      },
      result() {
        s.mode = 'thuong'; s.total = 2; s.rounds = { batam: 1 };
        go('result', { d: byId('batam'), res: { doll: 'batam', n: 2, score: 2640, hits: 186, misses: 9, maxCombo: 41, heard: ['batam-1-0', 'batam-1-1'], cut: 0, taps: 195, reason: 'time', quota: 0, passed: true, mode: 'thuong', karmaMax: 0, swats: 0, struck: 0, t: 60 } });
      }
    }[name] || (() => go('title')))();
  }
  root.DTN = { go, scene, State, Round };
})(this);
