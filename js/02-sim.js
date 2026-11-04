(function(){
  var root = document.getElementById("sim");
  if (!root) return;
  var btn = root.querySelector(".balloon-btn");
  var body = document.getElementById("bb");
  var leds = Array.prototype.slice.call(root.querySelectorAll(".led"));
  var glow = document.getElementById("glowc");
  var grad = document.getElementById("glowgrad");
  var fill = root.querySelector(".gauge .fill");
  var band = root.querySelector(".gauge .band");
  var mark = root.querySelector(".gauge .mark");
  var labels = root.querySelector(".gauge-labels");
  var readout = root.querySelector(".readout");
  var status = root.querySelector(".status");
  var nNormal = root.querySelector('[data-count="normal"]');
  var nQuick = root.querySelector('[data-count="quick"]');
  var modeBtns = root.querySelectorAll("[data-mode]");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var MODES = {
    hold: { max: 12, up: 1.1, down: 0.8, scale: 12 },
    pump: { max: 14, up: 0.3, down: 0.25, scale: 14 }
  };
  var COLORS = { blue: "#2f6bff", green: "#22c55e", red: "#ef4444" };
  var MSG = { off: "Squeeze the balloon", blue: "Keep going", green: "On target, hold it there", red: "Too hard, ease off" };
  var THRESHOLD = 7.5, QUICK_MAX = 0.45;
  var mode = "hold", p = 0, held = false, pressStart = 0, crossed = false, last = 0, raf = 0, state = "";
  var counts = { normal: 0, quick: 0 };

  function lightState(v){ if (v < 1) return "off"; if (v >= 8) return "red"; if (v > 6) return "green"; return "blue"; }

  function layoutGauge(){
    var s = MODES[mode].scale;
    band.style.left = (6 / s * 100) + "%";
    band.style.width = (2 / s * 100) + "%";
    mark.style.display = mode === "pump" ? "block" : "none";
    mark.style.left = (THRESHOLD / s * 100) + "%";
    var html = '<span style="left:0">0</span><span style="left:' + (7 / s * 100) + '%">target</span>';
    if (mode === "pump") html = '<span style="left:0">0</span><span style="left:' + (THRESHOLD / s * 100) + '%">counts above 7.5</span>';
    html += '<span style="left:100%">' + s + ' hPa</span>';
    labels.innerHTML = html;
  }

  function render(){
    var s = lightState(p);
    var col = s === "off" ? "" : COLORS[s];
    var op = s === "blue" ? 0.3 + 0.7 * Math.min(1, (p - 1) / 5) : 1;
    for (var i = 0; i < leds.length; i++) {
      leds[i].style.fill = col;
      leds[i].style.opacity = col ? op : "";
    }
    grad.style.color = col || "transparent";
    glow.setAttribute("opacity", col ? (s === "blue" ? (op * 0.55).toFixed(2) : "0.85") : "0");
    var cfg = MODES[mode];
    fill.style.width = Math.min(100, p / cfg.scale * 100) + "%";
    fill.style.background = col || "var(--ink-2)";
    readout.textContent = p.toFixed(1) + " hPa";
    if (!reduce) {
      var k = Math.min(1, p / cfg.max);
      body.setAttribute("transform", "translate(200 346) scale(" + (1 + 0.05 * k).toFixed(3) + " " + (1 - 0.06 * k).toFixed(3) + ") translate(-200 -346)");
    }
    if (mode === "hold" && s !== state) { state = s; status.textContent = MSG[s]; }
  }

  function tick(t){
    var dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
    last = t;
    var cfg = MODES[mode];
    if (held) p += (cfg.max - p) * (1 - Math.exp(-dt / cfg.up));
    else { p -= p * (1 - Math.exp(-dt / cfg.down)); if (p < 0.02) p = 0; }
    if (mode === "pump" && held && p >= THRESHOLD) crossed = true;
    render();
    if (held || p > 0) raf = requestAnimationFrame(tick);
    else { raf = 0; last = 0; }
  }
  function run(){ if (!raf) { last = 0; raf = requestAnimationFrame(tick); } }

  function press(){
    if (held) return;
    held = true; pressStart = performance.now(); crossed = false;
    run();
  }
  function release(){
    if (!held) return;
    held = false;
    if (mode === "pump") {
      if (crossed) {
        var d = (performance.now() - pressStart) / 1000;
        var kind = d < QUICK_MAX ? "quick" : "normal";
        counts[kind]++;
        nNormal.textContent = counts.normal;
        nQuick.textContent = counts.quick;
        status.textContent = kind === "quick" ? "Quick squeeze counted" : "Normal squeeze counted";
      } else {
        status.textContent = "Squeeze a little longer to count it";
      }
    }
    run();
  }

  btn.addEventListener("pointerdown", function(e){
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    try { btn.setPointerCapture(e.pointerId); } catch (err) {}
    press();
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach(function(ev){ btn.addEventListener(ev, release); });
  btn.addEventListener("contextmenu", function(e){ e.preventDefault(); });
  btn.addEventListener("keydown", function(e){
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (!e.repeat) press(); }
  });
  btn.addEventListener("keyup", function(e){
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); release(); }
  });
  btn.addEventListener("blur", release);
  btn.addEventListener("click", function(e){ e.preventDefault(); });

  modeBtns.forEach(function(b){
    b.addEventListener("click", function(){
      mode = b.getAttribute("data-mode");
      modeBtns.forEach(function(o){ o.setAttribute("aria-pressed", String(o === b)); });
      root.setAttribute("data-mode", mode);
      held = false; p = 0; state = "";
      status.textContent = mode === "hold" ? MSG.off : "Squeeze and release. Short squeezes count as quick.";
      layoutGauge(); render();
    });
  });
  root.querySelector("[data-reset]").addEventListener("click", function(){
    counts = { normal: 0, quick: 0 };
    nNormal.textContent = "0"; nQuick.textContent = "0";
    status.textContent = "Count reset. Squeeze and release.";
  });

  layoutGauge(); render();
})();
