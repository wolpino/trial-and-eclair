"""Builds the kitchen progression gallery's images and items.json.

python3 design/progression/build.py <scratchpad>
  <scratchpad>/old/       renders of Rounds 1-10, Plates I-VIII (from the published artifacts)
  <scratchpad>/archive/   images from the "Every kitchen so far" archive artifact
  <scratchpad>/pxshots/   Plates X, XI, XII and the Brand Sheet rendered at each git commit
  <scratchpad>/vis/       Ari's own studies (Desktop/trial-and-eclair- visuals/thekitchens: AI and Kittl
                          images, the kitchens drawn on its saved study pages, her Kittl trace)
Writes design/progression/img/<id>.jpg (1200 px wide) and items.json.
Each item: id, stage, date, caption, group (items in one group look alike), on (in the default set).
"""
import json, os, re, sys
from PIL import Image

S = sys.argv[1]
D = os.path.dirname(os.path.abspath(__file__))
R = os.path.abspath(os.path.join(D, "..", ".."))
old = {e["file"]: e for e in json.load(open(f"{S}/old/manifest.json"))}

# (source, stage, date, caption, group, on). group None = stands alone.
ITEMS = []
def add(src, stage, date, cap, group=None, on=True):
    ITEMS.append((src, stage, date, cap, group, on))

def o(f, group=None, on=True, cap=None):
    e = old[f]
    add(f"{S}/old/{f}", e["stage"], DATES[e["stage"]], cap or e["caption"], group, on)

DATES = {"Style comparison": "8 Nov", "Kitchen Plate (Plate I)": "9 Nov", **{f"Round {n}": "11 Nov" for n in range(1, 11)},
         "Plate II": "11 Nov", "Plate III": "11 Nov", "Plate IV": "11 Nov", "Plate V": "11 Nov", "Plate VI": "11 Nov",
         "Plate VII": "11 Nov", "Plate VIII": "12 Nov"}
A = f"{S}/archive/img"
P = f"{S}/pxshots"

add(f"{A}/app-kitchen-noon.jpg", "The first app kitchen", "Oct", "The kitchen home as built in October (#84), the one that felt drab")
add(f"{A}/app-kitchen-night.jpg", "The first app kitchen", "Oct", "Same kitchen, afternoon light (#88)", "app", False)
o("19-magazine-collage.png")
o("19-cookbook-plate.png", cap="Cookbook plate style, the one you picked")
add(f"{A}/tuning-03.jpg", "Tuning board", "8 Nov", "The kitchen corner at your colour picks")
o("18-plate-i.png")
add(f"{A}/plate-filled-up.jpg", "Kitchen Plate (Plate I)", "9 Nov", "Plate I filled up, sliders at their maximum", "plate1", False)
add(f"{A}/mark-01.jpg", "Mark sketches", "11 Nov", "The kitchen with the notebook mark")
add(f"{R}/design/kitchen-starter/kitchen-starter-preview.png", "Kitchen starter", "11 Nov", "Kitchen starter file for Artstudio, all layers")

# Round 1: 3 windows x 3 cabinets
for f, on in [("01-a-drawers.png", 1), ("01-a-shorter.png", 0), ("01-a-openshelf.png", 1), ("01-c-drawers.png", 1), ("01-c-shorter.png", 0),
              ("01-c-openshelf.png", 0), ("01-d-drawers.png", 1), ("01-d-shorter.png", 0), ("01-d-openshelf.png", 0)]:
    o(f, "r1", bool(on))
for f, on in [("02-wall1-board-middle.png", 1), ("02-wall2-board-left.png", 0), ("02-wall3-board-right.png", 1), ("02-wall4-long-board.png", 0), ("02-wall5-stacked.png", 1)]:
    o(f, "r2", bool(on))
o("03-closed-box.png", on=False)
for f, on in [("03-wall1-board-middle.png", 0), ("03-wall2-pegboard-right.png", 1), ("03-wall3-pegboard-left.png", 0), ("03-wall4-long-board.png", 0), ("03-wall5-strip-top.png", 0), ("03-equipment-lands.png", 1)]:
    o(f, "r3", bool(on))
