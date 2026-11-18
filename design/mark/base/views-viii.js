/* Plate VIII open notebook, phone and jot list (reference; sections 06 and 10 own their own copies). */
  /* ================= The open composition book: pages only ================= */
  function camIcon(x, y, k) {
    return '<g transform="translate(' + x + " " + y + ") scale(" + (k || 1) + ')">' + reg("path", 'd="M-14 -7 h7 l3 -5 h8 l3 5 h7 v18 h-28 Z"', "var(--card)", 2) + '<circle cx="0" cy="2" r="5.5" style="fill:none;stroke:var(--ink);stroke-width:2"/></g>';
  }
  function openNotebook(o, vp) {
    vp = vp || VP;
    var s = '<rect x="' + (vp[0] - 20) + '" y="0" width="' + (vp[1] - vp[0] + 40) + '" height="764" style="fill:#1f1d1a;opacity:.58"/>';
    s += reg("rect", 'x="' + (vp[1] - 168) + '" y="22" width="148" height="44" rx="22"', "var(--card)", 2.4) + T(vp[1] - 94, 51, "Close", "font:18px var(--font-body);fill:var(--ink)", 'text-anchor="middle"');
    s += hatch(462, 724, 900, 9, 0.8);
    /* the page block: pages beneath fan out a little past the top page at the outer edges and the foot */
    for (var pl = 6; pl >= 1; pl--) s += '<path transform="translate(' + (-2.6 * pl) + " " + (1.3 * pl) + ')" d="M452 76 Q676 66 900 80 V722 Q676 712 452 720 Z" style="fill:var(--page);stroke:#a9a395;stroke-width:1"/>' +
      '<path transform="translate(' + (2.6 * pl) + " " + (1.3 * pl) + ')" d="M1348 76 Q1124 66 900 80 V722 Q1124 712 1348 720 Z" style="fill:var(--page);stroke:#a9a395;stroke-width:1"/>';
    s += '<path transform="translate(-17 9)" d="M452 76 Q676 66 900 80 V722 Q676 712 452 720 Z" style="fill:none;stroke:var(--ink);stroke-width:2"/><path transform="translate(17 9)" d="M1348 76 Q1124 66 900 80 V722 Q1124 712 1348 720 Z" style="fill:none;stroke:var(--ink);stroke-width:2"/>';
    s += reg("path", 'd="M452 76 Q676 66 900 80 V722 Q676 712 452 720 Z"', "var(--page)", 2.4) + reg("path", 'd="M1348 76 Q1124 66 900 80 V722 Q1124 712 1348 720 Z"', "var(--page)", 2.4);
    for (var y = 168; y < 700; y += 32) s += line("M456 " + y + " H896 M904 " + y + " H1344", 1.3, 1, "#c3d2ec");
    s += line("M850 84 V716", 1.4, 1, "#e3a59a") + line("M950 84 V716", 1.4, 1, "#e3a59a");
    s += hatch(878, 82, 20, 638, 0.35) + hatch(902, 82, 20, 638, 0.35);
    for (var sy = 104; sy < 710; sy += 46) s += line("M900 " + sy + " v20", 2.4, 1, "#9b968b") + '<circle cx="900" cy="' + (sy - 3) + '" r="1.6" style="fill:#9b968b"/><circle cx="900" cy="' + (sy + 23) + '" r="1.6" style="fill:#9b968b"/>';
    var hand = "font:600 25px var(--font-hand);fill:var(--ink)";
    /* left page: date top left, entry, page number bottom left */
    s += T(474, 112, "11/11/26", "font:600 22px var(--font-hand);fill:var(--ink)") + T(474, 152, "Trial 4: croissants", "font:700 40px var(--font-hand);fill:var(--ink)");
    ["Goal: a more open honeycomb", "Changed: rest 2 h between folds", null, "Proof 2 h at 24°C", "Bake 18 min at 200°C", "Result: shatter good,", "   honeycomb still thin", "Next: proof at 26°C, colder butter"].forEach(function (t, i) {
      var by = 194 + i * 32;
      if (t) s += T(474, by, t, i === 7 ? "font:700 25px var(--font-hand);fill:var(--orange-text)" : hand);
      else s += T(474, by, "Folds:", hand) + T(542, by, "2", hand) + line("M536 " + (by - 8) + " H558", 2.2) + T(568, by, "3 letter folds", hand);
    });
    s += T(474, 706, "12", "font:600 24px var(--font-hand);fill:var(--ink-soft)");
    /* right page: date top right, a sketch drawn over the lines, a taped-in photo, page number bottom right */
    s += T(1326, 112, "11/11/26", "font:600 22px var(--font-hand);fill:var(--ink)", 'text-anchor="end"') + T(968, 152, "Crumb, trial 4", "font:700 36px var(--font-hand);fill:var(--ink)");
    s += '<ellipse cx="1110" cy="300" rx="124" ry="74" style="fill:none;stroke:var(--ink);stroke-width:2.6"/><ellipse cx="1110" cy="304" rx="108" ry="60" style="fill:none;stroke:var(--ink);stroke-width:1.4"/>';
    var rh = rand(21);
    for (var h = 0; h < 18; h++) { var a = rh() * Math.PI * 2, d = Math.sqrt(rh()) * 0.8, hx = 1110 + Math.cos(a) * 102 * d, hy = 304 + Math.sin(a) * 54 * d;
      s += '<ellipse cx="' + hx.toFixed(1) + '" cy="' + hy.toFixed(1) + '" rx="' + (4 + rh() * 5).toFixed(1) + '" ry="' + (2.4 + rh() * 2.6).toFixed(1) + '" style="fill:none;stroke:var(--ink);stroke-width:1.3"/>'; }
    s += T(1236, 212, "crisp shell", "font:600 23px var(--font-hand);fill:var(--ink)") + arrow(1250, 220, 1214, 252);
    s += T(966, 420, "holes too small", "font:600 23px var(--font-hand);fill:var(--ink)") + arrow(1030, 402, 1078, 330);
    s += T(1170, 420, "butter leaked", "font:600 23px var(--font-hand);fill:var(--ink)") + arrow(1206, 400, 1170, 362);
    s += T(968, 480, "Height, trial 3 vs 4", "font:700 25px var(--font-hand);fill:var(--ink)");
    s += reg("rect", 'x="984" y="534" width="40" height="56"', "none", 2) + reg("rect", 'x="1040" y="514" width="40" height="76"', "none", 2) + line("M974 590 H1094", 2) + hatch(1041, 515, 38, 74, 0.6) +
      T(1004, 614, "T3", "font:600 20px var(--font-hand);fill:var(--ink)", 'text-anchor="middle"') + T(1060, 614, "T4", "font:600 20px var(--font-hand);fill:var(--ink)", 'text-anchor="middle"') + T(1092, 552, "+18 mm", "font:700 24px var(--font-hand);fill:var(--orange-text)");
    s += '<g transform="rotate(4 1232 560)">' + reg("rect", 'x="1158" y="494" width="150" height="128"', "#fffdf7", 2) + '<rect x="1166" y="502" width="134" height="96" style="fill:#e9b86a"/>' +
      reg("path", 'd="M1188 576 Q1232 520 1278 576 Q1232 560 1188 576 Z"', "var(--amber)", 1.8) + line("M1206 566 l8 -12 M1224 560 l4 -16 M1242 560 l-2 -16 M1260 566 l-8 -12", 1.3, 0.7) +
      T(1233, 616, "trial 4", "font:600 17px var(--font-hand);fill:var(--ink)", 'text-anchor="middle"') +
      '<rect x="1146" y="484" width="44" height="16" transform="rotate(-30 1168 492)" style="fill:#e8e0c8;opacity:.9;stroke:#b9a77a;stroke-width:1"/><rect x="1278" y="484" width="44" height="16" transform="rotate(30 1300 492)" style="fill:#e8e0c8;opacity:.9;stroke:#b9a77a;stroke-width:1"/></g>';
    s += T(1326, 706, "13", "font:600 24px var(--font-hand);fill:var(--ink-soft)", 'text-anchor="end"');
    /* add a photo: a camera button on the page (a file or a drop on a computer, the camera on a phone) */
    s += reg("rect", 'x="1112" y="660" width="150" height="34" rx="17"', "var(--card)", 2) + T(1187, 683, "Add a photo", "font:600 15px var(--font-body);fill:var(--ink)", 'text-anchor="middle"') +
      reg("circle", 'cx="1300" cy="677" r="30"', "var(--yellow)", 2.4) + camIcon(1300, 676, 1.05);
    return s;
  }

  /* ================= Photos from a phone ================= */
  function phone(state) {
    var s = reg("rect", 'x="8" y="8" width="374" height="764" rx="48"', "var(--ink)", 2) + '<rect x="20" y="20" width="350" height="740" rx="38" style="fill:var(--page)"/>';
    s += T(48, 52, "9:41", "font:600 15px var(--font-body);fill:var(--ink)") + '<rect x="150" y="32" width="90" height="24" rx="12" style="fill:var(--ink)"/>';
    s += T(40, 98, "‹ Trials", "font:700 24px var(--font-hand);fill:var(--blue)") + line("M20 114 H370", 1.2, 0.5);
    for (var y = 190; y < 740; y += 30) s += line("M20 " + y + " H370", 1.1, 1, "#c3d2ec");
    s += line("M58 114 V760", 1.2, 1, "#e3a59a") + T(350, 146, "11/12/26", "font:600 18px var(--font-hand);fill:var(--ink)", 'text-anchor="end"') +
      T(68, 178, "Trial 5: croissants", "font:700 30px var(--font-hand);fill:var(--ink)");
    ["Proof 2 h at 26°C", "Colder butter, 3 folds", "Result: open honeycomb!"].forEach(function (t, i) { s += T(68, 216 + i * 30, t, "font:600 21px var(--font-hand);fill:" + (i === 2 ? "var(--orange-text)" : "var(--ink)")); });
    /* the photo just taken, taped in */
    s += '<g transform="rotate(-3 200 420)">' + reg("rect", 'x="92" y="312" width="200" height="200"', "#fffdf7", 2) + '<rect x="102" y="322" width="180" height="150" style="fill:#e9b86a"/>' +
      reg("path", 'd="M128 440 Q192 350 258 440 Q192 418 128 440 Z"', "var(--amber)", 2) + line("M154 426 l10 -18 M180 418 l6 -22 M206 418 l-2 -22 M232 426 l-10 -18", 1.4, 0.7) +
      T(192, 500, "trial 5 · just now", "font:600 17px var(--font-hand);fill:var(--ink)", 'text-anchor="middle"') +
      '<rect x="76" y="302" width="56" height="18" transform="rotate(-28 104 311)" style="fill:#e8e0c8;opacity:.9;stroke:#b9a77a;stroke-width:1"/><rect x="252" y="302" width="56" height="18" transform="rotate(28 280 311)" style="fill:#e8e0c8;opacity:.9;stroke:#b9a77a;stroke-width:1"/></g>';
    s += reg("circle", 'cx="314" cy="700" r="34"', "var(--yellow)", 2.6) + camIcon(314, 699, 1.2);
    if (state === "sheet") {
      s += '<rect x="20" y="20" width="350" height="740" rx="38" style="fill:#1f1d1a;opacity:.45"/>' + reg("path", 'd="M20 520 Q20 500 40 500 H350 Q370 500 370 520 V722 Q370 760 332 760 H58 Q20 760 20 722 Z"', "var(--card)", 2);
      s += '<rect x="170" y="510" width="50" height="5" rx="2.5" style="fill:#b9b3a6"/>';
      [["Take a photo", true], ["Choose from your photos", false], ["Cancel", false]].forEach(function (r, i) { var y = 560 + i * 62;
        if (r[1]) s += reg("rect", 'x="36" y="' + (y - 28) + '" width="318" height="48" rx="10"', "var(--custard)", 1.4);
        s += (i < 2 ? camIcon(66, y - 4, 0.9) : "") + T(i < 2 ? 96 : 195, y + 3, r[0], "font:600 " + (i < 2 ? 21 : 19) + "px var(--font-body);fill:var(--ink)", i < 2 ? "" : 'text-anchor="middle"');
        if (i < 2) s += line("M36 " + (y + 30) + " H354", 1, 0.3); });
    }
    return '<svg viewBox="0 0 390 780" role="img" aria-label="' + (state === "sheet" ? "The camera button's menu on a phone" : "A Trials page on a phone with a photo just taped in") + '">' + s + "</svg>";
  }

  /* ================= Jot menus ================= */
  function jotB(o) {
    var s = scene(VP, opts({ typed: "croissant|" })), x = 700, w = 400, y = 74, row = 34;
    s += hatch(x + 8, y + 8, w, 330) + reg("rect", 'x="' + x + '" y="' + y + '" width="' + w + '" height="330" rx="8"', "var(--card)", 2.4);
    var cur = y + 28;
    function head(t) { s += T(x + 18, cur, t, "font:600 12px var(--font-body);letter-spacing:2px;fill:var(--ink-soft)"); cur += 10; }
    function item(icon, t, sub, on) { if (on) s += reg("rect", 'x="' + (x + 8) + '" y="' + cur + '" width="' + (w - 16) + '" height="' + (row - 2) + '" rx="4"', "var(--custard)", 1.2);
      s += icon(x + 20, cur + 6) + T(x + 52, cur + 23, t, "font:600 22px var(--font-hand);fill:var(--ink)") + (sub ? T(x + w - 18, cur + 22, sub, "14px var(--font-body);fill:var(--ink-soft)", 'text-anchor="end"') : ""); cur += row; }
    function corkI(ix, iy) { return '<rect x="' + ix + '" y="' + iy + '" width="20" height="20" style="fill:url(#corkp);stroke:var(--ink);stroke-width:1.5"/>'; }
    function wbI(ix, iy) { return reg("rect", 'x="' + ix + '" y="' + iy + '" width="20" height="20"', "var(--wb)", 1.5) + line("M" + (ix + 4) + " " + (iy + 7) + " h11 M" + (ix + 4) + " " + (iy + 13) + " h8", 1.3, 1, "var(--blue)"); }
    function cardI(ix, iy) { return reg("rect", 'x="' + ix + '" y="' + (iy + 3) + '" width="22" height="15" rx="1"', "var(--card)", 1.5) + line("M" + (ix + 2) + " " + (iy + 8) + " h18", 1.1, 1, "#c9442a"); }
    function bookI(ix, iy) { return reg("rect", 'x="' + ix + '" y="' + iy + '" width="17" height="21" rx="1.5"', "url(#mblack)", 1.5) + '<rect x="' + ix + '" y="' + iy + '" width="4" height="21" style="fill:#1a1917"/>'; }
    head("JOT IT");
    item(corkI, "To Ideas (cork)", "Enter", true); item(wbI, "To Next up (whiteboard)", "", false);
    cur += 8; s += line("M" + (x + 14) + " " + cur + " H" + (x + w - 14), 1, 0.4); cur += 22;
    head("RECIPES"); item(cardI, "Croissants", "trial 4", false); item(cardI, "Rough puff pastry", "", false);
    cur += 8; s += line("M" + (x + 14) + " " + cur + " H" + (x + w - 14), 1, 0.4); cur += 22;
    head("NOTEBOOK"); item(bookI, "Trial 4: croissants", "11/11", false);
    return svg([600, 1200], s, "Jot option B: one list under the bar", 0, 420);
  }
