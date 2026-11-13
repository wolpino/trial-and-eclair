const { chromium } = require("/Users/ari/codes/trial-and-eclair/frontend/node_modules/playwright");
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1000, height: 900 } });
  await p.goto("file:///Users/ari/codes/trial-and-eclair/design/plate-ix/dist/index.html"); await p.waitForTimeout(2000);
  await p.addStyleTag({ content: ".choices{position:static!important}" });
  for (const id of process.argv.slice(2)) await p.locator("#" + id).screenshot({ path: __dirname + "/final/" + id + ".png" });
  await b.close();
})();
