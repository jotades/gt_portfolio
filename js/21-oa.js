(function(){
  var root = document.getElementById("oa");
  if (!root) return;
  var S = {"first": {"End-point distance (m)": {"v": [[1.85, 1.04], [1.91, 1.08], [2.65, 1.56], [3.01, 1.56]], "a": [[5.62, 0.042], [0.47, 0.512], [0.08, 0.78]]}, "Trajectory distance, DTW (m)": {"v": [[1.34, 0.75], [1.46, 0.87], [1.71, 0.71], [1.74, 0.79]], "a": [[2.36, 0.159], [0.37, 0.556], [0.1, 0.757]]}, "Correspondence within 0.5 m (%)": {"v": [[40.3, 16.6], [44.0, 22.8], [39.7, 17.3], [42.7, 20.0]], "a": null}, "Correspondence within 1.0 m (%)": {"v": [[62.8, 19.7], [63.2, 24.2], [55.8, 16.6], [60.5, 19.0]], "a": null}, "Length change, Δℓ (m)": {"v": [[17.0, 28.1], [18.9, 24.6], [10.8, 13.9], [21.8, 35.7]], "a": [[0.13, 0.722], [2.03, 0.187], [0.3, 0.598]]}, "Trajectory length (m)": {"v": [[43.3, 28.0], [44.1, 26.0], [38.6, 13.8], [52.2, 38.0]], "a": null}, "Duration (s)": {"v": [[70.2, 45.0], [79.5, 48.9], [72.3, 20.8], [91.9, 48.7]], "a": [[0.67, 0.435], [3.36, 0.1], [0.33, 0.58]]}, "Walking speed (m/s)": {"v": [[0.64, 0.26], [0.57, 0.14], [0.55, 0.12], [0.56, 0.28]], "a": [[1.61, 0.236], [1.44, 0.261], [0.47, 0.509]]}, "Pauses, total per trial (s)": {"v": [[15.5, 11.2], [19.0, 14.0], [17.6, 10.6], [21.5, 16.1]], "a": [[0.38, 0.554], [1.75, 0.219], [0.01, 0.938]]}, "Border crossings (count)": {"v": [[1.15, 1.68], [1.5, 1.97], [0.95, 1.28], [1.4, 1.47]], "a": [[0.28, 0.607], [5.7, 0.041], [0.03, 0.869]]}, "Movement intensity (m/s²)": {"v": [[1.12, 0.36], [1.11, 0.29], [1.12, 0.31], [1.17, 0.31]], "a": [[0.66, 0.437], [0.36, 0.565], [0.65, 0.441]]}}, "second": {"Return distance (m)": {"v": [[2.29, 1.57], [2.5, 1.97], [2.57, 1.84], [2.64, 1.25]], "a": [[0.44, 0.522], [0.34, 0.573], [0.01, 0.915]]}, "Trajectory distance, DTW (m)": {"v": [[2.21, 0.98], [2.01, 1.05], [2.27, 1.33], [2.36, 1.1]], "a": [[0.71, 0.421], [0.06, 0.812], [0.13, 0.729]]}, "Correspondence within 0.5 m (%)": {"v": [[18.4, 14.0], [22.9, 16.0], [19.0, 18.0], [17.2, 21.8]], "a": null}, "Correspondence within 1.0 m (%)": {"v": [[36.4, 22.3], [39.2, 19.6], [37.7, 34.3], [32.5, 33.5]], "a": null}, "Length change, Δℓ (m)": {"v": [[-1.4, 6.4], [4.4, 7.1], [-2.9, 8.6], [0.9, 13.8]], "a": [[1.04, 0.335], [7.35, 0.024], [0.33, 0.578]]}, "Trajectory length (m)": {"v": [[11.7, 5.5], [16.0, 7.0], [9.3, 3.8], [15.6, 11.3]], "a": null}, "Duration (s)": {"v": [[20.9, 10.1], [24.9, 7.7], [19.9, 8.1], [33.2, 26.9]], "a": [[1.32, 0.281], [5.23, 0.048], [0.97, 0.349]]}, "Walking speed (m/s)": {"v": [[0.59, 0.19], [0.62, 0.12], [0.5, 0.25], [0.52, 0.28]], "a": [[1.33, 0.279], [0.44, 0.525], [0.03, 0.876]]}, "Pauses, total per trial (s)": {"v": [[4.6, 4.6], [5.2, 2.4], [6.9, 6.0], [12.5, 12.4]], "a": [[6.73, 0.029], [2.81, 0.128], [0.8, 0.393]]}, "Border crossings (count)": {"v": [[0.35, 0.41], [0.7, 0.82], [0.25, 0.42], [0.3, 0.48]], "a": [[2.65, 0.138], [2.25, 0.168], [0.89, 0.37]]}, "Movement intensity (m/s²)": {"v": [[1.3, 0.34], [1.2, 0.31], [1.26, 0.55], [1.32, 0.59]], "a": [[0.09, 0.765], [0.08, 0.784], [0.96, 0.353]]}}, "landmarks1m": [88.3, 81.7, 78.3, 81.7], "landmarks05": [68.3, 60.0, 55.0, 81.7], "ratings": {"pleasant": [3.12, 2.81, 4.07, 3.94], "useful": [3.2, 2.83, 3.6, 3.62]}};
  function q(s){ return root.querySelector(s); }
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ROUTES = { A: [[6, 5], [6, 7.5], [2.5, 7.5]], B: [[6, 8.5], [4, 8.5], [4, 5.5]], C: [[2.5, 7], [6, 7], [6, 3.5]], D: [[6, 5], [2, 5], [2, 7.5]], E: [[6.5, 3.5], [4, 3.5], [4, 8]], F: [[3.5, 8], [3.5, 3.5], [6, 3.5]], G: [[1.5, 5.5], [4.5, 5.5], [4.5, 9.5]], H: [[4, 2.5], [4, 6.5], [6, 6.5]] };
  var COND_COL = { AP: "#e8577b", AE: "#9f1239", HP: "#60a5fa", HE: "#1e3a8a" };
  var PROF = [[200, 400], [500, 700], [800, 1000]];
  // tabs
  root.querySelectorAll("[data-tab]").forEach(function(b){ b.addEventListener("click", function(){ root.querySelectorAll("[data-tab]").forEach(function(o){ o.setAttribute("aria-selected", String(o === b)); }); root.querySelectorAll("[data-pane]").forEach(function(p){ p.hidden = p.getAttribute("data-pane") !== b.getAttribute("data-tab"); }); if (b.getAttribute("data-tab") === "stats") drawStats(); }); });
  // ---------- synthetic sessions
  function rng(seed){ return function(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(s){ var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h; }
  function clampP(p){ return [Math.max(1, Math.min(7, p[0])), Math.max(2, Math.min(10, p[1]))]; }
  var SE = { A: [[4, 5], [2.5, 4]], B: [[6, 4], [2, 5.5]], C: [[2.5, 9.5], [4, 3.5]], D: [[6, 8.5], [3.5, 7.5]], E: [[6.5, 6], [2, 8]], F: [[1.5, 8], [6, 6]], G: [[1.5, 3], [6.5, 9.5]], H: [[1.5, 2.5], [6, 9.5]] };
  function waypoints(L, route){ return [SE[route][0]].concat(L, [SE[route][1]]); }
  var DEV = { AP: 1.9, AE: 2.1, HP: 2.4, HE: 2.6 };
  function walk(pts, r, phase, cond){
    var out = [], t = 0, p = pts[0].slice(), dev = phase === "learn" ? 0.12 : DEV[cond], speed = phase === "learn" ? 0.5 : 0.55, off = [0, 0];
    for (var k = 1; k < pts.length; k++) {
      var target = pts[k].slice(); if (phase !== "learn") { target[0] += (r() - 0.5) * dev * 1.3; target[1] += (r() - 0.5) * dev * 1.3; if (k === pts.length - 1) { var a = r() * Math.PI * 2, dd = 1.2 + dev * 1.8 * r(); target = [pts[k][0] + Math.cos(a) * dd, pts[k][1] + Math.sin(a) * dd]; } }
      target = [Math.max(0.6, Math.min(7.4, target[0])), Math.max(1, Math.min(11, target[1]))];
      var wander = phase !== "learn" && r() < 0.5 + dev * 0.15;
      if (wander) { var w = [p[0] + (target[0] - p[0]) * 0.5 + (r() - 0.5) * 3 * dev, p[1] + (target[1] - p[1]) * 0.5 + (r() - 0.5) * 3 * dev]; seg(w); }
      seg(target);
      var pause = phase === "learn" ? (k < pts.length - 1 ? 30 : 0) : Math.round(r() * 60 * dev); for (var z = 0; z < pause; z++) { t += 0.1; out.push([t, p[0] + (r() - 0.5) * 0.03, p[1] + (r() - 0.5) * 0.03]); }
    }
    function seg(q2){ var d = Math.hypot(q2[0] - p[0], q2[1] - p[1]), n = Math.max(1, Math.round(d / (speed * 0.1))); for (var i = 0; i < n; i++) { off[0] = off[0] * 0.92 + (r() - 0.5) * 0.04 * (1 + dev); off[1] = off[1] * 0.92 + (r() - 0.5) * 0.04 * (1 + dev); p = [p[0] + (q2[0] - p[0]) / (n - i) + off[0] * 0.2, p[1] + (q2[1] - p[1]) / (n - i) + off[1] * 0.2]; t += 0.1; out.push([t, p[0], p[1]]); } }
    return out;
  }
  function resample(tr, n){ var L = [0]; for (var i = 1; i < tr.length; i++) L.push(L[i - 1] + Math.hypot(tr[i][1] - tr[i - 1][1], tr[i][2] - tr[i - 1][2])); var out = [], tot = L[L.length - 1], j = 0; for (var k = 0; k < n; k++) { var s = tot * k / (n - 1); while (j < L.length - 2 && L[j + 1] < s) j++; var f = (s - L[j]) / ((L[j + 1] - L[j]) || 1); out.push([tr[j][1] + (tr[j + 1][1] - tr[j][1]) * f, tr[j][2] + (tr[j + 1][2] - tr[j][2]) * f]); } return { pts: out, len: tot }; }
  function dist(a, b){ return Math.hypot(a[0] - b[0], a[1] - b[1]); }
  function dtw(a, b){ var n = a.length, m = b.length, D = [], P = []; for (var i = 0; i <= n; i++) { D.push(new Array(m + 1).fill(Infinity)); P.push(new Array(m + 1).fill(0)); } D[0][0] = 0; for (i = 1; i <= n; i++) for (var j = 1; j <= m; j++) { var c = dist(a[i - 1], b[j - 1]), best = Math.min(D[i - 1][j], D[i][j - 1], D[i - 1][j - 1]); D[i][j] = c + best; P[i][j] = (best === D[i - 1][j - 1] ? P[i - 1][j - 1] : best === D[i - 1][j] ? P[i - 1][j] : P[i][j - 1]) + 1; } return D[n][m] / P[n][m]; }
  function frechet(a, b){ var n = a.length, m = b.length, C = []; for (var i = 0; i < n; i++) { C.push([]); for (var j = 0; j < m; j++) { var d = dist(a[i], b[j]); C[i][j] = i === 0 && j === 0 ? d : i === 0 ? Math.max(C[0][j - 1], d) : j === 0 ? Math.max(C[i - 1][0], d) : Math.max(Math.min(C[i - 1][j], C[i - 1][j - 1], C[i][j - 1]), d); } } return C[n - 1][m - 1]; }
  var sess = null, tcur = 1;
  function build(){
    var cond = q('[data-c="cond"]').value, route = q('[data-c="route"]').value, seed = hash(route + cond), r = rng(seed), L = ROUTES[route], wp = waypoints(L, route);
    var perm = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]][Math.floor(r() * 6)];
    var learn1 = walk(wp, rng(seed ^ 0x55), "learn", cond), expl1 = walk(wp, rng(seed ^ 0x99), "expl", cond);
    // second task: back from the end of the first one to the start, with no signal
    var RET = { AP: 2.29, AE: 2.5, HP: 2.57, HE: 2.64 }, rb = rng(seed ^ 0x33);
    function back(from, phase){
      var S = wp[0], to = S.slice();
      if (phase !== "learn") { var a = rb() * Math.PI * 2, d = RET[cond] * (0.45 + rb() * 1.1); to = [Math.max(0.6, Math.min(7.4, S[0] + Math.cos(a) * d)), Math.max(1, Math.min(11, S[1] + Math.sin(a) * d))]; }
      var f = [from[1], from[2]], mid = [(f[0] + to[0]) / 2, (f[1] + to[1]) / 2], dx = to[0] - f[0], dy = to[1] - f[1], n = Math.hypot(dx, dy) || 1, k = (rb() - 0.5) * (phase === "learn" ? 0.4 : 2.4);
      mid = [mid[0] - dy / n * k, mid[1] + dx / n * k];
      var tr = walk([f, mid, to], rng(seed ^ (phase === "learn" ? 0x11 : 0x22)), "learn", cond), t0 = from[0] + 3;
      return tr.filter(function(p, i){ return i === 0 || Math.hypot(p[1] - tr[i - 1][1], p[2] - tr[i - 1][2]) > 0.001 || i % 4 === 0; }).map(function(p){ return [p[0] + t0, p[1], p[2]]; });
    }
    var learn2 = back(learn1[learn1.length - 1], "learn"), expl2 = back(expl1[expl1.length - 1], "expl");
    var learn = learn1.concat(learn2), expl = expl1.concat(expl2);
    function series(tr){ return tr.map(function(p){ var ds = L.map(function(l){ return dist([p[1], p[2]], l); }), inten = 0; if (cond !== "HE") ds.forEach(function(d, k){ if (d < 1.0) { var b = Math.max(0, Math.floor((d - 0.4) / 0.2)), pr = PROF[perm[k]], v = cond === "AE" ? (pr[0] + pr[1]) / 2 : pr[1] - Math.min(2, b) / 2 * (pr[1] - pr[0]); inten = Math.max(inten, v); } }); return { t: p[0], d: ds, i: inten }; }); }
    var se = series(expl1).concat(expl2.map(function(p){ return { t: p[0], d: L.map(function(l){ return dist([p[1], p[2]], l); }), i: 0 }; }));
    sess = { cond: cond, route: route, L: L, wp: wp, learn: learn, expl: expl, learn1: learn1, expl1: expl1, learn2: learn2, expl2: expl2, se: se, perm: perm, tSplit: expl2[0][0] };
    metrics();
    tcur = 1; q('[data-p="scrub"]').value = 1000; draw();
  }
  var otask = 1;
  function metrics(){
    if (!sess) return;
    var A = otask === 1 ? sess.learn1 : sess.learn2, Bx = otask === 1 ? sess.expl1 : sess.expl2, L = sess.L, S = sess.wp[0];
    var a = resample(A, 100), b = resample(Bx, 100), endL = A[A.length - 1], endE = Bx[Bx.length - 1];
    var corr = function(th){ var c = 0; b.pts.forEach(function(p){ if (a.pts.some(function(qq){ return dist(p, qq) <= th; })) c++; }); return Math.round(c / b.pts.length * 100); };
    var reached = function(th){ return L.filter(function(l){ return sess.expl1.some(function(p){ return dist([p[1], p[2]], l) <= th; }); }).length; };
    var M = [["Trajectory distance, DTW", dtw(a.pts, b.pts).toFixed(2) + " m"], ["Discrete Fréchet", frechet(a.pts, b.pts).toFixed(2) + " m"], (otask === 1 ? ["End-point distance", dist([endL[1], endL[2]], [endE[1], endE[2]]).toFixed(2) + " m"] : ["Return distance, to the start", dist(S, [endE[1], endE[2]]).toFixed(2) + " m"]), ["Correspondence 0.5 / 1.0 m", corr(0.5) + "% / " + corr(1.0) + "%"], ["Length change, Δℓ", (b.len - a.len >= 0 ? "+" : "") + (b.len - a.len).toFixed(1) + " m"], (otask === 1 ? ["Landmarks within 1.0 / 0.5 m", reached(1.0) + " / " + reached(0.5) + " of 3"] : ["Duration of the walk back", Math.round(endE[0] - Bx[0][0]) + " s"])];
    q(".oa-metrics").innerHTML = M.map(function(m){ return "<div><b>" + m[1] + "</b><span>" + m[0] + "</span></div>"; }).join("");
  }
  root.querySelectorAll("[data-otask]").forEach(function(b){ b.addEventListener("click", function(){ otask = +b.getAttribute("data-otask"); root.querySelectorAll("[data-otask]").forEach(function(o){ o.setAttribute("aria-pressed", String(o === b)); }); metrics(); }); });
  var PX = 30, H = 12;
  function X(x){ return x * PX; } function Y(y){ return (H - y) * PX; }
  function draw(){
    if (!sess) return;
    var showL = q('[data-c="learn"]').checked, showE = q('[data-c="expl"]').checked, tmax = Math.max(sess.learn[sess.learn.length - 1][0], sess.expl[sess.expl.length - 1][0]), tt = tcur * tmax;
    var s = '<rect x="0" y="0" width="' + X(8) + '" height="' + H * PX + '" fill="#f9fafb" stroke="#d0d5dd"/><rect x="' + X(1) + '" y="' + Y(10) + '" width="' + X(6) + '" height="' + 8 * PX + '" fill="none" stroke="#98a2b3" stroke-dasharray="4 4"/>';
    sess.L.forEach(function(l, k){ s += '<circle cx="' + X(l[0]) + '" cy="' + Y(l[1]) + '" r="' + PX + '" fill="#101828" fill-opacity=".04" stroke="#98a2b3" stroke-dasharray="2 3"/><circle cx="' + X(l[0]) + '" cy="' + Y(l[1]) + '" r="7" fill="#fff" stroke="#101828" stroke-width="2"/><text x="' + X(l[0]) + '" y="' + (Y(l[1]) - 11) + '" font-size="9" text-anchor="middle" fill="#101828">O' + (sess.perm[k] + 1) + "</text>"; });
    s += '<text x="' + X(sess.wp[0][0]) + '" y="' + (Y(sess.wp[0][1]) + 14) + '" font-size="10" font-weight="700" text-anchor="middle" fill="#101828">S</text><text x="' + X(sess.wp[4][0]) + '" y="' + (Y(sess.wp[4][1]) - 8) + '" font-size="10" font-weight="700" text-anchor="middle" fill="#101828">E</text>';
    function line(pts, col, dash){ return pts.length ? '<path d="' + pts.map(function(p, i){ return (i ? "L" : "M") + X(p[1]).toFixed(1) + " " + Y(p[2]).toFixed(1); }).join(" ") + '" fill="none" stroke="' + col + '" stroke-width="' + (dash ? 2 : 2.4) + '" stroke-dasharray="' + (dash ? "6 4" : "") + '" stroke-linejoin="round"/>' : ""; }
    [[showL, sess.learn1, sess.learn2, "var(--oa-l)"], [showE, sess.expl1, sess.expl2, "var(--oa-e)"]].forEach(function(v){
      if (!v[0]) return;
      var p1 = v[1].filter(function(p){ return p[0] <= tt; }), p2 = v[2].filter(function(p){ return p[0] <= tt; });
      s += line(p1, v[3], false) + line(p2, v[3], true);
      if (p2.length) { var m = v[1][v[1].length - 1]; s += '<circle cx="' + X(m[1]).toFixed(1) + '" cy="' + Y(m[2]).toFixed(1) + '" r="6" fill="#fff" stroke="' + v[3] + '" stroke-width="2.4"/>'; }
      var lp = (p2.length ? p2 : p1)[(p2.length ? p2 : p1).length - 1]; if (lp) s += '<circle cx="' + X(lp[1]).toFixed(1) + '" cy="' + Y(lp[2]).toFixed(1) + '" r="5" fill="' + v[3] + '" stroke="#fff" stroke-width="2"/>';
    });
    s += '<g font-size="9" fill="#475467"><line x1="4" y1="' + (H * PX + 14) + '" x2="22" y2="' + (H * PX + 14) + '" stroke="var(--oa-l)" stroke-width="2.4"/><text x="26" y="' + (H * PX + 17) + '">learning</text><line x1="80" y1="' + (H * PX + 14) + '" x2="98" y2="' + (H * PX + 14) + '" stroke="var(--oa-e)" stroke-width="2.4"/><text x="102" y="' + (H * PX + 17) + '">exploration</text><line x1="4" y1="' + (H * PX + 30) + '" x2="22" y2="' + (H * PX + 30) + '" stroke="#475467" stroke-width="2"/><text x="26" y="' + (H * PX + 33) + '">first task</text><line x1="80" y1="' + (H * PX + 30) + '" x2="98" y2="' + (H * PX + 30) + '" stroke="#475467" stroke-width="2" stroke-dasharray="6 4"/><text x="102" y="' + (H * PX + 33) + '">second task</text><circle cx="168" cy="' + (H * PX + 27) + '" r="4.5" fill="#fff" stroke="#475467" stroke-width="2"/><text x="176" y="' + (H * PX + 30) + '">marked end</text></g>';
    q(".oa-traj svg").innerHTML = s;
    q('[data-p="t"]').textContent = Math.round(tt) + " s";
    // time series: exploration (and learning, faint)
    var ser = sess.se, T0 = 30, T1 = 410, tm = sess.expl[sess.expl.length - 1][0], tx = function(t){ return T0 + t / tm * (T1 - T0); }, ds = "", cols = ["#eab308", "#3b82f6", "#e8577b"];
    var dmax = 6, dy = function(d){ return 112 - Math.min(dmax, d) / dmax * 100; };
    [1.0, 0.6].forEach(function(v){ ds += '<line x1="' + T0 + '" y1="' + dy(v) + '" x2="' + T1 + '" y2="' + dy(v) + '" stroke="#98a2b3" stroke-dasharray="4 4"/><text x="' + (T1 + 2) + '" y="' + (dy(v) + 3) + '" font-size="8" fill="#667085">' + v + " m</text>"; });
    for (var k = 0; k < 3; k++) { ds += '<path d="' + ser.map(function(p, i){ return (i ? "L" : "M") + tx(p.t).toFixed(1) + " " + dy(p.d[k]).toFixed(1); }).join(" ") + '" fill="none" stroke="' + cols[k] + '" stroke-width="1.6"/>'; }
    var xs2 = tx(sess.tSplit); ds += '<line x1="' + xs2 + '" y1="8" x2="' + xs2 + '" y2="114" stroke="#98a2b3"/><text x="' + (xs2 + 3) + '" y="16" font-size="8" fill="#667085">task 2</text>';
    var cx = tx(Math.min(tt, tm)); ds += '<line x1="' + cx + '" y1="8" x2="' + cx + '" y2="114" stroke="#d92d20" stroke-dasharray="5 4"/><text x="' + T0 + '" y="126" font-size="8" fill="#667085">0 s</text><text x="' + T1 + '" y="126" font-size="8" text-anchor="end" fill="#667085">' + Math.round(tm) + " s, exploration</text>";
    q('[data-ts="dist"]').innerHTML = ds;
    var is = "", iy = function(v){ return 95 - v / 1000 * 85; };
    is += '<path d="' + ser.map(function(p, i){ return (i ? "L" + tx(p.t).toFixed(1) + " " + iy(ser[i - 1].i).toFixed(1) + " L" : "M") + tx(p.t).toFixed(1) + " " + iy(p.i).toFixed(1); }).join(" ") + '" fill="none" stroke="var(--oa-e)" stroke-width="1.8"/>';
    [0, 500, 1000].forEach(function(v){ is += '<text x="' + (T0 - 4) + '" y="' + (iy(v) + 3) + '" font-size="8" text-anchor="end" fill="#667085">' + v + "</text>"; });
    is += '<line x1="' + cx + '" y1="6" x2="' + cx + '" y2="98" stroke="#d92d20" stroke-dasharray="5 4"/>' + (sess.cond === "HE" ? '<text x="220" y="55" font-size="10" text-anchor="middle" fill="#667085">no signal in this condition: the landmarks are floor patches</text>' : "");
    q('[data-ts="int"]').innerHTML = is;
  }
  var rsel = q('[data-c="route"]'); rsel.innerHTML = Object.keys(ROUTES).map(function(k){ return '<option value="' + k + '">' + k + "</option>"; }).join("");
  ["cond", "route"].forEach(function(k){ q('[data-c="' + k + '"]').addEventListener("change", build); });
  ["learn", "expl"].forEach(function(k){ q('[data-c="' + k + '"]').addEventListener("change", draw); });
  var playing = false, raf = 0, last = 0;
  q('[data-p="scrub"]').addEventListener("input", function(e){ tcur = e.target.value / 1000; draw(); });
  q('[data-p="play"]').addEventListener("click", function(){ playing = !playing; this.textContent = playing ? "❚❚" : "▶"; this.setAttribute("aria-label", playing ? "Pause" : "Play"); if (playing) { if (tcur >= 1) tcur = 0; last = 0; raf = requestAnimationFrame(step); } });
  function step(now){ if (!playing) return; var dt = last ? (now - last) / 1000 : 0; last = now; tcur = Math.min(1, tcur + dt / (reduce ? 0.5 : 12)); q('[data-p="scrub"]').value = Math.round(tcur * 1000); draw(); if (tcur < 1) raf = requestAnimationFrame(step); else { playing = false; q('[data-p="play"]').textContent = "▶"; } }
  // ---------- general statistics, from the thesis
  var task = "first", msel = q('[data-c="measure"]');
  function fillMeasures(){ var keys = Object.keys(S[task]); msel.innerHTML = keys.map(function(k){ return "<option>" + k + "</option>"; }).join(""); }
  root.querySelectorAll("[data-task]").forEach(function(b){ b.addEventListener("click", function(){ task = b.getAttribute("data-task"); root.querySelectorAll("[data-task]").forEach(function(o){ o.setAttribute("aria-pressed", String(o === b)); }); fillMeasures(); drawStats(); }); });
  msel.addEventListener("change", drawStats);
  function bars(svg, labels, vals, sds, cols, unit, ymaxIn){
    var W = 440, x0 = 46, x1 = 430, y0 = 220, y1 = 18, mx = ymaxIn || Math.max.apply(null, vals.map(function(v, i){ return v + (sds ? sds[i] : 0); })) * 1.15, mn = Math.min(0, Math.min.apply(null, vals.map(function(v, i){ return v - (sds ? sds[i] : 0); }))) * 1.15, sy = function(v){ return y0 - (v - mn) / (mx - mn) * (y0 - y1); }, s = "";
    for (var g = 0; g <= 4; g++) { var v = mn + (mx - mn) * g / 4; s += '<line x1="' + x0 + '" y1="' + sy(v) + '" x2="' + x1 + '" y2="' + sy(v) + '" stroke="#eaecf0"/><text x="' + (x0 - 5) + '" y="' + (sy(v) + 3) + '" font-size="9" text-anchor="end" fill="#667085">' + (Math.abs(v) >= 10 ? v.toFixed(0) : v.toFixed(2)) + "</text>"; }
    var bw = (x1 - x0) / labels.length * 0.55;
    labels.forEach(function(l, i){ var cx = x0 + (i + 0.5) * (x1 - x0) / labels.length, v = vals[i]; s += '<rect x="' + (cx - bw / 2) + '" y="' + Math.min(sy(v), sy(0)) + '" width="' + bw + '" height="' + Math.abs(sy(v) - sy(0)) + '" rx="5" fill="' + cols[i] + '"><title>' + l + ": " + v + (sds ? " ± " + sds[i] : "") + " " + unit + "</title></rect>"; if (sds) s += '<line x1="' + cx + '" y1="' + sy(v - sds[i]) + '" x2="' + cx + '" y2="' + sy(v + sds[i]) + '" stroke="#101828" stroke-width="1.3"/><line x1="' + (cx - 6) + '" y1="' + sy(v + sds[i]) + '" x2="' + (cx + 6) + '" y2="' + sy(v + sds[i]) + '" stroke="#101828" stroke-width="1.3"/>'; s += '<text x="' + cx + '" y="' + (y0 + 15) + '" font-size="10.5" font-weight="700" text-anchor="middle" fill="#101828">' + l + '</text><text x="' + (cx + bw / 2 + 3) + '" y="' + (sy(v) + (v >= 0 ? 10 : -3)) + '" font-size="9" fill="#344054">' + v + "</text>"; });
    s += '<line x1="' + x0 + '" y1="' + sy(0) + '" x2="' + x1 + '" y2="' + sy(0) + '" stroke="#101828"/>';
    svg.innerHTML = s;
  }
  function drawStats(){
    if (!msel.options.length) fillMeasures();
    var m = S[task][msel.value], vals = m.v.map(function(x){ return x[0]; }), sds = m.v.map(function(x){ return x[1]; });
    bars(q(".oa-bars"), ["AP", "AE", "HP", "HE"], vals, sds, [COND_COL.AP, COND_COL.AE, COND_COL.HP, COND_COL.HE], msel.value.replace(/.*\(([^)]*)\).*/, "$1"));
    var a = m.a, html = "<h4>" + msel.value + "</h4>";
    if (a) html += '<div class="table-wrap"><table><thead><tr><th>Effect</th><th class="num">F(1, 9)</th><th class="num">p</th></tr></thead><tbody>' + [["Modality, auditory vs haptic", a[0]], ["Location, on person vs external", a[1]], ["Interaction", a[2]]].map(function(r){ return "<tr><td>" + r[0] + '</td><td class="num">' + r[1][0].toFixed(2) + '</td><td class="num' + (r[1][1] < 0.05 ? " sig" : "") + '">' + r[1][1].toFixed(3) + (r[1][1] < 0.05 ? " *" : "") + "</td></tr>"; }).join("") + "</tbody></table></div>";
    else html += "<p>Described, not tested.</p>";
    html += "<p>AP auditory on person · AE auditory external · HP haptic on person · HE haptic external. Bars: mean ± SD of the participant means.</p>";
    q(".oa-anova").innerHTML = html;
    var lm = q(".oa-lm"); bars(lm, ["AP 1.0 m", "AE 1.0 m", "HP 1.0 m", "HE 1.0 m"], S.landmarks1m, null, [COND_COL.AP, COND_COL.AE, COND_COL.HP, COND_COL.HE], "%", 100);
    lm.setAttribute("viewBox", "0 0 440 240");
    var rt = q(".oa-rt"); bars(rt, ["AP", "AE", "HP", "HE"], S.ratings.pleasant, null, [COND_COL.AP, COND_COL.AE, COND_COL.HP, COND_COL.HE], "pleasant", 5);
    rt.setAttribute("viewBox", "0 0 440 240");
  }
  build();
})();