for f, on in [("04-cook-normal.png", 1), ("04-dev-a-swap.png", 0), ("04-dev-b-whiteboard-middle.png", 1), ("04-equip-edges.png", 0), ("04-equip-centre.png", 0)]:
    o(f, "r4", bool(on))
o("04-cook-very-wide.png", "r4-wide", False)
for f, on in [("05-cook-normal.png", 1), ("05-2a-box-right.png", 0), ("05-2b-nothing-moves.png", 0), ("05-2c-lab-middle.png", 0), ("05-3a-share-middle.png", 0),
              ("05-3b-vase.png", 0), ("05-3c-eclair.png", 1), ("05-3d-cup.png", 0), ("05-guest.png", 0), ("05-developer.png", 0)]:
    o(f, "r5", bool(on))
o("05-cook-very-wide.png", "r5-wide", False)
o("05-plate-border.png", "r5-wide", True)
for f, on in [("06-normal.png", 1), ("06-3a-share-middle.png", 0), ("06-3b-vase.png", 0), ("06-3c-eclair.png", 0), ("06-3b-3c.png", 1), ("06-guest.png", 0), ("06-home-cook.png", 0)]:
    o(f, "r6", bool(on))
o("06-very-wide.png", on=False)
for f, on in [("07-dev-eclair.png", 1), ("07-dev-flowers.png", 0), ("07-cook-eclair.png", 0), ("07-guest-flowers.png", 0)]:
    o(f, "r7", bool(on))
o("08-lab-below-board.png", "r8", False); o("08-lab-overlap.png", "r8", True)
o("09-a-board-above-box.png", "r9", False); o("09-b-board-meets-box.png", "r9", True)
o("10-developer.png", "r10", True); o("10-home-cook.png", "r10", False); o("10-very-wide.png", on=False)
o("11-kitchen-1400.png", "p2", True)
for f in ["11-kitchen-800.png", "11-kitchen-1440.png", "11-kitchen-2560.png"]: o(f, "p2", False)
o("12-with-eclair.png", "p3", True); o("12-without-eclair.png", "p3", False)
for f in ["12-kitchen-1400.png", "12-kitchen-800.png", "12-kitchen-1440.png", "12-kitchen-2560.png"]: o(f, "p3", False)
o("13-test-kitchen.png", "p4", True)
for f in ["13-day.png", "13-kitchen-1400.png", "13-kitchen-800.png", "13-kitchen-1440.png", "13-kitchen-2560.png"]: o(f, "p4", False)
o("13-evening.png", "p4-eve", True)
o("14-test-kitchen.png", "p5", True); o("14-day.png", "p5", False)
o("14-evening-pendants.png", "p5-eve", True); o("14-evening-board-light.png", "p5-eve", False)
o("15-test-kitchen.png", "p6", True); o("15-day.png", "p6", False); o("15-perspective-lines.png", "p6", False)
o("15-evening.png", on=True)
o("16-test-kitchen.png", "p7", True)
for f in ["16-window-pegboard.png", "16-pegboard-window.png", "16-day.png", "16-perspective-lines.png"]: o(f, "p7", False)
o("16-narrower.png", on=True); o("16-evening.png", on=False)
o("17-test-kitchen.png", "p8", True)
for f in ["17-on-the-wall.png", "17-angle-now.png", "17-eye-higher.png", "17-eye-lower.png", "17-gentler-depth.png", "17-stronger-depth.png", "17-perspective-lines.png", "17-day.png"]:
    o(f, "p8", False)
o("17-fridge-right.png", "p8-fridge", False); o("17-fridge-left.png", "p8-fridge", True)
o("17-evening.png", "p8-eve", False); o("17-evening-small-window.png", "p8-eve", True)

IX = f"{R}/design/plate-ix/shots/01"
add(f"{IX}/k_main.png", "Plate IX", "12 Nov", "The wide kitchen, every view opens from here")
add(f"{IX}/k_eve.png", "Plate IX", "12 Nov", "Plate IX, evening")

