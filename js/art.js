/* Vẽ bằng SVG: hình nhân giấy, con hẻm, vật chứng, chiếc dép.
   Hình nhân: gốc tọa độ ở chân, cao ~300. Cùng cấu trúc giấy đỏ xếp lớp + mặt giấy trắng, khác phục trang. */
(function (root) {
  const INK = '#2b1410', PAPER = '#fbf6ea', RED = '#c8261f', RED2 = '#a51f19', RED3 = '#7e1611';

  /* ---------- mặt ---------- */
  function face(expr, vy) {
    const lash = vy ? `<path d="M-24 -241 l-4 -4 M-20 -243 l-2 -5 M24 -241 l4 -4 M20 -243 l2 -5" stroke="${INK}" stroke-width="1.6"/>` : '';
    const mole = vy ? `<circle cx="-21" cy="-224" r="1.8" fill="${INK}"/>` : '';
    const F = {
      smug: `<path d="M-24 -249 l14 2" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M8 -254 q9 -7 18 -2" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M-23 -236 q7 -5 14 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="16" cy="-237" r="4.2" fill="${INK}"/>
        <path d="M-12 -213 q12 7 22 -5" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="-26" cy="-222" rx="6" ry="3.5" fill="#f2a7a0" opacity=".7"/><ellipse cx="26" cy="-222" rx="6" ry="3.5" fill="#f2a7a0" opacity=".7"/>`,
      annoyed: `<path d="M-25 -253 l15 6 M25 -253 l-15 6" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/><circle cx="-16" cy="-237" r="4" fill="${INK}"/><circle cx="16" cy="-237" r="4" fill="${INK}"/>
        <path d="M-11 -211 q11 -5 22 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
      hurt: `<path d="M-22 -243 l11 11 M-11 -243 l-11 11 M11 -243 l11 11 M22 -243 l-11 11" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
        <path d="M-13 -209 q4 -6 8 0 q4 6 8 0 q4 -6 8 0" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
      cry: `<path d="M-24 -238 q7 5 14 0 M10 -238 q7 5 14 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M-17 -232 q-3 10 0 16 q3 -6 0 -16Z M17 -232 q-3 10 0 16 q3 -6 0 -16Z" fill="#7fb6e6"/>
        <path d="M-11 -204 q11 -13 22 0Z" fill="${INK}"/>`,
      talk: `<circle cx="-16" cy="-237" r="3.6" fill="${INK}"/><circle cx="16" cy="-237" r="3.6" fill="${INK}"/>
        <path d="M-22 -249 q6 -3 12 0 M10 -249 q6 -3 12 0" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        <ellipse class="talk-mouth" cx="0" cy="-211" rx="6" ry="5" fill="${INK}"/>`,
      calm: `<ellipse cx="-16" cy="-236" rx="3.4" ry="4.4" fill="${INK}"/><ellipse cx="16" cy="-236" rx="3.4" ry="4.4" fill="${INK}"/>
        <path d="M-6 -212 q6 2 12 0" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
      tele: `<circle cx="-10" cy="-237" r="4" fill="${INK}"/><circle cx="22" cy="-237" r="4" fill="${INK}"/><path d="M-24 -251 l14 0 M8 -251 l16 0" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="0" cy="-211" rx="9" ry="3" fill="${INK}"/>`
    };
    return (F[expr] || F.calm) + lash + mole;
  }

  /* ---------- tóc, phục trang ---------- */
  const HAIR = {
    bun: `<path d="M-42 -226 Q-48 -282 0 -284 Q48 -282 42 -226 Q36 -262 0 -264 Q-36 -262 -42 -226Z" fill="#3a2a24"/><circle cx="0" cy="-288" r="17" fill="#3a2a24"/><path d="M-14 -296 l30 -8" stroke="${RED}" stroke-width="3"/>`,
    part: `<path d="M-42 -230 Q-46 -284 2 -284 Q46 -282 42 -230 Q38 -258 14 -262 Q-4 -250 -30 -256 Q-38 -246 -42 -230Z" fill="#1e1e22"/><path d="M14 -262 q-6 -12 -16 -20" stroke="#000" stroke-width="2" fill="none"/>`,
    glasses: `<path d="M-41 -232 Q-44 -282 0 -283 Q44 -282 41 -232 Q40 -260 22 -264 Q0 -256 -24 -264 Q-40 -260 -41 -232Z" fill="#2a1a12"/>`,
    cap: `<path d="M-42 -238 Q-42 -288 0 -288 Q42 -288 42 -238Z" fill="#2f8f83"/><path d="M-6 -240 L66 -236 Q58 -226 -6 -230Z" fill="#1f6259"/><circle cx="0" cy="-288" r="4" fill="#1f6259"/>`
  };
  const GLASSES = `<g fill="none" stroke="${INK}" stroke-width="2.4"><circle cx="-16" cy="-237" r="10"/><circle cx="16" cy="-237" r="10"/><path d="M-6 -238 h12 M-26 -239 l-14 -3 M26 -239 l14 -3"/></g>`;

  function costume(d) {
    const base = `<path d="M-35 -190 L35 -190 L46 -118 L-46 -118Z" fill="${d.shirt}" stroke="${d.shirt2}" stroke-width="2"/>
      <path d="M-35 -188 L-74 -128 L-62 -120 L-30 -164Z M35 -188 L74 -128 L62 -120 L30 -164Z" fill="${d.shirt}" stroke="${d.shirt2}" stroke-width="2"/>`;
    const extra = {
      batam: [[-22, -170], [6, -178], [24, -150], [-10, -142], [-34, -132], [30, -128], [-58, -148], [58, -146]].map(([x, y], i) =>
        `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map(a => `<ellipse rx="3.4" ry="5.6" cy="-5" transform="rotate(${a})" fill="${i % 2 ? '#f5d36e' : '#f7c6d9'}"/>`).join('')}<circle r="2.6" fill="${RED}"/></g>`).join(''),
      sep: `<path d="M-14 -190 L0 -172 L14 -190 L8 -194 L0 -184 L-8 -194Z" fill="#fff"/><path d="M-5 -178 L5 -178 L8 -132 L0 -122 L-8 -132Z" fill="${RED}" stroke="${RED3}" stroke-width="1.5"/>`,
      dongnghiep: `<rect x="12" y="-170" width="18" height="20" rx="2" fill="none" stroke="${d.shirt2}" stroke-width="2"/><rect x="18" y="-178" width="4" height="16" fill="${RED}"/><path d="M-12 -190 L0 -178 L12 -190" stroke="${d.shirt2}" stroke-width="2" fill="none"/>`,
      nguoiquen: `<path d="M0 -190 V-118" stroke="${d.shirt2}" stroke-width="2.5"/><path d="M-10 -186 v22 M10 -186 v22" stroke="#fbf6ea" stroke-width="2"/><circle cx="-10" cy="-162" r="2.4" fill="#fbf6ea"/><circle cx="10" cy="-162" r="2.4" fill="#fbf6ea"/>`
    };
    return base + (extra[d.id] || '');
  }

  /* ---------- dải giấy tên: tier 0 sạch · 1 nhăn · 2 gạch & viết đè · 3 lộ chữ Vy ---------- */
  function nameTag(name, tier) {
    let s = `<g transform="translate(0 -104) rotate(-3)"><rect x="-38" y="-16" width="76" height="28" rx="2" fill="${PAPER}" stroke="#d9c9a4" stroke-width="1.5"/>`;
    if (tier >= 3) s += `<text x="0" y="5" text-anchor="middle" font-size="17" class="hand" fill="${RED}" opacity=".55">Vy</text>`;
    s += `<text x="0" y="4" text-anchor="middle" font-size="${name.length > 6 ? 13 : 15}" fill="${INK}" class="ui-txt" opacity="${tier >= 3 ? .35 : 1}">${name}</text>`;
    if (tier >= 2) s += `<path d="M-34 0 L34 -2 M-32 4 L33 2" stroke="${RED}" stroke-width="2.6" stroke-linecap="round"/>
      <text x="4" y="-20" text-anchor="middle" font-size="16" class="hand" fill="${RED}" transform="rotate(-6)">${name}</text>`;
    return s + '</g>';
  }

  const WRINKLE = `<g class="wrinkle" stroke="rgba(60,20,10,.22)" stroke-width="1.3" fill="none">
    <path d="M-30 -260 l14 10 l-6 14 l18 6 M20 -268 l-10 16 l14 8 M-28 -214 l12 -4 l8 8"/>
    <path d="M-30 -176 l20 18 l-8 24 l22 14 M24 -182 l-12 26 l18 20 M-10 -110 l14 -12 l16 10"/></g>`;
  const TEAR = `<path class="tear" d="M-50 -150 l18 6 l-6 12 l20 2 l-4 14 l22 -4 l-2 14 l24 -6 l10 10 l16 -8" stroke="#2a0f0b" stroke-width="5" fill="none" stroke-linejoin="bevel"/>
    <path d="M30 -270 l-10 18 l12 6 l-8 16" stroke="#2a0f0b" stroke-width="4" fill="none"/>`;

  /* opt: expr, tier (0-4), vy (bool), white (hình nhân trắng), label (tên cho hình nhân trắng) */
  function doll(d, opt = {}) {
    const { expr = 'smug', tier = 0, vy = false, white = false, label = '' } = opt;
    const r1 = white ? '#f3eee2' : RED, r2 = white ? '#e6dfcf' : RED2, r3 = white ? '#d6ccb6' : RED3;
    const body = `
      <rect x="-27" y="-74" width="20" height="74" fill="${r2}" stroke="${r3}" stroke-width="2"/>
      <rect x="7" y="-74" width="20" height="74" fill="${r2}" stroke="${r3}" stroke-width="2"/>
      <path d="M-60 -60 L60 -60 L42 -196 L-42 -196Z" fill="${r3}"/>
      <path d="M-55 -64 L55 -64 L39 -194 L-39 -194Z" fill="${r2}"/>
      <path d="M-50 -68 L50 -68 L35 -192 L-35 -192Z" fill="${r1}" stroke="${r3}" stroke-width="2"/>
      <path d="M-44 -100 L44 -100 M-40 -130 L40 -130" stroke="${r3}" stroke-width="1.4" opacity=".6"/>
      <path d="M-35 -188 L-80 -116 L-66 -108 L-28 -160Z M35 -188 L80 -116 L66 -108 L28 -160Z" fill="${r1}" stroke="${r3}" stroke-width="2"/>
      <circle cx="-76" cy="-108" r="10" fill="${PAPER}" stroke="#d9c9a4" stroke-width="1.5"/><circle cx="76" cy="-108" r="10" fill="${PAPER}" stroke="#d9c9a4" stroke-width="1.5"/>`;
    const dress = white ? '' : costume(d);
    const neck = `<rect x="-9" y="-200" width="18" height="14" fill="${PAPER}"/>`;
    const head = `<path d="M-41 -232 Q-43 -278 0 -279 Q43 -278 41 -232 Q42 -192 0 -190 Q-42 -192 -41 -232Z" fill="${PAPER}" stroke="#d9c9a4" stroke-width="2"/>`;
    const hair = white ? '' : (HAIR[d.hair] || '');
    const tag = white ? (label ? `<g transform="translate(0 -104) rotate(-3)"><rect x="-44" y="-16" width="88" height="28" rx="2" fill="${PAPER}" stroke="#d9c9a4"/><text x="0" y="5" text-anchor="middle" font-size="17" class="hand" fill="${RED}">${esc(label)}</text></g>` : '')
      : nameTag(d.name, tier);
    const glasses = !white && d.hair === 'glasses' ? GLASSES : '';
    const shield = d.dodge === 'shield' ? `<g class="shield"><rect x="-58" y="-250" width="116" height="120" rx="6" fill="#e9d9a8" stroke="#a6863a" stroke-width="3"/><rect x="-58" y="-250" width="40" height="14" rx="3" fill="#d4bd7a"/><text x="0" y="-180" text-anchor="middle" font-size="18" fill="#6b4f12" class="ui-txt">HỒ SƠ</text></g>` : '';
    return `<g class="doll" data-id="${d.id}">
      <ellipse cx="0" cy="2" rx="62" ry="9" fill="rgba(0,0,0,.18)"/>
      <g class="doll-body">${body}${dress}${tag}${neck}</g>
      <g class="doll-head">${head}${hair}<g class="face">${white && !label ? '' : face(expr, vy || white)}</g>${glasses}</g>
      ${tier >= 1 ? WRINKLE : ''}${tier >= 4 ? TEAR : ''}${shield}
      <rect class="hit" x="-62" y="-292" width="124" height="292" fill="transparent"/>
    </g>`;
  }

  /* ---------- vật chứng ---------- */
  const ITEMS = {
    note: `<g><rect x="-22" y="-22" width="44" height="44" fill="#f7e27a" transform="rotate(-6)"/><path d="M-14 -10 h26 M-14 -2 h22 M-14 6 h18" stroke="#6b5a1a" stroke-width="2" transform="rotate(-6)"/></g>`,
    leave: `<g><rect x="-20" y="-26" width="40" height="52" fill="#fff" stroke="#bbb"/><path d="M-12 -14 h24 M-12 -6 h24 M-12 2 h16" stroke="#777" stroke-width="2"/><circle cx="8" cy="14" r="8" fill="none" stroke="${RED}" stroke-width="2.5"/></g>`,
    slide: `<g><rect x="-26" y="-18" width="52" height="36" fill="#fff" stroke="#bbb"/><path d="M-18 -6 h36 M-18 4 h28" stroke="#777" stroke-width="2"/><path d="M-20 -6 L20 -4" stroke="${RED}" stroke-width="3"/></g>`,
    ticket: `<g><rect x="-26" y="-14" width="52" height="28" rx="3" fill="#f3d9a6" stroke="#b48a3a"/><path d="M10 -14 v28" stroke="#b48a3a" stroke-dasharray="3 3"/><path d="M-18 -4 h20 M-18 4 h14" stroke="#7a5a1a" stroke-width="2"/></g>`,
    receipt: `<g><path d="M-16 -26 h32 v48 l-5 -4 l-5 4 l-6 -4 l-5 4 l-6 -4 l-5 4Z" fill="#fff" stroke="#bbb"/><path d="M-10 -16 h20 M-10 -8 h14 M-10 0 h20" stroke="#777" stroke-width="2"/></g>`,
    pills: `<g><rect x="-22" y="-14" width="44" height="28" rx="4" fill="#dfe9f2" stroke="#8aa3b8"/>${[-12, 0, 12].map(x => `<circle cx="${x}" cy="0" r="4.5" fill="#fff" stroke="#8aa3b8"/>`).join('')}</g>`,
    paper: `<g><rect x="-34" y="-24" width="68" height="48" fill="#ece3cc" stroke="#b9ab88"/><rect x="-28" y="-18" width="22" height="26" fill="#cbbf9f"/><path d="M0 -16 h26 M0 -8 h26 M0 0 h20 M-28 14 h54" stroke="#8d8063" stroke-width="2"/></g>`
  };
  const item = (k, s = 1) => `<svg viewBox="-40 -40 80 80" width="${56 * s}" height="${56 * s}" aria-hidden="true">${ITEMS[k] || ''}</svg>`;

  /* ---------- dép xanh ---------- */
  const SLIPPER = `<svg viewBox="-40 -90 80 180" width="78" height="176" aria-hidden="true">
    <path d="M0 -84 C30 -84 36 -40 32 10 C30 50 26 82 0 84 C-26 82 -30 50 -32 10 C-36 -40 -30 -84 0 -84Z" fill="#2f7fd0" stroke="#1d4f86" stroke-width="3"/>
    <path d="M0 -70 C20 -70 24 -40 22 0 C20 40 16 70 0 72 C-16 70 -20 40 -22 0 C-24 -40 -20 -70 0 -70Z" fill="#5aa6ea"/>
    <path d="M-24 -26 Q0 -50 24 -26" stroke="#e9eef5" stroke-width="9" fill="none" stroke-linecap="round"/></svg>`;

  /* ---------- con hẻm: cửa sắt kéo, nắng, nền gạch. Trả về phần tử SVG (không bọc <svg>) để vẽ chung hệ tọa độ với bàn ---------- */
  function alleyBg({ w = 400, h = 560, tableY = 420, shadow = 0, reflect = false, dim = 0 } = {}) {
    const wallB = tableY - 34;
    const ribs = Array.from({ length: 40 }, (_, i) => `<rect x="${i * 16 - 160}" y="-400" width="7" height="${wallB + 400}" fill="rgba(255,255,255,.12)"/>`).join('');
    const rows = Math.ceil((h - wallB) / 22) + 1;
    const bricks = Array.from({ length: rows }, (_, r) => Array.from({ length: 14 }, (_, c) =>
      `<rect x="${c * 50 - 150 - (r % 2) * 25}" y="${wallB + 4 + r * 22}" width="48" height="20" rx="2" fill="${(r + c) % 3 ? '#b5654a' : '#a65a40'}"/>`).join('')).join('');
    const girl = reflect ? `<image href="img/v3/vy/shadow.webp" x="${w / 2 - 95}" y="${wallB - 290}" width="190" height="280" opacity=".45" class="reflect" preserveAspectRatio="xMidYMax meet"/>` : '';
    return `<defs><linearGradient id="sun" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3c4" stop-opacity=".7"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></linearGradient>
      <linearGradient id="shut" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d8d96"/><stop offset="1" stop-color="#9aa9b0"/></linearGradient></defs>
      <rect x="-200" y="-400" width="${w + 400}" height="${wallB + 400}" fill="url(#shut)"/>${ribs}
      <rect x="-200" y="${wallB - 8}" width="${w + 400}" height="10" fill="#4f5a60"/>
      ${girl}
      <rect x="-200" y="${wallB + 2}" width="${w + 400}" height="${h}" fill="#8f4c38"/>${bricks}
      <path d="M-60 -400 L${w * .5} -400 L${w + 200} ${h * .5} L${w + 200} ${h * .9}Z" fill="url(#sun)"/>
      ${shadow ? `<ellipse cx="${w * .66}" cy="${tableY - 6}" rx="${50 + shadow * 30}" ry="${8 + shadow * 3}" fill="rgba(20,10,10,${.1 + shadow * .06})" transform="rotate(-6 ${w * .66} ${tableY})"/>` : ''}
      ${dim ? `<rect x="-200" y="-400" width="${w + 400}" height="${h + 400}" fill="rgba(20,8,6,${dim})"/>` : ''}`;
  }
  function tableFront(tableY, h, dark) {
    return `<rect x="-300" y="${tableY}" width="1000" height="16" fill="${dark ? '#8a1f18' : '#d8352b'}"/><rect x="-300" y="${tableY + 16}" width="1000" height="${h}" fill="${dark ? '#5e110d' : RED2}"/>
      <path d="M-300 ${tableY + 16} H700" stroke="${RED3}" stroke-width="3"/><path d="M-300 ${tableY + 34} H700" stroke="rgba(255,220,150,.18)" stroke-width="2"/>`;
  }
  /* cảnh hoàn chỉnh: nền hẻm + nội dung đứng trên bàn (front = vẽ sau mặt bàn) */
  function scene({ w = 400, h = 560, tableY = 420, inner = '', front = '', cls = '', fit = 'slice', ...bg } = {}) {
    return `<svg class="alley ${cls}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMax ${fit}" aria-hidden="true">${alleyBg({ w, h, tableY, ...bg })}${inner}${tableFront(tableY, h, bg.dim)}${front}</svg>`;
  }


  /* ---------- hình nhân theo thiết kế (ảnh cắt từ sheet nhân vật, www/img/chars) ----------
     pose: base | run | hit | tele | taunt | angry | hurt | cry | talk | ko | happy. Thiếu pose thì dùng base. */
  const BREATHE = true; // tắt nếu thiếu ảnh *_idle.webp
  const LYING = { nu_choang: .6, nu_xiu: .55 };
  const lyingOf = f => /\/(ko|lie)$/.test(f) ? .42 : /\/(duck)$/.test(f) ? .45 : /\/dash$/.test(f) ? .78 : /\/run\d$/.test(f) ? .82 : LYING[f] || 1; // tư thế nằm thì thấp hơn
  const CHAR = f => `img/${f.includes('/') ? f : 'chars/' + f}.webp`;
  const weaponImg = id => `img/v2/weapons/${id}.webp`;
  function frame(d, pose = 'base', i = 0, tier = 0) {
    const L = d.look || {};
    // tư thế đứng dùng bản "đang thở" (WebP động, tools/assets/breathe-dolls.py) nếu có
    if (pose === 'base' && L.tiers) return L.tiers[Math.max(0, Math.min(L.tiers.length - 1, tier >= 2 ? 2 : tier))] + (BREATHE ? '_idle' : '');
    let f = L[pose] || L.base;
    if (Array.isArray(f)) f = f[i % f.length];
    return f;
  }
  const hasPose = (d, pose) => !!(d.look && d.look[pose]);
  // dải giấy tên (HTML) — tier 0 sạch · 2 gạch & viết đè · 3 lộ chữ Vy
  function tagHTML(name, tier) {
    return `<span class="ntag t${Math.min(tier, 4)}">${tier >= 3 ? '<i>Vy</i>' : ''}<b>${esc(name)}</b>${tier >= 2 ? `<em>${esc(name)}</em>` : ''}</span>`;
  }
  const CRACKS = `<svg class="cracks" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <path class="wr" d="M20 30 l10 6 l-4 8 l12 4 M70 24 l-8 10 l10 6 M30 60 l14 10 l-6 14 l14 8 M66 58 l-10 14 l12 12"/>
    <path class="tr" d="M10 55 l12 4 l-4 7 l13 1 l-3 8 l14 -3 l-1 8 l15 -4 l7 6 l12 -5 M62 8 l-6 11 l8 4 l-5 10"/></svg>`;
  // HTML: dùng cho lượt đập, thẻ hình nhân, mâm cúng
  function dollHTML(d, { pose = 'base', tier = 0, cls = '', id = '' } = {}) {
    const f = frame(d, pose, 0, tier);
    return `<div class="rdoll tier-${Math.min(tier, 4)} ${cls}" ${id ? `id="${id}"` : ''} data-doll="${d.id}">
      <img class="rdoll-img" src="${CHAR(f)}" alt="${esc(d.name)}" draggable="false" style="height:${lyingOf(f) * 100}%">
      ${tier >= 1 ? CRACKS : ''}${tagHTML(d.name, tier)}
      ${d.look && d.look.shield ? `<img class="rdoll-shield" src="${CHAR(d.look.shield)}" alt="" draggable="false">` : ''}
    </div>`;
  }
  // SVG: dùng trong cảnh bàn đỏ (chân đặt tại x,y; cao h)
  function dollSVGImg(d, { x, y, h, tier = 0, pose = 'base', cls = '', attrs = '' }) {
    const f = frame(d, pose, 0, tier), w = h * .9;
    // tên tự đặt có thể dài: ép chữ vừa dải giấy (≈ 8 ký tự vừa tự nhiên)
    const fit = (k) => d.name.length > 8 ? ` textLength="${(h * k).toFixed(1)}" lengthAdjust="spacingAndGlyphs"` : '';
    const tag = `<g transform="translate(${x} ${y - h * .1}) rotate(-3)">
      <rect x="${-h * .17}" y="${-h * .045}" width="${h * .34}" height="${h * .09}" rx="1.5" fill="${PAPER}" stroke="#bfae88" stroke-width="1"/>
      ${tier >= 3 ? `<text x="0" y="${h * .03}" text-anchor="middle" font-size="${h * .075}" class="hand" fill="${RED}" opacity=".55">Vy</text>` : ''}
      <text x="0" y="${h * .025}" text-anchor="middle" font-size="${h * .06}" class="ui-txt" fill="${INK}" opacity="${tier >= 3 ? .35 : 1}"${fit(.31)}>${esc(d.name)}</text>
      ${tier >= 2 ? `<path d="M${-h * .15} 0 L${h * .15} ${-h * .006}" stroke="${RED}" stroke-width="${h * .012}"/><text x="0" y="${-h * .06}" text-anchor="middle" font-size="${h * .07}" class="hand" fill="${RED}"${fit(.36)}>${esc(d.name)}</text>` : ''}</g>`;
    return `<g class="${cls}" ${attrs}><ellipse cx="${x}" cy="${y}" rx="${h * .22}" ry="${h * .03}" fill="rgba(0,0,0,.18)"/>
      <image href="${CHAR(f)}" x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMax meet" class="${tier >= 4 ? 'torn' : ''}"/>${tag}</g>`;
  }

  /* ảnh cắt từ bộ asset (www/img/*.webp) */
  const IMG = n => `img/${n}.webp`;
  const sprite = (n, x, y, w, h, cls = '') => `<image href="${IMG(n)}" x="${x}" y="${y}" width="${w}" ${h ? `height="${h}"` : ''} class="${cls}" preserveAspectRatio="xMidYMax meet"/>`;
  const img = (n, cls = '', alt = '') => `<img src="${IMG(n)}" class="${cls}" alt="${alt}" draggable="false">`;

  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  root.Art = { doll, face, item, scene, alleyBg, tableFront, SLIPPER, esc, IMG, sprite, img, frame, hasPose, dollHTML, dollSVGImg, tagHTML, CHAR, LYING, lyingOf, weaponImg };
})(this);
