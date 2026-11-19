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

/* ---- the eclair (mark G) on a plate, at the front of the counter between the notebook and the mixer.
        As long as the pencil (~64), and plump ---- */
function eclair() {
  const cx = 494, cy = 360, L = 62, H = 19;
  let s = '<ellipse cx="' + cx + '" cy="' + (cy + 3) + '" rx="42" ry="9.4" style="fill:' + INK + '"/>' +
    '<ellipse cx="' + cx + '" cy="' + (cy + 2.2) + '" rx="40.2" ry="8" style="fill:' + PAPER + '"/>' +
    '<ellipse cx="' + cx + '" cy="' + (cy + 2.6) + '" rx="28" ry="5" style="fill:#E7E1CF"/>';
  const x0 = cx - L / 2, y0 = cy - H + 1, rx = H * 0.46;
  let g = '<rect x="' + (x0 - 1.6) + '" y="' + (y0 - 1.6) + '" width="' + (L + 3.2) + '" height="' + (H + 3.2) + '" rx="' + (rx + 1.6) + '" style="fill:' + INK + '"/>' +
    '<rect x="' + x0 + '" y="' + y0 + '" width="' + L + '" height="' + H + '" rx="' + rx + '" style="fill:#F5A23A"/>' +
    '<path d="M' + (x0 + 3) + " " + (y0 + H * 0.72) + " H" + (x0 + L - 3) + " Q" + (x0 + L) + " " + (y0 + H * 0.74) + " " + (x0 + L - 3.5) + " " + (y0 + H - 1.2) + " H" + (x0 + 3.5) + " Q" + x0 + " " + (y0 + H * 0.74) + " " + (x0 + 3) + " " + (y0 + H * 0.72) + 'Z" style="fill:#D9822A"/>';
  /* chocolate glaze over the top half, with drips */
  const yb = y0 + H * 0.5, n = 5, w = (L - 4) / n, dr = [0.32, 0.12, 0.38, 0.18, 0.28];
  let d = "M" + (x0 + rx * 0.5) + " " + (y0 + 0.9) + " H" + (x0 + L - rx * 0.5) + " Q" + (x0 + L + 0.4) + " " + (y0 + 1.5) + " " + (x0 + L - 1.4) + " " + yb;
  for (let i = n - 1; i >= 0; i--) d += " Q" + f1(x0 + 2 + i * w + w / 2) + " " + f1(yb + H * dr[i]) + " " + f1(x0 + 2 + i * w) + " " + f1(yb);
  d += " Q" + (x0 - 0.4) + " " + (y0 + 1.5) + " " + (x0 + rx * 0.5) + " " + (y0 + 0.9) + "Z";
  g += P(d, "#5E3218", 1.2);
  g += '<path d="M' + (x0 + 7) + " " + (y0 + 3.2) + " Q" + (x0 + L / 2) + " " + (y0 + 1.8) + " " + (x0 + L - 12) + " " + (y0 + 3) + '" style="fill:none;stroke:#8A4F2A;stroke-width:1.6;stroke-linecap:round"/>';
  g += '<path d="M' + (x0 + 9) + " " + (y0 + 6.2) + (" q2.3 -2 4.6 0 t4.6 0").repeat(5) + '" style="fill:none;stroke:#FFF4DC;stroke-width:1.3;stroke-linecap:round;stroke-linejoin:round"/>';
  s += '<g transform="rotate(-4 ' + cx + " " + cy + ')">' + g + "</g>";
  return s;
}

