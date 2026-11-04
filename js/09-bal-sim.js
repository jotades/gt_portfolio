(function(){
  var root = document.getElementById("bal-sim");
  if (!root) return;
  function q(s){ return root.querySelector(s); }
  var btn = q(".leg-btn"), statusEl = q(".status"), timeEl = q('[data-r="time"]'), fill = q(".gauge .fill");
  var pEl = q('[data-r="p"]'), fEl = q('[data-r="f"]'), pBar = q('[data-b="p"]'), fBar = q('[data-b="f"]');
  var repsEl = q('[data-r="reps"]'), lastEl = q('[data-r="last"]'), targetSel = q('[data-o="target"]'), soundBox = q('[data-o="sound"]');
  var thigh = q(".bl-thigh"), shank = q(".bl-shank"), kj = q(".bl-kj"), sleeve = q(".bl-sleeve"), flexEl = q(".bl-flex"), wire = q(".bl-wire"), wire2 = q(".bl-wire2");
  var shoe = q(".bl-shoe"), fsr = q(".bl-fsr"), box = q(".bl-box"), led = q(".bl-led"), note = q(".bl-note"), powerBtns = root.querySelectorAll("[data-power]");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // thresholds from the prototype's code (10_Project.ino)
  var P_TH = 800, F_TH = 150, REP_MS = 3000;
  var HIP = { x: 194, y: 100 }, TL = 146, SL = 140;
  var on = false, L = 0, tgt = 0, pressHold = false;
  var legUp = 0, repStarted = 0, flexGood = 0, startT = 0, reps = 0, target = 5, done = false, pressure = 930, flex = 300;
  var vibUntil = 0, msgUntil = 0, lastMsg = "", toast = "";
  function deg(r){ return r * 180 / Math.PI; }
  function kin(l){
    var a = 60 * l * Math.PI / 180, k = 100 * l * Math.PI / 180, b = a - k;
    var d1 = { x: Math.sin(a), y: Math.cos(a) }, d2 = { x: Math.sin(b), y: Math.cos(b) };
    var knee = { x: HIP.x + TL * d1.x, y: HIP.y + TL * d1.y }, ank = { x: knee.x + SL * d2.x, y: knee.y + SL * d2.y };
    return { a: a, b: b, d1: d1, d2: d2, knee: knee, ank: ank };
  }
  var GROUND = kin(0).ank.y;
  function P(p){ return p.x.toFixed(1) + " " + p.y.toFixed(1); }
  function add(p, d, s){ return { x: p.x + d.x * s, y: p.y + d.y * s }; }
  function draw(){
    var g = kin(L), n1 = { x: g.d1.y, y: -g.d1.x }, n2 = { x: g.d2.y, y: -g.d2.x };
    thigh.setAttribute("x1", HIP.x); thigh.setAttribute("y1", HIP.y); thigh.setAttribute("x2", g.knee.x); thigh.setAttribute("y2", g.knee.y);
    shank.setAttribute("x1", g.knee.x); shank.setAttribute("y1", g.knee.y); shank.setAttribute("x2", g.ank.x); shank.setAttribute("y2", g.ank.y);
    kj.setAttribute("cx", g.knee.x); kj.setAttribute("cy", g.knee.y);
    sleeve.setAttribute("d", "M" + P(add(g.knee, g.d1, -44)) + " L" + P(g.knee) + " L" + P(add(g.knee, g.d2, 46)));
    var nk = { x: n1.x + n2.x, y: n1.y + n2.y }, nl = Math.hypot(nk.x, nk.y) || 1; nk = { x: nk.x / nl, y: nk.y / nl };
    var f0 = add(add(g.knee, g.d1, -36), n1, 24), f1 = add(g.knee, nk, 27), f2 = add(add(g.knee, g.d2, 38), n2, 21);
    flexEl.setAttribute("d", "M" + P(f0) + " Q" + P(add(g.knee, nk, 33)) + " " + P(f2));
    flexEl.setAttribute("stroke", on && flex < F_TH ? "#22a35a" : "#8a97a5");
    var bc = add(g.knee, g.d2, 92);
    box.setAttribute("transform", "translate(" + P(bc) + ") rotate(" + (-deg(g.b)).toFixed(1) + ")");
    var bTop = add(add(bc, n2, 25), g.d2, -22), bBot = add(add(bc, n2, 25), g.d2, 22);
    wire.setAttribute("d", "M" + P(bTop) + " Q" + P(add(f2, n2, 8)) + " " + P(f2));
    shoe.setAttribute("transform", "translate(" + P(g.ank) + ") rotate(" + (-deg(g.b)).toFixed(1) + ")");
    var heel = add(add(g.ank, g.d2, 18), n2, -6);
    wire2.setAttribute("d", "M" + P(bBot) + " Q" + P(add(add(bc, g.d2, 40), n2, 22)) + " " + P(heel));
    fsr.setAttribute("fill", pressure > P_TH ? "#e07b1f" : "#c9d2da");
  }
  function say(m){ if (m !== lastMsg) { lastMsg = m; statusEl.textContent = m; } }
  // melody from the prototype: C4 G3 G3 A3 G3 rest B3 C4
  var AC = null;
  function melody(){
    if (!soundBox.checked) return;
    try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    var notes = [262, 196, 196, 220, 196, 0, 247, 262], durs = [4, 8, 8, 4, 4, 4, 4, 4], t = AC.currentTime + 0.05;
    notes.forEach(function(f, i){
      var d = 1 / durs[i];
      if (f) { var o = AC.createOscillator(), gn = AC.createGain(); o.type = "square"; o.frequency.value = f; gn.gain.setValueAtTime(0.05, t); gn.gain.setValueAtTime(0, t + d); o.connect(gn); gn.connect(AC.destination); o.start(t); o.stop(t + d + 0.02); }
      t += d * 1.3;
    });
    note.setAttribute("opacity", "1"); setTimeout(function(){ note.setAttribute("opacity", "0"); }, 2600);
  }
  function vibrate(ms){ vibUntil = performance.now() + ms; btn.classList.add("vib"); }
  function render(now){
    var elapsed = repStarted ? (now - startT) : 0;
    timeEl.textContent = (elapsed / 1000).toFixed(1) + " s";
    fill.style.width = Math.min(100, elapsed / 60) + "%";
    fill.style.background = elapsed > REP_MS && flexGood ? "#22a35a" : "";
    pEl.textContent = on ? Math.round(pressure) : "–"; fEl.textContent = on ? Math.round(flex) : "–";
    pBar.querySelector("i").style.width = (on ? pressure / 1023 * 100 : 0) + "%"; pBar.classList.toggle("ok", on && pressure < P_TH);
    fBar.querySelector("i").style.width = (on ? flex / 1023 * 100 : 0) + "%"; fBar.classList.toggle("ok", on && flex < F_TH);
    repsEl.textContent = reps + " / " + target;
    var blink = legUp && Math.floor(now / 500) % 2 === 0;
    led.setAttribute("fill", !on ? "#55616a" : (legUp ? (blink ? "#4aa3ff" : "#1b3a66") : "#4aa3ff"));
    if (now > vibUntil) btn.classList.remove("vib");
    if (!on) return say("The device is off. Switch it on with its button.");
    if (now < msgUntil) return say(toast);
    if (done) return say("Set complete. Press Reset for a new set.");
    if (!legUp) return say("Stand on both feet, then lift the stronger leg.");
    if (!flexGood) return say("Foot up. Bend the knee a bit more.");
    if (elapsed < REP_MS) return say("Good, hold it…");
    say("Now put the foot down.");
  }
  // one pass of the Arduino loop every 100 ms
  function loop(){
    var now = performance.now(), rise = GROUND - kin(L).ank.y;
    pressure = Math.max(0, 930 - Math.min(1, rise / 5) * 900 + (Math.random() - 0.5) * 12);
    flex = 300 - 240 * L + (Math.random() - 0.5) * 6;
    if (on && !done) {
      if (pressure < P_TH) legUp = 1; else legUp = 0;
      if (legUp && !repStarted) { startT = now; repStarted = 1; }
      if (legUp && repStarted && flex < F_TH) flexGood = 1;
      if (!legUp && repStarted) {
        var dt = now - startT;
        lastEl.textContent = (dt / 1000).toFixed(1) + " s";
        if (flexGood && dt > REP_MS) {
          reps++; vibrate(900);
          if (reps >= target) { done = true; melody(); toast = "Set complete: " + reps + " repetitions."; }
          else toast = "Repetition " + reps + " of " + target + ".";
        } else toast = flexGood ? "Not counted: keep the foot up for at least 3 s." : "Not counted: bend the knee more.";
        msgUntil = now + 1800; repStarted = 0; flexGood = 0;
      }
    } else if (!on) { legUp = 0; repStarted = 0; flexGood = 0; }
    render(now);
  }
  var last = 0;
  function frame(t){
    var dt = last ? Math.min(0.05, (t - last) / 1000) : 0; last = t;
    var goal = pressHold ? 1 : tgt;
    var step = 1.6 * dt; L += Math.max(-step, Math.min(step, goal - L));
    draw();
    requestAnimationFrame(frame);
  }
  function setPower(v){ on = v; powerBtns.forEach(function(b){ b.setAttribute("aria-pressed", String((b.getAttribute("data-power") === "on") === on)); }); repStarted = 0; flexGood = 0; msgUntil = 0; }
  function reset(){ reps = 0; done = false; repStarted = 0; flexGood = 0; msgUntil = 0; lastEl.textContent = "–"; }
  powerBtns.forEach(function(b){ b.addEventListener("click", function(){ setPower(b.getAttribute("data-power") === "on"); }); });
  q("[data-reset]").addEventListener("click", reset);
  targetSel.addEventListener("change", function(){ target = +targetSel.value; done = reps >= target; });
  btn.addEventListener("pointerdown", function(e){ pressHold = true; try { btn.setPointerCapture(e.pointerId); } catch (err) {} e.preventDefault(); });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach(function(ev){ btn.addEventListener(ev, function(){ pressHold = false; tgt = 0; }); });
  btn.addEventListener("click", function(e){ e.preventDefault(); });
  btn.addEventListener("keydown", function(e){ if (e.key === " " || e.key === "Enter") { e.preventDefault(); pressHold = true; } });
  btn.addEventListener("keyup", function(e){ if (e.key === " " || e.key === "Enter") { pressHold = false; tgt = 0; } });
  root.addEventListener("keydown", function(e){
    if (e.target.tagName === "SELECT" || e.target.tagName === "INPUT") return;
    var k = e.key.toLowerCase();
    if (e.key === "ArrowUp") { e.preventDefault(); tgt = Math.min(1, Math.round((Math.max(tgt, L) + 0.1) * 10) / 10); }
    else if (e.key === "ArrowDown") { e.preventDefault(); tgt = Math.max(0, Math.round((Math.min(tgt, L) - 0.1) * 10) / 10); }
    else if (k === "b") setPower(!on);
    else if (k === "r") reset();
  });
  draw(); setInterval(loop, 100); requestAnimationFrame(frame);
})();
