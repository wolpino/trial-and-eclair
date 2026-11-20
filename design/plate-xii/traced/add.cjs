/* New pieces drawn on top of Ari's trace, in its look: dark outline, flat two-tone colour, the trace's own colours.
   Units are the source's (868 x 489). opts(v) returns what clean.cjs needs: end = groups drawn last, each { obj, svg, top };
   top: true = drawn after the added height on top (the open cupboard sits partly in it). */
const INK = "#0D0C0B", WOOD_L = "#D0975F", PAPER = "#FAF8E8", RULE = "#C9C3B5";
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
const P = (d, fill, sw) => '<path d="' + d + '" style="fill:' + fill + (sw ? ";stroke:" + INK + ";stroke-width:" + sw + ";stroke-linejoin:round" : "") + '"/>';
const cab = (pct, to) => "color-mix(in srgb,var(--cab) " + pct + "%," + (to || "#1f1d1a") + ")";

/* ---- variants on the page: each is a <g data-var="key-value ..."> shown only when every key matches the page's choice.
        DEF = what shows first. ---- */
const DEF = { ecl: "1", spot: "p2", sill: "1" };
function V(tokens, svg) {
  const on = tokens.split(" ").every((t) => { const [k, v] = t.split("-"); return DEF[k] === v; });
  return '<g data-var="' + tokens + '"' + (on ? "" : ' style="display:none"') + ">" + svg + "</g>";
}

/* ---- eclairs on plates, five versions, in the trace's look: thick outline, flat colours, a lighter and a darker tone,
        a cast shadow on the counter. (cx, cy) = centre of the plate; k = scale ---- */
