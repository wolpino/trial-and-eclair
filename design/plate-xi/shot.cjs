/* node shot.cjs dist/03.html shots/03 "#ideas-open" "#ideas-card"   (no selectors = whole page)
   Prints console errors. Screenshots at 2x so crops stay readable. */
const { chromium } = require("/Users/ari/codes/trial-and-eclair/frontend/node_modules/playwright");
const path = require("path"), fs = require("fs");
(async () => {
  const [file, out, ...sels] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 2 });
  p.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE ERROR:", m.text()); }); p.on("pageerror", (e) => console.log("PAGE ERROR:", e.message));
  await p.goto("file://" + path.resolve(file)); await p.waitForTimeout(1500);
  if (!sels.length) { await p.screenshot({ path: path.join(out, "page.png"), fullPage: true }); console.log(path.join(out, "page.png")); }
  for (const s of sels) { const f = path.join(out, s.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") + ".png"); await p.locator(s).first().screenshot({ path: f }); console.log(f); }
  await b.close();
})();
