(function(){
  // "Work by role": a report for a kind of job (or a sector), one chapter per project. Each chapter says what the
  // project was and the problem it tackled, and why it is here for that role; then comes the project's digital
  // prototype (or its main picture), then its sections that matter for the role, complete with figures and charts.
  // The prototype and the sections are moved here from the project page while the report is open, so the
  // interactive ones keep working, and they go back to their page when the reader leaves.
  // #for/product, #for/eng, #for/design, #for/industrial, or a sector: #for/s-own, s-iot, s-data, s-ux, s-research, s-make.
  // ?focus=product in a link opens the report on that role.
  var page = document.querySelector('main[data-view="for"]'); if (!page) return;
  var T = function(s){ return window.i18n ? window.i18n.t(s) : s; };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // every project: its year, and what it was together with the problem it tackled
  var PROJECTS = {
    "omnitrack": ["2023–26", "OmniTrack is my PhD: an IoT platform that locates people indoors with ultra-wideband radio and turns their movement into light, sound and vibration. The problem it tackles: learning a route and finding landmarks indoors without relying on sight."],
    "phicube": ["2024", "PhiCube is a cube-shaped rehabilitation device; its app lets therapists set up each patient’s therapy and patients train by playing games. The problem: one interface that works for both, and stays calm for patients in therapy."],
    "washb": ["2020", "WashB, my MSc thesis, is a mouthpiece that cleans teeth with ultrasound. The problem: a good clean still depends on how skilfully, and how often, people brush."],
    "steering-wheel": ["2022–23", "Rip@rto is a driving simulator that assesses the driving capabilities of people with disability. The problem: measuring each ability on its own, with forces on the wheel that are known rather than guessed."],
    "rehaballoon": ["2023", "RehaBalloon, built in a 24-hour hackathon, is a balloon that coaches hand rehabilitation. The problem: people repeat their exercises at home without knowing whether they are doing them right."],
    "balance-device": ["2022", "A knee wearable that counts and times one-leg balance exercises after a stroke, built by a team of three in two weeks. The problem: training the weaker leg regularly, without depending on someone else to count."],
    "red-6-3": ["2019", "RED 6.3 is a robot that charges shared e-scooters where they are parked. The problem: for a sharing service, a scooter with a flat battery is a scooter nobody can rent."],
    "spacer": ["2018", "Spacer redesigns the classic Moulinex blade grinder for coffee and spices. The problem: small quantities come out uneven, because the bowl does not adapt to the amount."],
    "d-baseplate": ["2018", "D. is a steel spring baseplate for skateboard trucks. The problem: a lighter truck that absorbs shocks better, at a thickness that stays safe."]
  };

  // what opens each chapter: the project's digital prototype, or its main picture when it has none
  var TOP = { "omnitrack": "#ot-sim", "phicube": "#pc-proto", "washb": "#wb-app", "steering-wheel": "#sw-sim", "rehaballoon": "#sim", "balance-device": "#bal-sim", "red-6-3": "#rd-app", "spacer": ".project-hero", "d-baseplate": ".project-hero" };

  // for each role and sector: the projects in order, the sections of each to show, and why the project is here
  var GROUPS = {
    product: [
      ["phicube", [1, 3], "Here because it shows how I hand a product over to development: every screen specified with its behaviour, and the states designed in Figma carried into the app."],
      ["omnitrack", [2, 5, 1], "Here because I owned it end to end: a tool built around the operators who run the sessions, and validation with users under ethics approval."],
      ["steering-wheel", [1, 3], "Here because it turns a broad goal into tests that each measure one thing, and shows a technology decision taken under a hard constraint."],
      ["washb", [1, 2], "Here because it starts from discovery: research and a survey first, then four requirements that judged every design decision."]
    ],
    eng: [
      ["omnitrack", [1, 3, 4, 5], "Here for the whole technical chain: hardware, firmware and ROS 2, a calibration chosen on held-out error, and the analysis of the data."],
      ["rehaballoon", [3, 2, 5], "Here for machine learning at the edge: a model trained on recorded sensor data that runs on the board itself."],
      ["steering-wheel", [4, 6, 3], "Here for measurement: the hardware did not report torque, so I built a calibration that turns its raw values into newton-metres."],
      ["balance-device", [3, 4], "Here for sensor logic kept to the minimum: two sensors that tell a good repetition from a bad one."]
    ],
    design: [
      ["washb", [1, 3, 5], "Here because research shaped the brief before any sketch, and the product reaches its user through an app."],
      ["omnitrack", [2, 5], "Here for an interface for expert users with a dense, multi-step workflow, and a study run with users."],
      ["phicube", [2, 1], "Here for a visual system built for one audience, patients in therapy, and documentation that tells developers how each screen behaves."],
      ["balance-device", [2, 4], "Here for the process: a persona and a problem story set what the prototype had to do, and it was built and tested within two weeks."],
      ["red-6-3", [1, 4], "Here for framing: the problem defined before the product, and the service seen from the rider’s side."],
      ["steering-wheel", [2], "Here for a tool that lets the test scenarios be built out of simple, configurable blocks."]
    ],
    industrial: [
      ["washb", [3, 6], "Here for a product resolved down to its engineering: ultrasonic transducers, a medical-grade material and an FEM check."],
      ["d-baseplate", [2, 5], "Here for material selection, and FEM used to choose a safe thickness and compare three shapes."],
      ["spacer", [1, 4], "Here for the analysis of an existing product, and an assembly detailed for production."],
      ["red-6-3", [3, 5], "Here for a machine designed from its volumes down to its charging mechanism."],
      ["rehaballoon", [5], "Here for design for reuse: a cheap, replaceable balloon and a durable electronics core."],
      ["balance-device", [4], "Here for a wearable prototype built and tested in a week."]
    ],
    "s-own": [
      ["omnitrack", [2, 5], "Here because the operators’ needs set the dashboard, and a study with users validated the system."],
      ["phicube", [1, 3], "Here because the specification pairs every screen with its behaviour, and that is what the app does."],
      ["washb", [1, 2], "Here because discovery came first, and four requirements guided every decision."],
      ["steering-wheel", [1, 3], "Here for scoping: driving split into measurable tests, and a technology choice that unblocked the project."],
      ["red-6-3", [1, 2], "Here for a service problem framed first, then turned into six requirements."],
      ["balance-device", [2, 5], "Here for a plan built around a persona, and next steps set for patient and therapist."]
    ],
    "s-iot": [
      ["omnitrack", [1, 4], "Here for the architecture from the wearable to the data, and the feedback it drives in real time."],
      ["rehaballoon", [3, 2, 5, 6], "Here for a sensor inside a balloon whose data trained a model that runs on the board, its wiring and power, and an electronics core designed to be reused."],
      ["steering-wheel", [3, 6], "Here for connecting a direct-drive wheel base to Unity, and converting its raw values."],
      ["balance-device", [3, 4], "Here for two sensors, and the wearable built around them."],
      ["washb", [6, 5], "Here for an ultrasonic device and the app paired with it."],
      ["red-6-3", [5], "Here for a charging contact that closes only on the right pins."]
    ],
    "s-data": [
      ["omnitrack", [3, 5, 6], "Here for a calibration chosen on held-out error, data from a study, and results read within their limits."],
      ["rehaballoon", [3], "Here for a neural network trained on recorded sensor data."],
      ["steering-wheel", [4, 6], "Here for a torque calibration built from known weights."],
      ["d-baseplate", [2, 5], "Here for an FEM model, and stiffness compared across three shapes."],
      ["balance-device", [3], "Here for the logic that turns two sensor signals into a judgement on each repetition."]
    ],
    "s-ux": [
      ["omnitrack", [2, 4], "Here for the operators’ dashboard, and feedback designed so that each signal can be told apart."],
      ["phicube", [2, 1, 3], "Here for the patients’ interface, from its visual language to the working app."],
      ["washb", [5], "Here for the companion app."],
      ["red-6-3", [4], "Here for the rider’s side of the service."],
      ["steering-wheel", [2], "Here for a scenario builder made of configurable blocks."]
    ],
    "s-research": [
      ["omnitrack", [5, 6], "Here for a study with sixteen blind and visually impaired adults, and a careful reading of its results."],
      ["washb", [1], "Here for a benchmark and a survey that shaped the brief."],
      ["balance-device", [2], "Here for a persona and a problem story."],
      ["red-6-3", [1], "Here for framing the problem before the product."],
      ["spacer", [1], "Here for the analysis of an existing grinder."],
      ["steering-wheel", [1], "Here for tests that each measure one driving ability."]
    ],
    "s-make": [
      ["washb", [3, 6], "Here for a product taken from concept to engineering, with its material checked by FEM."],
      ["red-6-3", [3, 5], "Here for a machine designed from its volumes down to its charging contact."],
      ["spacer", [3, 4], "Here for a concept and its full assembly, detailed for production."],
      ["d-baseplate", [1, 5], "Here for a part shaped with FEM."],
      ["rehaballoon", [5], "Here for a reusable core and a replaceable cover."],
      ["balance-device", [4], "Here for a wearable prototype built in a week."]
    ]
  };
  var NOTE = {
    product: "For product owner and product manager roles: requirements, technology choices, tools for operators and studies with users.",
    eng: "For R&D, IoT and data roles: architecture, calibration, measured error and models on sensor data.",
    design: "For product design and research roles: discovery, personas, visual language and interfaces for experts.",
    industrial: "For industrial design roles: concept, engineering, materials, FEM and assemblies.",
    "s-own": "From what users need to requirements, priorities and a product in use.",
    "s-iot": "Sensors, firmware, radio links and the path from the device to the dashboard.",
    "s-data": "Calibration, measured error, studies and the numbers that say whether it works.",
    "s-ux": "Dashboards, apps and tools for operators, therapists and patients.",
    "s-research": "Studies with patients, clinicians and users, and what they changed.",
    "s-make": "Form, CAD, FEM, materials and how a product gets made."
  };

  var report = page.querySelector(".rp"), toc = page.querySelector(".rp-toc ol"), note = page.querySelector(".for-note");
  var head = document.querySelector(".site-head"), cur = "";
  function esc(s){ return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

  // moving a block here leaves a marker in its place; putting everything back follows the markers, last moved first
  var moved = [];
  function move(el, into){ var mark = document.createComment("work-by-role"); el.parentNode.insertBefore(mark, el); into.appendChild(el); moved.push([el, mark]); }
  function restore(){ while (moved.length) { var m = moved.pop(); if (m[1].parentNode) m[1].parentNode.replaceChild(m[0], m[1]); } }

  function chapter(g, i){
    var id = g[0], main = document.querySelector('main[data-view="' + id + '"]'); if (!main || !PROJECTS[id]) return null;
    var name = ((main.querySelector(".project-head h1") || {}).textContent || id).trim();
    var ch = document.createElement("article");
    ch.className = "rp-ch"; ch.id = "rp-" + id;
    var accent = main.style.getPropertyValue("--accent"); if (accent) ch.style.setProperty("--accent", accent);
    ch.innerHTML = '<header class="rp-head"><span class="rp-k">' + (i < 9 ? "0" : "") + (i + 1) + '</span><h2>' + esc(name) + '</h2><span class="rp-year">' + PROJECTS[id][0] + "</span></header>" +
      '<p class="rp-intro">' + esc(T(PROJECTS[id][1])) + "</p>" + (g[2] ? '<p class="rp-why">' + esc(T(g[2])) + "</p>" : "") +
      (window.SITE_TOOLS ? window.SITE_TOOLS.chips(id) : "") + '<div class="rp-top"></div><div class="rp-secs"></div>';
    var top = TOP[id] && main.querySelector(TOP[id]);
    if (top) move(top, ch.querySelector(".rp-top")); else ch.querySelector(".rp-top").remove();
    var secs = ch.querySelector(".rp-secs");
    g[1].forEach(function(k){
      main.querySelectorAll("section.step").forEach(function(s){ var n = s.querySelector("h2 .n"); if (n && n.textContent.trim() === String(k) && s.parentNode !== secs) move(s, secs); });
    });
    return { el: ch, name: name };
  }
  // a link can narrow a report to some projects, and to some of their sections, in the order given:
  // #for/product/omnitrack+phicube keeps the sections set for the role; #for/eng/omnitrack.1.3+rehaballoon.3 sets them.
  // A project that is not part of the role can be added too: it comes without the "why it is here" note.
  function pick(key, sel){
    var base = GROUPS[key] || [];
    if (!sel) return base;
    return sel.split("+").map(function(it){
      var p = it.split("."), id = p[0], g = null;
      if (!PROJECTS[id]) return null;
      base.forEach(function(b){ if (b[0] === id) g = b; });
      var secs = p.slice(1).map(Number).filter(function(n){ return n > 0; });
      return [id, secs.length ? secs : (g ? g[1] : []), g ? g[2] : ""];
    }).filter(Boolean);
  }
  function render(key, sel){
    restore();
    cur = key + "/" + (sel || "");
    report.innerHTML = ""; toc.innerHTML = "";
    var chs = pick(key, sel).map(chapter).filter(Boolean);
    // a selection sent in a link: no filters, just the chosen chapters and a way to the whole report
    page.classList.toggle("is-picked", !!sel);
    var all = page.querySelector(".rp-all"); all.hidden = !sel; all.querySelector("a").setAttribute("href", "#for/" + key);
    chs.forEach(function(c, i){
      report.appendChild(c.el);
      toc.insertAdjacentHTML("beforeend", '<li><button type="button" data-ch="' + i + '"><span class="rp-k">' + (i < 9 ? "0" : "") + (i + 1) + "</span>" + esc(c.name) + "</button></li>");
    });
    note.textContent = chs.length + " projects. " + NOTE[key];
    page.querySelectorAll("[data-for]").forEach(function(b){ b.setAttribute("aria-pressed", String(b.getAttribute("data-for") === key)); });
    // the moved demos measure themselves when their size changes
    window.dispatchEvent(new Event("resize"));
  }
  // the contents list jumps to a chapter, below the sticky header
  toc.addEventListener("click", function(e){
    var b = e.target.closest("[data-ch]"); if (!b) return;
    var ch = report.children[+b.getAttribute("data-ch")]; if (!ch) return;
    window.scrollTo({ top: ch.getBoundingClientRect().top + window.scrollY - (head ? head.offsetHeight : 0) - 16, behavior: reduce ? "auto" : "smooth" });
  });

  // the address says which role or sector; choosing another one updates it without leaving the page
  page.querySelectorAll("[data-for]").forEach(function(b){
    b.addEventListener("click", function(){
      var k = b.getAttribute("data-for");
      if (history.replaceState) history.replaceState(null, "", "#for/" + k);
      render(k, "");
    });
  });
  function fromHash(){
    var m = /^#for(?:\/([a-z-]+))?(?:\/([a-z0-9.+-]+))?$/.exec(decodeURIComponent(location.hash)); if (!m) return;
    var k = m[1] && GROUPS[m[1]] ? m[1] : (cur ? cur.split("/")[0] : "product"), sel = m[1] && GROUPS[m[1]] ? (m[2] || "") : "";
    if (k + "/" + sel !== cur || !report.firstElementChild) { render(k, sel); window.scrollTo(0, 0); }
  }
  // leaving the report: every block goes back to its project page, before the router looks for a section there
  window.addEventListener("hashchange", function(){
    if (/^#for(\/|$)/.test(location.hash) || !moved.length) return;
    restore(); report.innerHTML = ""; toc.innerHTML = ""; cur = "";
  }, true);
  window.addEventListener("hashchange", fromHash);
  var focus = /[?&]focus=([a-z]+)/.exec(location.search);
  if (focus && GROUPS[focus[1]] && !/^s-/.test(focus[1]) && !location.hash) location.replace("#for/" + focus[1]);
  else fromHash();
})();
