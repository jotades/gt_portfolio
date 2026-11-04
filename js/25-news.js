(function(){
  // the news ribbon above the work: a second, hidden copy of the row makes the loop seamless
  var sec = document.getElementById("news"); if (!sec) return;
  var track = sec.querySelector(".news-track"), row = track.querySelector(".news-row"), btn = sec.querySelector(".news-pause");
  var copy = row.cloneNode(true);
  copy.setAttribute("aria-hidden", "true");
  copy.querySelectorAll("a").forEach(function(a){ a.tabIndex = -1; });
  track.appendChild(copy);
  // the same speed however many items there are
  track.style.setProperty("--news-dur", (row.children.length * 13) + "s");
  var T = function(s){ return window.i18n ? window.i18n.t(s) : s; };
  btn.addEventListener("click", function(){
    var paused = !sec.classList.contains("paused");
    sec.classList.toggle("paused", paused);
    btn.setAttribute("aria-pressed", String(paused));
    btn.textContent = T(paused ? "Resume" : "Pause");
  });
})();