const CHOUX = "#E3A866", CHOUX_D = "#C98A4B", CHOUX_L = "#F0C78E", CHOC = "#4A2A1C", CHOC_L = "#7A4A30", CREAM = "#F7E9BE";
function plate(cx, cy, k, deco) {
  const rx = 42 * k, ry = 10.2 * k;
  let s = '<ellipse cx="' + f1(cx + 3 * k) + '" cy="' + f1(cy + 3.6 * k) + '" rx="' + f1(rx + 1) + '" ry="' + f1(ry) + '" style="fill:#B17A4B"/>' +
    '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + f1(rx) + '" ry="' + f1(ry) + '" style="fill:' + INK + '"/>' +
    '<ellipse cx="' + cx + '" cy="' + f1(cy - 0.4 * k) + '" rx="' + f1(rx - 1.7 * k) + '" ry="' + f1(ry - 1.5 * k) + '" style="fill:' + (deco === "sage" ? "#A9B98F" : "#F6F0DF") + '"/>' +
    '<ellipse cx="' + cx + '" cy="' + f1(cy - 0.9 * k) + '" rx="' + f1(29 * k) + '" ry="' + f1(5.8 * k) + '" style="fill:#EAE2CA;stroke:' + INK + ';stroke-width:.8"/>' +
    '<path d="M' + f1(cx - 34 * k) + " " + f1(cy - 3.5 * k) + " Q" + f1(cx - 20 * k) + " " + f1(cy - 8.4 * k) + " " + f1(cx + 2 * k) + " " + f1(cy - 8.6 * k) + '" style="fill:none;stroke:#FFFDF4;stroke-width:' + f1(1.4 * k) + ';stroke-linecap:round"/>';
  if (deco === "floral") for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2 + .2, x = cx + 35.5 * k * Math.cos(a), y = cy - 0.6 * k + 7.6 * k * Math.sin(a);
    s += '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + f1(1.3 * k) + '" style="fill:#E3A9AE"/><circle cx="' + f1(x + 1.8 * k) + '" cy="' + f1(y + .4 * k) + '" r="' + f1(.8 * k) + '" style="fill:#8BA07A"/>';
  }
  if (deco === "gold") s += '<ellipse cx="' + cx + '" cy="' + f1(cy - 0.6 * k) + '" rx="' + f1(36.5 * k) + '" ry="' + f1(7.4 * k) + '" style="fill:none;stroke:#C9A24A;stroke-width:' + f1(.9 * k) + '"/>';
  return s;
}
/* the eclair body, sitting on (cx, base), length L, height H; opts: glaze style, cream end, bite, drizzle */
function eclairBody(cx, base, L, H, o) {
  const x0 = cx - L / 2, y0 = base - H, r = H / 2;
  let s = '<rect x="' + f1(x0 - 1.7) + '" y="' + f1(y0 - 1.7) + '" width="' + f1(L + 3.4) + '" height="' + f1(H + 3.4) + '" rx="' + f1(r + 1.7) + '" style="fill:' + INK + '"/>' +
    '<rect x="' + f1(x0) + '" y="' + f1(y0) + '" width="' + f1(L) + '" height="' + f1(H) + '" rx="' + f1(r) + '" style="fill:' + (o.choux || CHOUX) + '"/>' +
    '<path d="M' + f1(x0 + r * .4) + " " + f1(base - H * .3) + " H" + f1(x0 + L - r * .4) + " Q" + f1(x0 + L - 1) + " " + f1(base - H * .2) + " " + f1(x0 + L - r * .9) + " " + f1(base - 1) + " H" + f1(x0 + r * .9) + " Q" + f1(x0 + 1) + " " + f1(base - H * .2) + " " + f1(x0 + r * .4) + " " + f1(base - H * .3) + 'Z" style="fill:' + (o.chouxD || CHOUX_D) + '"/>';
  /* choux texture: short ridges, and a stitched line like the logo */
  if (o.ridges) for (let i = 0; i < 4; i++) s += '<path d="M' + f1(x0 + L * (.2 + i * .19)) + " " + f1(base - H * .36) + " q" + f1(H * .14) + " " + f1(-H * .1) + " " + f1(H * .3) + " 0" + '" style="fill:none;stroke:#A86B35;stroke-width:.9;stroke-linecap:round"/>';
  if (o.stitch) s += '<path d="M' + f1(x0 + r * .9) + " " + f1(base - H * .2) + " Q" + f1(cx) + " " + f1(base - H * .08) + " " + f1(x0 + L - r * .9) + " " + f1(base - H * .2) + '" style="fill:none;stroke:#8F5C35;stroke-width:.9;stroke-dasharray:1.4 1.6"/>';
  /* glaze: smooth wave (o.wave) or drips */
  const gy = y0 + H * (o.glazeTo || .52);
  let d = "M" + f1(x0 + r * .55) + " " + f1(y0 + .9) + " H" + f1(x0 + L - r * .55) + " Q" + f1(x0 + L + .5) + " " + f1(y0 + 1.6) + " " + f1(x0 + L - .8) + " " + f1(gy);
  const n = o.drips ? 5 : 4, w = (L - 1.6) / n;
  for (let i = n - 1; i >= 0; i--) {
    const dip = o.drips ? H * [.3, .1, .36, .16, .26][i] : H * (i % 2 ? .07 : -.05);
    d += " Q" + f1(x0 + .8 + i * w + w / 2) + " " + f1(gy + dip) + " " + f1(x0 + .8 + i * w) + " " + f1(gy);
  }
  d += " Q" + f1(x0 - .5) + " " + f1(y0 + 1.6) + " " + f1(x0 + r * .55) + " " + f1(y0 + .9) + "Z";
  s += P(d, o.choc || CHOC, 1.2);
  /* gloss: a long light streak and a dot */
  s += '<path d="M' + f1(x0 + r * .9) + " " + f1(y0 + H * .17) + " Q" + f1(cx - L * .1) + " " + f1(y0 + H * .07) + " " + f1(x0 + L * .7) + " " + f1(y0 + H * .14) + '" style="fill:none;stroke:' + (o.gloss || "#B98A6A") + ";stroke-width:" + f1(H * .1) + ';stroke-linecap:round"/>';
  if (!o.drizzle) s += '<circle cx="' + f1(x0 + L * .8) + '" cy="' + f1(y0 + H * .15) + '" r="' + f1(H * .055) + '" style="fill:#F4E6D6"/>';
  if (o.drizzle) s += '<path d="M' + f1(x0 + L * .14) + " " + f1(y0 + H * .33) + (" q" + f1(L * .045) + " " + f1(-H * .12) + " " + f1(L * .09) + " 0").repeat(1) + (" t" + f1(L * .09) + " 0").repeat(7) + '" style="fill:none;stroke:#FFF4DC;stroke-width:1.3;stroke-linecap:round"/>';
  /* cream showing at the cut left end */
  if (o.creamEnd) s += P(wob([[x0 - 1, base - H * .78], [x0 + 3.2, base - H * .82], [x0 + 4.4, base - H * .5], [x0 + 3, base - H * .18], [x0 - .8, base - H * .2], [x0 - 2.2, base - H * .5]], .3), CREAM, 1.2) +
    '<path d="M' + f1(x0 + .6) + " " + f1(base - H * .62) + " q1.2 1.6 0 3.4" + '" style="fill:none;stroke:#E2C985;stroke-width:.9"/>';
  /* a bite out of the right end: the body is cut by a mask, cream shows inside */
  if (o.bite) {
    const bx = x0 + L, by = y0 + H * .5, id = "bite" + (++biteN);
    const cut = "M" + f1(bx + 3) + " " + f1(y0 - 3) + " L" + f1(bx - 7) + " " + f1(y0 - 3) + " Q" + f1(bx - 10.5) + " " + f1(y0 + 2) + " " + f1(bx - 8.5) + " " + f1(y0 + 5) + " Q" + f1(bx - 12) + " " + f1(by) + " " + f1(bx - 8.8) + " " + f1(by + 3.5) + " Q" + f1(bx - 11.5) + " " + f1(base - 3) + " " + f1(bx - 6.5) + " " + f1(base + 3) + " L" + f1(bx + 3) + " " + f1(base + 3) + "Z";
    s = '<mask id="' + id + '" maskUnits="userSpaceOnUse" x="' + f1(x0 - 10) + '" y="' + f1(y0 - 10) + '" width="' + f1(L + 20) + '" height="' + f1(H + 20) + '"><rect x="' + f1(x0 - 10) + '" y="' + f1(y0 - 10) + '" width="' + f1(L + 20) + '" height="' + f1(H + 20) + '" fill="#fff"/><path d="' + cut + '" fill="#000"/></mask><g mask="url(#' + id + ')">' + s + "</g>";
    s += P(wob([[bx - 6.6, y0 + .5], [bx - 9.4, y0 + 4.6], [bx - 10.8, by], [bx - 8.6, by + 3.4], [bx - 9.8, base - 3.6], [bx - 6.6, base + .4], [bx - 4.6, by + 1], [bx - 4.8, y0 + 3.6]], .3), CREAM, 1.4);
    s += '<path d="M' + f1(bx - 7.6) + " " + f1(y0 + 6) + " q-1.6 3 0 6" + '" style="fill:none;stroke:#E2C985;stroke-width:.9"/>';
  }
  return s;
}
let biteN = 0;
const ECL = {
  1: { name: "Glossy, like the logo", plate: "plain", L: 60, H: 19, o: { ridges: 1, stitch: 1 } },
  2: { name: "Cream at the end, floral plate", plate: "floral", L: 62, H: 20, o: { creamEnd: 1, drips: 1, glazeTo: .5 } },
  3: { name: "Plump, gold-rimmed plate", plate: "gold", L: 58, H: 23, o: { glazeTo: .56, ridges: 1, choc: "#3E2216", gloss: "#A97A5C" } },
  4: { name: "Mark G: drizzle, sage plate", plate: "sage", L: 62, H: 19, o: { drizzle: 1, drips: 1, choux: "#F5A23A", chouxD: "#D9822A", choc: "#5E3218" } },
  5: { name: "Bitten, with crumbs", plate: "plain", L: 60, H: 20, o: { bite: 1, stitch: 1 } },
};
function eclairOn(v, cx, cy, k) {
  const e = ECL[v], base = cy - 1.2 * k;
  let s = plate(cx, cy, k, e.plate);
  if (v === "5") for (const c of [[-24, 1.5], [-18, 3.4], [20, 2.6], [27, .6], [-6, 4.2]]) s += '<circle cx="' + f1(cx + c[0] * k) + '" cy="' + f1(cy + (c[1] - 2) * k) + '" r="' + f1(.9 * k) + '" style="fill:' + CHOUX_D + '"/>';
  s += '<g transform="rotate(-4 ' + cx + " " + f1(base) + ") translate(" + f1(cx) + " " + f1(base) + ") scale(" + k + ") translate(" + f1(-cx) + " " + f1(-base) + ')">' + eclairBody(cx, base, e.L, e.H, e.o) + "</g>";
  return s;
}
/* where the plate sits for each spot: p1 between the box and the notebook; p2 in front of the whiteboard (as v5);
   p3 on a stack of two closed notebooks in front of the whiteboard */
