/* Turns Ari's traced Kittl SVG (source.svg, 868 x 489, 1365 unnamed paths) into a kitchen the app can use:
   - sorts every shape into an object by where it sits (OBJ boxes below), keeping the paint order
   - splits the dark underlay ("ink"): the outlines are not lines but a few huge dark shapes showing through the gaps.
     Each object takes the part of the ink that lies under its own shapes (grown by INK_GROW), through an SVG mask;
     the room keeps the rest. Same picture, but an object can now move or glow with its own outline.
   - gives the recipe box its own blue (Blue 3 shades), cabinets follow --cab, the wall follows --wall
   - deletes the traced scribbles where the app will write (whiteboard, notes, notebook pages, box tabs, book spines)
   - adds the new pieces from add.cjs (eclair, spoon jar, marker, shelf labels, open cupboard)
   - shows more wall cupboard: the frame now ends at the bottom of the middle drawer (TOP units cut off below) and the same
     height is added on top: the wall cupboards are stretched upward, the cubby gets one more compartment of books
   node traced/clean.cjs  -> traced/kitchen.svg (+ traced/report.json); --plain = split only, at the old frame */
const { chromium } = require("/Users/ari/codes/trial-and-eclair/frontend/node_modules/playwright");
const fs = require("fs"), path = require("path"), D = __dirname;
const ADD = require("./add.cjs");
/* object boxes [x0, y0, x1, y1] in the source's units; first match wins, so smaller things come first */
const OBJ = [
  ["box", 30, 205, 190, 365], ["notebook", 255, 308, 458, 376], ["mixer", 524, 195, 682, 356], ["flour", 678, 252, 750, 345], ["pin", 680, 318, 842, 368],
  ["whiteboard", 452, 130, 592, 300], ["ideas", 188, 130, 446, 304], ["cookbooks", 410, 0, 560, 120], ["references", 560, 0, 664, 120],
  ["window", 696, 10, 868, 268], ["log", 594, 388, 770, 489], ["knee", 278, 388, 594, 489],
];
/* where traced scribbles get deleted: [x0, y0, x1, y1, maxSize, lightLimit, objects it applies to]; a shape lighter than lightLimit
   is kept, and so is one bigger than maxSize either way */
const SCRIB = [
  [462, 140, 584, 292, 60, .95, "whiteboard"],   /* whiteboard writing */
  [205, 145, 335, 285, 26, .72, "ideas"],   /* notes on the cork board */
  [262, 316, 328, 370, 30, .93, "notebook"], [350, 314, 452, 366, 30, .93, "notebook"],   /* notebook pages, not the spiral */
  [520, 180, 586, 262, 8, .72, "mixer"],  /* whiteboard writing that pokes out beside the mixer head */
  [526, 228, 547, 256, 11, .95, "mixer"], /* the leftover marks just left of the mixer head */
  [62, 262, 178, 300, 9, .72, "box"],     /* letters on the box tabs */
  [418, 18, 660, 108, 9, .72, "cookbooks references"],     /* titles on the book spines */
];
const INK_GROW = 6;   /* stroke width that grows an object's shapes into its ink mask (3 units each side) */
const TOP = 44;   /* units moved from the bottom of the frame to the top (bottom = middle drawer's bottom, y 440) */
/* shapes inside an object's box that belong elsewhere: [object, test(shape, cx, cy, hue), new object] */
const WOODY = (h) => { const [hu, s, l] = hsl(h); return hu > .06 && hu < .1 && s > .3 && l > .35 && l < .7; };
const MOVE_TO = [
  ["mixer", (q, cx, cy) => WOODY(q.fill) && cy > 300, "room"],   /* counter wood showing between the mixer's feet */
  ["mixer", (q, cx, cy) => cx < 546 && cy < 266, "whiteboard"],  /* whiteboard specks left of the mixer head */
];
function hsl(h) { const r = parseInt(h.slice(1, 3), 16) / 255, g = parseInt(h.slice(3, 5), 16) / 255, b = parseInt(h.slice(5, 7), 16) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  let hu = 0, s = 0; if (d) { s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); hu = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hu /= 6; } return [hu, s, l]; }
const isBlue = (h) => { const [hu, s, l] = hsl(h); return hu > .48 && hu < .62 && s > .12 && l > .12 && l < .82; };
const MAIN = hsl("#6D8C97")[2];
function shade(v, h) { const l = hsl(h)[2]; return l >= MAIN ? "color-mix(in srgb," + v + " " + Math.round(100 - (l - MAIN) / (1 - MAIN) * 100) + "%,#fff)" : "color-mix(in srgb," + v + " " + Math.round(100 - (MAIN - l) / MAIN * 100) + "%,#1f1d1a)"; }
const r1 = (d) => d.replace(/-?\d*\.\d+/g, (n) => (+(+n).toFixed(1)).toString());
const r0 = (d) => d.replace(/-?\d*\.\d+/g, (n) => Math.round(+n).toString());
/* the added height on top, made from the picture itself (a <use> of the whole scene, clipped):
   wall cupboards: the band y 5..55 has only upright lines (stiles, panel edges), so it is stretched up to the new top;
   cubby: the compartment above is the books compartment moved up one shelf, with the books flipped so they don't repeat;
   wall above the window: plain wall */
