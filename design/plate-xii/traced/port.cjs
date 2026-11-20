/* node traced/port.cjs [--check dir] : ports pieces of Ari's Kittl vector traces (design/plate-xii/refs/) into the kitchen.
   For each piece: keep her shapes whose box lies inside KEEP (minus DROP colours), sort them into parts by box centre
   (first match wins), and give each part the dark underlay ("ink") under its own shapes, grown by GROW, through a mask,
   the same way clean.cjs splits the kitchen's ink. Writes traced/ports/<piece>.json { vb, parts: { name: svg } } in her units;
   add.cjs scales and places them. --check renders each piece alone to <dir>/<piece>.png. Needs a browser for the boxes. */
const { chromium } = require("/Users/ari/codes/trial-and-eclair/frontend/node_modules/playwright");
const fs = require("fs"), path = require("path");
const REFS = path.join(__dirname, "../refs"), OUT = path.join(__dirname, "ports");
const GROW = 4;
const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return (0.3 * (n >> 16) + 0.59 * ((n >> 8) & 255) + 0.11 * (n & 255)); };
const isInk = (f) => f && f[0] === "#" && lum(f) < 56;

/* window frame, pane and sill colours in her bottle studies: never part of the glass */
const WINDOW = ["#839986", "#8B897D", "#978E71", "#909C8F", "#949792", "#718175", "#8C8973", "#829885", "#8A9389", "#3C403D", "#585F58", "#9B9A7B", "#738272", "#A9A97F", "#D2C7AD", "#D2C9B2", "#F8EAC8", "#FAEAC9", "#F8E8C8"];
const WINDOW2 = ["#839682", "#86A085", "#F8E0B1", "#FBEBCB", "#AD8D5F", "#BDBC94", "#CAB07E", "#E0D89D", "#A6CF8E", "#E0F1A9", "#B0A47B", "#A7A29E", "#A3A99C", "#59543B", "#CCC8B9", "#B5AD7E", "#B8C8AA", "#9A9E7F", "#A3AE83", "#CBD58B", "#868577", "#6E7770", "#91A2A7"];
const PIECES = {
  /* the glass only: her window, mobile, beams and sill are already in the kitchen */
  "bottles-trio": { ref: "bottles-trio.svg", keep: [132, 200, 204, 300.5], drop: WINDOW, parts: { amber: [178.5, 0, 999, 999], glass: null } },
  "bottles-decanter": { ref: "bottles-decanter.svg", keep: [144, 178, 194, 300.5], drop: WINDOW, dropIdx: [68, 158, 206, 207], parts: { glass: null } },
  "bottles-pair": { ref: "bottles-pair.svg", keep: [119, 200, 206, 301], drop: WINDOW, dropIdx: [42], parts: { glass: null } },
  /* her full rack (2026-11-19): three whole eclairs, so no copy. top.dark: cut above the first dark (outline) pixel per column */
  "rack2": { ref: "eclair-rack2.svg", top: { dark: 90, y: [100, 200] }, clip: {
    e1: [[117, 160], [118, 128], [145, 123], [172, 126], [198, 145], [230, 168], [264, 192], [281, 212], [281, 240], [270, 262], [247, 270], [220, 268], [187, 248], [153, 231], [125, 211], [113, 187]],
    e2: [[260, 160], [261, 128], [288, 123], [315, 126], [341, 145], [373, 168], [407, 192], [424, 212], [424, 240], [413, 262], [390, 270], [363, 268], [330, 248], [296, 231], [268, 211], [256, 187]],
    e3: [[394, 160], [395, 128], [422, 123], [449, 126], [475, 145], [507, 168], [541, 192], [558, 212], [558, 240], [547, 262], [524, 270], [497, 268], [464, 248], [430, 231], [402, 211], [390, 187]],
    rack: [[46, 160], [541, 160], [575, 183], [608, 209], [631, 245], [633, 268], [623, 281], [597, 283], [596, 301], [585, 301], [583, 284], [233, 285], [231, 301], [221, 301], [219, 285], [146, 285], [138, 280], [46, 166]],
  }, minus: { rack: ["e1", "e2", "e3"] } },
  /* her window with the decanter, amber and cobalt bottles: the glass in two groups (the mobile hangs between them) */
  "bottles-w2-left": { ref: "bottles-window2.svg", keep: [198, 248, 272, 420], drop: WINDOW2, dropIdx: [208, 227, 228, 229, 456, 709], parts: { glass: null } },
  "bottles-w2-right": { ref: "bottles-window2.svg", keep: [345, 290, 438, 420], drop: WINDOW2, dropIdx: [515, 409, 410], parts: { glass: null } },
  /* clip pieces: the glaze and the marble are the same dark underlay as the outlines, so these are cut out of her whole
     drawing by outline polygons instead (her units). minus: polygons cut out of a part (the rack under the eclairs). */
  /* top: everything above the first non-wall pixel in each column is cut (the wall shows round the eclair tops) */
  "rack": { ref: "eclair-rack.svg", top: { wall: [244, 230, 197], y: [20, 140] }, clip: {
    e1: [[2, 72], [18, 58], [45, 55], [78, 62], [104, 80], [142, 110], [164, 130], [172, 152], [170, 178], [156, 197], [120, 203], [92, 198], [58, 172], [24, 142], [3, 122]],
    e2: [[152, 82], [168, 62], [200, 57], [232, 62], [262, 80], [300, 108], [320, 134], [324, 162], [316, 188], [290, 201], [250, 200], [222, 192], [188, 166], [162, 140], [150, 112]],
    rack: [[0, 60], [400, 60], [400, 225], [126, 225], [122, 241], [116, 225], [43, 226], [0, 169]],
  }, minus: { rack: ["e1", "e2", [[296, 0], [400, 0], [400, 230], [296, 230]]] } },
  /* the desk's colours go: her dark underlay shows where they were, which makes the stack's outline */
  "journals": { ref: "comp-journals.svg", drop: ["#CD9B6B", "#A37656", "#C49364", "#B6885D", "#B79068", "#A06F44", "#8A552D", "#AB7F53", "#A26E3F", "#2E0D06", "#C29063"], clip: {
    stack: [[26, 69], [230, 32], [252, 39], [386, 131], [396, 150], [391, 206], [372, 216], [166, 226], [150, 216], [29, 133], [24, 100]],
  } },
};
const r1 = (html) => html.replace(/ d="([^"]*)"/, (m, d) => ' d="' + d.replace(/-?\d*\.\d+/g, (n) => (+(+n).toFixed(1)).toString()) + '"');
const pts = (q) => q.map((p) => p.join(" ")).join(" ");

