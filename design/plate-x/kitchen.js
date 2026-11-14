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
    [["Croissants · trial 4", 0], ["Rough puff pastry", 0], ["Rhubarb galette", 0]].forEach(function (it, i) { var y = 210 + i * 34;
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
    /* Left to right: a slim cabinet, the shelf, a double cabinet, the sink cabinet.
       Every cabinet has a drawer line at the top; the sink's is a false front. Pulls are bars: level on drawers, upright on doors. */
    var CB = "var(--cab)", DF = "var(--cab-hi)", lw = 2.2;
    s += reg("rect", 'x="' + x0 + '" y="495" width="' + (sx - x0) + '" height="' + (B - 495) + '"', CB) + reg("rect", 'x="' + (sx + sw) + '" y="495" width="' + (vp[1] + 20 - sx - sw) + '" height="' + (B - 495) + '"', CB);
    function pull(cx, y, up) { return up ? reg("rect", 'x="' + (cx - 3.5) + '" y="' + y + '" width="7" height="34" rx="3.5"', "var(--brass)", 1.6) + line("M" + (cx - 1) + " " + (y + 5) + " v24", 1.2, 0.7, "#fff")
      : reg("rect", 'x="' + (cx - 17) + '" y="' + y + '" width="34" height="7" rx="3.5"', "var(--brass)", 1.6) + line("M" + (cx - 12) + " " + (y + 2.2) + " h24", 1.2, 0.7, "#fff"); }
    /* a door: a set-in panel framed by a flat 16 wide stile; the pull sits on the stile, clear of the bevel */
    function door(dx, y0, dw, right) { var out = reg("rect", 'x="' + dx + '" y="' + y0 + '" width="' + dw + '" height="' + (B - 12 - y0) + '" rx="4"', DF, lw);
      out += recess(dx + 16, y0 + 16, dx + dw - 16, B - 28, 9, DF, { side: CB, bottom: "color-mix(in srgb, var(--cab-hi) 70%, #fff)" }, hatch(dx + 16, y0 + 16, dw - 32, 6)) +
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
    /* The double cabinet holds the recipe log (finished later, issue #161). Closed: one wide drawer and two doors, pulls at the
       inner top corners; a RECIPE LOG tape label sits on the left door and the cabinet glows on point. o.logOpen: the doors swing
       all the way open, flat against the neighbours, showing their concealed hinge cups; the log hangs on the left door's inside, and o.inside sits on the cabinet floor. */
    /* What sits in the open log cabinet (o.inside): "cat" a cat asleep in a mixing bowl, "gear" a stand mixer and nested bowls on
       sheet pans, "stash" a DO NOT TOUCH tin and chocolate bars at the back. Each thing is drawn flat at the front, then moved back to
       its depth with at(d): scaling about the vanishing point is exactly what P() does, so the floor line y1 stays on the floor. */
    function cabInside(kind, i0, i1, y1) {
      function at(d, s) { var k = 1 - kk(d); return '<g transform="translate(' + VPX + " " + VPY + ") scale(" + k.toFixed(4) + ") translate(" + (-VPX) + " " + (-VPY) + ')">' + s + "</g>"; }
      function shade(cx, cy, rx, ry) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" style="fill:url(#hatch);opacity:.55"/>'; }
      function el(cx, cy, rx, ry, fill, sw) { return reg("ellipse", 'cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"', fill, sw || 1.8); }
      function pth(d, fill, sw) { return reg("path", 'd="' + d + '"', fill, sw || 1.8); }
      var W = i1 - i0, STEEL = "#d2d0c8", CHOC = "var(--wood-dark)", s = "";
      /* More animals (Ari 2026-11-13): "catB" a grey tabby loafed on a tea towel, "catC" a tuxedo asleep in a banneton,
         "catD" a ginger cat peeking round a stack of bowls, "dogA" a terrier curled on a cushion, "dogB" a dachshund lying
         long. Each is drawn in local units (u right, v up from the floor = negative) about an origin on the floor line. */
      function kit(ox, oy) {
        var Q = function (d) { return d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, function (m, u, v) { return (ox + +u).toFixed(1) + " " + (oy + +v).toFixed(1); }); };
        return { Q: Q, f: function (d, fill, sw) { return pth(Q(d), fill, sw); }, l: function (d, w, op, col) { return line(Q(d), w || 1.2, op || 1, col); },
          h: function (d, op) { return '<path d="' + Q(d) + '" style="fill:url(#hatch);opacity:' + (op || 0.45) + '"/>'; },
          e: function (u, v, rx, ry, fill, sw) { return el(ox + u, oy + v, rx, ry, fill, sw); } };
      }
      /* the front half of an ellipse (rim or base) as two curves, left to right, centre (0, v) */
      function half(rx, v, ry, start) { var c = (0.552 * rx).toFixed(1), q = (0.552 * ry).toFixed(1);
        return (start ? "M " + (-rx) + " " + v + " " : "") + "C " + (-rx) + " " + (v + +q) + " " + (-c) + " " + (v + ry) + " 0 " + (v + ry) + " C " + c + " " + (v + ry) + " " + rx + " " + (v + +q) + " " + rx + " " + v; }
      var GINGER = "color-mix(in srgb, color-mix(in srgb, var(--amber) 55%, var(--wood)) 80%, var(--card))", GREY = "color-mix(in srgb, var(--ink) 30%, var(--card))",
        BLACK = "color-mix(in srgb, var(--ink) 82%, var(--card))", WHITE = "var(--card)", PINK = "color-mix(in srgb, var(--orange) 40%, var(--card))";
      var ANIMALS = {
        catB: function () {
          /* a folded tea towel (cream, two cobalt stripes) and a grey tabby loafed on it, paws tucked, looking out */
          var ox = i0 + W * 0.52, oy = y1, g = kit(ox, oy), tw = 64, th = 10, td = 52, t = "";
          t += shade(ox + 6, oy - 1, 70, 6) + block(ox - tw, oy - th, ox + tw, oy, td, { top: "var(--card)", side: "color-mix(in srgb, var(--card) 80%, var(--wood))" });
          [-46, -38, 38, 46].forEach(function (u) { var a = P(ox + u, oy - th, 0), b = P(ox + u, oy - th, td); t += line("M" + a[0] + " " + a[1] + " L" + b[0] + " " + b[1], 2.4, 0.9, "var(--blue)"); });
          t += reg("rect", 'x="' + (ox - tw) + '" y="' + (oy - th) + '" width="' + 2 * tw + '" height="' + th + '" rx="3"', "var(--card)", 2) +
            g.l("M -62 -5 L 62 -5", 1, 0.6) + g.l("M -46 -10 L -46 0 M -38 -10 L -38 0 M 38 -10 L 38 0 M 46 -10 L 46 0", 2.4, 0.9, "var(--blue)");
          var c = kit(ox, oy - th), cat = shade(ox + 4, oy - th - 1, 44, 4) +
            /* the body: a loaf, haunches either side, a pale bib under the chin */
            c.f("M -44 0 C -49 -16 -44 -34 -28 -42 C -16 -48 16 -48 28 -42 C 44 -34 49 -16 44 0 Z", GREY, 2.2) +
            c.h("M 30 -40 C 43 -32 49 -16 44 0 L 33 0 C 37 -14 37 -28 30 -40 Z", 0.5) +
            c.l("M -40 -4 C -38 -18 -32 -28 -22 -33 M 40 -4 C 38 -18 32 -28 22 -33", 1.4) +
            c.l("M -44 -14 C -40 -15 -37 -18 -36 -22 M -42 -26 C -38 -28 -35 -31 -33 -35 M 44 -14 C 40 -15 37 -18 36 -22 M 42 -26 C 38 -28 35 -31 33 -35", 1.2, 0.75) +
            c.f("M -13 -42 C -14 -26 -8 -8 0 -5 C 8 -8 14 -26 13 -42 Z", "color-mix(in srgb, var(--card) 75%, " + GREY + ")", 1.4) +
            c.f("M -15 0 C -15 -5 -10 -7 -5 -6 C -2 -5 -1 -2 -1 0 Z", "color-mix(in srgb, var(--card) 75%, " + GREY + ")", 1.4) +
            c.f("M 1 0 C 1 -2 2 -5 5 -6 C 10 -7 15 -5 15 0 Z", "color-mix(in srgb, var(--card) 75%, " + GREY + ")", 1.4) +
            /* tail round the right side, along the towel */
            c.l("M 43 -8 C 47 -2 40 1 28 1 C 20 1 14 0 10 -1", 9.5) + c.l("M 43 -8 C 47 -2 40 1 28 1 C 20 1 14 0 10 -1", 6.2, 1, GREY) + c.l("M 36 -2 L 36 3 M 26 -2 L 26 3", 1.1, 0.75) +
            /* the head: ears up, eyes open and calm, small nose, whiskers, the tabby M on the forehead */
            c.f("M -19 -59 L -17 -77 L -6 -69 Z", GREY, 1.8) + c.f("M 19 -59 L 17 -77 L 6 -69 Z", GREY, 1.8) +
            c.l("M -16 -64 L -15.5 -72.5 L -10 -69 M 16 -64 L 15.5 -72.5 L 10 -69", 1, 0.7) +
            c.f("M -21 -52 C -22 -64 -13 -71 0 -71 C 13 -71 22 -64 21 -52 C 20 -41 11 -34 0 -34 C -11 -34 -20 -41 -21 -52 Z", GREY, 2) +
            c.f("M -7 -42 C -7 -47 -3 -48 0 -47 C 3 -48 7 -47 7 -42 C 6 -38 3 -36 0 -36 C -3 -36 -6 -38 -7 -42 Z", "color-mix(in srgb, var(--card) 75%, " + GREY + ")", 1) +
            c.h("M -10 -36 C -6 -33 6 -33 10 -36 C 8 -30 -8 -30 -10 -36 Z", 0.5) +
            c.f("M -12 -54 C -10 -57.5 -5 -57.5 -3 -54 C -5 -52 -10 -52 -12 -54 Z", "color-mix(in srgb, var(--yellow) 65%, var(--stem))", 1.2) +
            c.f("M 3 -54 C 5 -57.5 10 -57.5 12 -54 C 10 -52 5 -52 3 -54 Z", "color-mix(in srgb, var(--yellow) 65%, var(--stem))", 1.2) +
            c.l("M -7.5 -56.6 L -7.5 -52.6 M 7.5 -56.6 L 7.5 -52.6", 1.6) +
            c.f("M -2.6 -47.5 L 2.6 -47.5 L 0 -45 Z", PINK, 1) + c.l("M 0 -45 L 0 -43 C -1 -41.6 -3 -41.6 -4 -42.6 M 0 -43 C 1 -41.6 3 -41.6 4 -42.6", 1) +
            c.l("M -7 -44 L -21 -46 M -7 -43 L -20 -41 M 7 -44 L 21 -46 M 7 -43 L 20 -41", 0.8, 0.55) +
            c.l("M -4 -69 L -3 -62 M 0 -70 L 0 -62 M 4 -69 L 3 -62 M -21 -52 L -15 -51 M -20 -48 L -15 -47.5 M 21 -52 L 15 -51 M 20 -48 L 15 -47.5", 1.2, 0.75);
          return at(16, t + at(24, cat));
        },
        catC: function () {
          /* a round banneton (cane rings) with a tuxedo cat curled asleep in it: black coat, white muzzle, chest and paws */
          var ox = i0 + W * 0.47, oy = y1, g = kit(ox, oy), cane = "color-mix(in srgb, var(--cork) 85%, var(--card))", r = 62, rv = -40, ry = 15, t = "";
          var wall = "M " + (-r) + " " + rv + " " + half(r, rv, ry) + " C " + (r - 1) + " -26 52 -14 46 -11 C 44 -4 24 0 0 0 C -24 0 -44 -4 -46 -11 C -52 -14 " + (-r + 1) + " -26 " + (-r) + " " + rv + " Z";
          t += shade(ox + 8, oy - 1, 64, 6) + g.e(0, rv, r, ry, "color-mix(in srgb, var(--cork) 70%, var(--wood))", 2) +
            [0.82, 0.62, 0.42].map(function (f) { return g.e(0, rv + 2 * (1 - f), r * f, ry * f, "none", 1); }).join("").replace(/stroke-width:1;/g, "stroke-width:1;opacity:.55;");
          /* the cat: body round behind, head tucked at the front right on a white paw, tail round the front left */
          t += g.f("M -52 -22 C -57 -50 -40 -70 -14 -75 C 10 -79 38 -71 51 -56 C 58 -46 57 -32 54 -22 Z", BLACK, 2.2) +
            g.l("M -26 -70 C -46 -62 -52 -44 -44 -28", 1.4, 0.45, WHITE) + g.l("M 2 -76 C 20 -74 36 -66 44 -56", 1.2, 0.3, WHITE) +
            g.f("M -56 -32 C -48 -24 -30 -24 -12 -27 C -2 -29 4 -32 6 -34", "none", 11) + g.l("M -56 -32 C -48 -24 -30 -24 -12 -27 C -2 -29 4 -32 6 -34", 7.6, 1, BLACK) +
            g.f("M 2 -30 C 1 -37 9 -40 16 -38 C 21 -36 21 -30 17 -28 L 5 -28 C 3 -28 2 -29 2 -30 Z", WHITE, 1.6) + g.l("M 9 -28 L 9 -32 M 13 -28 L 13 -32", 0.9, 0.7) +
            g.f("M 13 -55 L 9 -69 L 21 -61 Z", BLACK, 1.8) + g.f("M 35 -62 L 43 -72 L 46 -56 Z", BLACK, 1.8) +
            g.f("M 9 -44 C 8 -56 17 -64 28 -64 C 40 -64 48 -56 48 -45 C 48 -36 40 -30 29 -30 C 17 -30 10 -36 9 -44 Z", BLACK, 2) +
            g.f("M 21 -38 C 23 -42 26 -44 28.8 -42 C 31.5 -44 34.5 -42 36.5 -38 C 36.5 -33 33 -31 28.8 -31 C 24.5 -31 21 -33 21 -38 Z", WHITE, 1.3) +
            g.f("M 26.5 -43.5 L 31 -43.5 L 28.8 -41.2 Z", PINK, 0.9) +
            g.l("M 18 -48 C 20 -46.4 23 -46.4 25 -48 M 33 -48 C 35 -46.4 38 -46.4 40 -48", 1.2, 0.9, WHITE) +
            g.l("M 22 -38 L 10 -39 M 22 -37 L 11 -35 M 35 -38 L 47 -39 M 35 -37 L 46 -35", 0.8, 0.6);
          /* the near wall over everything, with its rings of cane; hatching where it turns from the light */
          t += g.f(wall, cane, 2.2);
          [0.22, 0.44, 0.66, 0.86].forEach(function (f) { var x = r - (r - 46) * f, v = rv + (rv - -11) * -f, fy = 15 + (11 - 15) * f, cy = v + 0; t += g.l("M " + (-x) + " " + v.toFixed(1) + " " + half(x, +v.toFixed(1), fy), 1.1, 0.75); });
          t += g.h("M 58 -30 C 56 -18 46 -6 26 -1 L 18 0 C 36 -6 48 -16 50 -28 Z", 0.45);
          return at(24, t);
        },
        catD: function () {
          /* a stack of four nested mixing bowls at the left; a ginger cat behind it peeks round the right side, one paw over the top rim */
          var ox = i0 + W * 0.42, oy = y1, g = kit(ox, oy), r = 56, ry = 13, h = 34, step = 9, cols = ["var(--card)", "var(--orange)", "color-mix(in srgb, var(--stem) 70%, var(--card))", "var(--card)"];
          /* the cat first (furthest back): its head over the top bowl's far rim, tipped a little, ears up, eyes wide */
          var tv = -h - (cols.length - 1) * step, hx = ox + 14, ck = kit(hx, oy + tv + 42), head = '<g transform="rotate(-10 ' + hx + " " + (oy + tv) + ')">' +
            ck.f("M -16 -72 L -13 -92 L -2 -80 Z", GINGER, 1.8) + ck.f("M 16 -72 L 13 -92 L 2 -80 Z", GINGER, 1.8) +
            ck.l("M -13 -77 L -12 -87 L -6 -81 M 13 -77 L 12 -87 L 6 -81", 1, 0.7) +
            ck.f("M -20 -62 C -21 -75 -12 -82 0 -82 C 12 -82 21 -75 20 -62 C 19 -51 11 -44 0 -44 C -11 -44 -19 -51 -20 -62 Z", GINGER, 2) +
            ck.l("M -4 -80 L -3 -73 M 0 -81 L 0 -73 M 4 -80 L 3 -73 M 20 -63 L 14 -62 M 19 -58 L 14 -57.5", 1.2, 0.75) +
            ck.f("M -7 -52 C -7 -57 -3 -58 0 -57 C 3 -58 7 -57 7 -52 C 6 -48 3 -46 0 -46 C -3 -46 -6 -48 -7 -52 Z", "color-mix(in srgb, var(--card) 70%, " + GINGER + ")", 1) +
            ck.e(-7.5, -64, 4.4, 3.6, "color-mix(in srgb, var(--yellow) 70%, var(--stem))", 1.2) + ck.e(7.5, -64, 4.4, 3.6, "color-mix(in srgb, var(--yellow) 70%, var(--stem))", 1.2) +
            ck.e(-7.5, -64, 1.7, 2.8, "var(--ink)", 0) + ck.e(7.5, -64, 1.7, 2.8, "var(--ink)", 0) +
            ck.f("M -2.6 -57.5 L 2.6 -57.5 L 0 -55 Z", PINK, 1) + ck.l("M 0 -55 L 0 -53 C -1 -51.6 -3 -51.6 -4 -52.6 M 0 -53 C 1 -51.6 3 -51.6 4 -52.6", 1) +
            ck.l("M -7 -54 L -22 -56 M 7 -54 L 22 -56", 0.8, 0.55) + "</g>";
          var cat = head;
          /* the bowls, top one first so each lower bowl's wall covers the one sitting in it */
          var b = "", k, top = cols.length - 1;
          for (k = top; k >= 0; k--) {
            var v = -h - k * step, base = -k * step;
            if (k === top) b += g.e(0, v, r, ry, "color-mix(in srgb, " + cols[k] + " 82%, var(--wood))", 2) + g.e(0, v + 3, r - 8, ry - 3, "none", 1);
            b += g.f("M " + (-r) + " " + v + " " + half(r, v, ry) + " C " + (r - 1) + " " + (v + 22) + " 34 " + (base - 2) + " 24 " + base + " L -24 " + base + " C -34 " + (base - 2) + " " + (-r + 1) + " " + (v + 22) + " " + (-r) + " " + v + " Z", cols[k], 2) +
              (k === 0 || k === top ? g.l("M " + (-r + 3) + " " + (v + 7) + " C -20 " + (v + 21) + " 20 " + (v + 21) + " " + (r - 3) + " " + (v + 7), 4.5, 0.9, "var(--blue)") : "") +
              (k === 0 ? g.h("M 54 -28 C 52 -12 40 -2 28 -1 L 22 -1 C 36 -4 46 -14 48 -26 Z", 0.4) : "");
          }
          b = shade(ox + 6, oy - 1, 62, 6) + b + g.f("M 22 0 L -22 0", "none", 1.6);
          /* one paw hooked over the far rim, to the left of the head */
          var pk = kit(ox - 18, oy + tv - ry + 4), paw = pk.f("M -8 -2 C -9 -8 -3 -11 3 -10 C 8 -9 10 -5 8 2 C 7 6 -6 6 -7 2 Z", GINGER, 1.8) + pk.l("M -3 3 L -3 -1 M 2 3 L 2 -1", 1, 0.75) + pk.l("M -4 -10 L -3 -6 M 2 -10 L 2 -7", 1, 0.6);
          return at(18, cat + b + paw);
        },
        dogA: function () {
          /* a cobalt cushion with piping, and a small scruffy wheaten terrier curled asleep on it, head on its paws at the front left */
          var ox = i0 + W * 0.5, oy = y1, g = kit(ox, oy), rx = 70, tv = -24, ry = 14, coat = "color-mix(in srgb, var(--amber) 32%, var(--card))", t = "";
          t += shade(ox + 8, oy - 1, 74, 6) + g.f("M " + (-rx) + " " + tv + " " + half(rx, tv, ry) + " L " + rx + " -12 C " + rx + " -5.4 38.6 0 0 0 C -38.6 0 " + (-rx) + " -5.4 " + (-rx) + " -12 Z", "var(--blue)", 2) +
            g.e(0, tv, rx, ry, "var(--blue-hi)", 2) + g.l("M " + (-rx + 2) + " " + (tv + 2) + " " + half(rx - 2, tv + 2, ry - 1), 1.2, 0.6, WHITE) +
            g.h("M 66 -18 C 60 -8 40 -2 20 -1 L 12 -1 C 36 -4 56 -10 62 -20 Z", 0.4);
          /* the body: a smooth curled mound; scruff comes from short flicks along the back and loose fur lines, not a jagged edge */
          t += g.f("M -26 -24 C -32 -46 -14 -64 10 -66 C 34 -68 54 -56 58 -40 C 60 -30 56 -22 48 -18 C 30 -15 0 -15 -22 -18 Z", coat, 2.2) +
            g.l("M -16 -56 C -18 -58 -20 -58 -21 -57 M -4 -62 C -6 -64 -8 -65 -9 -64 M 10 -65 C 8 -68 6 -68 5 -68 M 24 -65 C 26 -68 28 -68 29 -67 M 37 -60 C 40 -62 42 -62 43 -61 M 48 -53 C 51 -54 53 -54 54 -53", 1.3, 0.9) +
            g.h("M 44 -58 C 56 -50 60 -38 56 -26 L 46 -22 C 50 -34 50 -48 44 -58 Z", 0.45) +
            g.l("M -6 -56 L -4 -52 M 6 -60 L 7 -56 M 18 -58 L 18 -54 M 30 -54 L 29 -50 M 12 -48 L 13 -44 M 40 -44 L 38 -40 M 24 -44 L 23 -40", 1, 0.6) +
            g.l("M 30 -18 C 22 -30 28 -44 42 -48", 1.4, 0.8);
          var hk = kit(ox - 30, oy + 2), paw = "color-mix(in srgb, " + coat + " 85%, var(--card))";
          var head = hk.f("M -34 -20 C -35 -25 -29 -27 -24 -26 C -20 -25 -19 -21 -21 -19 L -32 -19 Z", paw, 1.6) + hk.f("M -20 -20 C -21 -25 -15 -27 -10 -26 C -6 -25 -5 -21 -7 -19 L -18 -19 Z", paw, 1.6) +
            hk.l("M -29 -19 L -29 -22 M -15 -19 L -15 -22", 0.9, 0.7) +
            hk.f("M 13 -53 L 22 -58 L 23 -47 C 19 -46 15 -48 13 -53 Z", "color-mix(in srgb, " + coat + " 70%, var(--wood))", 1.6) +
            /* skull, square muzzle and beard in one outline, facing down-left onto the paws */
            hk.f("M -10 -49 C -16 -49 -23 -47 -28 -44 C -32 -42 -33 -35 -31 -31 C -32 -28 -31 -25 -28 -24 C -26 -22 -24 -23 -23 -24 C -21 -21 -19 -21 -18 -23 C -15 -20 -11 -20 -9 -22 C -2 -20 10 -22 16 -28 C 22 -34 22 -47 14 -53 C 8 -58 -4 -58 -10 -48 Z", coat, 2) +
            hk.h("M 14 -50 C 21 -44 21 -34 15 -28 L 10 -27 C 15 -34 16 -44 14 -50 Z", 0.4) +
            hk.l("M -28 -26 L -27 -30 M -22 -24 L -22 -28 M -16 -24 L -17 -28", 0.9, 0.6) + hk.l("M -30 -32 C -24 -31 -18 -31 -12 -33", 1, 0.7) +
            hk.e(-30, -40, 3.2, 2.5, "var(--ink)", 1) +
            /* bushy brow over a closed eye; a folded ear flap tipped forward, the far ear just showing */
            hk.l("M -13 -39 C -11 -37 -7 -37 -5 -39", 1.4) + hk.l("M -16 -42 C -13 -46 -7 -46 -3 -43 M -14 -43 L -16 -45 M -9 -45 L -10 -47", 1.2, 0.85) +
            hk.f("M -2 -55 C 3 -59 10 -58 12 -53 C 9 -49 3 -46 -3 -46 C -5 -49 -4 -53 -2 -55 Z", "color-mix(in srgb, " + coat + " 70%, var(--wood))", 1.8) +
            hk.l("M 2 -40 L 5 -38 M 8 -32 L 11 -31 M 0 -28 L 3 -27", 1, 0.55);
          return at(18, t + head);
        },
        dogB: function () {
          /* a red dachshund lying long along the floor, head on its front paws at the left, long ears flopped down, tail out to the right */
          var ox = i0 + W * 0.53, oy = y1, g = kit(ox, oy), red = "color-mix(in srgb, var(--wood) 60%, var(--orange))", ear = "color-mix(in srgb, var(--wood) 80%, var(--ink))", t = "";
          t += shade(ox, oy - 1, 120, 6) +
            g.l("M 78 -9 C 92 -8 106 -6 120 -3", 7.5) + g.l("M 78 -9 C 92 -8 106 -6 119 -3", 4.4, 1, red) +
            /* body: chest at left, low belly, rump at right */
            g.f("M -62 -6 C -64 -22 -52 -33 -30 -34 C -2 -35 30 -35 52 -33 C 72 -32 84 -22 82 -9 C 81 -3 76 0 70 0 L -54 0 C -59 0 -62 -2 -62 -6 Z", red, 2.2) +
            g.h("M -54 0 L 70 0 C 74 0 78 -2 80 -6 C 60 -4 0 -5 -58 -4 C -58 -2 -56 0 -54 0 Z", 0.5) +
            g.h("M 66 -32 C 78 -28 84 -18 82 -9 L 74 -8 C 76 -18 72 -26 66 -32 Z", 0.45) +
            /* the hind leg folded at the right, its paw out in front */
            g.l("M 46 -1 C 42 -16 50 -28 66 -28", 1.4, 0.85) + g.f("M 56 0 C 56 -5 64 -7 72 -6 C 77 -5 78 0 75 1 L 58 1 Z", red, 1.6) + g.l("M 66 1 L 66 -3 M 70 1 L 70 -3", 0.9, 0.7) +
            /* front paws stretched out under the chin */
            g.f("M -78 0 C -78 -6 -96 -7 -106 -6 C -112 -5 -113 1 -109 1 Z", red, 1.6) + g.l("M -104 1 L -104 -3 M -100 1 L -100 -3", 0.9, 0.7) +
            /* the head on the paws: long muzzle to the left, eye open, calm */
            g.f("M -56 -26 C -62 -37 -80 -38 -90 -31 C -98 -26 -108 -22 -113 -16 C -116 -11 -113 -6 -106 -6 L -72 -6 C -62 -8 -54 -16 -56 -26 Z", red, 2) +
            g.e(-112.5, -14.5, 3.2, 2.4, "var(--ink)", 1) + g.l("M -109 -9 C -103 -8.5 -98 -9 -94 -10", 1.1, 0.8) +
            g.f("M -86 -26 C -84 -28.6 -80 -28.6 -78 -26 C -80 -24.4 -84 -24.4 -86 -26 Z", "var(--ink)", 1) + g.l("M -87 -28.5 C -84 -31 -79 -31 -77 -28.5", 1.1, 0.8) +
            /* the long ear hanging from the back of the head down to the floor, over the paw */
            g.f("M -64 -32 C -55 -30 -52 -16 -56 -5 C -58 0 -68 1 -72 -2 C -76 -10 -74 -24 -70 -32 C -68 -33 -66 -33 -64 -32 Z", ear, 1.8) +
            g.l("M -64 -27 C -62 -18 -63 -10 -66 -4", 1, 0.5, WHITE);
          return at(30, t);
        }
      };
      if (kind === "cat") {
        /* a cream mixing bowl with a blue band; a quiet tabby curled asleep inside, head tucked against the body, tail wrapped round
           the front over the near rim. Drawn in local units (u, v) about the rim's centre; the near wall is drawn last so it hides the cat's lower edge. */
        var bx = i0 + W * 0.5, by = y1, r = 66, ry = 17, rimY = by - 44, cat = "color-mix(in srgb, color-mix(in srgb, var(--amber) 55%, var(--wood)) 80%, var(--card))";
        var R = function (d) { return d.replace(/M (-?[\d.]+) (-?[\d.]+)/g, function (m, u, v) { return "M" + (bx + +u) + " " + (rimY + +v); }); };
        var Q = function (d) { return d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, function (m, u, v) { return (bx + +u) + " " + (rimY + +v); }); };
        var wall = "M" + (bx - r) + " " + rimY + " A" + r + " " + ry + " 0 0 0 " + (bx + r) + " " + rimY + " C" + (bx + r - 2) + " " + (by - 10) + " " + (bx + 40) + " " + (by - 2) + " " + (bx + 26) + " " + (by - 2) + " L" + (bx - 26) + " " + (by - 2) + " C" + (bx - 40) + " " + (by - 2) + " " + (bx - r + 2) + " " + (by - 10) + " " + (bx - r) + " " + rimY + "Z";
        var tail = Q("M 61 12 C 52 14 34 15 14 14 S -14 11 -24 5");
        s += shade(bx + 8, by - 1, 68, 6) + el(bx, rimY, r, ry, "color-mix(in srgb, var(--card) 80%, var(--wood))", 2) +
          /* the body: a loaf filling the bowl, rising above the far rim */
          pth(Q("M -54 14 C -58 -6 -46 -22 -24 -28 C -4 -33 26 -34 44 -25 C 58 -18 62 -4 60 14 Z"), cat, 2.2) +
          '<path d="' + Q("M 42 -25 C 56 -18 62 -4 60 14 L 46 14 C 50 0 49 -14 42 -25 Z") + '" style="fill:url(#hatch);opacity:.5"/>' +
          line(Q("M 14 -32 C 32 -28 42 -14 38 6"), 1.4) +
          line(R("M -6 -31 q3 5 1 9 M 6 -32 q3 5 1 9 M 18 -31 q4 4 3 8 M 28 -27 q4 4 4 8 M 44 -16 q-4 3 -6 7 M 49 -6 q-5 2 -7 6"), 1.2, 0.75) +
          /* the head, tucked low at the front left: two small ears, eyes shut */
          pth(Q("M -44 -15 L -47 -29 L -36 -22 Z"), cat, 1.8) + pth(Q("M -22 -24 L -16 -32 L -13 -19 Z"), cat, 1.8) +
          pth(Q("M -47 -6 C -48 -18 -38 -25 -28 -25 C -17 -25 -10 -18 -10 -8 C -10 1 -18 6 -28 6 C -39 6 -46 1 -47 -6 Z"), cat, 2) +
          '<path d="' + Q("M -14 -20 C -10 -14 -9 -6 -12 0 C -15 -4 -16 -12 -14 -20 Z") + '" style="fill:url(#hatch);opacity:.45"/>' +
          line(R("M -44 -23 l 1 4 M -18 -27 l -1 4"), 1, 0.7) +
          line(R("M -40 -11 q 3 2.2 6 0 M -25 -12 q 3 2.2 6 0"), 1.4) +
          line(R("M -32 -24 l 0.5 5 M -27 -24 l -0.5 5"), 1.1, 0.7) +
          /* the tail along the front, its tip under the chin, ringed near the end */
          line(tail, 11, 1) + line(tail, 7.5, 1, cat) +
          line(R("M 30 10 l 1 8 M 16 10 l 0.5 8 M 2 9 l 0 7 M -11 6 l -1 6"), 1.1, 0.75) +
          /* the near wall over the cat's lower edge, with its band and foot; hatching on the right where the bowl turns from the light */
          pth(wall, "var(--card)", 2.2) +
          line("M" + (bx - r + 3) + " " + (rimY + 9) + " Q" + bx + " " + (rimY + 34) + " " + (bx + r - 3) + " " + (rimY + 9), 5, 0.9, "var(--blue)") +
          '<path d="' + Q("M 64 8 C 63 26 46 42 28 42 L 22 42 C 40 37 54 26 57 12 Z") + '" style="fill:url(#hatch);opacity:.35"/>' +
          reg("rect", 'x="' + (bx - 26) + '" y="' + (by - 4) + '" width="52" height="4" rx="1.5"', "var(--card)", 1.6);
        return at(26, s);
      }
      if (ANIMALS[kind]) return ANIMALS[kind]();
      if (kind === "gear") {
        /* left: three sheet pans stacked flat, nested bowls on top. right: a cobalt stand mixer (no badge) */
        var p0 = i0 + 16, p1 = i0 + 146, pans = "";
        pans = block(p0, y1 - 15, p1, y1, 54, { top: STEEL, side: "color-mix(in srgb, #d2d0c8 85%, #000)" });
        [0, 1, 2].forEach(function (k) { pans += reg("rect", 'x="' + p0 + '" y="' + (y1 - 5 * (k + 1)) + '" width="' + (p1 - p0) + '" height="5"', STEEL, 1.4); });
        var nx = (p0 + p1) / 2 + 4, ny = y1 - 15, nr = 52, top = ny - 38;
        var bowls = shade(nx - 6, ny - 1, 56, 5) + pth("M" + (nx - nr) + " " + top + " C" + (nx - nr + 2) + " " + (ny - 8) + " " + (nx - 30) + " " + ny + " " + (nx - 20) + " " + ny + " L" + (nx + 20) + " " + ny + " C" + (nx + 30) + " " + ny + " " + (nx + nr - 2) + " " + (ny - 8) + " " + (nx + nr) + " " + top + "Z", "var(--orange)", 2) +
          el(nx, top, nr, 13, "color-mix(in srgb, var(--orange) 70%, #fff)") + el(nx, top + 5, 41, 10, "var(--card)") + el(nx, top + 9, 30, 7.5, "var(--blue-hi)") + el(nx, top + 12, 18, 4.5, "color-mix(in srgb, var(--blue) 60%, #000)", 1.2);
        s += at(10, pans) + at(36, bowls);
        var mx = i1 - 158, B0 = y1, BL = "var(--blue)", mix = shade(mx + 40, B0 - 1, 70, 6) +
          block(mx, B0 - 12, mx + 116, B0, 30, { top: "var(--blue-hi)", side: "var(--blue-back)" }) + reg("rect", 'x="' + mx + '" y="' + (B0 - 12) + '" width="116" height="12" rx="4"', BL, 2) +
          pth("M" + (mx + 82) + " " + (B0 - 12) + " L" + (mx + 86) + " " + (B0 - 80) + " L" + (mx + 110) + " " + (B0 - 80) + " L" + (mx + 112) + " " + (B0 - 12) + "Z", BL, 2) +
          el(mx + 44, B0 - 48, 31, 7, "color-mix(in srgb, #d2d0c8 60%, #000)") + line("M" + (mx + 46) + " " + (B0 - 78) + " V" + (B0 - 52), 3) +
          pth("M" + (mx + 13) + " " + (B0 - 48) + " A31 7 0 0 0 " + (mx + 75) + " " + (B0 - 48) + " C" + (mx + 73) + " " + (B0 - 22) + " " + (mx + 60) + " " + (B0 - 13) + " " + (mx + 50) + " " + (B0 - 13) + " L" + (mx + 38) + " " + (B0 - 13) + " C" + (mx + 28) + " " + (B0 - 13) + " " + (mx + 15) + " " + (B0 - 22) + " " + (mx + 13) + " " + (B0 - 48) + "Z", STEEL, 2) +
          line("M" + (mx + 22) + " " + (B0 - 38) + " Q" + (mx + 44) + " " + (B0 - 30) + " " + (mx + 66) + " " + (B0 - 38), 1.2, 0.6, "#fff") +
          reg("rect", 'x="' + (mx + 12) + '" y="' + (B0 - 106) + '" width="104" height="30" rx="15"', BL, 2) + line("M" + (mx + 28) + " " + (B0 - 100) + " H" + (mx + 96), 1.4, 0.6, "#fff") +
          reg("circle", 'cx="' + (mx + 22) + '" cy="' + (B0 - 91) + '" r="6"', STEEL, 1.6) + line("M" + (mx + 104) + " " + (B0 - 84) + " l12 -4", 3) + reg("circle", 'cx="' + (mx + 117) + '" cy="' + (B0 - 88) + '" r="3"', STEEL, 1.4);
        return s + at(20, mix);
      }
      /* stash: a tin against the back wall with DO NOT TOUCH taped on it, a bar standing behind it, and a little stack of bars in front;
         the top bar is opened, foil peeled back, two squares gone */
      var tx = i0 + W * 0.56, tw = 82, th = 62, tin = "var(--blue)";
      var back = reg("rect", 'x="' + (tx + tw + 8) + '" y="' + (y1 - 78) + '" width="34" height="78" rx="2"', "var(--orange)", 2) + reg("rect", 'x="' + (tx + tw + 8) + '" y="' + (y1 - 52) + '" width="34" height="22"', "var(--card)", 1.4) +
        line("M" + (tx + tw + 14) + " " + (y1 - 41) + " h22", 1.2, 0.5);
      var tinS = shade(tx + tw / 2 - 12, y1 - 1, tw / 2 + 14, 6) + pth("M" + tx + " " + (y1 - th) + " V" + (y1 - 4) + " A" + (tw / 2) + " 7 0 0 0 " + (tx + tw) + " " + (y1 - 4) + " V" + (y1 - th) + "Z", tin, 2) +
        pth("M" + (tx - 2) + " " + (y1 - th) + " V" + (y1 - th + 10) + " A" + (tw / 2 + 2) + " 8 0 0 0 " + (tx + tw + 2) + " " + (y1 - th + 10) + " V" + (y1 - th) + "Z", "var(--blue-hi)", 2) +
        el(tx + tw / 2, y1 - th, tw / 2 + 2, 9, "var(--blue-hi)", 2) + el(tx + tw / 2, y1 - th, tw / 2 - 8, 5, "none", 1) +
        '<g transform="rotate(-4 ' + (tx + tw / 2) + " " + (y1 - 28) + ')">' + tape(tx + tw / 2, y1 - 28, 76, 26, 0, 0.97) + marker(tx + tw / 2, y1 - 31, "Do not", 9.5) + marker(tx + tw / 2, y1 - 20, "touch", 9.5) + "</g>";
      s += at(44, back) + at(42, tinS);
      var b0 = i0 + 40, b1 = i0 + 150, bars = shade(b0 + 48, y1 - 1, 66, 5), cols = ["var(--stem)", "var(--orange)", "var(--blue)"];
      cols.forEach(function (c, k) { var y = y1 - 9 * (k + 1), x0 = b0 + k * 4, x1 = b1 - k * 3, open = k === 2;
        bars += block(x0, y, x1, y + 9, 34, { top: open ? CHOC : "color-mix(in srgb, " + c + " 75%, #fff)", side: "color-mix(in srgb, " + c + " 70%, #000)" });
        if (open) { /* the chocolate's top: squares, two missing at the front left; the wrapper still on the right half */
          var q = function (x, d) { return P(x, y, d); }, gx, gy, A, Bq, C, D, cw = (x1 - x0) / 6;
          for (gx = 0; gx < 3; gx++) for (gy = 0; gy < 2; gy++) { if (gy === 0 && gx < 2) continue; A = q(x0 + gx * cw + 1.5, gy * 17 + 1.5); Bq = q(x0 + (gx + 1) * cw - 1.5, gy * 17 + 1.5); C = q(x0 + (gx + 1) * cw - 1.5, gy * 17 + 15.5); D = q(x0 + gx * cw + 1.5, gy * 17 + 15.5);
            bars += face([A, Bq, C, D], "color-mix(in srgb, var(--wood) 70%, #000)", 1); }
          bars += face([q(x0 + cw * 3, 0), q(x1, 0), q(x1, 34), q(x0 + cw * 3, 34)], "color-mix(in srgb, " + c + " 75%, #fff)", 1.6) + face([q(x0 + cw * 3 - 6, 0), q(x0 + cw * 3 + 2, 0), q(x0 + cw * 3 + 2, 34), q(x0 + cw * 3 - 6, 34)], STEEL, 1.2);
          bars += reg("rect", 'x="' + x0 + '" y="' + y + '" width="' + (cw * 3 - 6) + '" height="9"', CHOC, 1.6) + reg("rect", 'x="' + (x0 + cw * 3 - 6) + '" y="' + y + '" width="8" height="9"', STEEL, 1.4) + reg("rect", 'x="' + (x0 + cw * 3 + 2) + '" y="' + y + '" width="' + (x1 - x0 - cw * 3 - 2) + '" height="9"', c, 1.6);
        } else bars += reg("rect", 'x="' + x0 + '" y="' + y + '" width="' + (x1 - x0) + '" height="9"', c, 1.6) + reg("rect", 'x="' + ((x0 + x1) / 2 - 14) + '" y="' + (y + 2) + '" width="28" height="5"', "var(--card)", 1);
      });
      return s + at(28, bars);
    }
    function logCab(a0, a1) {
      var LOG = [["11/11", "Croissants trial 4", "shatter good"], ["11/08", "Blondies", "less sugar"], ["11/05", "Rough puff pastry", "six folds"], ["11/02", "Rhubarb galette", "swapped spelt"]];
      var g = 14, dw = (a1 - a0 - 3 * g) / 2, lx = a0 + g + dw / 2 - 8, out = drawer(a0 + g, a1 - g),
        tag = '<g transform="rotate(-2 ' + lx + ' 602)">' + tape(lx, 602, 128, 20, 0, 0.96, "lbl") + marker(lx, 607.5, "Recipe log", 14) + "</g>";
      if (!o.logOpen) return hot("the recipe log", out + door(a0 + g, 556, dw, true) + tag + door(a0 + 2 * g + dw, 556, dw, false), [a0, 500, a1 - a0, B - 508]);
      var i0 = a0 + g, i1 = a1 - g, y0 = 556, y1 = B - 12, d = 70;
      out += recess(i0, y0, i1, y1, d, "color-mix(in srgb, var(--wood-hi) 55%, #fff)", { side: "color-mix(in srgb, var(--wood-hi) 40%, #8a6a4a)", top: "color-mix(in srgb, var(--wood) 70%, #000)", bottom: "var(--wood-hi)" }, cabInside(o.inside || "cat", i0, i1, y1)) + reg("rect", 'x="' + i0 + '" y="' + y0 + '" width="' + (i1 - i0) + '" height="' + (y1 - y0) + '"', "none", 2);
      /* the clipboard hangs on a screw on the inside of the left door, clear of the hinge cups; the clip holds the log sheet */
      var cx0 = i0 - dw + 9, cw = dw - 46, ct = y0 + 10, ch = y1 - y0 - 16, px = cx0 + 6, pw = cw - 12, mx = cx0 + cw / 2,
        clip = hatch(cx0 + 4, ct + 5, cw, ch, 0.4) + reg("rect", 'x="' + cx0 + '" y="' + ct + '" width="' + cw + '" height="' + ch + '" rx="4"', "var(--wood-hi)", 1.8) +
        reg("rect", 'x="' + px + '" y="' + (ct + 10) + '" width="' + pw + '" height="' + (ch - 15) + '"', "var(--card)", 1.2) +
        reg("rect", 'x="' + (mx - 16) + '" y="' + (ct - 4) + '" width="32" height="15" rx="3"', "#d2d0c8", 1.6) +
        reg("circle", 'cx="' + mx + '" cy="' + (ct + 3) + '" r="2.6"', "var(--brass)", 1.2) +
        T(mx, ct + 26, "Recipe log", "font:700 12px var(--font-hand);fill:var(--ink)", 'text-anchor="middle"') + line("M" + (px + 4) + " " + (ct + 30) + " H" + (px + pw - 4), 1, 0.85, "#c9442a");
      LOG.forEach(function (r, k) { var ry = ct + 43 + k * 19;
        clip += T(px + 3, ry, r[0], "font:600 8.5px var(--font-hand);fill:var(--ink-soft)") + T(px + 25, ry, r[1], "font:700 9px var(--font-hand);fill:var(--ink)") +
          T(px + 25, ry + 9, r[2], "font:600 8.5px var(--font-hand);fill:var(--ink-soft)") + line("M" + (px + 2) + " " + (ry + 13) + " H" + (px + pw - 2), 0.8, 0.6, "#c3d2ec"); });
      /* the doors' backs: plain, with two hinge cups each by the hinge edge */
      function back(x, hingeX) { var b = reg("rect", 'x="' + x + '" y="' + y0 + '" width="' + dw + '" height="' + (y1 - y0) + '" rx="4"', DF, lw);
        [y0 + 22, y1 - 22].forEach(function (cy) { b += reg("circle", 'cx="' + hingeX + '" cy="' + cy + '" r="8"', "#d2d0c8", 1.6) + reg("rect", 'x="' + (hingeX - (hingeX > x + dw / 2 ? 20 : -4)) + '" y="' + (cy - 3) + '" width="16" height="6" rx="2"', "#d2d0c8", 1.2); });
        return b; }
      late += hatch(i0 - dw, y1, dw, 5) + back(i0 - dw, i0 - 14) + clip + back(i1, i1 + 14);
      return out;
    }
    /* the shelf sits a little left of the vanishing point: both inner walls show (the right one wider), and each tier's floor; the ceilings don't.
       Two boards of the same thickness: the middle one and the bottom rail. Both tier floors are the same pale wood. */
    var m0 = 495 + Math.round((B - 539) * 0.52), m1 = m0 + 22, b0 = B - 22, tH = m0 - 495, lH = b0 - m1, SD = 26;
    var DEEP = "var(--cab-deep)", SH = { side: "var(--cab-side)", bottom: "color-mix(in srgb, var(--wood-hi) 40%, #fff)" };
    s += reg("rect", 'x="' + sx + '" y="495" width="' + sw + '" height="' + (B - 495) + '"', DEEP) + recess(sx, 495, sx + sw, m0, SD, DEEP, SH) + recess(sx, m1, sx + sw, b0, SD, DEEP, SH);
    [m0, b0].forEach(function (y, k) { s += reg("rect", 'x="' + sx + '" y="' + y + '" width="' + sw + '" height="22"', "var(--wood)", 2.4) + grain(sx + 4, y + 2, sw - 8, 18, 31 + k); });
    /* a book: its top (page edges) and the side facing the centre show */
    function bk(x, y, w, h, fill, rx) { return block(x, y, x + w, y + h, 18, { top: w > h ? "color-mix(in srgb, " + fill + " 72%, #fff)" : "#f6efdc", side: "color-mix(in srgb, " + fill + " 72%, #000)" }) + reg("rect", 'x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 1.5) + '"', fill, 2.2); }
    /* tape on the front edge of the board each row stands on, written in marker */
    function label(edge, text, cx) { return '<g transform="rotate(-1 ' + cx + " " + (edge + 11) + ')">' + tape(cx, edge + 11, text.length * 11 + 30, 19, 0, 0.96, "lbl") + marker(cx, edge + 16.5, text, 14) + "</g>"; }
    var top = "", books = [[22, 18, 0.84, "var(--orange)"], [41, 25, 0.91, "var(--card)"], [67, 16, 0.77, "var(--blue)"], [84, 22, 0.87, "var(--yellow)"]];
    books.forEach(function (b, k) { var bx = sx + b[0], bh = Math.round(b[2] * tH), by = m0 - bh;
      top += bk(bx, by, b[1], bh, b[3]) + line("M" + (bx + 2) + " " + (by + 8) + " H" + (bx + b[1] - 2) + " M" + (bx + 2) + " " + (by + bh - 10) + " H" + (bx + b[1] - 2), 1.2, 0.7);
      if (k % 2 === 0) top += reg("rect", 'x="' + (bx + 3) + '" y="' + (by + 16) + '" width="' + (b[1] - 6) + '" height="10"', "var(--card)", 1.4); else top += line("M" + (bx + b[1] / 2) + " " + (by + 20) + " V" + (by + bh - 22), 1.2, 0.6); });
    top += bk(sx + 112, m0 - 22, 108, 22, "var(--stem)") + reg("rect", 'x="' + (sx + 128) + '" y="' + (m0 - 18) + '" width="34" height="14"', "var(--card)", 1.2);
    var h1 = Math.round(lH * 0.9), h2 = Math.round(lH * 0.78), low = bk(sx + 22, b0 - h1, 20, h1, "var(--amber)") + bk(sx + 44, b0 - h2, 34, h2, "var(--card)", 2) +
      '<circle cx="' + (sx + 61) + '" cy="' + (b0 - h2 * 0.38).toFixed(1) + '" r="6" style="fill:var(--paper);stroke:var(--ink);stroke-width:1.6"/>' + bk(sx + 84, b0 - 22, 100, 22, "var(--blue)");
    s += hot("the references", clipTo(sx, m1, sx + sw, b0, low) + label(b0, "References", sx + sw - 96), [sx + 6, m1 + 4, sw - 12, B - m1 - 8]);
    /* drawn second, so the lower tier's glow never washes over the Cookbooks label */
    s += hot("the cookbooks", clipTo(sx, 495, sx + sw, m0, top) + label(m0, "Cookbooks", sx + 110), [sx + 6, 499, sw - 12, m1 - 503]);
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
  /* Options. floor: check | boards | flat | none. tile: quiet | none. plan: dev | cook | guest. */
  var o = { cover: "black", name: "Trials", depth: "dim", tile: "quiet", plan: "dev", bites: 0, floor: "check" };
  function vpOf() { return VP; }
  function withView(vpy, zf, fn) { var a = VPY, b = ZF; VPY = vpy; ZF = zf; var r = fn(); VPY = a; ZF = b; return r; }
  function opts(extra) { var r = {}; for (var k in o) r[k] = o[k]; for (var e in extra) r[e] = extra[e]; return r; }
  function mainVP() { return VP; }