const SPOT = { p1: [222, 362, 1], p2: [494, 361, 1], p3: [490, 333, .86] };

/* ---- notebooks: a closed one is a quad on the counter with its front edge (pages) showing ---- */
function closedBook(pts, cover, edge) {
  const [bl, br, tr, tl] = pts, t = 3.6;
  return P(wob([bl, br, [br[0], br[1] + t], [bl[0], bl[1] + t]], .2), edge || "#F1EAD6", 1.4) +
    P(wob([bl, br, tr, tl], .4), cover, 1.8) +
    '<path d="M' + f1(bl[0] + 2) + " " + f1(bl[1] + t * .5) + " L" + f1(br[0] - 2) + " " + f1(br[1] + t * .5) + '" style="stroke:#CFC6AE;stroke-width:.7"/>';
}
/* the open notebook's outline on the counter (BL, BR, TR, TL) */
const NB = [[272, 371], [442, 360], [425, 314], [260, 327]];
/* p2: two notebooks under the open one, showing only outside it (the notebook's own shape masks them) */
function stackUnder(v) {
  const m = v + "-nonb";
  return '<mask id="' + m + '" maskUnits="userSpaceOnUse" x="0" y="0" width="868" height="489"><rect width="868" height="489" fill="#fff"/><use href="#' + v + '-mk-notebook" fill="#000" stroke="#000" stroke-width="6" stroke-linejoin="round"/></mask>' +
    '<g mask="url(#' + m + ')">' +
    closedBook(NB.map((p) => [p[0] + 13, p[1] + 6]), "#B5794A") +
    closedBook(NB.map((p) => [p[0] - 9, p[1] - 2]), "#8BA07A") + "</g>";
}
/* p3: two closed notebooks in front of the whiteboard, the plate on top */
function stackFront() {
  return '<ellipse cx="494" cy="352" rx="44" ry="5" style="fill:#B17A4B"/>' +
    closedBook([[454, 349], [536, 346], [528, 326], [458, 328]], "#B5794A") +
    closedBook([[452, 342], [532, 339], [524, 319], [456, 321]], "#8BA07A");
}

