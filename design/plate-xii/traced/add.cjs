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
const DEF = { ecl: "0", sill: "3", sun: "am", tidy: "1", cr: "2", r1: "1", r2: "1", r3: "1" };   /* tidy: the flour and rolling pin are gone for good (Ari 11/19); v15: crystal K2, all three kinds of rainbow on */
function V(tokens, svg) {
  const on = tokens.split(" ").every((t) => { const i = t.indexOf("-"); return t.slice(i + 1).split("|").includes(DEF[t.slice(0, i)]); });   /* "ecl-0|1" = ecl is 0 or 1 */
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
const ECL = { L: 23, H: 9.5, o: { ridges: 1 } };
/* ---- Ari's vector traces (refs/), cut out by traced/port.cjs into ports/*.json in her units ---- */
const PORT = (n) => JSON.parse(require("fs").readFileSync(require("path").join(__dirname, "ports", n + ".json"), "utf8"));
const RACK2 = PORT("rack2"), JOURNALS = PORT("journals"), W2L = PORT("bottles-w2-left"), W2R = PORT("bottles-w2-right");
/* reusing a port twice needs its own ids */
const reid = (svg, sfx) => svg.replace(/id="([^"]+)"/g, 'id="$1' + sfx + '"').replace(/url\(#([^)]+)\)/g, "url(#$1" + sfx + ")");
/* her full cooling rack with three eclairs (refs/eclair-rack2.svg), on the counter under the window where the flour and rolling
   pin were. Under the eclairs, where her rack is hidden, her wire grid redrawn to her measure (rackGrid), so a taken eclair
   leaves rack. The rack is
   drawn once; eclair i shows while fewer than i+1 are taken (data-var "ecl-0|1.."), its crumbs after. Taken from the left. */
const RACK_FIT = { x: 692, y: 362, k: .27 };   /* her rack's left (x 41) and front rim (y 284) -> the kitchen counter */
/* her rack's wires, measured off refs/eclair-rack2.svg where they show (her units). Cross wires run level (RACK_H, her y);
   the long wires lean back to the left, each its own slope as she drew them: [x where it meets y 274, dx per unit of y].
   Her long wires are two-tone (dark edges, grey core) and lie over the cross wires; between them her shaded counter, in
   bands of her three tones. Her back rim is cut at y 160 (grey 161 to 164.6, dark to 166.6). */
const RACK_H = [172.5, 181.5, 186, 191.2, 196, 201, 208.3, 213.7, 218.2, 222.7, 227.2, 232.7, 238, 244.5, 249.5, 255, 260.5, 265.5, 271];
/* the middle of her rim's inner dark line, all round; and her rack between that rim and e1 */
const RACK_IN = [[56.3, 166], [536, 166], [549, 175], [561, 185], [581, 205], [601, 225], [610, 235], [617.6, 245], [623, 255], [622, 265], [617.6, 270], [609.6, 274], [600, 277], [153.7, 277]];
const RACK_LEFT = [[56.3, 166], [125, 166], [113, 187], [125, 211], [153, 231], [187, 248], [220, 268], [230, 277], [153.7, 277]];
const RACK_D = [[191.4, .94], [233.6, .96], [274.2, .97], [306.5, .99], [341.9, 1.12], [374, 1.05], [410.2, 1], [441.9, .93], [477.9, 1.14], [511, 1.1], [544.3, 1.08], [583.2, 1.06], [618, 1.05], [652, 1.05]];
const RACK_BAND = ["#C9A284", "#CFA882", "#C09879", "#C9A284", "#C09879", "#CFA882"];
const RACK_INK = "#2B160F";
function rackGrid() {
  let s = "", y0 = 160;
  RACK_H.forEach((y, i) => { s += '<rect x="40" y="' + y0 + '" width="600" height="' + f1(y - y0 + .5) + '" fill="' + RACK_BAND[i % RACK_BAND.length] + '"/>'; y0 = y; });
  s += '<rect x="40" y="' + y0 + '" width="600" height="' + f1(290 - y0) + '" fill="' + RACK_BAND[0] + '"/>';
  s += '<path d="' + RACK_H.map((y) => "M40 " + y + "H640").join("") + '" stroke="' + RACK_INK + '" stroke-width="1.3"/>';
  const d = RACK_D.map(([x, k]) => "M" + f1(x + k * (156 - 274)) + " 156L" + f1(x + k * (290 - 274)) + " 290").join("");
  s += '<path d="' + d + '" stroke="' + RACK_INK + '" stroke-width="6.4"/><path d="' + d + '" stroke="#C7AF9C" stroke-width="2.6"/>';
  return s + '<rect x="40" y="156" width="600" height="10.6" fill="' + RACK_INK + '"/><rect x="40" y="161" width="600" height="3.6" fill="#D8CFC8"/>';
}
function rack() {
  const id = "rk" + (++uid), q = RACK2.clip.rack, rp = (a) => a.map((p) => p.join(" ")).join(" ");
  const grid = rackGrid(), crumbs = (cx, cy) => [[-40, 6, 5], [-12, -8, 3.8], [16, 10, 4.4], [46, -2, 3.2], [0, 20, 3.4], [-62, 16, 3]].map(([dx, dy, r]) => '<circle cx="' + (cx + dx) + '" cy="' + (cy + dy) + '" r="' + r + '" fill="' + (r > 3.6 ? "#E5B866" : "#4A2517") + '" stroke="#2B160F" stroke-width="1.1"/>').join("");
  const spots = [[200, 210], [343, 210], [477, 210]], r = (a, b) => [0, 1, 2, 3, 4, 5].filter((v) => v >= a && v <= b).join("|");
  /* under everything: her grid continued over the whole rack, so it shows where her eclairs hid her rack (and through the bites) */
  let s = '<clipPath id="' + id + '"><polygon points="' + rp(q) + '"/></clipPath><g clip-path="url(#' + id + ')">' + grid + "</g>" + reid(RACK2.parts.rack, id);
  /* once an eclair is gone the grid goes on top too, over a band round its outline (wider down-left) where her rack still
     has the eclair's edge and its speckled shadow; for e1 also out to her left rim, for the bitten e3 out to her right rim.
     With all three gone it fills her whole rack inside the rim, so the rack reads as one: seams only at her rim's inner
     line, which is dark like the wires. */
  const band = (k) => ["", " transform=\"translate(-10 9)\"", " transform=\"translate(-22 20)\""].map((t) => '<polygon points="' + rp(RACK2.clip[k]) + '"' + t + ' fill="#fff" stroke="#fff" stroke-width="16" stroke-linejoin="round"/>').join("");
  s += '<clipPath id="' + id + 'in"><polygon points="' + rp(RACK_IN) + '"/><rect x="70" y="160" width="460" height="7"/></clipPath>';   /* inside her rim, and her back rim (the eclairs cut it) */
  const zone = (tok, n, shapes) => V(tok, '<mask id="' + id + n + '" maskUnits="userSpaceOnUse" x="30" y="100" width="620" height="200">' + shapes +
    '</mask><g mask="url(#' + id + n + ')"><g clip-path="url(#' + id + 'in)">' + grid + "</g></g>");
  s += zone("ecl-1|2|3|4", "z1", band("e1") + '<polygon points="' + rp(RACK_LEFT) + '" fill="#fff"/>') + zone("ecl-2|3|4", "z2", band("e2")) +
    zone("ecl-3|4", "z3b", '<polygon points="508 166 ' + rp(RACK_IN.slice(1, -1)) + ' 505 277" fill="#fff"/>') +   /* the bitten end, out to her right rim */
    zone("ecl-5", "z3", '<rect x="30" y="100" width="620" height="200" fill="#fff"/>');
  /* ecl 0..5: e1 taken at 1, e2 at 2, then two bites out of e3 (3, 4), all gone at 5 */
  ["e1", "e2"].forEach((k, i) => { s += V("ecl-" + r(i + 1, 5), crumbs(...spots[i])) + V("ecl-" + r(0, i), reid(RACK2.parts[k], id)); });
  s += V("ecl-5", crumbs(...spots[2])) + V("ecl-" + r(0, 4), bitten(reid(RACK2.parts.e3, id), id));
  return '<g transform="translate(' + RACK_FIT.x + " " + RACK_FIT.y + ") scale(" + RACK_FIT.k + ') translate(-41 -284)">' + s + "</g>";
}

/* the last eclair (e3), bitten from its right end: a mask of overlapping circles cuts the choux away (the rack patch shows
   through), and along the cut a cream band with an ink edge and a thin shell line, so it reads as a bite into choux and cream.
   ecl-3 = one bite, ecl-4 = the second bite takes more. Units are her rack's (scaled by RACK_FIT.k = .27, so ink 1 ~ 3.7). */
const BITE_T = [553, 251], BITE_U = [.77, .64], BITE_N = [-.64, .77];   /* the end's tip, along the eclair, across it */
const BITES = {
  3: [[-2, -21, 18], [-9, 0, 19], [-1, 20, 17]],
  4: [[-2, -21, 18], [-9, 0, 19], [-1, 20, 17], [-30, -22, 20], [-38, 1, 22], [-30, 22, 19], [-20, -32, 12]],
};
function bitten(e3, id) {
  const m = "bt" + id, at = (a, b) => [BITE_T[0] + BITE_U[0] * a + BITE_N[0] * b, BITE_T[1] + BITE_U[1] * a + BITE_N[1] * b];
  const circ = (n, style) => BITES[n].map(([a, b, rr]) => { const c = at(a, b); return '<circle cx="' + f1(c[0]) + '" cy="' + f1(c[1]) + '" r="' + rr + '" ' + style + "/>"; }).join("");
  const both = (style) => V("ecl-3", circ(3, style)) + V("ecl-4", circ(4, style));
  let s = '<mask id="' + m + '" maskUnits="userSpaceOnUse" x="360" y="100" width="240" height="200"><rect x="360" y="100" width="240" height="200" fill="#fff"/>' + both('fill="#000"') + "</mask>";
  s += '<g mask="url(#' + m + ')">' + e3 + '<g clip-path="url(#pc-rack2-e3' + id + ')" fill="none">' +
    both('stroke="#C98A4B" stroke-width="25"') + both('stroke="#F7E9BE" stroke-width="20"') + both('stroke="#E9D59A" stroke-width="7" stroke-dasharray="3 9"') + both('stroke="#2B160F" stroke-width="5"') + "</g></g>";
  /* a few crumbs off the bites */
  s += V("ecl-3|4", [[574, 268, 4], [586, 252, 3], [560, 282, 3.4], [598, 274, 2.6]].map(([x, y, rr], i) => '<circle cx="' + x + '" cy="' + y + '" r="' + rr + '" fill="' + (i % 2 ? "#4A2517" : "#E5B866") + '" stroke="#2B160F" stroke-width="1.1"/>').join(""));
  return s;
}

/* ---- the sill: Ari's vector bottles (ports/), her newest set B3 (Ari 11/19)
        (decanter in the left pane, amber and cobalt in the right). [title, svg, scale, her x that lands at the sill's x 768, her sill y] ---- */
const BOTTLES = {
  3: ["Your newest set: decanter, then the amber and cobalt bottles", () => reid(W2L.parts.glass + W2R.parts.glass, "s3"), .5, 275, 416],
};
const atSill = (svg, k, cx, sy) => '<g transform="translate(768 246.5) scale(' + k + ") translate(" + (-cx) + " " + (-sy) + ')">' + svg + "</g>";

/* her two stacked composition journals, in front of the whiteboard, each the size of the notebook closed.
   Square to the counter, front edge level (J2, Ari 11/20). Her drawing is cut into faces (top cover, page edges, spine) and each face is fitted on its own (affine from three
   corners), so the cover lies flat and the page edges stand upright; the page edges go in strips, since her face is taller at the right. */
/* her units: cover corners, the page-edge face's bottom corners, the spine face's bottom-left */
const JS = { bl: [27, 70], br: [232, 34], r: [387, 134], f: [165, 177], rb: [390, 208], fb: [166, 226], blb: [27, 131] };
const JX0 = 430, JTOP = 349, JH = 13;   /* front-left corner x, cover's front edge y, stack height (bottom at y 362, on the shadow) */
/* the 2x3 matrix taking three points s to three points d */
function fit3(s, d) {
  const [[x0, y0], [x1, y1], [x2, y2]] = s, det = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);
  const row = (k) => { const v0 = d[0][k], v1 = d[1][k] - v0, v2 = d[2][k] - v0, a = (v1 * (y2 - y0) - v2 * (y1 - y0)) / det, c = (v2 * (x1 - x0) - v1 * (x2 - x0)) / det; return [a, c, v0 - a * x0 - c * y0]; };
  const X = row(0), Y = row(1); return [X[0], Y[0], X[1], Y[1], X[2], Y[2]].map((n) => +n.toFixed(5));
}
const mtx = (m) => "matrix(" + m.join(" ") + ")";
const ptsS = (a) => a.map((p) => f1(p[0]) + " " + f1(p[1])).join(" ");
/* "Trials" on the top journal's white label, in the label's own plane: a cream patch over her scribble, then the word.
   Label frame (her units): TL (125, 75), TR (226, 58), BL (151, 101) */
