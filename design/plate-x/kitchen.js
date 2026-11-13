/* The Plate X kitchen scene (kitchen agent). Started from the Plate IX one. base/kitchen-viii.js is the frozen Plate VIII copy. */
  /* ================= Layout: the middle never moves ================= */
  /* VP is the normal view. VPW is the extra wide view (browser 1680 px and up): the same kitchen, wider, so the
     fridge's hinges and the whole window show. The middle never moves. */
  var LAB = 700, BOX = 1090, VP = [300, 1500], VPW = [200, 1600], EVE = false;
  /* Tape labels are written in an ALL-CAPS marker hand. Guests see the paid tags too. */
  var MARK = "'Permanent Marker', var(--font-hand)";
  document.head.insertAdjacentHTML("beforeend", '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap">' +
    '<style>[data-plan="guest"] .paid { display: inline; }</style>');
  function marker(x, y, text, fs) { return T(x, y, text.toUpperCase(), "font:400 " + fs + "px " + MARK + ";letter-spacing:.6px;fill:var(--ink)", 'text-anchor="middle"'); }
  /* The board is 620 wide (settled: a little smaller, so the kitchen is less crowded); the fridge and window sit a little out. */
  /* Under the counter, left to right: the fridge (to 492), a slim cabinet (the narrowest, 120), the bookshelf (612 to 1012),
     the double cabinet that opens to the recipe log, and the sink cabinet. */
  function lay(vp, o) {
    o = o || {}; var bw = 620, bx = 900 - bw / 2, wbW = 248, shW = 400;
    var L = { vp: vp, bx: bx, bw: bw, wbW: wbW, cx: bx + wbW + 10, cw: bw - wbW - 10, shX: 612, shW: shW, e0: 492 };
    L.B = o.floor === "none" ? 740 : 704; L.FL = o.floor === "none" ? 764 : 720;
    L.win = { x0: 1292, x1: 1548, y0: 150, y1: 392, pot: 1324 };
    return L;
  }
  /* The sink sits under the window. XS is its centre on the counter's front edge (perspective pulls it left as it goes back). */
  var XS = 1490;
  var NOTES = [[112, 140, 80, 88, 3, "var(--yellow)", "var(--blue)"], [212, 150, 104, 66, -2, "var(--card)", "var(--stem)"], [22, 250, 98, 64, 2, "var(--amber)", "var(--orange)"],
    [140, 248, 86, 80, -3, "var(--card)", "var(--orange)"], [250, 240, 90, 70, 4, "var(--card)", "var(--yellow)"], [340, 146, 84, 72, -4, "var(--amber)", "var(--blue)"], [362, 244, 92, 76, 2, "var(--yellow)", "var(--stem)"], [446, 160, 80, 90, 3, "var(--card)", "var(--orange)"]];
  function board(L) { YS = BR; VPY += BR; var out = boardAt(L); VPY -= BR; YS = 0; return '<g transform="translate(0 -' + BR + ')">' + out + "</g>"; }
  function boardAt(L) {
    var dim = O.depth === "dim", s = hatch(L.bx - 2, 365, L.bw + 4, dim ? 14 : 8) + reg("rect", 'x="' + (L.bx - 10) + '" y="115" width="' + (L.bw + 20) + '" height="250" rx="4"', "var(--wood)") + grain(L.bx - 6, 116, L.bw + 12, 8, 4);
    var FW = { side: "var(--wood)", top: "var(--wood-dark)", bottom: "var(--wood-hi)" };
    var x = L.bx, wb = dim ? recess(x, 125, x + L.wbW, 355, 10, "var(--wb)", FW) + reg("rect", 'x="' + x + '" y="125" width="' + L.wbW + '" height="230"', "none", 2.2)
      : reg("rect", 'x="' + x + '" y="125" width="' + L.wbW + '" height="230"', "var(--wb)", 2.2);
    wb += '<rect class="lbl" x="' + (x + 14) + '" y="136" width="116" height="38" rx="3" style="fill:transparent"/>' + T(x + 22, 164, "Next up", "font:700 33px var(--font-hand);fill:var(--blue)") + line("M" + (x + 22) + " 172 q48 5 96 -2", 2.4, 1, "var(--blue)");
    [["Croissants · trial 4", 0], ["Rough puff pastry", 0], ["Rhubarb galette", 1]].forEach(function (it, i) { var y = 210 + i * 34;
      wb += it[1] ? star5(x + 30, y - 7, 0.8) : reg("rect", 'x="' + (x + 22) + '" y="' + (y - 15) + '" width="15" height="15" rx="2"', "var(--wb)", 1.8);
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
    var TITLES = { 1: ["Miso caramel"], 2: ["Cardamom", "knots"], 3: ["Yuzu curd", "tart"] };
    NOTES.forEach(function (n, ni) {
      if (n[0] + n[2] + 16 > L.cw) return;
      var nx = L.cx + n[0], ny = n[1], ncx = nx + n[2] / 2, ncy = ny + n[3] / 2, body = reg("rect", 'x="' + nx + '" y="' + ny + '" width="' + n[2] + '" height="' + n[3] + '"', n[5], 1.8), tt = TITLES[ni] || [], l0 = ny + 22 + tt.length * 19 + (tt.length ? 8 : 0);
      tt.forEach(function (t, k) { body += T(ncx, ny + 33 + k * 19, t, "font:700 19px var(--font-hand);fill:var(--ink)", 'text-anchor="middle"'); });
      for (var l = 0; l < 3; l++) { var ly = l0 + l * 13; if (ly < ny + n[3] - 8) body += line("M" + (nx + 9) + " " + ly + " H" + (nx + n[2] - 9 - l * 7), 1.3, 0.5); }
      cork += '<g transform="rotate(' + n[4] + " " + ncx + " " + ncy + ')">' + body + "</g>" + '<circle cx="' + ncx + '" cy="' + (ny + 7) + '" r="7" style="fill:' + n[6] + ';stroke:var(--ink);stroke-width:1.8"/><circle cx="' + (ncx - 2.4) + '" cy="' + (ny + 4.6) + '" r="2" style="fill:#fff;opacity:.8"/>';
    });
    s += hot("the idea board", cork, [L.cx, 125, L.cw, 230], L.cx - 10);
    return s + paidTag(L.cx + L.cw - 64, 336, 5);
  }

  /* The pinned mark on both boards: an orange star drawn in marker (same as the whiteboard view) */
  function star5(x, y, k) { var p = ""; for (var i = 0; i < 5; i++) { var a = -Math.PI / 2 + i * 4 * Math.PI / 5; p += (i ? " L" : "M") + (x + Math.cos(a) * 11 * k).toFixed(1) + " " + (y + Math.sin(a) * 11 * k).toFixed(1); }
    return '<path d="' + p + ' Z" style="fill:var(--orange);fill-opacity:.35;stroke:var(--orange);stroke-width:' + (3.2 * k) + ';stroke-linejoin:round;stroke-linecap:round"/>'; }
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

  /* Plate IX tile (kept): a little taller, set out from the centre line and the counter's back edge so whole tiles meet both */
  var YB = CTR + (VPY - CTR) * kk(CTR_D), TILE_Y = YB - 4 * 29;
  document.body.insertAdjacentHTML("afterbegin", '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
    '<pattern id="tile9" width="34" height="29" patternUnits="userSpaceOnUse" patternTransform="translate(883 ' + TILE_Y.toFixed(1) + ')"><rect width="34" height="29" style="fill:#f4f5ea"/><path d="M0 0 H34 M0 0 V29" style="stroke:#d3d6c2;stroke-width:1.5"/></pattern></defs></svg>');

  /* Masking tape: lies flat, slightly see-through, with torn (zigzag) short ends */
  function tape(cx, cy, len, h, rot, op, cls) {
    var x0 = cx - len / 2, x1 = cx + len / 2, y0 = cy - h / 2, n = 4, p = [], j;
    for (j = 0; j <= n; j++) p.push((x1 - (j % 2 ? 3 : 0)).toFixed(1) + "," + (y0 + j * h / n).toFixed(1));
    for (j = n; j >= 0; j--) p.push((x0 + (j % 2 ? 3 : 0)).toFixed(1) + "," + (y0 + j * h / n).toFixed(1));
    return "<polygon " + (cls ? 'class="' + cls + '" ' : "") + 'points="' + p.join(" ") + '" transform="rotate(' + (rot || 0) + " " + cx + " " + cy + ')" style="fill:#eadfb4;fill-opacity:' + (op || 0.6) + ';stroke:#b09a62;stroke-width:1;stroke-linejoin:round"/>';
  }
  /* "Recently": each name links to its page; pointing turns it yellow with an underline. */
  var RECENT = [["Blondies", "Tue", "the Blondies recipe card", ""], ["Croissants", "Sat", "the notebook entry Trial 4: croissants", "trial 4"], ["Galette", "Sun", "the Galette recipe card", ""]];
  function lk(x, by, txt, fs, on, label, opt) {
    opt = opt || {}; var tw = txt.length * fs * (opt.cw || 0.42), anchor = opt.mid ? 'text-anchor="middle"' : "", lx = opt.mid ? x - tw / 2 : x, col = opt.col || "var(--ink)";
    var hi = opt.chalk ? '<g class="lk-hi">' + T(x, by, txt, "font:700 " + fs + "px var(--font-hand);fill:var(--yellow)", anchor) + "</g>"
      : '<rect class="lk-hi" x="' + (lx - 4) + '" y="' + (by - fs * 0.92) + '" width="' + (tw + 8) + '" height="' + (fs * 1.22) + '" rx="3" style="fill:var(--yellow);stroke:var(--ink);stroke-width:1.2"/>';
    return '<g class="lnk' + (on ? " on" : "") + '" tabindex="0" role="link" aria-label="Open ' + label + '">' + (opt.chalk ? "" : hi) +
      T(x, by, txt, "font:600 " + fs + "px var(--font-hand);fill:" + col, anchor) + (opt.chalk ? hi : "") +
      '<g class="lk-hi">' + line("M" + lx + " " + (by + 3) + " H" + (lx + tw), 1.8, 1, opt.chalk ? "var(--yellow)" : "var(--ink)") + "</g></g>";
  }
  /* A word written on a strip of tape. cls "lbl" makes it the label that turns yellow on point. */
  function tapeLabel(cx, y, text, rot, cls) {
    return '<g transform="rotate(' + (rot || -3) + " " + cx + " " + y + ')">' + tape(cx, y - 1, Math.max(80, text.length * 11.5 + 28), 24, 0, 0.95, cls) + marker(cx, y + 5.5, text, 15) + "</g>";
  }
  function magnet(x, y, col) { return hatch(x - 6, y + 5, 15, 7, 0.5) + reg("circle", 'cx="' + x + '" cy="' + y + '" r="9"', col, 2) + '<circle cx="' + (x - 3) + '" cy="' + (y - 3) + '" r="2.6" style="fill:#fff;opacity:.75"/>'; }
  /* A clean index card with straight edges: a red rule under the title, blue rules below. Two round magnets hold it to the door. */
  function recentSheet(nx, y, w, onIdx) {
    var h = 150, x = nx - w / 2;
    var s = '<g transform="rotate(-2 ' + nx + " " + (y + h / 2) + ')">' + hatch(x + 4, y + 6, w, h, 0.35) + reg("rect", 'x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"', "var(--card)", 2);
    s += line("M" + (x + 1.5) + " " + (y + 55) + " H" + (x + w - 1.5), 1.4, 0.85, "#c9442a");
    for (var l = y + 83; l < y + h - 4; l += 28) s += line("M" + (x + 1.5) + " " + l + " H" + (x + w - 1.5), 1, 0.8, "#c3d2ec");
    s += T(nx, y + 45, "Recently", "font:700 23px var(--font-hand);fill:var(--ink)", 'text-anchor="middle"');
    RECENT.forEach(function (it, k) { var by = y + 80 + k * 28;
      s += lk(x + 10, by, it[0], 19, onIdx === k, it[2], { cw: 0.42 }) + T(x + w - 9, by, it[1], "font:600 16px var(--font-hand);fill:var(--ink-soft)", 'text-anchor="end"'); });
    return s + magnet(x + 18, y + 16, "var(--orange)") + magnet(x + w - 18, y + 15, "var(--blue)") + "</g>";
  }
  /* A 1950s fridge at the left edge, running past it. It stands on the floor at the counter's end. Its side runs back
     to the wall, so it shows only above the counter and points at the vanishing point, rounded shoulder and all. */
  function fridge(L, o) {
    var fx = L.e0, fw = 250, x0 = fx - fw, y0 = 76, y1 = L.FL, r = 44, EN = "#f6efd9", SD = "#dad1b4", DS = "#e9e0c5", CH = "#d2d0c8", s = "", i;
    function pt(p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }
    /* the side: from the line that grazes the rounded shoulder on its way to the vanishing point, down to the counter */
    var C = [fx - r, y0 + r], a0 = Math.atan2(VPY - C[1], VPX - C[0]) - Math.acos(r / Math.hypot(VPX - C[0], VPY - C[1])), F = [];
    for (i = 0; i <= 8; i++) { var a = a0 * (1 - i / 8); F.push([C[0] + r * Math.cos(a), C[1] + r * Math.sin(a)]); }
    F.push([fx, CTR]);
    function back(d) { return F.map(function (p) { return P(p[0], p[1], d); }); }
    var G = back(13);
    s += face(F.concat(back(CTR_D).reverse()), SD, 2) + face(F.concat(G.slice().reverse()), DS, 1.2) + line("M" + G.map(pt).join(" L"), 2.8, 1, "#6e6a62");
    /* hinges on the far edge of the door (out of the main view) */
    var dB = y1 - 38;
    [y0 + 78, dB - 96].forEach(function (hy) { s += reg("rect", 'x="' + (x0 - 7) + '" y="' + hy + '" width="16" height="34" rx="4"', CH, 1.8) + line("M" + (x0 - 3) + " " + (hy + 5) + " v24", 1.2, 0.8, "#fff"); });
    s += hatch(x0 + 2, y1, fw, 5, 0.6) + reg("path", 'd="M' + x0 + " " + y1 + " V" + (y0 + r) + " A" + r + " " + r + " 0 0 1 " + (x0 + r) + " " + y0 + " H" + (fx - r) + " A" + r + " " + r + " 0 0 1 " + fx + " " + (y0 + r) + " V" + y1 + ' Z"', EN, 2.6);
    /* the door: a gasket line just inside its edge, and its foot */
    var q = 7, ri = r - q;
    s += line("M" + (x0 + q) + " " + (dB - q) + " V" + (y0 + r) + " A" + ri + " " + ri + " 0 0 1 " + (x0 + r) + " " + (y0 + q) + " H" + (fx - r) + " A" + ri + " " + ri + " 0 0 1 " + (fx - q) + " " + (y0 + r) + " V" + (dB - q) + " Z", 1.4, 0.5) +
      line("M" + x0 + " " + dB + " H" + fx, 2.4) + hatch(x0 + 2, dB + 1, fw - 4, 5, 0.6);
    /* the grille at the foot */
    s += reg("rect", 'x="' + (x0 + 20) + '" y="' + (dB + 11) + '" width="' + (fw - 40) + '" height="18" rx="3"', "#b9b6ac", 1.8);
    for (i = x0 + 29; i < fx - 24; i += 9) s += line("M" + i + " " + (dB + 14) + " v12", 1.6, 0.75);
    /* a blank badge plate, a chrome trim strip, and the lever handle at its end */
    var bx = x0 + fw / 2 + 6, ty = 326;
    s += reg("rect", 'x="' + (bx - 27) + '" y="' + (y0 + 24) + '" width="54" height="17" rx="4"', CH, 1.8) + line("M" + (bx - 20) + " " + (y0 + 29) + " h40", 1.2, 0.85, "#fff") +
      '<circle cx="' + (bx - 21) + '" cy="' + (y0 + 35.5) + '" r="1.5" style="fill:var(--ink)"/><circle cx="' + (bx + 21) + '" cy="' + (y0 + 35.5) + '" r="1.5" style="fill:var(--ink)"/>';
    s += reg("rect", 'x="' + (x0 + 16) + '" y="' + (ty - 5) + '" width="' + (fw - 56) + '" height="10" rx="5"', CH, 1.8) + line("M" + (x0 + 22) + " " + (ty - 2) + " H" + (fx - 46), 1.2, 0.85, "#fff");
    s += reg("rect", 'x="' + (fx - 48) + '" y="' + (ty - 17) + '" width="32" height="34" rx="7"', CH, 2) + hatch(fx - 27, ty + 12, 9, 112, 0.5) +
      reg("rect", 'x="' + (fx - 39) + '" y="' + (ty - 9) + '" width="14" height="128" rx="7"', CH, 2) + line("M" + (fx - 35) + " " + (ty + 8) + " v100", 1.4, 0.85, "#fff") +
      '<circle cx="' + (fx - 32) + '" cy="' + ty + '" r="3" style="fill:var(--ink)"/>';
    return s + recentSheet(Math.max(fx - 104, 386), 138, 136, o.linkOn);
  }
  /* The floor runs toward us from the kick board, so every line along its depth runs to the vanishing point.
     floor: check (black and white tiles) | boards | flat | none. Tiles are wide and their rows shallow, so even at the
     edges each row shifts less than half a tile and the pattern reads as tiles, not diagonal stripes. */
  function floorStrip(L, o) {
    var x0 = L.vp[0] - 20, x1 = L.vp[1] + 20, FL = L.FL, s = "", i;
    function pt(p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }
    if (o.floor === "check") { var t = 64, D = 22;
      for (var j = 0; j < 3; j++) for (i = -16; i < 16; i++) { var xa = VPX - t / 2 + t * i;
        s += face([P(xa, FL, -D * j), P(xa + t, FL, -D * j), P(xa + t, FL, -D * (j + 1)), P(xa, FL, -D * (j + 1))], (i + j) & 1 ? "#2a2724" : "#f7f4ea", 1); } }
    else if (o.floor === "boards") { var bw = 44, r = rand(5);
      s += '<rect x="' + x0 + '" y="' + FL + '" width="' + (x1 - x0) + '" height="' + (764 - FL) + '" style="fill:var(--wood-hi)"/>';
      for (i = -16; i <= 16; i++) { var bx = VPX - bw / 2 + bw * i, jd = -(6 + r() * 34);
        s += line("M" + pt(P(bx, FL, 0)) + " L" + pt(P(bx, FL, -90)), 1.8, 1) + line("M" + pt(P(bx, FL, jd)) + " L" + pt(P(bx + bw, FL, jd)), 1.4, 0.8) +
          line("M" + pt(P(bx + 10 + r() * 20, FL, -4)) + " L" + pt(P(bx + 12 + r() * 20, FL, -40)), 1, 0.35); } }
    else s += '<rect x="' + x0 + '" y="' + FL + '" width="' + (x1 - x0) + '" height="' + (764 - FL) + '" style="fill:color-mix(in srgb, var(--orange) 34%, var(--card))"/>';
    return clipTo(x0, FL, x1, 764, s) + hatch(x0, FL, x1 - x0, 5, 0.55) + line("M" + x0 + " " + FL + " H" + x1, 2.4);
  }
  /* A chrome tap on the counter behind the sink: a gooseneck and two cross handles */
  function tap(bx, by) {
    var CH = "#d2d0c8", d = "M" + bx + " " + by + " V" + (by - 50) + " q0 -20 18 -20 q18 0 18 20 v10", s = "";
    [-24, 24].forEach(function (h) { s += line("M" + (bx + h) + " " + (by - 2) + " v-12", 6, 1) + line("M" + (bx + h) + " " + (by - 2) + " v-12", 2.6, 1, CH) +
      reg("rect", 'x="' + (bx + h - 9) + '" y="' + (by - 19) + '" width="18" height="6" rx="3"', CH, 1.6); });
    return s + reg("ellipse", 'cx="' + bx + '" cy="' + by + '" rx="12" ry="4"', CH, 1.8) + line(d, 9, 1) + line(d, 4.4, 1, CH) + line("M" + (bx - 1.5) + " " + (by - 8) + " V" + (by - 46), 1.4, 0.9, "#fff");
  }
  /* A steel sink set into the counter top; we look down at its back wall and the right wall. The tap stands behind it. */
  function sink(o) {
    function A(x, d, y) { return P(x, y || CTR, d); }
    function pts(a) { return a.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "); }
    var t = A(XS + 10, 74), s = "";
    var rim = [A(XS - 84, 8), A(XS + 84, 8), A(XS + 84, 72), A(XS - 84, 72)], hole = [A(XS - 72, 16), A(XS + 72, 16), A(XS + 72, 64), A(XS - 72, 64)],
      bot = hole.map(function (p, k) { return A([XS - 72, XS + 72, XS + 72, XS - 72][k], [16, 16, 64, 64][k], CTR + 26); }), id = "ks" + (uidN++), dr = A(XS, 46, CTR + 26);
    s += face(rim, "#dedcd4", 2);
    s += '<defs><clipPath id="' + id + '"><polygon points="' + pts(hole) + '"/></clipPath></defs><g clip-path="url(#' + id + ')">' + face(hole, "#c9c7bf", 0.01) +
      face(bot, "#cfcdc5", 1.2) + '<ellipse cx="' + dr[0].toFixed(1) + '" cy="' + dr[1].toFixed(1) + '" rx="7" ry="2.4" style="fill:#8f8d86;stroke:var(--ink);stroke-width:1"/>' +
      face([hole[3], hole[2], bot[2], bot[3]], "#9d9b93", 1.2) + hatch(hole[3][0], hole[3][1], hole[2][0] - hole[3][0], 7, 0.5) + face([hole[1], hole[2], bot[2], bot[1]], "#b9b7af", 1.2) + "</g>" + face(hole, "none", 2);
    return s + tap(t[0], t[1]);
  }
  function counterAndShelf(L, o) {
    /* the run starts at the fridge: in the extra wide view only wall shows beyond it */
    var vp = L.vp, x0 = Math.max(vp[0] - 20, L.e0 - 250), W = vp[1] + 20 - x0, sx = L.shX, sw = L.shW, B = L.B, s = "";
    /* the counter top runs off both edges, so its back edge is level; its depth is found like every other */
    s += reg("rect", 'x="' + x0 + '" y="' + YB.toFixed(1) + '" width="' + W + '" height="' + (CTR - YB).toFixed(1) + '"', "var(--wood-hi)", 2.2) + grain(x0, YB + 4, W, CTR - YB - 8, 11) + grain(x0 + 60, YB + 20, W, CTR - YB - 24, 12) +
      reg("rect", 'x="' + x0 + '" y="' + CTR + '" width="' + W + '" height="12"', "var(--wood)") + reg("rect", 'x="' + x0 + '" y="486" width="' + W + '" height="9"', "var(--wood-dark)", 2.4);
    s += sink(o);
    /* cab: now | quiet (a darker, softer green). Left to right: a slim cabinet, the shelf, a double cabinet, the sink cabinet.
       Every cabinet has a drawer line at the top; the sink's is a false front. Pulls are bars: level on drawers, upright on doors. */
    var quiet = o.cab === "quiet", CB = quiet ? "color-mix(in srgb, var(--cab) 56%, #2c2a22)" : "var(--cab)",
      DF = quiet ? "color-mix(in srgb, var(--cab) 62%, #2c2a22)" : "var(--cab-hi)", lw = quiet ? 1.6 : 2.2;
    s += reg("rect", 'x="' + x0 + '" y="495" width="' + (sx - x0) + '" height="' + (B - 495) + '"', CB) + reg("rect", 'x="' + (sx + sw) + '" y="495" width="' + (vp[1] + 20 - sx - sw) + '" height="' + (B - 495) + '"', CB);
    function pull(cx, y, up) { return up ? reg("rect", 'x="' + (cx - 3.5) + '" y="' + y + '" width="7" height="34" rx="3.5"', "var(--brass)", 1.6) + line("M" + (cx - 1) + " " + (y + 5) + " v24", 1.2, 0.7, "#fff")
      : reg("rect", 'x="' + (cx - 17) + '" y="' + y + '" width="34" height="7" rx="3.5"', "var(--brass)", 1.6) + line("M" + (cx - 12) + " " + (y + 2.2) + " h24", 1.2, 0.7, "#fff"); }
    /* a door: a set-in panel framed by a flat 16 wide stile; the pull sits on the stile, clear of the bevel */
    function door(dx, y0, dw, right) { var out = reg("rect", 'x="' + dx + '" y="' + y0 + '" width="' + dw + '" height="' + (B - 12 - y0) + '" rx="4"', DF, lw);
      if (quiet) out += reg("rect", 'x="' + (dx + 16) + '" y="' + (y0 + 16) + '" width="' + (dw - 32) + '" height="' + (B - 44 - y0) + '"', "none", 1.1);
      else out += recess(dx + 16, y0 + 16, dx + dw - 16, B - 28, 9, DF, { side: CB, bottom: "color-mix(in srgb, var(--cab-hi) 70%, #fff)" }, hatch(dx + 16, y0 + 16, dw - 32, 6)) +
        reg("rect", 'x="' + (dx + 16) + '" y="' + (y0 + 16) + '" width="' + (dw - 32) + '" height="' + (B - 44 - y0) + '"', "none", 1.6);
      return out + pull(right ? dx + dw - 8 : dx + 8, y0 + 20, true); }
    function drawer(a0, a1) { return reg("rect", 'x="' + a0 + '" y="508" width="' + (a1 - a0) + '" height="36" rx="4"', DF, lw) + pull((a0 + a1) / 2, 522.5); }
    /* a cabinet a0..a1: nd drawers over n doors. kn "r"/"l": pulls on that side; "mid": pulls at the two inner corners */
    function cabinet(a0, a1, n, kn, nd) { var g = 14, dw = (a1 - a0 - (n + 1) * g) / n, rw = (a1 - a0 - (nd + 1) * g) / nd, out = "", k;
      for (k = 0; k < nd; k++) out += drawer(a0 + g + k * (rw + g), a0 + g + k * (rw + g) + rw);
      for (k = 0; k < n; k++) { var dx = a0 + g + k * (dw + g); out += door(dx, 556, dw, kn === "r" || (kn === "mid" && k === 0)); }
      return out; }
    var c0 = XS - 118, c1 = XS + 118, late = "";
    s += cabinet(L.e0, sx, 1, "r", 1) + logCab(sx + sw, c0) + cabinet(c0, c1, 2, "mid", 1) + cabinet(c1, c1 + 240, 1, "l", 1) + line("M" + c0 + " 495 V" + B + " M" + c1 + " 495 V" + B, 2);
    /* The double cabinet holds the recipe log (finished later, issue #161). Closed: one wide drawer with a RECIPE LOG tape label
       and two doors, pulls at the inner top corners; it glows on point. o.logOpen: the doors swing all the way open, flat against
       the neighbours, showing their concealed hinge cups, and inside a clipboard hangs on a hook. */
    function logCab(a0, a1) {
      var g = 14, dw = (a1 - a0 - 3 * g) / 2, lx = a0 + g + 78, out = drawer(a0 + g, a1 - g) +
        '<g transform="rotate(-1 ' + lx + ' 526)">' + tape(lx, 526, 140, 19, 0, 0.96, "lbl") + marker(lx, 531.5, "Recipe log", 14) + "</g>";
      if (!o.logOpen) return hot("the recipe log", out + door(a0 + g, 556, dw, true) + door(a0 + 2 * g + dw, 556, dw, false), [a0, 500, a1 - a0, B - 508]);
      var i0 = a0 + g, i1 = a1 - g, y0 = 556, y1 = B - 12, d = 70, bk = P(i0, y0, d), bc = P(i1, y1, d), mx = (bk[0] + bc[0]) / 2;
      /* the hook is just above the opening's top edge (hidden); the clipboard hangs on the back wall where we can see it */
      var t0 = y0 + 4, clip = hatch(mx - 24, t0 + 6, 54, 70, 0.4) + reg("rect", 'x="' + (mx - 28) + '" y="' + t0 + '" width="56" height="72" rx="4"', "var(--wood-hi)", 1.8) +
        reg("rect", 'x="' + (mx - 23) + '" y="' + (t0 + 9) + '" width="46" height="58"', "var(--card)", 1.2) +
        reg("rect", 'x="' + (mx - 12) + '" y="' + (t0 - 3) + '" width="24" height="11" rx="3"', "#d2d0c8", 1.6) +
        T(mx, t0 + 26, "Recipe log", "font:700 13px var(--font-hand);fill:var(--ink)", 'text-anchor="middle"');
      for (var l = 0; l < 3; l++) clip += line("M" + (mx - 18) + " " + (t0 + 38 + l * 9) + " H" + (mx + 18), 1, 0.6, "#c3d2ec");
      out += recess(i0, y0, i1, y1, d, "color-mix(in srgb, var(--wood-hi) 55%, #fff)", { side: "color-mix(in srgb, var(--wood-hi) 40%, #8a6a4a)", top: "color-mix(in srgb, var(--wood) 70%, #000)", bottom: "var(--wood-hi)" }, clip) + reg("rect", 'x="' + i0 + '" y="' + y0 + '" width="' + (i1 - i0) + '" height="' + (y1 - y0) + '"', "none", 2);
      /* the doors' backs: plain, with two hinge cups each by the hinge edge */
      function back(x, hingeX) { var b = reg("rect", 'x="' + x + '" y="' + y0 + '" width="' + dw + '" height="' + (y1 - y0) + '" rx="4"', DF, lw);
        [y0 + 22, y1 - 22].forEach(function (cy) { b += reg("circle", 'cx="' + hingeX + '" cy="' + cy + '" r="8"', "#d2d0c8", 1.6) + reg("rect", 'x="' + (hingeX - (hingeX > x + dw / 2 ? 20 : -4)) + '" y="' + (cy - 3) + '" width="16" height="6" rx="2"', "#d2d0c8", 1.2); });
        return b; }
      late += hatch(i0 - dw, y1, dw, 5) + back(i0 - dw, i0 - 14) + back(i1, i1 + 14);
      return out;
    }
    /* the shelf sits a little left of the vanishing point: both inner walls show (the right one wider), and each tier's floor; the ceilings don't.
       Two boards of the same thickness: the middle one and the bottom rail. Both tier floors are the same pale wood. */
    var m0 = 495 + Math.round((B - 539) * 0.52), m1 = m0 + 22, b0 = B - 22, tH = m0 - 495, lH = b0 - m1, SD = 26;
    /* with the quieter green the shelf inside goes a warmer, darker brown so the two stay apart */
    var DEEP = quiet ? "color-mix(in srgb, var(--wood-dark) 34%, #16120d)" : "var(--cab-deep)", SH = { side: quiet ? "color-mix(in srgb, var(--wood-dark) 22%, #0f0c09)" : "var(--cab-side)", bottom: "color-mix(in srgb, var(--wood-hi) 40%, #fff)" };
    s += reg("rect", 'x="' + sx + '" y="495" width="' + sw + '" height="' + (B - 495) + '"', DEEP) + recess(sx, 495, sx + sw, m0, SD, DEEP, SH) + recess(sx, m1, sx + sw, b0, SD, DEEP, SH);
    [m0, b0].forEach(function (y, k) { s += reg("rect", 'x="' + sx + '" y="' + y + '" width="' + sw + '" height="22"', "var(--wood)", 2.4) + grain(sx + 4, y + 2, sw - 8, 18, 31 + k); });
    /* a book: its top (page edges) and the side facing the centre show */
    function bk(x, y, w, h, fill, rx) { return block(x, y, x + w, y + h, 18, { top: w > h ? "color-mix(in srgb, " + fill + " 72%, #fff)" : "#f6efdc", side: "color-mix(in srgb, " + fill + " 72%, #000)" }) + reg("rect", 'x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 1.5) + '"', fill, 2.2); }
    /* tape on the front edge of the board each row stands on, written in marker */
    function label(edge, text) { var cx = sx + sw - 96; return '<g transform="rotate(-1 ' + cx + " " + (edge + 11) + ')">' + tape(cx, edge + 11, text.length * 11 + 30, 19, 0, 0.96, "lbl") + marker(cx, edge + 16.5, text, 14) + "</g>"; }
    var top = "", books = [[22, 18, 0.84, "var(--orange)"], [41, 25, 0.91, "var(--card)"], [67, 16, 0.77, "var(--blue)"], [84, 22, 0.87, "var(--yellow)"]];
    books.forEach(function (b, k) { var bx = sx + b[0], bh = Math.round(b[2] * tH), by = m0 - bh;
      top += bk(bx, by, b[1], bh, b[3]) + line("M" + (bx + 2) + " " + (by + 8) + " H" + (bx + b[1] - 2) + " M" + (bx + 2) + " " + (by + bh - 10) + " H" + (bx + b[1] - 2), 1.2, 0.7);
      if (k % 2 === 0) top += reg("rect", 'x="' + (bx + 3) + '" y="' + (by + 16) + '" width="' + (b[1] - 6) + '" height="10"', "var(--card)", 1.4); else top += line("M" + (bx + b[1] / 2) + " " + (by + 20) + " V" + (by + bh - 22), 1.2, 0.6); });
    top += bk(sx + 112, m0 - 22, 108, 22, "var(--stem)") + reg("rect", 'x="' + (sx + 128) + '" y="' + (m0 - 18) + '" width="34" height="14"', "var(--card)", 1.2);
    var h1 = Math.round(lH * 0.9), h2 = Math.round(lH * 0.78), low = bk(sx + 22, b0 - h1, 20, h1, "var(--amber)") + bk(sx + 44, b0 - h2, 34, h2, "var(--card)", 2) +
      '<circle cx="' + (sx + 61) + '" cy="' + (b0 - h2 * 0.38).toFixed(1) + '" r="6" style="fill:var(--paper);stroke:var(--ink);stroke-width:1.6"/>' + bk(sx + 84, b0 - 22, 100, 22, "var(--blue)");
    s += hot("the references", clipTo(sx, m1, sx + sw, b0, low) + label(b0, "References"), [sx + 6, m1 + 4, sw - 12, B - m1 - 8]);
    /* drawn second, so the lower tier's glow never washes over the Cookbooks label */
    s += hot("the cookbooks", clipTo(sx, 495, sx + sw, m0, top) + label(m0, "Cookbooks"), [sx + 6, 499, sw - 12, m1 - 503]);
    s += hatch(sx + 2, 495, sw - 4, 7) + hatch(sx + 2, m1, sw - 4, 7);
    s += reg("rect", 'x="' + sx + '" y="495" width="' + sw + '" height="' + (B - 495) + '"', "none", 3) + paidTag(sx + sw - 70, 495 + Math.round(tH * 0.56), -3);
    s += late;
    /* the kick board, then the floor in front of it */
    s += reg("rect", 'x="' + x0 + '" y="' + B + '" width="' + W + '" height="' + (L.FL - B) + '"', "var(--wood-dark)", 2.4);
    return s + (L.FL < 764 ? floorStrip(L, o) : "");
  }
  function wall(L, o) {
    var vp = L.vp, X = vp[0] - 20, W = vp[1] - vp[0] + 40, s = '<rect x="' + X + '" y="0" width="' + W + '" height="764" style="fill:var(--plaster)"/>', tx = Math.max(X, L.e0 - 250);
    if (o.tile === "quiet") s += '<rect x="' + tx + '" y="' + TILE_Y.toFixed(1) + '" width="' + (X + W - tx) + '" height="' + (YB - TILE_Y).toFixed(1) + '" style="fill:url(#tile9)"/>' + line("M" + tx + " " + TILE_Y.toFixed(1) + " H" + (X + W), 1.8, 0.7);
    /* the outlet sits in the middle of two tiles, one column right of the recipe box */
    var ox = 1193, oy = TILE_Y + 58 - 22;
    s += reg("rect", 'x="' + ox + '" y="' + oy.toFixed(1) + '" width="26" height="44" rx="3"', "var(--card)", 1.8) + line("M" + (ox + 9) + " " + (oy + 11) + " v7 M" + (ox + 17) + " " + (oy + 11) + " v7 M" + (ox + 9) + " " + (oy + 27) + " v7 M" + (ox + 17) + " " + (oy + 27) + " v7", 2);
    return s + windowAt(L.win);
  }
  /* The window, set into the wall low over the sink: the reveal shows the inner walls facing the eye, the sill its top.
     By day a pale sky and one cloud; in the evening a dark sky, a moon and stars. No sun patch: by day the light is just the window.
     Clicking it plays a tiny bird (day) or a shooting star (evening) across the glass. The section script also plays it now and then. */
  function bird(x0, x1, y) {
    var up = "M-8 -4 Q-4 -4 0 0 Q4 -4 8 -4", dn = "M-8 3 Q-4 0 0 0 Q4 0 8 3";
    return '<g class="k-fly" visibility="hidden"><path d="' + up + '" style="fill:none;stroke:var(--ink);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round">' +
      '<animate attributeName="d" values="' + up + ";" + dn + ";" + up + '" dur="0.45s" repeatCount="indefinite"/></path>' +
      '<animateTransform attributeName="transform" type="translate" values="' + (x0 - 20) + " " + y + ";" + ((x0 + x1) / 2) + " " + (y - 22) + ";" + (x1 + 20) + " " + (y - 8) + '" dur="5s" begin="indefinite"/>' +
      '<set attributeName="visibility" to="visible" begin="indefinite" dur="5s"/></g>';
  }
  function star(xa, ya, xb, yb) {
    return '<g class="k-fly" visibility="hidden"><path d="M0 0 L40 -22" style="fill:none;stroke:#f6eccb;stroke-width:2.2;stroke-linecap:round;opacity:.75"/><circle r="2.6" style="fill:#fff6d8"/>' +
      '<animateTransform attributeName="transform" type="translate" values="' + xa + " " + ya + ";" + xb + " " + yb + '" dur="1.3s" begin="indefinite"/>' +
      '<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.7;1" dur="1.3s" begin="indefinite"/>' +
      '<set attributeName="visibility" to="visible" begin="indefinite" dur="1.3s"/></g>';
  }
  function windowAt(w) {
    var x0 = w.x0, x1 = w.x1, y0 = w.y0, y1 = w.y1, W = x1 - x0, t = 14, d = 26, sky = EVE ? "#26304d" : "#cfe2ea", TR = "#f7f2e4", glass, fly;
    var a = P(x0, y0, d), c = P(x1, y1, d), gw = c[0] - a[0], gh = c[1] - a[1];
    if (EVE) {
      var mx = a[0] + gw * 0.7, my = a[1] + 52;
      glass = '<circle cx="' + mx + '" cy="' + my + '" r="15" style="fill:#f6eccb"/><circle cx="' + (mx + 8) + '" cy="' + (my - 5) + '" r="13.5" style="fill:' + sky + '"/>' +
        [[0.12, 30], [0.3, 78], [0.1, 150], [0.55, 170], [0.86, 120], [0.4, 26], [0.9, 40], [0.22, 196]].map(function (st) { return '<circle cx="' + (a[0] + gw * st[0]).toFixed(1) + '" cy="' + (a[1] + st[1]) + '" r="1.7" style="fill:#f6eccb"/>'; }).join("");
      fly = star(a[0] + gw * 0.98, a[1] + 104, a[0] + gw * 0.22, a[1] + 178);
    } else {
      var cx = a[0] + gw * 0.74, cy = a[1] + gh * 0.7;
      glass = reg("path", 'd="M' + (cx - 34) + " " + cy + " q-2 -14 14 -13 q4 -14 20 -10 q12 -8 22 4 q14 0 12 19 Z" + '"', "#f7fbfc", 1.4);
      fly = bird(a[0], c[0], a[1] + gh * 0.32);
    }
    var bx = (a[0] + c[0]) / 2, by = (a[1] + c[1]) / 2, bar = "M" + bx.toFixed(1) + " " + (a[1] + 4).toFixed(1) + " V" + (c[1] - 4).toFixed(1) + " M" + (a[0] + 4).toFixed(1) + " " + by.toFixed(1) + " H" + (c[0] - 4).toFixed(1);
    var win = reg("rect", 'x="' + (x0 - t) + '" y="' + (y0 - t) + '" width="' + (W + 2 * t) + '" height="' + (y1 - y0 + 2 * t) + '" rx="2"', TR, 2.2) +
      recess(x0, y0, x1, y1, d, sky, { side: "#dfe0cf", top: "#cfd1bf", bottom: "#f3f4e6" }, glass + clipTo(a[0], a[1], c[0], c[1], fly) + line(bar, 7, 1) + line(bar, 3.6, 1, TR)) +
      reg("rect", 'x="' + x0 + '" y="' + y0 + '" width="' + W + '" height="' + (y1 - y0) + '"', "none", 2) +
      block(x0 - t - 8, y1 + t, x1 + t + 8, y1 + t + 11, 30, { side: "#e6e0cf", top: "#fbf8ee" }) +
      reg("rect", 'x="' + (x0 - t - 8) + '" y="' + (y1 + t) + '" width="' + (W + 2 * t + 16) + '" height="11" rx="2"', TR, 2);
    var s = hot("the window", win, [x0 - t, y0 - t, W + 2 * t, y1 - y0 + 2 * t + 11]).replace('class="hot', 'class="k-win hot').replace("Open the window", "Look out of the window");
    /* herbs in a pot on the sill */
    var px = w.pot, py = y1 + t;
    s += line("M" + (px - 6) + " " + (py - 26) + " q-8 -18 -4 -34 M" + px + " " + (py - 26) + " q2 -22 -2 -40 M" + (px + 6) + " " + (py - 26) + " q10 -14 8 -30", 2.4, 1, "var(--stem)");
    [[-12, -52], [-4, -64], [6, -58], [12, -46], [-10, -40]].forEach(function (l) { s += reg("ellipse", 'cx="' + (px + l[0]) + '" cy="' + (py + l[1]) + '" rx="6" ry="4"', "var(--stem)", 1.4); });
    return s + reg("path", 'd="M' + (px - 16) + " " + (py - 28) + " H" + (px + 16) + " L" + (px + 12) + " " + py + " H" + (px - 12) + ' Z"', "var(--orange)", 2) + reg("rect", 'x="' + (px - 18) + '" y="' + (py - 32) + '" width="36" height="7" rx="1.5"', "var(--orange)", 2);
  }
  /* The find bar and Account. A guest gets a small "Guest" tag beside Account. */
  function topBar(vp, text, plan) {
    var s = reg("rect", 'x="700" y="22" width="400" height="44" rx="22"', "var(--card)", 2.4) +
      '<circle cx="730" cy="42" r="9" style="fill:none;stroke:var(--ink);stroke-width:2.4"/><path d="M737 49 L745 57" style="stroke:var(--ink);stroke-width:2.6;stroke-linecap:round"/>' +
      (text ? T(756, 52, text, "font:600 25px var(--font-hand);fill:var(--ink)") : T(756, 52, "Find a recipe or jot an idea…", "font:500 25px var(--font-hand);fill:var(--ink-soft)")) +
      reg("rect", 'x="' + (vp[1] - 168) + '" y="22" width="148" height="44" rx="22"', "var(--card)", 2.4) +
      '<circle cx="' + (vp[1] - 145) + '" cy="44" r="12" style="fill:var(--orange);stroke:var(--ink);stroke-width:2"/>' + T(vp[1] - 124, 51, "Account", "font:17px var(--font-body);fill:var(--ink)");
    if (plan === "guest") s += reg("rect", 'x="' + (vp[1] - 254) + '" y="30" width="74" height="28" rx="4"', "var(--yellow)", 1.8) + T(vp[1] - 217, 50, "Guest", "font:600 16px var(--font-body);fill:var(--ink)", 'text-anchor="middle"');
    return s;
  }
  /* Evening: a lighter dusk, lit by a warm wash falling from the top edge of the page. No lamp. */
  function eveningOver(vp) {
    var x = vp[0] - 20, w = vp[1] - vp[0] + 40;
    return '<rect x="' + x + '" y="0" width="' + w + '" height="764" style="fill:url(#evewash);mix-blend-mode:multiply;pointer-events:none"/>';
  }
  /* scene(mainVP(), opts()) is the main Plate X day kitchen; pass eve = true for the evening one, VPW for extra wide. */
  function scene(vp, o, eve) { var L = lay(vp, o); O = o; EVE = !!eve;
    var s = wall(L, o) + board(L) + counterAndShelf(L, o) + fridge(L, o) + middle(o);
    if (EVE) s += eveningOver(vp);
    EVE = false;
    return s + topBar(vp, o.typed, o.plan); }
  /* Construction lines: from every front corner that recedes, through its back corner, to the vanishing point */
  function guides(vp) {
    var seen = {}, s = "";
    (GUIDE || []).forEach(function (p) { var key = Math.round(p[0]) + "," + Math.round(p[1]); if (seen[key]) return; seen[key] = 1;
      s += '<path d="M' + p[0].toFixed(1) + " " + p[1].toFixed(1) + " L" + VPX + " " + VPY + '" style="fill:none;stroke:var(--orange);stroke-width:1.1;opacity:.75;stroke-dasharray:5 4"/>'; });
    s += '<path d="M' + (vp[0] - 20) + " " + VPY + " H" + (vp[1] + 20) + '" style="stroke:var(--ink);stroke-width:1.6;stroke-dasharray:10 6"/>' + reg("circle", 'cx="' + VPX + '" cy="' + VPY + '" r="7"', "var(--orange)", 2);
    return s;
  }
  function svg(vp, inner, label, y0, h) { return '<svg viewBox="' + vp[0] + " " + (y0 || 0) + " " + (vp[1] - vp[0]) + " " + (h || 760) + '" role="group" aria-label="' + label + '">' + inner + "</svg>"; }
  /* Options. floor: check | boards | flat | none. cab: now | quiet. tile: quiet | none. plan: dev | cook | guest. */
  var o = { cover: "black", name: "Trials", depth: "dim", tile: "quiet", plan: "dev", bites: 0, floor: "check", cab: "now" };
  function vpOf() { return VP; }
  function withView(vpy, zf, fn) { var a = VPY, b = ZF; VPY = vpy; ZF = zf; var r = fn(); VPY = a; ZF = b; return r; }
  function opts(extra) { var r = {}; for (var k in o) r[k] = o[k]; for (var e in extra) r[e] = extra[e]; return r; }
  function mainVP() { return VP; }
