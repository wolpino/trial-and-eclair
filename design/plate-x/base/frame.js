/* ===== Shared frame for every open view =====
   An open view fills most of the screen over the dimmed kitchen. Draw it in the main view box
   (x mainVP()[0]..mainVP()[1], y 0..760) inside STAGE. The find bar stays visible at the top;
   Close sits where Account was. Esc, Close, or a click on the dimmed kitchen closes it. */
var STAGE = { x0: 452, x1: 1348, y0: 76, y1: 722, cx: 900 };
function openFrame(vp) {
  vp = vp || mainVP();
  return '<rect x="' + (vp[0] - 20) + '" y="0" width="' + (vp[1] - vp[0] + 40) + '" height="764" style="fill:#1f1d1a;opacity:.58"/>' +
    reg("rect", 'x="700" y="22" width="400" height="44" rx="22"', "var(--card)", 2.4) +
    '<circle cx="730" cy="42" r="9" style="fill:none;stroke:var(--ink);stroke-width:2.4"/><path d="M737 49 L745 57" style="stroke:var(--ink);stroke-width:2.6;stroke-linecap:round"/>' +
    T(756, 52, "Find a recipe or jot an idea…", "font:500 25px var(--font-hand);fill:var(--ink-soft)") +
    reg("rect", 'x="' + (vp[1] - 168) + '" y="22" width="148" height="44" rx="22"', "var(--card)", 2.4) + T(vp[1] - 94, 51, "Close", "font:18px var(--font-body);fill:var(--ink)", 'text-anchor="middle"');
}
/* The whole open view: kitchen behind, dimmed, then your drawing on top. */
function openOver(inner, label, extra) { var V = mainVP(); return svg(V, scene(V, opts(extra)) + openFrame(V) + inner, label); }
/* A small pill button in the page's style (for toolbars inside open views). on = primary (yellow). */
function pill(x, y, w, text, on) { return reg("rect", 'x="' + x + '" y="' + y + '" width="' + w + '" height="34" rx="17"', on ? "var(--yellow)" : "var(--card)", 2) + T(x + w / 2, y + 23, text, "font:600 15px var(--font-body);fill:var(--ink)", 'text-anchor="middle"'); }
