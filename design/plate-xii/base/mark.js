/* The eclair mark (G) from Mark Plate v2. MK2.sv('G', {sm, dark, ang}, height) returns an <svg>; MK2.at(...) places one inside another svg. */
(function () {
  var PAPER = "#EEF0DF", COBALT = "#2F4E9A", PRUSS = "#24406E", DAND = "#F2C230", INK = "#1F1D1A", eid = 0;
  /* Eclair in local coords, 0..L by 0..H, glaze on top. Same ink-and-flat-colour style as the kitchen's eclair
     (the kitchen's own helper is private to kitchen.js, so this redraws it): choux amber, chocolate glaze with drips, white drizzle. */
  function ecl(L, H, o) {
    o = o || {}; var sm = !!o.sm, id = "mk2c" + (eid++), sw = sm ? 5.5 : 2.8, ol = o.dark ? PAPER : INK, rx = (H * 0.3).toFixed(1), yb = H * (o.text ? 0.64 : 0.52),
      n = sm ? 3 : (L > 180 ? 5 : 4), w = (L + 8) / n, dr = [0.5, 0.2, 0.62, 0.28, 0.45], d = "M-4 -4 H" + (L + 4) + " V" + yb.toFixed(1), i, s = "", r = function (st) { return '<rect x="0" y="0" width="' + L + '" height="' + H + '" rx="' + rx + '" style="' + st + '"/>'; };
    for (i = n - 1; i >= 0; i--) d += " Q" + (-4 + i * w + w / 2).toFixed(1) + " " + (yb + H * dr[i % 5] * (o.text ? 0.7 : 1)).toFixed(1) + " " + (-4 + i * w).toFixed(1) + " " + yb.toFixed(1);
    d += " Z";
    s += '<defs><clipPath id="' + id + '"><rect x="0" y="0" width="' + L + '" height="' + H + '" rx="' + rx + '"/></clipPath></defs>';
    if (!sm) s += '<g transform="translate(5 6)">' + r("fill:url(#hatch);opacity:.8") + "</g>";
    if (o.dark) s += r("fill:none;stroke:" + PAPER + ";stroke-width:" + (sw + 5) + ";stroke-linejoin:round");
    s += r("fill:#F5A23A;stroke:" + ol + ";stroke-width:" + sw + ";stroke-linejoin:round");
    if (!sm) for (i = 0; i < 3; i++) s += '<path d="M' + (L * (0.2 + i * 0.26)).toFixed(1) + " " + (H * 0.88).toFixed(1) + ' q5 -3 11 -1" style="fill:none;stroke:' + INK + ';stroke-width:1.2;opacity:.55;stroke-linecap:round"/>';
    s += '<g clip-path="url(#' + id + ')"><path d="' + d + '" style="fill:#8A4F2A;stroke:' + INK + ";stroke-width:" + (sm ? 4.5 : 2.2) + ';stroke-linejoin:round"/>';
    if (!sm && !o.text) {
      var a = L * 0.1, y = H * 0.26; s += '<path d="M' + (L * 0.14).toFixed(1) + " " + y.toFixed(1) + " q" + (a / 2).toFixed(1) + " " + (-H * 0.11).toFixed(1) + " " + a.toFixed(1) + " 0" + (" t" + a.toFixed(1) + " 0").repeat(6) + '" style="fill:none;stroke:#FFF4DC;stroke-width:2.6;stroke-linecap:round;opacity:.9"/>';
    }
    s += "</g>" + r("fill:none;stroke:" + ol + ";stroke-width:" + sw + ";stroke-linejoin:round");
    if (o.text) s += '<text x="' + (L / 2) + '" y="' + (H * 0.57).toFixed(1) + '" text-anchor="middle" style="font:700 ' + (H * 0.64).toFixed(1) + "px Caveat,cursive;fill:#FFF4DC;" + (sm ? "stroke:#FFF4DC;stroke-width:2.5;" : "") + '">T&amp;E</text>';
    return s;
  }
  window.MK2 = {
    ecl: ecl, tapeAng: -4,
    names: { B: "Marker on tape", G: "Plain eclair, at the tape's angle", H: "Eclair with T&E on the glaze", I: "One-stem monogram, the stem is an eclair", J: "Monogram, the T's bar is an eclair" },
    make: function (k, o) {
      o = o || {}; var sm = !!o.sm, g = "", S = function (n) { return (n * (sm ? 2.4 : 1)).toFixed(2); };
      if (k === "B") {
        var h = o.pad ? 112 : 76, y0 = 75 - h / 2, y1 = 75 + h / 2, st = 2 * Math.round(h / 24), dy = h / st, p = "M12 " + y0 + " H228", j, R = [], x;
        for (j = 1; j <= st; j++) R.push([j % 2 ? 222 : 228, y0 + j * dy]);
        R.forEach(function (q) { p += " L" + q[0] + " " + q[1].toFixed(1); }); p += " H12";
        R.slice().reverse().forEach(function (q) { p += " L" + (240 - q[0]) + " " + q[1].toFixed(1); }); p += " Z";
        g = '<g transform="rotate(-4 120 75)">' + (sm ? "" : '<path d="' + p + '" transform="translate(5 6)" style="fill:url(#hatch);opacity:.8"/>') +
          '<path d="' + p + '" style="fill:' + o.tape + ";stroke:" + INK + ";stroke-width:" + S(2.6) + ';stroke-linejoin:round"/>' +
          '<text x="120" y="103" text-anchor="middle" style="font:700 82px Caveat,cursive;fill:' + o.ink + (sm ? ";stroke:" + o.ink + ";stroke-width:2.5" : "") + '">T&amp;E</text></g>';
        return { vw: 240, vh: 150, g: g };
      }
      if (k === "G" || k === "H") {
        var ang = o.ang != null ? o.ang : -4;
        if (o.ang != null) return { vw: 240, vh: 240, g: '<g transform="translate(120 120) rotate(' + ang + ') translate(-108 -40)">' + ecl(216, 80, { sm: sm, dark: o.dark, text: k === "H" }) + "</g>" };
        return { vw: 240, vh: 112, g: '<g transform="rotate(-4 120 56)"><g transform="translate(12 16)">' + ecl(216, 80, { sm: sm, dark: o.dark, text: k === "H" }) + "</g></g>" };
      }
      /* I and J: bars as in v1's D, but one of them is an eclair */
      var bf = o.dark ? PAPER : COBALT, bs = o.dark ? PAPER : INK, bar = function (x, y, w, hh) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + hh + '" style="fill:' + bf + ";stroke:" + bs + ";stroke-width:" + S(3) + ';stroke-linejoin:round"/>'; };
      var amp = '<text x="55" y="' + (sm ? 172 : 168) + '" text-anchor="middle" style="font:400 ' + (sm ? 84 : 66) + "px 'Young Serif',Georgia,serif;fill:" + (o.dark ? PAPER : INK) + '">&amp;</text>';
      var eo = { sm: sm, dark: o.dark };
      if (k === "I") {
        g = bar(14, 20, 186, 32) + bar(100, 90, 80, 28) + bar(100, 148, 100, 32) + '<g transform="translate(112 100) rotate(90) translate(-80 -23)">' + ecl(160, 46, eo) + "</g>" + amp;
        return { vw: 220, vh: 200, g: g };
      }
      g = bar(90, 40, 32, 140) + bar(100, 90, 80, 28) + bar(100, 148, 100, 32) + '<g transform="translate(14 12)">' + ecl(186, 50, eo) + "</g>" + amp;
      return { vw: 220, vh: 200, g: g };
    },
    sv: function (k, o, h) { var r = this.make(k, o); return '<svg width="' + (h * r.vw / r.vh).toFixed(1) + '" height="' + h + '" viewBox="0 0 ' + r.vw + " " + r.vh + '" role="img" aria-label="Mark ' + k + '">' + r.g + "</svg>"; },
    at: function (k, o, x, y, h) { var r = this.make(k, o), w = h * r.vw / r.vh; return { w: w, s: '<svg x="' + x + '" y="' + y + '" width="' + w.toFixed(1) + '" height="' + h + '" viewBox="0 0 ' + r.vw + " " + r.vh + '" overflow="visible">' + r.g + "</svg>" }; }
  };
})();
