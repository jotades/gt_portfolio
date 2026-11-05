(function(){
  // WashB, "Research": the flow from cleaning teeth, through brushing and flossing and their problems, to the
  // ultrasound solution, drawn as vectors at the real width of the figure so it stays sharp at any size. The band
  // widths are qualitative (they follow the original diagram, not measured data). Pointing at a node, or focusing
  // it with the keyboard, highlights its flows.
  var svg = document.querySelector("svg.wb-flow"); if (!svg) return;
  var T = function(s){ return window.i18n ? window.i18n.t(s) : s; };
  var NS = "http://www.w3.org/2000/svg";
  var DARK = "#3b4658", TEAL = "#5db8bd";
  // problem, how much it weighs for flossing and for brushing, colour of its node
  var PROBLEMS = [
    ["Time consuming", 8, 2, TEAL],
    ["Invasive method", 4, 2, TEAL],
    ["Depends on the user’s dexterity", 4, 2, DARK],
    ["Harmful", 4, 1, DARK],
    ["Needs a hygienist to remove plaque", 3, 3, TEAL],
    ["Not sustainable for the environment", 3, 3, DARK],
    ["Varies with user habits", 2, 2, TEAL],
    ["Many different approaches", 0, 2, TEAL],
    ["Many market solutions", 1, 1, DARK]
  ];
  var METHODS = [["Flossing", DARK, "floss"], ["Brushing", TEAL, "brush"]];
  var lastW = 0;

  function el(tag, attrs, parent){
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function band(xs, y0, xt, y1, w){
    var xm = (xs + xt) / 2;
    return "M" + xs + " " + y0 + "C" + xm + " " + y0 + " " + xm + " " + y1 + " " + xt + " " + y1 +
      "L" + xt + " " + (y1 + w) + "C" + xm + " " + (y1 + w) + " " + xm + " " + (y0 + w) + " " + xs + " " + (y0 + w) + "Z";
  }
  // a label, split over two lines when it is wider than the room it has
  function label(g, x, y, text, anchor, room, fs, bold){
    var words = T(text).split(" "), lines = [words.join(" ")];
    if (words.length > 1 && lines[0].length * fs * 0.55 > room) {
      var best = 1, diff = Infinity;
      for (var i = 1; i < words.length; i++) {
        var d = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
        if (d < diff) { diff = d; best = i; }
      }
      lines = [words.slice(0, best).join(" "), words.slice(best).join(" ")];
    }
    var t = el("text", {x: x, y: y - (lines.length - 1) * fs * 0.6 + fs * 0.35, "text-anchor": anchor, "font-size": fs, "font-weight": bold ? 700 : 600, "class": "wb-l"}, g);
    lines.forEach(function(s, i){ var ts = el("tspan", {x: x, dy: i ? fs * 1.2 : 0}, t); ts.textContent = s; });
    return t;
  }
  function icon(g, kind, x, y){
    var i = el("g", {transform: "translate(" + x + " " + y + ") scale(1.5)", fill: "none", stroke: "var(--ink-2)", "stroke-width": 1.3, "stroke-linecap": "round", "stroke-linejoin": "round", "class": "wb-ic"}, g);
    if (kind === "floss") {
      // a floss pick: the fork holding the thread, then the handle
      el("path", {d: "M2 2 L2 8 Q2 12 6 12 L10 12 Q14 12 14 8 L14 2"}, i);
      el("path", {d: "M2 3 L14 3", "stroke-width": 1}, i);
      el("path", {d: "M10 12 L22 24"}, i);
    } else {
      // a toothbrush: bristles, head and handle
      el("path", {d: "M0 6 L24 6 M0 6 L0 9 L9 9 L9 6"}, i);
      el("path", {d: "M1 2 L1 5 M3.5 2 L3.5 5 M6 2 L6 5 M8.5 2 L8.5 5", "stroke-width": 1.2}, i);
    }
  }

  function draw(){
    var W = Math.round(svg.getBoundingClientRect().width); if (!W || Math.abs(W - lastW) < 2) return; lastW = W;
    var narrow = W < 560, fs = narrow ? 10.5 : 12;
    var H = narrow ? 470 : Math.round(Math.max(400, Math.min(520, W * 0.68)));
    var nw = 9, pad = narrow ? 7 : 8, top = 6;
    var c0 = 0, c1 = Math.round(W * (narrow ? 0.16 : 0.19)), c2 = Math.round(W * (narrow ? 0.7 : 0.67)), c3 = W - nw;
    var sf = PROBLEMS.reduce(function(t, p){ return t + p[1]; }, 0), sb = PROBLEMS.reduce(function(t, p){ return t + p[2]; }, 0);
    var tot = sf + sb, k = (H - 2 * top - (PROBLEMS.length - 1) * pad) / tot;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("height", H);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var defs = el("defs", {}, svg), links = el("g", {"class": "wb-links"}, svg), nodes = el("g", {}, svg), gid = 0;

    function grad(xs, xt, a, b){
      var id = "wbg" + (gid++), g = el("linearGradient", {id: id, gradientUnits: "userSpaceOnUse", x1: xs, x2: xt, y1: 0, y2: 0}, defs);
      el("stop", {offset: "0", "stop-color": a}, g); el("stop", {offset: "1", "stop-color": b}, g);
      return "url(#" + id + ")";
    }
    function link(xs, y0, xt, y1, w, a, b, ends){
      var p = el("path", {d: band(xs, y0, xt, y1, w), fill: grad(xs, xt, a, b), "class": "wb-link"}, links);
      p.setAttribute("data-n", ends.join(" "));
    }
    function node(x, y, h, color, id, name){
      var g = el("g", {"class": "wb-node", tabindex: 0, "data-id": id, role: "img", "aria-label": T(name)}, nodes);
      el("rect", {x: x, y: y, width: nw, height: h, rx: 2, fill: color}, g);
      return g;
    }

    // columns: cleaning teeth, the two methods, the problems, the solution, all centred on the same height
    var mid = H / 2, hAll = tot * k;
    var y0 = mid - hAll / 2, yM = mid - (hAll + pad * 3) / 2;
    var mY = [yM, yM + sf * k + pad * 3], pY = [], y = top;
    PROBLEMS.forEach(function(p){ pY.push(y); y += (p[1] + p[2]) * k + pad; });

    // cleaning teeth to the methods
    link(c0 + nw, y0, c1, mY[0], sf * k, DARK, DARK, ["clean", "m0"]);
    link(c0 + nw, y0 + sf * k, c1, mY[1], sb * k, DARK, TEAL, ["clean", "m1"]);
    // methods to problems: each method leaves in the order of the problems, each problem receives flossing first
    var out = [mY[0], mY[1]];
    PROBLEMS.forEach(function(p, i){
      var inY = pY[i];
      [1, 2].forEach(function(m){
        var w = p[m] * k; if (!w) return;
        link(c1 + nw, out[m - 1], c2, inY, w, METHODS[m - 1][1], p[3], ["m" + (m - 1), "p" + i]);
        out[m - 1] += w; inY += w;
      });
    });
    // problems to the solution
    var sy = y0;
    PROBLEMS.forEach(function(p, i){
      var w = (p[1] + p[2]) * k;
      link(c2 + nw, pY[i], c3, sy, w, p[3], DARK, ["p" + i, "sol"]);
      sy += w;
    });

    node(c0, y0, hAll, DARK, "clean", "Cleaning teeth");
    label(nodes, c0 + nw + 6, mid, "Cleaning teeth", "start", c1 - nw - 10, fs, true);
    METHODS.forEach(function(m, i){
      var h = (i ? sb : sf) * k;
      node(c1, mY[i], h, m[1], "m" + i, m[0]);
      var ly = mY[i] + Math.min(h / 2, 46);
      label(nodes, c1 - 6, ly, m[0], "end", c1, fs, true);
      icon(nodes, m[2], c1 - 8 - 36, ly - fs - (m[2] === "floss" ? 40 : 18));
    });
    PROBLEMS.forEach(function(p, i){
      var h = (p[1] + p[2]) * k;
      node(c2, pY[i], h, p[3], "p" + i, p[0]);
      label(nodes, c2 - 6, pY[i] + h / 2, p[0], "end", c2 - c1 - nw - 24, fs);
    });
    node(c3, y0, hAll, DARK, "sol", "Ultrasound solution");
    label(nodes, c3 - 6, mid, "Ultrasound solution", "end", c3 - c2 - nw - 16, fs, true);
  }

  // pointing at a node lights up its flows
  function focusNode(id){
    svg.classList.toggle("is-focus", !!id);
    Array.prototype.forEach.call(svg.querySelectorAll(".wb-link"), function(p){
      p.classList.toggle("on", !!id && p.getAttribute("data-n").split(" ").indexOf(id) >= 0);
    });
  }
  function nodeOf(e){ var g = e.target.closest && e.target.closest(".wb-node"); return g ? g.getAttribute("data-id") : null; }
  svg.addEventListener("pointerover", function(e){ focusNode(nodeOf(e)); });
  svg.addEventListener("pointerleave", function(){ focusNode(null); });
  svg.addEventListener("focusin", function(e){ focusNode(nodeOf(e)); });
  svg.addEventListener("focusout", function(){ focusNode(null); });

  if ("ResizeObserver" in window) new ResizeObserver(function(){ requestAnimationFrame(draw); }).observe(svg.parentNode);
  else window.addEventListener("resize", draw);
  draw();
})();
