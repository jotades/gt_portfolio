(function(){
  var root = document.getElementById("ot-sim");
  if (!root) return;
  function q(s){ return root.querySelector(s); }
  var svg = q(".ot-room"), statusEl = q(".status");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var PX = 36, W = 8, H = 12;
  function sx(x){ return x * PX; } function sy(y){ return (H - y) * PX; }
  var PATHS = { A: [[6, 5], [6, 7.5], [2.5, 7.5]], B: [[6, 8.5], [4, 8.5], [4, 5.5]], C: [[2.5, 7], [6, 7], [6, 3.5]], D: [[6, 5], [2, 5], [2, 7.5]], E: [[6.5, 3.5], [4, 3.5], [4, 8]], F: [[3.5, 8], [3.5, 3.5], [6, 3.5]], G: [[1.5, 5.5], [4.5, 5.5], [4.5, 9.5]], H: [[4, 2.5], [4, 6.5], [6, 6.5]] };
  // anchors of the study room (x, y, z) and the per-anchor calibrations selected by grouped cross-validation
  var ANCH = [[0, 0, 2], [8, 0, 2], [8, 12, 2], [0, 12, 2], [0, 6, 0.3], [4, 0, 0.3], [8, 6, 0.3], [4, 12, 0.3]];
  var CAL = [[0.001413, -0.036414, 1.267338, -1.047691], [0.003058, 0.947964, -0.305792], [0.979554, -0.372527], [0.997978, -0.664714], [0.004450, 0.941972, -0.373350], [0.955402, -0.421780], [-0.002799, 0.042345, 0.803640, -0.235375], [0.981573, -0.701498]];
  var ALPHA = 0.4, TAGZ = 1.0;
  // feedback rules of the study: signal from 1.0 m, 0.2 m steps, strongest from 0.6 m; each landmark unit has its own intensity range
  var D_ON = 1.0, D_MIN = 0.4, STEP = 0.2, REACH = 0.5, PROF = [[200, 400], [500, 700], [800, 1000]];
  function poly(c, x){ var r = 0; for (var i = 0; i < c.length; i++) r = r * x + c[i]; return r; }
  function invPoly(c, y){ var lo = 0, hi = 30; for (var k = 0; k < 40; k++) { var m = (lo + hi) / 2; if (poly(c, m) < y) lo = m; else hi = m; } return (lo + hi) / 2; }
  function gauss(){ var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  var st = { ph: "learn", path: "A", fb: "aud", on: "person", cal: true, ranges: false, sound: false };
  var me = [4, 1.2], est = null, filt = null, trail = [], reached = [false, false, false], perm = [0, 1, 2], near = null, out = 0, lastMsg = "", lastRanges = [], err = 0, bucket = null;
  // start and end of each route, from the thesis (Table 3.6)
  var SE = { A: [[4, 5], [2.5, 4]], B: [[6, 4], [2, 5.5]], C: [[2.5, 9.5], [4, 3.5]], D: [[6, 8.5], [3.5, 7.5]], E: [[6.5, 6], [2, 8]], F: [[1.5, 8], [6, 6]], G: [[1.5, 3], [6.5, 9.5]], H: [[1.5, 2.5], [6, 9.5]] };
  function start(){ return SE[st.path][0].slice(); }
  function drawStatic(){
    var s = '<rect x="0" y="0" width="' + sx(W) + '" height="' + (H * PX) + '" fill="#f4f6f3" stroke="#23272b" stroke-width="2"/>';
    for (var x = 1; x < W; x++) s += '<line x1="' + sx(x) + '" y1="0" x2="' + sx(x) + '" y2="' + H * PX + '" stroke="#e1e6e0"/>';
    for (var y = 1; y < H; y++) s += '<line x1="0" y1="' + sy(y) + '" x2="' + sx(W) + '" y2="' + sy(y) + '" stroke="#e1e6e0"/>';
    s += '<rect x="' + sx(1) + '" y="' + sy(10) + '" width="' + sx(6) + '" height="' + 8 * PX + '" fill="none" stroke="#9aa4ab" stroke-dasharray="5 4"/>';
    ANCH.forEach(function(a, i){ var X = sx(a[0]), Y = sy(a[1]), lx = X + (a[0] === 0 ? 9 : a[0] === W ? -9 : 0), ly = Y + (a[1] === 0 ? -9 : a[1] === H ? 17 : 4); s += '<path transform="translate(' + X + " " + Y + ')" d="M0 -7 L7 0 L0 7 L-7 0 Z" fill="' + (a[2] > 1 ? "#c8102e" : "#e98a95") + '" stroke="#fff" stroke-width="1.5"/><text x="' + lx + '" y="' + ly + '" font-size="9.5" text-anchor="' + (a[0] === 0 ? "start" : a[0] === W ? "end" : "middle") + '" fill="#8a2a33" font-family="Archivo, Helvetica, Arial, sans-serif">A' + i + " · " + a[2] + " m</text>"; });
    s += '<text x="' + sx(W) + '" y="' + (H * PX + 12) + '" font-size="9.5" text-anchor="end" fill="#55616a" font-family="Archivo, Helvetica, Arial, sans-serif">8 × 12 m · dashed: the 6 × 8 m study area</text>';
    q(".ot-static").innerHTML = s;
  }
  function drawTargets(){
    var P = PATHS[st.path], s = "", hidden = st.ph === "explore";
    P.forEach(function(p, i){
      var ok = reached[i]; if (hidden && !ok) return;
      var patch = st.fb === "hap" && st.on === "external";
      s += '<g transform="translate(' + sx(p[0]) + " " + sy(p[1]) + ')">' + (hidden ? "" : '<circle r="' + D_ON * PX + '" fill="#17a398" fill-opacity=".05" stroke="#17a398" stroke-opacity=".3" stroke-dasharray="3 3"/>') + (patch ? '<rect x="-11" y="-11" width="22" height="22" rx="3" fill="' + (ok ? "#22a35a" : "#d9c9a5") + '" stroke="#23272b" stroke-width="1.5"/>' : '<circle r="11" fill="' + (ok ? "#22a35a" : "#fff") + '" stroke="' + (ok ? "#22a35a" : "#23272b") + '" stroke-width="2"/>') + '<text y="4" font-size="9.5" font-weight="700" text-anchor="middle" fill="' + (ok ? "#fff" : "#23272b") + '" font-family="Archivo, Helvetica, Arial, sans-serif">' + (ok ? "✓" : patch ? "" : "O" + (perm[i] + 1)) + "</text></g>";
    });
    // start and end: shown while learning; in exploration the start is shown only before you set off, and both come back at the end
    var S = start(), E = SE[st.path][1], learn = st.ph === "learn", done = task === 3, F = 'font-family="Archivo, Helvetica, Arial, sans-serif"';
    if (learn || done || task === 1) s += '<circle cx="' + sx(S[0]) + '" cy="' + sy(S[1]) + '" r="13" fill="none" stroke="#55616a" stroke-dasharray="3 3"/><text x="' + sx(S[0]) + '" y="' + (sy(S[1]) + 25) + '" font-size="9.5" text-anchor="middle" fill="#55616a" ' + F + '>start</text>';
    if (learn || done) s += '<rect x="' + (sx(E[0]) - 9) + '" y="' + (sy(E[1]) - 9) + '" width="18" height="18" fill="none" stroke="#55616a" stroke-width="1.6"/><text x="' + sx(E[0]) + '" y="' + (sy(E[1]) + 23) + '" font-size="9.5" text-anchor="middle" fill="#55616a" ' + F + '>end</text>';
    function cross(p, col, lab){ var X = sx(p[0]), Y = sy(p[1]); return '<path d="M' + (X - 7) + " " + (Y - 7) + " L" + (X + 7) + " " + (Y + 7) + " M" + (X + 7) + " " + (Y - 7) + " L" + (X - 7) + " " + (Y + 7) + '" stroke="' + col + '" stroke-width="3" stroke-linecap="round"/><text x="' + (X + 10) + '" y="' + (Y - 8) + '" font-size="9.5" font-weight="700" fill="' + col + '" ' + F + ">" + lab + "</text>"; }
    if (endMark) { s += cross(endMark, "#e07b1f", "your end"); if (done) s += '<line x1="' + sx(endMark[0]) + '" y1="' + sy(endMark[1]) + '" x2="' + sx(E[0]) + '" y2="' + sy(E[1]) + '" stroke="#e07b1f" stroke-dasharray="2 3"/>'; }
    if (backMark) { s += cross(backMark, "#2f6fd6", "your return"); s += '<line x1="' + sx(backMark[0]) + '" y1="' + sy(backMark[1]) + '" x2="' + sx(S[0]) + '" y2="' + sy(S[1]) + '" stroke="#2f6fd6" stroke-dasharray="2 3"/>'; }
    q(".ot-targets").innerHTML = s;
    var d = "M" + sx(S[0]) + " " + sy(S[1]) + P.map(function(p){ return " L" + sx(p[0]) + " " + sy(p[1]); }).join("") + " L" + sx(E[0]) + " " + sy(E[1]);
    var r = q(".ot-route"); r.setAttribute("d", d); r.style.display = learn || done ? "" : "none";
    q('[data-r="cond"]').textContent = (st.fb === "aud" ? "A" : "H") + (st.on === "person" ? "P" : "E") + (st.fb === "hap" && st.on === "external" ? " · floor patches, no signal" : "");
  }
  function measure(){
    var raw = ANCH.map(function(a, i){ var d = Math.sqrt(Math.pow(me[0] - a[0], 2) + Math.pow(me[1] - a[1], 2) + Math.pow(TAGZ - a[2], 2)); var r = invPoly(CAL[i], d) + gauss() * 0.06; if (Math.random() < 0.02) r += 0.5 + Math.random() * 0.6; return r; });
    var ranges = raw.map(function(r, i){ if (!st.cal) return r; var c = poly(CAL[i], r); return filt ? ALPHA * c + (1 - ALPHA) * filt[i] : c; });
    filt = st.cal ? ranges.slice() : null; lastRanges = ranges;
    var p = est ? est.slice() : [W / 2, H / 2], lam = 1e-3;
    function dz(a){ return TAGZ - a[2]; }
    function cost(pp){ var c = 0; ANCH.forEach(function(a, i){ var e = Math.sqrt(Math.pow(pp[0] - a[0], 2) + Math.pow(pp[1] - a[1], 2) + dz(a) * dz(a)) - ranges[i]; c += e * e; }); return c; }
    for (var it = 0; it < 25; it++) {
      var A11 = 0, A12 = 0, A22 = 0, g1 = 0, g2 = 0;
      ANCH.forEach(function(a, i){ var dx = p[0] - a[0], dy = p[1] - a[1], dd = Math.sqrt(dx * dx + dy * dy + dz(a) * dz(a)), r = dd - ranges[i], jx = dx / dd, jy = dy / dd; A11 += jx * jx; A12 += jx * jy; A22 += jy * jy; g1 += jx * r; g2 += jy * r; });
      var a11 = A11 * (1 + lam), a22 = A22 * (1 + lam), det = a11 * a22 - A12 * A12; if (Math.abs(det) < 1e-12) break;
      var s1 = -(a22 * g1 - A12 * g2) / det, s2 = -(a11 * g2 - A12 * g1) / det, np = [p[0] + s1, p[1] + s2];
      if (cost(np) < cost(p)) { p = np; lam *= 0.3; } else lam *= 10;
      if (Math.abs(s1) + Math.abs(s2) < 1e-4) break;
    }
    est = p; err = Math.hypot(est[0] - me[0], est[1] - me[1]);
    trail.push([est[0], est[1]]); if (trail.length > 140) trail.shift();
    feedback();
  }
  var noiseT = 0;
  function feedback(){
    if (task !== 1) { out = 0; bucket = null; if (est) q('[data-r="dist"]').textContent = Math.hypot(est[0] - SE[st.path][0][0], est[1] - SE[st.path][0][1]).toFixed(2) + " m"; if (task === 2) say("Second task: walk back to the start and mark where you think it is. No signal on the way back."); return; }
    var P = PATHS[st.path], best = null;
    P.forEach(function(l, i){ var d = Math.hypot(est[0] - l[0], est[1] - l[1]); if (!best || d < best.d) best = { i: i, d: d }; if (d <= REACH && !reached[i]) { reached[i] = true; drawTargets(); say("Landmark reached: unit O" + (perm[i] + 1) + ", the " + ["first", "second", "third"][reached.filter(Boolean).length - 1] + " of three.", true); } });
    near = best; q('[data-r="dist"]').textContent = best.d.toFixed(2) + " m";
    var patch = st.fb === "hap" && st.on === "external";
    if (patch || best.d >= D_ON) { out = 0; bucket = null; if (!patch && best.d >= D_ON) say(reached.every(Boolean) ? "All three landmarks reached. Walk on to the end of the route and mark it." : "No signal: more than 1 m from every landmark."); if (patch) say("Haptic external: the landmarks are floor patches, found with the cane. No signal from the platform."); return; }
    var b = Math.max(0, Math.min(2, Math.floor((best.d - D_MIN) / STEP))), pr = PROF[perm[best.i]];
    var it = st.on === "external" ? (pr[0] + pr[1]) / 2 : pr[1] - b / 2 * (pr[1] - pr[0]);
    if (b !== bucket) { bucket = b; say((st.on === "external" ? "The unit on the landmark plays its sound" : "Your unit " + (st.fb === "aud" ? "plays" : "vibrates")) + ": step " + (3 - b) + " of 3, intensity " + Math.round(it) + "."); }
    out = it;
  }
  function say(m, force){ if (m !== lastMsg || force) { lastMsg = m; statusEl.textContent = m; } }
  // pink noise at 1 Hz for the auditory conditions
  var AC = null;
  function pink(gain){
    if (!st.sound) return;
    try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    var n = Math.floor(AC.sampleRate * 0.35), buf = AC.createBuffer(1, n, AC.sampleRate), d = buf.getChannelData(0), b0 = 0, b1 = 0, b2 = 0;
    for (var i = 0; i < n; i++) { var w = Math.random() * 2 - 1; b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.11; }
    var src = AC.createBufferSource(), g = AC.createGain(); src.buffer = buf; g.gain.value = gain; src.connect(g); g.connect(AC.destination); src.start();
  }
  setInterval(function(){ if (out > 0 && st.fb === "aud") { var g = 0.04 + out / 1000 * 0.3; if (st.on === "external" && near) g *= Math.max(0.25, 1.2 - near.d); pink(g); } }, 1000);
  var t0 = performance.now();
  function frame(now){
    var t = (now - t0) / 1000, M = q(".ot-me");
    M.setAttribute("transform", "translate(" + sx(me[0]).toFixed(1) + " " + sy(me[1]).toFixed(1) + ")");
    var E = q(".ot-est"); if (est) { E.setAttribute("cx", sx(est[0]).toFixed(1)); E.setAttribute("cy", sy(est[1]).toFixed(1)); }
    q(".ot-trail").setAttribute("d", trail.map(function(p, i){ return (i ? "L" : "M") + sx(p[0]).toFixed(1) + " " + sy(p[1]).toFixed(1); }).join(" "));
    q(".ot-ranges").innerHTML = st.ranges && lastRanges.length ? ANCH.map(function(a, i){ var dz = TAGZ - a[2], r = Math.sqrt(Math.max(0, lastRanges[i] * lastRanges[i] - dz * dz)); return '<circle cx="' + sx(a[0]) + '" cy="' + sy(a[1]) + '" r="' + (r * PX).toFixed(1) + '" fill="none" stroke="#c8102e" stroke-opacity=".25"/>'; }).join("") : "";
    var fx = "";
    if (out > 0 && near) {
      var P = PATHS[st.path], at = st.on === "person" ? me : P[near.i], X = sx(at[0]), Y = sy(at[1]), k = out / 1000;
      if (st.fb === "aud") { var ph = reduce ? 0.5 : t % 1; for (var w = 0; w < 3; w++) { var rr = 14 + ((ph + w / 3) % 1) * (22 + 26 * k); fx += '<circle cx="' + X + '" cy="' + Y + '" r="' + rr.toFixed(1) + '" fill="none" stroke="#7b3fa0" stroke-width="2" opacity="' + ((1 - (ph + w / 3) % 1) * (0.3 + 0.7 * k)).toFixed(2) + '"/>'; } }
      else { var amp = reduce ? 0 : (1.5 + 3.5 * k) * Math.sin(t * 90); for (var v = 0; v < 3; v++) { var r2 = 16 + v * 6 + amp * 0.5; fx += '<path d="M' + (X - r2 * 0.7) + " " + (Y - r2 * 0.7) + " A" + r2 + " " + r2 + " 0 0 1 " + (X + r2 * 0.7) + " " + (Y - r2 * 0.7) + '" fill="none" stroke="#17a398" stroke-width="2.2" opacity="' + (k * (1 - v * 0.25)).toFixed(2) + '"/>'; } if (st.on === "person") M.setAttribute("transform", "translate(" + (sx(me[0]) + amp * 0.4).toFixed(1) + " " + sy(me[1]).toFixed(1) + ")"); }
    }
    q(".ot-fx").innerHTML = fx;
    q('[data-r="out"]').textContent = out > 0 ? Math.round(out) : "off";
    q('[data-r="outl"]').textContent = (st.fb === "aud" ? "sound" : "vibration") + " intensity / 1000";
    q('[data-r="found"]').textContent = reached.filter(Boolean).length + " / 3";
    q('[data-r="err"]').textContent = est ? Math.round(err * 100) + " cm" : "–";
    requestAnimationFrame(frame);
  }
  var keys = {};
  function clampMe(){ me[0] = Math.max(0.3, Math.min(W - 0.3, me[0])); me[1] = Math.max(0.3, Math.min(H - 0.3, me[1])); }
  svg.addEventListener("keydown", function(e){ if (/^Arrow/.test(e.key)) { e.preventDefault(); keys[e.key] = true; } });
  svg.addEventListener("keyup", function(e){ delete keys[e.key]; });
  svg.addEventListener("blur", function(){ keys = {}; });
  setInterval(function(){ var v = 0.06; if (keys.ArrowLeft) me[0] -= v; if (keys.ArrowRight) me[0] += v; if (keys.ArrowUp) me[1] += v; if (keys.ArrowDown) me[1] -= v; clampMe(); }, 33);
  var drag = false;
  function toRoom(e){ var r = svg.getBoundingClientRect(), s = 320 / r.width; return [((e.clientX - r.left) * s - 16) / PX, H - ((e.clientY - r.top) * s - 16) / PX]; }
  svg.addEventListener("pointerdown", function(e){ drag = true; svg.focus(); me = toRoom(e); clampMe(); try { svg.setPointerCapture(e.pointerId); } catch (er) {} });
  svg.addEventListener("pointermove", function(e){ if (drag) { me = toRoom(e); clampMe(); } });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach(function(ev){ svg.addEventListener(ev, function(){ drag = false; }); });
  function group(attr, key){ root.querySelectorAll("[" + attr + "]").forEach(function(b){ b.addEventListener("click", function(){ st[key] = b.getAttribute(attr); root.querySelectorAll("[" + attr + "]").forEach(function(o){ o.setAttribute("aria-pressed", String(o === b)); }); bucket = null; drawTargets(); if (key === "ph") say(st.ph === "learn" ? "Learning: the researcher guides you along the route." : "Exploration: the landmarks are hidden. Only the signal tells you where they are."); }); }); }
  group("data-ph", "ph"); group("data-fb", "fb"); group("data-on", "on");
  var pathSel = q('[data-o="path"]'); pathSel.innerHTML = Object.keys(PATHS).map(function(k){ return '<option value="' + k + '">' + k + "</option>"; }).join("");
  pathSel.addEventListener("change", function(){ st.path = pathSel.value; reset(); });
  q('[data-o="cal"]').addEventListener("change", function(e){ st.cal = e.target.checked; filt = null; trail = []; say(st.cal ? "Calibrated and smoothed: the estimate sits on you." : "Raw ranges: each anchor reads long, so the estimate drifts and jumps."); });
  q('[data-o="ranges"]').addEventListener("change", function(e){ st.ranges = e.target.checked; });
  q('[data-o="sound"]').addEventListener("change", function(e){ st.sound = e.target.checked; if (st.sound) say("Sound on: pink noise at 1 Hz, as in the study, louder for stronger steps."); });
  var task = 1, endMark = null, backMark = null, plen = [0, 0, 0], lastMe = null, markBtn = q("[data-mark]"), res = q('[data-r="res"]');
  setInterval(function(){ if (lastMe && task < 3) plen[task] += Math.hypot(me[0] - lastMe[0], me[1] - lastMe[1]); lastMe = me.slice(); }, 100);
  function steps(){ root.querySelectorAll("[data-tk]").forEach(function(e){ var k = +e.getAttribute("data-tk"); if (k === task) e.setAttribute("aria-current", "step"); else e.removeAttribute("aria-current"); e.classList.toggle("done", k < task); }); markBtn.textContent = task === 1 ? "Mark the end point" : task === 2 ? "Mark the return" : "Done"; markBtn.disabled = task === 3; q('[data-r="dist"]').nextElementSibling.textContent = task === 1 ? "to the nearest landmark" : "to the start"; }
  function mark(){
    if (!est || task === 3) return;
    var S = start(), E = SE[st.path][1];
    if (task === 1) { endMark = est.slice(); task = 2; say("End point marked. Second task: walk back to the start, without any signal.", true); }
    else { backMark = est.slice(); task = 3; var de = Math.hypot(endMark[0] - E[0], endMark[1] - E[1]), dr = Math.hypot(backMark[0] - S[0], backMark[1] - S[1]); say("Done. You ended " + de.toFixed(2) + " m from the end point and came back " + dr.toFixed(2) + " m from the start.", true); res.textContent = "End-point distance " + de.toFixed(2) + " m · return distance " + dr.toFixed(2) + " m · walked " + plen[1].toFixed(1) + " m out and " + plen[2].toFixed(1) + " m back. In the study the averages were 1.85–3.01 m and 2.29–2.64 m."; }
    steps(); drawTargets();
  }
  markBtn.addEventListener("click", mark);
  svg.addEventListener("keydown", function(e){ if (e.key === "m" || e.key === "M") { e.preventDefault(); mark(); } });
  function reset(){ task = 1; endMark = null; backMark = null; plen = [0, 0, 0]; lastMe = null; res.textContent = ""; me = start(); est = null; filt = null; trail = []; reached = [false, false, false]; bucket = null; out = 0; perm = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]][Math.floor(Math.random() * 6)]; drawStatic(); drawTargets(); steps(); say("Walk towards the first landmark of route " + st.path + "."); }
  q("[data-reset]").addEventListener("click", reset);
  reset(); setInterval(measure, 100); requestAnimationFrame(frame);
})();
