(function(){
  // OmniTrack dashboard: the cards are spread over as many columns as the width allows (three, two or one), in the
  // arrangement whose columns end closest together; the last card of each column then
  // stretches to the bottom (the log shows more lines, the room map centres itself). The cards are only moved when
  // the width changes, never while the dashboard is in use.
  var od = document.getElementById("od"); if (!od) return;
  var grid = od.querySelector(".od-cols"), cols = Array.prototype.slice.call(grid.querySelectorAll(":scope > .od-col"));
  // what moves together: a card, with anything that sits right above it (the scan button above the device list)
  var units = [], pending = [];
  cols.forEach(function(c){ Array.prototype.forEach.call(c.children, function(k){ pending.push(k); if (k.classList.contains("od-card")) { units.push(pending); pending = []; } }); });
  if (pending.length) units.push(pending);
  var lastW = 0;
  function layout(){
    var w = grid.clientWidth; if (!w || w === lastW) return;
    lastW = w;
    var n = getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length || 1;
    var gap = parseFloat(getComputedStyle(cols[0]).rowGap) || 0, h = [];
    // measure every card at the column width first, then place them
    units.forEach(function(u){ u.forEach(function(k){ cols[0].appendChild(k); }); });
    var size = units.map(function(u){ return u.reduce(function(t, k, i){ return t + k.getBoundingClientRect().height + (i ? gap : 0); }, 0); });
    // try every way of sharing the cards out (keeping their order inside a column) and keep the one whose columns end
    // closest together; the gap left under a column costs little when the log card, which can grow, ends it
    var m = units.length, best = null, bestCost = Infinity, pick = [];
    var stretchy = units.map(function(u){ return !!u[u.length - 1].querySelector(".od-log"); });
    (function walk(j){
      if (j === m) {
        var hs = [], last = [];
        for (var i = 0; i < n; i++) { hs.push(-gap); last.push(-1); }
        pick.forEach(function(c, k){ hs[c] += size[k] + gap; last[c] = k; });
        if (last.some(function(k){ return k < 0; })) return;
        var H = Math.max.apply(null, hs), cost = 0;
        hs.forEach(function(v, c){ cost += (H - v) * (stretchy[last[c]] ? 0.1 : 1); });
        if (cost < bestCost - 0.5) { bestCost = cost; best = pick.slice(); }
        return;
      }
      for (var c = 0; c < n; c++) { pick[j] = c; walk(j + 1); }
    })(0);
    units.forEach(function(u, k){ u.forEach(function(el){ cols[best ? best[k] : 0].appendChild(el); }); });
  }
  if ("ResizeObserver" in window) new ResizeObserver(function(){ requestAnimationFrame(layout); }).observe(grid);
  else window.addEventListener("resize", layout);
  layout();
})();
