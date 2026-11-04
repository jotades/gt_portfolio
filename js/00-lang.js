(function(){
  // picks the language before the page is drawn: ?lang= in the address, then the visitor's choice, then the browser
  var lang = "", q = /[?&]lang=(it|en)\b/.exec(location.search);
  if (q) lang = q[1];
  if (!lang) { try { lang = localStorage.getItem("lang") || ""; } catch (e) {} }
  if (lang !== "it" && lang !== "en") {
    var prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
    lang = /^it\b/i.test(prefs[0] || "") ? "it" : "en";
  }
  window.SITE_LANG = lang;
  var root = document.documentElement;
  root.lang = lang;
  // the page is written in English: in Italian it stays hidden until js/00-i18n.js has translated it
  // the hero title is typed out by js/26-type.js: hide it until then, so it doesn't flash in full first
  if (!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    root.className += " tw-wait";
    setTimeout(function(){ root.classList.remove("tw-wait"); }, 3000);
  }
  if (lang === "it") {
    root.className += " i18n-wait";
    setTimeout(function(){ root.classList.remove("i18n-wait"); }, 4000);
  }
})();
