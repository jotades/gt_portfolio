(function(){
  // Click to zoom, on project pages. Over the grey background of an interactive section, or over an image or a
  // diagram, the pointer becomes a "+": a click moves that element to the middle of the screen, enlarged, with the
  // page dimmed behind it. The pointer then becomes a "−", and a click (or Esc, a click outside, scrolling) puts it
  // back where it was. The element itself is moved with a CSS transform, so a demo keeps working while enlarged.
  // Mouse only: on touch screens the sections already fill the width.
  if (!window.matchMedia || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var PANELS = ".sim, .ard-sim, .bk, .pr-demo, .cal, .rb, .wb-sim, .rd-sim, .cx, .od, .oa, .pc-proto, .step-key";
  // pictures zoom from anywhere on them; interactive sections only from their grey background
  // ("Teaching it to count" zooms from the grey around its chart, never from the chart)
  var PICTURES = ".plate, .fem-shot";
  var CONTROLS = "a, button, input, select, textarea, label, summary, [role=button], [role=tab], [role=slider]";
  var ACTIVE = "a, button, input, select, textarea, label, summary, option, iframe, canvas, video, pre, [role=button], [role=tab], [role=slider], [tabindex], [contenteditable]";
  var root = document.documentElement, cur = null, back = null, scrollY0 = 0;

  function onProjectPage(el){ var m = el.closest("main[data-view]"); return m && m.getAttribute("data-view") !== "home"; }
  function opaque(el){ var c = getComputedStyle(el).backgroundColor; var m = /rgba?\(([^)]+)\)/.exec(c); if (!m) return false; var p = m[1].split(","); return p.length < 4 || +p[3] > 0; }
  // how much an element can grow and still fit on screen
  function fit(el){
    var r = el.getBoundingClientRect(), W = window.innerWidth - 48, H = window.innerHeight - 48, s = Math.min(W / r.width, H / r.height);
    var img = el.querySelector(":scope > img"); if (img && img.naturalWidth) s = Math.min(s, Math.max(1.6, img.naturalWidth / r.width * 1.2));
    return Math.min(s, 3);
  }
  // the element a click at this point would zoom, if any
  function target(t){
    if (!t || !t.closest) return null;
    var pic = t.closest(PICTURES);
    if (pic && onProjectPage(pic) && !pic.closest(PANELS + ", .is-zoom")) {
      if (t !== pic && t.closest(CONTROLS) && pic.contains(t.closest(CONTROLS))) return null;
      return pic;
    }
    var panel = t.closest(PANELS); if (!panel || !onProjectPage(panel)) return null;
    // only its grey background: nothing on the way up may be a control, a graphic or a card with its own background
    for (var el = t; el && el !== panel; el = el.parentElement) {
      if (el.matches(ACTIVE) || el.closest("svg") || el.tagName === "IMG" || (el !== cur && opaque(el))) return null;
    }
    // a section can name the part of it that zooms ("Teaching it to count": its grey band zooms the whole
    // interactive figure, which fits on screen, not the text beside it)
    var part = panel.getAttribute("data-zoom") && panel.querySelector(panel.getAttribute("data-zoom"));
    return part || panel;
  }

  function open(el){
    var s = fit(el); if (s < 1.08) return;
    var r = el.getBoundingClientRect();
    var dx = window.innerWidth / 2 - (r.left + r.width / 2), dy = window.innerHeight / 2 - (r.top + r.height / 2);
    back = document.createElement("div"); back.className = "zm-back"; document.body.appendChild(back);
    back.addEventListener("click", close);
    cur = el; scrollY0 = window.scrollY;
    el.classList.add("is-zoom");
    el.style.transform = "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px) scale(" + s.toFixed(3) + ")";
    requestAnimationFrame(function(){ back.classList.add("on"); });
    root.setAttribute("data-zcur", "out");
  }
  function close(){
    if (!cur) return;
    var el = cur, b = back; cur = null; back = null;
    el.style.transform = "";
    if (b) { b.classList.remove("on"); setTimeout(function(){ b.remove(); }, reduce ? 0 : 450); }
    // it keeps its place above the page until it has slid back
    setTimeout(function(){ if (el !== cur) el.classList.remove("is-zoom"); }, reduce ? 0 : 450);
    root.removeAttribute("data-zcur");
  }

  document.addEventListener("mousemove", function(e){
    var z = null;
    if (cur) z = cur.contains(e.target) ? (target(e.target) === cur || cur.matches(PICTURES) && !e.target.closest(CONTROLS) ? "out" : null) : "out";
    else { var t = target(e.target); if (t && fit(t) >= 1.08) z = "in"; }
    if (z) root.setAttribute("data-zcur", z); else root.removeAttribute("data-zcur");
  }, { passive: true });
  document.addEventListener("click", function(e){
    if (e.button !== 0 || e.defaultPrevented) return;
    if (cur) {
      if (!cur.contains(e.target)) return;   // the backdrop closes it on its own
      if (target(e.target) === cur || (cur.matches(PICTURES) && !e.target.closest(CONTROLS))) { e.preventDefault(); close(); }
      return;
    }
    var t = target(e.target); if (!t) return;
    e.preventDefault(); open(t);
    // a chart that takes the keyboard would keep a focus ring from the click: not wanted for a zoom
    var ae = document.activeElement; if (ae && t.contains(ae) && ae.blur) ae.blur();
  });
  document.addEventListener("keydown", function(e){ if (e.key === "Escape" && cur) close(); });
  window.addEventListener("scroll", function(){ if (cur && Math.abs(window.scrollY - scrollY0) > 40) close(); }, { passive: true });
  window.addEventListener("resize", close);
  window.addEventListener("hashchange", close);
})();
