(function(){
  var root = document.getElementById("pr-demo");
  if (!root) return;
  var g = root.querySelector(".pr-cube"), scoreEl = root.querySelector('[data-pr="score"]'), qyEl = root.querySelector('[data-pr="qy"]'), con = root.querySelector(".pr-console"), key = root.querySelector(".pr-key");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var score = 0, yaw = 0, shown = 0, lines = [];
  // Unity's transform.rotation.y for a turn around Y is sin(angle / 2): a quaternion component, not degrees
  function qy(deg){ return Math.sin(deg * Math.PI / 360); }
  function log(s){ lines.push(s); if (lines.length > 6) lines.shift(); con.textContent = lines.join("\n"); }
  function press(){
    score += 1;                              // myProperty.Score += 1  -> the setter updates the UI text
    scoreEl.textContent = score;
    var y = qy(yaw), turn = y + score;       // transform.Rotate(0, transform.rotation.y + myProperty.Score, 0)
    yaw += turn;
    log(String(score)); log(turn.toFixed(4));
    qyEl.textContent = qy(yaw).toFixed(4);
    if (reduce) shown = yaw;
  }
  var V = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
  var F = [[0,1,2,3,"#cfd8df"],[4,5,6,7,"#cfd8df"],[0,1,5,4,"#9fb0bd"],[3,2,6,7,"#f0b35a"],[0,3,7,4,"#e3e9ee"],[1,2,6,5,"#e3e9ee"]];
  function draw(){
    var a = shown * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), p = 0.5, cp = Math.cos(p), sp = Math.sin(p), s = 52;
    var P = V.map(function(v){ var x = v[0] * ca + v[2] * sa, z = -v[0] * sa + v[2] * ca, y = v[1]; var y2 = y * cp - z * sp, z2 = y * sp + z * cp; return [130 + x * s, 118 - y2 * s, z2]; });
    var faces = F.map(function(f){ var z = (P[f[0]][2] + P[f[1]][2] + P[f[2]][2] + P[f[3]][2]) / 4; return { f: f, z: z }; }).sort(function(a, b){ return a.z - b.z; });
    g.innerHTML = faces.slice(3).map(function(o){ var f = o.f; return '<path d="M' + [0,1,2,3].map(function(k){ return P[f[k]][0].toFixed(1) + " " + P[f[k]][1].toFixed(1); }).join(" L") + ' Z" fill="' + f[4] + '" stroke="#23272b" stroke-width="1.5" stroke-linejoin="round"/>'; }).join("");
  }
  function frame(){ shown += (yaw - shown) * 0.18; if (Math.abs(yaw - shown) < 0.01) shown = yaw; draw(); requestAnimationFrame(frame); }
  key.addEventListener("click", function(e){ if (e.detail !== 0 || !e.isTrusted) press(); });
  key.addEventListener("keydown", function(e){ if (e.key === " ") { e.preventDefault(); if (!e.repeat) { key.classList.add("down"); press(); } } });
  key.addEventListener("keyup", function(e){ if (e.key === " ") key.classList.remove("down"); });
  root.querySelector(".pr-reset").addEventListener("click", function(){ score = 0; yaw = 0; lines = []; con.textContent = ""; scoreEl.textContent = "0"; qyEl.textContent = "0.0000"; });
  draw(); requestAnimationFrame(frame);
})();
