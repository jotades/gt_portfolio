(function(){
  var sim = document.getElementById("ard-sim");
  if (!sim) return;
  var hand = sim.querySelector("#ard-hand"), rotor = sim.querySelector("#ard-rotor"), w1 = sim.querySelector("#ard-w1"), w2 = sim.querySelector("#ard-w2");
  var range = sim.querySelector('input[type="range"]'), holdSel = sim.querySelector(".ard-hold-sel"), holdBox = sim.querySelector(".ard-hold");
  var bar = sim.querySelector(".ard-hold-bar i"), holdTxt = sim.querySelector(".ard-hold span");
  var rDist = sim.querySelector('[data-r="dist"]'), rSpeed = sim.querySelector('[data-r="speed"]'), duty = sim.querySelector(".ard-duty"), pwm = sim.querySelector(".ard-pwm path");
  var serial = sim.querySelector(".ard-serial"), status = sim.querySelector(".ard-status"), modeBtns = sim.querySelectorAll("[data-ex]");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SENSOR_Y = 398, PX = 5.4, MIN = 3, MAX = 50;
  var d = 25.5, away = false, ex = 1, threshold = 1000;
  var stored = MAX, startTime = 0, speed = 0, running = false, locked = false, lastMsg = "", lines = [], dist = 0;
  // Arduino's map(), integer maths as in the sketch
  function amap(x, a, b, c, e){ return Math.trunc((x - a) * (e - c) / (b - a)) + c; }
  function constrain(x, a, b){ return x < a ? a : (x > b ? b : x); }
  function say(msg){ if (msg !== lastMsg) { lastMsg = msg; status.textContent = msg; } }
  function setHand(v){ d = Math.max(0, Math.min(80, v)); away = false; range.value = Math.round(d); }
  function reset(){ stored = MAX; startTime = performance.now(); lines = []; serial.textContent = ""; setHand(25.5); }
  // one pass of loop(), every 100 ms like delay(100)
  function loop(){
    var raw = away ? 400 : d + (Math.random() - 0.5) * 0.5;
    dist = constrain(Math.floor(raw), MIN, MAX);
    speed = amap(dist, MAX, MIN, 255, 100);
    locked = false;
    var now = performance.now();
    if (ex === 2 && dist <= MAX) {
      if (dist < stored) { stored = dist; startTime = now; }
      else if (now - startTime >= threshold) { speed = amap(stored, MAX, MIN, 255, 100); locked = true; }
      else if (dist > stored) { stored = dist; }
    }
    running = dist > MIN;
    lines.push("Distance: " + dist + " cm, Motor Speed: " + speed);
    if (lines.length > 6) lines.shift();
    serial.textContent = lines.join("\n");
    render(now);
    wave = now;
  }
  function render(now){
    rDist.textContent = dist;
    rSpeed.textContent = running ? speed : 0;
    var dc = running ? speed / 255 : 0;
    duty.textContent = "Duty cycle " + Math.round(dc * 100) + "%";
    var p = "", w = 170, per = w / 4, hi = 4, lo = 36;
    for (var i = 0; i < 4; i++) { var x0 = i * per, x1 = x0 + per * dc; p += (i ? " L" : "M") + x0 + " " + lo + " L" + x0 + " " + (dc > 0 ? hi : lo) + " L" + x1 + " " + (dc > 0 ? hi : lo) + " L" + x1 + " " + lo; }
    p += " L" + w + " " + lo; pwm.setAttribute("d", p);
    if (ex === 2) {
      var prog = Math.min(1, (now - startTime) / threshold);
      bar.style.width = (locked ? 100 : prog * 100) + "%";
      holdTxt.textContent = locked ? "Locked at " + stored + " cm" : "Hold still: " + (Math.min(threshold, now - startTime) / 1000).toFixed(1) + " s of " + (threshold / 1000) + " s";
    }
    if (!running) say("Too close: below 3 cm the motor stops.");
    else if (locked) say("Locked at " + stored + " cm: the motor keeps speed " + speed + " even if you take the hand away.");
    else if (away) say("No hand: the reading jumps to 50 cm, so the motor runs at full speed.");
    else say(ex === 2 ? "Keep the hand still to lock the speed." : "The motor follows the hand: farther means faster.");
  }
  var angle = 0, omega = 0, wave = 0, last = 0;
  function frame(t){
    var dt = last ? Math.min(0.05, (t - last) / 1000) : 0; last = t;
    var target = running ? (speed / 255) * 720 : 0;
    omega += (target - omega) * Math.min(1, dt * 3);
    if (!reduce) { angle = (angle + omega * dt) % 360; rotor.setAttribute("transform", "translate(0 -112) rotate(" + angle.toFixed(1) + ")"); }
    var y = away ? 74 : SENSOR_Y - Math.min(d, 62) * PX;
    hand.setAttribute("transform", "translate(" + (away ? -38 : 0) + " " + y.toFixed(1) + ")");
    hand.style.opacity = away ? 0.35 : 1;
    // ultrasound burst and echo
    var gap = SENSOR_Y - y, k = (t - wave) / 260;
    if (!reduce && !away && gap > 6 && k < 2) {
      var up = k < 1, yy = up ? SENSOR_Y - k * gap : y + (k - 1) * gap;
      w1.setAttribute("transform", "translate(0 " + yy.toFixed(1) + ")"); w1.setAttribute("opacity", up ? 0.9 : 0);
      w2.setAttribute("transform", "translate(0 " + yy.toFixed(1) + ")"); w2.setAttribute("opacity", up ? 0 : 0.7);
    } else { w1.setAttribute("opacity", 0); w2.setAttribute("opacity", 0); }
    requestAnimationFrame(frame);
  }
  // controls
  range.addEventListener("input", function(){ setHand(+range.value + 0.5); });
  holdSel.addEventListener("change", function(){ threshold = +holdSel.value; startTime = performance.now(); });
  modeBtns.forEach(function(b){ b.addEventListener("click", function(){ setEx(+b.getAttribute("data-ex")); }); });
  function setEx(n){ ex = n; modeBtns.forEach(function(o){ o.setAttribute("aria-pressed", String(+o.getAttribute("data-ex") === n)); }); holdBox.hidden = n !== 2; stored = MAX; startTime = performance.now(); }
  sim.querySelector("[data-reset]").addEventListener("click", reset);
  sim.addEventListener("keydown", function(e){
    if (e.target.tagName === "SELECT") return;
    var step = e.shiftKey ? 5 : 1, k = e.key.toLowerCase();
    if (e.key === "ArrowUp" || k === "w") { e.preventDefault(); setHand((away ? 25.5 : d) + step); }
    else if (e.key === "ArrowDown" || k === "s") { e.preventDefault(); setHand((away ? 25.5 : d) - step); }
    else if (k === "h") { away = !away; }
    else if (k === "1" || k === "2") { setEx(+k); }
    else if (k === "r") { reset(); }
  });
  // drag the hand
  var dragging = false;
  function yToD(clientY){ var r = sim.querySelector(".ard-scene svg").getBoundingClientRect(), s = 470 / r.height; return (SENSOR_Y - (clientY - r.top) * s) / PX; }
  hand.addEventListener("pointerdown", function(e){ dragging = true; try { hand.setPointerCapture(e.pointerId); } catch (err) {} e.preventDefault(); });
  hand.addEventListener("pointermove", function(e){ if (dragging) setHand(Math.floor(yToD(e.clientY)) + 0.5); });
  ["pointerup","pointercancel"].forEach(function(ev){ hand.addEventListener(ev, function(){ dragging = false; }); });
  reset(); setEx(1);
  setInterval(loop, 100);
  requestAnimationFrame(frame);
})();