/* ---- the window sill (top y ~244): three options ---- */
const LEAF = "#6E9A45", LEAF_D = "#4F7A33";
function pot(x, b, w, h, col, colD) {
  return P(wob([[x - 1.5, b - h], [x + w + 1.5, b - h], [x + w - 2, b], [x + 2, b]], .3), col, 1.8) +
    P("M" + f1(x + w * .64) + " " + f1(b - h + 4.6) + " L" + f1(x + w + .2) + " " + f1(b - h + 4.6) + " L" + f1(x + w - 2.6) + " " + f1(b - 1) + " L" + f1(x + w * .68) + " " + f1(b - 1) + "Z", colD) +
    P(wob([[x - 2.6, b - h - 1], [x + w + 2.6, b - h - 1], [x + w + 2.6, b - h + 4.6], [x - 2.6, b - h + 4.6]], .2), col, 1.6);
}
const leaf = (x, y, rx, ry, a, c) => '<ellipse cx="' + f1(x) + '" cy="' + f1(y) + '" rx="' + rx + '" ry="' + ry + '" transform="rotate(' + a + " " + f1(x) + " " + f1(y) + ')" style="fill:' + (c || LEAF) + ";stroke:" + INK + ';stroke-width:1.2"/>';
/* 1: a pot of basil: stems, broad pointed leaves in pairs, a vein down each */
function basilLeaf(x, y, len, wid, a, c) {
  const d = "M0 0 Q" + f1(wid) + " " + f1(-len * .45) + " 0 " + f1(-len) + " Q" + f1(-wid) + " " + f1(-len * .45) + " 0 0Z";
  return '<g transform="translate(' + f1(x) + " " + f1(y) + ") rotate(" + a + ')"><path d="' + d + '" style="fill:' + c + ";stroke:" + INK + ';stroke-width:1.1;stroke-linejoin:round"/><path d="M0 -1 Q' + f1(wid * .15) + " " + f1(-len * .5) + " 0 " + f1(-len * .85) + '" style="fill:none;stroke:#3E6328;stroke-width:.6"/></g>';
}
function sillBasil() {
  const x = 786, b = 246, B = "#6FA347", BD = "#4E7F31";
  let s = "";
  for (const st of [[796, 224, 790, 196], [803, 224, 803, 186], [810, 224, 817, 198]]) s += '<path d="M' + st[0] + " " + st[1] + " Q" + f1((st[0] + st[2]) / 2) + " " + f1((st[1] + st[3]) / 2) + " " + st[2] + " " + st[3] + '" style="fill:none;stroke:#4E7F31;stroke-width:1.4"/>';
  const L = [[796, 222, 11, 6.5, -70, BD], [810, 222, 11, 6.5, 70, BD], [792, 212, 12, 7, -55, B], [814, 213, 12, 7, 55, B], [790, 202, 11, 6.5, -35, BD], [817, 203, 11, 6.5, 35, BD],
    [803, 210, 10, 6, -18, B], [803, 210, 10, 6, 22, B], [790, 196, 10, 6, -8, B], [817, 198, 10, 6, 12, B], [803, 194, 10, 6, -28, BD], [803, 194, 10, 6, 28, BD], [803, 188, 10, 6, 0, B]];
  L.forEach((l) => { s += basilLeaf(l[0], l[1], l[2], l[3], l[4], l[5]); });
  return s + pot(x, b, 34, 24, "#C66A3D", "#A35330");
}
/* 2: a cream jug of flowers */
function sillFlowers() {
  const x = 790, b = 246;
  let s = "";
  const stem = (x1, y1, x2, y2) => '<path d="M' + x1 + " " + y1 + " Q" + f1((x1 + x2) / 2 + 2) + " " + f1((y1 + y2) / 2) + " " + x2 + " " + y2 + '" style="fill:none;stroke:' + INK + ';stroke-width:2.6;stroke-linecap:round"/><path d="M' + x1 + " " + y1 + " Q" + f1((x1 + x2) / 2 + 2) + " " + f1((y1 + y2) / 2) + " " + x2 + " " + y2 + '" style="fill:none;stroke:' + LEAF + ';stroke-width:1.2;stroke-linecap:round"/>';
  const daisy = (cx, cy, r, pet, mid) => { let t = ""; for (let i = 0; i < 8; i++) { const a = i * 45; t += '<ellipse cx="' + f1(cx) + '" cy="' + f1(cy - r * .62) + '" rx="' + f1(r * .3) + '" ry="' + f1(r * .55) + '" transform="rotate(' + a + " " + cx + " " + cy + ')" style="fill:' + pet + ";stroke:" + INK + ';stroke-width:.9"/>'; } return t + '<circle cx="' + cx + '" cy="' + cy + '" r="' + f1(r * .32) + '" style="fill:' + mid + ";stroke:" + INK + ';stroke-width:.9"/>'; };
  const tulip = (cx, cy, c) => P(wob([[cx - 4.5, cy - 4], [cx - 2, cy - 7.5], [cx, cy - 4.5], [cx + 2, cy - 7.5], [cx + 4.5, cy - 4], [cx + 3.6, cy + 3], [cx - 3.6, cy + 3]], .2), c, 1.2);
  s += stem(800, 224, 794, 192) + stem(806, 224, 808, 184) + stem(812, 224, 822, 196) + stem(803, 224, 799, 205);
  s += leaf(793, 214, 3, 8, -35) + leaf(818, 213, 3, 8, 35);
  s += daisy(794, 190, 9, "#FFFBEF", "#F2C230") + tulip(808, 184, "#C8473A") + daisy(822, 195, 7.5, "#F2C230", "#B5794A") + tulip(799, 204, "#E3A9AE");
  s += P(wob([[x + 4, 246], [x + 26, 246], [x + 28, 236], [x + 25, 226], [x + 22, 222], [x + 8, 222], [x + 5, 226], [x + 2, 236]], .3), "#EFE6CF", 1.8);
  s += P(wob([[x + 6, 222], [x + 24, 222], [x + 24.5, 225.5], [x + 5.5, 225.5]], .2), "#EFE6CF", 1.4);
  s += P(wob([[x + 26, 228], [x + 32, 230], [x + 31, 238], [x + 26.5, 239]], .3), "none", 1.6);
  s += '<path d="M' + (x + 17) + " 228 L" + (x + 25) + " 240" + '" style="stroke:#DCCFAF;stroke-width:4;stroke-linecap:round"/><rect x="' + (x + 3) + '" y="233" width="24" height="3.4" style="fill:#8BA07A"/>';
  return s;
}
/* 3: a sun catcher crystal in the window, rainbows on the wall, a small succulent on the sill */
function sillCrystal() {
  const x = 812, top = 34, cy = 150, K = 1.7;
  const ct = cy - 15 * K;
  let s = '<path d="M' + x + " " + top + " L" + x + " " + f1(ct - 1) + '" style="stroke:#6b5a48;stroke-width:.8"/>';
  s += '<circle cx="' + x + '" cy="' + f1(ct - 2.6) + '" r="2.6" style="fill:none;stroke:#C9A24A;stroke-width:1.4"/>';
  for (const b of [[x, ct - 16, 4], [x, ct - 30, 3.2]]) s += '<circle cx="' + b[0] + '" cy="' + f1(b[1]) + '" r="' + b[2] + '" style="fill:#E7F1F4;stroke:' + INK + ';stroke-width:1.1"/><circle cx="' + f1(b[0] - b[2] * .35) + '" cy="' + f1(b[1] - b[2] * .35) + '" r="' + f1(b[2] * .3) + '" style="fill:#fff"/>';
  /* faceted teardrop, drawn at 1.7x about its centre */
  s += '<g transform="translate(' + x + " " + cy + ") scale(" + K + ") translate(" + (-x) + " " + (-cy) + ')">';
  const T = [[x, cy - 15], [x + 7, cy - 6], [x + 8, cy + 4], [x, cy + 20], [x - 8, cy + 4], [x - 7, cy - 6]];
  s += P(wob(T, .1), "#DDEEF2", 1.6);
  s += P("M" + x + " " + (cy - 15) + " L" + (x + 7) + " " + (cy - 6) + " L" + x + " " + (cy - 2) + "Z", "#FFFFFF");
  s += P("M" + x + " " + (cy - 2) + " L" + (x + 8) + " " + (cy + 4) + " L" + x + " " + (cy + 20) + "Z", "#B9D4E2");
  s += P("M" + x + " " + (cy - 2) + " L" + (x - 8) + " " + (cy + 4) + " L" + x + " " + (cy + 20) + "Z", "#CFC3E6");
  s += '<path d="M' + (x - 7) + " " + (cy - 6) + " L" + x + " " + (cy - 2) + " L" + (x + 7) + " " + (cy - 6) + " M" + (x - 8) + " " + (cy + 4) + " L" + (x + 8) + " " + (cy + 4) + " M" + x + " " + (cy - 2) + " V" + (cy + 20) + '" style="fill:none;stroke:#6E8EA0;stroke-width:.7"/>';
  s += "</g>";
  /* little rainbows on the wall, whiteboard and counter */
  const bow = (bx, by, r, a) => { const C = ["#E05A4F", "#F2C230", "#7FB069", "#5B8FD1", "#9C7BC9"]; let t = '<g transform="rotate(' + a + " " + bx + " " + by + ')" opacity=".75">'; C.forEach((c, i) => { t += '<path d="M' + f1(bx - r + i * 1.8) + " " + by + " A" + f1(r - i * 1.8) + " " + f1((r - i * 1.8) * .55) + " 0 0 1 " + f1(bx + r - i * 1.8) + " " + by + '" style="fill:none;stroke:' + c + ';stroke-width:1.8"/>'; }); return t + "</g>"; };
  s += bow(668, 175, 14, -15) + bow(630, 222, 11, 10) + bow(548, 175, 12, -5) + bow(712, 298, 12, 0);
  /* succulent in a small pot */
  const sx = 794, b = 246;
  let r = "";
  for (const l of [[sx + 13, 222, 4, 9, 0], [sx + 6, 226, 3.6, 8, -48], [sx + 20, 226, 3.6, 8, 48], [sx + 9, 220, 3.2, 7, -20], [sx + 17, 220, 3.2, 7, 20]]) r += leaf(l[0], l[1], l[2], l[3], l[4], "#8FB08A");
  return s + '<g transform="translate(807 246) scale(1.25) translate(-807 -246)">' + r + pot(sx, b, 26, 17, "#C66A3D", "#A35330") + "</g>";
}
/* sill pieces drawn a quarter bigger, standing on the sill (crystal and rainbows stay where they are) */
const sillAt = (k) => k === "3" ? SILL[k][1]() : '<g transform="translate(803 246) scale(1.25) translate(-803 -246)">' + SILL[k][1]() + "</g>";
const SILL = { 1: ["A pot of basil", sillBasil], 2: ["A jug of flowers", sillFlowers], 3: ["Sun catcher crystal and a succulent", sillCrystal] };
/* ---- whiteboard marker on the bottom tray: cream barrel, tomato cap and band ---- */
function marker() {
  const x = 470, y = 288.6;
  return '<g transform="rotate(-2 ' + x + " " + y + ')">' +
    P(wob([[x, y], [x + 22, y], [x + 22, y + 4.2], [x, y + 4.2]], .15), "#F1ECDD", 1.1) +
    P(wob([[x + 21, y - 0.4], [x + 30, y - 0.4], [x + 31.5, y + 2.1], [x + 30, y + 4.6], [x + 21, y + 4.6]], .15), "#C8473A", 1.1) +
    '<rect x="' + (x + 2) + '" y="' + (y + 1.2) + '" width="10" height="1.6" style="fill:#C8473A"/>' +
    '<path d="M' + x + " " + (y + 0.6) + " L" + (x - 3) + " " + (y + 2.1) + " L" + x + " " + (y + 3.6) + 'Z" style="fill:#3a3a40;stroke:' + INK + ';stroke-width:.8;stroke-linejoin:round"/></g>';
}