/* ---- spoon jar on the window sill (sill top y ~244): a cream crock, two wooden spoons, a whisk and a tomato spatula ---- */
function jar() {
  const x = 784, b = 246, w = 30, h = 32, top = b - h;
  let s = "";
  const spoon = (x1, y1, x2, y2, bw, bh, col) => {   /* handle from the rim (x1,y1) up to the bowl at (x2,y2) */
    const a = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI + 90, nx = Math.cos(a * Math.PI / 180) * 1.6, ny = Math.sin(a * Math.PI / 180) * 1.6;
    return P(wob([[x1 - nx, y1 - ny], [x2 - nx * .7, y2 - ny * .7], [x2 + nx * .7, y2 + ny * .7], [x1 + nx, y1 + ny]], .2), col, 1.3) +
      '<ellipse cx="' + f1(x2) + '" cy="' + f1(y2 - bh * 0.8) + '" rx="' + bw + '" ry="' + bh + '" transform="rotate(' + f1(a - 90) + " " + f1(x2) + " " + f1(y2 - bh * 0.8) + ')" style="fill:' + col + ";stroke:" + INK + ';stroke-width:1.3"/>';
  };
  s += spoon(x + 7, top + 3, x + 1, top - 32, 5, 7.2, WOOD_L);
  /* whisk: handle and wire loops */
  s += '<path d="M' + (x + 15) + " " + (top + 3) + " L" + (x + 15.5) + " " + (top - 14) + '" style="stroke:' + INK + ';stroke-width:4;stroke-linecap:round"/><path d="M' + (x + 15) + " " + (top + 3) + " L" + (x + 15.5) + " " + (top - 14) + '" style="stroke:#B5AA92;stroke-width:2;stroke-linecap:round"/>';
  for (const k of [-5, -1.8, 1.8, 5]) s += '<path d="M' + (x + 15.5) + " " + (top - 13) + " Q" + (x + 15.5 + k * 1.9) + " " + (top - 30) + " " + (x + 15.5) + " " + (top - 41) + '" style="fill:none;stroke:' + INK + ';stroke-width:1.1"/>';
  /* spatula */
  s += P(wob([[x + 22, top + 3], [x + 26, top - 18], [x + 28.4, top - 17.6], [x + 25, top + 3]], .2), "#B17A4B", 1.3);
  s += P(wob([[x + 23.5, top - 17], [x + 32.5, top - 15.4], [x + 34.5, top - 29], [x + 26.5, top - 31]], .3), "#C8473A", 1.3);
  s += spoon(x + 12, top + 3, x + 9, top - 22, 4, 5.8, "#B17A4B");
  /* the crock: cream stoneware, a sage band, darker right side */
  s += P(wob([[x - 1.5, top], [x + w + 1.5, top], [x + w + 0.5, b - 4], [x + w - 2.5, b], [x + 2.5, b], [x - 0.5, b - 4]], .4), "#EFE6CF", 1.9);
  s += P("M" + (x + w * 0.66) + " " + (top + 2) + " L" + (x + w) + " " + (top + 2) + " L" + (x + w - 0.6) + " " + (b - 4) + " L" + (x + w - 2.8) + " " + (b - 1.5) + " L" + (x + w * 0.7) + " " + (b - 1.5) + "Z", "#DCCFAF");
  s += P(wob([[x - 0.9, b - h * 0.62], [x + w + 0.9, b - h * 0.62], [x + w + 0.8, b - h * 0.62 + 5], [x - 0.8, b - h * 0.62 + 5]], .2), "#8BA07A", 0.9);
  s += '<ellipse cx="' + (x + w / 2) + '" cy="' + top + '" rx="' + (w / 2 + 2) + '" ry="2.6" style="fill:#3a332b;stroke:' + INK + ';stroke-width:1.6"/>';
  s += '<path d="M' + (x + 3) + " " + (top + 5) + " V" + (b - 6) + '" style="stroke:#FFFBEF;stroke-width:1.6;stroke-linecap:round;opacity:.8"/>';
  return s;
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
  let s = P(wob(q([[uL, vT], [uR, vT], [uR, vB], [uL, vB]], 1), .4), "#B57D4B", 1.7);
  s += P(wob(q([[pu(.08), pv(.07)], [pu(.92), pv(.07)], [pu(.92), pv(.96)], [pu(.08), pv(.96)]], 1.2), .3), PAPER, 1);
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
  opts(v) {
    seed = 7;
    return { end: [{ obj: "whiteboard", svg: marker() }, { obj: "eclair", svg: eclair() }, { obj: "jar", svg: jar() },
      { obj: "cup-open", svg: cupOpen(v), top: true }, { obj: "clip", svg: clipboard(), top: true }] };
  },
};
