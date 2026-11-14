/* Shared drawing helpers from Plate VIII. Do not edit: every section depends on these. */
  var INK = "var(--ink)", TARGET = null, O = null;
  function reg(tag, a, fill, sw) { return "<" + tag + " " + a + ' style="fill:' + fill + ";stroke:" + INK + ";stroke-width:" + (sw || 3) + ';stroke-linejoin:round;stroke-linecap:round"/>'; }
  function line(d, w, op, col) { return '<path d="' + d + '" style="fill:none;stroke:' + (col || INK) + ";stroke-width:" + (w || 2) + ";opacity:" + (op || 1) + ';stroke-linecap:round;stroke-linejoin:round"/>'; }
  function poly(pts, fill, sw) { return reg("polygon", 'points="' + pts + '"', fill, sw || 2.2); }
  function hatch(x, y, w, h, op) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" style="fill:url(#hatch);opacity:' + (op || 1) + '"/>'; }
  function T(x, y, t, st, extra) { return '<text x="' + x + '" y="' + y + '" ' + (extra || "") + ' style="' + st + '">' + t + "</text>"; }
  function arrow(x1, y1, x2, y2) { var a = Math.atan2(y2 - y1, x2 - x1), h = 11;
    return line("M" + x1 + " " + y1 + " Q" + ((x1 + x2) / 2 + 10) + " " + ((y1 + y2) / 2 - 10) + " " + x2 + " " + y2, 2) +
      line("M" + (x2 - h * Math.cos(a - .5)) + " " + (y2 - h * Math.sin(a - .5)) + " L" + x2 + " " + y2 + " L" + (x2 - h * Math.cos(a + .5)) + " " + (y2 - h * Math.sin(a + .5)), 2); }
  function rand(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  /* Composition marbling: irregular blobs, smoothed through their midpoints */
  function blobs(seed, size, n, rmin, rmax, col) { var r = rand(seed), s = "";
    for (var i = 0; i < n; i++) {
      var cx = r() * size, cy = r() * size, k = 6 + Math.floor(r() * 4), rad = rmin + r() * (rmax - rmin), pts = [];
      for (var j = 0; j < k; j++) { var a = j / k * Math.PI * 2 + r() * 0.5, rr = rad * (0.45 + r() * 0.9); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * (0.6 + r() * 0.6)]); }
      var d = "M" + ((pts[0][0] + pts[k - 1][0]) / 2).toFixed(1) + " " + ((pts[0][1] + pts[k - 1][1]) / 2).toFixed(1);
      for (var q = 0; q < k; q++) { var p = pts[q], nx = pts[(q + 1) % k]; d += " Q" + p[0].toFixed(1) + " " + p[1].toFixed(1) + " " + ((p[0] + nx[0]) / 2).toFixed(1) + " " + ((p[1] + nx[1]) / 2).toFixed(1); }
      s += '<path d="' + d + 'Z" style="fill:' + col + '"/>';
    }
    return s; }
  var speck = "", rs = rand(9);
  for (var si = 0; si < 14; si++) speck += '<circle cx="' + (rs() * 30).toFixed(1) + '" cy="' + (rs() * 30).toFixed(1) + '" r="' + (0.8 + rs() * 1.3).toFixed(1) + '" style="fill:#a8743a;opacity:.7"/>';
  document.body.insertAdjacentHTML("afterbegin", '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
    '<pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" style="stroke:var(--ink);stroke-width:1.4"/></pattern>' +
    '<pattern id="mblack" width="64" height="64" patternUnits="userSpaceOnUse"><rect width="64" height="64" style="fill:#1c1a18"/>' + blobs(11, 64, 80, 0.8, 3.2, "#f1eee6") + blobs(12, 64, 110, 0.4, 1.1, "#f1eee6") + "</pattern>" +
    '<pattern id="mwhite" width="64" height="64" patternUnits="userSpaceOnUse"><rect width="64" height="64" style="fill:#f1eee6"/>' + blobs(21, 64, 120, 1.4, 4.4, "#1c1a18") + blobs(22, 64, 90, 0.5, 1.4, "#1c1a18") + "</pattern>" +
    '<pattern id="cloth" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" style="fill:#1a1917"/><path d="M0 2 H4" style="stroke:#3a3733;stroke-width:0.8"/></pattern>' +
    '<pattern id="corkp" width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" style="fill:var(--cork)"/>' + speck + "</pattern>" +
    '<pattern id="tile" width="34" height="26" patternUnits="userSpaceOnUse"><rect width="34" height="26" style="fill:#f4f5ea"/><path d="M0 0.5 H34 M0.5 0 V26" style="stroke:#d6d9c6;stroke-width:1.4"/></pattern>' +
    '<pattern id="glowdots" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><rect width="8" height="8" style="fill:#f8d76a;opacity:.45"/><circle cx="4" cy="4" r="2.7" style="fill:#f0a62e"/></pattern>' +
    '<radialGradient id="rg"><stop offset="0.45" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>' +
    '<mask id="fade" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#rg)"/></mask>' +
    '<pattern id="peg" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="18" height="18" style="fill:#d9b582"/><circle cx="9" cy="9" r="2" style="fill:#7a5a34"/></pattern>' +
    '<pattern id="sun" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="4.5" cy="4.5" r="2.4" style="fill:#fff3c4"/></pattern>' +
    '<filter id="gblur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="15"/></filter>' +
    '<linearGradient id="evewash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe6b2"/><stop offset=".35" stop-color="#f7d9a6"/><stop offset=".7" stop-color="#d9c7b4"/><stop offset="1" stop-color="#aeacbd"/></linearGradient>' +
    "</defs></svg>");

  /* ===== One-point perspective: every receding edge runs to one vanishing point (VPX, VPY) =====
     P() moves a front point back by depth d along its line to the vanishing point. */
  var VPX = 900, VPY = 230, ZF = 500, GUIDE = null, CTR = 478, CTR_D = 80, BR = 25, YS = 0;
  function kk(d) { return d / (d + ZF); }
  function P(x, y, d) { var k = kk(d); if (GUIDE) GUIDE.push([x, y - YS]); return [x + (VPX - x) * k, y + (VPY - y) * k]; }
  function face(a, fill, sw) { return poly(a.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "), fill, sw || 1.6); }
  /* A solid block: draws only the faces turned toward the eye (call before its front face) */
  function block(x0, y0, x1, y1, d, f) {
    var s = "";
    if (x0 > VPX && f.side) s += face([[x0, y0], [x0, y1], P(x0, y1, d), P(x0, y0, d)], f.side);
    if (x1 < VPX && f.side) s += face([[x1, y0], [x1, y1], P(x1, y1, d), P(x1, y0, d)], f.side);
    if (y0 > VPY && f.top) s += face([[x0, y0], [x1, y0], P(x1, y0, d), P(x0, y0, d)], f.top);
    return s;
  }
  /* An opening set into a surface: its inner walls, then the back, clipped to the opening.
     Walls that face away fall outside the clip, so only the ones facing the eye show. */
  function recess(x0, y0, x1, y1, d, back, f, inside) {
    var id = "r" + (uidN++), A = [x0, y0], B = [x1, y0], C = [x1, y1], D = [x0, y1], a = P(x0, y0, d), b = P(x1, y0, d), c = P(x1, y1, d), dd = P(x0, y1, d);
    return '<defs><clipPath id="' + id + '"><rect x="' + x0 + '" y="' + y0 + '" width="' + (x1 - x0) + '" height="' + (y1 - y0) + '"/></clipPath></defs><g clip-path="url(#' + id + ')">' +
      face([A, D, dd, a], f.side) + face([B, C, c, b], f.side) + face([A, B, b, a], f.top || f.side) + face([D, C, c, dd], f.bottom || f.side) + face([a, b, c, dd], back, 1.4) + (inside || "") + "</g>";
  }
  function clipTo(x0, y0, x1, y1, inner) { var id = "q" + (uidN++);
    return '<defs><clipPath id="' + id + '"><rect x="' + x0 + '" y="' + y0 + '" width="' + (x1 - x0) + '" height="' + (y1 - y0) + '"/></clipPath></defs><g clip-path="url(#' + id + ')">' + inner + "</g>"; }

  /* Glow: halftone dots in a soft halo that follows the object's outline and spills ~45 px past it.
     clipX keeps the cork's glow off the whiteboard. */
  function hot(name, inner, ring, clipX) {
    var id = "h" + (uidN++), m = 58, e = 26, gx = ring[0] - m, gy = ring[1] - m, gw = ring[2] + 2 * m, gh = ring[3] + 2 * m;
    var glow = '<defs><mask id="m' + id + '" maskUnits="userSpaceOnUse" x="' + (gx - 30) + '" y="' + (gy - 30) + '" width="' + (gw + 60) + '" height="' + (gh + 60) + '"><rect x="' + (ring[0] - e) + '" y="' + (ring[1] - e) + '" width="' + (ring[2] + 2 * e) + '" height="' + (ring[3] + 2 * e) + '" rx="18" style="fill:#fff" filter="url(#gblur)"/></mask>' +
      (clipX != null ? '<clipPath id="c' + id + '"><rect x="' + clipX + '" y="-400" width="4000" height="1600"/></clipPath>' : "") + "</defs>" +
      '<rect x="' + gx + '" y="' + gy + '" width="' + gw + '" height="' + gh + '" mask="url(#m' + id + ')" style="fill:url(#glowdots)"/>';
    return '<g class="hot' + (TARGET === name ? " on" : "") + '" tabindex="0" role="button" aria-label="Open ' + name + '">' +
      '<g class="fx-glow"' + (clipX != null ? ' clip-path="url(#c' + id + ')"' : "") + ">" + glow + "</g>" +
      '<rect class="focus-ring" x="' + (ring[0] - 4) + '" y="' + (ring[1] - 4) + '" width="' + (ring[2] + 8) + '" height="' + (ring[3] + 8) + '" rx="6" style="fill:transparent;stroke:transparent;stroke-width:2;stroke-dasharray:7 5"/>' +
      '<g class="lift">' + inner + "</g></g>";
  }
  function brassLabel(cx, cy, w, h, text, size) {
    return reg("rect", 'x="' + (cx - w / 2) + '" y="' + (cy - h / 2) + '" width="' + w + '" height="' + h + '" rx="3"', "var(--brass)", 2) +
      reg("rect", 'class="lbl" x="' + (cx - w / 2 + 6) + '" y="' + (cy - h / 2 + 5) + '" width="' + (w - 12) + '" height="' + (h - 10) + '" rx="1.5"', "var(--card)", 1.4) +
      '<circle cx="' + (cx - w / 2 + 3.5) + '" cy="' + cy + '" r="2.2" style="fill:var(--ink)"/><circle cx="' + (cx + w / 2 - 3.5) + '" cy="' + cy + '" r="2.2" style="fill:var(--ink)"/>' +
      T(cx, cy + size * 0.33, text, "font:700 " + size + "px var(--font-hand);fill:var(--ink)", 'text-anchor="middle"');
  }
  function paidTag(x, y, rot) {
    return '<g class="paid" transform="rotate(' + rot + " " + x + " " + y + ')">' + reg("rect", 'x="' + (x - 52) + '" y="' + (y - 16) + '" width="104" height="30" rx="3"', "var(--yellow)", 1.8) +
      '<circle cx="' + (x - 40) + '" cy="' + y + '" r="4" style="fill:var(--card);stroke:var(--ink);stroke-width:1.5"/>' +
      T(x + 6, y + 6, "paid plan", "font:700 20px var(--font-hand);fill:var(--ink)", 'text-anchor="middle"') + "</g>";
  }
  function grain(x, y, w, h, seed) { var r = rand(seed), s = "";
    for (var i = 0; i < Math.max(2, Math.round(w / 140)); i++) { var gy = y + 3 + r() * (h - 6), gx = x + r() * (w - 80); s += line("M" + gx.toFixed(0) + " " + gy.toFixed(1) + " q30 -" + (1 + r() * 2).toFixed(1) + " " + (50 + r() * 40).toFixed(0) + " 0", 1, 0.35); }
    return s; }

/* ===== Page registry: each section registers a render function; the choices bar redraws them all ===== */
var PLATE = { fns: [], add: function (f) { this.fns.push(f); },
  redraw: function () {
    document.querySelectorAll(".seg").forEach(function (seg) { seg.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(o[seg.dataset.key] === b.dataset.val)); }); });
    this.fns.forEach(function (f) { f(); });
    document.querySelectorAll(".fx").forEach(function (f) { f.dataset.plan = o.plan; });
  },
  start: function () {
    var c = document.getElementById("choices");
    if (c) c.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; o[b.parentNode.dataset.key] = b.dataset.val; PLATE.redraw(); });
    PLATE.redraw();
  } };