(async () => {
  const check = process.argv.indexOf("--check") > 0 ? process.argv[process.argv.indexOf("--check") + 1] : null;
  const only = process.argv.slice(2).filter((a) => !a.startsWith("--") && a !== check);
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(), p = await b.newPage({ deviceScaleFactor: 3 });
  for (const [name, P] of Object.entries(PIECES)) {
    if (only.length && !only.includes(name)) continue;
    await p.setContent(fs.readFileSync(path.join(REFS, P.ref), "utf8"));
    const shapes = await p.evaluate(() => [...document.querySelectorAll("path,rect,ellipse,circle")]
      .map((e, i) => [e, i]).filter(([e]) => e.closest("svg > g") && !e.closest("clipPath,mask,defs"))
      .map(([e, i]) => { const r = e.getBBox(); const c = e.cloneNode(); c.removeAttribute("id"); return { i, x: r.x, y: r.y, w: r.width, h: r.height, fill: e.getAttribute("fill"), html: c.outerHTML }; }));
    if (P.clip) {   /* each part: her shapes that touch the polygon's box, clipped to the polygon (minus any cut-outs) */
      const drop = new Set((P.drop || []).map((c) => c.toUpperCase())), out = { parts: {} };
      let topQ = null; const [, VW, VH] = fs.readFileSync(path.join(REFS, P.ref), "utf8").match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).map(Number);
      if (P.top) {   /* the top contour, from her picture's pixels at 4 px a unit */
        const ys = await p.evaluate(async ([svg, wall, yr, vw, vh]) => {
          const img = new Image(); img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg))); await img.decode();
          const W = vw * 4, H = vh * 4, c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d"); g.drawImage(img, 0, 0, W, H);
          const d = g.getImageData(0, 0, W, H).data, out = [];
          for (let x = 0; x <= vw; x += 2) { const px = Math.min(W - 1, x * 4); let y = yr[0];
            for (; y < yr[1]; y += .25) { const i = (Math.round(y * 4) * W + px) * 4; if (wall.dark ? 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2] < wall.dark : Math.abs(d[i] - wall[0]) + Math.abs(d[i + 1] - wall[1]) + Math.abs(d[i + 2] - wall[2]) > 40) break; }
            out.push([x, +(y + .4).toFixed(1)]); }
          return out; }, [fs.readFileSync(path.join(REFS, P.ref), "utf8"), P.top.wall || { dark: P.top.dark }, P.top.y, VW, VH]);
        topQ = [[0, VH], ...ys, [VW, VH]];
        out.top = ys;
      }
      for (const [k, q] of Object.entries(P.clip)) {
        const xs = q.map((p) => p[0]), ys = q.map((p) => p[1]), bx = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
        const body = shapes.filter((s) => !(s.fill && drop.has(s.fill.toUpperCase())) && s.x < bx[2] && s.x + s.w > bx[0] && s.y < bx[3] && s.y + s.h > bx[1]).map((s) => r1(s.html)).join("");
        const id = "pc-" + name + "-" + k, cut = (P.minus || {})[k];
        out.parts[k] = (cut
          ? '<mask id="' + id + '" maskUnits="userSpaceOnUse" x="' + (bx[0] - 2) + '" y="' + (bx[1] - 2) + '" width="' + (bx[2] - bx[0] + 4) + '" height="' + (bx[3] - bx[1] + 4) + '"><polygon points="' + pts(q) + '" fill="#fff"/>' + cut.map((c) => '<polygon points="' + pts(typeof c === "string" ? P.clip[c] : c) + '" fill="#000"/>').join("") + '</mask><g mask="url(#' + id + ')">'
          : '<clipPath id="' + id + '"><polygon points="' + pts(q) + '"/></clipPath><g clip-path="url(#' + id + ')">') +
          (topQ ? '<clipPath id="' + id + '-t"><polygon points="' + pts(topQ) + '"/></clipPath><g clip-path="url(#' + id + '-t)">' + body + "</g>" : body) + "</g>";
        out.parts[k] = out.parts[k].replace(/ xmlns="[^"]*"/g, "");
      }
      out.clip = P.clip;
      fs.writeFileSync(path.join(OUT, name + ".json"), JSON.stringify(out));
      console.log(name, Object.entries(out.parts).map(([k, v]) => k + " " + Math.round(v.length / 1024) + " KB").join(", "));
      if (check) {
        await p.setContent('<body style="margin:0;background:#9ad"><svg viewBox="0 0 ' + VW + " " + VH + '" width="1200">' + Object.values(out.parts).join("") + "</svg></body>");
        await (await p.$("svg")).screenshot({ path: path.join(check, name + ".png") });
      }
      continue;
    }
    const [x0, y0, x1, y1] = P.keep, inside = (s) => s.x >= x0 && s.y >= y0 && s.x + s.w <= x1 && s.y + s.h <= y1;
    const drop = new Set((P.drop || []).map((c) => c.toUpperCase()));
    const parts = Object.fromEntries(Object.keys(P.parts).map((k) => [k, []]));
    const partOf = (s) => { const cx = s.x + s.w / 2, cy = s.y + s.h / 2; for (const [k, bx] of Object.entries(P.parts)) if (!bx || (cx >= bx[0] && cx <= bx[2] && cy >= bx[1] && cy <= bx[3])) return k; return null; };
    const runs = [];   /* paint order: each shape is either a part's own, or an ink underlay shared out by masks */
    for (const s of shapes) {
      if ((s.fill && drop.has(s.fill.toUpperCase())) || (P.dropIdx || []).includes(s.i)) continue;   /* i = index among all shapes in her file */
      if (inside(s)) { const k = partOf(s); if (k) runs.push({ k, s }); }
      else if (isInk(s.fill) && s.x < x1 && s.x + s.w > x0 && s.y < y1 && s.y + s.h > y0) runs.push({ ink: true, s });
    }
    const out = { vb: P.keep, parts: {} };
    for (const k of Object.keys(parts)) {
      const own = runs.filter((r) => r.k === k).map((r) => r.s.html).join("");
      const mid = "pm-" + name + "-" + k;
      let svg = '<mask id="' + mid + '" maskUnits="userSpaceOnUse" x="' + (x0 - 10) + '" y="' + (y0 - 10) + '" width="' + (x1 - x0 + 20) + '" height="' + (y1 - y0 + 20) + '"><g fill="#fff" stroke="#fff" stroke-width="' + GROW + '" stroke-linejoin="round">' + own.replace(/ fill="[^"]*"/g, "") + "</g></mask>";
      for (const r of runs) {
        if (r.ink) svg += r1(r.s.html).replace(/^<(\w+)/, '<$1 mask="url(#' + mid + ')"');
        else if (r.k === k) svg += r1(r.s.html);
      }
      out.parts[k] = svg.replace(/ xmlns="[^"]*"/g, "");
    }
    fs.writeFileSync(path.join(OUT, name + ".json"), JSON.stringify(out));
    console.log(name, Object.entries(out.parts).map(([k, v]) => k + " " + (v.match(/<path/g) || []).length + " shapes " + Math.round(v.length / 1024) + " KB").join(", "));
    if (check) {
      await p.setContent('<body style="margin:0;background:#E9DCC0"><svg viewBox="' + [x0, y0, x1 - x0, y1 - y0].join(" ") + '" width="' + (x1 - x0) * 3 + '">' + Object.values(out.parts).join("") + "</svg></body>");
      await (await p.$("svg")).screenshot({ path: path.join(check, name + ".png") });
    }
  }
  await b.close();
})();