X = [("01-ae1d313", "First Plate X kitchen", "px", True), ("07-7dd448f", "Tweaks from your review", "px", True),
     ("08-f030c33", "Cabinets reshaped, smaller board", "px", False), ("12-51a223d", "Slim cabinet, quieter green, recipe log cabinet", "px2", True),
     ("15-107be09", "Original green, RECIPE LOG on the door", "px2", True), ("20-df71dd9", "Recipe log cabinet holds a cat", "px3", False),
     ("21-ef9ffac", "Whiteboard holds only what the cook writes", "px3", True), ("24-7f67624", "Cat redrawn in the plate style", "px3", False),
     ("33-2354ebf", "Plate X final kitchen (v24)", "px3", True)]
for c, cap, g, on in X:
    add(f"{P}/plate-x-{c}-k-wide.png", "Plate X", "13 Nov", cap, g, on)
add(f"{P}/plate-x-15-107be09-k-eve.png", "Plate X", "13 Nov", "Plate X, evening", None, True)

add(f"{P}/plate-xi-00-bc91854-mk-wide.png", "Plate XI", "17 Nov", "Plate XI first draw", "pxi", False)
add(f"{P}/plate-xi-04-cf13a5f-mk-wide.png", "Plate XI", "17 Nov", "Plate XI, signed off", "pxi", True)
add(f"{P}/plate-xi-04-cf13a5f-eve-k.png", "Plate XI", "17 Nov", "Plate XI, evening", None, True)
add(f"{P}/brand-03-4b8c348-br6-day.png", "Brand Sheet", "17 Nov", "Brand Sheet kitchen reference, day", "brand", False)
add(f"{P}/brand-03-4b8c348-br6-eve.png", "Brand Sheet", "17 Nov", "Brand Sheet kitchen reference, evening", "brand", False)

