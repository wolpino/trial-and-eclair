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

/* ---- options on the page: each is a <g data-var="key-value ..."> shown only when every key matches the page's choice.
        DEF = what shows first (Claude's picks). ---- */
const DEF = { nb: "n1", nbx: "1", box: "2", ecl: "0", sill: "1" };
function V(tokens, svg) {
  const on = tokens.split(" ").every((t) => { const i = t.indexOf("-"); return DEF[t.slice(0, i)] === t.slice(i + 1); });
  return '<g data-var="' + tokens + '"' + (on ? "" : ' style="display:none"') + ">" + svg + "</g>";
}
let uid = 0;
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
/* a point on a quad [bl, br, tr, tl]: u across, v down from the top edge */
const onQuad = (q, u, v) => lerp(lerp(q[3], q[2], u), lerp(q[0], q[1], u), v);

/* ---- the eclair: E1 (glossy, like the logo) with a bite out of it, on a plain plate between the box and the notebook ---- */
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
    const R = x0 + L + 3, bx = x0 + L - (o.bite - 1) * 14, by = y0 + H * .5, id = "bite" + (++biteN);
    const cut = "M" + f1(R) + " " + f1(y0 - 3) + " L" + f1(bx - 7) + " " + f1(y0 - 3) + " Q" + f1(bx - 10.5) + " " + f1(y0 + 2) + " " + f1(bx - 8.5) + " " + f1(y0 + 5) + " Q" + f1(bx - 12) + " " + f1(by) + " " + f1(bx - 8.8) + " " + f1(by + 3.5) + " Q" + f1(bx - 11.5) + " " + f1(base - 3) + " " + f1(bx - 6.5) + " " + f1(base + 3) + " L" + f1(R) + " " + f1(base + 3) + "Z";
    s = '<mask id="' + id + '" maskUnits="userSpaceOnUse" x="' + f1(x0 - 10) + '" y="' + f1(y0 - 10) + '" width="' + f1(L + 20) + '" height="' + f1(H + 20) + '"><rect x="' + f1(x0 - 10) + '" y="' + f1(y0 - 10) + '" width="' + f1(L + 20) + '" height="' + f1(H + 20) + '" fill="#fff"/><path d="' + cut + '" fill="#000"/></mask><g mask="url(#' + id + ')">' + s + "</g>";
    s += P(wob([[bx - 6.6, y0 + .5], [bx - 9.4, y0 + 4.6], [bx - 10.8, by], [bx - 8.6, by + 3.4], [bx - 9.8, base - 3.6], [bx - 6.6, base + .4], [bx - 4.6, by + 1], [bx - 4.8, y0 + 3.6]], .3), CREAM, 1.4);
    s += '<path d="M' + f1(bx - 7.6) + " " + f1(y0 + 6) + " q-1.6 3 0 6" + '" style="fill:none;stroke:#E2C985;stroke-width:.9"/>';
  }
  return s;
}
let biteN = 0;
const ECL = { L: 60, H: 19, o: { ridges: 1, stitch: 1 } };
/* n = bites taken: 0 whole, 1, 2, 3 gone (plate and crumbs). The page takes a bite per click; a reload brings it back */
function eclair(n) {
  const cx = 222, cy = 362, base = cy - 1.2;
  let s = plate(cx, cy, 1, "plain");
  if (n) for (const c of [[-24, 1.5], [-18, 3.4], [20, 2.6], [27, .6], [-6, 4.2], [31, -1.4], [8, 3], [-30, -.4]].slice(0, 3 + n * 2)) s += '<circle cx="' + f1(cx + c[0]) + '" cy="' + f1(cy + c[1] - 2) + '" r=".9" style="fill:' + CHOUX_D + '"/>';
  if (n === 3) return s;
  return s + '<g transform="rotate(-4 ' + cx + " " + f1(base) + ')">' + eclairBody(cx, base, ECL.L, ECL.H, Object.assign({}, ECL.o, n ? { bite: n } : {})) + "</g>";
}

