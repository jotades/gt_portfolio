(function(){
  // WashB, "Research": the questionnaire answered by 86 people (thesis, pages 60–64), one stacked bar per question,
  // grouped in three tabs; the flossing tab adds the questions on people who gave up flossing (from the project presentation).
  var root = document.getElementById("sv"); if (!root) return;
  var T = function(s){ return window.i18n ? window.i18n.t(s) : s; };
  var IT = !!(window.i18n && window.i18n.lang === "it");
  var C = ["#1f3a5a", "#3fa9b5", "#8a97a5", "#a8dade", "#c9d3da"];
  // [question, [[answer, %], ...]]
  var TABS = {
    brush: {
      key: [["84%", "brush for 1 to 3 minutes"], ["35%", "use no particular technique"], ["63%", "would rather receive an electric toothbrush"]],
      note: "Brushing is a habit almost everyone keeps, but it is short and done without a method: the cleaning depends on the hand that holds the brush.",
      qs: [
        ["Do you brush your teeth?", [["Yes", 98], ["Sometimes", 2]]],
        ["How many times a day?", [["Twice", 56], ["Three times", 35], ["Four", 7], ["Once", 2]]],
        ["How long do you brush?", [["1–3 minutes", 84], ["Under 1 minute", 12], ["3–5 minutes", 5]]],
        ["Do you use a specific technique?", [["Yes", 65], ["No", 35]]],
        ["Which toothbrush do you use?", [["Manual", 80], ["Powered", 20]]],
        ["As a gift, which would you like?", [["Powered", 63], ["Manual", 38]]],
        ["When do you change the toothbrush or its head?", [["When the bristles are damaged", 49], ["Every 2 months", 26], ["Every 3 months", 21], ["Within a month", 5]]],
        ["Do you remember the last time you changed it?", [["Yes", 70], ["No", 30]]]
      ]
    },
    floss: {
      key: [["49%", "do not floss"], ["44%", "of them find it too difficult"], ["31%", "used floss but stopped"]],
      note: "Flossing is where the routine breaks: half the people skip it, and those who tried often gave up, for lack of time or for fear of damaging teeth and gums.",
      qs: [
        ["Do you floss your teeth?", [["No", 49], ["Yes", 35], ["Sometimes", 16]]],
        ["If you do not floss, why?", [["Too difficult", 44], ["No time", 28], ["To avoid damaging teeth and gums", 19], ["Not effective", 8]]],
        ["Why did you give up flossing?", [["No time", 45], ["To avoid damaging teeth, gums or dental work", 20], ["Not effective", 14], ["Too difficult", 12], ["It caused complications", 12]]],
        ["Problems while flossing (43% had at least one)", [["Gum damage", 33], ["Teeth damage", 7], ["Ineffective", 5], ["Infection", 5], ["Dental work damage", 4]], "multi"]
      ]
    },
    hyg: {
      key: [["93%", "go to the dental hygienist"], ["53%", "would like to skip it or go less often"], ["44%", "feel pain when plaque is removed"]],
      note: "Almost everyone still needs the hygienist to remove plaque, and half would gladly go less often: the opening for a cleaning that does more at home.",
      qs: [
        ["Do you go to the dental hygienist?", [["Yes", 93], ["No", 7]]],
        ["How often?", [["Once a year", 40], ["Every 6 months", 30], ["Every 2 years", 23], ["Less often", 8]]],
        ["Do you feel pain?", [["No", 56], ["Yes", 44]]],
        ["Would you like to skip or reduce the visits?", [["Yes", 53], ["No", 47]]]
      ]
    }
  };
  var tabs = root.querySelectorAll("[data-sv]"), key = root.querySelector(".sv-key"), list = root.querySelector(".sv-qs"), tip = root.querySelector(".sv-tip");
  function pc(v){ return v + "%"; }
  function render(id){
    var t = TABS[id];
    key.innerHTML = t.key.map(function(k){ return '<p class="sv-big"><b>' + k[0] + "</b><span>" + T(k[1]) + "</span></p>"; }).join("") + '<p class="sv-note">' + T(t.note) + "</p>";
    list.innerHTML = t.qs.map(function(q){
      var tot = q[1].reduce(function(s, a){ return s + a[1]; }, 0), multi = q[2] === "multi";
      var bar = q[1].map(function(a, i){
        // single answers fill the bar; answers that are not exclusive are drawn against 100%, side by side
        var w = multi ? a[1] : a[1] / tot * 100;
        return '<span class="sv-seg" style="width:' + w.toFixed(2) + "%;background:" + C[i % C.length] + '" data-tip="' + T(a[0]).replace(/"/g, "&quot;") + " · " + pc(a[1]) + '">' + (w >= 9 ? '<i style="color:' + (i === 0 || i === 2 ? "#fff" : "#1f3a5a") + '">' + pc(a[1]) + "</i>" : "") + "</span>";
      }).join("");
      var leg = q[1].map(function(a, i){ return '<li><i style="background:' + C[i % C.length] + '"></i>' + T(a[0]) + " <b>" + pc(a[1]) + "</b></li>"; }).join("");
      return '<li class="sv-q' + (multi ? " multi" : "") + '"><p>' + T(q[0]) + (multi ? ' <small>' + T("more than one answer possible") + "</small>" : "") + '</p><div class="sv-bar" role="img" aria-label="' + T(q[0]).replace(/"/g, "&quot;") + ": " + q[1].map(function(a){ return T(a[0]) + " " + pc(a[1]); }).join(", ").replace(/"/g, "&quot;") + '">' + bar + '</div><ul class="sv-leg">' + leg + "</ul></li>";
    }).join("");
  }
  // the exact figure under the pointer
  list.addEventListener("pointermove", function(e){
    var s = e.target.closest(".sv-seg"); if (!s) { tip.hidden = true; return; }
    var r = root.getBoundingClientRect(); tip.textContent = s.getAttribute("data-tip"); tip.hidden = false;
    tip.style.left = Math.min(r.width - tip.offsetWidth - 8, Math.max(8, e.clientX - r.left - tip.offsetWidth / 2)) + "px"; tip.style.top = (e.clientY - r.top - 38) + "px";
  });
  list.addEventListener("pointerleave", function(){ tip.hidden = true; });
  tabs.forEach(function(b){ b.addEventListener("click", function(){ tabs.forEach(function(o){ o.setAttribute("aria-selected", String(o === b)); }); render(b.getAttribute("data-sv")); }); });
  render("brush");
})();
