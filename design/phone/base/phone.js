/* ===== Phone frame (director owns this file; do not edit) =====
   Every phone drawing is one SVG, 390 x 844 points upright (an iPhone-sized screen), or 844 x 390 sideways.
   Draw in screen points: x 0..390, y 0..844. The frame clips to the screen and adds the status bar.
   Safe area: content from y 54 (below the status bar) to y 810 (above the home bar). Side gutter 16.
   Tap targets: at least 44 x 44 points. Text: body at least 15 px, labels at least 13 px.  */
var PH = { w: 390, h: 844, top: 54, bottom: 810, gut: 16 }, phN = 0;
/* phone(inner, label, opt): opt.land = sideways (844 x 390); opt.dark = dark status bar text; opt.bg = screen fill */
function phone(inner, label, opt) {
  opt = opt || {}; var w = opt.land ? 844 : 390, h = opt.land ? 390 : 844, id = "phclip" + (phN++), ink = opt.dark ? "#f6efdc" : "var(--ink)";
  var bar = opt.land ? "" : T(36, 34, "9:41", "font:600 15px var(--font-body);fill:" + ink) +
    '<rect x="150" y="12" width="90" height="26" rx="13" style="fill:#1c1a18"/>' +
    '<rect x="322" y="24" width="24" height="11" rx="3" style="fill:none;stroke:' + ink + ';stroke-width:1.4"/><rect x="324.5" y="26.5" width="16" height="6" rx="1.5" style="fill:' + ink + '"/>';
  var home = opt.land ? '<rect x="' + (w / 2 - 70) + '" y="' + (h - 10) + '" width="140" height="5" rx="2.5" style="fill:' + ink + ';opacity:.6"/>'
    : '<rect x="125" y="828" width="140" height="5" rx="2.5" style="fill:' + ink + ';opacity:.6"/>';
  return '<svg class="ph" viewBox="-10 -10 ' + (w + 20) + " " + (h + 20) + '" role="img" aria-label="' + label + '">' +
    '<defs><clipPath id="' + id + '"><rect x="0" y="0" width="' + w + '" height="' + h + '" rx="44"/></clipPath></defs>' +
    '<rect x="-7" y="-7" width="' + (w + 14) + '" height="' + (h + 14) + '" rx="50" style="fill:#2a2724;stroke:var(--ink);stroke-width:2"/>' +
    '<g clip-path="url(#' + id + ')"><rect width="' + w + '" height="' + h + '" style="fill:' + (opt.bg || "var(--page)") + '"/>' + inner + bar + home + "</g></svg>";
}
/* The top of every view that takes over the screen (not the recipe box, which has no header, decision 003).
   "‹ Kitchen" goes back (the phone's own Back does the same, decision 005). Title in the hand font. */
function phTop(title, opt) {
  opt = opt || {};
  return '<rect x="0" y="0" width="390" height="100" style="fill:' + (opt.bg || "var(--card)") + '"/>' + line("M0 100 H390", 1.6, 0.8) +
    T(16, 84, "‹ Kitchen", "font:700 22px var(--font-hand);fill:var(--blue)") +
    T(374, 84, title, "font:700 26px var(--font-hand);fill:var(--ink)", 'text-anchor="end"');
}
/* The add button (was the jot pencil; Ari 11/17: a plus, like every other place you add something new).
   Yellow, round, bottom right, on the kitchen and on views where it covers nothing. */
function phJot(x, y) { x = x || 330; y = y || 750;
  return hatch(x - 22, y + 18, 50, 10, 0.5) + reg("circle", 'cx="' + x + '" cy="' + y + '" r="30"', "var(--yellow)", 2.6) +
    line("M" + (x - 12) + " " + y + " H" + (x + 12) + " M" + x + " " + (y - 12) + " V" + (y + 12), 4); }
/* The web address under a phone drawing, as in Plate XI. */
function phAddr(path) { return '<p class="addr">' + path + "</p>"; }
document.head.insertAdjacentHTML("beforeend", "<style>.phones{display:grid;gap:22px;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));align-items:start}" +
  ".phones>div{display:grid;gap:6px;align-content:start;min-width:0}.phones figure,.land figure{border:0;background:none}.land{display:grid;gap:22px;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));align-items:start}" +
  ".land>div{display:grid;gap:6px;align-content:start;min-width:0}.addr{margin:0;font:600 13px ui-monospace,Menlo,monospace;color:var(--ink-soft)}</style>");