const TRIALS = "Trials";
function jLabel() {
  const m = fit3([[0, 0], [100, 0], [0, 26]], [[125, 75], [226, 58], [151, 101]]);
  return '<polygon points="131.5 78 224 61.5 253 80 153 98.5" style="fill:#EEE5D2"/>' +
    '<text transform="' + mtx(m) + '" x="49" y="21" text-anchor="middle" style="font:700 26px Caveat,\'Segoe Script\',cursive;fill:#2a2622">' + TRIALS + "</text>";
}
function jPages() {
  const H = JH, pg = (y0, y1, dx) => P(wob([[1.6 + dx, y0], [99.2 + dx, y0 - .1], [99.4 + dx, y1], [1.8 + dx, y1 + .1]], .12), "#EEE5D2") +
    [.33, .62].map((t) => { const y = y0 + (y1 - y0) * t; return '<path d="M' + f1(5 + dx) + " " + f1(y) + " Q" + f1(40 + dx) + " " + f1(y - .25) + " " + f1(70 + dx) + " " + f1(y + .1) + " T" + f1(97 + dx) + " " + f1(y - .1) + '" style="fill:none;stroke:#A8A89C;stroke-width:.35"/>'; }).join("");
  return P(wob([[0, -.2], [100, -.2], [100.6, H], [-.2, H]], .15), "#2A2826") + pg(1.1, 5.2, 0) + pg(7.6, 11.7, .4) +
    '<path d="M0 6.4 H100.4" style="stroke:' + INK + ';stroke-width:.5"/>' + P(wob([[0, -.2], [100, -.2], [100.6, H], [-.2, H]], .15), "none", .9);
}
/* the screen corners of the top cover: [bl, br, r, f] */
function jCover() {
  return [[JX0 + 3, JTOP - 44], [JX0 + 80, JTOP - 43], [JX0 + 85, JTOP], [JX0, JTOP]];
}
function stackFace(k, src) {
  const id = src + "-" + k, [bl, br, r, f] = jCover(), dn = (p) => [p[0], p[1] + JH], use = '<use href="#' + src + '"/>';
  const piece = (src, dst, poly, n) => '<clipPath id="' + id + n + '"><polygon points="' + ptsS(poly) + '"/></clipPath><g transform="' + mtx(fit3(src, dst)) + '"><g clip-path="url(#' + id + n + ')">' + use + "</g></g>";
  let s = "";
  /* spine face, only when it turns toward us */
  if (bl[0] < f[0] - 1) s += piece([JS.bl, JS.f, JS.blb], [bl, f, dn(bl)], [[20, 66], JS.bl, JS.f, [168, 180], [168, 230], JS.fb, JS.blb, [20, 131]], "s");
  /* page edges: her face can't be laid level in one piece (it is taller at the right), so they are drawn in her colours:
     two journals, each a dark cover edge, a cream block of pages, a dark back cover; laid on the face [f, r, r+h, f+h] */
  s += '<g transform="' + mtx(fit3([[0, 0], [100, 0], [0, JH]], [f, r, dn(f)])) + '">' + jPages() + "</g>";
  /* the top cover, last; its clip stops at the front edge and the spine */
  const m = fit3([JS.bl, JS.r, JS.f], [bl, r, f]);
  s += '<clipPath id="' + id + 'c"><polygon points="' + ptsS([[20, 66], [231, 29.5], [235, 33], [389.5, 133], JS.r, JS.f, JS.bl]) + '"/></clipPath><g transform="' + mtx(m) + '"><g clip-path="url(#' + id + 'c)">' + use + "</g>" + jLabel() + "</g>";
  return s;
}
function stackFront() {
  const id = "j" + (++uid), sh = (cx, rx) => '<ellipse cx="' + f1(cx) + '" cy="363" rx="' + f1(rx) + '" ry="5" style="fill:#B17A4B"/>';
  let s = '<defs><g id="' + id + '">' + reid(JOURNALS.parts.stack, id) + "</g></defs>";
  const q = jCover(), cx = (q[2][0] + q[3][0]) / 2;
  s += sh(cx + 4, (q[2][0] - q[3][0]) / 2 + 10) + stackFace("2", id);
  return s;
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
const SILL = {}; Object.keys(BOTTLES).forEach((k) => { const [t, f, sc, cx, sy] = BOTTLES[k]; SILL[k] = [t, () => atSill(f(), sc, cx, sy)]; });

/* crystals and mobile, after Ari's vector studies (their 800 x 600 units, scaled in): hexagonal prisms with a white top facet,
   a pale blue bottom facet and two facet lines, on a brass ring */
function prism(x, y, w, h) {
  const t = h * .24, sw = 'stroke="' + INK + '"';
  return '<polygon points="' + [[x, y], [x + w, y + t], [x + w, y + h - t], [x, y + h], [x - w, y + h - t], [x - w, y + t]].map((p) => f1(p[0]) + "," + f1(p[1])).join(" ") + '" fill="#EDF6FF" ' + sw + ' stroke-width="3" stroke-linejoin="round"/>' +
    '<polygon points="' + [[x, y], [x + w, y + t], [x, y + t * 1.4], [x - w, y + t]].map((p) => f1(p[0]) + "," + f1(p[1])).join(" ") + '" fill="#FFFFFF" ' + sw + ' stroke-width="1.8"/>' +
    '<polygon points="' + [[x, y + h], [x + w, y + h - t], [x, y + h - t * 1.4], [x - w, y + h - t]].map((p) => f1(p[0]) + "," + f1(p[1])).join(" ") + '" fill="#D6E8FA" ' + sw + ' stroke-width="1.8"/>' +
    '<path d="M' + f1(x - w * .45) + " " + f1(y + t * 1.2) + " V" + f1(y + h - t * 1.2) + " M" + f1(x + w * .45) + " " + f1(y + t * 1.2) + " V" + f1(y + h - t * 1.2) + '" stroke="' + INK + '" stroke-width="1.6"/>';
}
function mobile() {
  const c = 'stroke="' + INK + '"';
  let s = '<g transform="translate(822 30) scale(.47) translate(-400 -64)" fill="none">' +
    '<path d="M400 64 V112 L372 174 M400 112 L428 174" ' + c + ' stroke-width="2"/>' +
    '<ellipse cx="400" cy="174" rx="28" ry="4" stroke="' + INK + '" stroke-width="5.5"/><ellipse cx="400" cy="174" rx="28" ry="4" stroke="#C8A252" stroke-width="2.6"/>' +
    '<path d="M400 178 V215 M376 176 V275 M424 176 V268 M400 255 V328" ' + c + ' stroke-width="1.8"/>';
  s += prism(400, 215, 9, 42) + prism(376, 275, 9, 46) + prism(424, 269, 9, 46) + prism(400, 328, 11, 54);
  return s + "</g>";
}
/* ---- v15 crystals: each hangs on a line from the window's top at x 822, its body about y 100-145, so the rainbows leave
        from the same spot whichever is picked. Glass: ink outline, pale facets lit from the upper left, a few tinted facets
        where the light splits. cr-1..5; .cr-spin is turned by the page when clicked ---- */
const GL = { w: "#FFFFFF", a: "#F4FAFF", b: "#EDF6FF", c: "#D6E8FA", d: "#C2D7EF", pink: "#F7DCEF", yel: "#FFF1BF", mint: "#D9F4E6", lil: "#E4DCFA" };
const CX = 822;
const poly = (pts, fill, sw) => '<polygon points="' + pts.map((p) => f1(p[0]) + "," + f1(p[1])).join(" ") + '" style="fill:' + fill + (sw ? ";stroke:" + INK + ";stroke-width:" + sw + ";stroke-linejoin:round" : "") + '"/>';
const string = (y0, y1) => '<path d="M' + CX + " " + y0 + " V" + y1 + '" style="stroke:' + INK + ';stroke-width:.9"/>';
function oct(cx, cy, r, inner) {
  const P8 = (rr, o) => [0, 1, 2, 3, 4, 5, 6, 7].map((k) => [cx + rr * Math.cos((k * 45 + o) * Math.PI / 180), cy + rr * Math.sin((k * 45 + o) * Math.PI / 180)]);
  const O = P8(r, 22.5), I = P8(r * .5, 22.5);
  let s = poly(O, GL.b, 1.1);
  if (inner) { s += poly(I, GL.w, .5); O.forEach((p, k) => { s += '<path d="M' + f1(p[0]) + " " + f1(p[1]) + " L" + f1(I[k][0]) + " " + f1(I[k][1]) + '" style="stroke:' + INK + ';stroke-width:.4"/>'; }); }
  return s;
}
/* a teardrop (pendeloque): narrow top at (CX, t), round bottom at t + h, w wide */
function drop(t, h, w) {
  const id = "cr" + (++uid), hw = w / 2, g = t + h * .62, b = t + h, x0 = CX - hw, x1 = CX + hw;
  const out = "M" + CX + " " + t + " C" + f1(CX + hw * .55) + " " + f1(t + h * .12) + " " + f1(x1) + " " + f1(t + h * .38) + " " + f1(x1) + " " + f1(g) + " C" + f1(x1) + " " + f1(t + h * .86) + " " + f1(CX + hw * .55) + " " + f1(b) + " " + CX + " " + f1(b) +
    " C" + f1(CX - hw * .55) + " " + f1(b) + " " + f1(x0) + " " + f1(t + h * .86) + " " + f1(x0) + " " + f1(g) + " C" + f1(x0) + " " + f1(t + h * .38) + " " + f1(CX - hw * .55) + " " + f1(t + h * .12) + " " + CX + " " + t + "Z";
  const L = [CX - hw * .42, g - h * .04], R = [CX + hw * .42, g - h * .04], M = [CX, g + h * .08], T = [CX, t], Bt = [CX, b];
  let s = '<clipPath id="' + id + '"><path d="' + out + '"/></clipPath><path d="' + out + '" style="fill:' + GL.b + '"/><g clip-path="url(#' + id + ')">' +
    poly([T, [x0 - 1, g], L], GL.w) + poly([T, [x1 + 1, g], R], GL.c) + poly([T, L, M, R], GL.a) +
    poly([[x0 - 1, g], L, M, Bt, [x0 - 1, b]], "#E3EEFB") + poly([[x1 + 1, g], R, M, Bt, [x1 + 1, b]], GL.d) +
    poly([[CX - hw * .7, g + h * .1], [CX - hw * .25, g + h * .06], [CX - hw * .32, g + h * .27]], GL.yel) + poly([[CX + hw * .3, g + h * .09], [CX + hw * .72, g + h * .08], [CX + hw * .3, g + h * .28]], GL.pink) +
    '<path d="M' + [T, L, M, R, T].map((p) => f1(p[0]) + " " + f1(p[1])).join(" L") + " M" + f1(x0) + " " + f1(g) + " L" + f1(L[0]) + " " + f1(L[1]) + " M" + f1(x1) + " " + f1(g) + " L" + f1(R[0]) + " " + f1(R[1]) + " M" + f1(M[0]) + " " + f1(M[1]) + " L" + f1(Bt[0]) + " " + f1(Bt[1]) + '" style="fill:none;stroke:' + INK + ';stroke-width:.6"/></g>';
  return s + '<path d="' + out + '" style="fill:none;stroke:' + INK + ';stroke-width:1.4;stroke-linejoin:round"/>';
}
/* a faceted ball: a table octagon up-left of centre, star and girdle facets round it, each shaded by which way it faces */
function ball(cy, r) {
  const c = [CX, cy], tc = [CX - r * .14, cy - r * .14], A = (k, o) => (k * 45 + o) * Math.PI / 180, at = (p, rr, a) => [p[0] + rr * Math.cos(a), p[1] + rr * Math.sin(a)];
  const I = [], M = [], O = [];
  for (let k = 0; k < 9; k++) { I.push(at(tc, r * .42, A(k, 22.5))); M.push(at(c, r * .78, A(k, 45))); O.push(at(c, r * 1.02, A(k, 22.5))); }
  const tint = { 1: GL.pink, 4: GL.yel, 6: GL.mint, 2: GL.lil };
  let s = '<circle cx="' + CX + '" cy="' + cy + '" r="' + r + '" style="fill:' + GL.b + '"/>';
  for (let k = 0; k < 8; k++) {
    const lit = Math.cos(A(k, 45) - 225 * Math.PI / 180), col = lit > .55 ? GL.w : lit > .05 ? GL.a : lit > -.45 ? GL.c : GL.d;
    s += poly([I[k], M[k], I[k + 1]], lit > .2 ? GL.w : GL.a, .45) + poly([I[k], O[k], M[k]], col, .45) + poly([I[k + 1], M[k], O[k + 1]], tint[k] || col, .45);
  }
  s += poly(I.slice(0, 8), "#F8FCFF", .5) + '<ellipse cx="' + f1(CX - r * .4) + '" cy="' + f1(cy - r * .45) + '" rx="' + f1(r * .2) + '" ry="' + f1(r * .12) + '" transform="rotate(-35 ' + f1(CX - r * .4) + " " + f1(cy - r * .45) + ')" style="fill:#fff"/>';
  return s + '<circle cx="' + CX + '" cy="' + cy + '" r="' + r + '" style="fill:none;stroke:' + INK + ';stroke-width:1.5"/>';
}
/* a quartz point: a six-sided crystal seen face on (three faces show), pointed at the bottom, wire-wrapped at the top */
function quartz(t, h, w) {
  const hw = w / 2, x0 = CX - hw, x1 = CX + hw, m0 = CX - hw * .4, m1 = CX + hw * .4, b = t + h * .66, tip = [CX - .6, t + h];
  let s = poly([[x0, t + 1], [m0, t], [m0, b + 1.4], [x0, b]], GL.c) + poly([[m0, t], [m1, t], [m1, b + 1.4], [m0, b + 1.4]], GL.a) + poly([[m1, t], [x1, t + 1], [x1, b], [m1, b + 1.4]], GL.d) +
    poly([[x0, b], [m0, b + 1.4], tip], "#E3EEFB") + poly([[m0, b + 1.4], [m1, b + 1.4], tip], GL.w) + poly([[m1, b + 1.4], [x1, b], tip], GL.lil) +
    poly([[m1 + .4, b + 3], [x1 - .6, b + 2], [CX + .8, b + 8]], GL.pink) +
    '<path d="M' + f1(CX - 1) + " " + f1(t + 6) + " q1.4 6 -.4 12 M" + f1(CX + 1.2) + " " + f1(t + 10) + ' q.8 4 0 7" style="fill:none;stroke:#fff;stroke-width:.9;stroke-linecap:round"/>' +
    '<path d="M' + f1(m0) + " " + f1(t) + " V" + f1(b + 1.4) + " M" + f1(m1) + " " + f1(t) + " V" + f1(b + 1.4) + " M" + f1(x0) + " " + f1(b) + " L" + f1(m0) + " " + f1(b + 1.4) + " L" + f1(m1) + " " + f1(b + 1.4) + " L" + f1(x1) + " " + f1(b) + '" style="fill:none;stroke:' + INK + ';stroke-width:.6"/>';
  s += poly([[x0, t + 1], [m0, t], [m1, t], [x1, t + 1], [x1, b], tip, [x0, b]], "none", 1.4);
  /* brass wire wrapped round the top */
  const wy = (i) => t - 4 + i * 2.6;
  s += '<path d="M' + CX + " " + (t - 7) + " V" + (t - 4) + [0, 1, 2].map((i) => " M" + f1(x0 - .6) + " " + f1(wy(i) + 1.6) + " Q" + CX + " " + f1(wy(i) - .6) + " " + f1(x1 + .6) + " " + f1(wy(i) + 2)).join("") + '" style="fill:none;stroke:' + INK + ';stroke-width:2.2;stroke-linecap:round"/>' +
    '<path d="M' + [0, 1, 2].map((i) => f1(x0 - .6) + " " + f1(wy(i) + 1.6) + " Q" + CX + " " + f1(wy(i) - .6) + " " + f1(x1 + .6) + " " + f1(wy(i) + 2)).join(" M") + '" style="fill:none;stroke:#C9A24A;stroke-width:1.1;stroke-linecap:round"/>' +
    '<circle cx="' + CX + '" cy="' + (t - 7.5) + '" r="1.4" style="fill:none;stroke:#C9A24A;stroke-width:1"/>';
  return s;
}
const CRYSTALS = {
  1: ["Teardrop prism", () => string(30, 97) + oct(CX, 99.4, 2.5) + drop(102.2, 38, 17)],
  2: ["Faceted ball", () => string(30, 103) + oct(CX, 105.4, 2.3) + '<rect x="' + (CX - 1.6) + '" y="107.4" width="3.2" height="2.2" rx=".6" style="fill:#C9A24A;stroke:' + INK + ';stroke-width:.7"/>' + ball(121, 11.5)],
  3: ["Octagon chain", () => string(30, 61) + [64.5, 74.5, 84.5, 94.5].map((y, i) => (i ? '<circle cx="' + CX + '" cy="' + f1(y - 5) + '" r="1" style="fill:none;stroke:#C9A24A;stroke-width:.8"/>' : "") + oct(CX, y, 3.8, true)).join("") + '<circle cx="' + CX + '" cy="99.6" r="1" style="fill:none;stroke:#C9A24A;stroke-width:.8"/>' + drop(101, 27, 12)],
  4: ["Quartz point", () => string(30, 89) + quartz(97, 46, 11)],
  5: ["Mobile (the one you have now)", () => mobile()],
};
const crystals = () => Object.keys(CRYSTALS).map((k) => V("cr-" + k, '<g class="cr-spin">' + CRYSTALS[k][1]() + "</g>")).join("");

/* ---- v15 rainbows. All of them sit in .rb > .rb-turn (the page turns that round the crystal when it is clicked), one set per
        time of day: the two main beams; R2 partial beams (shorter, thinner, fading early); R1 small scattered spots; R3 spots
        that bend over things (an edge or a curve). A spot is a short band of light, its colours running along its length.
        Looks (data-rs on #tk, base/xii.css): S1 soft (blurred), S2 printed (crisp, as now), S3 halftone (a dot mask). ---- */
const RB = ["#EE2A35", "#FF8A1C", "#FFD91A", "#2FBF4A", "#2A72E8", "#8C3FD6"];
/* pts: straight [a, b], bent at an edge [a, k, b] (bend: true), or curved over a round thing [a, ctrl, b] */
function spot(pts, w, bend) {
  /* six stripes side by side along the path, like a short piece of a rainbow; the outer ones shorter, so it ends round */
  const nrm = (a, b) => { const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [-(b[1] - a[1]) / l, (b[0] - a[0]) / l]; };
  const [a, m, b] = pts.length === 3 ? pts : [pts[0], lerp(pts[0], pts[1], .5), pts[1]];
  const n0 = bend ? nrm(a, m) : nrm(a, b), n2 = bend ? nrm(m, b) : nrm(a, b), n1 = bend ? [(n0[0] + n2[0]) / 2, (n0[1] + n2[1]) / 2] : nrm(a, b), sw = w / 6;
  const off = (p, n, o) => [p[0] + n[0] * o, p[1] + n[1] * o], q = (p) => f1(p[0]) + " " + f1(p[1]);
  return RB.map((c, i) => {
    const o = (i - 2.5) * sw, tr = .28 * Math.abs(i - 2.5) / 2.5, A = off(lerp(a, m, tr), n0, o), M = off(m, n1, o), Bq = off(lerp(b, m, tr), n2, o);
    return '<path d="M' + q(A) + (bend ? " L" + q(M) + " L" : " Q" + q(M) + " ") + q(Bq) + '" style="fill:none;stroke:' + c + ";stroke-width:" + f1(sw * 1.2) + ';stroke-linecap:round;stroke-linejoin:round"/>';
  }).join("");
}
/* R1: spots strewn over a region, all leaning about the same way (the crystal throws them in one direction), none on the glass */
const SCATTER = { am: [[468, 30, 706, 300], -16, 101], noon: [[560, 296, 862, 436], 64, 202], pm: [[540, -36, 706, 176, 706, -36, 866, 40], 16, 303] };
function scatter(k) {
  const [R, ang, sd] = SCATTER[k]; let s0 = sd; const r = () => ((s0 = (s0 * 16807) % 2147483647) / 2147483647);
  const boxes = []; for (let i = 0; i < R.length; i += 4) boxes.push(R.slice(i, i + 4));
  const out = [], put = [];
  for (let tries = 0; out.length < 11 && tries < 400; tries++) {
    const bx = boxes[Math.floor(r() * boxes.length)], x = bx[0] + r() * (bx[2] - bx[0]), y = bx[1] + r() * (bx[3] - bx[1]);
    if (x > 709 && x < 868 && y > 38 && y < 246) continue;
    if (put.some((q) => Math.hypot(q[0] - x, q[1] - y) < 34)) continue;
    const L = 15 + r() * 17, w = 4.6 + r() * 3, a = (ang + (r() - .5) * 26) * Math.PI / 180, cu = (r() - .5) * 2.4, dx = Math.cos(a) * L / 2, dy = Math.sin(a) * L / 2;
    put.push([x, y]); out.push(spot([[x - dx, y - dy], [x - Math.sin(a) * cu, y + Math.cos(a) * cu], [x + dx, y + dy]], w));
  }
  return out.join("");
}
/* R3: spots on things, bent where they cross an edge or curved over a round surface (kitchen units, measured off the trace) */
const THINGS = {
  am: [[[[588, 203], [602, 197.4], [618, 198]], 5], [[[574, 176], [587.6, 178.5], [591.5, 186]], 4.6, 1], [[[540, 268], [556, 286], [578, 291]], 5], [[[656, 230], [664, 244], [668, 262]], 5]],
  noon: [[[[748, 356], [760, 368.6], [762, 382]], 4.6, 1], [[[786, 330], [796, 324], [808, 327]], 5], [[[640, 352], [652, 368.6], [654, 380]], 4.6, 1], [[[818, 392], [832, 398], [846, 396]], 5]],
  pm: [[[[606, 24], [616, 26], [628, 23]], 5], [[[650, 60], [661.5, 62], [664.5, 70]], 4.6, 1], [[[742, 14], [762, 9], [784, 11]], 5], [[[566, 64], [578, 68], [590, 66]], 5]],
};
const things = (k) => THINGS[k].map(([pts, w, b]) => spot(pts, w, b)).join("");
/* partial beams: [from x, y, to x, y, stripe width] */
const PART = {
  am: [[822, 118, 642, 128, .85], [822, 122, 664, 262, .75], [822, 116, 708, 66, .65]],
  noon: [[822, 122, 690, 300, .85], [822, 124, 846, 374, .75], [822, 124, 640, 346, .65]],
  pm: [[822, 116, 760, 16, .85], [822, 118, 642, 96, .75], [822, 114, 706, -24, .65]],
};
function rainbows(v) {
  const defs = '<defs><filter id="' + v + '-rbblur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation=".75"/></filter>' +
    '<pattern id="' + v + '-rbdot" width="2.3" height="2.3" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="1.15" cy="1.15" r="1.02" fill="#fff"/></pattern>' +
    '<mask id="' + v + '-rbdots" maskUnits="userSpaceOnUse" x="-100" y="-100" width="1100" height="700"><rect x="-100" y="-100" width="1100" height="700" fill="url(#' + v + '-rbdot)"/></mask></defs>';
  return defs + '<g class="rb"><g class="rb-turn">' + Object.keys(SUN).map((k) =>
    V("sun-" + k, beams(v, k) + V("r2-1", beams(v, k, PART[k], true)) + V("r1-1", '<g class="rb-spots">' + scatter(k) + "</g>") + V("r3-1", '<g class="rb-spots">' + things(k) + "</g>"))).join("") + "</g></g>";
}
/* rainbow beams from the crystals; they move with the time of day (sun-am, sun-noon, sun-pm), none in the evening */
const SUN = {
  am: [[812, 108, 560, 168, 1.6], [818, 136, 590, 222, 1.4]],
  noon: [[816, 128, 720, 330, 1.5], [830, 140, 776, 338, 1.3]],
  pm: [[812, 110, 690, 52, 1.5], [828, 100, 862, 58, 1.3], [818, 130, 680, 150, 1.3]],
};
function beams(v, sun, list, part) {
  const C = RB, id = v + "-bm" + (++uid), st = part ? [[0, 0], [.2, .8], [.5, .45], [1, 0]] : [[0, 0], [.25, .9], [.8, .6], [1, 0]];
  const band = (x1, y1, x2, y2, w) => {
    const len = Math.hypot(x2 - x1, y2 - y1), nx = -(y2 - y1) / len, ny = (x2 - x1) / len, g = id + "g" + (++uid);
    let t = '<linearGradient id="' + g + '" gradientUnits="userSpaceOnUse" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + st.map(([o, a]) => '<stop offset="' + o + '" stop-color="#fff" stop-opacity="' + a + '"/>').join("") + "</linearGradient>" +
      '<mask id="' + g + 'm" maskUnits="userSpaceOnUse" x="0" y="-60" width="868" height="560"><rect x="0" y="-60" width="868" height="560" fill="url(#' + g + ')"/></mask><g mask="url(#' + g + 'm)" opacity=".75">';
    C.forEach((c, i) => { const o = (i - 2.5) * w; t += '<path d="M' + f1(x1 + nx * o) + " " + f1(y1 + ny * o) + " L" + f1(x2 + nx * o * 1.6) + " " + f1(y2 + ny * o * 1.6) + '" style="stroke:' + c + ";stroke-width:" + f1(w * 1.3) + '"/>'; });
    return t + "</g>";
  };
  return (list || SUN[sun] || []).map((b) => band(...b)).join("");
}
/* v15 window fixes: the frame's left side face was a faded strip with notches (traced highlights), redrawn as one walnut
   face with its ink line; under the sill the traced apron had no outline and a grey streak, so wall goes over it and a
   clean apron board sits under the sill */
function windowFix() {
  const side = "var(--trim-F6E9CB,#F6E9CB)", dark = "var(--trim-9D6F45,#9D6F45)";
  return '<rect x="702.9" y="80" width="7" height="161.5" style="fill:' + side + '"/>' +
    '<rect x="706.2" y="80" width=".8" height="161.5" style="fill:' + INK + '"/><rect x="709.6" y="80" width="1.2" height="161.5" style="fill:' + INK + '"/>' +
    '<rect x="699" y="254.4" width="165.4" height="14" style="fill:var(--wall)"/>' +
    P("M713 253.6 H864.6 V261.4 H717.6 Q713.4 261.4 713 257.4Z", dark, 1.5) + '<path d="M716.5 255.4 H864" style="stroke:' + side + ';stroke-width:.9"/>';
}
/* v15: the lid's front edge (at the top now it is open) had a shapeless brown nub: it is the latch tab, in brass */
function lidTab() {
  return P(wob([[88.6, 215.2], [90.2, 210.6], [103, 210.1], [104.6, 214.6]], .1), "#C9A24A", 1.2) + '<path d="M91.4 211.8 H101.8" style="stroke:#E6C878;stroke-width:.8"/><rect x="94.6" y="211.9" width="3.6" height="1.6" rx=".6" style="fill:#5A4520"/>';
}
/* evening: the window glass goes to dusk (see GLASS) and the room dims a little */
const GLASS = { "#FAF8E8": "#4B5578", "#FEF5D5": "#56618A", "#FEF2D2": "#5E6A92" };
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
  const T = 7, dn = (d) => q.map((p) => [p[0], p[1] + d]), inset = (qq, a) => { const c = qq.reduce((m, p) => [m[0] + p[0] / 4, m[1] + p[1] / 4], [0, 0]); return qq.map((p) => [c[0] + (p[0] - c[0]) * a, c[1] + (p[1] - c[1]) * a]); }, id = "cb" + (++uid);
  let s = P(wob(dn(T), .2), "#1E1C1A", 1.6);                                   /* back cover */
  s += P(wob(inset(dn(T - 1.6), .975), .2), "#F6F1E4", 1.1) + P(wob(inset(dn(2), .975), .2), "#F6F1E4", 1.1);   /* page block */
  { const a = inset(dn(3.4), .975), b = inset(dn(4.8), .975); s += '<path d="M' + f1(a[0][0] + 2) + " " + f1(a[0][1]) + " L" + f1(a[1][0] - 2) + " " + f1(a[1][1]) + " M" + f1(b[0][0] + 2) + " " + f1(b[0][1]) + " L" + f1(b[1][0] - 2) + " " + f1(b[1][1]) + '" style="stroke:#CFC6AE;stroke-width:.6"/>'; }
  s += P("M" + [q[3], q[0], dn(T)[0], dn(T)[3]].map((p) => f1(p[0]) + " " + f1(p[1])).join(" L") + "Z", "#111", 1.2);   /* spine wrapping the left side */
  s += '<clipPath id="' + id + '"><path d="M' + q.map((p) => f1(p[0]) + " " + f1(p[1])).join(" L") + 'Z"/></clipPath>';
  s += P(wob(q, .3), "#1E1C1A", 1.8) + '<g clip-path="url(#' + id + ')">';
  const xs = q.map((p) => p[0]), ys = q.map((p) => p[1]), X0 = Math.min(...xs), X1 = Math.max(...xs), Y0 = Math.min(...ys), Y1 = Math.max(...ys);
  for (let i = 0; i < (X1 - X0) * (Y1 - Y0) / 7; i++) {   /* the marble: dense white flecks and curls */
    const x = X0 + rnd() * (X1 - X0), y = Y0 + rnd() * (Y1 - Y0), r = .6 + rnd() * 1.4, a = rnd() * 6.28;
    s += '<path d="M' + f1(x) + " " + f1(y) + " q" + f1(Math.cos(a) * r) + " " + f1(Math.sin(a) * r * .5 - r * .4) + " " + f1(Math.cos(a) * r * 2) + " " + f1(Math.sin(a) * r) + '" style="fill:none;stroke:#EDE8DC;stroke-width:' + f1(.5 + rnd() * .6) + ';stroke-linecap:round"/>';
  }
  s += P("M" + [onQuad(q, 0, 0), onQuad(q, .09, 0), onQuad(q, .09, 1), onQuad(q, 0, 1)].map((p) => f1(p[0]) + " " + f1(p[1])).join(" L") + "Z", "#111") + "</g>";
  if (label) {
    const L = [onQuad(q, .34, .64), onQuad(q, .8, .64), onQuad(q, .8, .24), onQuad(q, .34, .24)], Li = inset(L, .86);
    s += P(wob(L, .1), "#FAF8E8", 1.2) + P(wob(Li, .05), "none", .5);
    for (const v of [.5, .66, .8]) { const a = onQuad(Li, .12, v), b = onQuad(Li, .88, v); s += '<path d="M' + f1(a[0]) + " " + f1(a[1]) + " L" + f1(b[0]) + " " + f1(b[1]) + '" style="stroke:#9C9892;stroke-width:.5"/>'; }
  }
  return s;
}
/* a book lying flat: w wide, d deep (in the counter plane), turned ang degrees; seen from above at the plates' angle (depth x .27) */
function flatQuad(cx, cy, w, d, ang, k) {
  const a = ang * Math.PI / 180; k = k || .27; const P2 = (x, y) => [cx + x * Math.cos(a) - y * Math.sin(a), cy + (x * Math.sin(a) + y * Math.cos(a)) * k];
  return [P2(-w / 2, d / 2), P2(w / 2, d / 2), P2(w / 2, -d / 2), P2(-w / 2, -d / 2)];
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

/* ---- "Ideas" at the top of the big white note on the cork board (v13: larger, fills the note's top band) ---- */
function ideasNote() {
  const t = ' transform="rotate(-4 217 172)"';
  return '<text x="217" y="172"' + t + ' style="font:700 19px Caveat,\'Segoe Script\',cursive;fill:#2a2622">Ideas</text>' +
    '<path d="M217 175.6 q17 -1.8 35 -2.6"' + t + ' style="fill:none;stroke:#2a2622;stroke-width:1.1;stroke-linecap:round"/>';
}

/* ---- v13 shelf plaques: brass label holders with a cream card, screwed to the board fronts (they overhang the thin boards a
        little, as real ones do). Boards: middle front y ~10-16, bottom front y ~106-112.5; cookbooks x 410-560, references 560-664.
        One plaque, "The Library", centred on the bottom board ---- */
const SHELF = { mid: 13, bot: 109.3 };
function plaque(cx, cy, label, fs) {
  fs = fs || 7.6; const tw = label.length * (fs * .56 + .7), w = tw + 15, h = fs + 6.4, x0 = cx - w / 2, y0 = cy - h / 2;   /* tw: the caps' width, fixed by textLength */
  return '<g class="plaque">' +
    '<path d="M' + f1(x0 + 1.2) + " " + f1(y0 + h + .9) + " H" + f1(x0 + w + .4) + '" style="stroke:#3d2614;stroke-width:1.2;opacity:.45"/>' +   /* its shadow on the board */
    P(wob([[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]], .12), "#D4A94F", 1.2) +
    '<path d="M' + f1(x0 + 1.4) + " " + f1(y0 + 1.3) + " H" + f1(x0 + w - 1.4) + '" style="stroke:#F0D58C;stroke-width:.8"/>' +   /* light on the top lip */
    P(wob([[x0 + 4.4, y0 + 2], [x0 + w - 4.4, y0 + 2], [x0 + w - 4.4, y0 + h - 2], [x0 + 4.4, y0 + h - 2]], .08), "#FAF3DC", .7) +
    [x0 + 2.2, x0 + w - 2.2].map((x) => '<circle cx="' + f1(x) + '" cy="' + f1(cy) + '" r=".9" style="fill:#8A6A28"/>').join("") +
    '<text x="' + f1(cx) + '" y="' + f1(cy + fs * .36) + '" text-anchor="middle" textLength="' + f1(tw - .7) + '" lengthAdjust="spacingAndGlyphs" style="font:700 ' + fs + 'px \'Archivo Narrow\',\'Arial Narrow\',sans-serif;letter-spacing:.7px;fill:' + INK + '">' + label.toUpperCase() + "</text></g>";
}
const shelfPlaques = () => plaque(537, SHELF.bot, "The Library", 8.2);   /* P1 (Ari 11/20) */

/* ---- v13 whiteboard heading in the marker's own red, top left of the board, underlined like the Ideas note ---- */
const WB_HEAD = "Next up", WB_INK = "#B8392E";
function wbHead() {
  const t = ' transform="rotate(-2 472 166)"';
  return '<text x="472" y="166"' + t + ' style="font:700 21px Caveat,\'Segoe Script\',cursive;fill:' + WB_INK + ';stroke:' + WB_INK + ';stroke-width:.35;stroke-linejoin:round">' + WB_HEAD + "</text>" +
    '<path d="M471 170.4 q' + f1(WB_HEAD.length * 4.4) + " -1.2 " + f1(WB_HEAD.length * 8.8) + ' -.6"' + t + ' style="fill:none;stroke:' + WB_INK + ';stroke-width:1.5;stroke-linecap:round;opacity:.9"/>';
}

/* ---- without the flour and rolling pin (tidy-1): wall and counter filled where they stood ---- */
function tidyPatch(v) {
  const id = (s) => v + "-" + s, g = (o, c) => '<use href="#' + id("mk-" + o) + '" fill="' + c + '" stroke="' + c + '" stroke-width="12" stroke-linejoin="round"/>';
  return '<clipPath id="' + id("td") + '"><rect x="680.5" y="255" width="190" height="130"/></clipPath><clipPath id="' + id("tu") + '"><rect x="0" y="0" width="868" height="316.4"/></clipPath><clipPath id="' + id("tl") + '"><rect x="0" y="316.4" width="868" height="200"/></clipPath>' +
    '<g clip-path="url(#' + id("td") + ')"><g clip-path="url(#' + id("tu") + ')">' + g("flour", "var(--wall)") + "</g>" +
    '<g clip-path="url(#' + id("tl") + ')">' + g("flour", "#D4A36F") + g("pin", "#D4A36F") + "</g></g>" +
    '<rect x="681" y="315.4" width="72" height="1.8" style="fill:' + INK + '"/>' +
    '<path d="M700 330 Q728 328.6 756 330 Q728 331 700 330Z M712 352 Q750 350.4 790 352 Q750 353.2 712 352Z M760 340 Q790 338.8 822 340 Q790 341 760 340Z" style="fill:#A87548"/>';
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
/* v15: the inside, after Ari's pantry picture: warm wood, two shelves, glass jars with handwritten labels (no dishes).
   Same one-point projection as the door: we look up into it (it is above eye level), so we see the ceiling's and the shelves'
   undersides and the left side wall; jars sit back from the shelf fronts, so the boards hide their bottoms. */
const WD = { back: "#A86C3D", backD: "#8E5832", seam: "#7E4D2B", side: "#7C4C29", sideD: "#683F21", ceil: "#5B381F", lip: "#C98D56", lipL: "#E2AC72", under: "#875530" };
/* the stuff inside a jar: colour, and a speck colour for its texture */
const FILL = { flour: ["#F3EEE1", "#D9D1BE"], sugar: ["#FBFAF5", "#E4E1D6"], cocoa: ["#5A3323", "#7E5038"], oats: ["#E2C78E", "#B99659"], pecans: ["#9E6435", "#6E3F1E"], salt: ["#FFFFFF", "#DCDCD6"],
  paprika: ["#B6442F", "#8A2E1F"], herbs: ["#6E7F44", "#4F5E2E"], cinnamon: ["#93552A", "#6E3C1C"], pepper: ["#3B342C", "#6B6156"], turmeric: ["#D99A2B", "#B37A18"], vanilla: ["#3A2418", "#5E3E2A"] };
const LIDS = { steel: ["#A9A79E", "#CFCDC4"], blue: ["#5E7FA6", "#89A3C2"], red: ["#B8473A", "#D9766A"], brass: ["#C9A24A", "#E6C878"], black: ["#2E2B28", "#5A554F"], cream: ["#E9DDBE", "#F6EEDB"] };
/* one jar standing at its front plane; at(Z) moves it back. cx = middle, b = where it stands, w x h, fill kind, level 0..1, lid, label */
function jar(cx, b, w, h, kind, lvl, lid, label) {
  const id = "jr" + (++uid), x0 = cx - w / 2, x1 = cx + w / 2, lh = Math.max(2.8, h * .12), t = b - h, tb = t + lh, r = Math.min(3, w * .18);
  const body = "M" + f1(x0) + " " + f1(tb + 2) + " Q" + f1(x0) + " " + f1(tb) + " " + f1(x0 + 2) + " " + f1(tb) + " H" + f1(x1 - 2) + " Q" + f1(x1) + " " + f1(tb) + " " + f1(x1) + " " + f1(tb + 2) +
    " V" + f1(b - r) + " Q" + f1(x1) + " " + f1(b) + " " + f1(x1 - r) + " " + f1(b) + " Q" + f1(cx) + " " + f1(b + w * .06) + " " + f1(x0 + r) + " " + f1(b) + " Q" + f1(x0) + " " + f1(b) + " " + f1(x0) + " " + f1(b - r) + "Z";
  const [c, sp] = FILL[kind], lv = b - (b - tb) * lvl;
  let s = '<clipPath id="' + id + '"><path d="' + body + '"/></clipPath>' + '<path d="' + body + '" style="fill:#E7EFEA;opacity:.5"/><g clip-path="url(#' + id + ')">' +
    '<path d="M' + f1(x0 - 1) + " " + f1(lv) + " Q" + f1(cx) + " " + f1(lv + w * .05) + " " + f1(x1 + 1) + " " + f1(lv) + " V" + f1(b + 3) + " H" + f1(x0 - 1) + 'Z" style="fill:' + c + '"/>';
  for (let i = 0; i < w * (b - lv) / 9; i++) s += '<circle cx="' + f1(x0 + rnd() * w) + '" cy="' + f1(lv + 1 + rnd() * (b - lv)) + '" r="' + f1(.25 + rnd() * .35) + '" style="fill:' + sp + '"/>';
  s += '<path d="M' + f1(x0 + w * .16) + " " + f1(tb + 2.5) + " V" + f1(b - 3) + '" style="stroke:#fff;stroke-width:' + f1(Math.max(1, w * .07)) + ';stroke-linecap:round;opacity:.75"/>' +
    '<path d="M' + f1(x1 - w * .13) + " " + f1(tb + 3) + " V" + f1(tb + 3 + h * .22) + '" style="stroke:#fff;stroke-width:.8;stroke-linecap:round;opacity:.6"/></g>';
  s += '<path d="' + body + '" style="fill:none;stroke:' + INK + ';stroke-width:1.2;stroke-linejoin:round"/>';
  const [lc, ll] = LIDS[lid], lx0 = cx - w * .44, lx1 = cx + w * .44;
  s += P("M" + f1(lx0) + " " + f1(t + .6) + " Q" + f1(lx0) + " " + f1(t) + " " + f1(lx0 + .6) + " " + f1(t) + " H" + f1(lx1 - .6) + " Q" + f1(lx1) + " " + f1(t) + " " + f1(lx1) + " " + f1(t + .6) + " V" + f1(tb) + " Q" + f1(cx) + " " + f1(tb + w * .04) + " " + f1(lx0) + " " + f1(tb) + "Z", lc, 1.1) +
    '<path d="M' + f1(lx0 + .8) + " " + f1(t + .9) + " H" + f1(lx1 - .8) + '" style="stroke:' + ll + ';stroke-width:.8"/>';
  if (label) {
    const lw = w * .7, lhh = Math.min(h * .3, w * .36), ly = b - h * .42, fs = lhh * .82;
    s += P(wob([[cx - lw / 2, ly - lhh / 2], [cx + lw / 2, ly - lhh / 2 - .3], [cx + lw / 2, ly + lhh / 2], [cx - lw / 2, ly + lhh / 2 + .2]], .25), "#EFE3C4", .8) +
      '<text x="' + f1(cx) + '" y="' + f1(ly + fs * .34) + '" text-anchor="middle" textLength="' + f1(Math.min(lw * .84, label.length * fs * .44)) + '" lengthAdjust="spacingAndGlyphs" style="font:700 ' + f1(fs) + 'px Caveat,\'Segoe Script\',cursive;fill:#2a2622">' + label + "</text>";
  }
  return s;
}
/* set something back by Z (negative) into the cupboard: the projection's scale about the vanishing point */
const at = (Z, svg) => '<g transform="translate(' + VP[0] + " " + VP[1] + ") scale(" + (F / (F - Z)).toFixed(4) + ") translate(" + (-VP[0]) + " " + (-VP[1]) + ')">' + svg + "</g>";
function interior(v) {
  const x0 = DOOR.x0, x1 = x0 + DOOR.W, y0 = DOOR.yt, y1 = DOOR.yb, dep = 60, B = (X, Y) => proj(X, Y, -dep), cid = v + "-op";
  const poly = (a, fill, sw) => P("M" + a.map((p) => f1(p[0]) + " " + f1(p[1])).join(" L") + "Z", fill, sw), line = (a, b, c, w) => '<path d="M' + f1(a[0]) + " " + f1(a[1]) + " L" + f1(b[0]) + " " + f1(b[1]) + '" style="stroke:' + c + ";stroke-width:" + w + '"/>';
  let s = '<clipPath id="' + cid + '"><rect x="' + x0 + '" y="' + (y0 - 10) + '" width="' + DOOR.W + '" height="' + (y1 - y0 + 10) + '"/></clipPath><g clip-path="url(#' + cid + ')">';
  /* back wall: planks, and the shade each shelf casts on it */
  s += poly([B(x0, y0), B(x1 + 40, y0), B(x1 + 40, y1), B(x0, y1)], WD.back);
  [x0 + 44, x0 + 88].forEach((X) => { s += line(B(X, y0), B(X, y1), WD.seam, .8); });
  [y0, 3, 52].forEach((sy) => { const y = sy === y0 ? y0 : sy + 3.5; s += poly([B(x0, y), B(x1 + 40, y), B(x1 + 40, y + 9), B(x0, y + 9)], WD.backD); });
  /* left side wall, darker under each shelf; the ceiling */
  s += poly([[x0, y0], B(x0, y0), B(x0, y1), [x0, y1]], WD.side);
  [3, 52].forEach((sy) => { s += poly([[x0, sy + 3.5], B(x0, sy + 3.5), B(x0, sy + 12), [x0, sy + 9]], WD.sideD); });
  s += poly([[x0, y0], [x1, y0], B(x1, y0), B(x0, y0)], WD.ceil) + line(B(x0, y0), B(x0, y1), INK, .9) + line(B(x0, y0), B(x1 + 40, y0), INK, .9);
  /* jars, back to front. Top shelf: spices and a tin; middle: flour, sugar, cocoa (a vanilla jar behind); floor: oats, pecans, salt */
  s += at(-30, jar(157, 3, 10, 14, "herbs", .78, "black") + jar(170, 3, 10, 16, "paprika", .7, "red") + jar(183, 3, 10, 15, "cinnamon", .74, "brass") + jar(196, 3, 9, 17, "pepper", .8, "steel") +
    jar(214, 3, 17, 23, "turmeric", .64, "cream") + jar(235, 3, 14, 19, "herbs", .55, "steel") + jar(254, 3, 14, 18, "paprika", .66, "black"));
  s += at(-44, jar(222, 52, 12, 22, "vanilla", .5, "black"));
  s += at(-18, jar(167, 52, 28, 35, "flour", .74, "steel", "Flour") + jar(204, 52, 25, 32, "sugar", .7, "red", "Sugar") + jar(257, 52, 19, 27, "cocoa", .66, "brass", "Cocoa"));
  s += at(-18, jar(169, y1, 30, 36, "oats", .72, "brass", "Oats") + jar(210, y1, 22, 30, "pecans", .6, "steel", "Pecans") + jar(250, y1, 19, 24, "salt", .62, "red", "Salt"));
  /* the shelves over the jars: underside first, then the front edge with light on its top */
  [3, 52].forEach((sy) => {
    s += poly([[x0, sy + 3.5], [x1, sy + 3.5], B(x1, sy + 3.5), B(x0, sy + 3.5)], WD.under) +
      P(wob([[x0, sy], [x1, sy], [x1, sy + 3.5], [x0, sy + 3.5]], .15), WD.lip, 1.2) + line([x0 + 1, sy + .9], [x1 - 1, sy + .9], WD.lipL, .9);
  });
  s += "</g>" + P(wob([[x0, y0 - 6], [x1, y0 - 6], [x1, y1], [x0, y1]], .3), "none", 2.4);
  return s;
}
/* v15: the door's two hinges, on the frame at the hinge side */
function hinges() {
  return [.1, .86].map((v) => { const y = DOOR.yt + v * H_DOOR; return P(wob([[130.4, y], [135, y], [135, y + 9.5], [130.4, y + 9.5]], .1), "#4A463F", 1.1) + '<path d="M131.6 ' + f1(y + 1.4) + " V" + f1(y + 8) + '" style="stroke:#8C877C;stroke-width:.8"/><path d="M130.4 ' + f1(y + 4.75) + ' H135" style="stroke:' + INK + ';stroke-width:.6"/>'; }).join("");
}
const LOG_TITLE = "Kitchen log";
/* clipboard: a real one is about 9 x 12.5 in; here 66 wide, 92 tall on the door */
function clipboard() {
  const uL = .2, uR = uL + 66 / DOOR.W, vT = .36, vB = vT + 92 / H_DOOR, q = (pts, n) => pts.map((p) => on(p[0], p[1], n));
  const pu = (a) => uL + (uR - uL) * a, pv = (a) => vT + (vB - vT) * a;
  /* shadow on the door, down and toward the hinge, then the board's edge (it stands off the door), then its face */
  let s = P(wob(q([[uL - .035, vT + .03], [uR - .035, vT + .03], [uR - .035, vB + .035], [uL - .035, vB + .035]], .2), .4), cab(58));
  s += P(wob(q([[uL, vB], [uR, vB], [uR, vB + .022], [uL, vB + .022]], 1), .2), "#7E4F2C", 1.4) + P(wob(q([[uL, vT], [uL, vB + .022], [uL - .012, vB + .02], [uL - .012, vT + .004]], 1), .1), "#8A5A33", 1.2);
  s += P(wob(q([[uL, vT], [uR, vT], [uR, vB], [uL, vB]], 3), .4), "#B57D4B", 1.7);
  s += P(wob(q([[pu(.08), pv(.07)], [pu(.92), pv(.07)], [pu(.92), pv(.96)], [pu(.08), pv(.96)]], 3.2), .3), PAPER, 1);
  for (let a = .275; a < .93; a += .065) { const p1 = on(pu(.16), pv(a), 1.3), p2 = on(pu(.84), pv(a), 1.3); s += '<path d="M' + f1(p1[0]) + " " + f1(p1[1]) + " L" + f1(p2[0]) + " " + f1(p2[1]) + '" style="stroke:' + RULE + ';stroke-width:.8"/>'; }
  { /* the sheet's title, laid on the door's plane (an affine fit from three points on it); the inside face runs right to left from the hinge, so the text starts at the far side */
    /* v13: bigger (15 units), spanning 76% of the sheet; textLength fits it to the span whatever the font measures */
    const o = on(pu(.875), pv(.215), 3.4), ex = on(pu(.135), pv(.215), 3.4), ey = on(pu(.875), pv(.215) + 10 / H_DOOR, 3.4), W = (uR - uL) * DOOR.W * .74;
    const m = [(ex[0] - o[0]) / W, (ex[1] - o[1]) / W, (ey[0] - o[0]) / 10, (ey[1] - o[1]) / 10, o[0], o[1]].map((n) => +n.toFixed(4));
    s += '<text transform="matrix(' + m.join(" ") + ')" x="0" y="0" textLength="' + f1(W) + '" lengthAdjust="spacingAndGlyphs" style="font:700 15px Caveat,\'Segoe Script\',cursive;fill:#2a2622">' + LOG_TITLE + "</text>"; }
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
  return door + hinges();
}

/* the open notebook moves left, half way to the recipe box (Ari 11/19); clean.cjs moves its traced groups */
const SHIFT = { notebook: [-34, 0] };
/* the notebook's outline where it was traced (with its shadow); clean.cjs copies what is inside it */
const HULL = { notebook: [[259.5, 326.5], [263.5, 322.8], [334, 316.8], [403, 315], [426, 317], [447, 338], [456.5, 352], [454, 358.5], [441.5, 361.5], [362, 368], [280, 373.5], [261, 340]] };
/* where a moved object stood: wall above the counter's back edge (y 316.4), counter below, the edge line and some grain */
function patch(v, o) {
  const id = (s) => v + "-" + s + "-" + o, hp = HULL[o].map((p) => p.join(" ")).join(" ");
  return '<clipPath id="' + id("pu") + '"><rect x="0" y="0" width="868" height="316.4"/></clipPath><clipPath id="' + id("pl") + '"><rect x="0" y="316.4" width="868" height="200"/></clipPath>' +
    '<polygon points="' + hp + '" clip-path="url(#' + id("pu") + ')" style="fill:var(--wall);stroke:var(--wall);stroke-width:3"/>' +
    '<polygon points="' + hp + '" clip-path="url(#' + id("pl") + ')" style="fill:#D4A36F;stroke:#D4A36F;stroke-width:3"/>' +
    '<rect x="330" y="315.4" width="134" height="1.8" style="fill:' + INK + '"/>' +
    '<path d="M300 336 Q340 334.6 380 336 Q340 337 300 336Z M360 352 Q400 350.4 440 352 Q400 353.2 360 352Z" style="fill:#A87548"/>';
}
/* ---- evening under-cabinet and shelf light (v13): a light bar under the cabinet and bookshelf bottoms (y ~118, x 6..664),
        a soft pool down the wall onto the counter (back edge y 316.4, front ~370). Screen blend lifts the dusk layer,
        a soft-light pass adds the warmth. Only with sun-eve. ---- */
const LT = { "2700": "#FFA957" };   /* 2700K (Ari 11/20), blackbody approximation, sRGB */
function underLight(v) {
  return Object.keys(LT).map((k) => {
    const c = LT[k], id = v + "-lt" + k, X0 = 6, X1 = 664, Y0 = 118.5, FR = 370, W = X1 + 60 - X0;
    const stop = (o, a) => '<stop offset="' + o + '" stop-color="' + c + '" stop-opacity="' + a + '"/>';
    const m = ' mask="url(#' + id + 'm)"', R = (y0, y1, fill) => '<rect x="' + X0 + '" y="' + y0 + '" width="' + W + '" height="' + f1(y1 - y0) + '" fill="' + fill + '"/>';
    const svg = '<defs>' +
      '<linearGradient id="' + id + 'w" x1="0" y1="0" x2="0" y2="1">' + stop(0, .75) + stop(.08, .4) + stop(.36, .16) + stop(.74, .12) + stop(.84, .3) + stop(1, .03) + "</linearGradient>" +
      '<linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1">' + stop(0, .9) + stop(.35, .55) + stop(1, .35) + "</linearGradient>" +
      '<linearGradient id="' + id + 'h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff"/><stop offset=".76" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>' +
      '<mask id="' + id + 'm" maskUnits="userSpaceOnUse" x="' + X0 + '" y="100" width="' + W + '" height="300"><rect x="' + X0 + '" y="100" width="' + W + '" height="300" fill="url(#' + id + 'h)"/>' +
        '<rect x="34" y="208" width="152" height="156" rx="14" filter="url(#' + id + 'k)" style="fill:#4d4d4d"/></mask>' +   /* the box (brand blue) takes less light, so it stays blue */
      '<filter id="' + id + 'k" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>' +
      '<filter id="' + id + 'b" x="-5%" y="-300%" width="110%" height="700%"><feGaussianBlur stdDeviation="2.2"/></filter></defs>' +
      /* each blended layer carries its own mask: a masked parent would isolate the blend */
      '<g' + m + ' style="mix-blend-mode:soft-light;pointer-events:none">' + R(Y0, FR, "url(#" + id + "s)") + "</g>" +
      '<g' + m + ' style="mix-blend-mode:screen;pointer-events:none">' + R(Y0, FR, "url(#" + id + "w)") + "</g>" +
      '<g style="pointer-events:none"><rect x="' + X0 + '" y="' + (Y0 - 1) + '" width="' + (X1 - X0) + '" height="3" filter="url(#' + id + 'b)" style="fill:' + c + ';opacity:.85"/>' +
      '<rect x="' + X0 + '" y="' + Y0 + '" width="' + (X1 - X0) + '" height="1.1" style="fill:color-mix(in srgb,' + c + ' 35%,#fff)"/></g>';
    return V("sun-eve", svg);
  }).join("");
}
/* evening dims the room, but not the bookshelf (the Library): it stays as bright as the open cupboard (Ari 11/20) */
function duskWash(v) {
  return '<path d="M0 -60 H868 V500 H0Z M410.5 -60 V115.5 H661.5 V-60Z" fill-rule="evenodd" style="fill:#2B2A4A;opacity:.2;mix-blend-mode:multiply"/>';
}
module.exports = {
  DEF, SHIFT, HULL, patch, TRIM, GLASS,
  opts(v) {
    seed = 7;
    return { end: [{ obj: "whiteboard", svg: marker() }, { obj: "ideas", svg: ideasNote() },
      { obj: "room", svg: V("tidy-1", tidyPatch(v)), top: true },
      { obj: "notebook", svg: nbExtras(), top: true, shift: true }, { obj: "notebook", svg: stackFront(), top: true },
      { obj: "box", svg: boxWear() + boxLabel() + lidTab(), top: true },
      { obj: "eclair", svg: rack(), top: true },
      { obj: "window", svg: windowFix() + rainbows(v) + crystals() + Object.keys(SILL).map((k) => V("sill-" + k, SILL[k][1]())).join(""), top: true },
      { obj: "cookbooks", svg: shelfPlaques(), top: true }, { obj: "whiteboard", svg: wbHead(), top: true },   /* v13 text: under the dusk wash */
      { obj: "dusk", svg: V("sun-eve", duskWash(v)), top: true },
      { obj: "lt", svg: underLight(v), top: true },
      { obj: "cup-open", svg: cupOpen(v), top: true }, { obj: "clip", svg: clipboard(), top: true }] };
  },
  /* close-ups for the page, drawn over a <use> of the kitchen scene */
  closeups(v) {
    seed = 11;
    const am = (z) => beams(v + z, "am") + beams(v + z, "am", PART.am, true) + scatter("am") + things("am");
    return [
      ...Object.keys(CRYSTALS).map((k) => ({ key: "cr" + k, pick: "cr-" + k, title: "K" + k + " · " + CRYSTALS[k][0] + " (click to hang it in the kitchen)", vb: "766 22 112 162", svg: CRYSTALS[k][1]() })),
      { key: "rs1", pick: "rs-s1", title: "S1 · Soft: the light blurred a little at its edges", vb: "520 120 190 150", svg: '<g filter="url(#a-rbblur)">' + am("r1") + "</g>" },
      { key: "rs2", pick: "rs-s2", title: "S2 · Printed: crisp flat stripes, like the beams in v14", vb: "520 120 190 150", svg: am("r2") },
      { key: "rs3", pick: "rs-s3", title: "S3 · Halftone: the same light in printed dots", vb: "520 120 190 150", svg: '<g mask="url(#a-rbdots)">' + am("r3") + "</g>" },
      { key: "cup", title: "The open cupboard after your pantry picture: wood inside, jars with real labels, hinges, the Kitchen log where it was", vb: "0 -40 290 150", svg: cupOpen(v + "z2") + clipboard() },
      ...Object.keys(SILL).map((k) => ({ key: "sill" + k, title: "B" + k + " · " + SILL[k][0], vb: "716 20 150 236", svg: beams(v + "z" + k, "am") + CRYSTALS[DEF.cr][1]() + SILL[k][1]() })),
      { key: "rack", title: "Your eclairs on your cooling rack (click the rack in the kitchen: two taken, two bites out of the last, then gone)", vb: "684 300 182 70", svg: '<use href="#a-all"/>' },
      { key: "nb2", title: "Your composition journals, square to the counter, “Trials” on the top label", vb: "210 286 340 90", svg: '<use href="#a-all"/>' },
      { key: "clip", title: "The clipboard: “" + LOG_TITLE + "” at the top of the sheet", vb: "40 -26 84 72", svg: cupOpen(v + "z") + clipboard() },
      { key: "box", title: "Recipe box with RECIPES, worn paint, tab letters", vb: "26 200 170 170", svg: boxWear() + boxLabel() },
      { key: "ideas", title: "“Ideas” on the big note", vb: "200 140 90 54", svg: ideasNote() },
      { key: "pl", title: "“The Library” on the bottom shelf", vb: "404 0 268 124", svg: shelfPlaques() },
      { key: "wb", title: "“Next up” on the whiteboard", vb: "452 130 142 70", svg: '<use href="#a-all"/>' },
    ];
  },
};
