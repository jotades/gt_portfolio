(function(){
  var sec = document.getElementById("publications");
  if (!sec) return;
  var items = [].slice.call(sec.querySelectorAll(".pub")), tBtns = sec.querySelectorAll("[data-ft]"), pBtns = sec.querySelectorAll("[data-fp]"), fBtn = sec.querySelector("[data-ffirst]");
  var input = sec.querySelector(".pub-search input"), count = sec.querySelector(".pub-count"), empty = sec.querySelector(".pub-empty");
  var type = "", topics = {}, firstOnly = false;
  items.forEach(function(li){ li._text = li.textContent.toLowerCase(); li.querySelectorAll(".pub-title, .pub-authors, .pub-venue").forEach(function(el){ el._html = el.innerHTML; }); });
  function esc(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  function mark(el, q){
    if (!q) { el.innerHTML = el._html; return; }
    var re = new RegExp("(" + esc(q) + ")", "gi");
    var tmp = document.createElement("div"); tmp.innerHTML = el._html;
    (function walk(n){ [].slice.call(n.childNodes).forEach(function(c){ if (c.nodeType === 3) { if (re.test(c.nodeValue)) { var s = document.createElement("span"); s.innerHTML = c.nodeValue.replace(/[&<>]/g, function(ch){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch]; }).replace(re, "<mark>$1</mark>"); n.replaceChild(s, c); } re.lastIndex = 0; } else walk(c); }); })(tmp);
    el.innerHTML = tmp.innerHTML;
  }
  function apply(){
    var q = input.value.trim().toLowerCase(), act = Object.keys(topics).filter(function(k){ return topics[k]; }), n = 0;
    items.forEach(function(li){
      var ok = (!type || li.getAttribute("data-type") === type)
        && (!act.length || act.some(function(k){ return li.getAttribute("data-topics").split(" ").indexOf(k) > -1; }))
        && (!firstOnly || li.getAttribute("data-first") === "1")
        && (!q || li._text.indexOf(q) > -1);
      li.hidden = !ok; if (ok) n++;
      li.querySelectorAll(".pub-title, .pub-authors, .pub-venue").forEach(function(el){ mark(el, ok ? q : ""); });
    });
    count.textContent = n === items.length ? items.length + " publications" : n + " of " + items.length + " publications";
    empty.hidden = n > 0;
  }
  tBtns.forEach(function(b){ b.addEventListener("click", function(){ type = b.getAttribute("data-ft"); tBtns.forEach(function(o){ o.setAttribute("aria-pressed", String(o === b)); }); apply(); }); });
  pBtns.forEach(function(b){ b.addEventListener("click", function(){ var k = b.getAttribute("data-fp"); topics[k] = !topics[k]; b.setAttribute("aria-pressed", String(topics[k])); apply(); }); });
  fBtn.addEventListener("click", function(){ firstOnly = !firstOnly; fBtn.setAttribute("aria-pressed", String(firstOnly)); apply(); });
  input.addEventListener("input", apply);
  apply();
})();
