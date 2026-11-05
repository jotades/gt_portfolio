(function(){
  // OmniTrack, future work: smoothing that adapts to movement. Today every range goes through exponential
  // smoothing with a fixed α = 0.4; here a small MLP reads the IMU and the UWB ranges and predicts α at each
  // sample, between 0.1 (standing still) and 0.9 (sudden change of direction).
  // Everything is simulated: a 30 s session at 10 Hz generated in the browser (always the same one), and a
  // 3-8-1 network trained offline on synthetic data that follow that rule. Two tabs (input signals, network
  // output), three time windows, a crosshair that drives the side panel.
  var root = document.getElementById("fx"); if (!root) return;
  var T = function(s){ return window.i18n ? window.i18n.t(s) : s; };
  var svg = root.querySelector(".cx-chart svg"), side = root.querySelector(".cx-side");
  var tabs = root.querySelectorAll(".cx-tabs [data-t]"), wins = root.querySelectorAll("[data-w]");
  var topic = "smooth", TS = 0.1, N = 300, A_FIX = 0.4, TEAL = "#17a398", GREY = "#9aa4ab";

  // the network: inputs |acc|/3 m/s², |gyro|/200 °/s, |range rate|/1 m/s; tanh hidden layer; sigmoid output scaled to 0.1–0.9
  var NET = {"W1": [[-3.7786, 0.9333, -0.7932, 0.4888, -1.0372, -0.8167, 4.5581, -0.9989], [-3.3153, -0.6661, 0.9444, 2.4678, -0.2628, -0.0891, 4.2636, -0.8976], [-1.4638, -1.4177, -1.4098, -0.1754, 0.1357, 0.1636, 1.5371, 0.224]], "b1": [3.4359, 0.2278, 0.1927, -0.8324, 0.5846, 0.312, -0.3525, 0.3837], "W2": [-2.055, -1.0231, -1.1802, 1.3108, -2.201, -0.8051, 2.942, -0.8001], "b2": -0.0707};
  function mlp(x){
    var h = NET.b1.map(function(b, j){ var z = b; for (var i = 0; i < 3; i++) z += x[i] * NET.W1[i][j]; return Math.tanh(z); });
    var z = NET.b2; h.forEach(function(v, j){ z += v * NET.W2[j]; });
    return { h: h, a: 0.1 + 0.8 / (1 + Math.exp(-z)) };
  }

  // the simulated session: still, walking towards a landmark, a sudden turn, walking away, still
  var PHASES = [[0, 8, "Still"], [8, 16, "Towards"], [16, 17, "Turn"], [17, 24, "Away"], [24, 30, "Still"]];
  var seed = 7; function rnd(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  function gauss(){ return Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd()); }
  function ramp(t, a, b){ return t <= a ? 0 : t >= b ? 1 : (t - a) / (b - a); }
  function bump(t, c, w){ return Math.exp(-0.5 * Math.pow((t - c) / w, 2)); }
  var t = [], dTrue = [], raw = [], acc = [], gyr = [], rate = [], alpha = [], hid = [], sFix = [], sAd = [], d = 5;
  for (var k = 0; k < N; k++) {
    var tt = k * TS, v = -0.45 * ramp(tt, 8, 8.6) + 1.0 * ramp(tt, 16, 16.8) - 0.55 * ramp(tt, 24, 24.6);
    var walk = (tt > 8.3 && tt < 24.3) ? 1 : 0, step = Math.abs(Math.sin(Math.PI * 1.8 * tt));
    if (k) d += v * TS;
    t.push(tt); dTrue.push(d); raw.push(d + 0.012 * gauss());
    acc.push(Math.abs(walk * (0.5 + 0.5 * step) + 2.6 * bump(tt, 16.4, 0.35) + (walk ? 0.08 : 0.04) * gauss()));
    gyr.push(Math.abs(walk * (12 + 8 * step) + 190 * bump(tt, 16.4, 0.3) + (walk ? 3 : 1.5) * gauss()));
  }
  for (k = 0; k < N; k++) {
    var j = Math.max(0, k - 5); rate.push(k ? Math.abs(raw[k] - raw[j]) / ((k - j) * TS) : 0);
    var o = mlp([acc[k] / 3, gyr[k] / 200, rate[k] / 1]); alpha.push(o.a); hid.push(o.h);
    sFix.push(k ? A_FIX * raw[k] + (1 - A_FIX) * sFix[k - 1] : raw[0]);
    sAd.push(k ? o.a * raw[k] + (1 - o.a) * sAd[k - 1] : raw[0]);
  }
  // what the adaptive α buys, on this session
  function stat(f, a, b, fn){ var s = 0, n = 0; for (var i = Math.round(a / TS); i <= Math.round(b / TS); i++) { s += fn(f[i] - dTrue[i]); n++; } return s / n; }
  function jitter(f){ var m = stat(f, 2, 7.5, function(e){ return e; }); return 1000 * Math.sqrt(stat(f, 2, 7.5, function(e){ return (e - m) * (e - m); })); }
  var M = { jf: jitter(sFix), ja: jitter(sAd), tf: 100 * stat(sFix, 16, 18, Math.abs), ta: 100 * stat(sAd, 16, 18, Math.abs) };
  var IT = !!(window.i18n && window.i18n.lang === "it"); function F(x, d){ var v = (+x).toFixed(d); return IT ? v.replace(".", ",") : v; }
  function tau(a){ return -TS * 1000 / Math.log(1 - a); }

  var WIN = { all: [0, 30], turn: [14.5, 19], still: [2, 7.5] }, win = "all", tab = "in", cur = -1;
  var X0 = 52, X1 = 505;
  function sx(tt){ var w = WIN[win]; return X0 + (tt - w[0]) / (w[1] - w[0]) * (X1 - X0); }
  function txt(x, y, s, o){ o = o || {}; return '<text x="' + x + '" y="' + y + '" font-size="' + (o.s || 10.5) + '" text-anchor="' + (o.a || "start") + '" fill="' + (o.c || "var(--ink-2)") + '"' + (o.w ? ' font-weight="700"' : "") + ">" + s + "</text>"; }
  function range(){ var w = WIN[win]; return [Math.max(0, Math.round(w[0] / TS)), Math.min(N - 1, Math.round(w[1] / TS))]; }
  // one lane: its own vertical scale, a label, a few gridlines, and the series given
  function lane(top, h, lo, hi, label, ticks, series){
    var r = range(), s = "", sy = function(v){ return top + h - (v - lo) / (hi - lo) * h; };
    ticks.forEach(function(v){ var y = sy(+v).toFixed(1); s += '<line x1="' + X0 + '" x2="' + X1 + '" y1="' + y + '" y2="' + y + '" stroke="var(--line)" stroke-width="1"/>' + txt(X0 - 6, +y + 3.5, IT ? String(v).replace(".", ",") : v, { a: "end", s: 9.5 }); });
    s += txt(X0 + 4, top - 4, T(label), { c: "var(--ink)", w: 1, s: 10.5 });
    series.forEach(function(se){
      if (se.dots) { for (var i = r[0]; i <= r[1]; i++) s += '<circle cx="' + sx(t[i]).toFixed(1) + '" cy="' + sy(se.f[i]).toFixed(1) + '" r="' + (win === "all" ? 0.9 : 1.8) + '" fill="' + se.c + '"/>'; return; }
      var p = ""; for (var i = r[0]; i <= r[1]; i++) p += (i > r[0] ? "L" : "M") + sx(t[i]).toFixed(1) + " " + sy(Math.max(lo, Math.min(hi, se.f[i]))).toFixed(1);
      s += '<path d="' + p + '" fill="none" stroke="' + se.c + '" stroke-width="' + (se.w || 2) + '"' + (se.dash ? ' stroke-dasharray="' + se.dash + '"' : "") + ' stroke-linejoin="round"/>';
    });
    return { s: s, sy: sy };
  }
  function frame(){
    var w = WIN[win], s = "";
    PHASES.forEach(function(p, i){
      var a = Math.max(p[0], w[0]), b = Math.min(p[1], w[1]); if (b <= a) return;
      if (i % 2) s += '<rect x="' + sx(a).toFixed(1) + '" y="18" width="' + (sx(b) - sx(a)).toFixed(1) + '" height="250" fill="var(--wash)"/>';
      if (sx(b) - sx(a) > 26) s += txt((sx(a) + sx(b)) / 2, 13, T(p[2]), { a: "middle", s: 9.5 });
    });
    var step = w[1] - w[0] > 10 ? 5 : 1;
    for (var x = Math.ceil(w[0] / step) * step; x <= w[1] + 1e-9; x += step) s += txt(sx(x), 282, x + " s", { a: "middle", s: 9.5 });
    return s;
  }
  function minmax(fs){ var r = range(), lo = Infinity, hi = -Infinity; fs.forEach(function(f){ for (var i = r[0]; i <= r[1]; i++) { lo = Math.min(lo, f[i]); hi = Math.max(hi, f[i]); } }); var p = (hi - lo) * 0.12 || 0.01; return [lo - p, hi + p]; }
  function nice(lo, hi, n){ var st = Math.pow(10, Math.floor(Math.log10((hi - lo) / n))), m = (hi - lo) / n / st; st *= m >= 7.5 ? 10 : m >= 3.5 ? 5 : m >= 1.5 ? 2 : 1; var out = []; for (var v = Math.ceil(lo / st) * st; v <= hi + 1e-9; v += st) out.push(+v.toFixed(3)); var dp = st < 0.1 ? 2 : st < 1 ? 1 : 0; return out.map(function(v){ return v.toFixed(dp); }); }

  var lanes = [];
  function draw(){
    var s = frame(); lanes = [];
    if (tab === "in") {
      var L1 = lane(34, 58, 0, 3.2, "Acceleration, IMU (m/s²)", [0, 1.5, 3], [{ f: acc, c: "var(--c1)" }]);
      var L2 = lane(118, 58, 0, 210, "Rotation, IMU (°/s)", [0, 100, 200], [{ f: gyr, c: "var(--c1)" }]);
      var L3 = lane(202, 58, 0, 1.2, "Range rate, UWB (m/s)", [0, 0.5, 1], [{ f: rate, c: "var(--c1)" }]);
      s += L1.s + L2.s + L3.s; lanes = [[L1, acc], [L2, gyr], [L3, rate]];
    } else {
      var L4 = lane(34, 74, 0, 1, "α predicted by the network", [0, 0.5, 1], [{ f: t.map(function(){ return A_FIX; }), c: GREY, dash: "5 4", w: 1.6 }, { f: alpha, c: TEAL }]);
      var mm = minmax([dTrue, raw]), L5 = lane(134, 126, mm[0], mm[1], "Distance to the landmark (m)", nice(mm[0], mm[1], 3), [
        { f: raw, c: "#b9c4ce", dots: 1 }, { f: dTrue, c: "var(--ink)", w: 1 }, { f: sFix, c: GREY, dash: "5 4", w: 1.8 }, { f: sAd, c: TEAL }]);
      s += L4.s + L5.s; lanes = [[L4, alpha], [L5, sAd]];
      // legend, on one row
      var lg = [[GREY, "5 4", "fixed α = 0.4"], [TEAL, "", "adaptive α"], ["var(--ink)", "", "true"]], lx = X1 - 248;
      lg.forEach(function(g){ s += '<line x1="' + lx + '" x2="' + (lx + 16) + '" y1="126" y2="126" stroke="' + g[0] + '" stroke-width="2"' + (g[1] ? ' stroke-dasharray="' + g[1] + '"' : "") + "/>" + txt(lx + 20, 129.5, T(g[2]), { s: 9.5 }); lx += 88; });
    }
    s += '<g class="fx-cross" visibility="hidden"><line y1="18" y2="268" stroke="var(--ink)" stroke-width="1"/>' + lanes.map(function(){ return '<circle r="3.5" fill="var(--bg)" stroke="var(--ink)" stroke-width="1.5"/>'; }).join("") + "</g>";
    s += '<rect x="' + X0 + '" y="18" width="' + (X1 - X0) + '" height="250" fill="transparent" class="fx-hit"/>';
    svg.innerHTML = s;
    panel();
    if (cur >= 0) cross(cur);
  }

  // the side panel: what the tab shows, and the values under the crosshair
  function net(k){
    var h = k >= 0 ? hid[k] : null, x = k >= 0 ? [acc[k] / 3, gyr[k] / 200, rate[k]] : null, s = '<svg class="fx-net" viewBox="0 0 220 128" role="img" aria-label="' + T("Network: three inputs, eight hidden neurons, one output") + '">';
    var iy = [24, 64, 104], hy = []; for (var j = 0; j < 8; j++) hy.push(8 + j * 16);
    iy.forEach(function(y){ hy.forEach(function(y2){ s += '<line x1="34" y1="' + y + '" x2="110" y2="' + y2 + '" stroke="var(--line)"/>'; }); });
    hy.forEach(function(y){ s += '<line x1="110" y1="' + y + '" x2="180" y2="64" stroke="var(--line)"/>'; });
    ["acc", "rot", "rate"].forEach(function(n, i){ var v = x ? Math.min(1, x[i]) : 0.15; s += '<circle cx="34" cy="' + iy[i] + '" r="7" fill="var(--c1)" fill-opacity="' + (0.15 + 0.85 * v).toFixed(2) + '" stroke="var(--c1)"/>' + txt(22, iy[i] + 3.5, T(n), { a: "end", s: 9.5 }); });
    hy.forEach(function(y, j){ var v = h ? Math.abs(h[j]) : 0.15; s += '<circle cx="110" cy="' + y + '" r="5.5" fill="var(--ink-2)" fill-opacity="' + (0.1 + 0.8 * v).toFixed(2) + '" stroke="var(--ink-2)"/>'; });
    var a = k >= 0 ? alpha[k] : A_FIX;
    s += '<circle cx="180" cy="64" r="9" fill="' + TEAL + '" fill-opacity="' + ((a - 0.1) / 0.8 * 0.85 + 0.15).toFixed(2) + '" stroke="' + TEAL + '"/>' + txt(194, 68, "α", { c: "var(--ink)", w: 1, s: 12 });
    return s + "</svg>";
  }
  function panel(){
    var k = cur;
    if (tab === "in") {
      side.innerHTML = "<p>" + T("Three signals, read over the last half second at each sample: the <b>acceleration</b> and the <b>rotation</b> measured by the IMU in the wearable, and how fast the <b>UWB range</b> is changing.") + "</p>" +
        '<table class="fx-read"><tbody>' +
        "<tr><th scope=\"row\">" + T("Acceleration") + '</th><td class="num" data-r="0"></td></tr>' +
        "<tr><th scope=\"row\">" + T("Rotation") + '</th><td class="num" data-r="1"></td></tr>' +
        "<tr><th scope=\"row\">" + T("Range rate") + '</th><td class="num" data-r="2"></td></tr></tbody></table>' +
        "<p>" + T("Standing still, all three stay near zero; walking, the steps show up as a regular ripple; the turn is a sharp peak in acceleration and rotation.") + "</p>";
    } else {
      side.innerHTML = "<p>" + T("<b>Regression with an MLP</b>: three inputs, eight hidden neurons, one output, α between 0.1 and 0.9.") + "</p>" + net(k) +
        '<p class="fx-a"><span class="big" data-r="a"></span> <span data-r="tau"></span></p>' +
        '<table class="fx-read"><thead><tr><th></th><th class="num">' + T("fixed") + '</th><th class="num">' + T("adaptive") + "</th></tr></thead><tbody>" +
        "<tr><th scope=\"row\">" + T("Jitter, standing still") + '</th><td class="num">' + F(M.jf, 1) + ' mm</td><td class="num"><b>' + F(M.ja, 1) + " mm</b></td></tr>" +
        "<tr><th scope=\"row\">" + T("Error around the turn") + '</th><td class="num">' + F(M.tf, 1) + ' cm</td><td class="num"><b>' + F(M.ta, 1) + " cm</b></td></tr></tbody></table>";
    }
    readout(k);
  }
  function readout(k){
    var q = function(s){ return side.querySelector('[data-r="' + s + '"]'); };
    if (tab === "in") {
      if (!q("0")) return;
      q("0").textContent = k >= 0 ? F(acc[k], 2) + " m/s²" : "–";
      q("1").textContent = k >= 0 ? Math.round(gyr[k]) + " °/s" : "–";
      q("2").textContent = k >= 0 ? F(rate[k], 2) + " m/s" : "–";
    } else {
      if (!q("a")) return;
      var a = k >= 0 ? alpha[k] : null;
      q("a").textContent = "α = " + (a == null ? "–" : F(a, 2));
      q("tau").textContent = a == null ? T("Point at the chart") : "τ ≈ " + Math.round(tau(a)) + " ms " + T("(fixed: 196 ms)");
      var n = side.querySelector(".fx-net"); if (n) n.outerHTML = net(k);
    }
  }
  function cross(k){
    var g = svg.querySelector(".fx-cross"); if (!g) return;
    if (k < 0) { g.setAttribute("visibility", "hidden"); return; }
    var x = sx(t[k]).toFixed(1); g.setAttribute("visibility", "visible");
    var l = g.querySelector("line"); l.setAttribute("x1", x); l.setAttribute("x2", x);
    g.querySelectorAll("circle").forEach(function(c, i){ var L = lanes[i]; c.setAttribute("cx", x); c.setAttribute("cy", L[0].sy(L[1][k]).toFixed(1)); });
  }
  function at(e){
    var r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal, x = (e.clientX - r.left) / r.width * vb.width;
    var w = WIN[win], tt = w[0] + (x - X0) / (X1 - X0) * (w[1] - w[0]);
    return Math.max(range()[0], Math.min(range()[1], Math.round(tt / TS)));
  }
  svg.addEventListener("pointermove", function(e){ if (topic !== "smooth") return; cur = at(e); cross(cur); readout(cur); });
  svg.addEventListener("pointerleave", function(){ if (topic !== "smooth") return; cur = -1; cross(-1); readout(-1); });
  svg.setAttribute("tabindex", "0");
  svg.addEventListener("keydown", function(e){
    if (topic !== "smooth") return;
    var r = range(), d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!d) return;
    e.preventDefault(); cur = cur < 0 ? r[0] : Math.max(r[0], Math.min(r[1], cur + d * (win === "all" ? 5 : 1))); cross(cur); readout(cur);
  });
  tabs.forEach(function(b){ b.addEventListener("click", function(){ tab = b.getAttribute("data-t"); tabs.forEach(function(o){ o.setAttribute("aria-selected", String(o === b)); }); draw(); }); });
  wins.forEach(function(b){ b.addEventListener("click", function(){ win = b.getAttribute("data-w"); wins.forEach(function(o){ o.setAttribute("aria-pressed", String(o === b)); }); var r = range(); if (cur >= 0) cur = Math.max(r[0], Math.min(r[1], cur)); draw(); }); });

  // ---- neural calibration: three options under study, each with its own picture ----
  // the study room and its anchors (x, y, z in metres), as in the hot–cold simulator; the tag at 1 m
  var ANCH = [[0, 0, 2], [8, 0, 2], [8, 12, 2], [0, 12, 2], [0, 6, 0.3], [4, 0, 0.3], [8, 6, 0.3], [4, 12, 0.3]], TAGZ = 1.0;
  var opt = "1", tag = [3, 7.5], refl = [false, false, false, false, false, false, true, false];
  var NOISE = [0.012, -0.018, 0.009, 0.021, -0.006, 0.015, -0.011, 0.004];
  function rng3(p, a){ return Math.sqrt(Math.pow(p[0] - a[0], 2) + Math.pow(p[1] - a[1], 2) + Math.pow(TAGZ - a[2], 2)); }
  // least squares on the anchors given (Gauss–Newton, as the solver does with Levenberg–Marquardt)
  function solve(r, use){
    var p = [4, 6];
    for (var it = 0; it < 25; it++) {
      var a11 = 0, a12 = 0, a22 = 0, b1 = 0, b2 = 0;
      use.forEach(function(i){ var a = ANCH[i], d = rng3(p, a) || 1e-6, jx = (p[0] - a[0]) / d, jy = (p[1] - a[1]) / d, e = r[i] - d;
        a11 += jx * jx; a12 += jx * jy; a22 += jy * jy; b1 += jx * e; b2 += jy * e; });
      var det = a11 * a22 - a12 * a12 + 1e-9, dx = (a22 * b1 - a12 * b2) / det, dy = (a11 * b2 - a12 * b1) / det;
      p = [p[0] + dx, p[1] + dy]; if (Math.abs(dx) + Math.abs(dy) < 1e-6) break;
    }
    var res = Math.sqrt(use.reduce(function(t, i){ return t + Math.pow(r[i] - rng3(p, ANCH[i]), 2); }, 0) / use.length);
    return { p: p, res: res };
  }
  function positions(){
    var r = ANCH.map(function(a, i){ return rng3(tag, a) + NOISE[i] + (refl[i] ? 1.0 : 0); }), all = [0, 1, 2, 3, 4, 5, 6, 7];
    var ls = solve(r, all), net = ls, out = -1;
    // what the network would learn: when the eight ranges do not agree, the one that breaks the agreement is left out
    if (ls.res > 0.08) all.forEach(function(k){ var o = solve(r, all.filter(function(i){ return i !== k; })); if (o.res < net.res) { net = o; out = k; } });
    return { ls: ls.p, net: net.p, out: out };
  }
  var MK = '<defs><marker id="fxA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--ink-2)"/></marker></defs>';
  function box(x, y, w, h, a, b, kind){
    var f = kind === "new" ? "#e8f6f4" : kind === "out" ? "var(--wash)" : "var(--bg)", st = kind === "new" ? TEAL : kind === "gone" ? "var(--line)" : "var(--ink-2)";
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" fill="' + f + '" stroke="' + st + '" stroke-width="1.3"' + (kind === "gone" ? ' stroke-dasharray="4 3"' : "") + "/>" +
      txt(x + w / 2, y + (b ? h / 2 - 2 : h / 2 + 4), T(a), { a: "middle", c: kind === "gone" ? "var(--ink-2)" : "var(--ink)", w: 1, s: 10.5 }) + (b ? txt(x + w / 2, y + h / 2 + 11, T(b), { a: "middle", s: 9 }) : "");
  }
  function arrow(x1, y1, x2, y2){ return '<path d="M' + x1 + " " + y1 + (y1 === y2 ? "" : " H" + ((x1 + x2) / 2) + " V" + y2) + " H" + x2 + '" fill="none" stroke="var(--ink-2)" stroke-width="1.3" marker-end="url(#fxA)"/>'; }
  function row(y, items){ var s = ""; items.forEach(function(it, i){ s += box(it[0], y, it[1], 40, it[2], it[3], it[4]); if (i) { var p = items[i - 1]; s += arrow(p[0] + p[1] + 2, y + 20, it[0] - 3, y + 20); } }); return s; }
  function today(y){
    return txt(16, y - 8, T("Today"), { c: "var(--ink)", w: 1 }) + row(y, [[16, 78, "8 raw ranges", "UWB"], [110, 96, "Polynomial", "one per anchor"], [222, 78, "Smoothing", "α = 0.4"], [316, 104, "Least squares", "Levenberg–Marquardt"], [436, 68, "x, y"]]);
  }
  function calib(){
    var s = MK, h = "";
    if (opt === "1") {
      s += today(44) + txt(16, 146, T("Option 1"), { c: TEAL, w: 1 }) +
        row(154, [[16, 92, "Raw range", "+ anchor, IMU"], [124, 82, "MLP", "per range", "new"], [222, 78, "Calibrated", "range"], [316, 104, "Least squares", "Levenberg–Marquardt"], [436, 68, "x, y"]]) +
        '<path d="M158 86 V151" stroke="' + TEAL + '" stroke-dasharray="3 3" fill="none"/>' + txt(164, 122, T("replaces the polynomials"), { s: 9, c: TEAL }) +
        txt(16, 232, T("Training: the tag on known points of the room, measured with a laser or another ground truth;"), { s: 9.5 }) +
        txt(16, 246, T("the network minimises the gap between its range and the true geometric distance."), { s: 9.5 });
      h = "<p>" + T("The most direct option. Instead of a fixed polynomial, an <b>MLP</b> cleans the raw range of each anchor before it reaches the positioning algorithm.") + "</p>" +
        '<dl class="fx-dl"><dt>' + T("Input") + "</dt><dd>" + T("The raw UWB range, the anchor’s index, to map the room, and optionally the tag’s yaw, pitch and roll from the IMU, to correct the distortions of the antenna.") + "</dd>" +
        "<dt>" + T("Output") + "</dt><dd>" + T("The calibrated range.") + "</dd>" +
        "<dt>" + T("Advantage") + "</dt><dd>" + T("A non-linear function far more powerful than a polynomial, able to learn and correct the shadow zones of the room.") + "</dd></dl>";
    } else if (opt === "2") {
      var P = positions(), S = 18.5, OX = 352, OY = 30, px = function(x){ return OX + x * S; }, py = function(y){ return OY + (12 - y) * S; };
      s += txt(16, 26, T("Today"), { c: "var(--ink)", w: 1 }) + row(34, [[16, 64, "8 ranges"], [96, 80, "Polynomials"], [192, 90, "Least squares"], [298, 40, "x, y"]]) +
        txt(16, 162, T("Option 2"), { c: TEAL, w: 1 }) + row(170, [[16, 80, "8 raw ranges", "d1 … d8"], [112, 92, "Deep network", "learns the room", "new"], [220, 40, "x, y"]]) +
        txt(16, 236, T("Calibration and multilateration in one step."), { s: 9.5 });
      // the room: click an anchor to add or remove a reflection, click inside to move the tag
      s += '<rect class="fx-room" x="' + px(0) + '" y="' + py(12) + '" width="' + 8 * S + '" height="' + 12 * S + '" fill="var(--wash)" stroke="var(--ink-2)"/>';
      ANCH.forEach(function(a, i){
        var X = px(a[0]), Y = py(a[1]), d = rng3(tag, a);
        if (refl[i]) { var ux = (tag[0] - a[0]), uy = (tag[1] - a[1]), n = Math.hypot(ux, uy) || 1; s += '<line x1="' + X + '" y1="' + Y + '" x2="' + px(a[0] + ux / n * (Math.hypot(ux, uy) + 1)) + '" y2="' + py(a[1] + uy / n * (Math.hypot(ux, uy) + 1)) + '" stroke="#d9452b" stroke-width="1.3" stroke-dasharray="3 3"/>'; }
        s += '<g class="fx-anc" data-a="' + i + '" tabindex="0" role="button" aria-pressed="' + refl[i] + '" aria-label="' + T("Anchor") + " " + (i + 1) + '"><circle cx="' + X + '" cy="' + Y + '" r="11" fill="transparent"/><path transform="translate(' + X + " " + Y + ')" d="M0 -6.5 L6.5 0 L0 6.5 L-6.5 0 Z" fill="' + (refl[i] ? "#d9452b" : "var(--ink)") + '"/></g>';
        void d;
      });
      var e1 = Math.hypot(P.ls[0] - tag[0], P.ls[1] - tag[1]), e2 = Math.hypot(P.net[0] - tag[0], P.net[1] - tag[1]);
      s += '<circle cx="' + px(tag[0]) + '" cy="' + py(tag[1]) + '" r="7" fill="none" stroke="var(--ink)" stroke-width="1.5"/>' +
        '<circle cx="' + px(P.ls[0]) + '" cy="' + py(P.ls[1]) + '" r="4.5" fill="' + GREY + '"/>' + '<circle cx="' + px(P.net[0]) + '" cy="' + py(P.net[1]) + '" r="4.5" fill="' + TEAL + '"/>';
      s += txt(OX, 278, T("8 × 12 m, the study room"), { s: 9 });
      h = "<p>" + T("Classic calibration and multilateration are both skipped: the network learns the <b>spatial map</b> of the room, from the eight raw ranges read together straight to the tag’s coordinates.") + "</p>" +
        "<p>" + T("With least squares, one anchor reflected off a wall and a metre long shifts the whole solution. A deep network learns which combinations of ranges hold together: if seven agree and one is clearly a reflection, it ignores that one, and works as calibrator and positioner at once.") + "</p>" +
        '<table class="fx-read"><tbody><tr><th scope="row"><span class="fx-k" style="background:' + GREY + '"></span>' + T("Least squares") + '</th><td class="num">' + F(e1 * 100, 0) + " cm</td></tr>" +
        '<tr><th scope="row"><span class="fx-k" style="background:' + TEAL + '"></span>' + T("Network") + '</th><td class="num"><b>' + F(e2 * 100, 0) + " cm</b></td></tr></tbody></table>" +
        '<p class="fx-hint">' + T("The ring is the tag. Click an anchor to add or remove a wall reflection (+1 m); click in the room to move the tag.") + "</p>";
    } else {
      s += today(34) + txt(16, 126, T("Option 3"), { c: TEAL, w: 1 }) +
        row(134, [[16, 92, "Raw ranges", "+ anchor"], [124, 82, "Network", "calibrates", "new"], [222, 78, "Calibrated", "ranges"], [316, 104, "Position", ""], [436, 68, "x, y"]]) +
        '<rect x="124" y="204" width="296" height="62" rx="6" fill="var(--bg)" stroke="' + TEAL + '" stroke-width="1.3"/>' +
        txt(272, 220, T("Loss = error on the known points + λ · physics"), { a: "middle", c: "var(--ink)", w: 1, s: 10.5 }) +
        txt(272, 237, T("physics: the position falls outside the room,"), { a: "middle", s: 9.5 }) +
        txt(272, 251, T("or the ranges form triangles that cannot exist"), { a: "middle", s: 9.5 }) +
        '<path d="M368 176 V198" stroke="var(--ink-2)" stroke-width="1.3" fill="none" marker-end="url(#fxA)"/><path d="M165 202 V180" stroke="' + TEAL + '" stroke-width="1.3" fill="none" marker-end="url(#fxA)"/>' +
        txt(172, 196, T("penalises"), { s: 9, c: TEAL });
      h = "<p>" + T("The most advanced option. The laws of physics, the <b>Euclidean geometry</b> of the room and the propagation speed of the signal, go straight into the loss function in TensorFlow.") + "</p>" +
        '<dl class="fx-dl"><dt>' + T("How it works") + "</dt><dd>" + T("The network calibrates the ranges, and is penalised not only when it misses the test points, but also when the calibrated ranges break the rules of geometry.") + "</dd>" +
        "<dt>" + T("Advantage") + "</dt><dd>" + T("It needs far less training data than a plain network, because it already knows the rules of geometry.") + "</dd></dl>";
    }
    svg.innerHTML = s; side.innerHTML = h;
    svg.setAttribute("aria-label", T(opt === "2" ? "End-to-end network and the study room with its eight anchors" : "Today’s pipeline and the proposed one"));
  }
  svg.addEventListener("click", function(e){
    if (topic !== "calib" || opt !== "2") return;
    var g = e.target.closest(".fx-anc");
    if (g) { var i = +g.getAttribute("data-a"); refl[i] = !refl[i]; calib(); var n = svg.querySelector('.fx-anc[data-a="' + i + '"]'); if (n && e.detail === 0) n.focus(); return; }
    if (!e.target.closest(".fx-room")) return;
    var r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal, x = (e.clientX - r.left) / r.width * vb.width, y = (e.clientY - r.top) / r.height * vb.height;
    tag = [Math.max(0.3, Math.min(7.7, (x - 352) / 18.5)), Math.max(0.3, Math.min(11.7, 12 - (y - 30) / 18.5))]; calib();
  });
  svg.addEventListener("keydown", function(e){
    if (topic !== "calib" || (e.key !== "Enter" && e.key !== " ")) return;
    var g = e.target.closest && e.target.closest(".fx-anc"); if (!g) return;
    e.preventDefault(); var i = +g.getAttribute("data-a"); refl[i] = !refl[i]; calib(); var n = svg.querySelector('.fx-anc[data-a="' + i + '"]'); if (n) n.focus();
  });
  root.querySelectorAll("[data-c]").forEach(function(b){ b.addEventListener("click", function(){ opt = b.getAttribute("data-c"); root.querySelectorAll("[data-c]").forEach(function(o){ o.setAttribute("aria-selected", String(o === b)); }); calib(); }); });
  // the two topics share the text column and the explorer: switching one swaps both
  var sec = root.closest("section") || document;
  sec.querySelectorAll(".fx-topics [data-topic]").forEach(function(b){ b.addEventListener("click", function(){
    topic = b.getAttribute("data-topic");
    sec.querySelectorAll(".fx-topics [data-topic]").forEach(function(o){ o.setAttribute("aria-pressed", String(o === b)); });
    sec.querySelectorAll("[data-topic]:not(button)").forEach(function(el){ el.hidden = el.getAttribute("data-topic") !== topic; });
    cur = -1; root.classList.toggle("is-calib", topic === "calib");
    if (topic === "calib") { svg.removeAttribute("tabindex"); calib(); } else { svg.setAttribute("tabindex", "0"); svg.setAttribute("aria-label", T("Simulated signals and smoothing over a 30-second session")); draw(); }
  }); });
  draw();
})();
