(function(){
  var root = document.getElementById("od");
  if (!root) return;
  function q(s){ return root.querySelector(s); }
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // the anchor layout shown in the thesis
  var ANCH = [[0, 0, 2], [8, 0, 2], [8, 12, 2], [0, 12, 2], [0, 6, 0.3], [4, 0, 0.3], [8, 6, 0.3], [4, 12, 0.3]];
  var ROUTES = { A: [[6, 5], [6, 7.5], [2.5, 7.5]], B: [[6, 8.5], [4, 8.5], [4, 5.5]], C: [[2.5, 7], [6, 7], [6, 3.5]], D: [[6, 5], [2, 5], [2, 7.5]], E: [[6.5, 3.5], [4, 3.5], [4, 8]], F: [[3.5, 8], [3.5, 3.5], [6, 3.5]], G: [[1.5, 5.5], [4.5, 5.5], [4.5, 9.5]], H: [[4, 2.5], [4, 6.5], [6, 6.5]] };
  var PROF = { O1: [200, 400], O2: [500, 700], O3: [800, 1000] };
  var tags = { P1: [4, 1.2], O1: [1.2, 10.6], O2: [2.4, 10.6], O3: [3.6, 10.6] }, conn = {}, org = "bl", pulses = {}, logLines = [];
  function log(s){ var t = new Date(), ts = ("0" + t.getHours()).slice(-2) + ":" + ("0" + t.getMinutes()).slice(-2) + ":" + ("0" + t.getSeconds()).slice(-2); logLines.push("[" + ts + "] " + s); if (logLines.length > 80) logLines.shift(); var el = q(".od-log"); el.textContent = logLines.join("\n"); el.scrollTop = el.scrollHeight; }
  // anchors table
  var at = q(".od-anchors"); at.innerHTML = '<span></span><span class="h">X (m)</span><span class="h">Y (m)</span><span class="h">Z (m)</span>' + ANCH.map(function(a, i){ return "<b>A" + i + "</b>" + a.map(function(v, k){ return '<input type="number" step="0.1" value="' + v + '" data-ai="' + i + '" data-ak="' + k + '" aria-label="A' + i + " " + "XYZ"[k] + '">'; }).join(""); }).join("");
  // feedback channels
  var CH = [["AUDIO (CH 0)", "AUDIO+TOGGLE: ripeti WAV a frequency_hz"], ["HAPTIC (CH 1)", "HAPTIC+TOGGLE: on/off a frequency_hz"], ["LIGHT (CH 2)", "LIGHT+TOGGLE: blink a frequency_hz"]];
  q(".od-fb").innerHTML = CH.map(function(c, i){ return '<div class="od-ch" data-ch="' + i + '"><b>' + c[0] + '</b><label><span><input type="checkbox" data-f="en"> Enable</span></label><label>Action<select data-f="act"><option value="2">TOGGLE (2)</option><option value="1">ON (1)</option><option value="0">OFF (0)</option></select></label><label>Intensity 0–1000<input type="range" min="0" max="1000" value="' + [600, 700, 200][i] + '" data-f="int"></label><label>Frequency Hz<input type="number" value="' + [1, 10, 5][i] + '" data-f="fr"></label><label>Duration ms (0 = persist)<input type="number" value="2000" data-f="dur"></label>' + (i === 2 ? '<div class="rgbw"><input type="number" value="255" data-f="r" aria-label="R"><input type="number" value="80" data-f="g" aria-label="G"><input type="number" value="0" data-f="b" aria-label="B"><input type="number" value="0" data-f="w" aria-label="W"></div>' : "") + "</div>"; }).join("");
  // room view
  function v2(p){ var x = p[0], y = p[1]; if (org === "tr" || org === "br") x = 8 - x; if (org === "tl" || org === "tr") y = 12 - y; return [x * 30, (12 - y) * 30]; }
  function room(){
    var s = '<rect x="0" y="0" width="240" height="360" fill="#fafafa" stroke="#d1d5db"/>';
    for (var gx = 0; gx <= 8; gx += 2) { var a = v2([gx, 0]); s += '<line x1="' + a[0] + '" y1="0" x2="' + a[0] + '" y2="360" stroke="#eef0f3"/><text x="' + a[0] + '" y="374" font-size="9" text-anchor="middle" fill="#6b7280">' + gx + "</text>"; }
    for (var gy = 0; gy <= 12; gy += 2) { var b = v2([0, gy]); s += '<line x1="0" y1="' + b[1] + '" x2="240" y2="' + b[1] + '" stroke="#eef0f3"/><text x="-8" y="' + (b[1] + 3) + '" font-size="9" text-anchor="end" fill="#6b7280">' + gy + "</text>"; }
    ANCH.forEach(function(a, i){ var p = v2(a); s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" fill="#3b82f6"/><text x="' + (p[0] + (p[0] > 200 ? -7 : 7)) + '" y="' + (p[1] + (p[1] < 20 ? 14 : -7)) + '" font-size="9" text-anchor="' + (p[0] > 200 ? "end" : "start") + '" fill="#1e3a8a">A' + i + "(z=" + a[2] + ")</text>"; });
    Object.keys(tags).forEach(function(k){ if (!conn[k]) return; var p = v2(tags[k]), pu = pulses[k]; if (pu && pu.until > performance.now()) { var ph = (performance.now() / 1000 * Math.max(1, pu.f)) % 1, rr = 10 + pu.i / 1000 * 18; s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (rr + (reduce ? 0 : ph * 8)).toFixed(1) + '" fill="none" stroke="' + pu.col + '" stroke-width="3" opacity="' + (reduce ? 0.6 : (1 - ph) * 0.9).toFixed(2) + '"/>'; } s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="6" fill="' + (k === "P1" ? "#22c55e" : "#eab308") + '" stroke="#fff" stroke-width="1.5"/><text x="' + (p[0] + 8) + '" y="' + (p[1] - 6) + '" font-size="10" font-weight="700" fill="#111">' + k + "</text>"; });
    q(".od-room").innerHTML = s;
  }
  function pills(){ var n = Object.keys(conn).filter(function(k){ return conn[k]; }).length; q('[data-pill="tags"]').textContent = "Connected TAGs: " + n; }
  // scanning
  var DEV = ["P1", "O1", "O2", "O3"], bat = { P1: 71, O1: 86, O2: 84, O3: 87 };
  function devs(){
    var found = DEV.filter(function(k){ return conn[k] !== undefined; });
    q(".od-devs").innerHTML = found.length ? found.map(function(k){ var on = conn[k]; return '<div class="od-dev" data-d="' + k + '"><div class="r"><b>' + k + '</b><span class="tag' + (on ? "" : " off") + '">' + (on ? "● Online" : "● Offline") + '</span><span class="tag">' + bat[k] + '%</span><span class="tag' + (on ? "" : " off") + '">' + (on ? "Connected" : "Disconnected") + '</span><button type="button" data-dc="' + k + '">' + (on ? "Disconnect" : "Connect") + '</button></div><label><input type="checkbox" data-sd="' + k + '"> SHOW DETAILS</label><pre hidden>RAW: OK / CHANGING\nPOS: ONLINE / ' + (k === "P1" && task ? "CHANGING" : "STATIC") + "\nORI: ONLINE / STATIC\nACCEL: ONLINE / STATIC</pre></div>"; }).join("") : '<p class="od-muted">No devices yet. Start scanning.</p>';
  }
  q(".od-devs").addEventListener("click", function(e){ var b = e.target.closest("[data-dc]"); if (b) { var k = b.getAttribute("data-dc"); conn[k] = !conn[k]; log((conn[k] ? "connect " : "disconnect ") + k + " → " + (conn[k] ? "connected" : "disconnected")); devs(); pills(); room(); } });
  q(".od-devs").addEventListener("change", function(e){ var c = e.target.closest("[data-sd]"); if (c) c.closest(".od-dev").querySelector("pre").hidden = !c.checked; });
  q('[data-a="scan"]').addEventListener("click", function(){
    var btn = this; btn.disabled = true; btn.textContent = "Scanning…"; log("[03] PTY at /dev/pts/4"); log("BLE scan started");
    DEV.forEach(function(k, i){ setTimeout(function(){ conn[k] = true; log("found " + k + " · battery " + bat[k] + "% · connected"); devs(); pills(); room(); if (i === DEV.length - 1) { btn.disabled = false; btn.textContent = "Start Scanning"; log("Connected now: ['O1', 'O2', 'O3', 'P1']"); } }, reduce ? 50 : 500 + i * 450); });
  });
  // live data
  var liveTag = "O1";
  root.querySelectorAll("[data-lt]").forEach(function(b){ b.addEventListener("click", function(){ liveTag = b.getAttribute("data-lt"); root.querySelectorAll("[data-lt]").forEach(function(o){ o.setAttribute("aria-pressed", String(o === b)); }); }); });
  function live(){
    var p = tags[liveTag], on = conn[liveTag];
    function set(k, s){ var el = q('[data-sv="' + k + '"]'); el.textContent = !on ? "–" : (q('[data-st="' + k + '"]').checked ? s : "paused"); }
    set("raw", "RAW: [" + ANCH.map(function(a){ return (Math.hypot(p[0] - a[0], p[1] - a[1], 1 - a[2]) * 1.06 + 0.4 + (Math.random() - 0.5) * 0.08).toFixed(6); }).join(", ") + "]");
    set("cooked", "X: " + (p[0] + (Math.random() - 0.5) * 0.06).toFixed(2) + " | Y: " + (p[1] + (Math.random() - 0.5) * 0.06).toFixed(2) + " | Z: " + (-0.1 + (Math.random() - 0.5) * 0.04).toFixed(2));
    set("ori", "ORI: x=" + (0.65 + (Math.random() - 0.5) * 0.02).toFixed(2) + " y=-0.61 z=0.39 w=-0.14");
    set("accel", "ACCEL: x=" + ((Math.random() - 0.5) * (liveTag === "P1" && task ? 0.6 : 0.04)).toFixed(2) + " y=" + ((Math.random() - 0.5) * 0.04).toFixed(2) + " z=-0.26");
  }
  // sound: pink noise, as in the study
  var AC = null;
  function pink(intensity, ms){
    if (!q('[data-o="sound"]').checked) return;
    try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    var n = Math.floor(AC.sampleRate * ms / 1000), buf = AC.createBuffer(1, n, AC.sampleRate), d = buf.getChannelData(0), b0 = 0, b1 = 0, b2 = 0;
    for (var i = 0; i < n; i++) { var w = Math.random() * 2 - 1; b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.11; }
    var src = AC.createBufferSource(), g = AC.createGain(); src.buffer = buf; g.gain.value = 0.05 + intensity / 1000 * 0.35; src.connect(g); g.connect(AC.destination); src.start();
  }
  // manual feedback
  q('[data-a="send"]').addEventListener("click", function(){
    var target = liveTag, sent = 0;
    root.querySelectorAll(".od-ch").forEach(function(c, i){
      if (!c.querySelector('[data-f="en"]').checked) return;
      var it = +c.querySelector('[data-f="int"]').value, fr = +c.querySelector('[data-f="fr"]').value, du = +c.querySelector('[data-f="dur"]').value, act = c.querySelector('[data-f="act"]').value;
      if (!conn[target]) { log("ERROR: " + target + " not connected"); return; }
      sent++; c.classList.add("fire"); setTimeout(function(){ c.classList.remove("fire"); }, 400);
      var col = i === 0 ? "#8b5cf6" : i === 1 ? "#14b8a6" : "rgb(" + c.querySelector('[data-f="r"]').value + "," + c.querySelector('[data-f="g"]').value + "," + c.querySelector('[data-f="b"]').value + ")";
      pulses[target] = { i: it, f: fr, col: col, until: performance.now() + (du || 4000) };
      if (i === 0 && act !== "0") pink(it, Math.min(du || 1200, 1500));
      log("feedback → " + target + " CH" + i + " action=" + act + " intensity=" + it + " freq=" + fr + " Hz duration=" + du + " ms");
    });
    if (!sent) log("No channel enabled: tick Enable on at least one channel.");
  });
  q('[data-a="stopall"]').addEventListener("click", function(){ pulses = {}; log("STOP all channels → " + Object.keys(conn).filter(function(k){ return conn[k]; }).join(", ")); });
  // anchors buttons
  q('[data-a="update"]').addEventListener("click", function(){ at.querySelectorAll("input").forEach(function(inp){ ANCH[+inp.getAttribute("data-ai")][+inp.getAttribute("data-ak")] = +inp.value; }); log("anchors updated: " + ANCH.map(function(a, i){ return "A" + i + "(" + a.join(",") + ")"; }).join(" ")); room(); });
  q('[data-a="load"]').addEventListener("click", function(){ log("anchors loaded from OMNIROOM.config"); });
  q('[data-a="save"]').addEventListener("click", function(){ log("anchors saved to OMNIROOM.config"); });
  root.querySelectorAll("[data-org]").forEach(function(b){ b.addEventListener("click", function(){ org = b.getAttribute("data-org"); root.querySelectorAll("[data-org]").forEach(function(o){ o.setAttribute("aria-pressed", String(o === b)); }); room(); }); });
  // login, sessions, task
  q('[data-a="login"]').addEventListener("click", function(){ var pin = q('[data-o="pin"]').value; if (!/^\d{4,6}$/.test(pin)) { log("[ERROR] Please type username and password"); return; } log("Login successful: " + q('[data-o="user"]').value); q(".od-sess").hidden = false; q(".od-task").hidden = false; });
  q('[data-a="loadsess"]').addEventListener("click", function(){ var u = q('[data-o="user"]').value; q(".od-slist").innerHTML = ["learning · auditory_on_person_intes · path_D", "exploration · auditory_on_person_intes · path_D", "learning · haptic_external · path_F"].map(function(s, i){ return "<li>" + u + "_session_0" + (i + 1) + " · " + s + "</li>"; }).join(""); log("3 sessions loaded from MongoDB (demo)"); });
  q('[data-a="json"]').addEventListener("click", function(){ log("export: ZIP with one JSON per session (disabled in this demo)"); });
  var ps = q('[data-o="path"]'); ps.innerHTML = Object.keys(ROUTES).map(function(k){ return '<option value="' + k + '">path_' + k + "</option>"; }).join("");
  q('[data-o="task"]').addEventListener("change", function(e){ q('[data-a="start"]').textContent = "Start " + e.target.value; });
  var task = null;
  function startTask(){
    var need = ["P1", "O1", "O2", "O3"].filter(function(k){ return !conn[k]; });
    if (need.length) { log("[ERROR] tags not connected: " + need.join(", ") + " · press Start Scanning"); return; }
    var L = ROUTES[ps.value], order = ["O1", "O2", "O3"].sort(function(){ return Math.random() - 0.5; }), cond = q('[data-o="cond"]').value;
    order.forEach(function(k, i){ tags[k] = L[i].slice(); });
    var SE = { A: [[4, 5], [2.5, 4]], B: [[6, 4], [2, 5.5]], C: [[2.5, 9.5], [4, 3.5]], D: [[6, 8.5], [3.5, 7.5]], E: [[6.5, 6], [2, 8]], F: [[1.5, 8], [6, 6]], G: [[1.5, 3], [6.5, 9.5]], H: [[1.5, 2.5], [6, 9.5]] }, S = SE[ps.value][0].slice(), E = SE[ps.value][1].slice();
    tags.P1 = S.slice();
    task = { pts: [S].concat(L, [E, S.slice()]), k: 1, order: order, cond: cond, bucket: {}, phase: q('[data-o="task"]').value, back: false };
    log("task start: " + task.phase + " · " + cond + " · path_" + ps.value + " · landmarks " + order.join(" → "));
    q('[data-a="start"]').disabled = true; q('[data-a="interrupt"]').disabled = false; q('[data-a="stop"]').disabled = false;
  }
  function stopTask(why){ if (!task) return; log("task " + why); task = null; pulses = {}; q('[data-a="start"]').disabled = false; q('[data-a="interrupt"]').disabled = true; q('[data-a="stop"]').disabled = true; }
  q('[data-a="start"]').addEventListener("click", startTask);
  q('[data-a="interrupt"]').addEventListener("click", function(){ stopTask("interrupted"); });
  q('[data-a="stop"]').addEventListener("click", function(){ stopTask("stopped and saved"); });
  function tick(dt){
    if (!task) return;
    var tgt = task.pts[task.k], p = tags.P1, dx = tgt[0] - p[0], dy = tgt[1] - p[1], d = Math.hypot(dx, dy), sp = 0.55 * dt * (reduce ? 4 : 1);
    if (d <= sp) { tags.P1 = tgt.slice(); task.k++; if (task.k === task.pts.length - 1) { task.back = true; pulses = {}; log("first task ended: end point marked at (" + tgt[0].toFixed(1) + ", " + tgt[1].toFixed(1) + ")"); log("second task: back to the start, no signal"); } if (task.k >= task.pts.length) { stopTask("finished: back at the start"); return; } }
    else tags.P1 = [p[0] + dx / d * sp + (Math.random() - 0.5) * 0.01, p[1] + dy / d * sp + (Math.random() - 0.5) * 0.01];
    // the controller: one landmark at a time, 0.2 m steps between 1.0 and 0.4 m, intensity linear in the landmark profile
    if (task.back) return;                       // no signal on the way back
    task.order.forEach(function(k){
      var dist = Math.hypot(tags.P1[0] - tags[k][0], tags.P1[1] - tags[k][1]), b = dist < 1.0 ? Math.max(0, Math.floor((dist - 0.4) / 0.2)) : null;
      if (task.bucket[k] === b) return;
      task.bucket[k] = b;
      var c = task.cond, ext = /external/.test(c), aud = /auditory/.test(c), rec = ext ? k : "P1", pr = PROF[k];
      if (b === null) { log("feedback_changed " + k + " → OFF (outside 1.0 m)"); delete pulses[rec]; return; }
      if (c === "haptic_external") { log(k + " within " + dist.toFixed(2) + " m · no signal: floor patch"); return; }
      var it = ext ? Math.round((pr[0] + pr[1]) / 2) : Math.round(pr[1] - Math.min(2, b) / 2 * (pr[1] - pr[0]));
      pulses[rec] = { i: it, f: aud ? 1 : 6, col: aud ? "#8b5cf6" : "#14b8a6", until: performance.now() + 60000 };
      log("feedback_changed " + k + " step " + b + " (" + dist.toFixed(2) + " m) → " + rec + " CH" + (aud ? 0 : 1) + " intensity " + it);
      if (aud) pink(it, 450);
    });
  }
  var last = 0, acc = 0;
  function frame(now){ var dt = last ? Math.min(0.1, (now - last) / 1000) : 0; last = now; if (!(demo && !inView)) tick(dt); acc += dt; if (acc > 0.5) { acc = 0; live(); } room(); requestAnimationFrame(frame); }
  // ---------- demo: the first time the dashboard comes into view it runs a session by itself (scan, connect,
  // a learning task on one route, then the next), so a reader scrolling past sees it working. It pauses out of
  // view, and stops for good at the first click or key inside the dashboard, which is then the reader's.
  // Not with reduced motion: there the dashboard waits, as before.
  var demo = false, inView = false, demoTimer = 0, demoDone = false, badge = null, DEMO = [["D", "auditory_on_person_intes"], ["A", "haptic_on_person_intes"], ["G", "auditory_external"], ["C", "haptic_external"]], demoN = 0;
  function demoStep(){
    if (!demo) return;
    if (task) { demoTimer = setTimeout(demoStep, 1000); return; }
    var r = DEMO[demoN++ % DEMO.length];
    ps.value = r[0]; q('[data-o="cond"]').value = r[1]; q('[data-o="task"]').value = "learning"; q('[data-a="start"]').textContent = "Start learning";
    startTask(); demoTimer = setTimeout(demoStep, 2500);
  }
  function demoStart(){
    if (demo || demoDone || reduce) return;
    demo = true;
    badge = document.createElement("span"); badge.className = "od-demo";
    badge.innerHTML = '<i aria-hidden="true"></i><span>' + (window.i18n ? window.i18n.t("Demo running") : "Demo running") + '</span><button type="button">' + (window.i18n ? window.i18n.t("Stop") : "Stop") + "</button>";
    q(".od-pills").appendChild(badge);
    badge.querySelector("button").addEventListener("click", function(){ demoStop(); });
    log("demo: a session runs by itself · click anywhere in the dashboard to take over");
    var lt = q('[data-lt="P1"]'); if (lt) lt.click();   // the live data of the person who walks
    var need = DEV.some(function(k){ return !conn[k]; });
    if (need) { q('[data-a="scan"]').click(); demoTimer = setTimeout(demoStep, reduce ? 300 : 2600); } else demoStep();
  }
  function demoStop(){
    if (!demo) return;
    demo = false; demoDone = true; clearTimeout(demoTimer);
    if (badge) { badge.remove(); badge = null; }
    log("demo stopped · the dashboard is yours");
  }
  // a real click or key press hands the dashboard to the reader (the demo's own clicks are not trusted events)
  ["pointerdown", "keydown"].forEach(function(ev){ root.addEventListener(ev, function(e){ if (demo && e.isTrusted && !(badge && badge.contains(e.target))) demoStop(); }, true); });
  if ("IntersectionObserver" in window) {
    // in view: a good part of it, or half the screen when it is taller than the screen (phones)
    new IntersectionObserver(function(es){ es.forEach(function(e){ var vh = e.rootBounds ? e.rootBounds.height : window.innerHeight; inView = e.isIntersecting && (e.intersectionRatio >= 0.35 || e.intersectionRect.height >= 0.5 * vh); if (inView) demoStart(); }); }, { threshold: [0, 0.1, 0.2, 0.35, 0.5] }).observe(root);
  }
  log("dashboard ready · anchors from OMNIROOM.config");
  room(); devs(); pills(); requestAnimationFrame(frame);
})();
