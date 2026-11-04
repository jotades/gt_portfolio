(function(){
  var fig = document.getElementById("core-fig");
  if (!fig) return;
  var tabs = fig.querySelectorAll(".fig-tabs button");
  var panes = fig.querySelectorAll(".fig-pane");
  var host = fig.querySelector(".c3");
  var status = fig.querySelector(".c3-status");
  var modeBtns = fig.querySelectorAll("[data-explode]");
  var balloonBtn = fig.querySelector("[data-balloon]");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var api = null, loading = false;

  function showPane(name){
    tabs.forEach(function(t){ t.setAttribute("aria-pressed", String(t.getAttribute("data-pane") === name)); });
    panes.forEach(function(p){ p.hidden = p.getAttribute("data-pane") !== name; });
    if (name === "3d") start();
  }
  tabs.forEach(function(t){ t.addEventListener("click", function(){ showPane(t.getAttribute("data-pane")); }); });

  function start(){
    if (api) { api.resize(); api.wake(); return; }
    if (loading) return;
    loading = true;
    if (window.THREE) return init();
    var s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    s.onload = init;
    s.onerror = function(){ status.textContent = "The 3D view couldn’t load here. The section drawing shows the same concept."; };
    document.head.appendChild(s);
  }

  function init(){
    var T = window.THREE;
    var renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); }
    catch (e) { status.textContent = "This browser can’t show the 3D view. The section drawing shows the same concept."; return; }
    status.textContent = "";
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputEncoding = T.sRGBEncoding;
    host.insertBefore(renderer.domElement, host.firstChild);
    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(30, 1, 1, 3000);
    scene.add(new T.HemisphereLight(0xffffff, 0x8a96a3, 0.85));
    var key = new T.DirectionalLight(0xffffff, 0.75); key.position.set(140, 220, 160); scene.add(key);
    var rim = new T.DirectionalLight(0xffffff, 0.35); rim.position.set(-160, 60, -120); scene.add(rim);

    function M(c, o){ var p = { color: c, roughness: 0.55, metalness: 0 }; for (var k in o) p[k] = o[k]; return new T.MeshStandardMaterial(p); }
    var shell = M(0xf3f5f6, { roughness: 0.45 }), silicone = M(0x5b636b, { roughness: 0.85 }), dark = M(0x2a3036),
        board = M(0x1f7a48, { roughness: 0.5 }), cell = M(0xb9c6cf, { metalness: 0.35, roughness: 0.35 }),
        blue = M(0x1c73b8), sensor = M(0x3c4a66), led = M(0x22c55e, { emissive: 0x22c55e, emissiveIntensity: 1 }),
        diffuser = M(0xffffff, { transparent: true, opacity: 0.55, roughness: 0.15, depthWrite: false }),
        latex = M(0x22a35a, { transparent: true, opacity: 0.2, roughness: 0.35, side: T.DoubleSide, depthWrite: false, emissive: 0x22c55e, emissiveIntensity: 0.08 });
    function lathe(pts, m, seg){ return new T.Mesh(new T.LatheGeometry(pts.map(function(p){ return new T.Vector2(p[0], p[1]); }), seg || 72), m); }
    function box(w, h, d, m){ return new T.Mesh(new T.BoxGeometry(w, h, d), m); }
    function cyl(r, h, m, seg){ return new T.Mesh(new T.CylinderGeometry(r, r, h, seg || 40), m); }

    var root = new T.Group(); scene.add(root);
    var parts = {};
    function part(name, y, off, objs){ var g = new T.Group(); objs.forEach(function(o){ g.add(o); }); g.position.y = y; g.userData = { base: y, off: off }; root.add(g); parts[name] = g; return g; }

    // body (open cup) with switch, valve and USB-C
    var body = lathe([[0,-38],[17.5,-38],[21.5,-34],[21.5,0],[19.6,0],[19.6,-36],[0,-36]], shell);
    var sw = box(2.2, 5, 3.2, dark); sw.position.set(21.7, -30, 0);
    var valve = cyl(2.6, 6, blue); valve.rotation.z = Math.PI / 2; valve.position.set(-24, -14, 0);
    var usb = box(9, 1.6, 3.4, dark); usb.position.set(0, -38.2, 0);
    part("body", 0, -82, [body, sw, valve, usb]);
    // battery
    part("battery", -20, -40, [box(30, 18, 12, cell)]);
    // XIAO board
    var pcb = box(21, 1.6, 17.5, board); var chip = box(7, 1.2, 7, dark); chip.position.y = 1.4;
    var xusb = box(9, 3.2, 7.4, cell); xusb.position.set(0, 1.6, 7.2);
    part("pcb", -4, -16, [pcb, chip, xusb]);
    // collar
    var flange = lathe([[10,0],[21.5,0],[21.5,1.8],[10,1.8],[10,0]], shell, 72); flange.position.y = -10;
    part("collar", 10, 10, [cyl(10, 20, shell), flange]);
    // clamp ring
    var clamp = new T.Mesh(new T.TorusGeometry(11.2, 1.6, 16, 64), silicone); clamp.rotation.x = Math.PI / 2;
    part("clamp", 10, 26, [clamp]);
    // pressure sensor
    part("sensor", 20.6, 32, [box(8, 1.2, 6, sensor)]);
    // LED ring
    var ring = lathe([[10,0],[16,0],[16,1.6],[10,1.6],[10,0]], dark, 64);
    var leds = [];
    for (var i = 0; i < 12; i++) { var a = i / 12 * Math.PI * 2; var l = box(4, 1.4, 4, led); l.position.set(Math.cos(a) * 13, 2.2, Math.sin(a) * 13); l.rotation.y = -a; leds.push(l); }
    part("leds", 20.4, 44, [ring].concat(leds));
    // dome with pressure port and membrane
    var domePts = []; for (var k = 0; k <= 24; k++) { var t = k / 24 * Math.PI / 2; domePts.push([17 * Math.cos(t), 19 * Math.sin(t)]); }
    domePts.push([0, 19]);
    var dome = lathe(domePts, diffuser);
    var port = cyl(1.6, 16, shell); port.position.y = 9;
    var memb = cyl(2.6, 0.5, blue); memb.position.y = 17.4;
    var glow = new T.PointLight(0x22c55e, 0.9, 160); glow.position.y = 10;
    part("dome", 20, 62, [dome, port, memb, glow]);
    // balloon
    var curve = new T.SplineCurve([[10.6,0],[10.6,20],[13,25],[24,32],[42,45],[58,65],[67,92],[64,120],[50,146],[28,162],[0,168]].map(function(p){ return new T.Vector2(p[0], p[1]); }));
    var balloon = new T.Mesh(new T.LatheGeometry(curve.getPoints(90), 96), latex);
    balloon.renderOrder = 2;
    part("balloon", 0, 0, [balloon]);

    // labels, numbered as in the legend
    var tags = [
      { n: 1, part: "balloon", at: [62, 92, 0] }, { n: 2, part: "dome", at: [15, 12, 0] }, { n: 3, part: "dome", at: [0, 19, 0] },
      { n: 4, part: "clamp", at: [12.8, 0, 0] }, { n: 5, part: "body", at: [-27, -14, 0] }, { n: 6, part: "pcb", at: [10.5, 0, 0] },
      { n: 7, part: "battery", at: [15, 0, 0] }, { n: 8, part: "body", at: [0, -39, 0] }
    ];
    tags.forEach(function(t){ var s = document.createElement("span"); s.className = "c3-tag"; s.textContent = t.n; s.setAttribute("aria-hidden", "true"); host.appendChild(s); t.el = s; });

    var yaw = 0.65, pitch = 0.22, ex = 0, exTarget = 0, bal = 1, balTarget = 1, auto = !reduce, raf = 0, visible = true, last = 0;
    function frame(){
      var tY = 62 + (-10 - 62) * ex, dist = 500 - 20 * ex;
      var target = new T.Vector3(0, tY, 0);
      camera.position.set(target.x + dist * Math.cos(pitch) * Math.sin(yaw), target.y + dist * Math.sin(pitch), target.z + dist * Math.cos(pitch) * Math.cos(yaw));
      camera.lookAt(target);
      Object.keys(parts).forEach(function(k){ var g = parts[k]; g.position.y = g.userData.base + g.userData.off * ex; });
      latex.opacity = 0.2 * bal * (1 - ex); parts.balloon.visible = latex.opacity > 0.01;
      renderer.render(scene, camera);
      var w = host.clientWidth, h = host.clientHeight;
      tags.forEach(function(t){
        var show = ex > 0.5 || (t.n === 1 && bal > 0.5 && ex < 0.5 && false);
        if (t.part === "balloon") show = false;
        var v = new T.Vector3(t.at[0], t.at[1], t.at[2]); parts[t.part].localToWorld(v); v.project(camera);
        t.el.style.transform = "translate(" + ((v.x + 1) / 2 * w).toFixed(1) + "px," + ((1 - v.y) / 2 * h).toFixed(1) + "px)";
        t.el.style.opacity = show ? Math.min(1, (ex - 0.5) * 2) : 0;
      });
    }
    function loop(ts){
      var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0; last = ts;
      var moving = false;
      if (Math.abs(exTarget - ex) > 0.001) { ex += (exTarget - ex) * Math.min(1, dt * (reduce ? 60 : 6)); moving = true; } else ex = exTarget;
      if (Math.abs(balTarget - bal) > 0.001) { bal += (balTarget - bal) * Math.min(1, dt * (reduce ? 60 : 6)); moving = true; } else bal = balTarget;
      if (auto) { yaw += dt * 0.25; moving = true; }
      frame();
      if ((moving || dragging) && visible) raf = requestAnimationFrame(loop); else { raf = 0; last = 0; }
    }
    function wake(){ if (!raf) { last = 0; raf = requestAnimationFrame(loop); } }
    function resize(){ var w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); frame(); }

    var dragging = false, px = 0, py = 0;
    host.addEventListener("pointerdown", function(e){ dragging = true; auto = false; px = e.clientX; py = e.clientY; try { host.setPointerCapture(e.pointerId); } catch (err) {} wake(); });
    host.addEventListener("pointermove", function(e){ if (!dragging) return; yaw -= (e.clientX - px) * 0.01; pitch = Math.max(-0.35, Math.min(1.1, pitch + (e.clientY - py) * 0.008)); px = e.clientX; py = e.clientY; frame(); });
    ["pointerup","pointercancel","lostpointercapture"].forEach(function(ev){ host.addEventListener(ev, function(){ dragging = false; }); });
    host.addEventListener("keydown", function(e){
      var d = { ArrowLeft: [-0.2, 0], ArrowRight: [0.2, 0], ArrowUp: [0, 0.1], ArrowDown: [0, -0.1] }[e.key];
      if (!d) return; e.preventDefault(); auto = false; yaw += d[0]; pitch = Math.max(-0.35, Math.min(1.1, pitch + d[1])); frame();
    });
    modeBtns.forEach(function(b){ b.addEventListener("click", function(){
      exTarget = b.getAttribute("data-explode") === "1" ? 1 : 0;
      modeBtns.forEach(function(o){ o.setAttribute("aria-pressed", String(o === b)); });
      balloonBtn.disabled = exTarget === 1;
      wake();
    }); });
    balloonBtn.addEventListener("click", function(){
      balTarget = balTarget > 0.5 ? 0 : 1;
      balloonBtn.setAttribute("aria-pressed", String(balTarget === 1));
      wake();
    });
    if (window.ResizeObserver) new ResizeObserver(resize).observe(host);
    if ("IntersectionObserver" in window) new IntersectionObserver(function(en){ visible = en[0].isIntersecting; if (visible) wake(); }).observe(host);
    resize(); wake();
    api = { resize: resize, wake: wake };
    window.__core3d = { setYaw: function(v){ yaw = v; auto = false; frame(); }, explode: function(v){ ex = exTarget = v; frame(); } };
  }

  // start the 3D view when the figure first scrolls into view
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function(en){ if (en[0].isIntersecting && !fig.querySelector('.fig-pane[data-pane="3d"]').hidden) { start(); io.disconnect(); } }, { rootMargin: "200px" });
    io.observe(fig);
  } else start();
})();
