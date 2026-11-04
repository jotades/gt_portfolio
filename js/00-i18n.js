(function(){
  // Italian version of the page. The HTML and the scripts are written in English; js/00-i18n-it.js maps each
  // English text to its Italian one. A "unit" is an element whose content is only text and inline markup
  // (a paragraph, a heading, a button): it is looked up by its whole innerHTML, so word order can change.
  // Anything else is looked up text node by text node. Numbers in a text can stand for {#} in the key.
  var root = document.documentElement, lang = window.SITE_LANG || "en";
  var D = window.I18N_IT || {}, COLLECT = window.I18N_COLLECT || null;
  var ATTRS = ["alt", "title", "aria-label", "placeholder"];
  var INLINE = /^(A|ABBR|B|BDI|BR|CITE|CODE|DFN|EM|I|KBD|MARK|Q|S|SMALL|SPAN|STRONG|SUB|SUP|TIME|U|VAR|WBR)$/;
  var PLAIN = /^(B|BR|EM|I|STRONG|SUB|SUP|SMALL|CODE|WBR)$/;
  var SKIP = /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|PRE)$/i;
  var NUM = /[-−+]?\d+(?:[.,]\d+)*/g, LETTERS = /[A-Za-z]/;
  var has = Object.prototype.hasOwnProperty;

  function norm(s){ return s.replace(/\s+/g, " ").trim(); }
  function viewOf(n){ var m = n && (n.nodeType === 1 ? n : n.parentNode); m = m && m.closest ? m.closest("main[data-view]") : null; return m ? m.getAttribute("data-view") : "shared"; }
  function t(s){
    var k = norm(s);
    if (!k || !LETTERS.test(k)) return null;
    if (has.call(D, k)) return D[k];
    var nums = [], p = k.replace(NUM, function(m){ nums.push(m); return "{#}"; });
    // numbers written by the scripts: 0.25 becomes 0,25 as in the Italian text around them
    if (nums.length && has.call(D, p)) { var i = 0; return D[p].replace(/\{#\}/g, function(){ var n = nums[i++] || ""; return /^[-−+]?\d+\.\d+$/.test(n) ? n.replace(".", ",") : n; }); }
    return null;
  }
  function seen(kind, k, node, dyn){ if (COLLECT && k && LETTERS.test(k)) COLLECT.push({ kind: kind, key: k, view: viewOf(node), dyn: !!dyn }); }

  function skipped(el){ return SKIP.test(el.tagName) || el.getAttribute("translate") === "no" || el.classList.contains("notranslate"); }
  // only text and inline markup below el, and some text of its own
  function isUnit(el, dyn){
    if (el.namespaceURI !== "http://www.w3.org/1999/xhtml" || skipped(el)) return false;
    var own = false;
    for (var c = el.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) { if (LETTERS.test(c.nodeValue)) own = true; }
      else if (c.nodeType === 1) { if (!inlineOnly(c, dyn)) return false; }
    }
    return own;
  }
  // once the scripts have run, they may hold on to the children: then only plain formatting may be replaced
  function inlineOnly(el, dyn){
    if (!INLINE.test(el.tagName) || skipped(el)) return false;
    if (dyn && (!PLAIN.test(el.tagName) || el.attributes.length)) return false;
    for (var c = el.firstElementChild; c; c = c.nextElementSibling) if (!inlineOnly(c, dyn)) return false;
    return true;
  }
  function doAttrs(el, dyn){
    for (var i = 0; i < ATTRS.length; i++) {
      var v = el.getAttribute(ATTRS[i]); if (!v) continue;
      if (COLLECT) { seen("attr", norm(v), el, dyn); continue; }
      var r = t(v); if (r != null && r !== v) el.setAttribute(ATTRS[i], r);
    }
  }
  function doText(n, dyn){
    var v = n.nodeValue; if (!LETTERS.test(v)) return;
    if (COLLECT) { seen("text", norm(v), n, dyn); return; }
    var r = t(v); if (r == null) return;
    var out = v.match(/^\s*/)[0] + r + v.match(/\s*$/)[0];
    if (out !== v) n.nodeValue = out;
  }
  function doUnit(el, dyn){
    var k = norm(el.innerHTML);
    if (COLLECT) { seen("unit", k, el, dyn); return; }
    var r = t(k); if (r != null && r !== k) el.innerHTML = r;
  }
  function walk(el, dyn){
    if (el.nodeType !== 1 || skipped(el)) return;
    doAttrs(el, dyn);
    if (isUnit(el, dyn)) { doUnit(el, dyn); for (var d = el.querySelectorAll("*"), i = 0; i < d.length; i++) doAttrs(d[i], dyn); return; }
    for (var c = el.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) doText(c, dyn); else if (c.nodeType === 1) walk(c, dyn);
    }
  }
  // a text node that changed: translate its parent if the parent is a unit, else the text alone
  function touch(n, dyn, done){
    var p = n.parentNode; if (!p || p.nodeType !== 1) return;
    if (p.closest && p.closest("script,style,pre,textarea,[translate=no],.notranslate")) return;
    if (isUnit(p, dyn)) { if (done.indexOf(p) < 0) { done.push(p); doUnit(p, dyn); } }
    else doText(n, dyn);
  }

  window.i18n = { lang: lang, t: function(s){ return lang === "it" ? (t(s) || s) : s; } };

  if (lang === "it" || COLLECT) {
    walk(document.body, false);
    if (!COLLECT) {
      var tt = t(document.title); if (tt) document.title = tt;
      var md = document.querySelector('meta[name="description"]'), mt = md && t(md.content); if (mt) md.content = mt;
    }
    // text the scripts write later: timelines, simulators, prototypes
    var obs = new MutationObserver(function(list){
      var done = [];
      list.forEach(function(m){
        if (m.type === "attributes") { if (m.target.nodeType === 1) doAttrs(m.target, true); return; }
        if (m.type === "characterData") { touch(m.target, true, done); return; }
        var tg = m.target;
        if (tg.nodeType === 1 && tg.tagName === "TITLE") { if (!COLLECT) { var r = t(tg.textContent); if (r && r !== tg.textContent) tg.textContent = r; } else seen("unit", norm(tg.textContent), tg, true); return; }
        if (!m.addedNodes.length || !tg.isConnected) return;
        if (tg.nodeType === 1 && isUnit(tg, true)) { if (done.indexOf(tg) < 0) { done.push(tg); doUnit(tg, true); } return; }
        for (var i = 0; i < m.addedNodes.length; i++) {
          var a = m.addedNodes[i];
          if (!a.isConnected) continue;
          if (a.nodeType === 3) touch(a, true, done); else if (a.nodeType === 1) walk(a, true);
        }
      });
      obs.takeRecords();   // the changes made here need no second look
    });
    obs.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  root.classList.remove("i18n-wait");

  // the IT / EN switch in the header: remembers the choice and reloads in the other language
  document.querySelectorAll("[data-set-lang]").forEach(function(b){
    var l = b.getAttribute("data-set-lang");
    b.setAttribute("aria-pressed", String(l === lang));
    b.addEventListener("click", function(){
      if (l === lang) return;
      var stored = false, param = /[?&]lang=(it|en)\b/.test(location.search);
      try { localStorage.setItem("lang", l); stored = localStorage.getItem("lang") === l; } catch (e) {}
      try { sessionStorage.setItem("lang-scroll", String(window.scrollY)); } catch (e) {}
      if (stored && !param) { location.reload(); return; }
      // no storage (a private window, a sandbox): the language goes in the address instead
      var search = param ? location.search.replace(/([?&])lang=(it|en)\b/, "$1lang=" + l) : (location.search ? location.search + "&" : "?") + "lang=" + l;
      location.href = location.pathname + search + location.hash;
    });
  });
  // back to where the reader was before switching
  try {
    var y = sessionStorage.getItem("lang-scroll");
    if (y != null) { sessionStorage.removeItem("lang-scroll"); window.addEventListener("load", function(){ window.scrollTo(0, +y); }); }
  } catch (e) {}
})();