/* ---- the open wall cupboard: left door of the pair, hinge on its left (x 132.7), 132.7 wide; with the taller frame the
        door runs from above the top edge (y -48) to y 102.5. Swung 125 degrees so its inside faces us and the clipboard keeps
        its shape. One-point projection: vanishing point (434, 240), viewer 900 units back ---- */
const DOOR = { x0: 132.7, W: 132.7, yt: -48, yb: 102.5 }, VP = [434, 240], F = 900, TH = 125, H_DOOR = DOOR.yb - DOOR.yt;
function proj(X, Y, Z) { const s = F / (F - Z); return [VP[0] + (X - VP[0]) * s, VP[1] + (Y - VP[1]) * s]; }
/* a point on the door at (u across from the hinge, v down), n = offset off the inside face */
function on(u, v, n) { const t = TH * Math.PI / 180; n = n || 0; return proj(DOOR.x0 + u * DOOR.W * Math.cos(t) + n * Math.sin(t), DOOR.yt + v * H_DOOR, u * DOOR.W * Math.sin(t) - n * Math.cos(t)); }
function interior(v) {
  const x0 = DOOR.x0, x1 = x0 + DOOR.W, y1 = DOOR.yb, dep = 60, bk = (X, Y) => proj(X, Y, -dep), cid = v + "-op";
  let s = '<clipPath id="' + cid + '"><rect x="' + x0 + '" y="' + (DOOR.yt - 10) + '" width="' + DOOR.W + '" height="' + (y1 - DOOR.yt + 10) + '"/></clipPath><g clip-path="url(#' + cid + ')">';
  s += P(wob([[x0, DOOR.yt - 6], [x1, DOOR.yt - 6], [x1, y1 + 4], [x0, y1 + 4]], .3), cab(30));   /* back wall */
  const b0 = bk(x0, DOOR.yt), b1 = bk(x0, y1);
  s += P("M" + x0 + " " + (DOOR.yt - 6) + " L" + f1(b0[0]) + " " + (DOOR.yt - 6) + " L" + f1(b1[0]) + " " + f1(b1[1]) + " L" + x0 + " " + y1 + "Z", cab(44));   /* left side wall */
  const jar = (x, w, t, bot, lid, glass) => P(wob([[x, t + 3], [x + w, t + 3], [x + w, bot], [x, bot]], .25), glass, 1.3) + P(wob([[x - 0.8, t], [x + w + 0.8, t], [x + w + 0.8, t + 3.6], [x - 0.8, t + 3.6]], .15), lid, 1.1);
  const shelf = (sy) => { const u0 = bk(x0, sy + 3.5), u1 = bk(x1, sy + 3.5); return P("M" + x0 + " " + (sy + 3.5) + " L" + x1 + " " + (sy + 3.5) + " L" + f1(u1[0]) + " " + f1(u1[1]) + " L" + f1(u0[0]) + " " + f1(u0[1]) + "Z", cab(52)); };
  const edge = (sy) => P("M" + x0 + " " + sy + " H" + x1 + " V" + (sy + 3.5) + " H" + x0 + "Z", cab(66), 1.3);
  /* top shelf (y 3): tins and a stack of bowls; middle shelf (y 52): jars; floor: flour tin, sugar jar, a box of cases */
  s += shelf(3) + jar(146, 22, -30, 3, "#9C9892", "#D8C9A4") + jar(174, 14, -18, 3, "#C8473A", "#EFE6CF") +
    P(wob([[200, -6], [240, -6], [236, 3], [204, 3]], .3), "#EFE6CF", 1.3) + P(wob([[203, -13], [237, -13], [233, -6], [207, -6]], .3), "#8BA07A", 1.3) + P(wob([[206, -20], [234, -20], [230, -13], [210, -13]], .3), "#F0C86A", 1.3) +
    jar(246, 14, -22, 3, "#B17A4B", "#E9DDBE") + edge(3);
  s += shelf(52) + jar(150, 17, 20, 52, "#C8473A", "#E9DDBE") + jar(172, 13, 28, 52, "#B17A4B", "#EFE6CF") + jar(214, 22, 16, 52, "#9C9892", "#D8C9A4") + jar(242, 13, 26, 52, "#8BA07A", "#EFE6CF") + edge(52);
  s += jar(158, 30, 70, y1 + 2, "#E0B450", "#F0C86A") + jar(206, 15, 64, y1 + 2, "#B17A4B", "#E9DDBE") + jar(226, 26, 80, y1 + 2, "#9C9892", "#CFC8B8");
  s += "</g>" + P(wob([[x0, DOOR.yt - 6], [x1, DOOR.yt - 6], [x1, y1], [x0, y1]], .3), "none", 2.4);
  return s;
}
/* clipboard: a real one is about 9 x 12.5 in; here 66 wide, 92 tall on the door */
function clipboard() {
  const uL = .2, uR = uL + 66 / DOOR.W, vT = .36, vB = vT + 92 / H_DOOR, q = (pts, n) => pts.map((p) => on(p[0], p[1], n));
  const pu = (a) => uL + (uR - uL) * a, pv = (a) => vT + (vB - vT) * a;
  /* shadow on the door, down and toward the hinge, then the board's edge (it stands off the door), then its face */
  let s = P(wob(q([[uL - .035, vT + .03], [uR - .035, vT + .03], [uR - .035, vB + .035], [uL - .035, vB + .035]], .2), .4), cab(58));
  s += P(wob(q([[uL, vB], [uR, vB], [uR, vB + .022], [uL, vB + .022]], 1), .2), "#7E4F2C", 1.4) + P(wob(q([[uL, vT], [uL, vB + .022], [uL - .012, vB + .02], [uL - .012, vT + .004]], 1), .1), "#8A5A33", 1.2);
  s += P(wob(q([[uL, vT], [uR, vT], [uR, vB], [uL, vB]], 3), .4), "#B57D4B", 1.7);
  s += P(wob(q([[pu(.08), pv(.07)], [pu(.92), pv(.07)], [pu(.92), pv(.96)], [pu(.08), pv(.96)]], 3.2), .3), PAPER, 1);
  for (let a = .2; a < .93; a += .065) { const p1 = on(pu(.16), pv(a), 1.3), p2 = on(pu(.84), pv(a), 1.3); s += '<path d="M' + f1(p1[0]) + " " + f1(p1[1]) + " L" + f1(p2[0]) + " " + f1(p2[1]) + '" style="stroke:' + RULE + ';stroke-width:.8"/>'; }
  { const p1 = on(pu(.16), pv(.13), 1.3), p2 = on(pu(.6), pv(.13), 1.3); s += '<path d="M' + f1(p1[0]) + " " + f1(p1[1]) + " L" + f1(p2[0]) + " " + f1(p2[1]) + '" style="stroke:#9C9892;stroke-width:1.3"/>'; }
  s += P(wob(q([[pu(.3), pv(-.025)], [pu(.7), pv(-.025)], [pu(.66), pv(.075)], [pu(.34), pv(.075)]], 1.6), .2), "#C5BEB0", 1.2);
  const n = on(pu(.5), vT - .08, 0), c1 = on(pu(.4), pv(-.02), 1.6), c2 = on(pu(.6), pv(-.02), 1.6);
  s += '<path d="M' + f1(c1[0]) + " " + f1(c1[1]) + " L" + f1(n[0]) + " " + f1(n[1]) + " L" + f1(c2[0]) + " " + f1(c2[1]) + '" style="fill:none;stroke:#3a332b;stroke-width:.9"/><circle cx="' + f1(n[0]) + '" cy="' + f1(n[1]) + '" r="1.6" style="fill:#9A6A2E;stroke:' + INK + ';stroke-width:.8"/>';
  return s;
}
function cupOpen(v) {
  const c = (u, vv) => on(u, vv, 0), t = 3.2, e = (vv) => on(1, vv, -t);
  let door = interior(v);
  door += P(wob([c(1, 0), e(0), e(1), c(1, 1)], .2), cab(60), 1.6);
  door += P(wob([c(0, 0), c(1, 0), c(1, 1), c(0, 1)], .5), cab(84), 2.2);
  door += P(wob([c(.66, .01), c(.99, .01), c(.99, .99), c(.66, .99)], .2), cab(91, "#fff"));   /* light on the outer part */
  door += P(wob([c(.07, .05), c(.93, .05), c(.93, .95), c(.07, .95)], .3), "none", .9);
  return door;
}