/* ---- the window: a bushy basil on the sill, a crystal mobile in the glass, rainbow beams across the wall ---- */
const LEAF = "#6E9A45", LEAF_D = "#4F7A33";
function pot(x, b, w, h, col, colD) {
  return P(wob([[x - 1.5, b - h], [x + w + 1.5, b - h], [x + w - 2, b], [x + 2, b]], .3), col, 1.8) +
    P("M" + f1(x + w * .64) + " " + f1(b - h + 4.6) + " L" + f1(x + w + .2) + " " + f1(b - h + 4.6) + " L" + f1(x + w - 2.6) + " " + f1(b - 1) + " L" + f1(x + w * .68) + " " + f1(b - 1) + "Z", colD) +
    P(wob([[x - 2.6, b - h - 1], [x + w + 2.6, b - h - 1], [x + w + 2.6, b - h + 4.6], [x - 2.6, b - h + 4.6]], .2), col, 1.6);
}
const leaf = (x, y, rx, ry, a, c) => '<ellipse cx="' + f1(x) + '" cy="' + f1(y) + '" rx="' + rx + '" ry="' + ry + '" transform="rotate(' + a + " " + f1(x) + " " + f1(y) + ')" style="fill:' + (c || LEAF) + ";stroke:" + INK + ';stroke-width:1.2"/>';
function basilLeaf(x, y, len, wid, a, c) {
  const d = "M0 0 Q" + f1(wid) + " " + f1(-len * .45) + " 0 " + f1(-len) + " Q" + f1(-wid) + " " + f1(-len * .45) + " 0 0Z";
  return '<g transform="translate(' + f1(x) + " " + f1(y) + ") rotate(" + a + ')"><path d="' + d + '" style="fill:' + c + ";stroke:" + INK + ';stroke-width:1.1;stroke-linejoin:round"/><path d="M0 -1 Q' + f1(wid * .15) + " " + f1(-len * .5) + " 0 " + f1(-len * .85) + '" style="fill:none;stroke:#3E6328;stroke-width:.6"/></g>';
}
/* ---- the sill: three options that bring light in, drawn in the trace's look ---- */
const SILLC = 803, SILLB = 246;
const atSill = (svg) => '<g transform="translate(' + SILLC + " " + SILLB + ") scale(1.3) translate(" + (-SILLC) + " " + (-SILLB) + ')">' + svg + "</g>";
/* 1: coloured glass bottles, light through them pooling on the sill, one holding a single flower */
function bottle(x, w, h, nh, col, lt, dk) {
  const b = SILLB, nw = w * .34, cx = x + w / 2, sh = b - h;
  const body = "M" + f1(x + 1.5) + " " + b + " Q" + x + " " + b + " " + x + " " + f1(b - 2) + " V" + f1(sh + 5) + " Q" + x + " " + sh + " " + f1(cx - nw) + " " + f1(sh - 2) + " V" + f1(sh - nh) + " H" + f1(cx + nw) + " V" + f1(sh - 2) + " Q" + f1(x + w) + " " + sh + " " + f1(x + w) + " " + f1(sh + 5) + " V" + f1(b - 2) + " Q" + f1(x + w) + " " + b + " " + f1(x + w - 1.5) + " " + b + "Z";
  return '<ellipse cx="' + f1(cx + 2) + '" cy="' + (b + 1.2) + '" rx="' + f1(w * .75) + '" ry="1.6" style="fill:' + lt + ';opacity:.8"/>' +
    P(body, col, 1.7) +
    P("M" + f1(x + w * .62) + " " + f1(sh + 4) + " Q" + f1(x + w - 1) + " " + f1(sh + 4) + " " + f1(x + w - 1) + " " + f1(sh + 8) + " V" + f1(b - 2.5) + " H" + f1(x + w * .66) + "Z", dk) +
    '<path d="M' + f1(x + w * .26) + " " + f1(sh + 6) + " V" + f1(b - 5) + '" style="stroke:' + lt + ';stroke-width:2.2;stroke-linecap:round"/>' +
    P(wob([[cx - nw - .8, sh - nh - 2.4], [cx + nw + .8, sh - nh - 2.4], [cx + nw + .8, sh - nh], [cx - nw - .8, sh - nh]], .1), col, 1.3);
}
function sillBottles() {
  let s = "";
  /* a single flower in the tall bottle */
  s += '<path d="M806 206 Q804 196 808 186" style="fill:none;stroke:' + INK + ';stroke-width:2.6;stroke-linecap:round"/><path d="M806 206 Q804 196 808 186" style="fill:none;stroke:#6E9A45;stroke-width:1.2;stroke-linecap:round"/>';
  s += P(wob([[805, 197], [799, 192], [801, 190], [806, 194]], .1), "#6E9A45", 1.1);
  for (let i = 0; i < 5; i++) { const a = i * 72 * Math.PI / 180; s += '<ellipse cx="' + f1(808 + Math.sin(a) * 3.6) + '" cy="' + f1(185 - Math.cos(a) * 3.6) + '" rx="2.6" ry="3.6" transform="rotate(' + (i * 72) + " " + f1(808 + Math.sin(a) * 3.6) + " " + f1(185 - Math.cos(a) * 3.6) + ')" style="fill:#C8473A;stroke:' + INK + ';stroke-width:1"/>'; }
  s += '<circle cx="808" cy="185" r="2" style="fill:#F2C230;stroke:' + INK + ';stroke-width:.9"/>';
  s += bottle(783, 14, 22, 7, "#E9A23B", "#F7D58E", "#C9822A") + bottle(799, 13, 30, 10, "#8DB38A", "#C8E0C2", "#6E9670") + bottle(815, 15, 18, 5, "#7EA6C8", "#C3D9EA", "#5F87AA");
  return atSill(s);
}
/* 2: a bowl of lemons */
function sillLemons() {
  let s = "";
  const lemon = (x, y, rx, ry, a) => '<g transform="rotate(' + a + " " + x + " " + y + ')"><ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" style="fill:#F2D24A;stroke:' + INK + ';stroke-width:1.4"/>' +
    '<path d="M' + f1(x + rx - .5) + " " + f1(y - 1.2) + " l2.2 1.2 l-2.2 1.2" + '" style="fill:#F2D24A;stroke:' + INK + ';stroke-width:1;stroke-linejoin:round"/>' +
    '<path d="M' + f1(x + rx * .2) + " " + f1(y + ry * .2) + " Q" + f1(x + rx * .7) + " " + f1(y + ry * .1) + " " + f1(x + rx * .8) + " " + f1(y - ry * .5) + " L" + f1(x + rx * .9) + " " + f1(y + ry * .5) + " Q" + f1(x + rx * .3) + " " + f1(y + ry * .9) + " " + f1(x - rx * .2) + " " + f1(y + ry * .7) + 'Z" style="fill:#D9B23A"/>' +
    '<path d="M' + f1(x - rx * .55) + " " + f1(y - ry * .35) + " q" + f1(rx * .3) + " " + f1(-ry * .3) + " " + f1(rx * .6) + " " + f1(-ry * .3) + '" style="fill:none;stroke:#FBEFA8;stroke-width:1.3;stroke-linecap:round"/></g>';
  s += lemon(796, 225, 8, 6, -20) + lemon(812, 224, 8, 6, 15) + P(wob([[803, 218], [811, 211], [815, 214], [807, 220]], .2), "#6E9A45", 1.2) + lemon(804, 228, 8.4, 6.2, 5);
  s += P("M783 232 H825 Q824 246 812 246 H796 Q784 246 783 232Z", "#F3EEDF", 1.8) + P("M808 233 H824.5 Q823 245 812 245.5 H808Z", "#DCD4BE") +
    '<path d="M784.5 237 H823.5" style="stroke:#7EA6C8;stroke-width:2.2"/><ellipse cx="804" cy="232" rx="21" ry="2.2" style="fill:none;stroke:' + INK + ';stroke-width:1.6"/>';
  return atSill(s);
}
/* 3: a glass jar of daisies and buttercups, chunky, flat colours */
function sillJar() {
  let s = "";
  const stem = (x1, y1, x2, y2) => '<path d="M' + x1 + " " + y1 + " Q" + f1((x1 + x2) / 2 + 1.5) + " " + f1((y1 + y2) / 2) + " " + x2 + " " + y2 + '" style="fill:none;stroke:' + INK + ';stroke-width:2.8;stroke-linecap:round"/><path d="M' + x1 + " " + y1 + " Q" + f1((x1 + x2) / 2 + 1.5) + " " + f1((y1 + y2) / 2) + " " + x2 + " " + y2 + '" style="fill:none;stroke:#6E9A45;stroke-width:1.3;stroke-linecap:round"/>';
  const flower = (cx, cy, r, pet, petD, mid, n) => { let t = ""; for (let i = 0; i < n; i++) { const a = i * 360 / n; t += '<ellipse cx="' + cx + '" cy="' + f1(cy - r * .6) + '" rx="' + f1(r * .36) + '" ry="' + f1(r * .55) + '" transform="rotate(' + a + " " + cx + " " + cy + ')" style="fill:' + (i % 2 ? petD : pet) + ";stroke:" + INK + ';stroke-width:1.1"/>'; } return t + '<circle cx="' + cx + '" cy="' + cy + '" r="' + f1(r * .34) + '" style="fill:' + mid + ";stroke:" + INK + ';stroke-width:1.1"/>'; };
  s += stem(799, 224, 791, 196) + stem(804, 224, 805, 186) + stem(809, 224, 818, 195) + stem(802, 224, 798, 206) + stem(807, 224, 812, 205);
  s += P(wob([[796, 213], [787, 209], [789, 206], [797, 210]], .2), "#6E9A45", 1.1) + P(wob([[811, 212], [820, 207], [821, 210], [812, 214]], .2), "#4F7A33", 1.1);
  s += flower(791, 195, 9, "#FFFBEF", "#EFE8D6", "#F2C230", 6) + flower(805, 185, 9.5, "#FFFBEF", "#EFE8D6", "#F2C230", 6) + flower(818, 194, 8.5, "#FFFBEF", "#EFE8D6", "#F2C230", 6) +
    flower(798, 205, 6.5, "#F2C230", "#E0AE28", "#C9822A", 5) + flower(812, 204, 6.5, "#F2C230", "#E0AE28", "#C9822A", 5);
  /* clear jar: pale glass, stems through the water, a light edge */
  s += P(wob([[790, 222], [818, 222], [819, 244], [816, 246], [792, 246], [789, 244]], .3), "#DCEBEE", 1.8);
  s += P("M790.5 232 H818.5 V244 Q818 245.6 816 245.6 H792 Q790.4 245.6 790.4 244Z", "#C6DEE4");
  s += '<path d="M799 232 L800 245 M804 232 V245 M809 232 L808 245" style="stroke:#6E9A45;stroke-width:1.2"/><path d="M793 225 V243" style="stroke:#fff;stroke-width:1.8;stroke-linecap:round"/>';
  s += P(wob([[789, 220], [819, 220], [819, 223.5], [789, 223.5]], .1), "#DCEBEE", 1.4);
  return atSill(s);
}
const SILL = { 1: ["Coloured glass bottles, one flower", sillBottles], 2: ["A bowl of lemons", sillLemons], 3: ["A glass jar of daisies and buttercups", sillJar] };
function crystal(x, y, h) {   /* a long hexagonal prism, point down */
  const w = h * .2;
  return '<path d="M' + x + " " + f1(y - 1.5) + " V" + y + '" style="stroke:#6b5a48;stroke-width:.6"/>' +
    P("M" + x + " " + y + " L" + f1(x + w) + " " + f1(y + h * .22) + " L" + f1(x + w) + " " + f1(y + h * .72) + " L" + x + " " + f1(y + h) + " L" + f1(x - w) + " " + f1(y + h * .72) + " L" + f1(x - w) + " " + f1(y + h * .22) + "Z", "#E2EEF3", 1.2) +
    P("M" + x + " " + y + " L" + f1(x + w) + " " + f1(y + h * .22) + " L" + f1(x + w) + " " + f1(y + h * .72) + " L" + x + " " + f1(y + h) + "Z", "#BFD6E2") +
    '<path d="M' + f1(x - w * .35) + " " + f1(y + h * .25) + " V" + f1(y + h * .66) + '" style="stroke:#fff;stroke-width:1.1;stroke-linecap:round"/>' +
    '<path d="M' + x + " " + y + " L" + f1(x + w) + " " + f1(y + h * .22) + " L" + f1(x + w) + " " + f1(y + h * .72) + " L" + x + " " + f1(y + h) + " L" + f1(x - w) + " " + f1(y + h * .72) + " L" + f1(x - w) + " " + f1(y + h * .22) + 'Z" style="fill:none;stroke:' + INK + ';stroke-width:1.1;stroke-linejoin:round"/>';
}
function mobile() {
  const hx = 800, hy = 30, ry = 72;
  let s = '<path d="M' + hx + " " + hy + " L" + (hx - 15) + " " + ry + " M" + hx + " " + hy + " L" + (hx + 15) + " " + ry + " M" + hx + " " + hy + " L" + hx + " " + (ry - 2.5) + '" style="stroke:#6b5a48;stroke-width:.7"/>' +
    '<circle cx="' + hx + '" cy="' + hy + '" r="1.6" style="fill:#C9A24A;stroke:' + INK + ';stroke-width:.7"/>';
  s += '<ellipse cx="' + hx + '" cy="' + ry + '" rx="15" ry="3" style="fill:none;stroke:' + INK + ';stroke-width:2.2"/><ellipse cx="' + hx + '" cy="' + ry + '" rx="15" ry="3" style="fill:none;stroke:#C9A24A;stroke-width:1"/>';
  for (const c of [[hx - 14, ry, 14, 24], [hx, ry - 3, 8, 22], [hx + 14, ry, 22, 24], [hx, ry + 3, 34, 26]]) s += '<path d="M' + c[0] + " " + c[1] + " V" + (c[1] + c[2]) + '" style="stroke:#6b5a48;stroke-width:.6"/>' + crystal(c[0], c[1] + c[2], c[3]);
  return s;
}
function beams(v) {
  /* long soft rainbow bands from the crystals: down-left across the wall and whiteboard, and a short one up-right */
  const C = ["#E05A4F", "#F2A33A", "#F2D24A", "#7FB069", "#5B8FD1", "#9C7BC9"], id = v + "-bm" + (++uid);
  const band = (x1, y1, x2, y2, w) => {
    const len = Math.hypot(x2 - x1, y2 - y1), nx = -(y2 - y1) / len, ny = (x2 - x1) / len, g = id + "g" + (++uid);
    let t = '<linearGradient id="' + g + '" gradientUnits="userSpaceOnUse" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".25" stop-color="#fff" stop-opacity=".9"/><stop offset=".8" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<mask id="' + g + 'm" maskUnits="userSpaceOnUse" x="0" y="-60" width="868" height="560"><rect x="0" y="-60" width="868" height="560" fill="url(#' + g + ')"/></mask><g mask="url(#' + g + 'm)" opacity=".45">';
    C.forEach((c, i) => { const o = (i - 2.5) * w; t += '<path d="M' + f1(x1 + nx * o) + " " + f1(y1 + ny * o) + " L" + f1(x2 + nx * o * 1.6) + " " + f1(y2 + ny * o * 1.6) + '" style="stroke:' + c + ";stroke-width:" + f1(w * 1.3) + '"/>'; });
    return t + "</g>";
  };
  return band(790, 120, 600, 214, 1.6) + band(800, 150, 640, 262, 1.4) + band(814, 98, 862, 70, 1.3);
}
/* window frame in any colour: on .trim-on, each traced frame shade becomes var(--trim) mixed lighter or darker by the same step */
const TRIM = { "#F6E9CB": [100, "#fff"], "#E8DCB0": [80, "#fff"], "#DDD3BB": [84, "#1f1d1a"], "#DAD4C2": [84, "#1f1d1a"], "#C5BEB0": [72, "#1f1d1a"], "#B5AA92": [64, "#1f1d1a"], "#D4A36F": [74, "#1f1d1a"], "#9D6F45": [56, "#1f1d1a"] };

