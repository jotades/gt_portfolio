(function(){
  var root = document.getElementById("sw-sim");
  if (!root) return;
  function q(s){ return root.querySelector(s); }
  var stage = q(".sw-stage"), wheel = q(".sw-wheel"), scaleBg = q(".sw-scale-bg"), scaleFill = q(".sw-scale-fill"), ticks = q(".sw-ticks");
  var force = q(".sw-force"), head = q(".sw-force-head"), statusEl = q(".status");
  var degEl = q('[data-r="deg"]'), nmEl = q('[data-r="nm"]'), tFill = q(".sw-torque .fill"), goalL = q('[data-g="l"]'), goalR = q('[data-g="r"]');
  var presetBtns = root.querySelectorAll("[data-p]"), fxBtns = root.querySelectorAll("[data-fx]"), hitBtns = root.querySelectorAll("[data-hit]");
  var sl = { sat: q('[data-s="sat"]'), coef: q('[data-s="coef"]'), damp: q('[data-s="damp"]') };
  var vl = { sat: q('[data-v="sat"]'), coef: q('[data-v="coef"]'), damp: q('[data-v="damp"]') };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // presets from the project's dropdown: def, easy, medium, hard -> saturation C, coefficient D, damping
  var PRESETS = [[0, 0, 0], [85, 90, 50], [45, 40, 50], [10, 10, 50]];
  var MAX_NM = 15;            // TrueDrive_Torque in the script
  var CX = 210, CY = 222, R = 186, RANGE = 450;
  var th = 0, w = 0, keyDir = 0, drag = false, dragTarget = 0, lastPtr = 0, ffTorque = 0;
  var fx = { constant: false, dirt: false, bumpy: false, slippery: false }, hit = 0, hitT = 0, goals = { l: false, r: false }, lastMsg = "", msgUntil = 0, toast = "";
  function arcPt(a, r){ var t = a * Math.PI / 180; return [CX + r * Math.sin(t), CY - r * Math.cos(t)]; }
  function arc(a0, a1, r){ var p0 = arcPt(a0, r), p1 = arcPt(a1, r), large = Math.abs(a1 - a0) > 180 ? 1 : 0, sweep = a1 > a0 ? 1 : 0; return "M" + p0[0].toFixed(1) + " " + p0[1].toFixed(1) + " A" + r + " " + r + " 0 " + large + " " + sweep + " " + p1[0].toFixed(1) + " " + p1[1].toFixed(1); }
  function toArc(t){ return t / RANGE * 135; }
  scaleBg.setAttribute("d", arc(-135, 135, R));
  var tk = "";
  [-450, -360, -270, -180, -90, 0, 90, 180, 270, 360, 450].forEach(function(v){
    var a = toArc(v), p0 = arcPt(a, R - 9), p1 = arcPt(a, R + 9), goal = Math.abs(v) === 180, lp = arcPt(a, R + (goal ? 26 : 22));
    tk += '<line x1="' + p0[0].toFixed(1) + '" y1="' + p0[1].toFixed(1) + '" x2="' + p1[0].toFixed(1) + '" y2="' + p1[1].toFixed(1) + '" stroke="' + (goal ? "#22a35a" : "var(--ink-2)") + '" stroke-width="' + (goal ? 3 : 1.2) + '"/>';
    if (v % 180 === 0 || Math.abs(v) === 450) tk += '<text x="' + lp[0].toFixed(1) + '" y="' + (lp[1] + 4).toFixed(1) + '"' + (goal ? ' fill="#22a35a" font-weight="700"' : "") + ">" + (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + "°</text>";
  });
  ticks.innerHTML = tk;
  function setPreset(i){
    var p = PRESETS[i]; sl.sat.value = p[0]; sl.coef.value = p[1]; sl.damp.value = p[2]; syncSliders();
    presetBtns.forEach(function(b){ b.setAttribute("aria-pressed", String(+b.getAttribute("data-p") === i)); });
  }
  function syncSliders(){ Object.keys(sl).forEach(function(k){ vl[k].textContent = sl[k].value; }); }
  Object.keys(sl).forEach(function(k){ sl[k].addEventListener("input", function(){ syncSliders(); presetBtns.forEach(function(b){ var p = PRESETS[+b.getAttribute("data-p")]; b.setAttribute("aria-pressed", String(p[0] == sl.sat.value && p[1] == sl.coef.value && p[2] == sl.damp.value)); }); }); });
  presetBtns.forEach(function(b){ b.addEventListener("click", function(){ setPreset(+b.getAttribute("data-p")); }); });
  function toggleFx(name){ fx[name] = !fx[name]; root.querySelector('[data-fx="' + name + '"]').setAttribute("aria-pressed", String(fx[name])); }
  fxBtns.forEach(function(b){ b.addEventListener("click", function(){ toggleFx(b.getAttribute("data-fx")); }); });
  function doHit(kind){ hit = kind === "side" ? (Math.random() < 0.5 ? -1 : 1) * 9 : 7; hitT = kind === "side" ? 0.18 : 0.5; var b = root.querySelector('[data-hit="' + kind + '"]'); b.classList.add("flash"); setTimeout(function(){ b.classList.remove("flash"); }, 300); }
  hitBtns.forEach(function(b){ b.addEventListener("click", function(){ doHit(b.getAttribute("data-hit")); }); });
  function reset(){ goals.l = goals.r = false; goalL.classList.remove("on"); goalR.classList.remove("on"); th = 0; w = 0; msgUntil = 0; }
  q("[data-reset]").addEventListener("click", reset);
  function say(m){ if (m !== lastMsg) { lastMsg = m; statusEl.textContent = m; } }
  // physics: degrees, deg/s, Nm
  var I = 0.0035, time = 0;
  function feedback(dt){
    var slip = fx.slippery ? 0.3 : 1;
    var sat = sl.sat.value / 100 * MAX_NM * slip, k = sl.coef.value / 100 * MAX_NM / 90 * slip, c = sl.damp.value / 100 * 0.06 * slip;
    var spring = Math.max(-sat, Math.min(sat, -k * th));
    var damper = -c * w;
    var extra = 0;
    if (fx.constant) extra += 0.5 * MAX_NM;                       // LogiPlayConstantForce(0, 50)
    if (fx.dirt) extra += (Math.random() - 0.5) * 3;
    if (fx.bumpy) extra += Math.sin(time * 2 * Math.PI * 2.2) * 3 * (Math.sin(time * 2 * Math.PI * 2.2) > 0.6 ? 1 : 0.2);
    if (hitT > 0) { extra += hit * (hit > 0 && hitT > 0.2 ? Math.sin(time * 60) : 1); hitT -= dt; }
    if (Math.abs(th) > RANGE - 20) extra += -Math.sign(th) * (Math.abs(th) - (RANGE - 20)) * 0.6;   // soft stop near the end of travel
    return spring + damper + extra;
  }
  function step(dt){
    time += dt;
    var user = 0;
    if (keyDir) dragTarget = Math.max(-RANGE, Math.min(RANGE, dragTarget + keyDir * 150 * dt));
    if (drag || keyDir) user = Math.max(-20, Math.min(20, 0.35 * (dragTarget - th) - 0.012 * w));
    ffTorque = feedback(dt);
    var tot = user + ffTorque;
    if (!drag && !keyDir && Math.abs(w) < 0.5 && Math.abs(ffTorque) < 0.15) { w = 0; return; }
    w += tot / I * dt;
    w *= 0.999;
    th += w * dt;
    if (th > RANGE) { th = RANGE; w = Math.min(0, w); }
    if (th < -RANGE) { th = -RANGE; w = Math.max(0, w); }
  }
  function render(now){
    var shake = (fx.dirt || fx.bumpy || hitT > 0) && !reduce ? (Math.random() - 0.5) * (hitT > 0 ? 3 : 1.2) : 0;
    wheel.setAttribute("transform", "rotate(" + (th + shake).toFixed(2) + " " + CX + " " + CY + ")");
    var a = toArc(th);
    scaleFill.setAttribute("d", Math.abs(a) < 0.3 ? "" : arc(0, a, R));
    var t = Math.abs(ffTorque), tShow = Math.min(MAX_NM, t);
    degEl.textContent = (th > 0.5 ? "+" : th < -0.5 ? "−" : "") + Math.abs(Math.round(th)) + "°";
    nmEl.textContent = tShow.toFixed(1);
    tFill.style.width = (tShow / MAX_NM * 100) + "%";
    // force arrow along the rim, pointing the way the wheel is pushed
    if (t > 0.3) {
      var sgn = ffTorque > 0 ? 1 : -1, sweep = Math.min(80, tShow / MAX_NM * 80 + 8), a0 = sgn > 0 ? 200 : 160, a1 = a0 + sgn * sweep, r = 108;
      force.setAttribute("d", arc(a0, a1, r));
      var p = arcPt(a1, r), tang = (a1 + (sgn > 0 ? 90 : -90)) * Math.PI / 180, dx = Math.sin(tang), dy = -Math.cos(tang), nx = -dy, ny = dx;
      head.setAttribute("d", "M" + (p[0] + dx * 12).toFixed(1) + " " + (p[1] + dy * 12).toFixed(1) + " L" + (p[0] + nx * 8).toFixed(1) + " " + (p[1] + ny * 8).toFixed(1) + " L" + (p[0] - nx * 8).toFixed(1) + " " + (p[1] - ny * 8).toFixed(1) + " Z");
    } else { force.setAttribute("d", ""); head.setAttribute("d", ""); }
    // goals, as in goal.cs: 180 degrees to either side
    if (th >= 180 && !goals.r) { goals.r = true; goalR.classList.add("on"); toast = "Reached right goal"; msgUntil = now + 1600; }
    if (th <= -180 && !goals.l) { goals.l = true; goalL.classList.add("on"); toast = "Reached left goal"; msgUntil = now + 1600; }
    if (now < msgUntil) return say(toast + (goals.l && goals.r ? ". Rotation test complete." : "."));
    if (goals.l && goals.r) return say("Rotation test complete. Try a harder preset, or reset.");
    if (t >= MAX_NM - 0.05) return say("The wheel is pushing back at its 15 Nm limit.");
    say("Turn the wheel to 180° on either side.");
  }
  var last = 0;
  function frame(now){
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now;
    var n = Math.max(1, Math.ceil(dt / 0.002));
    for (var i = 0; i < n; i++) step(dt / n);
    render(now);
    requestAnimationFrame(frame);
  }
  // pointer: turn the rim by dragging around the centre
  function ptrAngle(e){ var r = stage.querySelector("svg").getBoundingClientRect(), s = 420 / r.width; var x = (e.clientX - r.left) * s - CX, y = (e.clientY - r.top) * s - CY; return Math.atan2(x, -y) * 180 / Math.PI; }
  stage.addEventListener("pointerdown", function(e){ drag = true; lastPtr = ptrAngle(e); dragTarget = th; try { stage.setPointerCapture(e.pointerId); } catch (err) {} e.preventDefault(); });
  stage.addEventListener("pointermove", function(e){ if (!drag) return; var a = ptrAngle(e), d = a - lastPtr; if (d > 180) d -= 360; if (d < -180) d += 360; lastPtr = a; dragTarget = Math.max(-RANGE, Math.min(RANGE, dragTarget + d)); });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach(function(ev){ stage.addEventListener(ev, function(){ drag = false; }); });
  stage.addEventListener("keydown", function(e){
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); var d = e.key === "ArrowLeft" ? -1 : 1; if (keyDir !== d) { keyDir = d; dragTarget = th; } }
  });
  stage.addEventListener("keyup", function(e){ if (e.key === "ArrowLeft" || e.key === "ArrowRight") { keyDir = 0; } });
  stage.addEventListener("blur", function(){ keyDir = 0; drag = false; });
  root.addEventListener("keydown", function(e){
    if (e.target.tagName === "INPUT") return;
    var k = e.key.toLowerCase(), map = { c: "constant", i: "dirt", b: "bumpy", l: "slippery" };
    if (map[k]) toggleFx(map[k]);
    else if (e.key === "ArrowUp") { e.preventDefault(); doHit("front"); }
    else if (/^[1-4]$/.test(e.key)) setPreset(+e.key - 1);
    else if (k === "r") reset();
  });
  setPreset(2); requestAnimationFrame(frame);
})();
