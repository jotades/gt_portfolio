(function(){
  var root = document.getElementById("rb");
  if (!root) return;
  var route = root.querySelector(".rb-route"), wrap = root.querySelector(".rb-route-wrap"), con = root.querySelector(".rb-console"), info = root.querySelector(".rb-info");
  var pos = root.querySelector(".rb-pos"), prev = root.querySelector(".rb-prev"), next = root.querySelector(".rb-next");
  var edTitle = root.querySelector(".rb-ed-title"), chips = root.querySelector(".rb-chips"), thumb = root.querySelector(".rb-ed-thumb");
  // text the script writes is put together from short pieces, each translated on its own (js/00-i18n-it.js)
  var T = function(s){ return window.i18n ? window.i18n.t(s) : s; };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // a plain road with one carriageway to start; the program's own two example blocks break some of the rules below
  var blocks = [
    { code: 1, ways: 1, lanes: 2, road: "Straight", cross: "None", traffic: "Medium", stop: false, priority: true, light: false },
    { code: 2, ways: 1, lanes: 2, road: "Straight", cross: "TCross", traffic: "none", stop: true, priority: true, light: false },
    { code: 3, ways: 1, lanes: 2, road: "Straight", cross: "Roundabout", traffic: "Medium", stop: false, priority: true, light: false },
    { code: 4, ways: 1, lanes: 2, road: "Roadbends", cross: "None", traffic: "High", stop: false, priority: false, light: false },
    { code: 5, ways: 1, lanes: 2, road: "Straight", cross: "None", traffic: "Medium", stop: false, priority: true, light: false }
  ];
  var sel = 0, fresh = -1, S = 132, MID = 66, PI = Math.PI;
  var GRASS = "#e4ebdc", ASPH = "#4a525a", EDGE = "#ffffff";
  function widths(b){ var lane = 11, cw = b.lanes * lane + 6, med = b.road === "Highway" ? 8 : 6; return { lane: lane, cw: cw, med: med, total: b.ways * cw + (b.ways - 1) * med }; }
  // Every block is drawn entering from the left. Straight, Bends and Highway leave on the right, on the same line;
  // Curve is a 90 degree turn, left (turn -1) or right (turn +1).
  function geo(road, half, turn){
    if (road === "Curve") {
      var cy = turn > 0 ? S : 0;
      return function(u){ var th = PI / 2 * (1 - u), c = Math.cos(th), s = Math.sin(th); return turn > 0 ? [MID * c, cy - MID * s, s, c] : [MID * c, MID * s, s, -c]; };
    }
    if (road === "Roadbends") {
      var B = Math.min(30, 1 / (0.00269 * (half + 4)));
      return function(u){ var y = MID - B * Math.sin(2 * PI * u) * Math.sin(PI * u), d = -B * (2 * PI * Math.cos(2 * PI * u) * Math.sin(PI * u) + PI * Math.sin(2 * PI * u) * Math.cos(PI * u)) / S, L = Math.sqrt(1 + d * d); return [S * u, y, 1 / L, d / L]; };
    }
    return function(u){ return [S * u, MID, 1, 0]; };
  }
  function pt(g, u, off){ var p = g(u); return [p[0] - p[3] * off, p[1] + p[2] * off]; }
  function path(g, off, u0, u1){ u0 = u0 == null ? -0.03 : u0; u1 = u1 == null ? 1.03 : u1; var n = Math.max(6, Math.round((u1 - u0) * 48)), d = ""; for (var i = 0; i <= n; i++) { var p = pt(g, u0 + (u1 - u0) * i / n, off); d += (i ? " L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); } return d; }
  function st(d, w, col, dash){ return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + w + '" stroke-linejoin="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + "/>"; }
  function P(p){ return p[0].toFixed(1) + " " + p[1].toFixed(1); }
  function len(g){ var l = 0, a = g(0); for (var i = 1; i <= 40; i++) { var b = g(i / 40); l += Math.hypot(b[0] - a[0], b[1] - a[1]); a = b; } return l; }
  function roadLayer(b, turn){
    var W = widths(b), half = W.total / 2, g = geo(b.road, half, turn), J = g(0.5), n = [-J[3], J[2]], t = [J[2], J[3]], hw = 13, s = "", side = [], L = len(g);
    if (b.cross === "TCross") side.push("M" + P([J[0] - n[0] * 140, J[1] - n[1] * 140]) + " L" + P(J));
    if (b.cross === "Xcross") side.push("M" + P([J[0] - n[0] * 140, J[1] - n[1] * 140]) + " L" + P([J[0] + n[0] * 140, J[1] + n[1] * 140]));
    // merging lane: a slip road joins from the side, runs alongside and tapers into the carriageway
    var merge = "", slip = "", ml = 12, sd = b.road === "Curve" ? (turn > 0 ? -1 : 1) : 1, m0 = b.road === "Roadbends" ? 0.55 : 0.3, m1 = 0.95, tp = 0.22;
    if (b.cross === "Immission") {
      var a1 = [], a2 = [];
      for (var i = 0; i <= 30; i++) { var u = m0 - 0.04 + (m1 - m0 + 0.04) * i / 30, w = u < m1 - tp ? ml : ml * Math.max(0, (m1 - u) / tp); a1.push(pt(g, u, sd * (half - 1))); a2.push(pt(g, u, sd * (half + w))); }
      merge = "M" + a1.map(P).join(" L") + " L" + a2.reverse().map(P).join(" L") + " Z";
      // the slip road comes in from the edge of the tile on the outer side
      var j0 = pt(g, m0 - 0.02, sd * (half + ml / 2)), j1 = pt(g, m0 + 0.06, sd * (half + ml / 2)), jt = g(m0), ex = Math.max(4, Math.min(128, j0[0] - 26)), ey = sd > 0 ? 134 : -2;
      slip = "M" + ex.toFixed(1) + " " + ey + " C" + (ex + 2).toFixed(1) + " " + ((ey + j0[1]) / 2).toFixed(1) + " " + P([j0[0] - jt[2] * 14, j0[1] - jt[3] * 14]) + " " + P(j0) + " L" + P(j1);
    }
    s += '<rect x="-2" y="-2" width="136" height="136" fill="' + GRASS + '"/>';
    side.forEach(function(d){ s += st(d, 2 * hw + 4, EDGE); });
    if (slip) { s += st(slip, ml + 4, EDGE); s += '<path d="' + merge + '" fill="' + EDGE + '" stroke="' + EDGE + '" stroke-width="4" stroke-linejoin="round"/>'; }
    s += st(path(g, 0), W.total + 4, EDGE);
    side.forEach(function(d){ s += st(d, 2 * hw, ASPH); });
    if (slip) { s += st(slip, ml, ASPH); s += '<path d="' + merge + '" fill="' + ASPH + '"/>'; }
    s += st(path(g, 0), W.total, ASPH);
    for (var k = 0; k < b.ways; k++) {
      var top = -half + k * (W.cw + W.med);
      if (k > 0) s += st(path(g, top - W.med / 2), W.med, b.road === "Highway" ? "#9aa4ab" : "#8fb47a");
      for (var l = 1; l < b.lanes; l++) s += st(path(g, top + 3 + l * W.lane), 1.6, EDGE, "7 6");
    }
    if (b.road === "Highway") { s += st(path(g, -half + 2.5), 1.4, EDGE); s += st(path(g, half - 2.5), 1.4, EDGE); }
    if (slip) {
      s += st(path(g, sd * half, m0, m1 - tp + 0.04), 1.6, EDGE, "5 4");
      var ap = pt(g, m0 + 0.17, sd * (half + ml / 2)), at = g(m0 + 0.17);
      s += '<g transform="translate(' + P(ap) + ") rotate(" + (Math.atan2(at[3], at[2]) * 180 / PI).toFixed(1) + ')"><path d="M-6 0 H2 M-1 -3.5 L3 0 L-1 3.5" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></g>';
    }
    if (b.cross === "TCross" || b.cross === "Xcross") {
      var du = (hw + 1) / L;
      s += st(path(g, 0, 0.5 - du, 0.5 + du), W.total, ASPH);          // the junction box: no lines inside it
      var dash = b.stop ? "" : "3 2", lw = b.stop ? 3 : 2;
      var q1 = [J[0] - n[0] * (half + 3), J[1] - n[1] * (half + 3)];
      s += '<line x1="' + q1[0].toFixed(1) + '" y1="' + q1[1].toFixed(1) + '" x2="' + (q1[0] - t[0] * hw).toFixed(1) + '" y2="' + (q1[1] - t[1] * hw).toFixed(1) + '" stroke="#fff" stroke-width="' + lw + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + "/>";
      if (b.cross === "Xcross") { var q2 = [J[0] + n[0] * (half + 3), J[1] + n[1] * (half + 3)]; s += '<line x1="' + q2[0].toFixed(1) + '" y1="' + q2[1].toFixed(1) + '" x2="' + (q2[0] + t[0] * hw).toFixed(1) + '" y2="' + (q2[1] + t[1] * hw).toFixed(1) + '" stroke="#fff" stroke-width="' + lw + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + "/>"; }
    }
    if (b.cross === "Roundabout") {
      var R = Math.max(22, Math.min(half + 16, J[0] - 6, J[1] - 6, 126 - J[0], 126 - J[1]));
      s += '<circle cx="' + J[0].toFixed(1) + '" cy="' + J[1].toFixed(1) + '" r="' + R.toFixed(1) + '" fill="none" stroke="' + EDGE + '" stroke-width="22"/><circle cx="' + J[0].toFixed(1) + '" cy="' + J[1].toFixed(1) + '" r="' + R.toFixed(1) + '" fill="none" stroke="' + ASPH + '" stroke-width="18"/>';
      s += '<circle cx="' + J[0].toFixed(1) + '" cy="' + J[1].toFixed(1) + '" r="' + Math.max(8, R - 10).toFixed(1) + '" fill="#8fb47a" stroke="#fff" stroke-width="2"/>';
    }
    // traffic: cars in the lanes, heading opposite ways on the two sides
    var nC = b.traffic === "High" ? 4 : b.traffic === "Medium" ? 2 : 0, cols = ["#e07b1f", "#2f6fd6", "#c0392b", "#22a35a"], us = nC === 4 ? [0.12, 0.33, 0.67, 0.88] : [0.22, 0.78];
    for (var c = 0; c < nC; c++) {
      if (b.cross === "Roundabout" && Math.abs(us[c] - 0.5) < 0.28) continue;
      var dir = c % 2 ? -1 : 1, cp = pt(g, us[c], dir * Math.max(3.5, half / 2 - 1)), ct = g(us[c]), ang = Math.atan2(ct[3], ct[2]) * 180 / PI + (dir < 0 ? 180 : 0);
      s += '<g transform="translate(' + P(cp) + ") rotate(" + ang.toFixed(1) + ')"><rect x="-6" y="-3.5" width="12" height="7" rx="2" fill="' + cols[c] + '" stroke="#fff" stroke-width="1"/><rect x="1.5" y="-2.5" width="3" height="5" rx="1" fill="#cfe3f2"/></g>';
    }
    return { svg: s, g: g, half: half };
  }
  var ROT = { E: 0, S: 90, N: -90 };
  // lay the blocks out on a grid. A curve turns towards the starting line, so the road always comes back to the same line.
  function layout(){
    var x = 0, y = 0, h = "E", out = [];
    blocks.forEach(function(b){
      var turn = 0, nh = h;
      if (b.road === "Curve") {
        if (h === "E") { turn = b.dir === "up" ? -1 : b.dir === "down" ? 1 : (y < 0 ? 1 : -1); nh = turn > 0 ? "S" : "N"; }
        else if (h === "N") { turn = 1; nh = "E"; }
        else { turn = -1; nh = "E"; }
      }
      out.push({ x: x, y: y, h: h, turn: turn, out: nh });
      h = nh; if (h === "E") x++; else if (h === "N") y--; else y++;
    });
    return out;
  }
  function rotPt(p, a){ var r = a * PI / 180, c = Math.cos(r), s = Math.sin(r), dx = p[0] - 66, dy = p[1] - 66; return [66 + dx * c - dy * s, 66 + dx * s + dy * c]; }
  function tile(b, L){
    var r = roadLayer(b, L.turn), a = ROT[L.h], s = '<g transform="rotate(' + a + ' 66 66)">' + r.svg + "</g>";
    // signs in whichever corner the road leaves free
    var icons = "", ix = 0;
    if (b.stop) { icons += '<g transform="translate(' + (ix + 9) + ' 9)"><path d="M-3.4 -8.2 L3.4 -8.2 L8.2 -3.4 L8.2 3.4 L3.4 8.2 L-3.4 8.2 L-8.2 3.4 L-8.2 -3.4 Z" fill="#c0392b"/><rect x="-5" y="-1.3" width="10" height="2.6" fill="#fff"/></g>'; ix += 20; }
    if (b.priority) { icons += '<g transform="translate(' + (ix + 9) + ' 9)"><path d="M0 -9 L9 0 L0 9 L-9 0 Z" fill="#fff" stroke="#c9ced2"/><path d="M0 -5.6 L5.6 0 L0 5.6 L-5.6 0 Z" fill="#f2b928"/></g>'; ix += 20; }
    if (b.light) { icons += '<g transform="translate(' + (ix + 4) + ' -2)"><rect width="10" height="22" rx="2" fill="#23272b"/><circle cx="5" cy="5" r="2.5" fill="#c0392b"/><circle cx="5" cy="11" r="2.5" fill="#f2b928"/><circle cx="5" cy="17" r="2.5" fill="#22a35a"/></g>'; ix += 18; }
    if (ix) {
      var pts = []; for (var i = 0; i <= 24; i++) pts.push(rotPt(r.g(i / 24), a));
      var cand = [[6, 7], [6, 102], [126 - ix, 7], [126 - ix, 102]], pick = cand[0];
      for (var k = 0; k < cand.length; k++) { var cx = cand[k][0] + ix / 2, cy = cand[k][1] + 9, ok = pts.every(function(p){ return Math.hypot(p[0] - cx, p[1] - cy) > r.half + ix / 2 + 6; }); if (ok) { pick = cand[k]; break; } }
      s += '<g transform="translate(' + pick[0] + " " + pick[1] + ')"><rect x="-3" y="-4" width="' + (ix + 6) + '" height="26" rx="6" fill="#fff" fill-opacity=".92"/>' + icons + "</g>";
    }
    s += '<text x="126" y="125" text-anchor="end" font-size="11" font-weight="700" fill="#23272b" stroke="#fff" stroke-width="3" paint-order="stroke" font-family="Archivo, Helvetica, Arial, sans-serif">#' + b.code + "</text>";
    return '<svg viewBox="0 0 132 132" aria-hidden="true">' + s + "</svg>";
  }

  // ---- what makes sense on a real road ----
  var JUNCTION = { TCross: 1, Xcross: 1 };
  function copy(b){ var n = {}; Object.keys(b).forEach(function(k){ n[k] = b[k]; }); return n; }
  // fix what can be fixed inside the block itself
  function coerce(b){
    if (b.road === "Highway") { b.ways = 2; b.lanes = 2; if (b.cross !== "None" && b.cross !== "Immission") b.cross = "None"; b.stop = b.light = b.priority = false; }
    if (b.road === "Curve") b.cross = "None";
    if (b.road === "Roadbends") b.cross = "None";
    if (!JUNCTION[b.cross]) { b.stop = false; b.light = false; }
    if (b.light) { b.stop = false; b.priority = false; }
    return b;
  }
  // what depends on the block before it
  function problems(i, b){
    var p = i > 0 ? blocks[i - 1] : null, out = [];
    if (p && b.road === "Highway" && p.road !== "Highway" && p.cross !== "Roundabout") out.push("you join a highway after a roundabout");
    if (p && p.road === "Highway" && b.road !== "Highway" && b.cross !== "Roundabout") out.push("you leave a highway at a roundabout, on a straight road");
    if (b.ways === 3 && b.road !== "Straight") out.push("three carriageways only on a straight road");
    if (p && p.cross !== "Roundabout" && (b.ways !== p.ways || b.lanes !== p.lanes)) out.push("the road keeps " + p.ways + " carriageway" + (p.ways > 1 ? "s" : "") + " of " + p.lanes + " lane" + (p.lanes > 1 ? "s" : "") + " until a roundabout");
    return out;
  }
  // the block as it would be with one option changed, including the obvious knock-on changes
  function candidate(i, key, val){
    var b = blocks[i], p = i > 0 ? blocks[i - 1] : null, c = copy(b);
    c[key] = (key === "lanes" || key === "ways") ? +val : val;
    if (key === "road" && (val === "Curve" || val === "Roadbends")) c.cross = "None";
    if (key === "road" && val === "Highway" && c.cross !== "Immission") c.cross = "None";
    if (key === "road" && val === "Straight" && p && p.road === "Highway") c.cross = "Roundabout";      // leaving the highway
    if (key === "cross" && b.road === "Highway" && val !== "None" && val !== "Immission") c.road = "Straight";
    if ((key === "stop" || key === "priority") && val) c.light = false;
    if (key === "light" && val) { c.stop = false; c.priority = false; }
    return c;
  }
  var NO_CURVE = { Roundabout: "roundabout", Xcross: "crossroads", Immission: "merging lane" };
  function clash(c, key){
    if (c.road === "Curve" && c.cross !== "None") return "a 90° curve takes no junction";
    if (c.road === "Roadbends" && c.cross !== "None") return "no junctions on bends";
    if (c.road === "Highway" && c.cross !== "None" && c.cross !== "Immission") return "a highway has no junctions, only merging lanes";
    if ((key === "stop" && c.stop) || (key === "light" && c.light)) {
      if (c.road === "Highway") return "no stops or traffic lights on a highway";
      if (!JUNCTION[c.cross]) return "stops and traffic lights need a T junction or crossroads";
    }
    if (key === "priority" && c.priority && c.road === "Highway") return "no priority signs on a highway";
    if ((key === "lanes" || key === "ways") && c.road === "Highway") return "a highway has two carriageways of two lanes";
    return "";
  }
  // why an option is off for the selected block ("" when it is allowed)
  function why(i, key, val){
    if (!blocks[i]) return "";
    var c = candidate(i, key, val), r = clash(c, key);
    if (r) return r;
    coerce(c);
    var pr = problems(i, c);
    return pr.length ? pr[0] : "";
  }
  // after a change, bring the rest of the road back in line
  function normalizeFrom(i){
    for (var j = Math.max(0, i); j < blocks.length; j++) {
      var b = coerce(blocks[j]), p = j > 0 ? blocks[j - 1] : null;
      if (p && p.road === "Highway" && b.road !== "Highway" && b.cross !== "Roundabout") { b.road = "Highway"; coerce(b); }
      if (p && b.road === "Highway" && p.road !== "Highway" && p.cross !== "Roundabout") { b.road = "Straight"; coerce(b); }
      if (p && p.cross !== "Roundabout") { b.ways = p.ways; b.lanes = p.lanes; }
      if (b.ways === 3 && b.road !== "Straight") b.road = "Straight";
      coerce(b);
    }
  }
  var NAMES = { Straight: "straight", Curve: "90° curve", Roadbends: "bends", Highway: "highway", None: "no junction", TCross: "T junction", Xcross: "crossroads", Roundabout: "roundabout", Immission: "merging lane", none: "no traffic", Medium: "medium traffic", High: "heavy traffic" };
  function size(ways, lanes){ return ways + " carriageway" + (ways > 1 ? "s" : "") + " of " + lanes + " lane" + (lanes > 1 ? "s" : ""); }
  // the block in a few short pieces, already translated: the chips in the editor and the tiles' labels
  function parts(b, L){
    var road = NAMES[b.road];
    if (b.road === "Curve" && L && L.turn) road += L.h === "E" ? (L.out === "N" ? " turning up" : " turning down") : " turning back to the right";
    var r = [road, size(b.ways, b.lanes), NAMES[b.cross], NAMES[b.traffic]];
    if (b.stop) r.push("stop"); if (b.priority) r.push("priority"); if (b.light) r.push("traffic light");
    return r.map(T);
  }
  function label(b, L){ return T("Block " + b.code) + ": " + parts(b, L).join(", "); }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function line(b){ return "Block: CODE: " + b.code + " | N.corsie: " + b.lanes + " | N.Carreggiate: " + b.ways + " | TypeRoad: " + b.road + " | TypeCross: " + b.cross + " | IntensityTrafficLevel none-medium-high: " + b.traffic + " | Stop-T/F: " + (b.stop ? "True" : "False") + " | Priority-T/F: " + (b.priority ? "True" : "False") + " | TrafficLight-T/F: " + (b.light ? "True" : "False"); }
  var ORIGIN = { E: "0% 50%", N: "50% 100%", S: "50% 0%" };
  function render(){
    var L = layout(), minX = 0, maxX = 0, minY = 0, maxY = 0;
    // the + tile where the next block would go, after the last one
    var last = L[L.length - 1], gx = last ? last.x + (last.out === "E" ? 1 : 0) : 0, gy = last ? last.y + (last.out === "N" ? -1 : last.out === "S" ? 1 : 0) : 0;
    L.concat([{ x: gx, y: gy }]).forEach(function(p){ minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); });
    route.style.width = ((maxX - minX + 1) * S) + "px"; route.style.height = ((maxY - minY + 1) * S) + "px";
    route.innerHTML = blocks.map(function(b, i){ var p = L[i]; return '<button type="button" class="rb-tile' + (i === sel ? " sel" : "") + (i === fresh && !reduce ? " new" : "") + '" style="left:' + ((p.x - minX) * S) + "px;top:" + ((p.y - minY) * S) + "px;transform-origin:" + ORIGIN[p.h] + '" role="option" aria-selected="' + (i === sel) + '" data-i="' + i + '" aria-label="' + esc(label(b, p)) + '" tabindex="-1">' + tile(b, p) + "</button>"; }).join("")
      + '<button type="button" class="rb-ghost" style="left:' + ((gx - minX) * S) + "px;top:" + ((gy - minY) * S) + 'px" aria-hidden="true" tabindex="-1" title="' + esc(T("Add a block at the end of the road")) + '"><span>+</span></button>';
    fresh = -1;
    con.innerHTML = blocks.map(function(x, i){ return '<span class="' + (i === sel ? "on" : "") + '">' + esc(line(x)) + "</span>"; }).join("\n");
    var b = blocks[sel];
    info.textContent = b ? label(b, L[sel]) + "." : T("No blocks. Add one to start the road.");
    pos.textContent = b ? T("Block " + (sel + 1) + " of " + blocks.length) : T("No blocks yet");
    prev.disabled = !b || sel === 0; next.disabled = !b || sel === blocks.length - 1;
    edTitle.textContent = b ? T("Block #" + b.code) : T("No blocks yet");
    chips.innerHTML = b ? parts(b, L[sel]).map(function(p){ return "<li>" + esc(p) + "</li>"; }).join("") : "";
    thumb.innerHTML = b ? tile(b, L[sel]) : "";
    root.querySelector(".rb-editor").classList.toggle("empty", !b);
    // each group lists, under its own options, why some of them are off
    var reasons = new Map();
    root.querySelectorAll(".rb-class").forEach(function(g){ reasons.set(g, []); });
    function note(o, r){ o.disabled = !!r; o.title = r ? T("Not here") + ": " + T(r) : ""; var list = reasons.get(o.closest(".rb-class")); if (r && list && list.indexOf(r) < 0) list.push(r); }
    root.querySelectorAll(".rb-opts[data-k]").forEach(function(gp){ var k = gp.getAttribute("data-k"); gp.querySelectorAll("button").forEach(function(o){ var v = o.getAttribute("data-v"), on = String(b ? b[k] : "") === v; o.setAttribute("aria-pressed", String(on)); if (!b) { o.disabled = true; return; } note(o, on ? "" : why(sel, k, v)); }); });
    root.querySelectorAll("[data-r]").forEach(function(o){ var k = o.getAttribute("data-r"), on = !!(b && b[k]); o.setAttribute("aria-pressed", String(on)); if (!b) { o.disabled = true; return; } note(o, on ? "" : why(sel, k, true)); });
    var dirBox = root.querySelector(".rb-dir"), Lc = b && L[sel];
    dirBox.hidden = !(b && b.road === "Curve");
    if (b && b.road === "Curve") {
      var eff = Lc.h === "E" ? (Lc.out === "N" ? "up" : "down") : "right";
      dirBox.querySelectorAll("button").forEach(function(o){ var v = o.getAttribute("data-d"); o.setAttribute("aria-pressed", String(v === eff)); var r = v === eff ? "" : Lc.h === "E" ? (v === "right" ? "the road is already heading right" : "") : "after going " + (Lc.h === "N" ? "up" : "down") + ", the next curve turns back to the right"; note(o, r); });
    }
    reasons.forEach(function(list, g){ g.querySelector(".rb-why").innerHTML = list.length ? "<b>" + esc(T("Not available here")) + "</b><ul>" + list.map(function(r){ return "<li>" + esc(T(r)) + "</li>"; }).join("") + "</ul>" : ""; });
    root.querySelector(".rb-del").disabled = !b;
    var tEl = route.children[sel];
    if (tEl) setTimeout(function(){ var l = tEl.offsetLeft, tp = tEl.offsetTop; if (l < wrap.scrollLeft || l + S > wrap.scrollLeft + wrap.clientWidth || tp < wrap.scrollTop || tp + S > wrap.scrollTop + wrap.clientHeight) wrap.scrollTo({ left: Math.max(0, l - wrap.clientWidth / 2 + S / 2), top: Math.max(0, tp - wrap.clientHeight / 2 + S / 2), behavior: reduce ? "auto" : "smooth" }); }, 40);
  }
  root.querySelectorAll(".rb-opts[data-k]").forEach(function(gp){
    gp.addEventListener("click", function(e){ var o = e.target.closest("button"); if (!o || o.disabled || !blocks[sel]) return; blocks[sel] = coerce(candidate(sel, gp.getAttribute("data-k"), o.getAttribute("data-v"))); normalizeFrom(sel + 1); render(); });
  });
  root.querySelectorAll("[data-r]").forEach(function(o){ o.addEventListener("click", function(){ if (o.disabled || !blocks[sel]) return; var k = o.getAttribute("data-r"); blocks[sel] = coerce(candidate(sel, k, !blocks[sel][k])); normalizeFrom(sel + 1); render(); }); });
  function add(){
    var base = blocks[sel] || blocks[blocks.length - 1] || { ways: 1, lanes: 1, road: "Straight", cross: "None", traffic: "none", stop: false, priority: false, light: false };
    var nb = {}; Object.keys(base).forEach(function(k){ nb[k] = base[k]; });
    nb.code = blocks.reduce(function(m, x){ return Math.max(m, x.code); }, 0) + 1;
    nb.cross = "None"; nb.stop = nb.priority = nb.light = false; delete nb.dir; if (nb.road === "Curve") nb.road = "Straight";
    if (!blocks.length) { nb.ways = 1; nb.lanes = 2; nb.road = "Straight"; }
    var at = blocks.length ? sel + 1 : 0; blocks.splice(at, 0, nb); normalizeFrom(at); sel = at; fresh = at; render();
  }
  function del(){
    if (!blocks.length) return;
    var tEl = route.children[sel], go = function(){ blocks.splice(sel, 1); normalizeFrom(sel); sel = Math.max(0, Math.min(sel, blocks.length - 1)); render(); };
    if (tEl && !reduce) { tEl.classList.add("gone"); setTimeout(go, 260); } else go();
  }
  root.querySelectorAll("[data-d]").forEach(function(o){ o.addEventListener("click", function(){ if (o.disabled || !blocks[sel]) return; var v = o.getAttribute("data-d"); if (v !== "right") blocks[sel].dir = v; render(); }); });
  root.querySelector(".rb-add").addEventListener("click", add);
  root.querySelector(".rb-del").addEventListener("click", del);
  route.addEventListener("click", function(e){
    if (e.target.closest(".rb-ghost")) { sel = blocks.length - 1; add(); return; }
    var tEl = e.target.closest("[data-i]"); if (tEl) { sel = +tEl.getAttribute("data-i"); render(); }
  });
  prev.addEventListener("click", function(){ if (sel > 0) { sel--; render(); } });
  next.addEventListener("click", function(){ if (sel < blocks.length - 1) { sel++; render(); } });
  route.addEventListener("keydown", function(e){
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); sel = Math.max(0, Math.min(blocks.length - 1, sel + (e.key === "ArrowRight" ? 1 : -1))); render(); }
    else if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); del(); }
    else if (e.key === "+" || e.key === "Enter") { e.preventDefault(); add(); }
  });
  normalizeFrom(0); render();
})();