const CAB_X = 410.3, CUB = [410.3, 666], CUB_IN = [422, 653], CUB_PITCH = 95.3, CUB_SHELF = 10.3;
function extend(id) {
  const y0 = 5 - TOP - 2, K = (55 - y0) / 50, T = 55 - 55 * K, cx = (CUB_IN[0] + CUB_IN[1]) / 2, use = '<use href="#' + id("scene") + '"';
  return '<clipPath id="' + id("x-cab") + '"><rect x="-5" y="' + y0 + '" width="' + (CAB_X + 5) + '" height="' + (55 - y0) + '"/></clipPath>' +
    '<clipPath id="' + id("x-cub") + '"><rect x="' + CUB[0] + '" y="' + y0 + '" width="' + (CUB[1] - CUB[0]) + '" height="' + (CUB_SHELF - y0) + '"/></clipPath>' +
    '<clipPath id="' + id("x-cubi") + '"><rect x="' + CUB_IN[0] + '" y="' + y0 + '" width="' + (CUB_IN[1] - CUB_IN[0]) + '" height="' + (CUB_SHELF - y0) + '"/></clipPath>' +
    '<rect x="' + (CUB[1] - 2) + '" y="' + y0 + '" width="210" height="' + (7 - y0) + '" style="fill:var(--wall)"/>' +
    '<g clip-path="url(#' + id("x-cab") + ')">' + use + ' transform="matrix(1 0 0 ' + K.toFixed(4) + " 0 " + T.toFixed(2) + ')"/></g>' +
    '<g clip-path="url(#' + id("x-cub") + ')">' + use + ' transform="translate(0 ' + (-CUB_PITCH) + ')"/></g>' +
    '<g clip-path="url(#' + id("x-cubi") + ')">' + use + ' transform="translate(' + (2 * cx) + " " + (-CUB_PITCH) + ') scale(-1 1)"/></g>';
}
(async () => {
  const src = fs.readFileSync(path.join(D, "source.svg"), "utf8");
  const b = await chromium.launch(), p = await b.newPage();
  await p.setContent(src);
  const ps = await p.evaluate(() => Array.from(document.querySelectorAll("path")).map((e) => { const bb = e.getBBox(); return { d: e.getAttribute("d"), fill: e.getAttribute("fill"), op: e.getAttribute("fill-opacity"), rule: e.getAttribute("fill-rule"), x: bb.x, y: bb.y, w: bb.width, h: bb.height }; }));
  await b.close();
  const rep = { total: ps.length, dropped: 0, byObj: {}, ink: [] };
  /* pass 1: which object each shape belongs to, and which go */
  const items = [];
  ps.forEach((q, i) => {
    if (i === 0) { items.push({ obj: "wall", q, wall: true }); return; }
    if (hsl(q.fill)[2] < .16 && q.w > 300) { items.push({ obj: "ink", q, ink: true }); rep.ink.push([i, q.fill, Math.round(q.w), Math.round(q.h)]); return; }
    const cx = q.x + q.w / 2, cy = q.y + q.h / 2, L = hsl(q.fill)[2];
    const o = OBJ.find((a) => q.x >= a[1] - 2 && q.y >= a[2] - 2 && q.x + q.w <= a[3] + 2 && q.y + q.h <= a[4] + 2);
    let obj = o ? o[0] : "room";
    const mv = MOVE_TO.find((m) => m[0] === obj && m[1](q, cx, cy)); if (mv) obj = mv[2];
    if (SCRIB.some((s) => s[6].split(" ").includes(obj) && L < s[5] && cx > s[0] && cx < s[2] && cy > s[1] && cy < s[3] && q.w < s[4] && q.h < s[4])) { rep.dropped++; return; }
    rep.byObj[obj] = (rep.byObj[obj] || 0) + 1;
    items.push({ obj, q });
  });
  const objs = OBJ.map((o) => o[0]);
  const ATTRS = (q) => (q.op ? ' fill-opacity="' + q.op + '"' : "") + (q.rule ? ' fill-rule="' + q.rule + '"' : "");
  function fillOf(it) { const q = it.q, T = ADD.TRIM[q.fill.toUpperCase()];
    if (it.obj === "window" && T) return "var(--trim-" + q.fill.slice(1).toUpperCase() + "," + q.fill + ")";   /* window frame: any colour on .trim-on */
    if (!isBlue(q.fill)) return q.fill; return it.obj === "box" ? shade("var(--blue)", q.fill) : (it.obj === "ideas" ? q.fill : shade("var(--cab)", q.fill)); }

  function build(v, opts) {
    const id = (s) => v + "-" + s;   /* ids differ per version: both sit on one page */
    /* masks: each object's own shapes, grown; the room's mask is everything else */
    let defs = "<defs>";
    objs.forEach((o) => { defs += '<g id="' + id("mk-" + o) + '">' + items.filter((it) => it.obj === o && it.q.w * it.q.h > 25).map((it) => '<path d="' + r0(it.q.d) + '"/>').join("") + "</g>"; });
    const GROW = ' stroke-width="' + INK_GROW + '" stroke-linejoin="round"';
    const GROW_ROOM = ' stroke-width="' + (INK_GROW - 3) + '" stroke-linejoin="round"';   /* smaller, so the pieces overlap and leave no seam */
    const MASK = 'maskUnits="userSpaceOnUse" x="-600" y="-50" width="2100" height="600"';
    objs.forEach((o) => { defs += '<mask id="' + id("ink-" + o) + '" ' + MASK + '><use href="#' + id("mk-" + o) + '" fill="#fff" stroke="#fff"' + GROW + '/></mask>'; });
    defs += '<mask id="' + id("ink-room") + '" ' + MASK + '><rect x="-600" y="-50" width="2100" height="600" fill="#fff"/>' + objs.map((o) => '<use href="#' + id("mk-" + o) + '" fill="#000" stroke="#000"' + GROW_ROOM + '/>').join("") + "</mask>";
    defs += (opts.defs || "") + "</defs><style>.trim-on{" + Object.keys(ADD.TRIM).map((h) => "--trim-" + h.slice(1) + ":color-mix(in srgb,var(--trim) " + ADD.TRIM[h][0] + "%," + ADD.TRIM[h][1] + ")").join(";") + "}</style>";
    /* the flat list of [obj, element] in paint order */
    const out = [];
    items.forEach((it) => {
      const q = it.q;
      if (it.wall) { out.push(["wall", '<path d="' + r1(q.d) + '" style="fill:var(--wall)"/>']); return; }
      if (it.ink) {
        const d = r1(q.d);
        objs.concat("room").forEach((o) => out.push([o === "room" ? "room" : o, '<path d="' + d + '" fill="' + q.fill + '" mask="url(#' + id("ink-" + o) + ')"/>']));
        return;
      }
      out.push([it.obj, '<path d="' + r1(q.d) + '" style="fill:' + fillOf(it) + '"' + ATTRS(q) + "/>"]);
    });
    const runs = (list) => { let s = "", cur = null; list.forEach((e) => { if (e[0] !== cur) { if (cur) s += "</g>"; s += '<g data-obj="' + e[0] + '">'; cur = e[0]; } s += e[1]; }); return s + (cur ? "</g>" : ""); };
    const grp = (list) => list.map((a) => '<g data-obj="' + a.obj + '">' + a.svg + "</g>").join("");
    let svg = '<g id="' + id("all") + '"><g id="' + id("scene") + '">' + runs(out) + grp((opts.end || []).filter((a) => !a.top)) + "</g>";
    if (opts.top !== false) svg += extend(id);
    svg += grp((opts.end || []).filter((a) => a.top)) + "</g>";   /* "all" is reused by the close-ups on the page */
    const vb = opts.top === false ? "6 5 856 479" : "6 " + (5 - TOP) + " 856 479";
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" class="tk-art" aria-hidden="true">' + defs + svg + "</svg>";
  }
  const plain = process.argv.includes("--plain");   /* --plain: split only, nothing added (for the before/after check) */
  const A = build("a", plain ? { top: false } : ADD.opts("a"));
  fs.writeFileSync(path.join(D, "kitchen.svg"), A);
  if (!plain) {   /* close-ups for the page: each option drawn over a <use> of the kitchen scene */
    const C = ADD.closeups("a").map((c) => '<figure class="' + (c.cls || "") + '"><svg viewBox="' + c.vb + '" role="img" aria-label="' + c.title + '"><use href="#a-scene"/>' + c.svg + "</svg><figcaption>" + c.title + "</figcaption></figure>");
    fs.writeFileSync(path.join(D, "closeups.html"), C.join("\n"));
  }
  fs.writeFileSync(path.join(D, "report.json"), JSON.stringify(rep, null, 1));
  console.log(JSON.stringify(rep), Math.round(A.length / 1024) + " KB");
})();