/* ---- composition notebooks: black marbled cover, a white label, black spine tape, cream page edges ---- */
/* ---- notebooks: a closed one is a quad on the counter with its front edge (pages) showing ---- */
function closedBook(pts, cover, edge) {
  const [bl, br, tr, tl] = pts, t = 3.6;
  return P(wob([bl, br, [br[0], br[1] + t], [bl[0], bl[1] + t]], .2), edge || "#F1EAD6", 1.4) +
    P(wob([bl, br, tr, tl], .4), cover, 1.8) +
    '<path d="M' + f1(bl[0] + 2) + " " + f1(bl[1] + t * .5) + " L" + f1(br[0] - 2) + " " + f1(br[1] + t * .5) + '" style="stroke:#CFC6AE;stroke-width:.7"/>';
}
/* the open notebook's outline on the counter (BL, BR, TR, TL) */
const NB = [[272, 371], [442, 360], [425, 314], [260, 327]];
function compBook(q, label) {
  const [bl, br, tr, tl] = q, t = 4, id = "cb" + (++uid);
  let s = P(wob([bl, br, [br[0], br[1] + t], [bl[0], bl[1] + t]], .2), "#F1EAD6", 1.4) +
    '<path d="M' + f1(bl[0] + 2) + " " + f1(bl[1] + t * .5) + " L" + f1(br[0] - 2) + " " + f1(br[1] + t * .5) + '" style="stroke:#CFC6AE;stroke-width:.7"/>';
  s += '<clipPath id="' + id + '"><path d="M' + q.map((p) => f1(p[0]) + " " + f1(p[1])).join(" L") + 'Z"/></clipPath>';
  s += P(wob(q, .3), "#1E1C1A", 1.8) + '<g clip-path="url(#' + id + ')">';
  const xs = q.map((p) => p[0]), ys = q.map((p) => p[1]), X0 = Math.min(...xs), X1 = Math.max(...xs), Y0 = Math.min(...ys), Y1 = Math.max(...ys);
  for (let i = 0; i < (X1 - X0) * (Y1 - Y0) / 30; i++) {   /* the marble: short curly white strokes */
    const x = X0 + rnd() * (X1 - X0), y = Y0 + rnd() * (Y1 - Y0), r = .8 + rnd() * 1.6, a = rnd() * 6.28;
    s += '<path d="M' + f1(x) + " " + f1(y) + " q" + f1(Math.cos(a) * r) + " " + f1(Math.sin(a) * r - r * .6) + " " + f1(Math.cos(a) * r * 2) + " " + f1(Math.sin(a) * r * 2) + '" style="fill:none;stroke:#EDE8DC;stroke-width:.6;stroke-linecap:round"/>';
  }
  s += P("M" + [onQuad(q, 0, 0), onQuad(q, .1, 0), onQuad(q, .1, 1), onQuad(q, 0, 1)].map((p) => f1(p[0]) + " " + f1(p[1])).join(" L") + "Z", "#111") + "</g>";
  if (label) {
    const L = [onQuad(q, .36, .62), onQuad(q, .78, .62), onQuad(q, .78, .3), onQuad(q, .36, .3)];
    s += P(wob(L, .15), "#FAF8E8", 1.2);
    for (const v of [.55, .7]) { const a = onQuad(L, .14, v), b = onQuad(L, .86, v); s += '<path d="M' + f1(a[0]) + " " + f1(a[1]) + " L" + f1(b[0]) + " " + f1(b[1]) + '" style="stroke:#9C9892;stroke-width:.7"/>'; }
  }
  return s;
}
/* n1: two composition books under the open notebook, showing only outside it (the notebook's own shape masks them) */
function stackUnder(v) {
  const m = v + "-nonb";
  return '<mask id="' + m + '" maskUnits="userSpaceOnUse" x="0" y="0" width="868" height="489"><rect width="868" height="489" fill="#fff"/><use href="#' + v + '-mk-notebook" fill="#000" stroke="#000" stroke-width="6" stroke-linejoin="round"/></mask>' +
    '<g mask="url(#' + m + ')">' + compBook(NB.map((p) => [p[0] + 13, p[1] + 6])) + compBook(NB.map((p) => [p[0] - 9, p[1] - 2])) + "</g>";
}
/* n2: two composition books stacked in front of the whiteboard, the top one labelled */
function stackFront() {
  return '<ellipse cx="496" cy="353" rx="46" ry="5" style="fill:#B17A4B"/>' +
    compBook([[454, 350], [538, 346], [529, 324], [459, 327]]) + compBook([[451, 342], [533, 340], [526, 317], [455, 319]], true);
}

