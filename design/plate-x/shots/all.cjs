const { chromium } = require("/Users/ari/codes/trial-and-eclair/frontend/node_modules/playwright");
const fs = require("fs");
(async () => {
  fs.mkdirSync(__dirname + "/final", { recursive: true });
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
  p.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE ERROR:", m.text()); }); p.on("pageerror", (e) => console.log("PAGE ERROR:", e.message));
  await p.goto("file:///Users/ari/codes/trial-and-eclair/design/plate-ix/dist/index.html"); await p.waitForTimeout(2000);
  await p.addStyleTag({ content: ".choices{position:static!important}" });
  const ids = await p.$$eval("figure[id]", (f) => f.map((x) => x.id)); console.log(ids.join(" "));
  const dup = await p.evaluate(() => { const m = {}; document.querySelectorAll("[id]").forEach((e) => (m[e.id] = (m[e.id] || 0) + 1)); return Object.keys(m).filter((k) => m[k] > 1); }); console.log("dup ids:", dup.length, dup.slice(0, 30).join(" "));
  const secs = await p.$$("main > section");
  for (let i = 0; i < secs.length; i++) await secs[i].screenshot({ path: __dirname + "/final/sec" + String(i + 1).padStart(2, "0") + ".png" });
  await p.locator("#k-main").screenshot({ path: __dirname + "/final/k-main.png" });
  await b.close();
})();
