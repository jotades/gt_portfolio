(function(){
  // the hero title types itself out, letter by letter, the first time the home page is on screen.
  // The letters still to come are already in place but transparent, so nothing below moves while it types.
  var root = document.documentElement, h = document.querySelector('main[data-view="home"] .hero h1');
  function show(){ root.classList.remove("tw-wait"); }
  if (!h || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return show();
  var full = h.textContent.replace(/\s+/g, " ").trim(), chars = Array.from(full);
  // screen readers get the whole title at once; the typing is only visual
  h.innerHTML = '<span class="sr-only"></span><span class="tw" aria-hidden="true"><span class="tw-done"></span><span class="tw-todo"></span></span>';
  var tw = h.querySelector(".tw"), done = h.querySelector(".tw-done"), todo = h.querySelector(".tw-todo");
  h.firstChild.textContent = full; todo.textContent = full;
  show();
  var i = 0;
  function tick(){
    i++;
    done.textContent = chars.slice(0, i).join(""); todo.textContent = chars.slice(i).join("");
    if (i >= chars.length) { tw.classList.add("tw-end"); return; }
    // an uneven rhythm, with a breath after a comma, reads as someone typing
    var c = chars[i - 1], d = 20 + Math.random() * 32;
    if (c === "," || c === ";") d += 280; else if (c === " ") d += 15;
    setTimeout(tick, d);
  }
  function start(){ tw.classList.add("tw-on"); setTimeout(tick, 450); }
  // on a project page the home is hidden: start when it is first shown
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function(en){ if (en[0].isIntersecting) { io.disconnect(); start(); } });
    io.observe(h);
  } else start();
})();
