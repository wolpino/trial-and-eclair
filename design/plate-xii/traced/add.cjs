/* New pieces drawn on top of Ari's trace, in its look: thick dark outline, flat two-tone colour, the trace's own colours.
   Units are the source's (868 x 489). opts(v) returns what clean.cjs needs for version v ("a" as traced, "b" swapped):
   defs, patch (drawn after the room, before moved objects), end (groups drawn last, each [obj, svg]). */
const INK = "#0D0C0B", WOOD = "#CF9A64", WOOD_L = "#D0975F", GRAIN = "#A87548", PAPER = "#FAF8E8", RULE = "#C9C3B5";
const f1 = (n) => (+n.toFixed(1)).toString();
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
/* a closed shape through points with a slight hand wobble on each side, as in the trace */
function wob(pts, amp) {
  amp = amp == null ? 0.5 : amp; let d = "M" + f1(pts[0][0]) + " " + f1(pts[0][1]);
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const k = (rnd() - 0.5) * 2 * amp; d += " Q" + f1(mx - (b[1] - a[1]) / len * k) + " " + f1(my + (b[0] - a[0]) / len * k) + " " + f1(b[0]) + " " + f1(b[1]);
  }
  return d + "Z";
}
const P = (d, fill, sw, extra) => '<path d="' + d + '" style="fill:' + fill + (sw ? ";stroke:" + INK + ";stroke-width:" + sw + ";stroke-linejoin:round" : "") + '"' + (extra || "") + "/>";
const cab = (pct, to) => "color-mix(in srgb,var(--cab) " + pct + "%," + (to || "#1f1d1a") + ")";
const lens = (x0, x1, y, t, c) => '<path d="M' + f1(x0) + " " + f1(y) + " Q" + f1((x0 + x1) / 2) + " " + f1(y - t) + " " + f1(x1) + " " + f1(y) + " Q" + f1((x0 + x1) / 2) + " " + f1(y + t * 0.6) + " " + f1(x0) + " " + f1(y) + 'Z" style="fill:' + (c || GRAIN) + '"/>';

/* ---- shelf labels on the front edge of the cubby's lower shelf (board y 105.6..113.2) ---- */
const label = (x, t) => '<text x="' + x + '" y="111.7" text-anchor="middle" style="font:700 6.2px \'Archivo Narrow\',\'Arial Narrow\',sans-serif;letter-spacing:.9px;fill:#2a1a0e">' + t + "</text>";
const LABELS = [["cookbooks", label(491, "COOKBOOKS")], ["references", label(606, "REFERENCES")]];

/* ---- the eclair (mark G) on a plate, on the counter between the notebook and the mixer ---- */
function eclair() {
  const cx = 489, cy = 340;
  let s = '<ellipse cx="' + cx + '" cy="' + (cy + 4) + '" rx="27" ry="6.2" style="fill:' + INK + '"/>' +
    '<ellipse cx="' + cx + '" cy="' + (cy + 3) + '" rx="25.3" ry="5" style="fill:' + PAPER + '"/>' +
    '<ellipse cx="' + cx + '" cy="' + (cy + 3.3) + '" rx="17" ry="3" style="fill:#E7E1CF"/>';
  /* the eclair at the tape's angle (-4 degrees), 38 x 11 */
  const L = 38, H = 11, x0 = cx - L / 2, y0 = cy - H + 1.5;
  let g = '<rect x="' + (x0 - 1.1) + '" y="' + (y0 - 1.1) + '" width="' + (L + 2.2) + '" height="' + (H + 2.2) + '" rx="4.6" style="fill:' + INK + '"/>' +
    '<rect x="' + x0 + '" y="' + y0 + '" width="' + L + '" height="' + H + '" rx="3.6" style="fill:#F5A23A"/>' +
    '<rect x="' + x0 + '" y="' + (y0 + H * 0.7) + '" width="' + L + '" height="' + (H * 0.3) + '" rx="2" style="fill:#D9822A"/>';
  /* chocolate glaze with drips */
  let d = "M" + (x0 + 1) + " " + (y0 + 0.6) + " H" + (x0 + L - 1) + " Q" + (x0 + L + 0.2) + " " + (y0 + 1) + " " + (x0 + L - 0.5) + " " + (y0 + 5);
  const n = 4, w = (L - 1.5) / n, dr = [0.5, 0.2, 0.62, 0.28];
  for (let i = n - 1; i >= 0; i--) d += " Q" + f1(x0 + 0.75 + i * w + w / 2) + " " + f1(y0 + 5 + H * dr[i] * 0.55) + " " + f1(x0 + 0.75 + i * w) + " " + f1(y0 + 5);
  d += " Q" + (x0 - 0.2) + " " + (y0 + 1) + " " + (x0 + 1) + " " + (y0 + 0.6) + "Z";
  g += P(d, "#5E3218", 0.9) + '<path d="M' + (x0 + 6) + " " + (y0 + 2.6) + ' q1.6 -1.3 3.2 0 t3.2 0 t3.2 0 t3.2 0 t3.2 0 t3.2 0 t3.2 0" style="fill:none;stroke:#FFF4DC;stroke-width:.9;stroke-linecap:round"/>' +
    '<path d="M' + (x0 + 4) + " " + (y0 + 1.6) + " h9" + '" style="stroke:#8A4F2A;stroke-width:.9;stroke-linecap:round"/>';
  s += '<g transform="rotate(-4 ' + cx + " " + cy + ')">' + g + "</g>";
  return s;
}

