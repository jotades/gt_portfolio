(function(){
  // OmniTrack, "The system": the architecture diagram grows taller to match the text beside it, so no empty space is
  // left under it at any window width. The boxes keep their size; the rows move apart and the arrows, all at right
  // angles, follow them. When the diagram sits under the text (narrow screens) it keeps its compact height.
  // found wherever it is: a "Work by role" report opened from a link may already have moved it out of the project page
  var svg = document.querySelector("svg.ot-arch-sys"); if (!svg) return;
  var fig = svg.closest("figure"), step = svg.closest("section.step"), text = step && step.querySelector(":scope > .text");
  if (!fig || !text) return;
  var T = function(s){ return window.i18n ? window.i18n.t(s) : s; };
  var W = 560, HMIN = 372, HMAX = 640, aria = svg.getAttribute("aria-label");
  var A = [8, 172], B = [198, 340], C = [400, 552];
  var ca = (A[0] + A[1]) / 2, cb = (B[0] + B[1]) / 2, cc = (C[0] + C[1]) / 2;
  function box(col, top, t, sub, teal){
    var x = col[0], w = col[1] - col[0], cx = x + w / 2;
    return '<g><rect x="' + x + '" y="' + top + '" width="' + w + '" height="56" rx="8" ' + (teal ? 'fill="#e8f6f4" stroke="#17a398"' : 'fill="var(--bg)" stroke="var(--ink)"') + ' stroke-width="1.5"/>' +
      '<text x="' + cx + '" y="' + (top + 23) + '" font-size="12.5" font-weight="700" text-anchor="middle" fill="var(--ink)">' + T(t) + "</text>" +
      '<text x="' + cx + '" y="' + (top + 40) + '" font-size="10" text-anchor="middle" fill="var(--ink-2)">' + T(sub) + "</text></g>";
  }
  function path(d, dash){ return '<path d="' + d + '" fill="none" stroke="var(--ink-2)" stroke-width="1.4"' + (dash ? ' stroke-dasharray="4 3"' : "") + ' marker-end="url(#otA)"/>'; }
  function lab(x, y, t, a){ return '<text x="' + x + '" y="' + y + '" font-size="9.5" text-anchor="' + (a || "middle") + '" fill="var(--ink-2)">' + T(t) + "</text>"; }
  function draw(H){
    var r1 = 30, r3 = H - 62, r2 = Math.round((r1 + r3) / 2), r1b = r1 + 56, r2b = r2 + 56, ylog = Math.round((r2b + r3) / 2);
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.innerHTML = '<defs><marker id="otA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="var(--ink-2)"/></marker></defs>' +
      '<rect x="392" y="10" width="166" height="' + (r2b + 10 - 10) + '" rx="10" fill="none" stroke="var(--line)" stroke-dasharray="4 4"/>' +
      '<text x="552" y="24" font-size="10.5" text-anchor="end" fill="var(--ink-2)">ROS 2 Jazzy</text>' +
      box(A, r1, "8 anchors", "ESP32-S3 + UWB DW3000") +
      box(A, r2, "Units P1, O1–O3", "UWB, IMU, light, sound, vibration") +
      box(B, r2, "Bridge + micro-ROS", "one per unit, virtual serial") +
      box(C, r1, "Multilaterator", "calibrate, smooth, solve", true) +
      box(C, r2, "Orchestrator", "hot–cold controller", true) +
      box(A, r3, "OmniAnalytics", "offline analysis") +
      box(B, r3, "MongoDB", "session logs") +
      box(C, r3, "Dashboard", "room setup, task control") +
      // anchors to units, over the radio
      path("M" + ca + " " + (r1b + 2) + " V" + (r2 - 2), true) + lab(ca + 6, (r1b + r2) / 2 + 4, "UWB ranging", "start") +
      // units and bridge, over Bluetooth
      path("M" + (A[1] + 2) + " " + (r2 + 20) + " H" + (B[0] - 2)) + path("M" + (B[0] - 2) + " " + (r2 + 38) + " H" + (A[1] + 2)) + lab((A[1] + B[0]) / 2, r2 - 6, "BLE") +
      // bridge up to the multilaterator
      path("M" + cb + " " + (r2 - 2) + " V58 H" + (C[0] - 2)) + lab((cb + C[0]) / 2 + 8, 52, "ranges, IMU") +
      path("M" + cc + " " + (r1b + 2) + " V" + (r2 - 2)) + lab(cc + 6, (r1b + r2) / 2 + 4, "positions", "start") +
      // the commands go back to the bridge
      path("M" + (C[0] - 2) + " " + (r2 + 36) + " H" + (B[1] + 2)) + lab((B[1] + C[0]) / 2, r2 + 51, "commands") +
      // dashboard and orchestrator
      path("M" + (cc - 6) + " " + (r3 - 2) + " V" + (r2b + 2)) + path("M" + (cc + 14) + " " + (r2b + 2) + " V" + (r3 - 2)) + lab(cc + 20, (r2b + r3) / 2 + 4, "task", "start") +
      // the sessions are logged, then analysed offline
      path("M" + (C[0] + 16) + " " + (r2b + 2) + " V" + ylog + " H" + cb + " V" + (r3 - 2)) + lab((cb + C[0] + 16) / 2, ylog - 6, "log") +
      path("M" + (B[0] - 2) + " " + (r3 + 28) + " H" + (A[1] + 2), true);
    svg.setAttribute("aria-label", aria);
  }
  var last = 0;
  function fit(){
    var w = svg.getBoundingClientRect().width; if (!w) return;
    // beside the text: as tall as the text, less the caption and the frame around the drawing
    var beside = Math.abs(fig.getBoundingClientRect().top - text.getBoundingClientRect().top) < 40;
    var H = HMIN;
    if (beside) {
      var cap = fig.querySelector("figcaption"), plate = svg.parentNode, cs = getComputedStyle(plate);
      // the height of the text itself, not of its grid cell, which grows with the diagram
      var last2 = text.lastElementChild, textH = last2 ? last2.getBoundingClientRect().bottom - text.getBoundingClientRect().top : 0;
      var room = textH - (cap ? cap.getBoundingClientRect().height + 12 : 0) - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      H = Math.round(Math.max(HMIN, Math.min(HMAX, room * W / w)));
    }
    if (Math.abs(H - last) < 4) return;
    last = H; draw(H);
  }
  draw(HMIN);
  if ("ResizeObserver" in window) { var ro = new ResizeObserver(function(){ requestAnimationFrame(fit); }); ro.observe(text); ro.observe(fig); }
  else window.addEventListener("resize", fit);
  fit();
})();
