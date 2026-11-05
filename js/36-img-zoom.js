(function(){
  // Project pages: an image zooms in gently while the pointer is over it, towards the point under the pointer,
  // and back out when the pointer leaves. Only with a mouse (not on touch screens) and not with reduced motion;
  // the zoom itself is in CSS (.plate img, .fem-shot img), this only moves its origin with the pointer.
  if (!window.matchMedia || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var SEL = 'main[data-view]:not([data-view="home"]) .plate > img, .fem-shot img';
  document.addEventListener("mousemove", function(e){
    var img = e.target.closest && e.target.closest("img"); if (!img || !img.matches(SEL)) return;
    var r = img.getBoundingClientRect(); if (!r.width) return;
    img.style.transformOrigin = ((e.clientX - r.left) / r.width * 100).toFixed(1) + "% " + ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%";
  }, { passive: true });
})();
