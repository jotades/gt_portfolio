(function(){
  // a section index under the title of every project page, with the section you are reading highlighted
  var head = document.querySelector(".site-head"), INTER = /(^|\s)(sim|bk|ard-sim|wb-sim|rd-sim|pc-wrap)(\s|$)/;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var navs = [];
  document.querySelectorAll("main[data-view]").forEach(function(main){
    var ph = main.querySelector(".project-head"); if (!ph) return;
    var items = [], el = ph.nextElementSibling;
    while (el && !(el.classList && el.classList.contains("step"))) {
      if (el.id === "pc-proto" || INTER.test(el.className || "") || el.querySelector && el.querySelector("#pc-proto")) { items.push({ k: "", label: "Try it", el: el }); break; }
      el = el.nextElementSibling;
    }
    main.querySelectorAll("section.step > .text > h2, section.step > h2").forEach(function(h){ var n = h.querySelector(".n"), label = h.textContent.replace(n ? n.textContent : "", "").trim(); items.push({ k: n ? n.textContent.trim() : "", label: label, el: h.closest("section") }); });
    if (items.length < 2) return;
    var nav = document.createElement("nav"); nav.className = "sec-index"; nav.setAttribute("aria-label", "Sections");
    nav.innerHTML = "<ol>" + items.map(function(it, i){ return '<li><button type="button" data-i="' + i + '">' + (it.k ? '<span class="k">' + it.k + "</span>" : "") + it.label + "</button></li>"; }).join("") + "</ol>";
    ph.parentNode.insertBefore(nav, ph.nextSibling);
    nav.addEventListener("click", function(e){ var b = e.target.closest("[data-i]"); if (!b) return; var tgt = items[+b.getAttribute("data-i")].el, off = (head ? head.offsetHeight : 0) + nav.offsetHeight + 8; window.scrollTo({ top: tgt.getBoundingClientRect().top + window.scrollY - off, behavior: reduce ? "auto" : "smooth" }); });
    navs.push({ main: main, nav: nav, items: items });
  });
  function spy(){
    var hh = head ? head.offsetHeight : 0;
    navs.forEach(function(n){
      if (n.main.hidden) return;
      n.nav.style.top = hh + "px";
      var line = hh + n.nav.offsetHeight + 40, cur = -1;
      n.items.forEach(function(it, i){ if (it.el.getBoundingClientRect().top <= line) cur = i; });
      n.nav.querySelectorAll("[data-i]").forEach(function(b, i){ var on = i === cur; if ((b.getAttribute("aria-current") === "true") !== on) { b.setAttribute("aria-current", String(on)); if (on && b.scrollIntoView) { var ol = b.parentNode.parentNode, l = b.offsetLeft - ol.offsetLeft; if (l < ol.scrollLeft || l + b.offsetWidth > ol.scrollLeft + ol.clientWidth) ol.scrollTo({ left: l - 12, behavior: reduce ? "auto" : "smooth" }); } } });
    });
  }
  var ticking = false;
  window.addEventListener("scroll", function(){ if (!ticking) { ticking = true; requestAnimationFrame(function(){ ticking = false; spy(); }); } }, { passive: true });
  window.addEventListener("hashchange", function(){ setTimeout(spy, 50); });
  window.addEventListener("resize", spy);
  spy();
})();
