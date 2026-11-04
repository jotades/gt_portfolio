(function(){
  // the work section: grid or timeline, and a filter by the role you are reading for
  var sec = document.getElementById("work"); if (!sec) return;
  var grid = sec.querySelector(".grid"), tl = sec.querySelector(".tl"), note = sec.querySelector(".role-note");
  var cards = Array.prototype.slice.call(grid.querySelectorAll("a.card[data-roles]"));
  var YEARS = { "#omnitrack": "2023–26", "#phicube": "2024", "#rehaballoon": "2023", "#steering-wheel": "2022–23", "#arduino-lesson": "2023", "#unity-experiments": "2023", "#balance-device": "2022", "#blender-lesson": "2022", "#washb": "2020", "#red-6-3": "2019", "#spacer": "2018", "#d-baseplate": "2018" };
  var NOTE = { all: "", product: "Products from brief to engineering: research, concept, form, materials and manufacturing.", ux: "Interfaces, apps and feedback designed around how people use them.", eng: "FEM, shape optimisation, calibration and the mechanics behind the products.", soft: "Firmware, ROS 2, Unity and C#, and the small neural network in a balloon.", research: "Research systems, studies with users, and papers.", teach: "Lessons I designed and taught, with their material." };
  // build the timeline from the cards, in the order set by data-tl
  var sorted = cards.slice().sort(function(a, b){ return (+a.getAttribute("data-tl")) - (+b.getAttribute("data-tl")); }), html = "", early = false;
  sorted.forEach(function(c){
    var href = c.getAttribute("href"), dated = +c.getAttribute("data-tl") < 99;
    if (!dated && !early) { early = true; html += '<li class="tl-group">Earlier, during my degrees</li>'; }
    var img = c.querySelector(".plate img.design, .plate img, .plate svg"), thumb = img ? img.outerHTML.replace(/ class="[^"]*"/, "") : "";
    var h = c.querySelector("h3"), p = c.querySelector("h3 + p"), m = c.querySelector(".meta");
    var year = YEARS[href] ? YEARS[href] : dated ? '<span class="todo">anno</span>' : "";
    html += '<li class="tl-item" data-roles="' + c.getAttribute("data-roles") + '"><span class="tl-year">' + year + '</span><span class="tl-dot" aria-hidden="true"></span><a class="tl-card" href="' + href + '"><span class="tl-thumb">' + thumb + '</span><span><h3>' + (h ? h.innerHTML : "") + "</h3>" + (p ? "<p>" + p.innerHTML + "</p>" : "") + (m ? '<span class="meta">' + m.innerHTML + "</span>" : "") + "</span></a></li>";
  });
  tl.innerHTML = html;
  var role = "all";
  try { role = localStorage.getItem("work-role") || "all"; } catch (e) {}
  if (!sec.querySelector('[data-role="' + role + '"]')) role = "all";
  function count(r){ return cards.filter(function(c){ return r === "all" || r === "timeline" || (" " + c.getAttribute("data-roles") + " ").indexOf(" " + r + " ") >= 0; }).length; }
  sec.querySelectorAll("[data-role]").forEach(function(b){ var r = b.getAttribute("data-role"); b.insertAdjacentHTML("beforeend", '<span class="c">' + count(r) + "</span>"); });
  function apply(){
    var view = role === "timeline" ? "timeline" : "grid";
    var match = function(el){ return role === "all" || role === "timeline" || (" " + el.getAttribute("data-roles") + " ").indexOf(" " + role + " ") >= 0; };
    grid.hidden = view !== "grid"; tl.hidden = view !== "timeline";
    grid.querySelectorAll("[data-roles]").forEach(function(el){ el.hidden = !match(el); });
    var ext = sec.querySelector(".ext-card"); if (ext) ext.hidden = view !== "grid" || !match(ext);
    tl.querySelectorAll(".tl-item").forEach(function(el){ el.hidden = !match(el); });
    var eg = tl.querySelector(".tl-group"); if (eg) { var any = false, n = eg.nextElementSibling; while (n) { if (!n.hidden) any = true; n = n.nextElementSibling; } eg.hidden = !any; }
    sec.querySelectorAll("[data-role]").forEach(function(b){ b.setAttribute("aria-pressed", String(b.getAttribute("data-role") === role)); });
    note.textContent = role === "all" ? "" : role === "timeline" ? "Newest first." : count(role) + " projects. " + NOTE[role];
    try { localStorage.setItem("work-role", role); } catch (e) {}
  }
  sec.querySelectorAll("[data-role]").forEach(function(b){ b.addEventListener("click", function(){ role = b.getAttribute("data-role"); apply(); }); });
  apply();
})();
