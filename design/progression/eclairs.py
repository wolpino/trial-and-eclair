"""Builds the eclair collection: eclair-only crops, oldest first.

python3 design/progression/eclairs.py <scratchpad>
  Kitchen eclairs are cut from the full-size renders behind the gallery (boxes below are in the gallery jpg's pixel space, scaled to the source)
  Pasted and study eclairs come from
  <scratchpad>/pasted and <scratchpad>/vis. Close-ups (marks, Plate XII options, bites) come from
  <scratchpad>/eclairs/manifest.json. Writes design/progression/ecl/<id>.jpg and eclairs.json.
"""
import glob, json, os, sys
from PIL import Image

S = sys.argv[1]
D = os.path.dirname(os.path.abspath(__file__))
items = {x["id"]: x for x in json.load(open(f"{D}/items.json"))}


def source_of(i):
    """The full-size render a gallery image was made from (falls back to the gallery jpg)."""
    for pat in [f"{S}/old/{i}.png", f"{S}/pxshots/{i}.png"]:
        if os.path.exists(pat): return pat
    for f in glob.glob(f"{S}/pxshots/*.png"):
        if os.path.basename(f)[:-4].replace("_", "-") == i: return f
    return f"{D}/{items[i]['src']}"


OUT = []
def add(im, key, stage, date, caption):
    OUT.append((im, key, stage, date, caption))

def kitchen(i, box, caption):
    src = Image.open(source_of(i)).convert("RGB"); s = src.width / items[i]["w"]
    add(src.crop(tuple(round(v * s) for v in box)), "k-" + i, items[i]["stage"], items[i]["date"], caption)

def pasted(f, box, key, stage, date, caption):
    im = Image.open(f).convert("RGB")
    add(im.crop(box) if box else im, key, stage, date, caption)

kitchen("05-3c-eclair", (500, 400, 700, 500), "A block that says eclair on a plate")
kitchen("11-kitchen-1400", (510, 385, 690, 475), "Bitten, crumbs on a blue-rim plate")
kitchen("12-with-eclair", (460, 340, 620, 430), "Bitten, a little smaller")
kitchen("13-test-kitchen", (510, 395, 690, 485), "Bitten, on the counter")
kitchen("15-test-kitchen", (510, 395, 700, 490), "Bitten, plate seen from above (one-point)")
kitchen("17-test-kitchen", (500, 515, 710, 615), "Whole, longer")
kitchen("k-main", (510, 390, 690, 480), "Whole, by the box")
kitchen("plate-x-33-2354ebf-k-wide", (520, 330, 690, 415), "Whole, Plate X kitchen")
kitchen("plate-xii-00-d10bf43-xb-fig-svg", (430, 300, 630, 405), "Flat eclair, white zigzag")

V = "/Users/ari/Desktop/trial-and-eclair- visuals/thekitchens"
pasted(f"{S}/vis/h3-0.png", (540, 340, 760, 450), "study-kittl-b", "Your Kittl studies", "19 Nov", "Kittl study: eclair on the island")
P = f"{S}/pasted"
pasted(f"{P}/2026-11-20T0145-146b21c476.png", None, "pasted-whole", "Pasted in chat", "19 Nov", "Your reference: glossy eclair on a china plate")
pasted(f"{P}/2026-11-20T0145-1facb1b9fb.png", None, "pasted-bitten", "Pasted in chat", "19 Nov", "Your reference: bitten, custard showing")
pasted(f"{P}/2026-11-20T0145-154200e5b8.png", None, "pasted-logo", "Pasted in chat", "19 Nov", "Eclair wordmark")
pasted(f"{P}/2026-11-20T0145-375424b9d8.png", (440, 280, 800, 450), "pasted-counter", "Pasted in chat", "19 Nov", "On the counter between Trials and the box")
pasted(f"{P}/2026-11-20T0328-f469c491df.png", (350, 190, 560, 290), "pasted-rack", "Pasted in chat", "19 Nov", "Three eclairs on a cooling rack")

kitchen("plate-xii-03-8e28fc4-tk-a-tk", (600, 400, 760, 500), "First traced-style eclair, white zigzag")
kitchen("plate-xii-04-02efd3b-tk-a-tk", (600, 490, 770, 600), "Long, white zigzag")
kitchen("plate-xii-05-5fa6ccf-tk-a-tk", (560, 470, 740, 580), "E1 by the mixer")
kitchen("plate-xii-06-3e4832d-tk-a-tk", (220, 480, 400, 590), "E1 bitten, at P1")
kitchen("plate-xii-08-61b193d-tk-a-tk", (220, 480, 400, 590), "E1 whole, eaten by clicks")
kitchen("plate-xii-09-c6859d3-tk-a-tk", (200, 490, 380, 600), "E1 by the box")

# close-ups from the eclair pages, slotted in by date
E = f"{S}/eclairs"
if os.path.exists(f"{E}/manifest.json"):
    for e in json.load(open(f"{E}/manifest.json")):
        add(Image.open(f"{E}/{e['file']}").convert("RGB"), "c-" + os.path.splitext(e["file"])[0], e["stage"], e["date"], e["caption"])

ORDER = ["Oct", "8 Nov", "9 Nov", "11 Nov", "12 Nov", "13 Nov", "13–16 Nov", "16 Nov", "17 Nov", "18 Nov", "19 Nov"]
import re
ROMAN = {"VIII": 8, "IX": 9, "X": 10, "XI": 11}
def within_day(key, stage):
    """Order inside one day: plates by number, Plate XII by version; studies and pastes where they came in."""
    m = re.match(r"Plate XII v(\d+)", stage)
    if m: return int(m.group(1))
    if stage.startswith("Your Kittl"): return 0.5        # before Plate XII v1
    if key == "pasted-rack": return 9.5                  # pasted after v9
    if stage == "Pasted in chat": return 5.5             # pasted between v5 and v6
    m = re.match(r"Plate (VIII|IX|XI|X)\b", stage)
    if m: return ROMAN[m.group(1)]
    return {"Phone Plate v4": 12, "Mark Plate v2": 13, "Brand Sheet v3": 14, "Brand Sheet v4": 15}.get(stage, 0)
OUT.sort(key=lambda r: (ORDER.index(r[3]) if r[3] in ORDER else len(ORDER), within_day(r[1], r[2])))  # stable within ties

os.makedirs(f"{D}/ecl", exist_ok=True)
rows = []
for im, key, stage, date, cap in OUT:
    if im.width < 360: im = im.resize((360, round(im.height * 360 / im.width)), Image.LANCZOS)
    if im.width > 900: im = im.resize((900, round(im.height * 900 / im.width)), Image.LANCZOS)
    im.save(f"{D}/ecl/{key}.jpg", quality=85)
    rows.append({"id": key, "src": f"ecl/{key}.jpg", "w": im.width, "h": im.height, "stage": stage, "date": date, "caption": cap})
json.dump(rows, open(f"{D}/eclairs.json", "w"), indent=0)
print(len(rows), "eclairs")
