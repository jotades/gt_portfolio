(function(){
  // WashB, "Engineering": the two FEM checks of the thesis (chapter 5) as cards instead of pasted screenshots.
  // Squeezer: its real outline (traced from the SolidWorks model) closing on the neutral axis as the lip force
  // grows, and the force–displacement curve read from the Abaqus chart (8.775 mm at 12.5 N, limit 10 mm); below,
  // the original mesh, loads and displacement renders. Case: model with loads, stress and displacement renders,
  // with a legend, and the stress margin against the allowable.
  var T = function(s){ return window.i18n ? window.i18n.t(s) : s; };
  var IT = !!(window.i18n && window.i18n.lang === "it");
  function F(x, d){ var v = (+x).toFixed(d); return IT ? v.replace(".", ",") : v; }
  var TEAL = "#3fa9b5", NAVY = "#1f3a5a", RED = "#c8102e";
  function seg(root, attr, show){
    root.querySelectorAll("[" + attr + "]").forEach(function(b){ b.addEventListener("click", function(){
      root.querySelectorAll("[" + attr + "]").forEach(function(o){ o.setAttribute("aria-pressed", String(o === b)); });
      show(b.getAttribute(attr));
    }); });
  }

  // ---------- squeezer
  var sq = document.getElementById("fem-sq");
  if (sq) {
    var svg = sq.querySelector(".fem-svg"), inp = sq.querySelector("[data-f]"), out = sq.querySelector("[data-fv]");
    // half of the side outline, as (position along the length, height from the axis), both 0–1
    var SIL = [[0, .09], [.025, .397], [.049, .496], [.075, .55], [.1, .579], [.125, .612], [.15, .649], [.174, .678], [.2, .711], [.225, .748], [.25, .781], [.275, .814], [.3, .847], [.325, .88], [.35, .905], [.375, .934], [.4, .955], [.424, .971], [.45, .988], [.475, .996], [.5, 1]];
    SIL = SIL.concat(SIL.slice(0, -1).reverse().map(function(p){ return [1 - p[0], p[1]]; }));
    // force (N) against displacement (mm), read from the rigidity graph of the thesis
    var CURVE = [[0, 0], [0.75, 0.85], [1.5, 1.3], [2.2, 1.7], [2.6, 2.6], [3.1, 3.3], [3.6, 4.2], [4.0, 5.0], [4.35, 5.9], [4.8, 6.7], [5.4, 7.5], [6.0, 8.4], [6.45, 9.2], [7.0, 9.8], [7.8, 10.9], [8.4, 11.7], [8.775, 12.5]];
    function dispAt(f){ for (var i = 1; i < CURVE.length; i++) { var a = CURVE[i - 1], b = CURVE[i]; if (f <= b[1]) return a[0] + (f - a[1]) / (b[1] - a[1] || 1) * (b[0] - a[0]); } return CURVE[CURVE.length - 1][0]; }
    var X0 = 300, X1 = 505, Y0 = 196, Y1 = 22, sx = function(d){ return X0 + d / 10 * (X1 - X0); }, sy = function(f){ return Y0 - f / 14 * (Y0 - Y1); };
    function txt(x, y, s, o){ o = o || {}; return '<text x="' + x + '" y="' + y + '" font-size="' + (o.s || 10) + '" text-anchor="' + (o.a || "middle") + '" fill="' + (o.c || "var(--ink-2)") + '"' + (o.w ? ' font-weight="700"' : "") + ">" + s + "</text>"; }
    // the outline at a given half height (px)
    function outline(cx, cy, len, hh){
      var p = SIL.map(function(q){ return [cx - len / 2 + q[0] * len, cy - q[1] * hh]; });
      var b = SIL.slice().reverse().map(function(q){ return [cx - len / 2 + q[0] * len, cy + q[1] * hh]; });
      return "M" + p.concat(b).map(function(q){ return q[0].toFixed(1) + " " + q[1].toFixed(1); }).join(" L") + "Z";
    }
    function draw(){
      var f = +inp.value, d = dispAt(f), cx = 130, cy = 118, len = 220, k = 4.2, h0 = 10 * k, h = Math.max(2, (10 - d) * k);
      var s = '<defs><marker id="femA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="' + RED + '"/></marker>' +
        '<marker id="femB" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="' + TEAL + '"/></marker>' +
        '<linearGradient id="femG" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#5b6672"/><stop offset=".5" stop-color="#2c333b"/><stop offset="1" stop-color="#4a545e"/></linearGradient></defs>';
      s += '<path d="' + outline(cx, cy, len, h0) + '" fill="none" stroke="var(--ink-2)" stroke-width="1" stroke-dasharray="3 3"/>';
      s += '<path d="' + outline(cx, cy, len, h) + '" fill="url(#femG)"/>';
      s += '<line x1="' + (cx - len / 2 - 12) + '" x2="' + (cx + len / 2 + 12) + '" y1="' + cy + '" y2="' + cy + '" stroke="' + TEAL + '" stroke-dasharray="7 5" stroke-width="2"/>';
      // distributed load from the lips, top and bottom, on the current surface
      var ly = cy - h - 14, by = cy + h + 14, n = 7, w = 150;
      s += '<line x1="' + (cx - w / 2) + '" x2="' + (cx + w / 2) + '" y1="' + ly + '" y2="' + ly + '" stroke="' + TEAL + '" stroke-width="1.3"/><line x1="' + (cx - w / 2) + '" x2="' + (cx + w / 2) + '" y1="' + by + '" y2="' + by + '" stroke="' + TEAL + '" stroke-width="1.3"/>';
      for (var i = 0; i < n; i++) { var x = cx - w / 2 + i * w / (n - 1); s += '<line x1="' + x + '" x2="' + x + '" y1="' + ly + '" y2="' + (ly + 9) + '" stroke="' + TEAL + '" stroke-width="1.3" marker-end="url(#femB)"/><line x1="' + x + '" x2="' + x + '" y1="' + by + '" y2="' + (by - 9) + '" stroke="' + TEAL + '" stroke-width="1.3" marker-end="url(#femB)"/>'; }
      var ty = cy - h0 - 16;
      s += '<line x1="' + cx + '" x2="' + cx + '" y1="' + Math.min(ty, ly - 22) + '" y2="' + (ly - 2) + '" stroke="' + RED + '" stroke-width="1.6" marker-end="url(#femA)"/>' + txt(cx - 8, ty, "F = " + F(f, 1) + " N", { a: "end", c: "var(--ink)", w: 1, s: 10.5 });
      s += '<line x1="' + cx + '" x2="' + cx + '" y1="' + (by + 22) + '" y2="' + (by + 2) + '" stroke="' + RED + '" stroke-width="1.6" marker-end="url(#femA)"/>';
      if (d > 0.05) s += '<line x1="' + (cx + 22) + '" x2="' + (cx + 22) + '" y1="' + (cy - h0) + '" y2="' + (cy - h) + '" stroke="' + RED + '" stroke-width="1.4"/><line x1="' + (cx + 18) + '" x2="' + (cx + 26) + '" y1="' + (cy - h0) + '" y2="' + (cy - h0) + '" stroke="' + RED + '"/>';
      s += txt(cx + 8, ty, "d = " + F(d, 1) + " mm", { a: "start", c: RED, w: 1, s: 10.5 });
      s += txt(cx - len / 2, 226, T("dashed: the squeezer before the load"), { a: "start", s: 9 });
      // the force–displacement curve
      [0, 4, 8, 12].forEach(function(v){ s += '<line x1="' + X0 + '" x2="' + X1 + '" y1="' + sy(v) + '" y2="' + sy(v) + '" stroke="var(--line)"/>' + txt(X0 - 6, sy(v) + 3.5, v, { a: "end", s: 9 }); });
      [0, 2, 4, 6, 8, 10].forEach(function(v){ s += txt(sx(v), Y0 + 13, v, { s: 9 }); });
      s += txt((X0 + X1) / 2, Y0 + 27, T("displacement (mm)"), { s: 9.5 }) + txt(X0 - 22, 12, T("force (N)"), { a: "start", s: 9.5 });
      s += '<line x1="' + sx(10) + '" x2="' + sx(10) + '" y1="' + Y1 + '" y2="' + Y0 + '" stroke="' + RED + '" stroke-dasharray="4 3"/>' + txt(sx(10) - 4, Y1 + 10, T("limit"), { a: "end", c: RED, s: 9 });
      s += '<path d="' + CURVE.map(function(p, i){ return (i ? "L" : "M") + sx(p[0]).toFixed(1) + " " + sy(p[1]).toFixed(1); }).join("") + '" fill="none" stroke="' + NAVY + '" stroke-width="2" stroke-linejoin="round"/>';
      s += '<line x1="' + sx(d) + '" x2="' + sx(d) + '" y1="' + sy(f) + '" y2="' + Y0 + '" stroke="' + TEAL + '" stroke-dasharray="2 3"/><circle cx="' + sx(d) + '" cy="' + sy(f) + '" r="5" fill="' + TEAL + '" stroke="#fff" stroke-width="2"/>';
      svg.innerHTML = s;
      out.textContent = F(f, 1) + " N";
    }
    inp.addEventListener("input", draw);
    draw();
    seg(sq, "data-q", function(v){
      sq.querySelectorAll("[data-qv]").forEach(function(img){ img.hidden = img.getAttribute("data-qv") !== v; });
      sq.querySelector("[data-qleg]").style.visibility = v === "u" ? "visible" : "hidden";
    });
  }

  // ---------- case
  var cs = document.getElementById("fem-case");
  if (cs) {
    // labels on the model: the two hinges that take the 100 N, and the fixtures (green in SolidWorks)
    var note = cs.querySelector(".fem-note");
    if (note) {
      var lead = function(x, y, tx, ty, c){ return '<line x1="' + x + '" y1="' + y + '" x2="' + tx + '" y2="' + ty + '" stroke="' + c + '" stroke-width="2.5"/><circle cx="' + x + '" cy="' + y + '" r="9" fill="none" stroke="' + c + '" stroke-width="3"/>'; };
      var word = function(x, y, s, c){ return '<text x="' + x + '" y="' + y + '" font-size="30" font-weight="700" text-anchor="middle" fill="' + c + '" stroke="#fff" stroke-width="7" stroke-linejoin="round" paint-order="stroke">' + s + "</text>"; };
      note.innerHTML = lead(655, 412, 560, 350, RED) + lead(538, 494, 560, 350, RED) + word(560, 338, T("Hinges · 100 N"), RED) +
        lead(466, 517, 400, 572, NAVY) + word(400, 598, T("Fixed"), NAVY);
    }
    var LEG = { stress: ["32.1 MPa", "0"], disp: ["+0.102 mm", "−0.105 mm"] }, leg = cs.querySelector(".fem-leg-v");
    seg(cs, "data-m", function(m){
      cs.querySelectorAll("[data-v]").forEach(function(el){ if (el.getAttribute("data-v") !== m) el.setAttribute("hidden", ""); else el.removeAttribute("hidden"); });
      leg.hidden = m === "model";
      if (LEG[m]) { cs.querySelector("[data-lmax]").textContent = IT ? LEG[m][0].replace(".", ",") : LEG[m][0]; cs.querySelector("[data-lmin]").textContent = IT ? LEG[m][1].replace(".", ",") : LEG[m][1]; }
    });
    var bs = cs.querySelector(".fem-bullet"), B0 = 12, B1 = 508, MAX = 70, bx = function(v){ return B0 + v / MAX * (B1 - B0); };
    var t2 = function(x, y, s, a, c, w){ return '<text x="' + x + '" y="' + y + '" font-size="10" text-anchor="' + (a || "middle") + '" fill="' + (c || "var(--ink-2)") + '"' + (w ? ' font-weight="700"' : "") + ">" + s + "</text>"; };
    var b = '<rect x="' + B0 + '" y="26" width="' + (B1 - B0) + '" height="14" rx="3" fill="var(--wash)"/>' +
      '<rect x="' + B0 + '" y="26" width="' + (bx(41.8) - B0) + '" height="14" rx="3" fill="#e8f6f4"/>' +
      '<rect x="' + B0 + '" y="29" width="' + (bx(32.1) - B0) + '" height="8" rx="2" fill="' + TEAL + '"/>' +
      '<line x1="' + bx(41.8) + '" x2="' + bx(41.8) + '" y1="20" y2="46" stroke="' + NAVY + '" stroke-width="2"/>' +
      '<line x1="' + bx(62.7) + '" x2="' + bx(62.7) + '" y1="20" y2="46" stroke="' + RED + '" stroke-width="2" stroke-dasharray="3 2"/>' +
      t2(bx(32.1), 14, T("peak") + " " + F(32.1, 1) + " MPa", "end", "var(--ink)", 1) +
      t2(bx(41.8) + 5, 14, T("allowable") + " " + F(41.8, 1) + " = " + F(62.7, 1) + " / " + F(1.5, 1), "start", NAVY, 1) +
      t2(B1, 60, T("tensile strength") + " " + F(62.7, 1) + " MPa", "end", RED);
    [0, 20, 40].forEach(function(v){ b += t2(bx(v), 60, v, "middle"); });
    bs.innerHTML = b;
  }
})();
