/* Joins base + kitchen-xii + sections into one HTML file.
   node build.cjs  -> dist/index.html; then: tail -n +2 dist/index.html | sed '$d' > dist/plate-xii.html and publish that */
const fs = require("fs"), path = require("path"), D = __dirname;
const rd = (f) => fs.readFileSync(path.join(D, f), "utf8");
const secs = fs.readdirSync(path.join(D, "sections")).filter((f) => f.endsWith(".html")).sort();
const html = "<!doctype html><html><head><meta charset=utf8><meta name=viewport content=\"width=device-width,initial-scale=1\"></head><body>\n" +
  "<title>Plate XII</title>\n<meta name=\"claude:viewport-fit-sides\" content=\"cover\">\n" +
  "<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Young+Serif&family=Archivo+Narrow:wght@700&display=swap\">\n" +
  "<style>\n" + rd("base/style.css") + "\n" + rd("base/xii.css") + "\n</style>\n" + rd("base/header.html") +
  "<script>\n" + rd("base/core.js") + "\n" + rd("base/mark.js") + "\n" + rd("kitchen-xii.js") + "\n" + rd("kitchen-xii2.js") + "\n</script>\n" +
  secs.map((f) => "<!-- " + f + " -->\n" + rd("sections/" + f).replace("<!--TRACED-->", rd("traced/kitchen.svg")).replace("<!--CLOSEUPS-->", rd("traced/closeups.html"))).join("\n") + "\n</main>\n<script>PLATE.start();</script>\n</body></html>\n";
fs.writeFileSync(path.join(D, "dist", "index.html"), html);
console.log("dist/index.html (" + secs.join(", ") + ", " + Math.round(html.length / 1024) + " KB)");