/* ---- the open notebook, more lived in: sticky tabs off the right page, a ribbon, a taped photo, a pencil doodle ---- */
function nbExtras() {
  const A = [404, 315], B = [439, 354], len = Math.hypot(B[0] - A[0], B[1] - A[1]), d = [(B[0] - A[0]) / len, (B[1] - A[1]) / len], n = [d[1], -d[0]];
  let s = "";
  [[.22, "#C8473A"], [.42, "#F2C230"], [.62, "#8BA07A"]].forEach(([t, c]) => {
    const c0 = [A[0] + d[0] * len * t, A[1] + d[1] * len * t], h = 3.6, o = 6;
    const pts = [[c0[0] - d[0] * h - n[0] * 1.5, c0[1] - d[1] * h - n[1] * 1.5], [c0[0] + d[0] * h - n[0] * 1.5, c0[1] + d[1] * h - n[1] * 1.5], [c0[0] + d[0] * h + n[0] * o, c0[1] + d[1] * h + n[1] * o], [c0[0] - d[0] * h + n[0] * o, c0[1] - d[1] * h + n[1] * o]];
    s += P(wob(pts, .1), c, 1.1);
  });
  /* ribbon from the spiral down onto the counter */
  s += '<path d="M362 362 Q360 372 354 379 L351 384 L355 382 L357 386 L359 378 Q364 371 365 362Z" style="fill:#C8473A;stroke:' + INK + ';stroke-width:1;stroke-linejoin:round"/>';
  /* a small photo taped to the left page */
  s += '<g transform="rotate(-8 290 333)">' + P(wob([[280, 324], [301, 324], [301, 345], [280, 345]], .2), "#FAF8E8", 1.1) +
    P(wob([[282.5, 326.5], [298.5, 326.5], [298.5, 340], [282.5, 340]], .1), "#D9B98E") +
    '<rect x="284" y="331" width="13" height="5" rx="2.5" style="fill:#E3A866;stroke:' + INK + ';stroke-width:.7"/><rect x="284" y="331" width="13" height="2.6" rx="1.3" style="fill:#4A2A1C"/>' +
    '<rect x="286" y="321.5" width="9" height="4.4" style="fill:#F3EBCF;opacity:.85"/></g>';
  /* pencil doodle on the right page: an eclair cross-section with an arrow and notes */
  const pen = "fill:none;stroke:#8C8780;stroke-width:.7;stroke-linecap:round";
  s += '<g transform="rotate(-9 372 326)"><rect x="360" y="321" width="24" height="7.5" rx="3.7" style="' + pen + '"/><path d="M361 324.5 q3 2 6 0 t6 0 t6 0 t5 0" style="' + pen + '"/>' +
    '<path d="M387 324 l7 -2 m-2 -1.4 l2 1.4 l-1.5 1.8" style="' + pen + '"/><path d="M396 321 h7 M396 324 h5 M362 332 h18 M362 335 h12" style="' + pen + '"/></g>';
  return s;
}

