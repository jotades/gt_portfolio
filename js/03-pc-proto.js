(function(){
  var proto = document.getElementById("pc-proto");
  if (!proto) return;
  var frame = proto.querySelector(".pc-frame");
  var stage = proto.querySelector(".pc-stage");
  var SCREEN = { "loading":"loading", "login":"", "welcome":"world", "app":"" };
  var appEl = proto.querySelector(".pc-app"), loginEl = proto.querySelector(".pc-login");
  var steps = proto.querySelectorAll(".pc-steps button");
  var hint = proto.querySelector(".pc-hint");
  var fill = proto.querySelector(".pc-logo-fill");
  var pct = proto.querySelector(".pc-pct");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var raf = 0, nextT = 0, current = "", started = false;

  function fit(){ var w = frame.clientWidth; if (w) stage.style.transform = "scale(" + (w / 1920) + ")"; }
  if (window.ResizeObserver) new ResizeObserver(fit).observe(frame);
  window.addEventListener("resize", fit);

  function stopLoading(){ if (raf) cancelAnimationFrame(raf); clearTimeout(nextT); raf = 0; }
  function runLoading(){
    stopLoading();
    var start = 0, dur = reduce ? 500 : 2400;
    fill.style.clipPath = "inset(100% 0 0 0)"; pct.textContent = "0%";
    function step(t){
      if (!start) start = t;
      var k = Math.min(1, (t - start) / dur), v = Math.round(k * 100);
      fill.style.clipPath = "inset(" + (100 - v) + "% 0 0 0)";
      pct.textContent = v + "%";
      if (k < 1) raf = requestAnimationFrame(step);
      else { raf = 0; nextT = setTimeout(function(){ if (current === "loading") show("login"); }, 700); }
    }
    raf = requestAnimationFrame(step);
  }
  function show(id){
    current = id;
    stage.setAttribute("data-screen-current", id);
    var scr = SCREEN[id];
    proto.querySelectorAll(".pc-screen").forEach(function(s){ s.hidden = s.getAttribute("data-screen") !== scr; });
    stage.style.display = (id === "app" || id === "login") ? "none" : "";
    if (appEl) appEl.hidden = !(id === "app" || id === "welcome");
    if (loginEl) loginEl.hidden = id !== "login";
    frame.classList.toggle("is-app", id === "app" || id === "welcome" || id === "login");
    if (appEl && !appEl.hidden && window.__appShown) window.__appShown();
    var stepId = id;
    steps.forEach(function(b){ b.setAttribute("aria-pressed", String(b.getAttribute("data-go") === stepId)); });
    proto.querySelectorAll(".pc-overlay").forEach(function(o){
      var on = o.classList.contains("pc-ov-" + id);
      o.querySelectorAll("button").forEach(function(b){ b.tabIndex = on ? 0 : -1; });
    });
    proto.querySelectorAll(".pc-island").forEach(function(b){ b.tabIndex = id === "world" ? 0 : -1; });
    if (id === "loading") runLoading(); else stopLoading();
  }
  window.__pcShow = show;
  proto.addEventListener("click", function(e){
    var b = e.target.closest("[data-go],[data-play]");
    if (!b || !proto.contains(b)) return;
    if (b.hasAttribute("data-play")) {
      hint.textContent = "In the real app, Play starts the game in Unity. Pick the other island, or start again from Loading.";
      show("world");
      return;
    }
    show(b.getAttribute("data-go"));
  });
  var signin = proto.querySelector(".pc-signin");
  signin.addEventListener("pointerdown", function(){ stage.classList.add("pc-press"); });
  ["pointerup","pointerleave","pointercancel"].forEach(function(ev){ signin.addEventListener(ev, function(){ stage.classList.remove("pc-press"); }); });

  show("loading"); stopLoading();
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting) { fit(); if (!started) { started = true; show("loading"); } }
      });
    }, { threshold: 0.3 }).observe(frame);
  } else { fit(); started = true; show("loading"); }
  window.addEventListener("hashchange", function(){ if (location.hash === "#phicube") started = false; });
})();
