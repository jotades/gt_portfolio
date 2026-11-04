(function(){
  var root = document.getElementById("cal");
  if (!root) return;
  function q(s){ return root.querySelector(s); }
  // from taratura_TorqueTest.xlsx: lever 0.17 m, g 9.8, hanger 0.634 kg + 1 kg steps, spring saturation 85 %, coefficient 75 %
  var C = [
    { td: 13, m: 0.0048, q: 0.1265, s3: 0.0536, X: [204, 537, 875, 1240, 1590] },
    { td: 17.1, m: 0.0057, q: 0.3737, s3: 0.1724, X: [157, 405, 680, 970, 1264, 1570, 1896] }
  ];
  var L = 0.17, G = 9.8, SAT = 0.85, camp = 0, idx = 2;
  var W = 520, H = 330, x0 = 48, x1 = 505, y0 = 292, y1 = 16, XM = 2600, TM = 15;
  function sx(v){ return x0 + v / XM * (x1 - x0); }
  function sy(v){ return y0 - v / TM * (y0 - y1); }
  function kg(i){ return 0.634 + i; }
  function torque(i){ return kg(i) * G * L; }
  // axes
  var ax = "";
  for (var v = 0; v <= XM; v += 500) ax += '<line x1="' + sx(v) + '" y1="' + y0 + '" x2="' + sx(v) + '" y2="' + y1 + '" stroke="var(--line)"/><text x="' + sx(v) + '" y="' + (y0 + 16) + '" text-anchor="middle">' + v + "</text>";
  for (var t = 0; t <= TM; t += 3) ax += '<line x1="' + x0 + '" y1="' + sy(t) + '" x2="' + x1 + '" y2="' + sy(t) + '" stroke="var(--line)"/><text x="' + (x0 - 8) + '" y="' + (sy(t) + 4) + '" text-anchor="end">' + t + "</text>";
  ax += '<text x="' + ((x0 + x1) / 2) + '" y="' + (y0 + 32) + '" text-anchor="middle">axis value X</text><text x="14" y="' + ((y0 + y1) / 2) + '" text-anchor="middle" transform="rotate(-90 14 ' + ((y0 + y1) / 2) + ')">torque (Nm)</text>';
  q(".cal-axes").innerHTML = ax;
  function draw(){
    var c = C[camp], cap = c.td * SAT, xc = (cap - c.q) / c.m;
    q(".cal-line").setAttribute("d", "M" + sx(0) + " " + sy(c.q) + " L" + sx(xc) + " " + sy(cap) + " L" + sx(XM) + " " + sy(cap));
    q(".cal-band").setAttribute("d", "M" + sx(0) + " " + sy(c.q + c.s3) + " L" + sx(xc) + " " + sy(cap + c.s3) + " L" + sx(xc) + " " + sy(cap - c.s3) + " L" + sx(0) + " " + sy(c.q - c.s3) + " Z");
    var capEl = q(".cal-cap"); capEl.setAttribute("x1", sx(xc)); capEl.setAttribute("x2", sx(XM)); capEl.setAttribute("y1", sy(cap)); capEl.setAttribute("y2", sy(cap));
    var cl = q(".cal-capl"); cl.setAttribute("x", sx(XM) - 2); cl.setAttribute("y", sy(cap) - 6); cl.textContent = "max " + cap.toFixed(2) + " Nm = " + c.td + " × 85%";
    q(".cal-pts").innerHTML = c.X.map(function(x, i){ var on = i === idx; return '<circle data-i="' + i + '" cx="' + sx(x).toFixed(1) + '" cy="' + sy(torque(i)).toFixed(1) + '" r="' + (on ? 7 : 5) + '" fill="' + (on ? "#23272b" : "#fff") + '" stroke="#23272b" stroke-width="2"/>'; }).join("");
    // rig: one disc per kilogram under the hanger
    var w = "", y = 186;
    w += '<rect x="184" y="' + y + '" width="28" height="9" rx="2" fill="#6b7682"/>'; y += 10;
    for (var k = 0; k < idx; k++) { w += '<rect x="177" y="' + y + '" width="42" height="14" rx="3" fill="#3a4048" stroke="#23272b"/>'; y += 16; }
    q(".cal-weights").innerHTML = w;
    q(".cal-wlabel").setAttribute("y", y + 16);
    var T = torque(idx), x = c.X[idx], f = c.m * x + c.q, e = f - T;
    q(".cal-wlabel").textContent = kg(idx).toFixed(3) + " kg";
    q(".cal-tlabel").textContent = "T = " + T.toFixed(2) + " Nm";
    q('[data-c="kg"]').textContent = kg(idx).toFixed(3) + " kg";
    q('[data-c="t"]').textContent = T.toFixed(2) + " Nm";
    q('[data-c="x"]').textContent = x;
    q('[data-c="fit"]').textContent = f.toFixed(2) + " Nm";
    q('[data-c="err"]').textContent = (e >= 0 ? "+" : "−") + Math.abs(e).toFixed(2) + " Nm";
    q(".cal-eq").textContent = "T = " + c.m + " · X + " + c.q + ", within ±" + c.s3.toFixed(2) + " Nm (3σ) over " + c.X.length + " loads. T from the weight = " + kg(idx).toFixed(3) + " kg × 9.8 m/s² × 0.17 m.";
  }
  function setIdx(i){ idx = Math.max(0, Math.min(C[camp].X.length - 1, i)); draw(); }
  root.querySelectorAll("[data-camp]").forEach(function(b){ b.addEventListener("click", function(){ camp = +b.getAttribute("data-camp"); root.querySelectorAll("[data-camp]").forEach(function(o){ o.setAttribute("aria-pressed", String(o === b)); }); setIdx(idx); }); });
  root.querySelectorAll("[data-step]").forEach(function(b){ b.addEventListener("click", function(){ setIdx(idx + +b.getAttribute("data-step")); }); });
  q(".cal-pts").addEventListener("click", function(e){ var t = e.target.closest("[data-i]"); if (t) setIdx(+t.getAttribute("data-i")); });
  root.setAttribute("tabindex", "0");
  root.addEventListener("keydown", function(e){ if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); setIdx(idx + (e.key === "ArrowRight" ? 1 : -1)); } });
  draw();
})();