# Ari's studies, slotted in by file time between the plates they fed
VS = f"{S}/vis"
add(f"{VS}/study-green-1.png", "Your studies", "18 Nov", "Flat-vector desktop study", "green", False)
add(f"{VS}/study-green-2.jpg", "Your studies", "18 Nov", "Study: open cupboard, sun through the window", "green", True)
add(f"{VS}/study-green-3.jpg", "Your studies", "18 Nov", "Study: desktop visual direction", "green", False)
add(f"{VS}/study-green-4.jpg", "Your studies", "18 Nov", "Study: alternate desktop", "green", False)
add(f"{VS}/study-green-ari-edit.jpg", "Your studies", "18 Nov", "Your edit: Next up, Ideas and the labels on the study", "green", True)
add(f"{VS}/study-green-desktop3.png", "Your studies", "18 Nov", "Kitchen 3 from your desktop", "green", False)
add(f"{VS}/study-h0-0.png", "Your Kittl studies", "19 Nov", "Counter plate, portrait", None, False)
add(f"{VS}/study-h3-0.png", "Your Kittl studies", "19 Nov", "Showcase plate, wide: island with Trials, eclair and box", None, True)
add(f"{P}/plate-xii-00-d10bf43-xa_fig_svg.png", "Plate XII v1", "19 Nov", "A: desktop 1 seen straight on", "x1", True)
add(f"{P}/plate-xii-00-d10bf43-xb_fig_svg.png", "Plate XII v1", "19 Nov", "B: desktop 2 tidied", "x1", True)
add(f"{VS}/study-h1-0.png", "Your Kittl studies", "19 Nov", "Recipe board, one point: corner kitchen", "kittl-rb", True)
add(f"{VS}/study-h1-1.png", "Your Kittl studies", "19 Nov", "Recipe board, one point: closer", "kittl-rb", False)
add(f"{VS}/study-h2-0.png", "Your Kittl studies", "19 Nov", "Recipe board A, straight on (the one you traced)", "kittl-rb2", True)
add(f"{VS}/study-h2-1.png", "Your Kittl studies", "19 Nov", "Recipe board B, blue corner", "kittl-rb2", False)
add(f"{P}/plate-xii-01-a9659ae-xa_fig_svg.png", "Plate XII v2", "19 Nov", "One-point kitchen A from the Kittl studies", "x2", True)
add(f"{P}/plate-xii-01-a9659ae-xb_fig_svg.png", "Plate XII v2", "19 Nov", "One-point kitchen B", "x2", True)
add(f"{VS}/study-h4-0.png", "Your Kittl studies", "19 Nov", "Vector kitchen, one point: blue, close", "kittl-vec", True)
add(f"{VS}/study-h4-1.png", "Your Kittl studies", "19 Nov", "Vector kitchen, one point: wide, checker floor", "kittl-vec", False)
add(f"{VS}/kittl-trace.png", "Your Kittl trace", "19 Nov", "Your vector trace of recipe board A")
add(f"{P}/plate-xii-02-b82eff6-tk_k.png", "Plate XII v3", "19 Nov", "Your traced Kittl kitchen, cleaned and wired up")
add(f"{P}/plate-xii-03-8e28fc4-tk_a_tk.png", "Plate XII v4", "19 Nov", "Stem green, split ink, cupboard and clipboard", "x4", True)
add(f"{P}/plate-xii-03-8e28fc4-tk_b_tk.png", "Plate XII v4", "19 Nov", "Box and mixer swapped", "x4", False)
for c, v, cap, on in [("04-02efd3b", 5, "Taller frame, open cupboard, clipboard log", True),
                      ("05-5fa6ccf", 6, "Eclair versions, notebook stack, sill plant", True),
                      ("06-3e4832d", 7, "Bitten eclair, basil, crystal and rainbows, composition books", True),
                      ("07-283625c", 8, "Click-to-eat eclair, sill bottles, frame colour", False),
                      ("08-61b193d", 8, "Walnut window frame", True),
                      ("09-c6859d3", 9, "Glass study bottles, rainbows by time of day, labels", True),
                      ("10-ba8975e", 10, "Eclairs on a cooling rack, bottles, composition books", True),
                      ("11-bf2e47b", 11, "Your rack, journals and bottles traced in", True),
                      ("12-0b66bce", 12, "Rack under the window, notebook moved, flour and pin gone", True),
                      ("13-aea2caa", 13, "Kitchen log, Ideas, Next up and The Library labels; square journals", True),
                      ("14-ec956d3", 14, "Picks set, glow from behind, wall cleaned", True),
                      ("15-ba99eab", 15, "Pantry cupboard, one crystal, rainbows across the room", True),
                      ("16-20ef05d", 16, "Rainbows by time of day (drawn here in afternoon light)", True),
                      ("17-227ebed", 17, "Plate XII v17, signed off", True)]:
    date = "19 Nov" if v <= 13 else "20 Nov"
    add(f"{P}/plate-xii-{c}-tk_a_tk.png", f"Plate XII v{v}", date, cap, "x8" if v == 8 else None, on)
add(f"{P}/plate-xii-17-227ebed-eve.png", "Plate XII v17", "20 Nov", "v17 in the evening: rainbows gone, lamp glow under the cupboards", None, True)

def is_new(stage):
    """Added after Ari's first picks (2026-11-19): her studies and Plate XII v10 on. Shown with a New badge, out of the reel."""
    m = re.match(r"Plate XII v(\d+)$", stage)
    return stage.startswith("Your") or bool(m and int(m.group(1)) >= 10)

os.makedirs(f"{D}/img", exist_ok=True)
out = []; seen = set()
for i, (src, stage, date, cap, group, on) in enumerate(ITEMS):
    im = Image.open(src).convert("RGB")
    if im.width > 1200: im = im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS)
    k = os.path.splitext(os.path.basename(src))[0].replace("_", "-")
    assert k not in seen, k; seen.add(k)
    f = f"img/{k}.jpg"; im.save(f"{D}/{f}", quality=80, optimize=True, progressive=True)
    out.append({"id": k, "src": f, "w": im.width, "h": im.height, "stage": stage, "date": date, "caption": cap, "group": group, "on": bool(on),
                "new": is_new(stage)})
json.dump(out, open(f"{D}/items.json", "w"), indent=0)
print(len(out), "items,", sum(x["on"] for x in out), "on")
