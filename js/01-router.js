(function(){
  var views = ["washb","phicube","red-6-3","spacer","d-baseplate","rehaballoon","arduino-lesson","blender-lesson","balance-device","steering-wheel","unity-experiments","omnitrack"];
  var titles = {"washb":"WashB","red-6-3":"RED 6.3","spacer":"Spacer","d-baseplate":"D.","rehaballoon":"RehaBalloon","phicube":"PhiCube","arduino-lesson":"Arduino lesson","blender-lesson":"Blender lesson","balance-device":"Balancing Rehabilitation Device","steering-wheel":"Rip@rto driving simulator","unity-experiments":"Unity experiments","omnitrack":"OmniTrack"};
  var base = "Giovanni Tauro, industrial designer and engineer";
  var mains = document.querySelectorAll("main[data-view]");

  function route(){
    var h = decodeURIComponent(location.hash.replace(/^#/, ""));
    var target = views.indexOf(h) > -1 ? h : "home";
    mains.forEach(function(m){ m.hidden = m.getAttribute("data-view") !== target; });
    if (target !== "home") {
      document.title = titles[target] + " | Giovanni Tauro";
      window.scrollTo(0, 0);
      var h1 = document.querySelector('main[data-view="' + target + '"] h1');
      if (h1) { h1.setAttribute("tabindex", "-1"); h1.focus({preventScroll:true}); }
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
