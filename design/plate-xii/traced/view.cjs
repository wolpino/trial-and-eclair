/* node traced/view.cjs out.png [cab] [wall] : renders traced/kitchen.svg with the colour settings, for checking */
const { chromium } = require("/Users/ari/codes/trial-and-eclair/frontend/node_modules/playwright");
const fs = require("fs"), path = require("path");
(async () => {
  const [out, cab, wall] = process.argv.slice(2);
  const svg = fs.readFileSync(path.join(__dirname, "kitchen.svg"), "utf8");
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1200, height: 671 }, deviceScaleFactor: 1.5 });
  await p.setContent('<style>:root{--blue:#3F5F9D;--cab:' + (cab || "#6D8C97") + ';--wall:' + (wall || "#F6E9CB") + '}body{margin:0}svg{width:1200px;display:block}</style>' + svg);
  await p.screenshot({ path: out }); await b.close();
})();
