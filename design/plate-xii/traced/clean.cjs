/* Turns Ari's traced Kittl SVG (source.svg, 868 x 489, 1365 unnamed paths) into a kitchen the app can use:
   - sorts every shape into an object by where it sits (OBJ boxes below), keeping the paint order
   - gives the recipe box its own blue (Blue 3 shades), cabinets follow --cab, the wall follows --wall
   - deletes the traced scribbles where the app will write (whiteboard, notes, notebook pages, box tabs, book spines)
   - crops off the traced dark frame, rounds coordinates
   node traced/clean.cjs  -> traced/kitchen.svg  (+ traced/report.json) */
const { chromium } = require("/Users/ari/codes/trial-and-eclair/frontend/node_modules/playwright");
const fs = require("fs"), path = require("path"), D = __dirname;
/* object boxes [x0, y0, x1, y1] in the source's units; first match wins, so smaller things come first */
const OBJ = [
  ["box", 30, 205, 190, 365], ["notebook", 255, 308, 458, 376], ["mixer", 524, 195, 682, 356], ["flour", 678, 252, 750, 345], ["pin", 680, 318, 842, 368],
  ["whiteboard", 452, 130, 592, 300], ["ideas", 188, 130, 446, 304], ["cookbooks", 410, 0, 560, 120], ["references", 560, 0, 664, 120],
  ["window", 696, 10, 868, 268], ["log", 594, 388, 770, 489], ["knee", 278, 388, 594, 489],
];
/* where traced scribbles get deleted: [x0, y0, x1, y1, maxSize] ; a shape darker than lightLimit (default .72) and smaller than maxSize both ways goes; [x0, y0, x1, y1, maxSize, lightLimit, objects it applies to] */
const SCRIB = [
  [462, 140, 584, 292, 60, .95, "whiteboard"],   /* whiteboard writing */
  [205, 145, 335, 285, 26, .72, "ideas"],   /* notes on the cork board */
  [262, 316, 328, 370, 30, .93, "notebook"], [350, 314, 452, 366, 30, .93, "notebook"],
  [520, 180, 586, 262, 8, .72, "mixer"],  /* whiteboard writing that pokes out beside the mixer head */ /* notebook pages, not the spiral */
  [62, 262, 178, 300, 9, .72, "box"],     /* letters on the box tabs */
  [418, 18, 660, 108, 9, .72, "cookbooks references"],     /* titles on the book spines */
];
function hsl(h) { const r = parseInt(h.slice(1, 3), 16) / 255, g = parseInt(h.slice(3, 5), 16) / 255, b = parseInt(h.slice(5, 7), 16) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  let hu = 0, s = 0; if (d) { s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); hu = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hu /= 6; } return [hu, s, l]; }
const isBlue = (h) => { const [hu, s, l] = hsl(h); return hu > .48 && hu < .62 && s > .12 && l > .12 && l < .82; };
const MAIN = hsl("#6D8C97")[2];
function shade(v, h) { const l = hsl(h)[2]; return l >= MAIN ? "color-mix(in srgb," + v + " " + Math.round(100 - (l - MAIN) / (1 - MAIN) * 100) + "%,#fff)" : "color-mix(in srgb," + v + " " + Math.round(100 - (MAIN - l) / MAIN * 100) + "%,#1f1d1a)"; }
const r1 = (d) => d.replace(/-?\d*\.\d+/g, (n) => (+(+n).toFixed(1)).toString());
(async () => {
  const src = fs.readFileSync(path.join(D, "source.svg"), "utf8");
  const b = await chromium.launch(), p = await b.newPage();
  await p.setContent(src);
  const ps = await p.evaluate(() => Array.from(document.querySelectorAll("path")).map((e) => { const bb = e.getBBox(); return { d: e.getAttribute("d"), fill: e.getAttribute("fill"), op: e.getAttribute("fill-opacity"), rule: e.getAttribute("fill-rule"), x: bb.x, y: bb.y, w: bb.width, h: bb.height }; }));
  await b.close();
  const out = [], rep = { total: ps.length, dropped: 0, byObj: {} };
  ps.forEach((q, i) => {
    if (i === 0) { out.push({ obj: "wall", el: '<path d="' + r1(q.d) + '" style="fill:var(--wall)"/>' }); return; }
    const cx = q.x + q.w / 2, cy = q.y + q.h / 2, dark = hsl(q.fill)[2] < 0.3;
    /* writing is ink or pencil grey on light paper: anything not near-white, small, inside a writing area */
    const L = hsl(q.fill)[2], o = OBJ.find((a) => q.x >= a[1] - 2 && q.y >= a[2] - 2 && q.x + q.w <= a[3] + 2 && q.y + q.h <= a[4] + 2), obj = o ? o[0] : "room";
    if (SCRIB.some((s) => s[6].split(" ").includes(obj) && L < s[5] && cx > s[0] && cx < s[2] && cy > s[1] && cy < s[3] && q.w < s[4] && q.h < s[4])) { rep.dropped++; return; }
    if (q.w > 400 && q.h > 200) rep.big = (rep.big || []).concat([[i, q.fill, Math.round(q.w), Math.round(q.h)]]);
    let fill = q.fill;
    if (isBlue(q.fill)) fill = obj === "box" ? shade("var(--blue)", q.fill) : (obj === "ideas" ? q.fill : shade("var(--cab)", q.fill));
    rep.byObj[obj] = (rep.byObj[obj] || 0) + 1;
    out.push({ obj, el: '<path d="' + r1(q.d) + '" style="fill:' + fill + '"' + (q.op ? ' fill-opacity="' + q.op + '"' : "") + (q.rule ? ' fill-rule="' + q.rule + '"' : "") + "/>" });
  });
  /* keep paint order; wrap runs of one object in a group so a button can light all of its runs */
  let svg = "", cur = null;
  out.forEach((o) => { if (o.obj !== cur) { if (cur) svg += "</g>"; svg += '<g data-obj="' + o.obj + '">'; cur = o.obj; } svg += o.el; });
  svg += "</g>";
  const file = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="6 5 856 479" class="tk-art" aria-hidden="true">' + svg + "</svg>";
  fs.writeFileSync(path.join(D, "kitchen.svg"), file);
  fs.writeFileSync(path.join(D, "report.json"), JSON.stringify(rep, null, 1));
  console.log(JSON.stringify(rep), Math.round(file.length / 1024) + " KB");
})();
