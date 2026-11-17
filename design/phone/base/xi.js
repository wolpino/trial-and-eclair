/* ===== Plate XI page helpers (owned by the director; agents read, do not edit) =====
   XI_STRIP: where a home cook or a guest sees something different from the developer, a section pushes one item:
     XI_STRIP.push({ order: 30, title: "Notebook, home cook", plan: "cook", note: "One plain sentence.",
                     draw: function () { return svg(...) } });
   order sets the place in the strip (10 kitchen, 20 whiteboard, 30 ideas, 40 notebook, 50 recipe box,
   60 cookbooks, 70 references, 80 sign in, 90 account, 100 front page). plan "cook" shows the paid tags.
   The strip section (04-plans) draws them; nothing else is needed. */
var XI_STRIP = [];

/* The ring: thin lines from each object in the middle kitchen to its zoomed-in view. */
var XI_RING = { wb: "the whiteboard", ideas: "the idea board", nb: "the notebook", box: "the recipe box",
  log: "the recipe log", cb: "the cookbooks", ref: "the references" };
function xiLines() {
  var ring = document.getElementById("ring"), lay = document.getElementById("ring-lines"), k = document.getElementById("ring-k");
  if (!ring || !lay || !k) return;
  if (getComputedStyle(ring).getPropertyValue("--lines").trim() !== "on") { lay.innerHTML = ""; return; }
  var R = ring.getBoundingClientRect(), s = "";
  lay.setAttribute("viewBox", "0 0 " + R.width + " " + R.height);
  Object.keys(XI_RING).forEach(function (key) {
    var hot = k.querySelector('[aria-label="Open ' + XI_RING[key] + '"] .focus-ring'), fig = document.getElementById("ring-" + key);
    if (!hot || !fig) return;
    var a = hot.getBoundingClientRect(), f = fig.getBoundingClientRect();
    var ax = a.left + a.width / 2 - R.left, ay = a.top + a.height / 2 - R.top;
    var fx = f.left - R.left, fy = f.top - R.top;
    var tx = Math.max(fx, Math.min(ax, fx + f.width)), ty = Math.max(fy, Math.min(ay, fy + f.height));
    s += '<path d="M' + ax.toFixed(1) + " " + ay.toFixed(1) + " L" + tx.toFixed(1) + " " + ty.toFixed(1) + '"/>' +
      '<circle cx="' + ax.toFixed(1) + '" cy="' + ay.toFixed(1) + '" r="4.5" class="dot"/><circle cx="' + tx.toFixed(1) + '" cy="' + ty.toFixed(1) + '" r="3"/>';
  });
  lay.innerHTML = s;
}
document.addEventListener("DOMContentLoaded", function () {
  var ring = document.getElementById("ring"); if (!ring) return;
  var go = function () { requestAnimationFrame(xiLines); };
  if (window.ResizeObserver) new ResizeObserver(go).observe(ring); else window.addEventListener("resize", go);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 300);
});