/* ---- spoon jar on the window sill (sill top y ~244) ---- */
function jar() {
  const x = 808, b = 245.5, w = 17, h = 19;
  let s = "";
  /* spoons and a whisk behind the rim */
  s += P(wob([[x + 3, b - h + 2], [x + 1.5, b - h - 20], [x + 3.4, b - h - 20.5], [x + 5, b - h + 2]], .2), WOOD_L, 1.1);
  s += '<ellipse cx="' + (x + 2.3) + '" cy="' + (b - h - 24) + '" rx="3.2" ry="4.8" transform="rotate(-6 ' + (x + 2.3) + " " + (b - h - 24) + ')" style="fill:' + WOOD_L + ";stroke:" + INK + ';stroke-width:1.1"/>';
  s += '<path d="M' + (x + 9) + " " + (b - h + 1) + " L" + (x + 9.5) + " " + (b - h - 13) + '" style="stroke:' + INK + ';stroke-width:2.4;stroke-linecap:round"/><path d="M' + (x + 9) + " " + (b - h + 1) + " L" + (x + 9.5) + " " + (b - h - 13) + '" style="stroke:#9C9892;stroke-width:1.1;stroke-linecap:round"/>';
  for (const k of [-3.2, 0, 3.2]) s += '<path d="M' + (x + 9.5) + " " + (b - h - 12) + " Q" + (x + 9.5 + k * 1.6) + " " + (b - h - 22) + " " + (x + 9.5 + k * 0.3) + " " + (b - h - 27) + '" style="fill:none;stroke:' + INK + ';stroke-width:.9"/>';
  s += P(wob([[x + 13, b - h + 2], [x + 15.5, b - h - 15], [x + 17.2, b - h - 14.6], [x + 15, b - h + 2]], .2), "#B17A4B", 1.1);
  s += '<ellipse cx="' + (x + 16.6) + '" cy="' + (b - h - 17.5) + '" rx="2.6" ry="3.8" transform="rotate(10 ' + (x + 16.6) + " " + (b - h - 17.5) + ')" style="fill:#B17A4B;stroke:' + INK + ';stroke-width:1.1"/>';
  /* the crock: cream stoneware with a sage band */
  const body = wob([[x - 1, b - h], [x + w + 1, b - h], [x + w, b - 2], [x + w - 1.5, b], [x + 0.5, b], [x - 0.5, b - 2]], .3);
  s += P(body, "#EFE6CF", 1.6);
  s += '<path d="M' + (x + w * 0.62) + " " + (b - h + 1.5) + " L" + (x + w - 0.4) + " " + (b - h + 1.5) + " L" + (x + w - 1) + " " + (b - 1.2) + " L" + (x + w * 0.66) + " " + (b - 1.2) + 'Z" style="fill:#D9CDAF"/>';
  s += '<rect x="' + (x - 0.4) + '" y="' + (b - h * 0.62) + '" width="' + (w + 0.6) + '" height="3.2" style="fill:#8BA07A"/>';
  s += '<ellipse cx="' + (x + w / 2) + '" cy="' + (b - h) + '" rx="' + (w / 2 + 1.2) + '" ry="1.6" style="fill:#3a332b;stroke:' + INK + ';stroke-width:1.2"/>';
  return s;
}