/* ---- the recipe box, more like the reference: worn paint, letters on the tabs, and (option 3) RECIPES on the front ---- */
function boxWear() {
  const F = "matrix(1 -0.136 0 1 93 307)";   /* the box's front face: u across from its top-left corner, v down */
  const scuff = (pts, c) => P(wob(pts, .2), c);
  let s = '<g transform="' + F + '">' +
    scuff([[1.5, 1.5], [9, 1.2], [7, 3.6], [1.6, 4.4]], "#8FA3CF") + scuff([[82, 1], [91, 1], [91, 5], [86, 3.4]], "#8FA3CF") +
    scuff([[3, 2.2], [6, 2], [5, 3.2]], "#B5794A") + scuff([[87, 1.6], [90, 1.6], [89.6, 3]], "#B5794A") +
    scuff([[1.2, 46], [5, 49], [7, 52.6], [1.2, 52.8]], "#8FA3CF") + scuff([[30, 51.5], [44, 50.6], [41, 52.8], [31, 53]], "#8FA3CF") +
    scuff([[88, 44], [91.3, 41], [91.3, 51.5], [87, 51]], "#8FA3CF") + scuff([[60, 20], [64, 19], [62, 21.4]], "#8FA3CF") + "</g>";
  s += scuff([[50, 216.6], [62, 216], [58, 218.2]], "#8FA3CF") + scuff([[118, 214], [133, 213.2], [128, 215.4]], "#8FA3CF") + scuff([[38.5, 224], [40.5, 232], [38.8, 236]], "#8FA3CF");
  const tab = (x, y, t) => '<text x="' + x + '" y="' + y + '" text-anchor="middle" transform="rotate(-6 ' + x + " " + y + ')" style="font:700 4.6px \'Archivo Narrow\',\'Arial Narrow\',sans-serif;fill:#3a2a14">' + t + "</text>";
  s += tab(86, 276.4, "A–F") + tab(110, 272.6, "G–M") + tab(133.4, 275.4, "N–S") + tab(93.2, 283.4, "T–Z");
  return s;
}
function boxLabel() {
  return '<g transform="matrix(1 -0.136 0 1 93 307)"><text x="46.5" y="33" text-anchor="middle" style="font:700 12.5px \'Archivo Narrow\',\'Arial Narrow\',sans-serif;letter-spacing:1.2px;fill:#1E2B48">RECIPES</text></g>';
}

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
  DEF, TRIM,
  opts(v) {
    seed = 7;
    return { end: [{ obj: "whiteboard", svg: marker() },
      { obj: "notebook", svg: V("nb-n1", stackUnder(v)) + V("nb-n2", stackFront()) + V("nbx-1", nbExtras()), top: true },
      { obj: "box", svg: V("box-2", boxWear()) + V("box-3", boxWear() + boxLabel()), top: true },
      { obj: "eclair", svg: [0, 1, 2, 3].map((n) => V("ecl-" + n, eclair(n))).join(""), top: true },
      { obj: "window", svg: beams(v) + mobile() + Object.keys(SILL).map((k) => V("sill-" + k, SILL[k][1]())).join(""), top: true },
      { obj: "cup-open", svg: cupOpen(v), top: true }, { obj: "clip", svg: clipboard(), top: true }] };
  },
  /* close-ups for the page, drawn over a <use> of the kitchen scene */
  closeups(v) {
    seed = 11;
    return [
      ...[0, 1, 2, 3].map((n) => ({ key: "ecl" + n, title: ["Eclair E1, whole", "Click: one bite", "Click: two bites", "Click: gone until the page reloads"][n], vb: "172 326 100 48", svg: eclair(n) })),
      ...Object.keys(SILL).map((k) => ({ key: "sill" + k, title: "L" + k + " · " + SILL[k][0], vb: "730 120 142 140", svg: beams(v + "z" + k) + mobile() + SILL[k][1]() })),
      { key: "nb", title: "Open notebook with tabs, ribbon, photo and doodle; composition books under it", vb: "232 300 240 92", svg: stackUnder(v) + nbExtras() },
      { key: "nb2", title: "Or: composition books stacked in front of the whiteboard", vb: "430 296 130 70", svg: stackFront() },
      { key: "box", title: "Recipe box: worn paint, letters on the tabs, RECIPES (option 3)", vb: "26 200 170 170", svg: boxWear() + boxLabel() },
    ];
  },
};
