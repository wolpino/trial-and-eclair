/* Turns Ari's traced Kittl SVG (source.svg, 868 x 489, 1365 unnamed paths) into a kitchen the app can use:
   - sorts every shape into an object by where it sits (OBJ boxes below), keeping the paint order
   - splits the dark underlay ("ink"): the outlines are not lines but a few huge dark shapes showing through the gaps.
     Each object takes the part of the ink that lies under its own shapes (grown by INK_GROW), through an SVG mask;
     the room keeps the rest. Same picture, but an object can now move or glow with its own outline.
   - gives the recipe box its own blue (Blue 3 shades), cabinets follow --cab, the wall follows --wall
   - deletes the traced scribbles where the app will write (whiteboard, notes, notebook pages, box tabs, book spines)
   - adds the new pieces from add.cjs (eclair, spoon jar, marker, shelf labels, open cupboard)
   - writes two versions: kitchen.svg (as traced) and kitchen-swap.svg (recipe box and mixer swapped)
   node traced/clean.cjs  -> traced/kitchen.svg, traced/kitchen-swap.svg (+ traced/report.json) */
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
/* the swap: recipe box and mixer change places along the counter; both keep their depth (y) */
const SWAP = { mixer: -490, box: 488 };
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
  function fillOf(it) { const q = it.q; if (!isBlue(q.fill)) return q.fill; return it.obj === "box" ? shade("var(--blue)", q.fill) : (it.obj === "ideas" ? q.fill : shade("var(--cab)", q.fill)); }

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
    defs += (opts.defs || "") + "</defs>";
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
      if (opts.before && opts.before[it.obj] && !opts.before[it.obj].done) { opts.before[it.obj].done = 1; out.push([opts.before[it.obj].obj, opts.before[it.obj].svg]); }
      out.push([it.obj, '<path d="' + r1(q.d) + '" style="fill:' + fillOf(it) + '"' + ATTRS(q) + "/>"]);
    });
    /* moved objects come out of the flow and go on top, shifted */
    const move = opts.move || {}, moved = {};
    const flow = out.filter((e) => { if (move[e[0]] === undefined) return true; (moved[e[0]] = moved[e[0]] || []).push(e[1]); return false; });
    const runs = (list) => { let s = "", cur = null; list.forEach((e) => { if (e[0] !== cur) { if (cur) s += "</g>"; s += '<g data-obj="' + e[0] + '">'; cur = e[0]; } s += e[1]; }); return s + (cur ? "</g>" : ""); };
    let svg = runs(flow) + (opts.patch ? '<g data-obj="room">' + opts.patch + "</g>" : "");
    Object.keys(moved).forEach((o) => { svg += '<g transform="translate(' + move[o] + ' 0)">' + runs(moved[o].map((el) => [o, el])) + "</g>"; });
    svg += (opts.end || []).map((a) => '<g data-obj="' + a.obj + '">' + a.svg + "</g>").join("");
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="6 5 856 479" class="tk-art" aria-hidden="true">' + defs + svg + "</svg>";
  }
  const plain = process.argv.includes("--plain");   /* --plain: split only, nothing added (for the before/after check) */
  const A = build("a", plain ? {} : ADD.opts("a"));
  fs.writeFileSync(path.join(D, "kitchen.svg"), A);
  if (!plain) { const B = build("b", Object.assign(ADD.opts("b"), { move: SWAP })); fs.writeFileSync(path.join(D, "kitchen-swap.svg"), B); }
  fs.writeFileSync(path.join(D, "report.json"), JSON.stringify(rep, null, 1));
  console.log(JSON.stringify(rep), Math.round(A.length / 1024) + " KB");
})();
