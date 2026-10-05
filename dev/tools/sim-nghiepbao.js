// Mô phỏng thô một lượt 60s bản Nghiệp Báo (www-hard) để cân chỉ tiêu và thanh nghiệp.
// Chạy: node tools/sim-nghiepbao.js — nhớ giữ DIFF/KARMA/quota khớp với www-hard/js/round.js và story.js.
const rnd = (a, b) => a + Math.random() * (b - a);
const DIFF = [
  { gap: [2, 2.8], fake: .15, hold: 1.1, tele: .32, mix: 0, chain: 0, throwGap: null, fly: 0 },
  { gap: [1.4, 2.1], fake: .25, hold: 1.2, tele: .27, mix: .35, chain: .15, throwGap: [7, 10], fly: 1.35 },
  { gap: [1, 1.6], fake: .35, hold: 1.3, tele: .22, mix: .45, chain: .3, throwGap: [4.5, 7], fly: 1.1 }
];
const DUR = { side: .36, duck: .8, shield: 1.2, fade: .7 };
const KARMA = { miss: 3, keng: 8, struck: 15, cut: 10, heard: -30, decay: 2.5 };
const mult = c => c >= 50 ? 4 : c >= 30 ? 3 : c >= 15 ? 2 : c >= 6 ? 1.5 : 1;
const DOLLS = { batam: ['side', 'duck'], sep: ['duck', 'side'], dongnghiep: ['shield', 'duck'], nguoiquen: ['fade', 'side'], traxanh: ['side', 'fade'] };

function round(doll, r, P) {
  const dt = 1 / 60, D = DIFF[r], [k1, k2] = DOLLS[doll];
  let t = 0, state = 'idle', stateEnd = 0, nextDodge = rnd(1.5, 2.5), lastChange = 0;
  let score = 0, combo = 0, clock = 9, karma = 0, kmax = 0, nextTap = 0, rage = false;
  let wT = [rnd(14, 22), rnd(34, 44)], wI = 0, wEnd = -1, listening = false;
  let nextThrow = D.throwGap ? rnd(3.5, 5) : 1e9, projs = [], burst = false;
  const add = v => { karma = Math.max(0, Math.min(100, karma + v)); kmax = Math.max(kmax, karma); if (karma >= 100) burst = true; };
  while (t < 60 && !burst) {
    t += dt; const left = 60 - t;
    if (!rage && left <= 10) rage = true;
    if (state === 'idle' || state === 'tele') clock += dt;
    if (combo && clock > .6) combo = 0;
    add(-KARMA.decay * dt);
    // thì thầm
    if (!listening && wI < 2 && t >= wT[wI] && (state === 'idle' || state === 'tele')) {
      wI++; state = 'idle'; listening = true; wEnd = t + 3.6;
      if (Math.random() > P.listen) { listening = false; add(KARMA.cut); } // cắt lời
    }
    if (listening && t >= wEnd) { listening = false; add(KARMA.heard); nextDodge = t + rnd(.8, 1.4); }
    if (!listening && t >= nextThrow && state === 'idle') { projs.push(t + D.fly * (rage ? .85 : 1)); nextThrow = t + rnd(...D.throwGap) * (rage ? .7 : 1); }
    for (const p of projs.slice()) if (t >= p) { projs.splice(projs.indexOf(p), 1); if (Math.random() < P.swat) { score += 30 * (rage ? 2 : 1); nextTap = t + .35; } else { combo = 0; add(KARMA.struck); } }
    if (!listening) {
      if (state === 'idle' && t >= nextDodge) { state = 'tele'; stateEnd = t + D.tele * (rage ? .85 : 1); }
      else if (state === 'tele' && t >= stateEnd) {
        if (Math.random() < D.fake) { state = 'idle'; nextDodge = t + rnd(...D.gap); }
        else { state = Math.random() < D.mix ? k2 : k1; stateEnd = t + (state === 'side' ? DUR.side : DUR[state] * D.hold); lastChange = t; }
      } else if (state !== 'idle' && state !== 'tele' && t >= stateEnd) {
        const moved = state !== 'duck' && state !== 'shield';
        state = 'idle'; lastChange = t; if (moved) lastChange += .1;
        nextDodge = t + (Math.random() < D.chain ? rnd(.3, .45) : rnd(...D.gap) * (rage ? .7 : 1));
      }
    }
    // người chơi
    if (listening || t < nextTap) continue;
    const sinceChange = t - lastChange;
    const hittable = state === 'idle' || state === 'tele';
    const willTap = hittable ? sinceChange > P.react : sinceChange < P.react; // phản xạ chậm thì vẫn đập vào lúc nó vừa né
    if (!willTap) continue;
    nextTap = t + 1 / P.rate;
    if (hittable && Math.random() < P.acc) {
      combo = clock <= .6 ? combo + 1 : 1; clock = 0;
      score += Math.round(10 * mult(combo) * (rage ? 2 : 1));
    } else if (state === 'shield') { combo = 0; add(KARMA.keng); }
    else { combo = 0; add(KARMA.miss); }
  }
  return { score, kmax, burst };
}

const PLAYERS = {
  'người mới   (4 nhát/s, trúng 80%, phản xạ .35s)': { rate: 4, acc: .8, react: .35, swat: .5, listen: .5 },
  'trung bình  (5 nhát/s, trúng 88%, phản xạ .28s)': { rate: 5, acc: .88, react: .28, swat: .7, listen: .8 },
  'giỏi        (6 nhát/s, trúng 94%, phản xạ .2s) ': { rate: 6, acc: .94, react: .2, swat: .9, listen: 1 }
};
const N = 400;
for (const [name, P] of Object.entries(PLAYERS)) {
  console.log('\n' + name);
  for (let r = 0; r < 3; r++) {
    const all = [];
    for (const d of Object.keys(DOLLS)) for (let i = 0; i < N; i++) all.push(round(d, r, P));
    const sc = all.filter(x => !x.burst).map(x => x.score).sort((a, b) => a - b);
    const q = p => sc[Math.floor(sc.length * p)] || 0;
    const bursts = all.filter(x => x.burst).length / all.length;
    console.log(`  lượt ${r + 1}: điểm p25=${q(.25)} p50=${q(.5)} p75=${q(.75)}  nghiệp quật=${(bursts * 100).toFixed(1)}%`);
    globalThis.quota = globalThis.quota || [2000, 2200, 2300];
    const pass = all.filter(x => !x.burst && x.score >= quota[r]).length / all.length;
    console.log(`          qua chỉ tiêu ${quota[r]}: ${(pass * 100).toFixed(0)}%`);
  }
}
