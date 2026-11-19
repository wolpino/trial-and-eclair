/* Plate XII: two straight-on kitchens drawn from Ari's Kittl studies (desktop 1 and desktop 2).
   Straight-on (elevation) view: the back wall is flat, the island runs across the front, only the island top
   shows a little depth. Scene is 1800 x 860. Normal view crops x 200..1600; extra wide shows all 1800.
   Every recolourable surface uses a named colour: --cab (cabinets), --fridge, --wall, --splash (backsplash). */
var uidN = 0, o = { plan: "dev" };
var XII = (function () {
  var W = 1800, H = 860, BUTTER = "#f2c94c", STEEL = "#d9dcdf", MARKER = "#1f7a8c";
  var SPINES = ["var(--orange)", "var(--yellow)", "var(--stem)", "#7f9cc4", "var(--cinnamon)", "var(--custard)", "#c9563c", "#e9d8b4", "#9bb48a"];
  function R(x, y, w, h, f, sw, rx) { return reg("rect", 'x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"' + (rx ? ' rx="' + rx + '"' : ""), f, sw || 2.2); }
  function C(x, y, r, f, sw) { return reg("circle", 'cx="' + x + '" cy="' + y + '" r="' + r + '"', f, sw || 2); }
  function E(x, y, rx, ry, f, sw) { return reg("ellipse", 'cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '"', f, sw || 2); }
  function P2(d, f, sw) { return '<path d="' + d + '" style="fill:' + f + ";stroke:var(--ink);stroke-width:" + (sw || 2) + ';stroke-linejoin:round;stroke-linecap:round"/>'; }
  function defs() {
    return "<defs>" +
      '<pattern id="xtile" width="44" height="30" patternUnits="userSpaceOnUse"><rect width="44" height="30" style="fill:var(--splash)"/><path d="M0 .7 H44 M.7 0 V30" style="stroke:color-mix(in srgb,var(--splash) 78%,#7a6a50);stroke-width:1.4"/></pattern>' +
      '<pattern id="xsun" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="5" cy="5" r="2.6" style="fill:#f3c552"/></pattern>' +
      '<pattern id="xcheck" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" style="fill:#f4eedf"/><rect width="40" height="40" style="fill:#3b3a36"/><rect x="40" y="40" width="40" height="40" style="fill:#3b3a36"/></pattern>' +
      '<pattern id="xplank" width="220" height="30" patternUnits="userSpaceOnUse"><rect width="220" height="30" style="fill:var(--wood-hi)"/><path d="M0 .7 H220 M140 0 V30" style="stroke:var(--wood-dark);stroke-width:1.4"/></pattern>' +
      "</defs>";
  }
  function svg(vb, inner, label, id) {
    return '<svg viewBox="' + vb + '" role="img" aria-label="' + label + '"' + (id ? ' id="' + id + '"' : "") + ">" + defs() + inner + "</svg>";
  }

  /* ---------- small things ---------- */
  function books(x, y, w, h, seed) { /* y = the shelf the books stand on */
    var r = rand(seed), s = "", cx = x;
    while (cx < x + w - 12) {
      var bw = 13 + Math.floor(r() * 13), bh = h * (0.7 + r() * 0.3), col = SPINES[Math.floor(r() * SPINES.length)];
      if (cx + bw > x + w) break;
      s += R(cx, (y - bh).toFixed(1), bw, bh.toFixed(1), col, 1.8) + line("M" + (cx + 3) + " " + (y - bh + 10).toFixed(1) + " H" + (cx + bw - 3), 1.3, 0.6) + line("M" + (cx + 3) + " " + (y - 12) + " H" + (cx + bw - 3), 1.3, 0.6);
      cx += bw;
    }
    return s;
  }
  function cubbies(x, y, w, h, seed) {
    var s = R(x, y, w, h, "var(--wood)", 2.6), pad = 14, cw = (w - pad * 3) / 2, ch = (h - pad * 3) / 2;
    for (var i = 0; i < 2; i++) for (var j = 0; j < 2; j++) {
      var bx = x + pad + j * (cw + pad), by = y + pad + i * (ch + pad);
      s += R(bx, by, cw, ch, "var(--wood-dark)", 2) + books(bx + 6, by + ch, cw - 12, ch - 16, seed + i * 7 + j * 3) + hatch(bx, by, cw, 12, 0.45);
    }
    return s + grain(x, y, w, pad, seed);
  }
  function drawers(x, y, w, h) {
    var s = R(x, y, w, h, "var(--cab)", 2.6), pad = 16, dw = (w - pad * 3) / 2, dh = (h - pad * 3) / 2;
    for (var i = 0; i < 2; i++) for (var j = 0; j < 2; j++) {
      var dx = x + pad + j * (dw + pad), dy = y + pad + i * (dh + pad);
      s += R(dx, dy, dw, dh, "var(--cab)", 2.2) + R(dx + 9, dy + 9, dw - 18, dh - 18, "none", 1.3) + brassLabel(dx + dw / 2, dy + dh / 2, 118, 36, "recipe log", 18);
    }
    return s;
  }
  function cabinet(x, y, w, h, doors) { /* upper or lower cabinet run, plain painted doors with knobs */
    var s = R(x, y, w, h, "var(--cab)", 2.6), dw = w / doors;
    for (var i = 0; i < doors; i++) {
      var dx = x + i * dw;
      s += R(dx + 8, y + 8, dw - 16, h - 16, "var(--cab)", 2) + R(dx + 18, y + 18, dw - 36, h - 36, "none", 1.2) + C(i % 2 ? dx + 22 : dx + dw - 22, y + (y < 300 ? h - 30 : 30), 5, "var(--brass)", 1.6);
    }
    return s + hatch(x, y + h - 10, w, 10, 0.35);
  }
  function note(x, y, w, h, rot, fill, lines) {
    var s = '<g transform="rotate(' + rot + " " + (x + w / 2) + " " + (y + h / 2) + ')">' + R(x, y, w, h, fill, 1.6);
    for (var i = 0; i < (lines || 3); i++) s += line("M" + (x + 8) + " " + (y + 16 + i * 11) + " H" + (x + w - 8 - (i % 2) * 14), 1.2, 0.35);
    return s + "</g>";
  }
  function tack(x, y, col) { return C(x, y, 5, col, 1.6); }
  function polaroid(x, y, rot, food) {
    return '<g transform="rotate(' + rot + " " + (x + 34) + " " + (y + 40) + ')">' + R(x, y, 68, 80, "var(--card)", 1.8) + R(x + 7, y + 7, 54, 50, "#bcd3d6", 1.4) +
      E(x + 34, y + 36, 19, 11, "#fff", 1.4) + E(x + 34, y + 33, 12, 7, food, 1.4) + "</g>" + tack(x + 34, y + 4, "var(--orange)");
  }
  function cork(x, y, w, h) {
    return R(x, y, w, h, "var(--wood)", 2.6) + R(x + 12, y + 12, w - 24, h - 24, "url(#corkp)", 2) +
      polaroid(x + 30, y + 30, -4, "#c98a44") + note(x + 112, y + 26, 70, 84, 3, "var(--custard)") + polaroid(x + 196, y + 34, 5, "#8a5a3a") +
      note(x + 34, y + 124, 78, 60, -3, "var(--card)") + tack(x + 73, y + 128, "var(--stem)") + polaroid(x + 128, y + 116, -2, "#e3b25a") + note(x + 214, y + 128, 60, 56, 4, "#f6d7a8") + tack(x + 244, y + 132, "var(--yellow)") + tack(x + 147, y + 30, "var(--stem)");
  }
  function whiteboard(x, y, w, h) {
    return R(x, y, w, h, "#bfc2bd", 2.6, 4) + R(x + 9, y + 9, w - 18, h - 18, "var(--wb)", 1.6) +
      line("M" + (x + 24) + " " + (y + 40) + " h" + (w * 0.42), 2, 0.3) + line("M" + (x + 24) + " " + (y + 66) + " h" + (w * 0.55), 2, 0.3) + line("M" + (x + 24) + " " + (y + 92) + " h" + (w * 0.36), 2, 0.3) +
      R(x + 30, y + h - 4, w - 60, 10, "#bfc2bd", 1.8) + R(x + w - 90, y + h - 12, 46, 9, MARKER, 1.6, 3);
  }
  function fridge(x, y, w, h) {
    var s = R(x, y, w, h, "var(--fridge)", 2.8, 22) + line("M" + x + " " + (y + h * 0.36) + " H" + (x + w), 2.4) +
      R(x + w - 30, y + 60, 12, 110, "#d8d2c2", 1.8, 5) + R(x + w - 30, y + h * 0.36 + 40, 12, 150, "#d8d2c2", 1.8, 5) + hatch(x + w - 14, y + 20, 10, h - 40, 0.3);
    s += note(x + 30, y + 60, 64, 76, -3, "var(--card)") + magnet(x + 62, y + 60, "var(--orange)") + note(x + 110, y + 90, 56, 48, 4, "var(--custard)") + magnet(x + 138, y + 92, "var(--stem)") +
      note(x + 40, y + h * 0.36 + 50, 70, 90, 2, "var(--card)", 5) + magnet(x + 75, y + h * 0.36 + 52, "var(--yellow)") + magnet(x + 140, y + h * 0.36 + 80, "var(--blue)") + magnet(x + 160, y + h * 0.36 + 118, "var(--orange)");
    return s;
  }
  function magnet(x, y, col) { return C(x, y, 8, col, 1.8) + '<circle cx="' + (x - 2.5) + '" cy="' + (y - 2.5) + '" r="2.2" style="fill:#fff;opacity:.7"/>'; }
  function windowSash(x, y, w, h, sill) {
    var s = R(x - 14, y - 14, w + 28, h + 28, "var(--card)", 2.6) + R(x, y, w, h, "#fff4cf", 2.2);
    for (var i = 1; i < 3; i++) s += line("M" + (x + w * i / 3) + " " + y + " V" + (y + h), 3);
    s += R(x - 4, y + h / 2 - 7, w + 8, 14, "var(--card)", 2.2);
    for (var j = 1; j < 4; j++) if (j !== 2) s += line("M" + x + " " + (y + h * j / 4) + " H" + (x + w), 3);
    s += hatch(x, y, w, 10, 0.25);
    if (sill) s += R(x - 26, y + h + 14, w + 52, 16, "var(--card)", 2.4) + hatch(x - 26, y + h + 30, w + 52, 6, 0.4);
    return s;
  }
  function spoonJar(x, y) { /* y = surface */
    return line("M" + (x - 6) + " " + (y - 40) + " L" + (x - 14) + " " + (y - 92), 4, 1, "var(--wood-dark)") + E(x - 15, y - 98, 8, 12, "var(--wood-hi)", 1.8) +
      line("M" + (x + 6) + " " + (y - 40) + " L" + (x + 12) + " " + (y - 96), 4, 1, "var(--wood-dark)") + E(x + 13, y - 102, 7, 10, "var(--wood-hi)", 1.8) +
      line("M" + x + " " + (y - 40) + " V" + (y - 100), 2) + E(x, y - 106, 9, 13, "none", 1.8) + R(x - 22, y - 48, 44, 48, "#c9563c", 2.2, 6);
  }
  function bowl(cx, y, w, col) { return P2("M" + (cx - w / 2) + " " + (y - w * 0.42) + " H" + (cx + w / 2) + " Q" + (cx + w / 2 - 6) + " " + y + " " + cx + " " + y + " Q" + (cx - w / 2 + 6) + " " + y + " " + (cx - w / 2) + " " + (y - w * 0.42) + " Z", col, 2.2) + E(cx, y - w * 0.42, w / 2, 6, "color-mix(in srgb," + col + " 70%,#fff)", 1.8); }
  function canister(x, y, w, h, col) { return R(x, y - h, w, h, col, 2.2, 6) + R(x - 3, y - h - 10, w + 6, 12, "#d8d2c2", 2, 4) + C(x + w / 2, y - h - 14, 4, "#d8d2c2", 1.6) + R(x + 10, y - h * 0.62, w - 20, h * 0.3, "var(--card)", 1.4, 2); }
  function mixer(x, y, k) { /* Buttercup. x = left, y = counter top, k = scale */
    function q(v) { return (v * k).toFixed(1); }
    return '<g transform="translate(' + x + " " + y + ")\">" +
      R(0, -q(20), q(170), q(20), BUTTER, 2.2, 8) + R(q(118), -q(160), q(44), q(145), BUTTER, 2.2, 10) +
      P2("M" + q(22) + " -" + q(112) + " H" + q(132) + " Q" + q(130) + " -" + q(28) + " " + q(77) + " -" + q(24) + " Q" + q(24) + " -" + q(28) + " " + q(22) + " -" + q(112) + " Z", STEEL, 2.2) +
      line("M" + q(40) + " -" + q(100) + " Q" + q(46) + " -" + q(50) + " " + q(60) + " -" + q(44), 2, 0.5, "#fff") +
      R(q(6), -q(190), q(170), q(52), BUTTER, 2.4, q(25)) + C(q(150), -q(164), q(7), "#ece6d4", 1.6) + line("M" + q(77) + " -" + q(138) + " V-" + q(112), 4) +
      hatch(q(118), -q(150), q(12), q(130), 0.35) + "</g>";
  }
  function flour(x, y) { return P2("M" + x + " " + y + " V" + (y - 70) + " L" + (x + 8) + " " + (y - 84) + " H" + (x + 56) + " L" + (x + 64) + " " + (y - 70) + " V" + y + " Z", "#f7f2e6", 2.2) + R(x + 12, y - 52, 40, 22, "var(--custard)", 1.4) + E(x - 8, y - 2, 18, 4, "#fff", 1); }
  function openBox(x, y, w, h) { /* front face top-left at (x, y); the lid stands open behind */
    var s = P2("M" + (x + 6) + " " + y + " L" + (x + 20) + " " + (y - h * 0.95) + " H" + (x + w - 20) + " L" + (x + w - 6) + " " + y + " Z", "var(--blue-back)", 2.4) +
      P2("M" + (x + 18) + " " + (y - 6) + " L" + (x + 28) + " " + (y - h * 0.86) + " H" + (x + w - 28) + " L" + (x + w - 18) + " " + (y - 6) + " Z", "color-mix(in srgb,var(--blue) 82%,#fff)", 1.4);
    var tabs = ["var(--custard)", "var(--orange)", "var(--card)", "var(--yellow)", "var(--stem)"];
    for (var i = 0; i < 5; i++) { var cy = y - 34 + i * 6, tx = x + 22 + ((i * 47) % (w - 90)); s += R(tx, cy - 12, 38, 16, tabs[i], 1.4, 2) + R(x + 14 + i, cy, w - 28 - i * 2, 40, "var(--card)", 1.4); }
    s += R(x, y, w, h, "var(--blue)", 2.8, 3) + R(x + 10, y + 10, w - 20, h - 20, "none", 1.2) + R(x + w / 2 - 16, y + 8, 32, 16, "var(--brass)", 1.8, 2) + hatch(x, y + h - 10, w, 10, 0.35);
    return s;
  }
  function spiralNb(cx, y) { /* lying open on the island top; y = middle of the pages */
    var s = P2("M" + (cx - 168) + " " + (y + 34) + " L" + (cx - 146) + " " + (y - 30) + " H" + (cx + 146) + " L" + (cx + 168) + " " + (y + 34) + " Z", "var(--cinnamon)", 2.2) +
      P2("M" + (cx - 160) + " " + (y + 28) + " L" + (cx - 140) + " " + (y - 26) + " H" + (cx - 6) + " V" + (y + 28) + " Z", "var(--page)", 1.8) +
      P2("M" + (cx + 6) + " " + (y + 28) + " V" + (y - 26) + " H" + (cx + 140) + " L" + (cx + 160) + " " + (y + 28) + " Z", "var(--page)", 1.8);
    for (var i = 0; i < 4; i++) { var ly = y - 14 + i * 11, f = (ly - (y - 26)) / 54; s += line("M" + (cx - 140 - 20 * f + 10) + " " + ly + " H" + (cx - 16), 1.1, 0.35) + line("M" + (cx + 16) + " " + ly + " H" + (cx + 140 + 20 * f - 10), 1.1, 0.35); }
    for (var j = 0; j < 6; j++) s += E(cx, y - 22 + j * 9.5, 7, 3.4, "none", 1.6);
    s += line("M" + (cx + 40) + " " + (y + 14) + " L" + (cx + 132) + " " + (y - 6), 6, 1, BUTTER) + line("M" + (cx + 132) + " " + (y - 6) + " L" + (cx + 142) + " " + (y - 8), 2.4);
    return s;
  }
  function compNb(x, y, w, h) { /* composition notebook standing up, blank label */
    return R(x + 6, y + 6, w, h, "url(#hatch)", 0) + R(x, y, w, h, "url(#mblack)", 2.6, 3) + R(x, y, 20, h, "url(#cloth)", 2, 2) +
      R(x + 34, y + 44, w - 54, 54, "var(--card)", 2, 4) + line("M" + (x + 44) + " " + (y + 66) + " H" + (x + w - 30), 1.2, 0.35) + line("M" + (x + 44) + " " + (y + 82) + " H" + (x + w - 30), 1.2, 0.35);
  }
  function rollingPin(x, y) { return '<g transform="rotate(-8 ' + (x + 80) + " " + y + ')">' + R(x, y - 9, 160, 18, "var(--wood-hi)", 2, 9) + R(x - 26, y - 4, 28, 8, "var(--wood)", 1.8, 4) + R(x + 158, y - 4, 28, 8, "var(--wood)", 1.8, 4) + "</g>"; }
  function plateEclair(cx, y) { return E(cx, y, 92, 16, "var(--card)", 2.2) + E(cx, y - 2, 70, 10, "none", 1.2) + MK2.at("G", {}, cx - 82, y - 52, 44).s; }
  function tap(x, y) { return P2("M" + (x - 4) + " " + y + " V" + (y - 46) + " Q" + (x - 4) + " " + (y - 62) + " " + (x + 14) + " " + (y - 62) + " Q" + (x + 32) + " " + (y - 62) + " " + (x + 32) + " " + (y - 44) + " V" + (y - 36), "none", 4) + R(x - 14, y - 6, 22, 6, "#bfc2bd", 1.6); }
  function shelfPlank(x, y, w) { return R(x, y, w, 14, "var(--wood)", 2.2) + hatch(x, y + 14, w, 8, 0.35) + P2("M" + (x + 30) + " " + (y + 14) + " v34 q0 -24 24 -34 z", "var(--wood)", 1.8) + P2("M" + (x + w - 30) + " " + (y + 14) + " v34 q0 -24 -24 -34 z", "var(--wood)", 1.8); }
  function utensils(x, y) {
    var s = R(x, y, 170, 8, "#bfc2bd", 1.8, 4);
    [[20, "ladle"], [60, "whisk"], [100, "spatula"], [140, "spoon"]].forEach(function (u) {
      var ux = x + u[0];
      s += line("M" + ux + " " + (y + 8) + " V" + (y + 70), 3);
      if (u[1] === "ladle") s += P2("M" + (ux - 12) + " " + (y + 70) + " Q" + ux + " " + (y + 96) + " " + (ux + 12) + " " + (y + 70) + " Z", "#bfc2bd", 1.8);
      if (u[1] === "whisk") s += P2("M" + ux + " " + (y + 66) + " q-14 20 0 34 q14 -14 0 -34 M" + ux + " " + (y + 66) + " q-6 20 0 34 q6 -14 0 -34", "none", 1.6);
      if (u[1] === "spatula") s += R(ux - 9, y + 68, 18, 26, "var(--orange)", 1.8, 3);
      if (u[1] === "spoon") s += E(ux, y + 78, 8, 12, "var(--wood-hi)", 1.8);
    });
    return s;
  }
  function sunbeam(pts) { return '<polygon points="' + pts + '" style="fill:url(#xsun);opacity:.6"/>'; }
  function HO(name, ring, inner) { return hot(name, inner, ring); }

  /* ---------- Option A: desktop 1's kitchen, seen straight on ---------- */
  function sceneA() {
    var s = R(0, 0, W, H, "var(--wall)", 0) + R(300, 190, W - 300, 262, "url(#xtile)", 0) + R(0, 800, W, 60, "url(#xplank)", 2);
    s += fridge(40, 50, 250, 752);
    s += cabinet(310, -10, 400, 190, 3) + cabinet(1560, -10, 260, 330, 2);
    s += sunbeam("1250,60 1530,60 1250,560 880,560");
    s += HO("the idea board", [340, 214, 310, 214], cork(340, 214, 310, 214));
    s += HO("the whiteboard", [684, 236, 220, 160], whiteboard(684, 236, 220, 160));
    s += HO("the references", [934, 40, 262, 220], books(948, 110, 236, 76, 31) + shelfPlank(934, 110, 262) + books(948, 226, 236, 76, 47) + shelfPlank(934, 226, 262));
    s += windowSash(1252, 54, 270, 330, true);
    s += spoonJar(1286, 398);
    /* back counter and the cabinets under it (only the right end shows past the island) */
    s += R(300, 440, W - 300, 18, "var(--wood)", 2.4) + cabinet(1560, 458, 260, 342, 2) + R(300, 458, 1260, 342, "var(--cab)", 2.4) + hatch(300, 458, 1500, 10, 0.4);
    s += mixer(924, 440, 0.95) + flour(1104, 440) + bowl(1300, 440, 70, "#f1e3b3") + R(1350, 436, 150, 8, "#6e6b64", 1.6, 3) + tap(1430, 436) + bowl(1650, 440, 60, "#bcd3d6");
    /* island */
    s += P2("M240 470 H1560 L1584 540 H216 Z", "var(--wood-hi)", 2.4) + grain(250, 478, 1300, 56, 5);
    s += R(216, 540, 1368, 36, "var(--wood)", 2.6) + grain(216, 540, 1368, 36, 9);
    s += HO("the cookbooks", [246, 576, 570, 230], cubbies(246, 576, 570, 230, 13));
    s += HO("the recipe log", [816, 576, 738, 230], drawers(816, 576, 738, 230));
    s += hatch(216, 576, 1368, 12, 0.45);
    s += HO("the notebook", [380, 486, 340, 70], spiralNb(550, 508));
    s += rollingPin(790, 520);
    s += HO("the recipe box", [1176, 322, 210, 204], openBox(1186, 420, 190, 100));
    return s;
  }

  /* ---------- Option B: desktop 2, tidied to the plan ---------- */
  function sceneB() {
    var s = R(0, 0, W, H, "var(--wall)", 0) + R(0, 780, W, 80, "url(#xcheck)", 2);
    s += fridge(40, 70, 270, 712) + bowl(110, 68, 90, "#bcd3d6") + bowl(220, 68, 80, "#9bb48a");
    s += sunbeam("1040,40 1270,40 1220,430 860,430");
    s += HO("the whiteboard", [450, 46, 262, 230], whiteboard(450, 46, 262, 230));
    s += HO("the idea board", [732, 46, 250, 230], cork(732, 46, 250, 230));
    s += windowSash(1040, 30, 230, 270, true);
    s += spoonJar(1074, 330);
    s += HO("the references", [1320, 40, 250, 108], books(1334, 120, 222, 76, 61) + shelfPlank(1320, 120, 250));
    s += canister(1334, 228, 50, 64, "#bcd3d6") + canister(1400, 228, 44, 52, "var(--fridge)") + canister(1462, 228, 52, 70, "#c9563c") + shelfPlank(1320, 228, 250);
    s += utensils(1610, 120);
    /* back counter with the green run under it */
    s += R(310, 330, W - 310, 18, "var(--wood)", 2.4) + cabinet(310, 348, W - 310, 432, 8);
    s += bowl(600, 330, 70, "#f1e3b3") + bowl(690, 330, 56, "#9bb48a") + mixer(1180, 330, 0.66) + R(1060, 326, 110, 8, "#6e6b64", 1.6, 3) + tap(1130, 326);
    /* island */
    s += P2("M190 430 H1590 L1610 472 H170 Z", "var(--wood-hi)", 2.4) + grain(200, 436, 1380, 32, 6);
    s += R(170, 472, 1440, 34, "var(--wood)", 2.6) + grain(170, 472, 1440, 34, 8);
    s += HO("the cookbooks", [196, 506, 640, 282], cubbies(196, 506, 640, 282, 21));
    s += HO("the recipe log", [836, 506, 748, 282], drawers(836, 506, 748, 282));
    s += hatch(170, 506, 1440, 12, 0.45) + hatch(160, 788, 1460, 10, 0.35);
    s += HO("the notebook", [340, 256, 150, 196], compNb(340, 256, 150, 196));
    s += plateEclair(830, 452);
    s += HO("the recipe box", [1320, 240, 220, 216], openBox(1330, 350, 200, 104));
    return s;
  }

  return { W: W, H: H, svg: svg, A: sceneA, B: sceneB };
})();
