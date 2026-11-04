(function(){
  var root = document.getElementById("fl-sim");
  if (!root) return;
  var stage = root.querySelector(".fl-stage"), cv = stage.querySelector("canvas"), ctx = cv.getContext("2d");
  var pourBtn = root.querySelector(".fl-pour"), statusEl = root.querySelector(".status"), counts = root.querySelectorAll("[data-c]");
  var W = 480, H = 340, S = cv.width / W;
  // bottle from the Unity model (Bottiglia.obj): body r 4.16 cm to 17.1 cm, shoulder to the neck r 1.05 cm at 30.7 cm, top at 31.7 cm
  var PX = 3.6, BOT = [[0, 4.16], [17.1, 4.16], [30.7, 1.05], [31.7, 1.05]];
  var piv = { x: 96, y: 130 }, tilt = 118 * Math.PI / 180;   // bottle tipped over the buckets
  function bpt(hcm, side){ var r = 0; for (var i = 1; i < BOT.length; i++) if (hcm <= BOT[i][0]) { var a = BOT[i-1], b = BOT[i], t = (hcm - a[0]) / (b[0] - a[0] || 1); r = a[1] + (b[1] - a[1]) * t; break; } var lx = side * r * PX, ly = -hcm * PX; return { x: piv.x + lx * Math.cos(tilt) - ly * Math.sin(tilt), y: piv.y + lx * Math.sin(tilt) + ly * Math.cos(tilt) }; }
  var mouth = bpt(31.7, 0), axis = { x: Math.sin(tilt), y: -Math.cos(tilt) };
  // buckets: [x centre, width, height]
  var buckets = [{ x: 120, w: 84, h: 70 }, { x: 250, w: 84, h: 70 }, { x: 380, w: 84, h: 70 }], FLOOR = H - 14;
  var segs = [];
  function buildSegs(){
    segs = [[0, FLOOR, W, FLOOR], [0, 0, 0, FLOOR], [W, 0, W, FLOOR]];
    buckets.forEach(function(b){ var l = b.x - b.w / 2, r = b.x + b.w / 2, t = FLOOR - b.h; segs.push([l, t, l + 6, FLOOR], [l + 6, FLOOR, r - 6, FLOOR], [r - 6, FLOOR, r, t]); });
  }
  buildSegs();
  var P = [], MAX = 420, R = 3.2, HR = 11, REST = 3.2, K = 0.012, KN = 0.05, G = 0.11, pour = false, keyPour = false, emitAcc = 0, moveDir = 0;
  function emit(){
    if (P.length >= MAX) return false;
    var j = (Math.random() - 0.5) * 3, n = { x: -axis.y, y: axis.x };
    var x = mouth.x + n.x * j + axis.x * 2, y = mouth.y + n.y * j + axis.y * 2, sp = 2.4 + Math.random() * 0.3;
    P.push({ x: x, y: y, px: x - axis.x * sp, py: y - axis.y * sp, vx: axis.x * sp, vy: axis.y * sp });
    return true;
  }
  var grid = new Map();
  function key(cx, cy){ return cx * 1000 + cy; }
  function step(){
    var i, p;
    for (i = 0; i < P.length; i++) { p = P[i]; p.vy += G; p.px = p.x; p.py = p.y; p.x += p.vx; p.y += p.vy; }
    grid.clear();
    for (i = 0; i < P.length; i++) { p = P[i]; var k = key(Math.floor(p.x / HR), Math.floor(p.y / HR)); var c = grid.get(k); if (!c) grid.set(k, c = []); c.push(i); }
    for (i = 0; i < P.length; i++) {
      p = P[i]; var gx = Math.floor(p.x / HR), gy = Math.floor(p.y / HR), nb = [], rho = 0, rhoN = 0;
      for (var ox = -1; ox <= 1; ox++) for (var oy = -1; oy <= 1; oy++) { var c2 = grid.get(key(gx + ox, gy + oy)); if (!c2) continue; for (var m = 0; m < c2.length; m++) { var j = c2[m]; if (j === i) continue; var o = P[j], dx = o.x - p.x, dy = o.y - p.y, d2 = dx * dx + dy * dy; if (d2 < HR * HR && d2 > 1e-6) { var d = Math.sqrt(d2), qq = 1 - d / HR; rho += qq * qq; rhoN += qq * qq * qq; nb.push([o, dx / d, dy / d, qq]); } } }
      var pr = K * (rho - REST), prN = KN * rhoN, ddx = 0, ddy = 0;
      for (var n = 0; n < nb.length; n++) { var e = nb[n], D = (pr * e[3] + prN * e[3] * e[3]) * HR * 0.5; e[0].x += e[1] * D; e[0].y += e[2] * D; ddx -= e[1] * D; ddy -= e[2] * D; }
      p.x += ddx; p.y += ddy;
    }
    for (i = 0; i < P.length; i++) { p = P[i]; collide(p); p.vx = (p.x - p.px) * 0.995; p.vy = (p.y - p.py) * 0.995; }
  }
  function collide(p){
    for (var s = 0; s < segs.length; s++) {
      var g = segs[s], ax = g[0], ay = g[1], bx = g[2], by = g[3], ex = bx - ax, ey = by - ay, l2 = ex * ex + ey * ey;
      var t = Math.max(0, Math.min(1, ((p.x - ax) * ex + (p.y - ay) * ey) / l2)), cx = ax + ex * t, cy = ay + ey * t, dx = p.x - cx, dy = p.y - cy, d = Math.sqrt(dx * dx + dy * dy), min = R + 2;
      if (d < min) {
        if (d < 1e-6) { dx = -ey; dy = ex; d = Math.sqrt(l2); }
        var nx = dx / d, ny = dy / d; p.x = cx + nx * min; p.y = cy + ny * min;
        // friction: damp the tangential motion a little
        var vx = p.x - p.px, vy = p.y - p.py, vn = vx * nx + vy * ny; if (vn < 0) { p.px = p.x - (vx - vn * nx) * 0.98; p.py = p.y - (vy - vn * ny) * 0.98; }
      }
    }
    if (p.y > FLOOR) p.y = FLOOR - R;
  }
  function countIn(){
    var c = [0, 0, 0];
    for (var i = 0; i < P.length; i++) { var p = P[i]; for (var b = 0; b < 3; b++) { var B = buckets[b]; if (p.x > B.x - B.w / 2 && p.x < B.x + B.w / 2 && p.y > FLOOR - B.h - 4 && p.y < FLOOR) c[b]++; } }
    return c;
  }
  function draw(){
    ctx.setTransform(S, 0, 0, S, 0, 0); ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#f1f5f8"; ctx.fillRect(0, FLOOR, W, H - FLOOR);
    ctx.strokeStyle = "#c3ccd3"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, FLOOR); ctx.lineTo(W, FLOOR); ctx.stroke();
    // water
    ctx.fillStyle = "rgba(47,134,200,.85)";
    for (var i = 0; i < P.length; i++) { var p = P[i]; ctx.beginPath(); ctx.arc(p.x, p.y, R + 1.2, 0, 6.283); ctx.fill(); }
    // buckets
    buckets.forEach(function(b, k){
      var l = b.x - b.w / 2, r = b.x + b.w / 2, t = FLOOR - b.h;
      ctx.lineWidth = 5; ctx.lineJoin = "round"; ctx.strokeStyle = k === 1 ? "#e07b1f" : "#7d8a96";
      ctx.beginPath(); ctx.moveTo(l, t); ctx.lineTo(l + 6, FLOOR); ctx.lineTo(r - 6, FLOOR); ctx.lineTo(r, t); ctx.stroke();
      if (k === 1) { ctx.fillStyle = "#e07b1f"; ctx.font = "600 11px Archivo, Helvetica, Arial, sans-serif"; ctx.textAlign = "center"; ctx.fillText("drag me", b.x, t - 8); }
    });
    // bottle outline from the model's profile
    ctx.lineWidth = 2; ctx.strokeStyle = "#23272b"; ctx.fillStyle = "rgba(170,205,225,.35)";
    ctx.beginPath();
    var hs = [0, 17.1, 30.7, 31.7], pts = [];
    hs.forEach(function(h){ pts.push(bpt(h, 1)); }); hs.slice().reverse().forEach(function(h){ pts.push(bpt(h, -1)); });
    pts.forEach(function(q, n){ if (n) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); }); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  function frame(){
    var on = pour || keyPour;
    if (on) { emitAcc += 2; while (emitAcc >= 1) { emitAcc--; if (!emit()) break; } }
    if (moveDir) moveBucket(buckets[1].x + moveDir * 3);
    step(); step();
    draw();
    var c = countIn(); for (var k = 0; k < 3; k++) counts[k].textContent = c[k];
    statusEl.textContent = P.length >= MAX ? "The bottle is empty. Press R to start again." : on ? "Pouring…" : (c[1] > 40 ? "Nice catch with the centre bucket." : "Hold D to pour.");
    requestAnimationFrame(frame);
  }
  function moveBucket(x){ buckets[1].x = Math.max(buckets[0].x + 90, Math.min(buckets[2].x - 90, x)); buildSegs(); }
  function reset(){ P = []; buckets[1].x = 250; buildSegs(); }
  // controls: drag the centre bucket, hold to pour
  function toLocal(e){ var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; }
  var dragging = false, dx0 = 0;
  stage.addEventListener("pointerdown", function(e){ var p = toLocal(e), b = buckets[1]; if (Math.abs(p.x - b.x) < b.w / 2 + 10 && p.y > FLOOR - b.h - 24) { dragging = true; dx0 = p.x - b.x; try { stage.setPointerCapture(e.pointerId); } catch (err) {} e.preventDefault(); } });
  stage.addEventListener("pointermove", function(e){ if (dragging) moveBucket(toLocal(e).x - dx0); });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach(function(ev){ stage.addEventListener(ev, function(){ dragging = false; }); });
  pourBtn.addEventListener("pointerdown", function(e){ pour = true; pourBtn.classList.add("on"); try { pourBtn.setPointerCapture(e.pointerId); } catch (err) {} });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach(function(ev){ pourBtn.addEventListener(ev, function(){ pour = false; pourBtn.classList.remove("on"); }); });
  pourBtn.addEventListener("keydown", function(e){ if (e.key === " " || e.key === "Enter") { e.preventDefault(); pour = true; pourBtn.classList.add("on"); } });
  pourBtn.addEventListener("keyup", function(e){ if (e.key === " " || e.key === "Enter") { pour = false; pourBtn.classList.remove("on"); } });
  root.addEventListener("keydown", function(e){ var k = e.key.toLowerCase(); if (k === "d") { keyPour = true; pourBtn.classList.add("on"); } else if (k === "r") reset(); else if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); moveDir = e.key === "ArrowLeft" ? -1 : 1; } });
  root.addEventListener("keyup", function(e){ var k = e.key.toLowerCase(); if (k === "d") { keyPour = false; pourBtn.classList.remove("on"); } if (e.key === "ArrowLeft" || e.key === "ArrowRight") moveDir = 0; });
  stage.addEventListener("blur", function(){ keyPour = false; moveDir = 0; pourBtn.classList.remove("on"); });
  root.querySelector("[data-reset]").addEventListener("click", reset);
  requestAnimationFrame(frame);
})();
