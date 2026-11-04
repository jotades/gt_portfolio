(function(){
  var root = document.getElementById("cx");
  if (!root) return;
  var D = {"oneD": {"deg": [1, 2, 3, 4, 5], "cvmae": [0.293, 0.303, 0.266, 0.277, 0.288], "cvrmse": [0.385, 0.405, 0.373, 0.391, 0.39], "sel": 3, "eq": "d_cal = −0.0014772 d³ + 0.0368844 d² + 0.6898184 d − 0.2211110", "aic_best": [3, -62.07], "bic_best": [1, -57.09]}, "global": {"deg": [1, 2, 3, 4, 5], "train": [0.407, 0.4067, 0.4066, 0.4066, 0.4061], "cvrmse": [0.4076, 0.4073, 0.4077, 0.4089, 0.4083], "cvmae": [0.1859, 0.1857, 0.1859, 0.1864, 0.1866], "aicc": [-1675.1, -1674.4, -1673.1, -1671.1, -1671.2], "bic": [-1665.4, -1659.9, -1653.8, -1647.0, -1642.2], "sel": 2, "eq": "d_cal = 0.0009398 d² + 0.9688854 d − 0.4406730"}, "anchor": {"n": [117, 117, 116, 117, 117, 116, 117, 117], "deg": [3, 2, 1, 1, 2, 1, 3, 1], "cvrmse": [0.283, 0.258, 0.254, 0.181, 0.128, 0.92, 0.227, 0.267], "bic": [1, 1, 1, 1, 2, 1, 3, 2], "aicc": [1, 1, 4, 1, 2, 1, 3, 2], "coef": [[0.001413, -0.036414, 1.267338, -1.047691], [0.003058, 0.947964, -0.305792], [0.979554, -0.372527], [0.997978, -0.664714], [0.00445, 0.941972, -0.37335], [0.955402, -0.42178], [-0.002799, 0.042345, 0.80364, -0.235375], [0.981573, -0.701498]]}, "loc": {"labels": ["1D correction (degree 3)", "2D global (degree 2)", "2D per anchor"], "mean": [0.476, 0.238, 0.184], "centre": 0.141}, "es": {"alpha": 0.4, "tau_ms": 196}, "lat": {"comm": [22, 245], "total": [218, 441]}}, svg = root.querySelector(".cx-chart svg"), side = root.querySelector(".cx-side"), tabs = root.querySelectorAll("[data-t]");
  var X0 = 52, X1 = 505, Y0 = 250, Y1 = 22, selA = 0;
  function T(x, y, s, o){ o = o || {}; return '<text x="' + x + '" y="' + y + '" font-size="' + (o.s || 11) + '" text-anchor="' + (o.a || "middle") + '" fill="' + (o.c || "var(--ink-2)") + '"' + (o.w ? ' font-weight="700"' : "") + (o.r ? ' transform="rotate(-90 ' + x + " " + y + ')"' : "") + ">" + s + "</text>"; }
  function axes(ymin, ymax, ticks, ylab, xlab){ var s = ""; ticks.forEach(function(v){ var y = Y0 - (v - ymin) / (ymax - ymin) * (Y0 - Y1); s += '<line x1="' + X0 + '" y1="' + y + '" x2="' + X1 + '" y2="' + y + '" stroke="var(--line)"/>' + T(X0 - 6, y + 4, (Math.abs(v) < 10 ? +v.toFixed(3) : v), { a: "end" }); }); s += '<line x1="' + X0 + '" y1="' + Y0 + '" x2="' + X1 + '" y2="' + Y0 + '" stroke="var(--ink)"/>' + T(14, (Y0 + Y1) / 2, ylab, { r: 1 }) + T((X0 + X1) / 2, 284, xlab); return s; }
  function sy(v, a, b){ return Y0 - (v - a) / (b - a) * (Y0 - Y1); }
  var HMAP = [[0,0,0.11,0.01,0.11,251],[1,0,0.18,-0.04,0.18,251],[2,0,0.62,-0.48,0.38,251],[3,0,0.32,-0.19,0.26,251],[4,0,0.19,-0.05,0.18,251],[5,0,0.25,-0.07,0.24,250],[6,0,0.81,-0.68,0.44,251],[7,0,2.31,1.0,2.08,251],[8,0,0.28,-0.28,0.0,246],[0,1,0.01,0.0,0.01,251],[1,1,0.09,-0.07,0.06,250],[2,1,0.11,-0.06,-0.09,251],[3,1,0.06,-0.06,0.0,251],[4,1,0.09,-0.04,0.09,251],[5,1,0.04,-0.01,0.04,251],[6,1,0.28,0.17,-0.22,251],[7,1,0.21,-0.0,-0.21,251],[8,1,0.35,-0.34,-0.1,251],[0,2,0.01,0.0,-0.01,251],[1,2,0.01,-0.01,0.0,251],[2,2,0.07,-0.07,0.01,251],[3,2,0.08,-0.08,0.02,251],[4,2,0.03,-0.01,-0.03,251],[5,2,0.03,0.02,-0.03,251],[6,2,0.51,-0.3,0.41,251],[7,2,0.24,0.1,-0.21,251],[8,2,0.37,-0.02,-0.37,244],[0,3,0.07,0.06,0.04,251],[1,3,0.08,0.07,0.04,251],[2,3,0.08,0.04,0.06,251],[3,3,0.02,-0.02,0.0,251],[4,3,0.12,0.09,-0.08,251],[5,3,0.14,0.08,-0.12,250],[6,3,0.2,0.11,-0.17,251],[7,3,0.13,0.06,-0.12,251],[8,3,0.17,-0.12,-0.12,251],[0,4,0.07,0.06,0.04,251],[1,4,0.2,0.2,-0.0,251],[2,4,0.08,0.07,0.04,251],[3,4,0.12,0.12,-0.01,251],[4,4,0.14,0.09,-0.11,251],[5,4,0.1,0.06,-0.09,251],[6,4,0.05,0.01,-0.05,251],[7,4,0.1,-0.03,-0.1,251],[8,4,0.13,-0.11,-0.07,250],[0,5,0.13,0.13,-0.03,251],[1,5,0.15,0.15,0.01,251],[2,5,0.15,0.15,0.02,250],[3,5,0.11,0.1,-0.01,251],[4,5,0.24,0.18,-0.16,251],[5,5,0.06,-0.02,-0.06,251],[6,5,0.11,0.0,-0.11,251],[7,5,0.26,0.05,-0.25,251],[8,5,0.27,-0.26,-0.04,251],[0,6,0.07,0.0,0.07,251],[1,6,0.11,0.11,0.05,251],[2,6,0.05,0.04,0.03,251],[3,6,0.14,0.07,0.12,251],[4,6,0.17,0.13,-0.11,251],[5,6,0.06,0.04,0.04,251],[6,6,0.04,-0.04,0.0,251],[7,6,0.12,-0.1,-0.06,251],[8,6,0.21,-0.2,-0.05,251],[0,7,0.11,0.06,0.1,251],[1,7,0.06,0.02,0.05,251],[2,7,0.09,0.09,0.01,251],[3,7,0.09,0.09,0.02,251],[4,7,0.03,0.03,-0.02,251],[5,7,0.03,-0.03,-0.0,251],[6,7,0.1,-0.07,-0.07,251],[7,7,0.11,-0.08,-0.07,251],[8,7,0.32,-0.31,0.08,251],[0,8,0.03,0.0,-0.03,251],[1,8,0.22,0.21,-0.08,251],[2,8,0.16,0.14,-0.07,251],[3,8,0.16,0.14,-0.08,251],[4,8,0.23,0.21,-0.09,251],[5,8,0.1,0.09,-0.05,251],[6,8,0.06,-0.06,-0.01,251],[7,8,0.16,-0.16,0.03,251],[8,8,0.32,-0.31,0.08,251],[0,9,0.03,0.0,-0.03,251],[1,9,0.24,0.23,-0.06,251],[2,9,0.34,0.33,-0.1,251],[3,9,0.25,0.19,-0.16,251],[4,9,0.24,0.22,-0.07,251],[5,9,0.12,0.0,-0.12,251],[6,9,0.19,0.13,-0.13,250],[7,9,0.18,0.11,-0.15,250],[8,9,0.28,-0.28,0.06,251],[0,10,0.01,0.0,-0.01,251],[1,10,0.35,0.33,-0.13,251],[2,10,0.23,0.18,-0.14,251],[3,10,0.19,0.16,-0.1,251],[4,10,0.22,0.18,-0.12,251],[5,10,0.2,0.08,-0.18,250],[6,10,0.19,0.13,-0.14,251],[7,10,0.03,-0.03,0.0,251],[8,10,0.32,-0.31,0.07,251],[0,11,0.27,0.26,-0.09,251],[1,11,0.33,0.31,-0.12,251],[2,11,0.27,0.22,-0.16,250],[3,11,0.23,0.1,-0.2,251],[4,11,0.15,0.04,-0.15,250],[5,11,0.28,0.27,-0.09,251],[6,11,0.21,0.16,-0.13,251],[7,11,0.05,0.04,-0.01,251],[8,11,0.29,-0.27,0.11,251],[0,12,0.22,0.1,-0.2,250],[1,12,0.16,0.14,-0.07,251],[2,12,0.1,-0.04,-0.09,250],[3,12,0.08,0.07,-0.02,250],[4,12,0.1,-0.09,-0.04,251],[5,12,0.19,0.19,0.0,251],[6,12,0.15,0.15,0.0,251],[7,12,0.19,0.19,0.0,251],[8,12,0.19,-0.19,0.0,251]];
  var VIEWS = {
    oneD: function(){
      var d = D.oneD, s = axes(0.2, 0.42, [0.2, 0.25, 0.3, 0.35, 0.4], "error (m)", "polynomial degree"), bw = 30;
      d.deg.forEach(function(g, i){ var cx = X0 + 50 + i * 88, sel = g === d.sel; [["cvmae", "#7aa6c2"], ["cvrmse", "#17a398"]].forEach(function(k, j){ var v = d[k[0]][i], y = sy(v, 0.2, 0.42); s += '<rect x="' + (cx - bw + j * bw) + '" y="' + y + '" width="' + (bw - 3) + '" height="' + (Y0 - y) + '" fill="' + k[1] + '" opacity="' + (sel ? 1 : 0.45) + '"><title>degree ' + g + ": " + (j ? "CV RMSE " : "CV MAE ") + v + " m</title></rect>" + T(cx - bw / 2 + j * bw, y - 4, v.toFixed(3), { s: 9.5, c: "var(--ink)" }); }); s += T(cx, Y0 + 15, g, { c: sel ? "var(--ink)" : "var(--ink-2)", w: sel }); });
      s += '<rect x="' + (X1 - 190) + '" y="26" width="10" height="10" fill="#7aa6c2"/>' + T(X1 - 175, 35, "CV MAE", { a: "start", c: "var(--ink)" }) + '<rect x="' + (X1 - 110) + '" y="26" width="10" height="10" fill="#17a398"/>' + T(X1 - 95, 35, "CV RMSE", { a: "start", c: "var(--ink)" });
      svg.innerHTML = s;
      side.innerHTML = "<p>Polynomials of degree 1 to 5, compared by <b>leave-one-out cross-validation</b> on the averaged 1D points from 0 to 15 m. Degree 3 has the lowest CV MAE and CV RMSE.</p><p>The information criteria disagree: AIC also prefers degree 3 (" + d.aic_best[1] + "), BIC the linear model (" + d.bic_best[1] + "). The degree was chosen on the held-out error.</p><span class=\"eq\">" + d.eq + "</span>" +
        '<label>Smoothing α <input type="range" min="0.1" max="0.9" step="0.05" value="0.4" data-al><b data-alv>0.40</b></label><p>Time constant at 10 Hz: <span class="big" data-tau></span> — less noise for small α, more delay. OmniTrack uses α 0.4, τ ≈ 196 ms.</p>';
      var al = side.querySelector("[data-al]"); function upd(){ var a = +al.value, tau = -100 / Math.log(1 - a); side.querySelector("[data-alv]").textContent = a.toFixed(2); side.querySelector("[data-tau]").textContent = Math.round(tau) + " ms"; } al.addEventListener("input", upd); upd();
    },
    global: function(){
      var d = D.global, mn = 0.4055, mx = 0.4095, s = axes(mn, mx, [0.406, 0.407, 0.408, 0.409], "RMSE (m)", "polynomial degree"), px = function(i){ return X0 + 50 + i * 100; };
      [["train", "#9aa4ab", "4 4"], ["cvrmse", "#17a398", ""]].forEach(function(k){ var p = d[k[0]].map(function(v, i){ return (i ? "L" : "M") + px(i) + " " + sy(v, mn, mx).toFixed(1); }).join(" "); s += '<path d="' + p + '" fill="none" stroke="' + k[1] + '" stroke-width="2.5"' + (k[2] ? ' stroke-dasharray="' + k[2] + '"' : "") + "/>"; d[k[0]].forEach(function(v, i){ s += '<circle cx="' + px(i) + '" cy="' + sy(v, mn, mx).toFixed(1) + '" r="' + (i + 1 === d.sel && k[0] === "cvrmse" ? 6 : 4) + '" fill="' + k[1] + '"><title>degree ' + (i + 1) + ": " + v + " m</title></circle>"; }); });
      d.deg.forEach(function(g, i){ s += T(px(i), Y0 + 15, g, { w: g === d.sel, c: g === d.sel ? "var(--ink)" : "var(--ink-2)" }); });
      s += '<line x1="' + (X1 - 200) + '" y1="31" x2="' + (X1 - 180) + '" y2="31" stroke="#9aa4ab" stroke-width="2.5" stroke-dasharray="4 4"/>' + T(X1 - 175, 35, "training", { a: "start", c: "var(--ink)" }) + '<line x1="' + (X1 - 110) + '" y1="31" x2="' + (X1 - 90) + '" y2="31" stroke="#17a398" stroke-width="2.5"/>' + T(X1 - 85, 35, "grouped CV", { a: "start", c: "var(--ink)" });
      svg.innerHTML = s;
      var rows = d.deg.map(function(g, i){ return '<tr class="' + (g === d.sel ? "sel" : "") + '"><td>' + g + '</td><td class="num">' + d.train[i].toFixed(4) + '</td><td class="num">' + d.cvrmse[i].toFixed(4) + '</td><td class="num">' + d.cvmae[i].toFixed(4) + '</td><td class="num">' + d.aicc[i] + '</td><td class="num">' + d.bic[i] + "</td></tr>"; }).join("");
      side.innerHTML = "<p>One correction for all eight anchors, fitted on the 2D campaign (117 positions) and compared by <b>grouped cross-validation</b>. Degree 2 has the lowest CV RMSE and MAE; AICc and BIC prefer degree 1.</p><div class=\"table-wrap\"><table><thead><tr><th>Deg.</th><th class=\"num\">Train RMSE</th><th class=\"num\">CV RMSE</th><th class=\"num\">CV MAE</th><th class=\"num\">AICc</th><th class=\"num\">BIC</th></tr></thead><tbody>" + rows + "</tbody></table></div><span class=\"eq\">" + d.eq + "</span>";
    },
    anchor: function(){
      var d = D.anchor, s = axes(-1.2, 0.4, [-1.2, -0.8, -0.4, 0, 0.4], "correction, d_cal − d_raw (m)", "raw range (m)"), cols = ["#c8102e", "#e07b1f", "#c9a400", "#22a35a", "#17a398", "#2f6fd6", "#7b3fa0", "#55616a"];
      for (var g = 0; g <= 15; g += 3) s += T(X0 + g / 15 * (X1 - X0), Y0 + 15, g);
      d.coef.forEach(function(c, i){ var p = ""; for (var k = 0; k <= 60; k++) { var x = k / 4, v = 0; for (var j = 0; j < c.length; j++) v = v * x + c[j]; p += (k ? "L" : "M") + (X0 + x / 15 * (X1 - X0)).toFixed(1) + " " + sy(Math.max(-1.2, Math.min(0.4, v - x)), -1.2, 0.4).toFixed(1); } s += '<path d="' + p + '" fill="none" stroke="' + cols[i] + '" stroke-width="' + (i === selA ? 3.5 : 1.6) + '" opacity="' + (i === selA ? 1 : 0.45) + '"/>'; });
      svg.innerHTML = s;
      var rows = d.deg.map(function(g, i){ return '<tr data-a="' + i + '" class="' + (i === selA ? "sel" : "") + '"><td><span style="color:' + cols[i] + '">●</span> a' + (i + 1) + '</td><td class="num">' + d.n[i] + '</td><td class="num">' + g + '</td><td class="num">' + d.cvrmse[i].toFixed(3) + '</td><td class="num">' + d.bic[i] + '</td><td class="num">' + d.aicc[i] + "</td></tr>"; }).join("");
      var c = d.coef[selA], eq = c.map(function(v, j){ var p = c.length - 1 - j; return (j ? (v < 0 ? " − " : " + ") : (v < 0 ? "−" : "")) + Math.abs(v) + (p ? " d" + (p > 1 ? (p === 2 ? "²" : "³") : "") : ""); }).join("");
      side.innerHTML = "<p>Each anchor gets its own polynomial, its degree chosen by grouped CV: degree 1 for four anchors, 2 for two, 3 for two, matching each anchor’s height and multipath. Click an anchor.</p><div class=\"table-wrap\"><table><thead><tr><th>Anchor</th><th class=\"num\">n</th><th class=\"num\">Degree</th><th class=\"num\">CV RMSE</th><th class=\"num\">BIC</th><th class=\"num\">AICc</th></tr></thead><tbody>" + rows + "</tbody></table></div><span class=\"eq\">a" + (selA + 1) + ": d_cal = " + eq + "</span>";
      side.querySelectorAll("[data-a]").forEach(function(r){ r.addEventListener("click", function(){ selA = +r.getAttribute("data-a"); VIEWS.anchor(); }); });
    },
    loc: function(){
      var d = D.loc, s = axes(0, 0.5, [0, 0.1, 0.2, 0.3, 0.4, 0.5], "mean horizontal error (m)", ""), bw = 90;
      d.mean.forEach(function(v, i){ var cx = X0 + 90 + i * 150, y = sy(v, 0, 0.5); s += '<rect x="' + (cx - bw / 2) + '" y="' + y + '" width="' + bw + '" height="' + (Y0 - y) + '" rx="4" fill="' + (i === 2 ? "#17a398" : "#9aa4ab") + '"/>' + T(cx, y - 6, v.toFixed(3) + " m", { c: "var(--ink)", w: 1 }) + T(cx, Y0 + 15, d.labels[i], { s: 10 }); });
      var yc = sy(d.centre, 0, 0.5), c3 = X0 + 90 + 2 * 150; s += '<line x1="' + (c3 - 52) + '" y1="' + yc + '" x2="' + (c3 + 52) + '" y2="' + yc + '" stroke="#fff" stroke-width="2" stroke-dasharray="5 4"/>' + T(c3, sy(0.184, 0, 0.5) - 22, "0.141 m in the study area", { c: "#0e7a70", s: 10 });
      svg.innerHTML = s;
      side.innerHTML = "<p>The three strategies applied to the same 117 positions. With one model per anchor the mean error drops by 61%, to 18 cm, and to 14 cm on the surface where the routes were walked.</p><p>Errors grow towards the edges of the anchor area: the worst point, near (7, 0) m, was off by 2.31 m. The 2D calibrations are tied to the room, the 1D one is quicker to deploy.</p>";
    },
    // the 2D error map: each of the 117 ground-truth positions (1 m grid, about 250 samples each) with its mean
    // horizontal error and offset after the per-anchor calibration, from the thesis figure in chapter 5:
    // [x, y, mean error, offset x, offset y, samples], in metres
    map: function(){
      var P = HMAP, C = 18.5, gx = 46, gy = 14, STUDY = [1, 2, 7, 10], CAP = 0.45, tr = function(t){ return window.i18n ? window.i18n.t(t) : t; };
      var it = !!(window.i18n && window.i18n.lang === "it"), num = function(v, d){ var t = v.toFixed(d == null ? 2 : d); return it ? t.replace(".", ",") : t; };
      var sg = function(v){ return (v > 0 ? "+" : v < 0 ? "−" : "") + num(Math.abs(v)); };
      var cxp = function(x){ return gx + (x + 0.5) * C; }, cyp = function(y){ return gy + (12 - y + 0.5) * C; };
      // one hue, light to dark, capped at 0.45 m as in the thesis
      var col = function(e){ var t = Math.min(e, CAP) / CAP, a = t < 0.5 ? [233, 245, 243] : [63, 167, 156], b = t < 0.5 ? [63, 167, 156] : [11, 79, 73], u = t < 0.5 ? t * 2 : (t - 0.5) * 2; return "rgb(" + a.map(function(c, i){ return Math.round(c + (b[i] - c) * u); }).join(",") + ")"; };
      var s = '<defs><linearGradient id="cx-ramp"><stop offset="0" stop-color="rgb(233,245,243)"/><stop offset=".5" stop-color="rgb(63,167,156)"/><stop offset="1" stop-color="rgb(11,79,73)"/></linearGradient><marker id="cx-head" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L8 4 L0 8 Z" fill="#1d252c"/></marker></defs>';
      P.forEach(function(p, i){ s += '<rect class="hm-cell" data-i="' + i + '" x="' + (cxp(p[0]) - C / 2 + 0.75) + '" y="' + (cyp(p[1]) - C / 2 + 0.75) + '" width="' + (C - 1.5) + '" height="' + (C - 1.5) + '" rx="2" fill="' + col(p[2]) + '"/>' + (p[2] > CAP ? '<circle cx="' + (cxp(p[0]) + C / 2 - 4.5) + '" cy="' + (cyp(p[1]) - C / 2 + 4.5) + '" r="1.8" fill="#fff" pointer-events="none"/>' : ""); });
      s += '<g class="hm-arr" style="display:none" pointer-events="none">';
      P.forEach(function(p){ s += Math.hypot(p[3], p[4]) < 0.08 ? '<circle cx="' + cxp(p[0]) + '" cy="' + cyp(p[1]) + '" r="1.4" fill="#1d252c"/>' : '<line x1="' + cxp(p[0]) + '" y1="' + cyp(p[1]) + '" x2="' + (cxp(p[0]) + p[3] * C).toFixed(1) + '" y2="' + (cyp(p[1]) - p[4] * C).toFixed(1) + '" stroke="#1d252c" stroke-width="1.3" marker-end="url(#cx-head)"/>'; });
      s += "</g>";
      s += '<rect x="' + (cxp(STUDY[0]) - C / 2) + '" y="' + (cyp(STUDY[3]) - C / 2) + '" width="' + (STUDY[2] - STUDY[0] + 1) * C + '" height="' + (STUDY[3] - STUDY[1] + 1) * C + '" fill="none" stroke="var(--ink)" stroke-width="1.2" stroke-dasharray="4 3" pointer-events="none"/>';
      [[0, 0, 2], [8, 0, 2], [8, 12, 2], [0, 12, 2], [0, 6, 0.3], [4, 0, 0.3], [8, 6, 0.3], [4, 12, 0.3]].forEach(function(a){ s += '<path transform="translate(' + cxp(a[0]) + " " + cyp(a[1]) + ')" d="M0 -5 L5 0 L0 5 L-5 0 Z" fill="' + (a[2] > 1 ? "#c8102e" : "#e98a95") + '" stroke="#fff" stroke-width="1" pointer-events="none"/>'; });
      for (var x = 0; x <= 8; x += 2) s += T(cxp(x), gy + 13 * C + 13, x, { s: 10 });
      for (var y = 0; y <= 12; y += 2) s += T(gx - 6, cyp(y) + 3.5, y, { a: "end", s: 10 });
      s += T(gx + 4.5 * C, gy + 13 * C + 26, "x (m)", { s: 10 }) + T(16, gy + 6.5 * C, "y (m)", { r: 1, s: 10 });
      s += '<rect class="hm-sel" x="0" y="0" width="' + C + '" height="' + C + '" rx="3" fill="none" stroke="var(--ink)" stroke-width="2" style="display:none" pointer-events="none"/>';
      // to the right of the room: the square being read, the scale and the key
      var R = 262;
      s += T(R, 34, "Point at a square", { a: "start", c: "var(--ink-2)", s: 11 }).replace("<text", '<text class="hm-r0"');
      s += '<text class="hm-r1" x="' + R + '" y="62" font-size="24" font-weight="700" fill="var(--ink)"></text><text class="hm-r2" x="' + R + '" y="82" font-size="11" fill="var(--ink-2)"></text><text class="hm-r3" x="' + R + '" y="98" font-size="11" fill="var(--ink-2)"></text>';
      s += T(R, 172, "mean error", { a: "start", c: "var(--ink)", s: 11, w: 1 }) + '<rect x="' + R + '" y="180" width="200" height="9" rx="4.5" fill="url(#cx-ramp)"/>' + T(R, 202, "0 m", { a: "start", s: 10 }) + T(R + 200, 202, "0.45 m and more", { a: "end", s: 10 });
      s += '<rect x="' + R + '" y="222" width="11" height="11" rx="1.5" fill="none" stroke="var(--ink)" stroke-dasharray="3 2"/>' + T(R + 17, 231, "study area", { a: "start", s: 10 });
      s += '<path transform="translate(' + (R + 5.5) + ' 249)" d="M0 -5 L5 0 L0 5 L-5 0 Z" fill="#c8102e"/>' + T(R + 17, 253, "anchor at 2.0 m", { a: "start", s: 10 }) + '<path transform="translate(' + (R + 110) + ' 249)" d="M0 -5 L5 0 L0 5 L-5 0 Z" fill="#e98a95"/>' + T(R + 121, 253, "anchor at 0.3 m", { a: "start", s: 10 });
      s += '<rect x="' + R + '" y="262" width="11" height="11" rx="2" fill="rgb(11,79,73)"/><circle cx="' + (R + 7.5) + '" cy="266" r="1.8" fill="#fff"/>' + T(R + 17, 271, "beyond the scale", { a: "start", s: 10 });
      svg.innerHTML = s;
      svg.setAttribute("tabindex", "0");
      var sel = svg.querySelector(".hm-sel"), r0 = svg.querySelector(".hm-r0"), r1 = svg.querySelector(".hm-r1"), r2 = svg.querySelector(".hm-r2"), r3 = svg.querySelector(".hm-r3"), cur = -1;
      function show(i){
        var p = P[i]; if (!p) return; cur = i;
        sel.style.display = ""; sel.setAttribute("x", cxp(p[0]) - C / 2); sel.setAttribute("y", cyp(p[1]) - C / 2);
        r0.textContent = tr("Position (" + p[0] + ", " + p[1] + ") m");
        r1.textContent = num(p[2]) + " m";
        r2.textContent = tr("offset") + ": x " + sg(p[3]) + " m, y " + sg(p[4]) + " m";
        r3.textContent = tr(p[5] + " samples");
      }
      function find(x, y){ for (var i = 0; i < P.length; i++) if (P[i][0] === x && P[i][1] === y) return i; return -1; }
      svg.onpointermove = function(e){
        var b = svg.getBoundingClientRect(), vx = (e.clientX - b.left) / b.width * 520, vy = (e.clientY - b.top) / b.height * 290;
        var x = Math.floor((vx - gx) / C), y = 12 - Math.floor((vy - gy) / C);
        if (x >= 0 && x <= 8 && y >= 0 && y <= 12) show(find(x, y));
      };
      svg.onkeydown = function(e){
        var d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key]; if (!d) return;
        e.preventDefault(); var p = cur < 0 ? [4, 6] : P[cur];
        show(find(Math.max(0, Math.min(8, p[0] + d[0])), Math.max(0, Math.min(12, p[1] + d[1]))));
      };
      show(find(7, 0));
      // beside: what it shows, the numbers, and colour or arrows
      var mean = function(a){ return a.reduce(function(t, p){ return t + p[2]; }, 0) / a.length; };
      var inS = P.filter(function(p){ return p[0] >= STUDY[0] && p[0] <= STUDY[2] && p[1] >= STUDY[1] && p[1] <= STUDY[3]; }), edge = P.filter(function(p){ return p[0] === 0 || p[0] === 8 || p[1] === 0 || p[1] === 12; });
      side.innerHTML = "<p>The tag was placed on a 1 m grid across the room, about 250 samples per position. Each square is the mean horizontal error there, after the per-anchor calibration.</p>" +
        '<div class="table-wrap"><table><tbody><tr><td>All 117 positions</td><td class="num">' + num(mean(P), 3) + " m</td></tr><tr><td>Inside the study area</td><td class=\"num\">" + num(mean(inS), 3) + " m</td></tr><tr><td>Along the walls</td><td class=\"num\">" + num(mean(edge), 3) + " m</td></tr><tr><td>Within 0.2 m</td><td class=\"num\">" + P.filter(function(p){ return p[2] <= 0.2; }).length + " / " + P.length + "</td></tr></tbody></table></div>" +
        "<p>The centre stays mostly below 0.10–0.20 m; the edges, less constrained by the anchors, are worse, and some show a steady pull in one direction.</p>" +
        '<div class="cx-seg" role="group" aria-label="Show on the map"><button type="button" data-hv="col" aria-pressed="true">Colour</button><button type="button" data-hv="arr" aria-pressed="false">Offsets as arrows</button></div>';
      side.querySelectorAll("[data-hv]").forEach(function(b){ b.addEventListener("click", function(){
        var arr = b.getAttribute("data-hv") === "arr";
        svg.querySelector(".hm-arr").style.display = arr ? "" : "none";
        svg.querySelectorAll(".hm-cell").forEach(function(c){ c.style.opacity = arr ? ".5" : ""; });
        side.querySelectorAll("[data-hv]").forEach(function(o){ o.setAttribute("aria-pressed", String(o === b)); });
      }); });
    },
    lat: function(){
      var d = D.lat, s = "", mx = 500, px = function(v){ return X0 + v / mx * (X1 - X0); };
      for (var v = 0; v <= 500; v += 100) s += '<line x1="' + px(v) + '" y1="40" x2="' + px(v) + '" y2="210" stroke="var(--line)"/>' + T(px(v), 228, v + " ms");
      s += T(X0, 70, "communication and actuation", { a: "start", c: "var(--ink)", w: 1 }) + '<rect x="' + px(d.comm[0]) + '" y="78" width="' + (px(d.comm[1]) - px(d.comm[0])) + '" height="26" rx="5" fill="#7aa6c2"/>' + T(px(d.comm[1]) + 6, 96, d.comm[0] + "–" + d.comm[1] + " ms", { a: "start", c: "var(--ink)" });
      s += T(X0, 140, "plus smoothing, τ ≈ 196 ms", { a: "start", c: "var(--ink)", w: 1 }) + '<rect x="' + px(d.total[0]) + '" y="148" width="' + (px(d.total[1]) - px(d.total[0])) + '" height="26" rx="5" fill="#17a398"/>' + T(px(d.total[1]) + 6, 166, d.total[0] + "–" + d.total[1] + " ms", { a: "start", c: "var(--ink)" });
      s += T((X0 + X1) / 2, 262, "from a change of position to the feedback");
      svg.innerHTML = s;
      side.innerHTML = "<p>UWB ranging → Bluetooth → ROS 2 → actuation. A new range waits 1–100 ms for the next 100 ms Bluetooth slot, each Bluetooth hop adds 10–30 ms, and the vibration motor needs 50–80 ms to spin up, against under a millisecond for sound and light.</p><p>For a progressive hot–cold cue this delay is acceptable, as long as the 0.2 m feedback steps are sized on both the position error and this latency.</p>";
    }
  };
  tabs.forEach(function(b){ b.addEventListener("click", function(){ tabs.forEach(function(o){ o.setAttribute("aria-selected", String(o === b)); }); svg.onpointermove = svg.onkeydown = null; svg.removeAttribute("tabindex"); VIEWS[b.getAttribute("data-t")](); }); });
  VIEWS.oneD();
})();