module.exports = {
  DEF, ECL, SILL, SPOT,
  opts(v) {
    seed = 7;
    let ecl = "";
    for (const sp of Object.keys(SPOT)) for (const e of Object.keys(ECL)) ecl += V("ecl-" + e + " spot-" + sp, eclairOn(e, SPOT[sp][0], SPOT[sp][1], SPOT[sp][2]));
    return { end: [{ obj: "whiteboard", svg: marker() },
      { obj: "notebook", svg: V("spot-p2", stackUnder(v)) + V("spot-p3", stackFront()), top: true },
      { obj: "eclair", svg: ecl, top: true },
      { obj: "sill", svg: Object.keys(SILL).map((k) => V("sill-" + k, sillAt(k))).join(""), top: true },
      { obj: "cup-open", svg: cupOpen(v), top: true }, { obj: "clip", svg: clipboard(), top: true }] };
  },
  /* close-ups for the page: each eclair at spot p2, each sill option; drawn over a <use> of the scene */
  closeups() {
    seed = 11;
    const out = [];
    for (const e of Object.keys(ECL)) out.push({ group: "ecl", key: e, title: "E" + e + " · " + ECL[e].name, vb: "440 326 108 47", svg: eclairOn(e, SPOT.p2[0], SPOT.p2[1], 1) });
    for (const k of Object.keys(SILL)) out.push({ group: "sill", key: k, title: "S" + k + " · " + SILL[k][0], vb: k === "3" ? "620 20 242 250" : "730 130 142 124", svg: sillAt(k) });
    return out;
  },
};
