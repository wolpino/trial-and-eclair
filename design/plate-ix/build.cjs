/* Joins base + kitchen + sections into one HTML file.
   node build.cjs                -> dist/index.html (all sections, Plate IX kitchen.js)
   node build.cjs --only 03      -> dist/03.html    (sections whose name starts with 03)
   add --frozen to draw the kitchen behind with the frozen Plate VIII kitchen (agents 2-10 use this) */
const fs = require("fs"), path = require("path"), D = __dirname, a = process.argv.slice(2);
const only = a.includes("--only") ? a[a.indexOf("--only") + 1] : null, frozen = a.includes("--frozen");
const rd = (f) => fs.readFileSync(path.join(D, f), "utf8");
const secs = fs.readdirSync(path.join(D, "sections")).filter((f) => f.endsWith(".html") && (!only || f.startsWith(only))).sort();
const html = "<!doctype html><html><head><meta charset=utf8><meta name=viewport content=\"width=device-width,initial-scale=1\"></head><body>\n" +
  "<title>Kitchen Plate IX</title>\n<meta name=\"claude:viewport-fit-sides\" content=\"cover\">\n" +
  "<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Young+Serif&family=Archivo+Narrow:wght@700&display=swap\">\n" +
  "<style>\n" + rd("base/style.css") + "\n</style>\n" + rd("base/header.html") +
  "<script>\n" + rd("base/core.js") + "\n" + rd(frozen ? "base/kitchen-viii.js" : "kitchen.js") + "\n" + rd("base/frame.js") + "\n</script>\n" +
  secs.map((f) => "<!-- " + f + " -->\n" + rd("sections/" + f)).join("\n") + "\n</main>\n<script>PLATE.start();</script>\n</body></html>\n";
const out = path.join(D, "dist", (only || "index") + ".html"); fs.writeFileSync(out, html);
console.log(out + "  (" + secs.join(", ") + ", " + Math.round(html.length / 1024) + " KB)");
