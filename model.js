// ===== Модели за инструменталните вежби (чиста математика, без DOM) =====
(function (root) {
  const M = {};
  const gs = (x, c, w) => Math.exp(-(((x - c) / w) ** 2));

  // ---------- Спектрофотометрија ----------
  // молска апсорптивност по μg/cm³ (дебелина на кивета 1 cm), функција од бранова должина
  const gP = l => gs(l, 680, 110) + 0.04;
  const rawCr = l => gs(l, 370, 70) + 0.55 * gs(l, 450, 50);
  const rawMn0 = l => gs(l, 525, 22) + 0.95 * gs(l, 548, 20) + 0.6 * gs(l, 507, 18);
  const hb = (0.0013 / 0.0246 * rawMn0(550) - rawMn0(430)) / gs(430, 380, 90);   // базна линија: k(430)=0,0013
  const rawMn = l => rawMn0(l) + hb * gs(l, 380, 90);
  M.EPS = {
    P: l => 0.01225 * gP(l) / gP(600),          // молибденско сино (600 nm: 0,01225)
    Cr: l => 0.00443 * rawCr(l) / rawCr(430),    // Cr₂O₇²⁻ (430 nm: 0,00443)
    Mn: l => 0.0246 * rawMn(l) / rawMn(550)      // MnO₄⁻  (550 nm: 0,0246)
  };
  M.REAGENT_BLANK = 0.010;
  M.dev = t => Math.min(1, (1 - Math.exp(-t / 8)) / (1 - Math.exp(-30 / 8)));   // развивање на бојата (30 min)
  M.trueA = (lam, conc) => { let A = 0; for (const k in conc) A += M.EPS[k](lam) * conc[k]; return A; };

  // ---------- Титрации ----------
  const KA = 1.75e-5, KA2 = 0.012, KW = 1e-14;
  const LAM = { H: 349.8, Na: 50.1, OH: 198.6, HSO4: 52, SO4: 160, Ac: 40.9 };
  M.MW = { H2SO4: 98.079, HAc: 60.052 };
  // cs, ca, na: mol/L (H₂SO₄, CH₃COOH, Na⁺)
  M.solveH = (cs, ca, na) => {
    let lo = -14, hi = 0;
    const f = lh => { const h = 10 ** lh, a2 = KA2 / (h + KA2); return h + na - KW / h - cs * (1 + a2) - ca * KA / (h + KA); };
    for (let i = 0; i < 90; i++) { const mid = (lo + hi) / 2; if (f(mid) > 0) hi = mid; else lo = mid; }
    return 10 ** ((lo + hi) / 2);
  };
  // ns, na: mmol во садот (20 cm³ аликвот), V: cm³ NaOH, cN: mol/L; садот е ~100 cm³
  M.titration = (method, ns, na, cN, V) => {
    const Vt = 100 + V, cs = ns / Vt, ca = na / Vt, Na = cN * V / Vt;
    const h = M.solveH(cs, ca, Na);
    if (method === "ph") return -Math.log10(h);
    const a2 = KA2 / (h + KA2), oh = KW / h;
    const sum = LAM.H * h + LAM.Na * Na + LAM.OH * oh + LAM.HSO4 * cs * (1 - a2) + LAM.SO4 * cs * a2 + LAM.Ac * ca * KA / (h + KA);
    return sum * 1000 * 0.96 + 1.5;   // μS/cm (фактор на јонска јачина + позадина)
  };
  M.trueVeq = (ns, na, cN) => ({ V1: 2 * ns / cN, V2: (2 * ns + na) / cN });

  // ---------- Статистика ----------
  M.linreg = p => {
    const n = p.length; if (n < 2) return null;
    let sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0;
    p.forEach(q => { sx += q.x; sy += q.y; sxx += q.x * q.x; sxy += q.x * q.y; syy += q.y * q.y; });
    const d = n * sxx - sx * sx; if (!d) return null;
    const a = (n * sxy - sx * sy) / d, b = (sy - a * sx) / n;
    const my = sy / n; let st = 0, sr = 0;
    p.forEach(q => { st += (q.y - my) ** 2; sr += (q.y - (a * q.x + b)) ** 2; });
    return { a, b, r2: st ? 1 - sr / st : 1, n };
  };
  // автоматски предлог за гранки (2 или 3 прави): минимум на збир од квадрати на отстапувања
  M.autoBranches = (pts, nb) => {
    const n = pts.length, best = { sse: Infinity, br: null };
    const sse = idx => { if (idx.length < 3) return Infinity; const r = M.linreg(idx.map(i => pts[i])); let s = 0; idx.forEach(i => { s += (pts[i].y - (r.a * pts[i].x + r.b)) ** 2; }); return s; };
    const range = (a, b) => { const o = []; for (let i = a; i <= b; i++) o.push(i); return o; };
    if (nb === 2) {
      for (let i = 2; i < n - 3; i++) for (let g = 0; g <= 2; g++) {
        const L = range(0, i - g), R = range(i + g + 1 > n - 1 ? n - 1 : i + g, n - 1);
        const s = sse(L) + sse(R); if (s < best.sse) { best.sse = s; best.br = { L, R }; }
      }
      if (!best.br) return null;
      const br = new Array(n).fill(0); best.br.L.forEach(i => br[i] = 1); best.br.R.forEach(i => br[i] = 2); return br;
    }
    for (let i = 2; i < n - 5; i++) for (let j = i + 3; j < n - 3; j++) for (let g = 0; g <= 1; g++) {
      const A = range(0, i - g), B = range(i + g, j - g), C = range(j + g, n - 1);
      const s = sse(A) + sse(B) + sse(C); if (s < best.sse) { best.sse = s; best.br = { A, B, C }; }
    }
    if (!best.br) return null;
    const br = new Array(n).fill(0); best.br.A.forEach(i => br[i] = 1); best.br.B.forEach(i => br[i] = 2); best.br.C.forEach(i => br[i] = 3); return br;
  };
  root.InstModel = M;
  if (typeof module !== "undefined") module.exports = M;
})(typeof window !== "undefined" ? window : globalThis);
