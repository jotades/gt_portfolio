(function(){
  var root = document.getElementById("sk"); if (!root) return;
  var sec = document.getElementById("passions"), cv = root.querySelector("canvas"), ctx = cv.getContext("2d"), help = sec.querySelector('[data-sk="help"]');
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // ---------- pixel sprites ("#" = ink), drawn from scratch
  var RIDER = {
    a: ["......#####.......","......########....","......#####.......","......#####.......",".......###........",".....#######......","....##.###.##.....","...##..###..##....",".......###........",".......###........","......#...#.......",".....#.....#......","....##.....##....."],
    b: ["......#####.......","......########....","......#####.......","......#####.......",".......###........",".....#######......",".....#.###.#......",".....#.###.#......",".......###........",".......###........","......#..#........",".....#....#.......","....##....##......"],
    jump: ["......#####.......","......########....","..#...#####...#...","...#..#####..#....","....#######.......",".......###........",".......###........","......#####.......",".....##...##......",".....#.....#......"],
    tuck: ["..........#####...","..........########","........#######...","....##########....","...##..#####......","......#.....#.....",".....##.....##...."]
  };
  var BOARD = { skate: ["..##############..","...##........##..."], snow: [".################.","..##############.."] };
  var OBS = {
    cone: ["....#....","...###...","...###...","..#...#..","..#####..","..#####..",".#.....#.",".#######.",".#######.","#########","#########"],
    bin: ["###########","###########",".#########.",".#.#.#.#.#.",".#.#.#.#.#.",".#.#.#.#.#.",".#.#.#.#.#.",".#.#.#.#.#.",".#.#.#.#.#.",".#.#.#.#.#.",".#########.",".#########."],
    bench: ["########################","########################","........................","########################","########################","..##................##..","..##................##..","..##................##..","..##................##.."],
    rail: ["##################################","##################################","..##...........##.............##..","..##...........##.............##..","..##...........##.............##..","..##...........##.............##..","..##...........##.............##..","..##...........##.............##.."],
    crack: ["..##########..",".############."],
    sign: ["####################","#..................#","#.###..###..###..#.#","#.###..###..###..#.#","#..................#","####################"],
    pigeon1: ["......##.......",".....###.......","....####.......",".##########....","#############..","..##########...","......##......."],
    pigeon2: ["...............","...............",".##########....","#############..","..##########...","....####.......",".....###......."],
    rock: ["....####....","..########..",".##########.","############","############"],
    pine: [".....#.....","....###....","...#####...","....###....","...#####...","..#######..","....###....","..#######..",".#########.","###########",".....#.....",".....#.....","....###...."],
    snowman: ["....###....","...#####...","...#.#.#...","....###....","...#####...","..#..#..#..","..#######..",".#########.","#....#....#","#.........#",".#########.","..#######.."],
    chair: ["......##..........","......##..........","##########........","#........#........","#........#........","#........#########","#.................","##################"],
    cloud: [".........#####.........",".......##.....##.......","..####.#........###....",".#....#............##..","#.....................#","#######################"]
  };
  var FONT = { "0":["###","#.#","#.#","#.#","###"],"1":[".#.","##.",".#.",".#.","###"],"2":["###","..#","###","#..","###"],"3":["###","..#",".##","..#","###"],"4":["#.#","#.#","###","..#","..#"],"5":["###","#..","###","..#","###"],"6":["###","#..","###","#.#","###"],"7":["###","..#",".#.",".#.",".#."],"8":["###","#.#","###","#.#","###"],"9":["###","#.#","###","..#","###"],
    A:["###","#.#","###","#.#","#.#"],B:["##.","#.#","##.","#.#","##."],C:["###","#..","#..","#..","###"],D:["##.","#.#","#.#","#.#","##."],E:["###","#..","##.","#..","###"],F:["###","#..","##.","#..","#.."],G:["###","#..","#.#","#.#","###"],H:["#.#","#.#","###","#.#","#.#"],I:["###",".#.",".#.",".#.","###"],K:["#.#","##.","#..","##.","#.#"],L:["#..","#..","#..","#..","###"],M:["#...#","##.##","#.#.#","#...#","#...#"],N:["#..#","##.#","#.##","#..#","#..#"],O:["###","#.#","#.#","#.#","###"],P:["###","#.#","###","#..","#.."],R:["##.","#.#","##.","#.#","#.#"],S:["###","#..","###","..#","###"],T:["###",".#.",".#.",".#.",".#."],U:["#.#","#.#","#.#","#.#","###"],V:["#.#","#.#","#.#","#.#",".#."],W:["#...#","#...#","#.#.#","##.##","#...#"],Y:["#.#","#.#",".#.",".#.",".#."]," ":["...","...","...","...","..."] };
  function pad(rows, n){ var p = new Array(n + 1).join("."); return rows.map(function(r){ return p + r + p; }); }
  function rider(frame, board){ return RIDER[frame].concat(BOARD[board]); }
  // ---------- canvas, 2 screen pixels per game pixel
  var S = 3, LW = 300, LH = 70, GROUND = 60, INK = "#535353", BG = "#f7f7f7", dpr = 1;
  function size(){ var r = cv.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1); LW = Math.max(120, Math.floor(r.width / S)); cv.width = Math.round(LW * S * dpr); cv.height = Math.round(LH * S * dpr); ctx.setTransform(S * dpr, 0, 0, S * dpr, 0, 0); ctx.imageSmoothingEnabled = false; draw(); }
  function sprite(rows, x, y, col){ ctx.fillStyle = col || INK; x = Math.round(x); y = Math.round(y); for (var j = 0; j < rows.length; j++) { var r = rows[j]; for (var i = 0; i < r.length; i++) if (r.charCodeAt(i) === 35) ctx.fillRect(x + i, y + j, 1, 1); } }
  function text(str, x, y, sc, col, align){ sc = sc || 1; var w = 0, chars = String(str).toUpperCase().split(""); chars.forEach(function(c){ w += ((FONT[c] || FONT[" "])[0].length + 1) * sc; }); if (align === "center") x -= w / 2; else if (align === "right") x -= w; ctx.fillStyle = col || INK; chars.forEach(function(c){ var g = FONT[c] || FONT[" "]; for (var j = 0; j < 5; j++) for (var i = 0; i < g[j].length; i++) if (g[j][i] === "#") ctx.fillRect(Math.round(x + i * sc), Math.round(y + j * sc), sc, sc); x += (g[0].length + 1) * sc; }); }
  // ---------- boards
  var CFG = {
    skate: { v0: 270, start: 130, max: 330, help: "<kbd>Space</kbd> or <kbd>↑</kbd> to ollie, hold for a higher one · <kbd>↓</kbd> to tuck under pigeons · <kbd>P</kbd> to pause",
      pool: function(p){ var a = ["cone", "cone", "bin", "bench"]; if (p > 150) a.push("cones", "rail"); if (p > 300) a.push("pigeonLow"); if (p > 500) a.push("pigeonHigh"); return a; } },
    snow: { v0: 225, start: 175, max: 400, help: "<kbd>Space</kbd> or <kbd>↑</kbd> to jump rocks, trees and snowmen, hold for a bigger air · <kbd>↓</kbd> to duck under lift chairs and crows · <kbd>P</kbd> to pause",
      pool: function(p){ var a = ["rock", "rock", "pine", "snowman"]; if (p > 150) a.push("chair"); if (p > 300) a.push("pigeonHigh", "chair"); if (p > 450) a.push("pigeonLow"); return a; } }
  };
  var board = "skate"; try { board = localStorage.getItem("skate-board") || "skate"; } catch (e) {}
  if (!CFG[board]) board = "skate";
  function best(){ try { return +localStorage.getItem("skate-best-" + board) || 0; } catch (e) { return 0; } }
  // ---------- state
  var state = "ready", sp, pts, obs, gap, me, clouds, keys = { jump: false, duck: false }, last = 0, paused = false, visible = true, tAnim = 0, overT = 0;
  function reset(){ sp = CFG[board].start; pts = 0; obs = []; gap = 160; me = { x: 22, y: 0, vy: 0, air: false }; clouds = [{ x: LW * 0.3, y: 10 }, { x: LW * 0.75, y: 20 }]; overT = 0; }
  reset();
  function newObs(){
    var pool = CFG[board].pool(pts), k = pool[Math.floor(Math.random() * pool.length)], o = { k: k, x: LW + 10, f: 0 };
    if (k === "cones") { o.rows = OBS.cone; o.n = 2; o.w = 19; o.h = 11; o.y = GROUND - 11; }
    else if (k === "pigeonLow" || k === "pigeonHigh") { o.rows = OBS.pigeon1; o.w = 15; o.h = 7; o.y = k === "pigeonLow" ? GROUND - 9 : GROUND - 18; o.fly = true; }
    else if (k === "sign") { o.rows = OBS.sign; o.w = 20; o.h = 6; o.y = GROUND - 17; o.hang = true; }
    else if (k === "chair") { o.rows = OBS.chair; o.w = 18; o.h = 8; o.y = GROUND - 19; o.cable = true; }
    else { o.rows = OBS[k]; o.w = o.rows[0].length; o.h = o.rows.length; o.y = GROUND - o.h + (k === "crack" ? 1 : 0); }
    obs.push(o); gap = sp * 0.55 + Math.random() * sp * 0.9 + (o.w > 25 ? 20 : 0);
  }
  function riderBox(){
    var frame = me.air ? "jump" : keys.duck ? "tuck" : "a", rows = rider(frame, board), h = rows.length, w = rows[0].length;
    var top = GROUND - h + Math.round(me.y);
    return { rows: rows, x: me.x, y: top, w: w, h: h, frame: frame };
  }
  function hit(a, o){ var ax = a.x + 3, aw = a.w - 6, ay = a.y + 1, ah = a.h - 2, ox = o.x + 1, ow = (o.n ? o.w : o.w) - 2, oy = o.y + 1, oh = o.h - 1; return ax < ox + ow && ax + aw > ox && ay < oy + oh && ay + ah > oy; }
  function jump(){ if (!me.air) { me.vy = -CFG[board].v0; me.air = true; } }
  function step(dt){
    tAnim += dt;
    if (state === "over") { overT += dt; return; }
    if (state !== "running") return;
    sp = Math.min(CFG[board].max, sp + (board === "snow" ? 6 : 4.5) * dt); pts += sp * dt / 14;
    var g = 1100; if (me.vy < 0 && keys.jump) g = 650; if (keys.duck && me.air) g = 3200;
    me.vy += g * dt; me.y += me.vy * dt; if (me.y >= 0) { me.y = 0; me.vy = 0; me.air = false; }
    obs.forEach(function(o){ o.x -= sp * dt * (o.fly ? 1.12 : 1); o.f += dt; }); obs = obs.filter(function(o){ return o.x > -40; });
    clouds.forEach(function(c){ c.x -= sp * dt * 0.15; }); clouds = clouds.filter(function(c){ return c.x > -30; }); if (clouds.length < 3 && Math.random() < dt * 0.5) clouds.push({ x: LW + 10, y: 6 + Math.random() * 18 });
    gap -= sp * dt; if (gap <= 0) newObs();
    var rb = riderBox();
    for (var i = 0; i < obs.length; i++) if (hit(rb, obs[i])) { state = "over"; var s = Math.floor(pts); if (s > best()) { try { localStorage.setItem("skate-best-" + board, String(s)); } catch (e) {} } break; }
  }
  var SNOWY = 44, SLOPE = 0.075;
  function gy(x){ return board === "snow" ? Math.round(SNOWY + (x - me.x) * SLOPE) : GROUND; }
  function night(){ var p = Math.floor(pts); return p > 0 && (p % 700) > 500; }
  function draw(){
    var nt = night(), bg = nt ? "#202124" : BG, ink = nt ? "#d8d8d8" : INK;
    ctx.fillStyle = bg; ctx.fillRect(0, 0, LW, LH);
    clouds.forEach(function(c){ sprite(OBS.cloud, c.x, c.y, nt ? "#5f6368" : "#d6d6d6"); });
    if (board === "snow") { ctx.fillStyle = nt ? "#9aa0a6" : "#c4c4c4"; for (var f = 0; f < 40; f++) { var fx = ((f * 53 + tAnim * (8 + f % 5) * (reduce ? 0 : 1)) % (LW + 10)) | 0, fy = ((f * 29 + tAnim * (12 + f % 7) * (reduce ? 0 : 1)) % GROUND) | 0; ctx.fillRect(LW - fx, fy, 1, 1); } }
    if (board === "snow") { ctx.fillStyle = nt ? "#3c4043" : "#e6e6e6"; var mo = (pts * 3) % 160; for (var mx = 0; mx < LW; mx++) { var u = ((mx + mo) % 160) - 80, hgt = Math.max(0, Math.round(20 - Math.abs(u) * 0.45)); if (hgt) ctx.fillRect(mx, gy(mx) - hgt - 6, 1, hgt); } }
    // ground with bumps and pebbles
    ctx.fillStyle = ink;
    if (board === "snow") { for (var sx = 0; sx < LW; sx++) ctx.fillRect(sx, gy(sx), 1, 1); }
    else ctx.fillRect(0, GROUND, LW, 1);
    var off = Math.floor((pts * 14) % 40);
    for (var x = -off; x < LW; x += 40) { ctx.fillRect(x + 6, gy(x + 6) + 3, 2, 1); ctx.fillRect(x + 21, gy(x + 21) + 5, 1, 1); ctx.fillRect(x + 33, gy(x + 33) + 2, 3, 1); if (board !== "snow") ctx.fillRect(x + 14, GROUND - 1, 3, 1); }
    obs.forEach(function(o){
      var oy = o.y - GROUND + gy(o.x + o.w / 2);
      if (o.hang) { ctx.fillStyle = ink; ctx.fillRect(Math.round(o.x) + 3, 0, 1, oy); ctx.fillRect(Math.round(o.x) + o.w - 4, 0, 1, oy); }
      if (o.cable) { ctx.fillStyle = ink; ctx.fillRect(Math.round(o.x) + 6, 0, 2, oy); }
      if (o.n) { sprite(o.rows, o.x, oy, ink); sprite(o.rows, o.x + 10, oy, ink); }
      else sprite(o.fly ? (Math.floor(o.f * 6) % 2 ? OBS.pigeon2 : OBS.pigeon1) : o.rows, o.x, oy, ink);
    });
    var rb = riderBox(), rows = rb.rows;
    if (state === "running" && !me.air && !keys.duck && !reduce && Math.floor(tAnim * 8) % 2) rows = rider("b", board);
    if (state === "over") { rows = rider("tuck", board); }
    sprite(rows, rb.x, gy(me.x + 9) - rows.length + Math.round(me.y), ink);
    // score: HI best, then current, like the original
    var cur = ("00000" + Math.floor(pts)).slice(-5), hi = ("00000" + best()).slice(-5);
    text("HI " + hi + "  " + cur, LW - 5, 4, 1, ink, "right");
    if (state === "ready") { text(board === "snow" ? "SNOWBOARD" : "SKATEBOARD", LW / 2, 16, 2, ink, "center"); text("PRESS SPACE OR TAP TO START", LW / 2, 32, 1, ink, "center"); }
    if (state === "over") { text("GAME OVER", LW / 2, 16, 2, ink, "center"); text("SPACE OR TAP TO RETRY", LW / 2, 32, 1, ink, "center"); }
    if (paused && state === "running") text("PAUSED", LW / 2, 22, 2, ink, "center");
  }
  function loop(now){
    if (state !== "running") { draw(); return; }
    if (paused || !visible) { last = 0; draw(); return; }
    var dt = last ? Math.min(0.033, (now - last) / 1000) : 0; last = now;
    step(dt); draw(); requestAnimationFrame(loop);
  }
  function start(){ reset(); state = "running"; last = 0; paused = false; requestAnimationFrame(loop); }
  function pressJump(){
    if (paused) { paused = false; last = 0; requestAnimationFrame(loop); return; }
    if (state === "ready") return start();
    if (state === "over") { if (overT > 0.35) start(); return; }
    jump();
  }
  // ---------- input
  function down(k){ if (k === "jump") { if (!keys.jump) { keys.jump = true; pressJump(); } } else keys.duck = true; }
  function up(k){ keys[k] = false; }
  cv.addEventListener("keydown", function(e){
    if (e.key === " " || e.key === "ArrowUp") { e.preventDefault(); down("jump"); }
    else if (e.key === "ArrowDown") { e.preventDefault(); down("duck"); }
    else if (e.key === "p" || e.key === "P") { if (state === "running") { paused = !paused; if (!paused) { last = 0; requestAnimationFrame(loop); } else draw(); } }
  });
  cv.addEventListener("keyup", function(e){ if (e.key === " " || e.key === "ArrowUp") up("jump"); else if (e.key === "ArrowDown") up("duck"); });
  cv.addEventListener("pointerdown", function(e){ e.preventDefault(); cv.focus(); down("jump"); });
  ["pointerup", "pointercancel", "pointerleave"].forEach(function(ev){ cv.addEventListener(ev, function(){ up("jump"); }); });
  sec.querySelectorAll("[data-sk=jump],[data-sk=duck]").forEach(function(b){ var k = b.getAttribute("data-sk"); b.addEventListener("pointerdown", function(e){ e.preventDefault(); down(k); }); ["pointerup", "pointercancel", "pointerleave"].forEach(function(ev){ b.addEventListener(ev, function(){ up(k); }); }); });
  cv.addEventListener("blur", function(){ keys.jump = keys.duck = false; if (state === "running") { paused = true; draw(); } });
  if ("IntersectionObserver" in window) new IntersectionObserver(function(en){ visible = en[0].isIntersecting; if (visible && state === "running" && !paused) { last = 0; requestAnimationFrame(loop); } }).observe(cv);
  document.addEventListener("visibilitychange", function(){ if (document.hidden && state === "running") { paused = true; draw(); } });
  // ---------- board choice
  function setBoard(b){ board = b; try { localStorage.setItem("skate-board", b); } catch (e) {} sec.querySelectorAll("[data-board]").forEach(function(o){ o.setAttribute("aria-pressed", String(o.getAttribute("data-board") === b)); }); help.innerHTML = CFG[b].help; state = "ready"; paused = false; reset(); draw(); }
  sec.querySelectorAll("[data-board]").forEach(function(b){ b.addEventListener("click", function(){ setBoard(b.getAttribute("data-board")); cv.focus(); }); });
  window.addEventListener("resize", size);
  setBoard(board); size();
})();