/* ---- whiteboard marker on the bottom tray, its own colour (tomato cap, cream barrel) ---- */
function marker() {
  const x = 470, y = 288.6;
  return '<g transform="rotate(-2 ' + x + " " + y + ')">' +
    P(wob([[x, y], [x + 22, y], [x + 22, y + 4.2], [x, y + 4.2]], .15), "#F1ECDD", 1.1) +
    P(wob([[x + 21, y - 0.4], [x + 30, y - 0.4], [x + 31.5, y + 2.1], [x + 30, y + 4.6], [x + 21, y + 4.6]], .15), "#C8473A", 1.1) +
    '<rect x="' + (x + 2) + '" y="' + (y + 1.2) + '" width="10" height="1.6" style="fill:#C8473A"/>' +
    '<path d="M' + x + " " + (y + 0.6) + " L" + (x - 3) + " " + (y + 2.1) + " L" + x + " " + (y + 3.6) + 'Z" style="fill:#3a3a40;stroke:' + INK + ';stroke-width:.8;stroke-linejoin:round"/></g>';
}

/* ---- the wall cupboard right of the top-left one: its door hinges on the left (x 132.7), 132.7 wide, y -3..102.5 ---- */
const DOOR = { x0: 132.7, W: 132.7, yt: -3, yb: 102.5 }, VP = [434, 240], F = 900;
function proj(X, Y, Z) { const s = F / (F - Z); return [VP[0] + (X - VP[0]) * s, VP[1] + (Y - VP[1]) * s]; }
/* a point on the door at (u across from the hinge, v down), door swung th degrees, n = offset off the inside face */
function on(th, u, v, n) { const t = th * Math.PI / 180, X = DOOR.x0 + u * DOOR.W * Math.cos(t) + (n || 0) * Math.sin(t), Z = u * DOOR.W * Math.sin(t) - (n || 0) * Math.cos(t); return proj(X, DOOR.yt + v * (DOOR.yb - DOOR.yt), Z); }
function interior(v, k) {
  const x0 = DOOR.x0, x1 = x0 + DOOR.W, y1 = DOOR.yb, dep = 60, bk = (X, Y) => proj(X, Y, -dep);
  const b0 = bk(x0, -3), b1 = bk(x1, y1);
  const cid = v + "-op-" + k;   /* everything inside stays inside the opening */
  let s = '<clipPath id="' + cid + '"><rect x="' + x0 + '" y="-10" width="' + DOOR.W + '" height="' + (y1 + 10) + '"/></clipPath><g clip-path="url(#' + cid + ')">';
  s += P(wob([[x0, -6], [x1, -6], [x1, y1 + 4], [x0, y1 + 4]], .3), cab(30));   /* back wall seen through the opening */
  s += P("M" + x0 + " 0 L" + f1(b0[0]) + " 0 L" + f1(b0[0]) + " " + f1(bk(x0, y1)[1]) + " L" + x0 + " " + y1 + "Z", cab(44));   /* left side wall */
  /* one shelf: front edge, and its underside running back */
  const sy = 50, u0 = bk(x0, sy + 3.5), u1 = bk(x1, sy + 3.5);
  s += P("M" + x0 + " " + (sy + 3.5) + " L" + x1 + " " + (sy + 3.5) + " L" + f1(u1[0]) + " " + f1(u1[1]) + " L" + f1(u0[0]) + " " + f1(u0[1]) + "Z", cab(52));
  /* jars and tins on the shelf, then on the floor (their feet hidden by the front rail) */
  const jar = (x, w, top, bot, lid, glass) => P(wob([[x, top + 3], [x + w, top + 3], [x + w, bot], [x, bot]], .25), glass, 1.3) + P(wob([[x - 0.8, top], [x + w + 0.8, top], [x + w + 0.8, top + 3.6], [x - 0.8, top + 3.6]], .15), lid, 1.1);
  s += jar(150, 17, 18, sy, "#C8473A", "#E9DDBE") + jar(172, 13, 26, sy, "#B17A4B", "#EFE6CF") + jar(214, 22, 14, sy, "#9C9892", "#D8C9A4") + jar(242, 13, 24, sy, "#8BA07A", "#EFE6CF");
  s += P("M" + x0 + " " + sy + " H" + x1 + " V" + (sy + 3.5) + " H" + x0 + "Z", cab(66), 1.3);
  s += jar(158, 30, 70, y1 + 2, "#E0B450", "#F0C86A") + jar(206, 15, 64, y1 + 2, "#B17A4B", "#E9DDBE") + jar(226, 26, 80, y1 + 2, "#9C9892", "#CFC8B8");
  s += "</g>" + P(wob([[x0, -6], [x1, -6], [x1, y1], [x0, y1]], .3), "none", 2.4);
  return s;
}
function clipboard(th, uL, uR) {
  const q = (pts, n) => pts.map((p) => on(th, p[0], p[1], n));
  let s = P(wob(q([[uL, .33], [uR, .33], [uR, .97], [uL, .97]], 1), .4), "#B57D4B", 1.6);
  const pu = (a) => uL + (uR - uL) * a;
  s += P(wob(q([[pu(.09), .39], [pu(.91), .39], [pu(.91), .93], [pu(.09), .93]], 1.2), .3), PAPER, .9);
  for (let v = .5; v < .91; v += .052) { const a = on(th, pu(.16), v, 1.3), b = on(th, pu(.84), v, 1.3); s += '<path d="M' + f1(a[0]) + " " + f1(a[1]) + " L" + f1(b[0]) + " " + f1(b[1]) + '" style="stroke:' + RULE + ';stroke-width:.7"/>'; }
  { const a = on(th, pu(.16), .45, 1.3), b = on(th, pu(.62), .45, 1.3); s += '<path d="M' + f1(a[0]) + " " + f1(a[1]) + " L" + f1(b[0]) + " " + f1(b[1]) + '" style="stroke:#9C9892;stroke-width:1.1"/>'; }
  s += P(wob(q([[pu(.36), .3], [pu(.64), .3], [pu(.64), .37], [pu(.36), .37]], 1.6), .2), "#C5BEB0", 1.1);
  const n = on(th, pu(.5), .23, 0), c = on(th, pu(.5), .3, 1.6);
  s += '<path d="M' + f1(n[0]) + " " + f1(n[1]) + " L" + f1(c[0] - 2) + " " + f1(c[1]) + " M" + f1(n[0]) + " " + f1(n[1]) + " L" + f1(c[0] + 2) + " " + f1(c[1]) + '" style="stroke:#3a332b;stroke-width:.8"/><circle cx="' + f1(n[0]) + '" cy="' + f1(n[1]) + '" r="1.3" style="fill:#9A6A2E;stroke:' + INK + ';stroke-width:.7"/>';
  return s;
}
/* swung fully open: the inside face shows, clipboard hanging on it */
function cupOpen(v) {
  const th = 100, c = (u, v) => on(th, u, v, 0), t = 3.2;
  let door = interior(v, "o");
  const e = (v) => on(th, 1, v, -t);   /* the door's thickness at the free edge */
  door += P(wob([c(1, 0), e(0), e(1), c(1, 1)], .2), cab(60), 1.6);
  door += P(wob([c(0, 0), c(1, 0), c(1, 1), c(0, 1)], .5), cab(84), 2.2);
  door += P(wob([c(.62, .02), c(.98, .02), c(.98, .98), c(.62, .98)], .2), cab(92, "#fff"));   /* light on the outer half */
  door += P(wob([c(.08, .1), c(.92, .1), c(.92, .92), c(.08, .92)], .3), "none", .9);
  return { door, clip: clipboard(th, .2, .82) };
}
/* cracked open: the outside face shows, the clipboard's edge peeks out of the gap */
function cupAjar(v) {
  const th = 26, c = (u, v) => on(th, u, v, 0), t = 3.2;
  let s = interior(v, "a");
  s += clipboard(th, .78, 1.12);
  const e = (v) => on(th, 1, v, t);
  s += P(wob([c(1, 0), e(0), e(1), c(1, 1)], .2), cab(62), 1.6);
  s += P(wob([c(0, 0), c(1, 0), c(1, 1), c(0, 1)], .5), "var(--cab)", 2.2);
  s += P(wob([c(.12, .05), c(.88, .05), c(.88, .84), c(.12, .84)], .3), cab(88), 1.4);
  s += P(wob([c(.16, .08), c(.84, .08), c(.84, .81), c(.16, .81)], .3), "var(--cab)", .8);
  const k = c(.9, .9); s += '<circle cx="' + f1(k[0]) + '" cy="' + f1(k[1]) + '" r="3.6" style="fill:#9A6A2E;stroke:' + INK + ';stroke-width:1.4"/><circle cx="' + f1(k[0] + 0.8) + '" cy="' + f1(k[1] - 0.9) + '" r="1.3" style="fill:#C8963F"/>';
  return s;
}

