/* node traced/view.cjs out.png [cab] [wall] [svg file] [cupboard: open|ajar|closed] : renders the traced kitchen with the colour settings, for checking */
const { chromium } = require("/Users/ari/codes/trial-and-eclair/frontend/node_modules/playwright");
const fs = require("fs"), path = require("path");
(async () => {
  const [out, cab, wall, file, cup] = process.argv.slice(2);
  const svg = fs.readFileSync(path.join(__dirname, file || "kitchen.svg"), "utf8");
  const hide = "[data-obj=none]";
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1200, height: 671 }, deviceScaleFactor: 1.5 });
  await p.setContent('<style>:root{--blue:#3F5F9D;--cab:' + (cab || "#5e8c3a") + ';--wall:' + (wall || "#F6E9CB") + '}body{margin:0;background:var(--wall)}svg{width:1200px;display:block}' + hide + '{display:none}</style>' + svg);
  await p.screenshot({ path: out }); await b.close();
})();
