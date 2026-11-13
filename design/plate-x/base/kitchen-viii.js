/* The kitchen scene. base/kitchen-viii.js is the frozen Plate VIII copy; ../kitchen.js is the Plate IX one (agent 1 only). */
  /* ================= Layout: the middle never moves ================= */
  var LAB = 700, BOX = 1090, VP = [300, 1500];
  function lay(vp) {
    var W = vp[1] - vp[0], bw = Math.min(840, Math.max(600, 0.55 * W)), bx = 900 - bw / 2, wbW = Math.round(248 + (bw - 660) * 0.25), shW = Math.min(480, Math.max(360, W / 3));
    return { vp: vp, W: W, bx: bx, bw: bw, wbW: wbW, cx: bx + wbW + 10, cw: bw - wbW - 10, shX: 900 - shW / 2, shW: shW };
  }
  var NOTES = [[112, 140, 80, 88, 3, "var(--yellow)", "var(--blue)"], [212, 150, 104, 66, -2, "var(--card)", "var(--stem)"], [22, 250, 98, 64, 2, "var(--amber)", "var(--orange)"],
    [140, 248, 86, 80, -3, "var(--card)", "var(--orange)"], [250, 240, 90, 70, 4, "var(--card)", "var(--yellow)"], [340, 146, 84, 72, -4, "var(--amber)", "var(--blue)"], [362, 244, 92, 76, 2, "var(--yellow)", "var(--stem)"], [446, 160, 80, 90, 3, "var(--card)", "var(--orange)"]];
  function board(L) { YS = BR; VPY += BR; var out = boardAt(L); VPY -= BR; YS = 0; return '<g transform="translate(0 -' + BR + ')">' + out + "</g>"; }
  function boardAt(L) {
    var dim = O.depth === "dim", s = hatch(L.bx - 2, 365, L.bw + 4, dim ? 14 : 8) + reg("rect", 'x="' + (L.bx - 10) + '" y="115" width="' + (L.bw + 20) + '" height="250" rx="4"', "var(--wood)") + grain(L.bx - 6, 116, L.bw + 12, 8, 4);
    var FW = { side: "var(--wood)", top: "var(--wood-dark)", bottom: "var(--wood-hi)" };
    var x = L.bx, wb = dim ? recess(x, 125, x + L.wbW, 355, 10, "var(--wb)", FW) + reg("rect", 'x="' + x + '" y="125" width="' + L.wbW + '" height="230"', "none", 2.2)
      : reg("rect", 'x="' + x + '" y="125" width="' + L.wbW + '" height="230"', "var(--wb)", 2.2);
    wb += '<rect class="lbl" x="' + (x + 14) + '" y="136" width="116" height="38" rx="3" style="fill:transparent"/>' + T(x + 22, 164, "Next up", "font:700 33px var(--font-hand);fill:var(--blue)") + line("M" + (x + 22) + " 172 q48 5 96 -2", 2.4, 1, "var(--blue)");
    [["Blondies · trial 4", 0], ["Croissant folds", 0], ["Rhubarb galette", 1]].forEach(function (it, i) { var y = 210 + i * 34;
      wb += it[1] ? '<circle cx="' + (x + 30) + '" cy="' + (y - 7) + '" r="8" style="fill:var(--orange);stroke:var(--ink);stroke-width:1.8"/>' : reg("rect", 'x="' + (x + 22) + '" y="' + (y - 15) + '" width="15" height="15" rx="2"', "var(--wb)", 1.8);
      wb += T(x + 48, y, it[0], "font:600 24px var(--font-hand);fill:" + (it[1] ? "var(--orange-text)" : "var(--ink)")); });
    var tx = x + L.wbW - 64;
    wb += reg("rect", 'x="' + tx + '" y="344" width="58" height="9" rx="2"', "var(--wood)", 1.8) + reg("rect", 'x="' + (tx + 6) + '" y="337" width="22" height="7" rx="3"', "var(--blue)", 1.4) + reg("rect", 'x="' + (tx + 32) + '" y="337" width="20" height="7" rx="3"', "var(--orange)", 1.4);
    s += hot("the whiteboard", wb, [x, 125, L.wbW, 230]);
    s += reg("rect", 'x="' + (x + L.wbW) + '" y="125" width="10" height="230"', "var(--wood)", 2);
    var wash = '<rect class="fx-wash" x="' + L.cx + '" y="125" width="' + L.cw + '" height="230" style="fill:#fffaf0"/>';
    var cork = dim ? recess(L.cx, 125, L.cx + L.cw, 355, 10, "url(#corkp)", FW, wash) + reg("rect", 'x="' + L.cx + '" y="125" width="' + L.cw + '" height="230"', "none", 2.2)
      : reg("rect", 'x="' + L.cx + '" y="125" width="' + L.cw + '" height="230"', "url(#corkp)", 2.2) + wash;
    cork += '<g transform="rotate(-3 ' + (L.cx + 62) + ' 160)">' + reg("rect", 'class="lbl" x="' + (L.cx + 18) + '" y="138" width="88" height="46"', "var(--card)", 2) + line("M" + (L.cx + 22) + " 152 H" + (L.cx + 102), 1.4, 1, "#c9442a") + T(L.cx + 62, 176, "Ideas", "font:700 28px var(--font-hand);fill:var(--ink)", 'text-anchor="middle"') +
      '<g class="fx-line">' + line("M" + (L.cx + 30) + " 192 q16 5 32 0 t32 0", 3.4, 1, "var(--orange)") + "</g></g>" +
      '<circle cx="' + (L.cx + 62) + '" cy="142" r="7" style="fill:var(--orange);stroke:var(--ink);stroke-width:1.8"/>';
    NOTES.forEach(function (n) {
      if (n[0] + n[2] + 16 > L.cw) return;
      var nx = L.cx + n[0], ny = n[1], ncx = nx + n[2] / 2, ncy = ny + n[3] / 2, body = reg("rect", 'x="' + nx + '" y="' + ny + '" width="' + n[2] + '" height="' + n[3] + '"', n[5], 1.8);
      for (var l = 0; l < 3; l++) { var ly = ny + 22 + l * 13; if (ly < ny + n[3] - 8) body += line("M" + (nx + 9) + " " + ly + " H" + (nx + n[2] - 9 - l * 7), 1.3, 0.5); }
      cork += '<g transform="rotate(' + n[4] + " " + ncx + " " + ncy + ')">' + body + "</g>" + '<circle cx="' + ncx + '" cy="' + (ny + 7) + '" r="7" style="fill:' + n[6] + ';stroke:var(--ink);stroke-width:1.8"/><circle cx="' + (ncx - 2.4) + '" cy="' + (ny + 4.6) + '" r="2" style="fill:#fff;opacity:.8"/>';
    });
    s += hot("the idea board", cork, [L.cx, 125, L.cw, 230], L.cx - 10);
    return s + paidTag(L.cx + L.cw - 64, 336, 5);
  }

  /* The composition notebook: cloth spine, marbled cover, cushion label */
  function cushion(x, y, w, h, r) {
    return "M" + (x + r) + " " + y + " H" + (x + w - r) + " A" + r + " " + r + " 0 0 0 " + (x + w) + " " + (y + r) + " V" + (y + h - r) + " A" + r + " " + r + " 0 0 0 " + (x + w - r) + " " + (y + h) +
      " H" + (x + r) + " A" + r + " " + r + " 0 0 0 " + x + " " + (y + h - r) + " V" + (y + r) + " A" + r + " " + r + " 0 0 0 " + (x + r) + " " + y + " Z";
  }
  function nameOnLabel(cx, cy, name) {
    var parts = name.toUpperCase().split(" "), sz = parts.length > 1 ? 13 : 16, s = "";
    parts.forEach(function (p, i) { s += T(cx, cy + (i - (parts.length - 1) / 2) * sz * 1.05 + sz * 0.34, p, "font:700 " + sz + "px var(--font-label);letter-spacing:1px;fill:var(--ink)", 'text-anchor="middle"'); });
    return s;
  }
  function compCover(x, y, w, h, o, sw) {
    var s = reg("rect", 'x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4"', "url(#m" + o.cover + ")", sw || 3) +
      reg("rect", 'x="' + x + '" y="' + y + '" width="' + Math.round(w * 0.13) + '" height="' + h + '"', "url(#cloth)", 2);
    var lw = w * 0.66, lh = h * 0.34, lx = x + w * 0.24, ly = y + h * 0.17;
    s += reg("path", 'class="lbl" d="' + cushion(lx, ly, lw, lh, 7) + '"', "#fbfaf6", 2) + '<path d="' + cushion(lx + 3, ly + 3, lw - 6, lh - 6, 5) + '" style="fill:none;stroke:var(--ink);stroke-width:1"/>';
    s += nameOnLabel(lx + lw / 2, ly + lh * 0.36, o.name) + line("M" + (lx + 8) + " " + (ly + lh * 0.7) + " H" + (lx + lw - 8) + " M" + (lx + 8) + " " + (ly + lh * 0.86) + " H" + (lx + lw - 8), 1, 0.7);
    return s;
  }
  function notebook(cx, o) {
    var dim = o.depth === "dim", s = line("M" + (cx + 48) + " 456 L" + (cx + 34) + " 312", 9, 1) + line("M" + (cx + 48) + " 456 L" + (cx + 34) + " 312", 5, 1, "var(--wood)");
    if (dim) {
      var x0 = cx - 55, x1 = cx + 55, y0 = 300, y1 = 450, d = 24, EG = "#b8b2a4";
      /* the stand's foot and ledge: tops and the right sides (left of centre) */
      s += block(cx - 68, 458, cx + 68, 470, 50, { side: "var(--wood-dark)", top: "var(--wood)" }) + block(cx - 64, 440, cx + 64, 458, 46, { side: "var(--wood)", top: "var(--wood-hi)" });
      /* a slim page block: plain white top and right edge, thin ink, a fine grey line for each cover board; the cloth spine wraps the left end */
      s += face([[x0, y0], [x1, y0], P(x1, y0, d), P(x0, y0, d)], "var(--page)", 1.3) + face([[x1, y0], [x1, y1], P(x1, y1, d), P(x1, y0, d)], "var(--page)", 1.3);
      [3, d - 3].forEach(function (cd) { var a1 = P(x0 + 12, y0, cd), a2 = P(x1, y0, cd), a3 = P(x1, y1 - 1, cd);
        s += line("M" + a1[0].toFixed(1) + " " + a1[1].toFixed(1) + " L" + a2[0].toFixed(1) + " " + a2[1].toFixed(1) + " L" + a3[0].toFixed(1) + " " + a3[1].toFixed(1), 0.9, 1, EG); });
      s += face([[x0, y0], [x0 + 12, y0], P(x0 + 12, y0, d), P(x0, y0, d)], "#3a3733", 1);
    }
    s += compCover(cx - 55, 300, 110, 150, o);
    s += reg("rect", 'x="' + (cx - 64) + '" y="440" width="128" height="18" rx="2"', "var(--wood)", 2.6) + reg("rect", 'x="' + (cx - 68) + '" y="458" width="136" height="12" rx="2"', "var(--wood-dark)", 2.6);
    return s;
  }
  function lab(o) { return hatch(LAB - 66, 470, 140, 6) + hot("the notebook", notebook(LAB, o), [LAB - 70, 292, 140, 178]) + paidTag(LAB + 6, 420, -5); }

  function puffPath(L, Tk) {
    var n = Math.max(3, Math.round(L / 16)), r = Tk * 0.46, y0 = Tk * 0.1, y1 = Tk * 0.9, seg = (L - 2 * r) / n, d = "M" + r + " " + y0;
    for (var i = 0; i < n; i++) d += " Q" + (r + i * seg + seg / 2).toFixed(1) + " " + (y0 - Tk * 0.16).toFixed(1) + " " + (r + (i + 1) * seg).toFixed(1) + " " + y0;
    d += " A" + r.toFixed(1) + " " + (Tk * 0.42).toFixed(1) + " 0 0 1 " + (L - r).toFixed(1) + " " + y1;
    for (var j = n - 1; j >= 0; j--) d += " Q" + (r + j * seg + seg / 2).toFixed(1) + " " + (y1 + Tk * 0.12).toFixed(1) + " " + (r + j * seg).toFixed(1) + " " + y1;
    return d + " A" + r.toFixed(1) + " " + (Tk * 0.42).toFixed(1) + " 0 0 1 " + r.toFixed(1) + " " + y0 + " Z";
  }
  function glazePath(L, Tk) {
    var n = Math.max(3, Math.round(L / 16)), r = Tk * 0.46, y0 = Tk * 0.1, seg = (L - 2 * r) / n, base = Tk * 0.44;
    var d = "M" + (r * 0.45).toFixed(1) + " " + base.toFixed(1) + " C" + (r * 0.3).toFixed(1) + " " + (Tk * 0.14).toFixed(1) + " " + (r * 0.7).toFixed(1) + " " + y0.toFixed(1) + " " + r.toFixed(1) + " " + y0.toFixed(1);
    for (var i = 0; i < n; i++) d += " Q" + (r + i * seg + seg / 2).toFixed(1) + " " + (y0 - Tk * 0.16).toFixed(1) + " " + (r + (i + 1) * seg).toFixed(1) + " " + y0.toFixed(1);
    d += " C" + (L - r * 0.7).toFixed(1) + " " + y0.toFixed(1) + " " + (L - r * 0.3).toFixed(1) + " " + (Tk * 0.14).toFixed(1) + " " + (L - r * 0.45).toFixed(1) + " " + base.toFixed(1);
    var D = Math.max(4, Math.round(L / 12)), x0 = r * 0.45, span = L - r * 0.9;
    for (var k = D; k > 0; k--) { var xa = x0 + span * (k - 1) / D, xm = x0 + span * (k - 0.5) / D, depth = k % 3 === 1 ? Tk * 0.78 : (k % 2 ? Tk * 0.6 : Tk * 0.54); d += " Q" + xm.toFixed(1) + " " + depth.toFixed(1) + " " + xa.toFixed(1) + " " + base.toFixed(1); }
    return d + " Z";
  }
  var uidN = 0;
  function eclair(cx) {
    var bites = (O && O.bites) || 0, uid = "e" + (uidN++), Lg = 100, Tk = 30, bx = [200, 76, 46][Math.min(bites, 2)], s, pcy = 461, pry = 13;
    if (O && O.depth === "dim") {
      /* a round plate on the counter: its front and back found the same way as every other depth */
      var yF = CTR + (VPY - CTR) * kk(8), yB = CTR + (VPY - CTR) * kk(76); pcy = (yF + yB) / 2; pry = (yF - yB) / 2;
      s = reg("ellipse", 'cx="' + cx + '" cy="' + pcy.toFixed(1) + '" rx="60" ry="' + pry.toFixed(1) + '"', "var(--card)", 2.6) + '<ellipse cx="' + cx + '" cy="' + (pcy - 1).toFixed(1) + '" rx="45" ry="' + (pry * 0.74).toFixed(1) + '" style="fill:none;stroke:var(--blue);stroke-width:2"/>';
    } else s = hatch(cx - 58, 474, 120, 5) + reg("ellipse", 'cx="' + cx + '" cy="463" rx="70" ry="13"', "var(--card)", 2.6) + '<ellipse cx="' + cx + '" cy="462" rx="52" ry="8" style="fill:none;stroke:var(--blue);stroke-width:2"/>';
    function crumb(x, y, r) { return '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' + r + '" ry="' + (r * 0.65).toFixed(1) + '" style="fill:var(--amber);stroke:var(--ink);stroke-width:1.1"/>'; }
    var label = ["A whole eclair on a plate. Click to take a bite", "An eclair with one bite gone. Click to take another", "An eclair with two bites gone. Click to finish it", "An empty plate with crumbs and a smear of cream"][Math.min(bites, 3)], e = "";
    if (bites >= 3) {
      e += '<path d="M' + (cx - 34) + " " + (pcy + 1) + " q10 -8 30 -6 q22 1 26 5 q-8 6 -26 6 q-20 1 -30 -5 Z" + '" style="fill:var(--custard);stroke:#d9b65a;stroke-width:1"/>' +
        line("M" + (cx - 20) + " " + (pcy - 2) + " q16 -4 34 0", 4, 0.85, "var(--cinnamon)") + line("M" + (cx + 4) + " " + (pcy + 3) + " q10 2 20 -1", 2.4, 0.7, "var(--cinnamon)");
      [[-40, -3, 3.4], [-28, 6, 2.4], [24, -5, 3], [34, 3, 2.2], [12, 7, 2.6], [-8, -7, 2], [42, -1, 1.8]].forEach(function (c) { e += crumb(cx + c[0], pcy + c[1], c[2]); });
    } else {
      var bite = "M" + bx + " -12 Q" + (bx + 9) + " 1 " + (bx + 1) + " 8 Q" + (bx + 11) + " 15 " + (bx + 2) + " 22 Q" + (bx + 9) + " 29 " + bx + " 42";
      var body = '<defs><clipPath id="bite' + uid + '"><path d="M-6 -12 H' + bx + " " + bite.slice(bite.indexOf("Q")) + ' H-6 Z"/></clipPath><clipPath id="puff' + uid + '"><path d="' + puffPath(Lg, Tk) + '"/></clipPath></defs>';
      body += '<g clip-path="url(#bite' + uid + ')">' + reg("path", 'd="' + puffPath(Lg, Tk) + '"', "var(--amber)", 2.4);
      for (var c = 0; c < 3; c++) body += line("M" + (20 + c * 22) + " " + (Tk * 0.76) + " q5 -3 11 -1", 1.2, 0.55);
      body += reg("path", 'd="' + glazePath(Lg, Tk) + '"', "var(--cinnamon)", 2.1) + '<path d="M' + (Tk * 0.62) + " " + (Tk * 0.2) + ' q8 -2 16 0" style="fill:none;stroke:#fff4dc;stroke-width:2.4;stroke-linecap:round;opacity:.85"/></g>';
      if (bites > 0) body += '<g clip-path="url(#puff' + uid + ')"><path d="' + bite + " L" + (bx - 8) + " 42 L" + (bx - 8) + ' -12 Z" style="fill:var(--custard)"/>' + line(bite, 2.4) + "</g>";
      e += '<g class="ecl"><g transform="translate(' + (cx - 48) + " " + (pcy - 29).toFixed(1) + ')">' + body + "</g></g>";
      if (bites > 0) e += crumb(cx + 30, pcy - 1, 3.5) + crumb(cx + 40, pcy + 3, 2.5);
      if (bites > 1) e += crumb(cx + 10, pcy + 5, 2.6) + crumb(cx + 48, pcy - 3, 2) + '<path d="M' + (cx + 4) + " " + (pcy + 1) + ' q8 -3 16 0 q-8 3 -16 0 Z" style="fill:var(--custard)"/>';
    }
    return '<g class="eat' + (bites >= 3 ? " done" : "") + '" role="button" tabindex="0" aria-label="' + label + '">' + s + e + "</g>";
  }
  function closedBox(cx, o) {
    /* A recipe box, not a shoe box: one block with a flush hinged lid (a seam, not a cap), hinges at the back,
       a brass hasp over the seam, brass corner caps and the label holder. Right of centre: left side and top show. */
    var x = cx - 75, y0 = 370, seam = 394, y1 = 470, d = 62, dim = o.depth === "dim", b = "";
    if (dim) {
      b += block(x, y0, x + 150, y1, d, { side: "var(--blue-back)", top: "var(--blue-hi)" });
      var s0 = P(x, seam, d), t0 = P(x, y0, 3), t1 = P(x + 150, y0, 3);
      b += line("M" + x + " " + seam + " L" + s0[0].toFixed(1) + " " + s0[1].toFixed(1), 2) + line("M" + t0[0].toFixed(1) + " " + (t0[1] + 0.5).toFixed(1) + " L" + t1[0].toFixed(1) + " " + (t1[1] + 0.5).toFixed(1), 1.2, 0.4, "#fff");
      [32, 118].forEach(function (hx) { var h = P(x + hx, y0, d - 1); b += reg("rect", 'x="' + (h[0] - 10).toFixed(1) + '" y="' + (h[1] - 3).toFixed(1) + '" width="20" height="6" rx="3"', "var(--brass)", 1.4); });
    }
    b += reg("rect", 'x="' + x + '" y="' + y0 + '" width="150" height="' + (y1 - y0) + '" rx="4"', "var(--blue)") +
      '<rect x="' + (x + 6) + '" y="' + (seam + 6) + '" width="138" height="' + (y1 - seam - 12) + '" rx="2" style="fill:none;stroke:#fff;stroke-width:1.4;opacity:.35"/>' +
      line("M" + (x + 4) + " " + (y0 + 5) + " H" + (x + 146), 1.2, 0.45, "#fff") + line("M" + x + " " + seam + " H" + (x + 150), 2.2) + hatch(x + 2, seam + 2, 146, 4, 0.7);
    /* brass corner caps on the front */
    [[x, y0, 1, 1], [x + 150, y0, -1, 1], [x, y1, 1, -1], [x + 150, y1, -1, -1]].forEach(function (c) {
      b += reg("path", 'd="M' + c[0] + " " + c[1] + " h" + (12 * c[2]) + " L" + c[0] + " " + (c[1] + 12 * c[3]) + ' Z"', "var(--brass)", 1.4); });
    /* hasp: a plate on the lid over the seam, onto a staple on the body */
    b += reg("rect", 'x="' + (cx - 8) + '" y="' + (seam + 4) + '" width="16" height="8" rx="2"', "var(--brass)", 1.4) +
      reg("path", 'd="M' + (cx - 10) + " " + (seam - 12) + " H" + (cx + 10) + " V" + (seam + 6) + " Q" + cx + " " + (seam + 14) + " " + (cx - 10) + " " + (seam + 6) + ' Z"', "var(--brass)", 1.8) +
      '<circle cx="' + cx + '" cy="' + (seam + 2) + '" r="2.2" style="fill:var(--ink)"/>' + brassLabel(cx, 436, 80, 32, "Recipes", 21);
    return hatch(x + 3, y1, 152, 6) + hot("the recipe box", b, dim ? [x - 12, 346, 166, 128] : [x - 6, 364, 162, 110]);
  }
  function middle(o) { return lab(o) + eclair((LAB + 60 + BOX - 75) / 2) + closedBox(BOX, o); }

  /* A towel folded over a brass bar on a door; a torn notepad sheet held by a magnet */
  function towel(tx, y) {
    var s = reg("rect", 'x="' + (tx - 40) + '" y="' + (y - 6) + '" width="7" height="14" rx="2"', "var(--brass)", 1.6) + reg("rect", 'x="' + (tx + 33) + '" y="' + (y - 6) + '" width="7" height="14" rx="2"', "var(--brass)", 1.6) +
      line("M" + (tx - 36) + " " + y + " H" + (tx + 36), 5, 1) + line("M" + (tx - 36) + " " + y + " H" + (tx + 36), 2.6, 1, "var(--brass)");
    s += reg("path", 'd="M' + (tx - 27) + " " + y + " V" + (y + 86) + " q27 7 54 0 V" + y + ' Z"', "var(--card)", 2) + line("M" + (tx - 27) + " " + (y + 70) + " q27 6 54 0", 3, 0.9, "var(--blue)");
    s += reg("path", 'd="M' + (tx - 28) + " " + (y + 1) + " Q" + (tx - 28) + " " + (y - 9) + " " + (tx - 18) + " " + (y - 9) + " H" + (tx + 18) + " Q" + (tx + 28) + " " + (y - 9) + " " + (tx + 28) + " " + (y + 1) + " V" + (y + 30) + " H" + (tx - 28) + ' Z"', "var(--card)", 2) +
      line("M" + (tx - 27) + " " + (y + 14) + " H" + (tx + 27) + " M" + (tx - 27) + " " + (y + 21) + " H" + (tx + 27), 3, 0.9, "var(--blue)") + hatch(tx - 26, y + 31, 52, 5, 0.6);
    return s;
  }
  /* "Recently": a torn notepad sheet taped to the door; each name links to its recipe card or notebook entry */
  function madeNote(nx, y, onIdx) {
    var w = 158, h = 142, x = nx - w / 2, top = "M" + x + " " + (y + 6);
    for (var i = 0; i <= 14; i++) top += " L" + (x + i * w / 14).toFixed(1) + " " + (y + (i % 2 ? 0 : 6));
    var s = '<g transform="rotate(-2 ' + nx + " " + (y + h / 2) + ')">' + hatch(x + 5, y + 6, w, h, 0.45) + reg("path", 'd="' + top + " V" + (y + h) + " H" + x + ' Z"', "var(--card)", 2);
    for (var l = y + 50; l < y + h - 6; l += 26) s += line("M" + (x + 8) + " " + l + " H" + (x + w - 8), 1, 0.8, "#c3d2ec");
    s += T(nx, y + 38, "Recently", "font:700 23px var(--font-hand);fill:var(--ink)", 'text-anchor="middle"');
    [["Blondies", "Tue", "the Blondies recipe card"], ["Croissants T4", "Sat", "the notebook entry Trial 4: croissants"], ["Galette", "Sun", "the Galette recipe card"]].forEach(function (it, k) {
      var by = y + 72 + k * 26, tw = it[0].length * 8.6;
      s += '<g class="lnk' + (onIdx === k ? " on" : "") + '" tabindex="0" role="link" aria-label="Open ' + it[2] + '">' +
        '<rect class="lk-hi" x="' + (x + 6) + '" y="' + (by - 19) + '" width="' + (tw + 10) + '" height="25" rx="3" style="fill:var(--yellow);stroke:var(--ink);stroke-width:1.4"/>' +
        T(x + 11, by, it[0], "font:600 20px var(--font-hand);fill:var(--ink)") + '<g class="lk-hi">' + line("M" + (x + 11) + " " + (by + 3) + " H" + (x + 11 + tw), 2, 1) + "</g></g>" +
        T(x + w - 9, by, it[1], "font:600 17px var(--font-hand);fill:var(--ink-soft)", 'text-anchor="end"');
    });
    /* a strip of tape over the torn edge */
    s += '<rect x="' + (nx - 30) + '" y="' + (y - 8) + '" width="60" height="20" transform="rotate(-5 ' + nx + " " + (y + 2) + ')" style="fill:#e8e0c8;opacity:.88;stroke:#b9a77a;stroke-width:1.2"/>';
    return s + "</g>";
  }

  /* "Recently", four more ways. Each name links to its page; pointing turns it yellow with an underline. */
  var RECENT = [["Blondies", "Tue", "the Blondies recipe card", ""], ["Croissants", "Sat", "the notebook entry Trial 4: croissants", "trial 4"], ["Galette", "Sun", "the Galette recipe card", ""]];
  function lk(x, by, txt, fs, on, label, opt) {
    opt = opt || {}; var tw = txt.length * fs * (opt.cw || 0.42), anchor = opt.mid ? 'text-anchor="middle"' : "", lx = opt.mid ? x - tw / 2 : x, col = opt.col || "var(--ink)";
    var hi = opt.chalk ? '<g class="lk-hi">' + T(x, by, txt, "font:700 " + fs + "px var(--font-hand);fill:var(--yellow)", anchor) + "</g>"
      : '<rect class="lk-hi" x="' + (lx - 4) + '" y="' + (by - fs * 0.92) + '" width="' + (tw + 8) + '" height="' + (fs * 1.22) + '" rx="3" style="fill:var(--yellow);stroke:var(--ink);stroke-width:1.2"/>';
    return '<g class="lnk' + (on ? " on" : "") + '" tabindex="0" role="link" aria-label="Open ' + label + '">' + (opt.chalk ? "" : hi) +
      T(x, by, txt, "font:600 " + fs + "px var(--font-hand);fill:" + col, anchor) + (opt.chalk ? hi : "") +
      '<g class="lk-hi">' + line("M" + lx + " " + (by + 3) + " H" + (lx + tw), 1.8, 1, opt.chalk ? "var(--yellow)" : "var(--ink)") + "</g></g>";
  }
  function tapeLabel(cx, y, text, rot) {
    return '<g transform="rotate(' + (rot || -3) + " " + cx + " " + y + ')"><rect x="' + (cx - 44) + '" y="' + (y - 13) + '" width="88" height="24" style="fill:#e8e0c8;opacity:.95;stroke:#b9a77a;stroke-width:1.2"/>' +
      T(cx, y + 5, text, "font:700 18px var(--font-hand);fill:var(--ink)", 'text-anchor="middle"') + "</g>";
  }
  function recent(kind, dx, dw, onIdx) {
    var cx = dx + dw / 2, s = "";
    if (kind === "ticket") {
      /* an order rail, like a restaurant pass: tickets slid under a steel bar */
      s += reg("rect", 'x="' + (dx + 8) + '" y="540" width="' + (dw - 16) + '" height="11" rx="2"', "#cfccc3", 2) + line("M" + (dx + 12) + " 543.5 H" + (dx + dw - 12), 1.2, 0.8, "#fff");
      RECENT.forEach(function (it, k) { var tx = dx + 5 + k * 57, rot = [-2, 1.5, -1][k];
        s += '<g transform="rotate(' + rot + " " + (tx + 28) + ' 548)">' + hatch(tx + 4, 549, 52, 98, 0.35) + reg("rect", 'x="' + tx + '" y="545" width="56" height="98"', "#fffdf5", 1.6) +
          line("M" + (tx + 4) + " 572 H" + (tx + 52), 1, 0.8, "#c9442a") + T(tx + 28, 566, it[1].toUpperCase(), "font:700 10px var(--font-label);letter-spacing:1.5px;fill:var(--ink-soft)", 'text-anchor="middle"') +
          lk(tx + 28, 596, it[0], 15, onIdx === k, it[2], { mid: true, cw: 0.36 }) + (it[3] ? T(tx + 28, 614, it[3], "font:600 13px var(--font-hand);fill:var(--ink-soft)", 'text-anchor="middle"') : "") + "</g>"; });
      s += reg("rect", 'x="' + (dx + 8) + '" y="540" width="' + (dw - 16) + '" height="11" rx="2"', "#cfccc3", 2) + tapeLabel(cx, 530, "Recently", -2);
    } else if (kind === "line") {
      /* a string between two screw eyes, little cards on clothespins */
      var ya = 548, sag = 14;
      s += tapeLabel(cx, 530, "Recently", 2) + '<circle cx="' + (dx + 12) + '" cy="' + ya + '" r="4" style="fill:none;stroke:var(--brass);stroke-width:2.4"/><circle cx="' + (dx + dw - 12) + '" cy="' + ya + '" r="4" style="fill:none;stroke:var(--brass);stroke-width:2.4"/>' +
        line("M" + (dx + 12) + " " + ya + " Q" + cx + " " + (ya + 2 * sag) + " " + (dx + dw - 12) + " " + ya, 1.6, 1, "#8a8478");
      RECENT.forEach(function (it, k) { var tx = dx + 10 + k * 54, mid = tx + 28, u = (mid - dx - 12) / (dw - 24), py = ya + 2 * sag * 2 * u * (1 - u), rot = [3, -1, -3][k];
        s += '<g transform="rotate(' + rot + " " + mid + " " + py + ')">' + reg("rect", 'x="' + tx + '" y="' + (py + 4) + '" width="52" height="52"', "var(--card)", 1.6) + line("M" + (tx + 4) + " " + (py + 16) + " H" + (tx + 48), 1, 0.8, "#c9442a") +
          line("M" + (tx + 4) + " " + (py + 44) + " H" + (tx + 48), 1, 0.8, "#c3d2ec") +
          lk(mid, py + 36, it[0], 13, onIdx === k, it[2], { mid: true, cw: 0.42 }) + T(mid, py + 52, it[1], "font:600 11px var(--font-hand);fill:var(--ink-soft)", 'text-anchor="middle"') +
          reg("rect", 'x="' + (mid - 3.5) + '" y="' + (py - 6) + '" width="7" height="18" rx="1.5"', "var(--wood-hi)", 1.4) + "</g>"; });
    } else if (kind === "slate") {
      /* a small chalk slate on a string from a brass hook */
      var w = 146, h = 116, x = cx - w / 2, y = 552;
      s += reg("circle", 'cx="' + cx + '" cy="528" r="4"', "var(--brass)", 1.6) + line("M" + (x + 22) + " " + y + " L" + cx + " 528 L" + (x + w - 22) + " " + y, 1.6, 1, "#8a8478") + hatch(x + 5, y + 5, w, h, 0.4) +
        reg("rect", 'x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3"', "var(--wood)", 2) + reg("rect", 'x="' + (x + 8) + '" y="' + (y + 8) + '" width="' + (w - 16) + '" height="' + (h - 16) + '"', "#2f3b34", 1.6) +
        '<path d="M' + (x + 20) + " " + (y + 90) + ' q30 -6 60 2" style="fill:none;stroke:#fff;stroke-width:6;opacity:.06"/>' +
        T(cx, y + 32, "Recently", "font:700 20px var(--font-hand);fill:#f1efe6", 'text-anchor="middle"');
      RECENT.forEach(function (it, k) { var by = y + 56 + k * 20;
        s += lk(x + 18, by, it[0], 16, onIdx === k, it[2], { chalk: true, col: "#f1efe6", cw: 0.4 }) + T(x + w - 16, by, it[1], "font:600 14px var(--font-hand);fill:#c9c7bd", 'text-anchor="end"'); });
    } else if (kind === "card") {
      /* a recipe index card in a binder clip, hung on a small hook */
      var w2 = 154, h2 = 100, x2 = cx - w2 / 2, y2 = 548;
      s += reg("circle", 'cx="' + cx + '" cy="528" r="3.5"', "var(--brass)", 1.4) + '<g transform="rotate(-1.5 ' + cx + " " + (y2 + h2 / 2) + ')">' + hatch(x2 + 5, y2 + 5, w2, h2, 0.4) +
        reg("rect", 'x="' + x2 + '" y="' + y2 + '" width="' + w2 + '" height="' + h2 + '" rx="1.5"', "var(--card)", 1.8) + line("M" + (x2 + 4) + " " + (y2 + 30) + " H" + (x2 + w2 - 4), 1.3, 1, "#c9442a");
      for (var l = y2 + 52; l < y2 + h2; l += 20) s += line("M" + (x2 + 4) + " " + l + " H" + (x2 + w2 - 4), 1, 0.8, "#c3d2ec");
      s += T(x2 + 12, y2 + 24, "Recently", "font:700 19px var(--font-hand);fill:var(--ink)");
      RECENT.forEach(function (it, k) { var by = y2 + 48 + k * 20;
        s += lk(x2 + 12, by, it[0] + (it[3] ? " T4" : ""), 15, onIdx === k, it[2], { cw: 0.4 }) + T(x2 + w2 - 10, by, it[1], "font:600 14px var(--font-hand);fill:var(--ink-soft)", 'text-anchor="end"'); });
      s += "</g>" + reg("path", 'd="M' + (cx - 16) + " " + (y2 - 6) + " H" + (cx + 16) + " L" + (cx + 13) + " " + (y2 + 12) + " H" + (cx - 13) + ' Z"', "var(--ink)", 1.4) +
        line("M" + (cx - 9) + " " + (y2 - 6) + " L" + (cx - 4) + " 530 M" + (cx + 9) + " " + (y2 - 6) + " L" + (cx + 4) + " 530", 1.6, 1, "#9a968c");
    }
    return s;
  }
  /* "Recently", up off the floor: a torn notepad sheet, taped (magnets later), on the wall or on the side of a fridge */
  function recentSheet(nx, y, w, onIdx) {
    var h = 150, x = nx - w / 2, top = "M" + x + " " + (y + 6), n = Math.round(w / 10);
    for (var i = 0; i <= n; i++) top += " L" + (x + i * w / n).toFixed(1) + " " + (y + (i % 2 ? 0 : 6));
    var s = '<g transform="rotate(-2 ' + nx + " " + (y + h / 2) + ')">' + hatch(x + 5, y + 6, w, h, 0.4) + reg("path", 'd="' + top + " V" + (y + h) + " H" + x + ' Z"', "var(--card)", 2);
    for (var l = y + 52; l < y + h - 6; l += 28) s += line("M" + (x + 8) + " " + l + " H" + (x + w - 8), 1, 0.8, "#c3d2ec");
    s += T(nx, y + 40, "Recently", "font:700 23px var(--font-hand);fill:var(--ink)", 'text-anchor="middle"');
    RECENT.forEach(function (it, k) { var by = y + 76 + k * 28;
      s += lk(x + 10, by, it[0], 19, onIdx === k, it[2], { cw: 0.42 }) + T(x + w - 9, by, it[1], "font:600 16px var(--font-hand);fill:var(--ink-soft)", 'text-anchor="end"'); });
    s += '<rect x="' + (nx - 30) + '" y="' + (y - 8) + '" width="60" height="20" transform="rotate(-5 ' + nx + " " + (y + 2) + ')" style="fill:#e8e0c8;opacity:.88;stroke:#b9a77a;stroke-width:1.2"/>';
    return s + "</g>";
  }
  /* Part of a fridge at one edge, standing on the floor beside the counter's end. Its side runs back to the wall,
     so like every other side it points at the vanishing point. The front holds the "Recently" sheet. */
  function fridge(side, L, o) {
    var fx = side === "R" ? L.e1 : L.e0, y0 = 76, y1 = 764, fw = 260, x0 = side === "R" ? fx : fx - fw, s = "", hx = side === "R" ? fx + 16 : fx - 22;
    /* only the part above the counter top shows: below it the counter and cabinets butt against the fridge */
    if (o.depth === "dim") s += face([[fx, y0], [fx, CTR], P(fx, CTR, CTR_D), P(fx, y0, CTR_D)], "#d6d3c8", 2);
    s += reg("rect", 'x="' + x0 + '" y="' + y0 + '" width="' + fw + '" height="' + (y1 - y0) + '" rx="12"', "#f4f2ec", 2.6) + line("M" + x0 + " 262 H" + (x0 + fw), 2.4) +
      reg("rect", 'x="' + x0 + '" y="736" width="' + fw + '" height="28"', "#cfccc3", 2.2) + line("M" + (x0 + 10) + " 744 H" + (x0 + fw - 10) + " M" + (x0 + 10) + " 752 H" + (x0 + fw - 10), 1.2, 0.6);
    s += reg("rect", 'x="' + hx + '" y="150" width="7" height="86" rx="3.5"', "#cfccc3", 1.8) + reg("rect", 'x="' + hx + '" y="290" width="7" height="140" rx="3.5"', "#cfccc3", 1.8);
    var mid = side === "R" ? fx + (Math.min(L.vp[1], fx + fw) - fx) / 2 + 6 : fx - (fx - Math.max(L.vp[0], fx - fw)) / 2 - 6;
    return s + recentSheet(mid, 300, 128, o.linkOn);
  }
  function counterAndShelf(L, o) {
    var vp = L.vp, x0 = vp[0] - 20, W = vp[1] - vp[0] + 40, sx = L.shX, sw = L.shW, dim = o.depth === "dim", s = "";
    /* the counter top runs off both edges, so its back edge is level; its depth is found like every other */
    if (dim) { var yb = CTR + (VPY - CTR) * kk(CTR_D);
      s += reg("rect", 'x="' + x0 + '" y="' + yb.toFixed(1) + '" width="' + W + '" height="' + (CTR - yb).toFixed(1) + '"', "var(--wood-hi)", 2.2) + grain(x0, yb + 4, W, CTR - yb - 8, 11) + grain(x0 + 60, yb + 20, W, CTR - yb - 24, 12) +
        reg("rect", 'x="' + x0 + '" y="' + CTR + '" width="' + W + '" height="12"', "var(--wood)") + reg("rect", 'x="' + x0 + '" y="486" width="' + W + '" height="9"', "var(--wood-dark)", 2.4); }
    else s += reg("rect", 'x="' + x0 + '" y="470" width="' + W + '" height="16"', "var(--wood)") + grain(x0, 471, W, 14, 11) + reg("rect", 'x="' + x0 + '" y="486" width="' + W + '" height="9"', "var(--wood-dark)", 2.4);
    s += reg("rect", 'x="' + x0 + '" y="495" width="' + (sx - x0) + '" height="245"', "var(--cab)") + reg("rect", 'x="' + (sx + sw) + '" y="495" width="' + (vp[1] + 20 - sx - sw) + '" height="245"', "var(--cab)");
    var doorsAt = [];
    function doors(a0, a1, knobRight) { var g = 14, dw = (a1 - a0 - 3 * g) / 2, out = "";
      for (var k = 0; k < 2; k++) { var dx = a0 + g + k * (dw + g); doorsAt.push([dx, dw]);
        out += reg("rect", 'x="' + dx + '" y="508" width="' + dw + '" height="220" rx="4"', "var(--cab-hi)", 2.2);
        /* set-in panel: its bottom ledge and the inner wall on the outer side face the eye; the top lip casts a shadow */
        if (dim) out += recess(dx + 16, 524, dx + dw - 16, 712, 9, "var(--cab-hi)", { side: "var(--cab)", bottom: "color-mix(in srgb, var(--cab-hi) 70%, #fff)" }, hatch(dx + 16, 524, dw - 32, 6)) +
          reg("rect", 'x="' + (dx + 16) + '" y="524" width="' + (dw - 32) + '" height="188"', "none", 1.6);
        else out += reg("rect", 'x="' + (dx + 16) + '" y="524" width="' + (dw - 32) + '" height="188" rx="2"', "var(--cab-hi)", 1.6);
        out += reg("circle", 'cx="' + (knobRight ? dx + dw - 26 : dx + 26) + '" cy="540" r="6"', "var(--brass)", 1.8) + '<circle cx="' + ((knobRight ? dx + dw - 26 : dx + 26) - 2) + '" cy="538" r="1.8" style="fill:#fff;opacity:.7"/>'; }
      return out; }
    s += doors(L.e0, sx, true) + doors(sx + sw, L.e1, false);
    s += hatch(x0, 495, sx - x0, 7) + hatch(sx + sw, 495, vp[1] + 20 - sx - sw, 7);
    s += towel(doorsAt[0][0] + doorsAt[0][1] / 2, 566);
    if (o.made === "cab") s += madeNote(doorsAt[2][0] + doorsAt[2][1] / 2, 552, o.linkOn);
    s += reg("rect", 'x="' + sx + '" y="495" width="' + sw + '" height="245"', "var(--cab-deep)");
    /* the shelf is centred on the vanishing point: both inner walls show, and each tier's floor; the ceilings don't */
    var SH = { side: "var(--cab-side)", bottom: "var(--wood-hi)" }, SL = { side: "var(--cab-side)", bottom: "color-mix(in srgb, var(--cab-deep) 72%, #fff)" };
    if (dim) s += recess(sx, 495, sx + sw, 610, 50, "var(--cab-deep)", SH) + recess(sx, 624, sx + sw, 740, 50, "var(--cab-deep)", SL);
    /* a book: in depth its top (page edges) and the side facing the centre show */
    function bk(x, y, w, h, fill, rx) { return (dim ? block(x, y, x + w, y + h, 40, { top: w > h ? "color-mix(in srgb, " + fill + " 72%, #fff)" : "#f6efdc", side: "color-mix(in srgb, " + fill + " 72%, #000)" }) : "") + reg("rect", 'x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 1.5) + '"', fill, 2.2); }
    function inTier(y0, y1, inner) { return dim ? clipTo(sx, y0, sx + sw, y1, inner) : inner; }
    var top = "", books = [[22, 18, 96, "var(--orange)"], [41, 25, 104, "var(--card)"], [67, 16, 88, "var(--blue)"], [84, 22, 100, "var(--yellow)"]];
    books.forEach(function (b, k) { var bx = sx + b[0], by = 610 - b[2];
      top += bk(bx, by, b[1], b[2], b[3]) + line("M" + (bx + 2) + " " + (by + 8) + " H" + (bx + b[1] - 2) + " M" + (bx + 2) + " " + (by + b[2] - 10) + " H" + (bx + b[1] - 2), 1.2, 0.7);
      if (k % 2 === 0) top += reg("rect", 'x="' + (bx + 3) + '" y="' + (by + 18) + '" width="' + (b[1] - 6) + '" height="10"', "var(--card)", 1.4); else top += line("M" + (bx + b[1] / 2) + " " + (by + 22) + " V" + (by + 60), 1.2, 0.6); });
    top += bk(sx + 112, 588, 108, 22, "var(--stem)") + reg("rect", 'x="' + (sx + 128) + '" y="592" width="34" height="14"', "var(--card)", 1.2);
    s += hot("the cookbooks", inTier(495, 610, top) + brassLabel(sx + sw - 70, 520, 100, 28, "Cookbooks", 19), [sx + 6, 499, sw - 12, 112]);
    var low = bk(sx + 22, 634, 20, 106, "var(--amber)") + bk(sx + 44, 646, 34, 94, "var(--card)", 2) +
      '<circle cx="' + (sx + 61) + '" cy="704" r="6" style="fill:var(--paper);stroke:var(--ink);stroke-width:1.6"/>' + bk(sx + 84, 718, 100, 22, "var(--blue)");
    s += hot("the references", inTier(624, 740, low) + brassLabel(sx + sw - 70, 650, 104, 28, "References", 19), [sx + 6, 626, sw - 12, 112]);
    s += reg("rect", 'x="' + sx + '" y="610" width="' + sw + '" height="14"', "var(--wood)", 2.4) + hatch(sx + 2, 495, sw - 4, 8) + hatch(sx + 2, 624, sw - 4, 8);
    s += reg("rect", 'x="' + sx + '" y="495" width="' + sw + '" height="245"', "none", 3) + paidTag(sx + sw - 70, 566, -3);
    return s + reg("rect", 'x="' + x0 + '" y="740" width="' + W + '" height="24"', "var(--wood-dark)", 2.4);
  }
  function wall(L, o) {
    var vp = L.vp, s = '<rect x="' + (vp[0] - 20) + '" y="0" width="' + (vp[1] - vp[0] + 40) + '" height="472" style="fill:var(--plaster)"/>';
    if (o.tile === "quiet") s += '<rect x="' + (vp[0] - 20) + '" y="392" width="' + (vp[1] - vp[0] + 40) + '" height="80" style="fill:url(#tile)"/>' + line("M" + (vp[0] - 20) + " 392 H" + (vp[1] + 20), 1.6, 0.6);
    var ox = BOX + 132, oy = o.depth === "dim" ? 368 : 404;
    var lc = (L.vp[0] + L.bx - 10) / 2, rc = (L.bx + L.bw + 10 + L.vp[1]) / 2;
    if (o.sides === "wp" || o.sides === "pw") s += o.sides === "wp" ? windowAt(lc, o) + pegboard(rc, o) : pegboard(lc, o) + windowAt(rc, o);
    if (o.sides === "win") s += windowAt(lc, o, 92);
    if (o.made === "wall") s += recentSheet(lc, 120, 132, o.linkOn);
    if (o.made === "fridgeR") return s;
    return s + reg("rect", 'x="' + ox + '" y="' + oy + '" width="30" height="44" rx="3"', "var(--card)", 2) + line("M" + (ox + 10) + " " + (oy + 12) + " v7 M" + (ox + 20) + " " + (oy + 12) + " v7 M" + (ox + 10) + " " + (oy + 27) + " v7 M" + (ox + 20) + " " + (oy + 27) + " v7", 2);
  }
  /* A window set into the wall: the reveal shows the inner walls facing the eye, a sill shows its top. Sky, a patch of sun, a pot of herbs. */
  function windowAt(cx, o, ww) {
    var dim = o.depth === "dim", w = ww || 168, x0 = cx - w / 2, x1 = cx + w / 2, y0 = 108, y1 = 300, t = 14, s = "", sky = o.night ? "#26304d" : "#cfe2ea";
    s += reg("rect", 'x="' + (x0 - t) + '" y="' + (y0 - t) + '" width="' + (w + 2 * t) + '" height="' + (y1 - y0 + 2 * t) + '" rx="2"', "#f7f2e4", 2.2);
    var glass = o.night ? '<circle cx="' + (x0 + w * 0.7) + '" cy="' + (y0 + 40) + '" r="11" style="fill:#f6eccb"/><circle cx="' + (x0 + w * 0.7 + 6) + '" cy="' + (y0 + 36) + '" r="10" style="fill:#26304d"/>' +
      [[0.2, 30], [0.35, 70], [0.15, 120], [0.6, 150], [0.8, 100]].map(function (st) { return '<circle cx="' + (x0 + w * st[0]).toFixed(1) + '" cy="' + (y0 + st[1]) + '" r="1.6" style="fill:#f6eccb"/>'; }).join("")
      : '<rect x="' + (x0 + 30) + '" y="' + (y0 + 20) + '" width="' + Math.min(70, w - 40) + '" height="60" style="fill:url(#sun);opacity:.9"/>';
    if (dim) { var a = P(x0, y0, 26), c = P(x1, y1, 26);
      s += recess(x0, y0, x1, y1, 26, sky, { side: "#dfe0cf", top: "#cfd1bf", bottom: "#f3f4e6" }, glass +
        line("M" + ((a[0] + c[0]) / 2).toFixed(1) + " " + a[1].toFixed(1) + " V" + c[1].toFixed(1) + " M" + a[0].toFixed(1) + " " + ((a[1] + c[1]) / 2).toFixed(1) + " H" + c[0].toFixed(1), 7, 1) +
        line("M" + ((a[0] + c[0]) / 2).toFixed(1) + " " + a[1].toFixed(1) + " V" + c[1].toFixed(1) + " M" + a[0].toFixed(1) + " " + ((a[1] + c[1]) / 2).toFixed(1) + " H" + c[0].toFixed(1), 3.6, 1, "#f7f2e4")) +
        reg("rect", 'x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + (y1 - y0) + '"', "none", 2) +
        block(x0 - t - 8, y1 + t, x1 + t + 8, y1 + t + 11, 30, { side: "#e6e0cf", top: "#fbf8ee" });
    } else s += reg("rect", 'x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + (y1 - y0) + '"', sky, 2) + glass + line("M" + cx + " " + y0 + " V" + y1 + " M" + x0 + " " + ((y0 + y1) / 2) + " H" + x1, 7, 1) + line("M" + cx + " " + y0 + " V" + y1 + " M" + x0 + " " + ((y0 + y1) / 2) + " H" + x1, 3.6, 1, "#f7f2e4");
    s += reg("rect", 'x="' + (x0 - t - 8) + '" y="' + (y1 + t) + '" width="' + (w + 2 * t + 16) + '" height="11" rx="2"', "#f7f2e4", 2);
    /* herbs in a pot on the sill */
    var px = x1 - 34, py = y1 + t;
    s += line("M" + (px - 6) + " " + (py - 26) + " q-8 -18 -4 -34 M" + px + " " + (py - 26) + " q2 -22 -2 -40 M" + (px + 6) + " " + (py - 26) + " q10 -14 8 -30", 2.4, 1, "var(--stem)");
    [[-12, -52], [-4, -64], [6, -58], [12, -46], [-10, -40]].forEach(function (l) { s += reg("ellipse", 'cx="' + (px + l[0]) + '" cy="' + (py + l[1]) + '" rx="6" ry="4"', "var(--stem)", 1.4); });
    s += reg("path", 'd="M' + (px - 16) + " " + (py - 28) + " H" + (px + 16) + " L" + (px + 12) + " " + py + " H" + (px - 12) + ' Z"', "var(--orange)", 2) + reg("rect", 'x="' + (px - 18) + '" y="' + (py - 32) + '" width="36" height="7" rx="1.5"', "var(--orange)", 2);
    return s;
  }
  /* A pegboard on a spacer: right of centre it shows a thin left side. Room for equipment as it's earned. */
  function pegboard(cx, o) {
    var w = 176, x0 = cx - w / 2, x1 = cx + w / 2, y0 = 104, y1 = 318, s = "";
    if (o.depth === "dim") s += block(x0, y0, x1, y1, 12, { side: "#b48d58" });
    s += reg("rect", 'x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + (y1 - y0) + '" rx="2"', "url(#peg)", 2.4);
    function hook(hx, hy) { return line("M" + hx + " " + hy + " v6 q0 6 6 6", 2.4, 1, "#6e6a62"); }
    /* rolling pin on two hooks */
    s += hook(x0 + 36, y0 + 22) + hook(x1 - 44, y0 + 22) + reg("rect", 'x="' + (x0 + 30) + '" y="' + (y0 + 32) + '" width="' + (w - 60) + '" height="16" rx="7"', "var(--wood-hi)", 2) +
      reg("rect", 'x="' + (x0 + 12) + '" y="' + (y0 + 36) + '" width="20" height="8" rx="4"', "var(--wood)", 1.8) + reg("rect", 'x="' + (x1 - 32) + '" y="' + (y0 + 36) + '" width="20" height="8" rx="4"', "var(--wood)", 1.8);
    /* whisk */
    var wx = x0 + 36, wy = y0 + 72;
    s += hook(wx, wy - 8) + reg("rect", 'x="' + (wx - 4) + '" y="' + wy + '" width="8" height="34" rx="3"', "var(--blue)", 1.8) +
      line("M" + wx + " " + (wy + 34) + " C" + (wx - 20) + " " + (wy + 60) + " " + (wx - 12) + " " + (wy + 92) + " " + wx + " " + (wy + 92) + " C" + (wx + 12) + " " + (wy + 92) + " " + (wx + 20) + " " + (wy + 60) + " " + wx + " " + (wy + 34) +
        " M" + wx + " " + (wy + 34) + " C" + (wx - 8) + " " + (wy + 60) + " " + (wx - 5) + " " + (wy + 88) + " " + wx + " " + (wy + 92) + " C" + (wx + 5) + " " + (wy + 88) + " " + (wx + 8) + " " + (wy + 60) + " " + wx + " " + (wy + 34), 1.8);
    /* wooden spoon */
    var sx = x0 + 82, sy = y0 + 64;
    s += hook(sx, sy - 8) + reg("rect", 'x="' + (sx - 3.5) + '" y="' + sy + '" width="7" height="72" rx="3"', "var(--wood-hi)", 1.8) + reg("ellipse", 'cx="' + sx + '" cy="' + (sy + 90) + '" rx="12" ry="19"', "var(--wood-hi)", 2);
    /* offset spatula */
    var ox = x0 + 118, oy = y0 + 64;
    s += hook(ox, oy - 8) + reg("rect", 'x="' + (ox - 5) + '" y="' + oy + '" width="10" height="40" rx="4"', "var(--ink)", 1.6) + reg("path", 'd="M' + (ox - 2) + " " + (oy + 40) + " l0 8 l4 6 v58 q0 6 -5 6 q-5 0 -5 -6 v-58 Z" + '"', "#d8d6cf", 1.6);
    /* measuring cups on one hook */
    var mx = x0 + 150, my = y0 + 64;
    s += hook(mx, my - 8);
    [["var(--orange)", 13, 0], ["var(--stem)", 11, 30], ["var(--yellow)", 9, 56]].forEach(function (c) {
      s += line("M" + mx + " " + my + " V" + (my + c[2] + 8), 2.6, 1, "#6e6a62") + reg("path", 'd="M' + (mx - c[1]) + " " + (my + c[2] + 8) + " H" + (mx + c[1]) + " q-2 " + (c[1] + 6) + " -" + c[1] + " " + (c[1] + 6) + " q-" + (c[1] - 2) + " 0 -" + c[1] + " -" + (c[1] + 6) + ' Z"', c[0], 1.8); });
    return s;
  }
  function topBar(vp, text) {
    return reg("rect", 'x="700" y="22" width="400" height="44" rx="22"', "var(--card)", 2.4) +
      '<circle cx="730" cy="42" r="9" style="fill:none;stroke:var(--ink);stroke-width:2.4"/><path d="M737 49 L745 57" style="stroke:var(--ink);stroke-width:2.6;stroke-linecap:round"/>' +
      (text ? T(756, 52, text, "font:600 25px var(--font-hand);fill:var(--ink)") : T(756, 52, "Find a recipe or jot an idea…", "font:500 25px var(--font-hand);fill:var(--ink-soft)")) +
      reg("rect", 'x="' + (vp[1] - 168) + '" y="22" width="148" height="44" rx="22"', "var(--card)", 2.4) +
      '<circle cx="' + (vp[1] - 145) + '" cy="44" r="12" style="fill:var(--orange);stroke:var(--ink);stroke-width:2"/>' + T(vp[1] - 124, 51, "Account", "font:17px var(--font-body);fill:var(--ink)");
  }
  /* Evening: a lighter dusk, lit by a warm wash falling from the top edge of the page. No lamp. */
  function eveningOver(vp) {
    var x = vp[0] - 20, w = vp[1] - vp[0] + 40;
    return '<rect x="' + x + '" y="0" width="' + w + '" height="764" style="fill:url(#evewash);mix-blend-mode:multiply"/>';
  }
  function scene(vp, o, eve) { var L = lay(vp); O = o;
    L.e0 = o.made === "fridgeL" ? 530 : vp[0]; L.e1 = o.made === "fridgeR" ? 1270 : vp[1];
    var s = wall(L, o) + board(L) + counterAndShelf(L, o);
    if (o.made === "fridgeL" || o.made === "fridgeR") s += fridge(o.made === "fridgeR" ? "R" : "L", L, o);
    s += middle(o);
    if (eve) s += eveningOver(vp);
    return s + topBar(vp, o.typed); }
  /* Construction lines: from every front corner that recedes, through its back corner, to the vanishing point */
  function guides(vp) {
    var seen = {}, s = "";
    (GUIDE || []).forEach(function (p) { var key = Math.round(p[0]) + "," + Math.round(p[1]); if (seen[key]) return; seen[key] = 1;
      s += '<path d="M' + p[0].toFixed(1) + " " + p[1].toFixed(1) + " L" + VPX + " " + VPY + '" style="fill:none;stroke:var(--orange);stroke-width:1.1;opacity:.75;stroke-dasharray:5 4"/>'; });
    s += '<path d="M' + (vp[0] - 20) + " " + VPY + " H" + (vp[1] + 20) + '" style="stroke:var(--ink);stroke-width:1.6;stroke-dasharray:10 6"/>' +
      reg("circle", 'cx="' + VPX + '" cy="' + VPY + '" r="7"', "var(--orange)", 2) +
      reg("rect", 'x="' + (vp[0] + 14) + '" y="' + (VPY - 34) + '" width="120" height="26" rx="3"', "var(--card)", 1.6) + T(vp[0] + 74, VPY - 15, "eye level", "font:700 20px var(--font-hand);fill:var(--ink)", 'text-anchor="middle"') +
      reg("rect", 'x="' + (VPX + 16) + '" y="' + (VPY + 12) + '" width="170" height="26" rx="3"', "var(--card)", 1.6) + T(VPX + 101, VPY + 31, "vanishing point", "font:700 20px var(--font-hand);fill:var(--ink)", 'text-anchor="middle"');
    return s;
  }
  function svg(vp, inner, label, y0, h) { return '<svg viewBox="' + vp[0] + " " + (y0 || 0) + " " + (vp[1] - vp[0]) + " " + (h || 760) + '" role="group" aria-label="' + label + '">' + inner + "</svg>"; }
  var o = { cover: "black", name: "Trials", depth: "dim", tile: "none", made: "wall", plan: "dev", sides: "narrow", bites: 0 };
  var VPN = [430, 1370];
  function vpOf(oo) { if (oo.made === "fridgeR") return [430, 1430]; if (oo.made === "fridgeL") return [370, 1370]; return oo.sides === "wp" || oo.sides === "pw" ? VP : VPN; }
  function withView(vpy, zf, fn) { var a = VPY, b = ZF; VPY = vpy; ZF = zf; var r = fn(); VPY = a; ZF = b; return r; }
  function opts(extra) { var r = {}; for (var k in o) r[k] = o[k]; for (var e in extra) r[e] = extra[e]; return r; }
  function mainVP() { return VP; }