/* ---- patches for the swap: fill where the box and mixer stood (wall above the counter's back edge, wood below),
        and finish the whiteboard's lower right corner, which the mixer always hid ---- */
function patch(v) {
  const id = (s) => v + "-" + s, mk = (o, c, cl) => '<g clip-path="url(#' + id(cl) + ')"><use href="#' + id("mk-" + o) + '" fill="' + c + '" stroke="' + c + '" stroke-width="12" stroke-linejoin="round"/></g>';
  let s = '<g clip-path="url(#' + id("pt-box") + ')">' + mk("box", "var(--wall)", "up") + mk("box", WOOD_L, "dn") + "</g>";
  s += '<g clip-path="url(#' + id("pt-mixer") + ')">' + mk("mixer", "var(--wall)", "up") + mk("mixer", WOOD, "dn") + "</g>";
  s += '<rect x="22" y="315.3" width="166" height="1.7" style="fill:' + INK + '"/><rect x="512" y="315.4" width="166" height="1.7" style="fill:' + INK + '"/>';
  s += lens(40, 96, 326, 1.2) + lens(110, 170, 333, 1.1) + lens(60, 120, 345, 1.3) + lens(525, 590, 327, 1.1) + lens(600, 670, 337, 1.2) + lens(540, 610, 349, 1.2);
  /* the whiteboard's right part, which the mixer hid (redrawn to match, from x 505 on) */
  s += '<g clip-path="url(#' + id("pt-wb") + ')">' +
    '<rect x="453" y="133.2" width="139.5" height="163.8" rx="7" style="fill:' + INK + '"/>' +
    '<rect x="455.4" y="135.4" width="134.7" height="159.5" rx="5" style="fill:#C5BEB0"/>' +
    '<rect x="461.8" y="138.9" width="122.2" height="152.4" style="fill:' + INK + '"/>' +
    '<rect x="463" y="139.8" width="120" height="150.8" style="fill:#FAF8E8"/>' +
    '<path d="M582.5 135.4 H586 Q590.1 135.4 590.1 139.4 V142.6 H582.5 Z" style="fill:#595858;stroke:' + INK + ';stroke-width:1"/>' +
    '<path d="M582.5 289.6 H590.1 V291.5 Q590.1 294.9 586.5 294.9 H582.5 Z" style="fill:#595858;stroke:' + INK + ';stroke-width:1"/></g>';
  return s;
}
function patchDefs(v) {
  const id = (s) => v + "-" + s;
  return '<clipPath id="' + id("up") + '"><rect x="-10" y="-10" width="900" height="326.2"/></clipPath>' +
    '<clipPath id="' + id("dn") + '"><rect x="-10" y="316.2" width="900" height="200"/></clipPath>' +
    '<clipPath id="' + id("pt-box") + '"><rect x="0" y="150" width="187.5" height="230"/></clipPath>' +
    '<clipPath id="' + id("pt-mixer") + '"><rect x="500" y="150" width="178.5" height="230"/></clipPath>' +
    '<clipPath id="' + id("pt-wb") + '"><rect x="505" y="125" width="94" height="180"/></clipPath>';
}

module.exports = {
  opts(v) {
    seed = 7;
    const cupA = cupOpen(v);
    const end = LABELS.map((l) => ({ obj: l[0], svg: l[1] }))
      .concat([{ obj: "whiteboard", svg: marker() }, { obj: "eclair", svg: eclair() }, { obj: "jar", svg: jar() },
        { obj: "cup-open", svg: cupA.door }, { obj: "clip", svg: cupA.clip }, { obj: "cup-ajar", svg: cupAjar(v) }]);
    return v === "b" ? { defs: patchDefs(v), patch: patch(v), end } : { end };
  },
};
