(function(){
  var views = ["washb","phicube","red-6-3","spacer","d-baseplate","rehaballoon","arduino-lesson","blender-lesson","balance-device","steering-wheel","unity-experiments","omnitrack","for"];
  var titles = {"washb":"WashB","red-6-3":"RED 6.3","spacer":"Spacer","d-baseplate":"D.","rehaballoon":"RehaBalloon","phicube":"PhiCube","arduino-lesson":"Arduino lesson","blender-lesson":"Blender lesson","balance-device":"Balancing Rehabilitation Device","steering-wheel":"Rip@rto driving simulator","unity-experiments":"Unity experiments","omnitrack":"OmniTrack","for":"Work by role"};
  var base = "Giovanni Tauro, industrial designer and engineer";
  var mains = document.querySelectorAll("main[data-view]");

  function route(){
    // #project opens a project page; #project/3 opens it at its section 3
    var h = decodeURIComponent(location.hash.replace(/^#/, "")), part = "";
    var slash = h.indexOf("/");
    if (slash > 0 && views.indexOf(h.slice(0, slash)) > -1) { part = h.slice(slash + 1); h = h.slice(0, slash); }
    var target = views.indexOf(h) > -1 ? h : "home";
    mains.forEach(function(m){ m.hidden = m.getAttribute("data-view") !== target; });
    if (target !== "home") {
      document.title = titles[target] + " | Giovanni Tauro";
      window.scrollTo(0, 0);
      var main = document.querySelector('main[data-view="' + target + '"]'), h1 = main.querySelector("h1");
      if (h1) { h1.setAttribute("tabindex", "-1"); h1.focus({preventScroll:true}); }
      var step = null;
      if (part) main.querySelectorAll("section.step").forEach(function(s){ var n = s.querySelector("h2 .n"); if (!step && n && n.textContent.trim() === part) step = s; });
      if (step) {
        // below the sticky header and the section index
        requestAnimationFrame(function(){ requestAnimationFrame(function(){
          var head = document.querySelector(".site-head"), idx = main.querySelector(".sec-index");
          var off = (head ? head.offsetHeight : 0) + (idx ? idx.offsetHeight : 0) + 8;
          window.scrollTo(0, step.getBoundingClientRect().top + window.scrollY - off);
        }); });
      }
    } else {
      document.title = base;
      var el = h ? document.getElementById(h) : null;
      if (el) { requestAnimationFrame(function(){ el.scrollIntoView(); }); }
      else { window.scrollTo(0, 0); }
    }
  }
  window.addEventListener("hashchange", route);
  route();

})();
