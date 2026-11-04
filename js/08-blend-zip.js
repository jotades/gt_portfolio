(function(){
  var btn = document.querySelector('[data-dl="blend"]'), msg = document.querySelector(".dl-msg");
  if (!btn) return;
  var name = "Die_baking.zip", dl = null;
  if (window.claude && window.claude.use) window.claude.use("downloads").then(function(d){ dl = d; }).catch(function(){});
  function blob(){
    var b = atob(document.getElementById("blend-zip").textContent.trim()), a = new Uint8Array(b.length);
    for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i);
    return new Blob([a], { type: "application/zip" });
  }
  btn.addEventListener("click", function(){
    msg.textContent = "";
    if (dl) {
      dl.save({ filename: name, data: blob() }).then(function(){ msg.textContent = ""; }).catch(function(e){
        if (e && e.code === "declined") return;
        msg.textContent = "The download isn’t available here.";
      });
      return;
    }
    try {
      var u = URL.createObjectURL(blob()), a = document.createElement("a");
      a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){ URL.revokeObjectURL(u); }, 4000);
    } catch (err) { msg.textContent = "The download isn’t available here."; }
  });
})();
