(function(){
  // the software and hardware each project used, as small icons with their names: under the title of each project
  // page, in the chapters of "Work by role", and in the sections marked with data-tools="…".
  // Icons from Simple Icons (CC0), in assets/img/tools/; a tool without an icon shows its name only.
  var TOOL = {
    tensorflow: ["TensorFlow Lite", 1], jupyter: ["Jupyter notebook", 1], python: ["Python", 1], arduino: ["Arduino", 1],
    ros: ["ROS 2", 1], espressif: ["ESP32-S3", 1], fastapi: ["FastAPI", 1], react: ["React", 1], mongodb: ["MongoDB", 1],
    r: ["R Shiny", 1], bluetooth: ["Bluetooth LE", 1], figma: ["Figma", 1], unity: ["Unity", 1], blender: ["Blender", 1],
    csharp: ["C#", 0], logitech: ["Logitech Gaming SDK", 0]
  };
  var PROJECT = {
    "omnitrack": "espressif bluetooth ros python fastapi react mongodb r",
    "phicube": "figma unity mongodb",
    "steering-wheel": "unity csharp logitech",
    "rehaballoon": "tensorflow jupyter python arduino",
    "balance-device": "arduino",
    "unity-experiments": "unity blender csharp",
    "blender-lesson": "blender",
    "arduino-lesson": "arduino"
  };
  function chips(list){
    var ks = (list || "").split(/\s+/).filter(function(k){ return TOOL[k]; });
    if (!ks.length) return "";
    return '<ul class="tools" aria-label="Tools">' + ks.map(function(k){
      return '<li translate="no">' + (TOOL[k][1] ? '<img src="assets/img/tools/' + k + '.svg" alt="" width="18" height="18">' : "") + TOOL[k][0] + "</li>";
    }).join("") + "</ul>";
  }
  window.SITE_TOOLS = { chips: function(project){ return chips(PROJECT[project]); } };
  Object.keys(PROJECT).forEach(function(id){
    var ph = document.querySelector('main[data-view="' + id + '"] .project-head');
    if (ph) ph.insertAdjacentHTML("beforeend", chips(PROJECT[id]));
  });
  document.querySelectorAll("section.step[data-tools]").forEach(function(s){
    var h = s.querySelector("h2"); if (h) h.insertAdjacentHTML("afterend", chips(s.getAttribute("data-tools")));
  });
})();
