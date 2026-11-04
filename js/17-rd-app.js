(function(){
  var root = document.getElementById("rd-app");
  if (!root) return;
  function q(s){ return root.querySelector(s); }
  var scr = q(".rd-screen"), title = q(".rd-title"), desc = q(".rd-desc"), map = q(".rd-mapsvg"), card = q(".rd-card"), toast = q(".rd-toast"), drawer = q(".rd-drawer");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var TITLES = { splash: "", map: "Find your vehicle", vehicle: "Vehicle’s position", ride: "Your ride", park: "End of the ride", notify: "RED’s notification!" };
  var DESC = {
    splash: "The sharing app opens on its splash screen.",
    map: "Scooters around you on the map. Tap one: if its battery is low, RED 6.3 drives over and charges it where it is parked.",
    vehicle: "The scooter you picked: plate and address, how far you have to walk, and its charge.",
    ride: "A ride in progress. End it to park.",
    park: "Where you leave the scooter matters: RED 6.3 has to reach it to charge it.",
    notify: "RED 6.3 talks to riders through the app: charging done, and where to park."
  };
  // a small city: streets on a tilted grid
  var CX = 138, CY = 262, A = -18 * Math.PI / 180, G = 52;
  function xy(u, v){ return [CX + u * Math.cos(A) - v * Math.sin(A), CY + u * Math.sin(A) + v * Math.cos(A)]; }
  var SC = [
    { plate: "XB350MC", addr: "Via Melchiorre Gioia 76, 20125 Milano", u: 1, v: 1, batt: 40 },
    { plate: "XC118MD", addr: "Via Pola 9, 20124 Milano", u: -1, v: -2, batt: 12 },
    { plate: "XA902ME", addr: "Via Taramelli 22, 20124 Milano", u: 2, v: -1, batt: 76 },
    { plate: "XD447MF", addr: "Via Sassetti 31, 20124 Milano", u: -2, v: 1, batt: 23 },
    { plate: "XB031MG", addr: "Viale Stelvio 2, 20159 Milano", u: 0, v: 3, batt: 88 }
  ];
  var ME = xy(0.35 * G, 2.25 * G), BASE = { u: 0, v: -3 }, bot = { p: xy(BASE.u * G, BASE.v * G), busy: false, target: null, charging: null };
  var sel = 0, cur = "", stack = [], feed = [{ t: "Be careful where you park so you enjoy your next ride!", s: "RED 6.3 · yesterday" }];
  function walk(s){ var p = xy(s.u * G, s.v * G), d = Math.hypot(p[0] - ME[0], p[1] - ME[1]) * 3.4; return d < 1000 ? (Math.round(d / 10) * 10) + " m" : (d / 1000).toFixed(1) + " km"; }
  function drawMap(){
    var s = '<rect width="276" height="516" fill="#2a2a2a"/>';
    s += '<path d="' + [xy(-1.6 * G, -0.6 * G), xy(-0.4 * G, -0.6 * G), xy(-0.4 * G, 0.4 * G), xy(-1.6 * G, 0.4 * G)].map(function(p, i){ return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ") + ' Z" fill="#2f3a2e"/>';
    for (var k = -7; k <= 7; k++) { var a = xy(k * G, -420), b = xy(k * G, 420), c = xy(-420, k * G), d = xy(420, k * G); var w = k === 0 ? 9 : 5; s += '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" stroke="#4a4a4a" stroke-width="' + w + '"/><line x1="' + c[0].toFixed(1) + '" y1="' + c[1].toFixed(1) + '" x2="' + d[0].toFixed(1) + '" y2="' + d[1].toFixed(1) + '" stroke="#4a4a4a" stroke-width="' + (k === 1 ? 9 : 5) + '"/>'; }
    var e = xy(-420, -300), f = xy(420, 260); s += '<line x1="' + e[0] + '" y1="' + e[1] + '" x2="' + f[0] + '" y2="' + f[1] + '" stroke="#555" stroke-width="7"/>';
    // you, with the direction you face
    s += '<path d="M' + ME[0] + " " + ME[1] + " L" + (ME[0] - 70) + " " + (ME[1] - 70) + " A100 100 0 0 1 " + (ME[0] + 10) + " " + (ME[1] - 99) + ' Z" fill="url(#rd-cone)"/>';
    s += '<defs><radialGradient id="rd-cone" cx="' + ME[0] + '" cy="' + ME[1] + '" r="100" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>';
    s += '<circle cx="' + ME[0] + '" cy="' + ME[1] + '" r="9" fill="#1b1b1b" stroke="#fff" stroke-width="3"/>';
    // scooters
    SC.forEach(function(sc, i){
      var p = xy(sc.u * G, sc.v * G), low = sc.batt < 20;
      s += '<g class="sc" data-i="' + i + '" transform="translate(' + p[0].toFixed(1) + " " + p[1].toFixed(1) + ')" role="button" tabindex="0" aria-label="Scooter ' + sc.plate + ", battery " + Math.round(sc.batt) + '%">';
      if (i === sel && cur === "map" && !card.hidden) s += '<circle r="19" fill="none" stroke="#f2c418" stroke-width="2"/>';
      s += '<circle r="15" fill="#1b1b1b" fill-opacity=".55"/><g transform="translate(-11 -7)"><circle cx="5" cy="12" r="3.2" fill="#111" stroke="#f2c418" stroke-width="1.5"/><circle cx="18" cy="12" r="3.2" fill="#111" stroke="#f2c418" stroke-width="1.5"/><path d="M3 10 Q6 4 12 5 L16 5 L18 1 M16 5 Q20 7 20 10 L6 10" fill="#f2b705" stroke="#c48f00" stroke-width="1" stroke-linejoin="round"/></g>';
      s += '<g transform="translate(9 -15)"><rect x="-1" y="-6" width="24" height="11" rx="5" fill="' + (low ? "#d9452b" : "#17a398") + '"/><text x="11" y="2.5" font-size="7.5" font-weight="700" text-anchor="middle" fill="#fff" font-family="Archivo, Helvetica, Arial, sans-serif">' + Math.round(sc.batt) + "%</text></g>";
      if (bot.charging === i) s += '<path d="M2 -26 l-6 9 h5 l-3 8 l8 -11 h-5 z" fill="#f2c418"><animate attributeName="opacity" values="1;.3;1" dur=".8s" repeatCount="indefinite"/></path>';
      s += "</g>";
    });
    // RED 6.3
    s += '<g transform="translate(' + bot.p[0].toFixed(1) + " " + bot.p[1].toFixed(1) + ')" aria-label="RED 6.3"><rect x="-11" y="-9" width="22" height="18" rx="4" fill="#1b1b1b" stroke="#c8102e" stroke-width="2.5"/><rect x="-7" y="-5" width="14" height="6" rx="1.5" fill="#e9e9e9"/><text x="0" y="22" font-size="8" font-weight="700" text-anchor="middle" fill="#ff4b5c" font-family="Archivo, Helvetica, Arial, sans-serif">RED 6.3</text></g>';
    map.innerHTML = s;
  }
  function showCard(i){
    sel = i; var sc = SC[i], low = sc.batt < 20;
    card.hidden = false;
    card.innerHTML = "<h4>" + sc.plate + "</h4><p>" + sc.addr + " · " + walk(sc) + " walking</p>" +
      '<div class="bar"><i class="' + (low ? "low" : "") + '" style="width:' + Math.round(sc.batt) + '%"></i></div>' +
      (low ? "<p>" + (bot.target === i ? (bot.charging === i ? "RED 6.3 is charging it: " + Math.round(sc.batt) + "%" : "Battery too low to ride. RED 6.3 is on its way.") : "Battery too low to ride.") + "</p>" : "") +
      '<div class="row"><button type="button" class="rd-cta" data-act="details">Details</button>' + (low && bot.target !== i ? '<button type="button" class="rd-cta ghost" data-act="call">Call RED 6.3</button>' : "") + "</div>";
    drawMap();
    if (low && !bot.busy) dispatch(i);
  }
  map.addEventListener("click", function(e){ var g = e.target.closest(".sc"); if (g) showCard(+g.getAttribute("data-i")); else { card.hidden = true; drawMap(); } });
  map.addEventListener("keydown", function(e){ var g = e.target.closest(".sc"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); showCard(+g.getAttribute("data-i")); } });
  card.addEventListener("click", function(e){ var b = e.target.closest("[data-act]"); if (!b) return; if (b.getAttribute("data-act") === "details") go("vehicle"); else dispatch(sel); });
  // RED 6.3 drives along the streets to the scooter and charges it
  function dispatch(i){
    if (bot.busy) return;
    bot.busy = true; bot.target = i; var sc = SC[i];
    var from = invxy(bot.p), path = [[from[0], from[1]], [sc.u * G, from[1]], [sc.u * G, sc.v * G]], seg = 0, speed = reduce ? 9999 : 70;
    desc.textContent = "RED 6.3 is driving to " + sc.plate + ".";
    var last = performance.now();
    (function step(now){
      var dt = (now - last) / 1000; last = now;
      var a = path[seg], b = path[seg + 1], cpos = invxy(bot.p), dx = b[0] - cpos[0], dy = b[1] - cpos[1], d = Math.hypot(dx, dy), m = speed * dt;
      if (d <= m) { bot.p = xy(b[0], b[1]); seg++; } else { bot.p = xy(cpos[0] + dx / d * m, cpos[1] + dy / d * m); }
      drawMap();
      if (seg < path.length - 1) return requestAnimationFrame(step);
      charge(i);
    })(last);
  }
  function invxy(p){ var x = p[0] - CX, y = p[1] - CY; return [x * Math.cos(A) + y * Math.sin(A), -x * Math.sin(A) + y * Math.cos(A)]; }
  function charge(i){
    var sc = SC[i]; bot.charging = i; desc.textContent = "RED 6.3 is charging " + sc.plate + " through the pad and the pins by its plate.";
    var t = setInterval(function(){
      sc.batt = Math.min(90, sc.batt + (reduce ? 90 : 2)); if (!card.hidden && sel === i) showCard(i); else drawMap();
      if (sc.batt >= 90) { clearInterval(t); bot.charging = null; bot.busy = false; bot.target = null; drawMap(); if (!card.hidden && sel === i) showCard(i);
        var msg = "RED 6.3 charged " + sc.plate + " to 90%. It’s ready for your next ride."; feed.unshift({ t: msg, s: "RED 6.3 · just now" }); notify(msg, i); }
    }, 90);
  }
  var toastT = null;
  function notify(msg, i){ toast.querySelector("span").textContent = msg; toast.hidden = false; toast.onclick = function(){ toast.hidden = true; sel = i; go("vehicle"); }; clearTimeout(toastT); toastT = setTimeout(function(){ toast.hidden = true; }, 4500); desc.textContent = msg + " Tap the notification to see the scooter."; }
  // vehicle
  function fillVehicle(){
    var sc = SC[sel], low = sc.batt < 20;
    q('[data-v="plate"]').textContent = "Plate " + sc.plate; q('[data-v="addr"]').textContent = sc.addr;
    q('[data-v="walk"]').textContent = walk(sc) + " walking from your current position";
    q('[data-v="batt"]').textContent = Math.round(sc.batt) + "%"; q(".rd-batt").setAttribute("width", (12 * sc.batt / 100).toFixed(1));
    q('[data-act="ride"]').disabled = low;
    q('[data-v="note"]').textContent = low ? (bot.target === sel ? "RED 6.3 is charging it, back in a moment." : "Battery too low. Call RED 6.3 from the map.") : "";
  }
  // ride
  var rT = null, rs = 0, rkm = 0;
  q('[data-act="ride"]').addEventListener("click", function(){ go("ride"); rs = 0; rkm = 0; tickRide(); clearInterval(rT); rT = setInterval(tickRide, 1000); });
  function tickRide(){ var sc = SC[sel]; q(".rd-rtime").textContent = (rs < 600 ? "0" : "") + Math.floor(rs / 60) + ":" + (rs % 60 < 10 ? "0" : "") + rs % 60; q('[data-r="km"]').textContent = rkm.toFixed(2); q('[data-r="batt"]').textContent = Math.round(sc.batt); q('[data-r="cost"]').textContent = "18"; rs++; rkm += 0.005; sc.batt = Math.max(1, sc.batt - 0.15); }
  q('[data-act="end"]').addEventListener("click", function(){ clearInterval(rT); go("park"); });
  root.querySelectorAll("[data-park]").forEach(function(b){ b.addEventListener("click", function(){
    var good = b.getAttribute("data-park") === "good", msg = good ? "Nice parking! RED 6.3 can reach your scooter to charge it." : "Be careful where you park so you enjoy your next ride!";
    feed.unshift({ t: msg, s: "RED 6.3 · just now" }); stack = []; cur = "map"; go("notify");
  }); });
  function fillNotify(){ q(".rd-bubble").textContent = feed[0].t; q(".rd-feed").innerHTML = feed.slice(1, 5).map(function(f){ return "<li>" + f.t + "<small>" + f.s + "</small></li>"; }).join(""); }
  // navigation
  function go(s, back){
    if (s === cur) return;
    if (s !== "ride") clearInterval(rT);
    drawer.hidden = true;
    if (!back && cur && cur !== "splash" && s !== "map" && s !== "splash") stack.push(cur);
    if (s === "map" || s === "splash") stack = [];
    cur = s; scr.setAttribute("data-cur", s); title.textContent = TITLES[s];
    root.querySelectorAll(".rd-body > section").forEach(function(el){ var on = el.getAttribute("data-s") === s; el.hidden = !on; el.classList.remove("in"); if (on && !reduce) { void el.offsetWidth; el.classList.add("in"); } });
    root.querySelectorAll(".rd-jump [data-go]").forEach(function(b){ b.setAttribute("aria-pressed", String(b.getAttribute("data-go") === s)); });
    desc.textContent = DESC[s];
    if (s === "map") { drawMap(); }
    if (s === "vehicle") fillVehicle();
    if (s === "notify") fillNotify();
    if (s === "splash") setTimeout(function(){ if (cur === "splash") go("map"); }, 2200);
  }
  root.addEventListener("click", function(e){ var b = e.target.closest("[data-go]"); if (b && root.contains(b)) go(b.getAttribute("data-go")); });
  q(".rd-splash").addEventListener("click", function(){ go("map"); });
  q(".rd-back").addEventListener("click", function(){ go(stack.pop() || "map", true); });
  q(".rd-menu").addEventListener("click", function(){ drawer.hidden = false; var f = drawer.querySelector("nav button"); if (f) f.focus(); });
  q(".rd-scrim").addEventListener("click", function(){ drawer.hidden = true; });
  root.addEventListener("keydown", function(e){ if (e.key === "Escape" && !drawer.hidden) { drawer.hidden = true; q(".rd-menu").focus(); } });
  go("splash");
})();
