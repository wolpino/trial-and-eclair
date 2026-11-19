/* Plate XII v2: one-point kitchens from Ari's Kittl "recipe board" studies (Kittl A: balanced, Kittl B: wide suite).
   Everything is drawn in room units: x across, y down, d = depth behind the counter's front edge.
   S(x, y, d) puts a room point on screen; L(d, ...) draws a flat group standing at depth d (a wall, a door).
   The eye sits at (VX, VY); everything that goes back runs to that one point.
   Scene is 1800 x 900; the normal view crops x 200..1600, extra wide shows all of it.
   Recolourable: --cab (cabinets), --wall, --fridge. Shades of a cabinet are mixed from --cab where they are used,
   so changing --cab on the figure recolours the shades too. */
var XII2 = (function () {
  var VX = 900, VY = 330, Z = 500, YC = 691, DW = 216, YE = 717, YF = 960, W = 1800, H = 900;
  var BUT = "#f2c94c", BUTD = "#c99a2a", STEEL = "#d7dadd", MARK = "#1f7a8c";
  var CABD = "color-mix(in srgb,var(--cab) 62%,#1f1d1a)", CABS = "color-mix(in srgb,var(--cab) 78%,#1f1d1a)", CABL = "color-mix(in srgb,var(--cab) 82%,#fff)";
  var WALLD = "color-mix(in srgb,var(--wall) 82%,#8a7350)", WALLW = "color-mix(in srgb,var(--wall) 90%,#f2c94c)";
  var SP = ["var(--orange)", "#e9b23a", "var(--stem)", "#7f9cc4", "var(--cinnamon)", "#efe0b8", "#c9563c", "#9bb48a", "#5d7fa8", "#d98a4a", "#b84a3a"];
  function setP(o) { VY = o.vy; YC = o.yc; DW = o.dw; YE = o.ye; }
  function k(d) { return Z / (d + Z); }
  function S(x, y, d) { var s = k(d); return [VX + (x - VX) * s, VY + (y - VY) * s]; }
  function L(d, inner) { var s = k(d).toFixed(4); return '<g transform="translate(' + VX + " " + VY + ") scale(" + s + ") translate(" + (-VX) + " " + (-VY) + ')">' + inner + "</g>"; }
  function F(pts, fill, sw) { return face(pts, fill, sw == null ? 1.8 : sw); }
  function R(x, y, w, h, f, sw, rx) { return reg("rect", 'x="' + (+x).toFixed(1) + '" y="' + (+y).toFixed(1) + '" width="' + (+w).toFixed(1) + '" height="' + (+h).toFixed(1) + '"' + (rx ? ' rx="' + rx + '"' : ""), f, sw == null ? 2.2 : sw); }
  function C(x, y, r, f, sw) { return reg("circle", 'cx="' + (+x).toFixed(1) + '" cy="' + (+y).toFixed(1) + '" r="' + r + '"', f, sw || 1.8); }
  function E(x, y, rx, ry, f, sw) { return reg("ellipse", 'cx="' + (+x).toFixed(1) + '" cy="' + (+y).toFixed(1) + '" rx="' + rx + '" ry="' + ry + '"', f, sw || 1.8); }
  function P2(d, f, sw) { return '<path d="' + d + '" style="fill:' + f + ";stroke:var(--ink);stroke-width:" + (sw || 2) + ';stroke-linejoin:round;stroke-linecap:round"/>'; }
  function seg(x1, y1, d1, x2, y2, d2, w, op, col) { var a = S(x1, y1, d1), b = S(x2, y2, d2); return line("M" + a[0].toFixed(1) + " " + a[1].toFixed(1) + " L" + b[0].toFixed(1) + " " + b[1].toFixed(1), w, op, col); }
  function flat(x0, x1, y, d0, d1, fill, sw) { return F([S(x0, y, d0), S(x1, y, d0), S(x1, y, d1), S(x0, y, d1)], fill, sw); }
  function side(x, d0, d1, y0, y1, fill, sw) { return F([S(x, y0, d0), S(x, y0, d1), S(x, y1, d1), S(x, y1, d0)], fill, sw); }
  function front(x0, x1, y0, y1, d, fill, sw) { return F([S(x0, y0, d), S(x1, y0, d), S(x1, y1, d), S(x0, y1, d)], fill, sw); }
  function pts(a) { return a.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "); }
  /* a button whose ring is a room rectangle at depth d */
  function HO(name, x0, y0, x1, y1, d, inner) { var a = S(x0, y0, d), b = S(x1, y1, d); return hot(name, inner, [a[0], a[1], b[0] - a[0], b[1] - a[1]]); }
  function shine(x, y, r) { return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r + '" style="fill:#fff;opacity:.75"/>'; }
  function specks(x, y, w, h, n, seed, col) { var r = rand(seed), s = ""; for (var i = 0; i < n; i++) s += '<circle cx="' + (x + r() * w).toFixed(1) + '" cy="' + (y + r() * h).toFixed(1) + '" r="' + (0.8 + r() * 1.6).toFixed(1) + '" style="fill:' + (col || "#fff") + ';opacity:.85"/>'; return s; }

  function defs() {
    return "<defs>" +
      '<pattern id="x2sun" width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="5.5" cy="5.5" r="2.4" style="fill:#f0b93c"/></pattern>' +
      '<pattern id="x2sunf" width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="5.5" cy="5.5" r="1.3" style="fill:#e9a92c"/></pattern>' +
      '<pattern id="x2shade" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="4.5" cy="4.5" r="1.5" style="fill:#1f1d1a;opacity:.35"/></pattern>' +
      '<linearGradient id="x2glass" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe8"/><stop offset="1" stop-color="#fbe7a8"/></linearGradient>' +
      "</defs>";
  }
  function svg(vb, inner, label) { return '<svg viewBox="' + vb + '" role="img" aria-label="' + label + '">' + defs() + inner + "</svg>"; }

  /* ---------------- pieces, drawn flat in room units (place them with L(d, ...)) ---------------- */
  function knob(x, y) { return C(x, y, 6.5, "var(--brass)", 1.6) + shine(x - 2, y - 2, 1.8); }
  function cup(x, y) { return P2("M" + (x - 24) + " " + y + " Q" + x + " " + (y + 17) + " " + (x + 24) + " " + y + " Z", "var(--brass)", 1.6) + R(x - 28, y - 4, 56, 6, "var(--brass)", 1.4, 3) + line("M" + (x - 14) + " " + (y + 4) + " Q" + x + " " + (y + 11) + " " + (x + 14) + " " + (y + 4), 1.2, 0.5, "#fff"); }
  function vbar(x, y, h) { return R(x - 3.5, y, 7, h, "var(--brass)", 1.4, 3.5) + R(x - 6, y - 4, 12, 9, "var(--brass)", 1.3, 2) + R(x - 6, y + h - 5, 12, 9, "var(--brass)", 1.3, 2) + line("M" + (x - 1) + " " + (y + 6) + " V" + (y + h - 6), 1, 0.5, "#fff"); }
  function hbar(x, y, w) { return R(x - w / 2, y - 3.5, w, 7, "var(--brass)", 1.4, 3.5) + R(x - w / 2 - 3, y - 6, 9, 12, "var(--brass)", 1.3, 2) + R(x + w / 2 - 6, y - 6, 9, 12, "var(--brass)", 1.3, 2); }
  function hinge(x, y) { return R(x - 3, y, 6, 22, "#9c8a5c", 1.2, 1); }
  /* shaker door: frame, sunk panel with a hatched shadow on its top and left edges */
  function door(x, y, w, h, pull) {
    return R(x, y, w, h, "var(--cab)", 2.2) + R(x + 18, y + 18, w - 36, h - 36, CABS, 1.6) + R(x + 24, y + 24, w - 48, h - 48, "var(--cab)", 1.2) +
      hatch(x + 24, y + 24, w - 48, 7, 0.28) + hatch(x + 24, y + 31, 7, h - 55, 0.28) + (pull || "");
  }
  function drawer(x, y, w, h, pull) { return R(x, y, w, h, "var(--cab)", 2.2) + R(x + 12, y + 10, w - 24, h - 20, "none", 1.2) + hatch(x + 12, y + 10, w - 24, 5, 0.25) + (pull || ""); }
  function labelHolder(cx, cy, text) {
    return R(cx - 44, cy - 15, 88, 30, "var(--brass)", 1.6, 2) + R(cx - 38, cy - 10, 76, 20, "var(--card)", 1.2, 1) + C(cx - 41, cy, 1.8, "var(--ink)", 0) + C(cx + 41, cy, 1.8, "var(--ink)", 0) +
      (text ? T(cx, cy + 5, text, "font:700 14px var(--font-hand);fill:var(--ink)", 'text-anchor="middle"') : line("M" + (cx - 26) + " " + cy + " H" + (cx + 26), 1.2, 0.3));
  }
  function books(x, y, w, h, seed) { /* y = the shelf they stand on */
    var r = rand(seed), s = "", cx = x;
    while (cx < x + w - 16) {
      var bw = 17 + Math.floor(r() * 17), bh = h * (0.66 + r() * 0.34), col = SP[Math.floor(r() * SP.length)];
      if (cx + bw > x + w) break;
      var lean = r() < 0.09 && cx + bw + 40 < x + w, g = R(cx, y - bh, bw, bh, col, 1.8, 1.5);
      g += line("M" + (cx + 2) + " " + (y - bh + 9) + " H" + (cx + bw - 2), 1.3, 0.55) + line("M" + (cx + 2) + " " + (y - bh + 13) + " H" + (cx + bw - 2), 1.3, 0.55) + line("M" + (cx + 2) + " " + (y - 11) + " H" + (cx + bw - 2), 1.3, 0.55);
      if (r() < 0.55) g += R(cx + 4, y - bh * 0.62, bw - 8, bh * 0.22, "color-mix(in srgb," + col + " 45%,#fffbf2)", 1, 1);
      g += line("M" + (cx + bw - 4) + " " + (y - bh + 16) + " V" + (y - 14), 3, 0.12);
      if (lean) { s += '<g transform="rotate(14 ' + (cx + bw) + " " + y + ')">' + g + "</g>"; cx += bw + 22; }
      else { s += g; cx += bw; }
    }
    return s;
  }
  function food(cx, cy, kind) {
    if (kind === "cookies") return C(cx - 11, cy + 4, 11, "#d9a25a", 1.3) + C(cx + 10, cy - 2, 10, "#d9a25a", 1.3) + C(cx + 2, cy + 12, 9, "#d9a25a", 1.3) + specks(cx - 20, cy - 10, 40, 30, 9, 3, "#5a3a22");
    if (kind === "choux") return E(cx, cy + 8, 20, 7, "#d99a4e", 1.3) + E(cx, cy, 15, 9, "#e8b46a", 1.3) + E(cx, cy - 8, 10, 7, "#f7efe0", 1.2) + C(cx + 4, cy - 14, 3, "#c9563c", 1);
    if (kind === "tart") return E(cx, cy, 22, 13, "#d99a4e", 1.3) + E(cx, cy - 1, 17, 9, "#f2c94c", 1.2) + C(cx - 6, cy - 2, 3, "#c9563c", 1) + C(cx + 5, cy, 3, "#c9563c", 1);
    if (kind === "eclair") return R(cx - 22, cy - 5, 44, 13, "#e3a85a", 1.3, 6) + R(cx - 20, cy - 8, 40, 7, "#4a2a1a", 1.2, 4);
    return E(cx, cy, 20, 11, "#c98a44", 1.3) + line("M" + (cx - 10) + " " + cy + " h20", 1, 0.5);
  }
  function polaroid(x, y, rot, kind) {
    return '<g transform="rotate(' + rot + " " + (x + 40) + " " + (y + 48) + ')">' + R(x + 4, y + 5, 80, 96, "rgba(31,29,26,.18)", 0) + R(x, y, 80, 96, "var(--card)", 1.8) + R(x + 8, y + 8, 64, 62, "#bcd3d6", 1.3) +
      E(x + 40, y + 46, 26, 12, "#fff", 1.2) + food(x + 40, y + 40, kind) + line("M" + (x + 14) + " " + (y + 84) + " h34", 1.3, 0.4) + "</g>";
  }
  function note(x, y, w, h, rot, fill, n) {
    var s = '<g transform="rotate(' + rot + " " + (x + w / 2) + " " + (y + h / 2) + ')">' + R(x + 3, y + 4, w, h, "rgba(31,29,26,.15)", 0) + R(x, y, w, h, fill, 1.6);
    s += line("M" + (x + 9) + " " + (y + 17) + " h" + (w * 0.5), 2.4, 0.55);
    for (var i = 0; i < (n || 4); i++) s += line("M" + (x + 9) + " " + (y + 31 + i * 11) + " H" + (x + w - 9 - (i % 3) * 12), 1.2, 0.35);
    return s + "</g>";
  }
  function pin(x, y, col) { return C(x + 1.5, y + 2, 6, "rgba(31,29,26,.25)", 0) + C(x, y, 6, col, 1.5) + shine(x - 2, y - 2, 1.8); }
  function cork(x, y, w, h, seed, skipRight) {
    var s = R(x, y, w, h, "var(--wood)", 2.6) + R(x + 16, y + 16, w - 32, h - 32, "url(#corkp)", 2) +
      line("M" + x + " " + y + " L" + (x + 16) + " " + (y + 16) + " M" + (x + w) + " " + y + " L" + (x + w - 16) + " " + (y + 16) + " M" + x + " " + (y + h) + " L" + (x + 16) + " " + (y + h - 16) + " M" + (x + w) + " " + (y + h) + " L" + (x + w - 16) + " " + (y + h - 16), 1.4) +
      hatch(x + 16, y + 16, w - 32, 8, 0.3) + grain(x, y + 3, w, 10, seed);
    var r = rand(seed), uw = w - 40 - (skipRight || 0), cols = Math.max(3, Math.round(uw / 120)), cw = uw / cols, kinds = ["cookies", "choux", "tart", "eclair", "bread"], fills = ["var(--card)", "var(--custard)", "#f6d7a8", "var(--card)", "#e6f0dc"], pins = ["var(--orange)", "var(--stem)", "#e9b23a", "#c9563c", "#5d7fa8"];
    for (var i = 0; i < cols; i++) for (var j = 0; j < 2; j++) {
      var ix = x + 26 + i * cw + r() * 10, iy = y + 30 + j * (h - 60) / 2 + r() * 12, rot = (r() - 0.5) * 9;
      if ((i + j) % 2) s += polaroid(ix, iy, rot, kinds[(i + j * 2) % 5]) + pin(ix + 40, iy + 6, pins[(i + j) % 5]);
      else s += note(ix, iy, Math.min(cw - 20, 104), Math.min((h - 80) / 2, 112), rot, fills[(i * 2 + j) % 5], 5) + pin(ix + 30, iy + 7, pins[(i + 2 * j) % 5]);
    }
    return s;
  }
  function whiteboard(x, y, w, h) {
    return R(x + 6, y + 8, w, h, "rgba(31,29,26,.18)", 0) + R(x, y, w, h, "#bfc2bd", 2.6, 6) + R(x + 11, y + 11, w - 22, h - 22, "var(--wb)", 1.6, 2) +
      line("M" + (x + 12) + " " + (y + 13) + " L" + (x + w - 40) + " " + (y + 13), 1.2, 0.5, "#fff") +
      line("M" + (x + 32) + " " + (y + 52) + " h" + (w * 0.4), 3, 0.18, MARK) + line("M" + (x + 32) + " " + (y + 86) + " h" + (w * 0.55), 2, 0.14) + line("M" + (x + 32) + " " + (y + 112) + " h" + (w * 0.46), 2, 0.14) + line("M" + (x + 32) + " " + (y + 138) + " h" + (w * 0.5), 2, 0.14) +
      R(x + 28, y + h - 4, w - 56, 13, "#bfc2bd", 1.8, 3) + R(x + w - 104, y + h - 16, 54, 12, MARK, 1.6, 4) + R(x + w - 58, y + h - 16, 10, 12, "#1f1d1a", 1.2, 2) +
      R(x + 48, y + h - 22, 58, 18, "#e9d8b4", 1.6, 3) + R(x + 48, y + h - 9, 58, 5, "#5a5348", 1.2, 1);
  }
  function windowFront(x, y, w, h, seed) {
    var s = R(x - 28, y - 26, w + 56, h + 52, "var(--card)", 2.6) + R(x - 14, y - 12, w + 28, h + 24, "var(--card)", 1.6) + R(x, y, w, h, "url(#x2glass)", 2.2);
    s += P2("M" + (x + w * 0.55) + " " + (y + h) + " q-40 -120 30 -170 q90 -40 120 50 q20 70 -10 120 z", "#cfe0b8", 1.4) + P2("M" + (x + w * 0.1) + " " + (y + h) + " q10 -60 70 -70 q50 0 60 70 z", "#b9d3a0", 1.4);
    s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" style="fill:url(#x2sunf);opacity:.25"/>';
    for (var i = 1; i < 3; i++) s += R(x + w * i / 3 - 3, y, 6, h, "var(--card)", 1.6);
    s += R(x - 4, y + h / 2 - 9, w + 8, 18, "var(--card)", 2.2) + R(x, y + h / 4 - 3, w, 6, "var(--card)", 1.6) + R(x, y + h * 3 / 4 - 3, w, 6, "var(--card)", 1.6);
    s += line("M" + (x + 14) + " " + (y + 20) + " l40 -0 M" + (x + w / 3 + 14) + " " + (y + h / 2 + 22) + " l26 0", 2, 0.6, "#fff") + hatch(x, y, w, 12, 0.22);
    s += R(x - 44, y + h + 26, w + 88, 20, "var(--card)", 2.4) + R(x - 30, y + h + 46, w + 60, 16, "var(--card)", 1.8) + hatch(x - 30, y + h + 62, w + 60, 8, 0.4);
    return s;
  }
  function spoonJar(x, y) {
    return line("M" + (x - 8) + " " + (y - 50) + " L" + (x - 18) + " " + (y - 116), 5, 1, "var(--wood-dark)") + E(x - 19, y - 124, 10, 15, "var(--wood-hi)", 1.8) +
      line("M" + (x + 8) + " " + (y - 50) + " L" + (x + 15) + " " + (y - 122), 5, 1, "var(--wood-dark)") + E(x + 16, y - 130, 9, 13, "var(--wood-hi)", 1.8) +
      line("M" + x + " " + (y - 50) + " V" + (y - 124), 2.2) + E(x, y - 132, 11, 16, "none", 1.8) + line("M" + (x - 6) + " " + (y - 140) + " q6 18 12 0 M" + (x - 9) + " " + (y - 130) + " q9 14 18 0", 1.2, 0.8) +
      R(x - 26, y - 58, 52, 58, "#c9563c", 2.2, 7) + R(x - 26, y - 46, 52, 8, "color-mix(in srgb,#c9563c 70%,#fff)", 1.2) + line("M" + (x - 18) + " " + (y - 30) + " v22", 2, 0.35, "#fff");
  }
  /* Buttercup, tilt-head stand mixer seen from the side, bowl at the front. x = left, y = counter, w = width */
  function mixer(x, y, w) {
    var q = function (v) { return (v * w / 300).toFixed(1); };
    var s = '<g transform="translate(' + x + " " + y + ')">';
    s += E(q(150), 0, q(150), q(9), "rgba(31,29,26,.2)", 0);
    s += R(q(10), -q(30), q(280), q(30), BUT, 2.4, q(12)) + line("M" + q(20) + " -" + q(24) + " H" + q(270), 1.5, 0.6, "#fff");
    s += P2("M" + q(196) + " -" + q(30) + " V-" + q(232) + " Q" + q(196) + " -" + q(262) + " " + q(232) + " -" + q(262) + " H" + q(262) + " Q" + q(282) + " -" + q(262) + " " + q(282) + " -" + q(232) + " V-" + q(30) + " Z", BUT, 2.4);
    s += hatch(q(258), -q(250), q(20), q(216), 0.3);
    s += R(q(48), -q(58), q(150), q(24), "#cfd2d4", 2, q(4));
    s += P2("M" + q(40) + " -" + q(196) + " H" + q(206) + " Q" + q(204) + " -" + q(88) + " " + q(166) + " -" + q(66) + " Q" + q(123) + " -" + q(50) + " " + q(80) + " -" + q(66) + " Q" + q(42) + " -" + q(88) + " " + q(40) + " -" + q(196) + " Z", STEEL, 2.4);
    s += E(q(123), -q(196), q(83), q(9), "#eef0f1", 2);
    s += P2("M" + q(40) + " -" + q(176) + " Q" + q(4) + " -" + q(170) + " " + q(10) + " -" + q(136) + " Q" + q(16) + " -" + q(110) + " " + q(48) + " -" + q(112), "none", 3);
    s += line("M" + q(62) + " -" + q(180) + " Q" + q(66) + " -" + q(110) + " " + q(96) + " -" + q(82), 3, 0.7, "#fff") + line("M" + q(180) + " -" + q(180) + " Q" + q(178) + " -" + q(120) + " " + q(160) + " -" + q(92), 2, 0.25);
    s += line("M" + q(123) + " -" + q(256) + " V-" + q(150), 5) + P2("M" + q(104) + " -" + q(150) + " Q" + q(123) + " -" + q(104) + " " + q(142) + " -" + q(150) + " Z", "#e8eaeb", 2);
    s += P2("M" + q(36) + " -" + q(262) + " Q" + q(28) + " -" + q(318) + " " + q(96) + " -" + q(322) + " H" + q(250) + " Q" + q(300) + " -" + q(320) + " " + q(298) + " -" + q(280) + " Q" + q(296) + " -" + q(248) + " " + q(250) + " -" + q(246) + " H" + q(70) + " Q" + q(38) + " -" + q(246) + " " + q(36) + " -" + q(262) + " Z", BUT, 2.6);
    s += line("M" + q(70) + " -" + q(300) + " Q" + q(150) + " -" + q(314) + " " + q(250) + " -" + q(306), 2.4, 0.65, "#fff");
    s += line("M" + q(62) + " -" + q(262) + " H" + q(286), 2, 0.6, "#bfc2bd") + line("M" + q(62) + " -" + q(258) + " H" + q(286), 1.2, 0.6);
    s += C(q(48), -q(286), q(19), "#e0d6b8", 2.2) + C(q(48), -q(286), q(9), BUTD, 1.6);
    s += R(q(232), -q(296), q(42), q(10), "#e0d6b8", 1.6, q(4)) + C(q(262), -q(241), q(8), "#e0d6b8", 1.6);
    s += hatch(q(70), -q(256), q(220), q(10), 0.3);
    return s + "</g>";
  }
  function flourBag(x, y, w) { /* x left, y counter */
    var h = w * 1.5;
    return E(x + w / 2, y, w * 0.6, 6, "rgba(31,29,26,.18)", 0) +
      P2("M" + x + " " + y + " L" + (x + 4) + " " + (y - h * 0.78) + " L" + (x - 4) + " " + (y - h) + " Q" + (x + w * 0.3) + " " + (y - h * 0.92) + " " + (x + w * 0.5) + " " + (y - h * 1.02) + " Q" + (x + w * 0.75) + " " + (y - h * 0.9) + " " + (x + w + 4) + " " + (y - h) + " L" + (x + w - 4) + " " + (y - h * 0.78) + " L" + (x + w) + " " + y + " Z", "#f7f2e6", 2.2) +
      line("M" + (x + 6) + " " + (y - h * 0.78) + " Q" + (x + w / 2) + " " + (y - h * 0.72) + " " + (x + w - 6) + " " + (y - h * 0.78), 1.6, 0.6) +
      line("M" + (x + w * 0.3) + " " + (y - h * 0.65) + " q-6 30 0 60 M" + (x + w * 0.72) + " " + (y - h * 0.6) + " q8 30 0 70", 1.2, 0.35) + hatch(x + w * 0.75, y - h * 0.7, w * 0.22, h * 0.68, 0.25) +
      specks(x - w * 0.5, y - 10, w * 0.6, 10, 10, 7, "#fffdf6");
  }

  /* ---------------- pieces placed in the room (they use S directly) ---------------- */
  function counter(x0, x1, seed) {
    var r = rand(seed), s = flat(x0, x1, YC, 0, DW, "var(--wood-hi)", 2.4);
    for (var i = 0; i < 22; i++) { var d = 8 + r() * (DW - 16), gx = x0 + r() * (x1 - x0), gl = 80 + r() * 260; s += seg(gx, YC, d, gx + gl, YC, d + (r() - 0.5) * 6, 1.1, 0.35); }
    for (var j = 0; j < 4; j++) { var kx = x0 + 200 + r() * (x1 - x0 - 400), kd = 40 + r() * (DW - 80), c = S(kx, YC, kd); s += E(c[0], c[1], 8, 2.6, "none", 1.1); }
    s += front(x0, x1, YC, YE, 0, "var(--wood)", 2.6) + grain(x0, YC + 2, x1 - x0, YE - YC - 4, seed + 1) + hatch(x0, YE, x1 - x0, 9, 0.4);
    return s;
  }
  function checker(x0, x1, d0, d1, y, size) {
    var s = "", rows = Math.ceil((d1 - d0) / size);
    for (var i = 0; i < rows; i++) for (var x = x0 - size * 2, j = 0; x < x1 + size; x += size, j++) {
      var da = d0 + i * size, db = Math.min(d1, da + size);
      s += F([S(x, y, da), S(x + size, y, da), S(x + size, y, db), S(x, y, db)], (i + j) % 2 ? "#3b3a36" : "#f4eedf", 0.6);
    }
    return s;
  }
  function kneehole(x0, x1, ytop) {
    var inner = front(x0 - 10, x1 + 10, ytop, YF, DW, WALLD, 1.6) + checker(x0, x1, 0, DW, YF, 60) +
      side(x0, 0, DW, ytop, YF, CABD, 1.6) + side(x1, 0, DW, ytop, YF, CABD, 1.6) +
      '<polygon points="' + pts([S(x0, ytop, 0), S(x1, ytop, 0), S(x1, ytop, DW), S(x0, ytop, DW)]) + '" style="fill:url(#x2shade)"/>' + hatch(x0, ytop, x1 - x0, 26, 0.5);
    return clipTo(x0, ytop, x1, H + 40, inner) + R(x0, ytop, x1 - x0, H + 40 - ytop, "none", 2.4);
  }
  /* open recipe box: front at depth d, deep 150, cards standing inside, lid open behind */
  function recipeBox(x0, x1, d, h) {
    var y1 = YC, y0 = YC - h, d1 = d + 150, s = "";
    s += F([S(x0, y1, d), S(x1, y1, d), S(x1, y1, d1), S(x0, y1, d1)], "rgba(31,29,26,.22)", 0);
    s += F([S(x0, y0, d1), S(x1, y0, d1), S(x1 + 6, y0 - h * 1.05, d1 + 34), S(x0 - 6, y0 - h * 1.05, d1 + 34)], "var(--blue-back)", 2.2);
    s += F([S(x0 + 12, y0 - 6, d1), S(x1 - 12, y0 - 6, d1), S(x1 - 6, y0 - h * 0.95, d1 + 30), S(x0 + 6, y0 - h * 0.95, d1 + 30)], CABL.replace("var(--cab)", "var(--blue)"), 1.2);
    s += flat(x0, x1, y0, d, d1, "var(--blue-back)", 2);
    if (x1 < VX) s += side(x1, d, d1, y0, y1, "var(--blue-back)", 2.2);
    var tabs = ["var(--custard)", "var(--orange)", "#efe0b8", "#e9b23a", "var(--stem)", "#f6d7a8", "var(--custard)"], w = x1 - x0;
    for (var i = 0; i < 7; i++) {
      var cd = d1 - 14 - i * 18, ty = y0 - 22 + i * 1.5, tx = x0 + 18 + ((i * 53) % (w - 90));
      s += front(tx, tx + 46, ty - 18, ty + 4, cd, tabs[i], 1.3) + front(x0 + 10, x1 - 10, ty, y0 + 40, cd, "#fffaf0", 1.3) + seg(x0 + 24, ty + 14, cd, x0 + w * 0.55, ty + 14, cd, 1, 0.3);
    }
    s += front(x0, x1, y0, y1, d, "var(--blue)", 2.8);
    var a = S(x0, y0, d), b = S(x1, y1, d), fw = b[0] - a[0], fh = b[1] - a[1];
    s += R(a[0] + 10, a[1] + 10, fw - 20, fh - 20, "none", 1.2) + grain(a[0] + 12, a[1] + 16, fw - 24, fh - 30, 41) +
      R(a[0] + fw / 2 - 18, a[1] + 8, 36, 20, "var(--brass)", 1.8, 2) + C(a[0] + fw / 2, a[1] + 18, 3, "var(--ink)", 0) +
      R(a[0] + fw / 2 - 40, a[1] + fh * 0.45, 80, 26, "var(--brass)", 1.6, 2) + R(a[0] + fw / 2 - 34, a[1] + fh * 0.45 + 5, 68, 16, "var(--card)", 1.2, 1) +
      line("M" + (a[0] + 6) + " " + (a[1] + 4) + " H" + (b[0] - 30), 1.6, 0.4, "#fff") + hatch(a[0], b[1] - 10, fw, 10, 0.35);
    return s;
  }
  /* spiral notebook lying open on the counter, pages from depth d0 (front) to d1 */
  function notebookOpen(cx, w, d0, d1) {
    var y = YC, s = "", x0 = cx - w / 2, x1 = cx + w / 2;
    s += F([S(x0 - 10, y, d0 - 6), S(x1 + 10, y, d0 - 6), S(x1 + 10, y, d1 + 6), S(x0 - 10, y, d1 + 6)], "var(--cinnamon)", 2.2);
    s += F([S(x0, y, d0), S(cx - 8, y, d0), S(cx - 8, y, d1), S(x0, y, d1)], "var(--page)", 1.8) + F([S(cx + 8, y, d0), S(x1, y, d0), S(x1, y, d1), S(cx + 8, y, d1)], "var(--page)", 1.8);
    for (var i = 1; i < 8; i++) { var dd = d1 - i * (d1 - d0) / 8.5; s += seg(x0 + 22, y, dd, cx - 22, y, dd, 1.1, i === 1 ? 0.7 : 0.32) + seg(cx + 22, y, dd, x1 - 22 - (i % 3) * 20, y, dd, 1.1, i === 1 ? 0.7 : 0.32); }
    s += seg(x0 + 40, y, d0 + 10, x0 + 40, y, d1 - 6, 1, 0.5, "#c9563c");
    for (var j = 0; j < 9; j++) { var rd = d0 + 8 + j * (d1 - d0 - 16) / 8, c = S(cx, y, rd); s += E(c[0], c[1] - 3, 7, 4.5, "none", 1.8); }
    var p = S(cx + 60, y, d0 + 18), q = S(cx + w * 0.62, y, d0 + 70);
    s += line("M" + p[0].toFixed(1) + " " + p[1].toFixed(1) + " L" + q[0].toFixed(1) + " " + q[1].toFixed(1), 9, 1, "#e9b23a") + line("M" + p[0].toFixed(1) + " " + p[1].toFixed(1) + " L" + q[0].toFixed(1) + " " + q[1].toFixed(1), 1.6, 0.7) +
      C(q[0], q[1], 5, "#e88f9a", 1.4) + line("M" + p[0].toFixed(1) + " " + p[1].toFixed(1) + " l-12 4", 3);
    return s;
  }
  function rollingPin(x0, x1, d0, d1) {
    var a = S(x0, YC - 12, d0), b = S(x1, YC - 12, d1), ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI, len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return '<g transform="translate(' + a[0].toFixed(1) + " " + a[1].toFixed(1) + ") rotate(" + ang.toFixed(1) + ')">' + E(len / 2, 16, len / 2 + 10, 5, "rgba(31,29,26,.18)", 0) + R(-38, -5, 40, 10, "var(--wood)", 1.8, 5) + R(len - 2, -5, 40, 10, "var(--wood)", 1.8, 5) + R(0, -13, len, 26, "var(--wood-hi)", 2.2, 12) + line("M10 -6 H" + (len - 12), 1.6, 0.5, "#fff") + "</g>" +
      specks(a[0] - 30, a[1] + 10, len + 60, 22, 26, 13, "#fffdf6");
  }
  function bowlAt(cx, d, w, col) { var c = S(cx, YC, d), s = k(d) * w; return E(c[0], c[1], s * 0.55, 5, "rgba(31,29,26,.18)", 0) + P2("M" + (c[0] - s / 2) + " " + (c[1] - s * 0.44) + " H" + (c[0] + s / 2) + " Q" + (c[0] + s / 2 - 8) + " " + c[1] + " " + c[0] + " " + c[1] + " Q" + (c[0] - s / 2 + 8) + " " + c[1] + " " + (c[0] - s / 2) + " " + (c[1] - s * 0.44) + " Z", col, 2.2) + E(c[0], c[1] - s * 0.44, s / 2, s * 0.08, "color-mix(in srgb," + col + " 70%,#fff)", 1.8) + line("M" + (c[0] - s * 0.4) + " " + (c[1] - s * 0.3) + " H" + (c[0] + s * 0.4), 2, 0.25); }
  function sunbeam(p, op) { return '<polygon points="' + pts(p) + '" style="fill:url(#x2sun);opacity:' + (op || 0.42) + '"/>'; }

  /* ================= Option A: Kittl A, balanced; window on the back wall ================= */
  function sceneA() {
    setP({ vy: 330, yc: 691, dw: 216, ye: 717 });
    var s = "", UD = 156;
    /* back wall */
    var wall = R(-900, -400, 3600, YC + 400, "var(--wall)", 0) +
      '<polygon points="1529,-106 1529,529 1180,700 760,700 1100,200" style="fill:url(#x2sun);opacity:.32"/>' +
      hatch(-700, 176, 2076, 16, 0.22);
    wall += HOraw("the idea board", [338, 205, 582, 445], cork(338, 205, 582, 445, 5));
    wall += HOraw("the whiteboard", [950, 205, 310, 436], whiteboard(950, 205, 310, 436));
    wall += windowFront(1529, -106, 445, 600) + spoonJar(1600, 520);
    s += L(DW, wall);
    /* the wall cupboards: underside, then doors at depth UD; the open cubby is set into the same run */
    s += flat(-900, 851, 176, UD, DW, CABD, 2);
    var up = "";
    for (var x = 851 - 225; x > -1000; x -= 225) up += door(x, -103, 225, 279, knob(x + (x % 450 ? 26 : 199), 146));
    s += L(UD, up);
    /* cubby: inside walls back to the wall, books, then the front frame */
    var cub = front(851, 1376, -103, 176, DW, "var(--wood-dark)", 1.6) + side(869, UD, DW, -85, 158, "var(--wood-dark)", 1.6) + side(1358, UD, DW, -85, 158, "var(--wood-dark)", 1.6) +
      flat(869, 1358, -85, UD, DW, "color-mix(in srgb,var(--wood-dark) 70%,#000)", 1.6) + side(1095, UD, DW, -85, 158, "var(--wood)", 1.4) + side(1113, UD, DW, -85, 158, "var(--wood)", 1.4);
    s += cub;
    s += HO("the cookbooks", 869, -85, 1095, 158, UD, L(186, books(876, 158, 216, 214, 31)) + L(UD, R(869, 150, 226, 8, "var(--wood)", 1.2)));
    s += HO("the references", 1113, -85, 1358, 158, UD, L(186, books(1124, 158, 230, 200, 57)));
    s += L(UD, R(851, -103, 525, 18, "var(--wood)", 2.2) + R(851, 158, 525, 18, "var(--wood)", 2.2) + R(851, -103, 18, 279, "var(--wood)", 2.2) + R(1358, -103, 18, 279, "var(--wood)", 2.2) + R(1095, -85, 18, 243, "var(--wood)", 2) + grain(851, -100, 525, 14, 3) + grain(851, 160, 525, 14, 4));
    /* counter and what's on it, back to front */
    s += counter(-900, 2700, 17);
    s += sunbeam([S(1529, YC, DW), S(1974, YC, DW), S(1500, YC, 30), S(1000, YC, 30)], 0.38);
    s += L(120, mixer(1092, YC, 303));
    s += L(90, flourBag(1385, YC, 100));
    s += HO("the recipe box", 192, YC - 300, 460, YC, 50, recipeBox(192, 460, 50, 150));
    var nb = S(780, YC, 30), nb2 = S(1060, YC, 170);
    s += hot("the notebook", notebookOpen(860, 380, 40, 175), [S(650, YC, 175)[0], S(650, YC, 175)[1] - 10, S(1070, YC, 40)[0] - S(650, YC, 175)[0], S(1070, YC, 40)[1] - S(650, YC, 175)[1] + 20]);
    s += rollingPin(1320, 1580, 22, 60);
    /* lower cabinets */
    var lo = "";
    for (var lx = 653 - 240; lx > -1000; lx -= 240) lo += door(lx, 727, 240, 260, vbar(lx + ((lx - 653) % 480 ? 214 : 26), 760, 70));
    lo += drawer(653, 727, 481, 79, cup(780, 760) + cup(1007, 760));
    s += lo + kneehole(653, 1134, 812);
    var log = drawer(1140, 727, 296, 79, labelHolder(1288, 752, "recipe log") + cup(1288, 782)) + drawer(1140, 812, 296, 84, labelHolder(1288, 840) + cup(1288, 872)) + drawer(1140, 902, 296, 84, labelHolder(1288, 930));
    s += hot("the recipe log", log, [1140, 727, 296, 175]);
    for (var rx = 1442; rx < 2700; rx += 300) s += drawer(rx, 727, 300, 79, hbar(rx + 150, 766, 110)) + door(rx, 812, 300, 200, knob(rx + 150, 840));
    s += hatch(-900, YE, 3600, 10, 0.35);
    return s;
  }
  /* hot() with a ring given in the same units as its drawing (used inside a layer) */
  function HOraw(name, ring, inner) { return hot(name, inner, ring); }

  /* ================= Option B: Kittl B, wide suite; window on the right wall, counter returns ================= */
  function sceneB() {
    setP({ vy: 330, yc: 662, dw: 244, ye: 686 });
    var s = "", UD = 59, XR = 1614, RX = 1290;
    /* back wall: two-tier shelf, cork board with the whiteboard on it */
    var wall = R(-900, -400, 3600, YC + 400, "var(--wall)", 0) + '<polygon points="1614,-200 1614,662 1100,662 1300,-200" style="fill:url(#x2sun);opacity:.22"/>' + hatch(150, 92, 1464, 18, 0.25);
    wall += HOraw("the idea board", [721, 132, 856, 475], cork(721, 132, 856, 475, 9, 270));
    wall += HOraw("the whiteboard", [1318, 166, 236, 250], whiteboard(1318, 166, 236, 250));
    s += L(DW, wall);
    /* two-tier shelf: books stand at depth 225, planks run from the wall to depth 205 */
    s += HO("the cookbooks", 160, 90, 690, 266, 205, L(226, books(166, 266, 518, 176, 61)));
    s += flat(145, 692, 280, 205, DW, "color-mix(in srgb,var(--wood) 70%,#000)", 1.6) + L(205, R(145, 266, 547, 14, "var(--wood)", 2.2) + grain(145, 267, 547, 12, 8));
    s += flat(145, 692, 485, 205, DW, "var(--wood-hi)", 1.6);
    s += HO("the references", 160, 316, 690, 485, 205, L(226, books(166, 485, 518, 160, 83)));
    s += L(205, R(145, 485, 547, 14, "var(--wood)", 2.2) + grain(145, 486, 547, 12, 6));
    s += L(DW, P2("M182 280 v46 q0 -34 34 -46 z M655 280 v46 q0 -34 -34 -46 z M182 499 v46 q0 -34 34 -46 z M655 499 v46 q0 -34 -34 -46 z", "var(--wood)", 1.8));
    /* right wall with its window */
    s += F([S(XR, -600, -300), S(XR, -600, DW), S(XR, YF, DW), S(XR, YF, -300)], WALLW, 2);
    s += sideWindow(XR, 14, 170, -40, 520);
    /* wall cupboards: underside to the wall, doors at UD, and the side of the run against the right wall */
    s += flat(300, XR, 92, UD, DW, CABS, 2);
    var up = "";
    for (var x = 300; x < XR - 10; x += 263) up += door(x, -200, Math.min(263, XR - x), 292, knob(x + (((x - 300) / 263) % 2 ? 24 : 239), 66));
    s += L(UD, up + R(300, 84, XR - 300, 10, CABS, 1.4));
    /* the tall cupboard on the left, its side running back to the wall */
    s += side(300, 0, DW, -200, YF, CABS, 2) + L(0, R(-560, -200, 860, 1180, "var(--cab)", 2.2) + door(-560, -200, 430, 560, vbar(-160, 220, 110)) + door(-130, -200, 430, 560, vbar(-104, 220, 110)) + door(-560, 372, 430, 600, knob(-160, 420)) + door(-130, 372, 430, 600, knob(-104, 420)));
    /* counter: main run and the return along the right wall */
    s += counter(300, XR, 23);
    s += flat(RX, XR, YC, -300, 0, "var(--wood-hi)", 2.4) + side(RX, -300, 0, YC, YE, "var(--wood)", 2.4);
    for (var g = 0; g < 6; g++) s += seg(RX + 30 + g * 45, YC, -280, RX + 40 + g * 45, YC, -10, 1, 0.3);
    s += sunbeam([S(XR, YC, 170), S(XR, YC, 14), S(1050, YC, 0), S(1180, YC, DW)], 0.36);
    s += L(119, mixer(1325, YC, 230));
    s += bowlAt(1205, 106, 150, "#f2d675");
    s += line("M" + S(1225, YC - 50, 106).map(function (v) { return v.toFixed(1); }).join(" ") + " L" + S(1260, YC - 120, 106).map(function (v) { return v.toFixed(1); }).join(" "), 5, 1, "#bfc2bd");
    s += HO("the recipe box", 488, YC - 280, 720, YC, 59, recipeBox(488, 720, 59, 140));
    s += hot("the notebook", notebookOpen(870, 300, 60, 185), [S(720, YC, 185)[0], S(720, YC, 185)[1] - 10, S(1020, YC, 60)[0] - S(720, YC, 185)[0], S(1020, YC, 60)[1] - S(720, YC, 185)[1] + 20]);
    s += bowlAt(1440, -60, 120, "#f4f0e6") + bowlAt(1500, -190, 130, "#e3c79a") + specks(S(1450, YC, -190)[0], S(1450, YC, -190)[1] - 30, 40, 10, 8, 5, "#fffdf6");
    /* lower cabinets on the main run */
    var lo = door(300, 696, 194, 300, vbar(470, 730, 64)) + door(494, 696, 194, 300, vbar(518, 730, 64)) + drawer(688, 696, 346, 52, cup(861, 718));
    s += lo + kneehole(688, 1034, 752);
    var log = drawer(1034, 696, 256, 78, labelHolder(1162, 722, "recipe log") + cup(1162, 752)) + drawer(1034, 778, 256, 80, labelHolder(1162, 806) + cup(1162, 836)) + drawer(1034, 862, 256, 100, labelHolder(1162, 890));
    s += hot("the recipe log", log, [1034, 696, 256, 204]);
    /* the return's cupboards face the room, so they run along the depth axis */
    s += side(RX, -300, 0, YE, YF, "var(--cab)", 2.2) + sideDoor(RX, -6, -140, YE + 10, YF - 10) + sideDoor(RX, -146, -290, YE + 10, YF - 10);
    s += hatch(300, YE, XR - 300, 10, 0.35);
    return s;
  }
  function sideDoor(x, d0, d1, y0, y1) {
    var s = side(x, d0, d1, y0, y1, "var(--cab)", 2) + side(x, d0 - 12, d1 + 12, y0 + 16, y1 - 16, CABS, 1.4);
    var c = S(x, y0 + 40, d0 - 22); return s + C(c[0], c[1], 6.5 * k(d0), "var(--brass)", 1.5);
  }
  function sideWindow(x, d0, d1, y0, y1) {
    var s = side(x, d0 - 20, d1 + 20, y0 - 24, y1 + 24, "var(--card)", 2.4) + side(x, d0, d1, y0, y1, "url(#x2glass)", 2);
    s += F([S(x, y1, d0 + 30), S(x, y1, d1 - 10), S(x, y1 - 160, d1 - 10), S(x, y1 - 230, d0 + 30)], "#cfe0b8", 1.2);
    var dm = (d0 + d1) / 2, ym = (y0 + y1) / 2;
    s += seg(x, y0, dm, x, y1, dm, 6, 1, "var(--card)") + seg(x, y0, dm, x, y1, dm, 1.2) + seg(x, ym, d0, x, ym, d1, 9, 1, "var(--card)") + seg(x, ym, d0, x, ym, d1, 1.2);
    s += seg(x, y0 + 100, d0, x, y0 + 100, d1, 4, 1, "var(--card)") + seg(x, y1 - 120, d0, x, y1 - 120, d1, 4, 1, "var(--card)");
    s += F([S(x, y1 + 24, d0 - 30), S(x, y1 + 24, d1 + 30), S(x - 40, y1 + 24, d1 + 30), S(x - 40, y1 + 24, d0 - 30)], "var(--card)", 2);
    s += '<polygon points="' + pts([S(x, y0, d0), S(x, y0, d1), S(x, y1, d1), S(x, y1, d0)]) + '" style="fill:url(#x2sunf);opacity:.3"/>';
    return s;
  }

  return { svg: svg, A: sceneA, B: sceneB };
})();
