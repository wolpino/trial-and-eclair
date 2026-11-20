"""Makes the kitchen progression GIF from Ari's picks.

python3 design/progression/make_gif.py [width]
Reads picks.json ({picked: [ids], speed: ms}, copied from the gallery page's picks/main)
and items.json, writes kitchen-progression.gif. Each frame: the kitchen letterboxed on paper,
with the stage and date underneath. The last frame holds twice as long.
"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

D = os.path.dirname(os.path.abspath(__file__))
W = int(sys.argv[1]) if len(sys.argv) > 1 else 960
H_IMG, BAND = round(W * 0.6), round(W * 0.06)
PAPER, INK, WALNUT = (246, 240, 226), (34, 32, 28), (122, 84, 52)
FONT = "/System/Library/Fonts/Supplemental/Georgia.ttf"
title = ImageFont.truetype(FONT, round(BAND * 0.42))
small = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia Italic.ttf", round(BAND * 0.36))

items = {x["id"]: x for x in json.load(open(f"{D}/items.json"))}
picks = json.load(open(f"{D}/picks.json"))
order = [items[i] for i in picks["picked"] if i in items]
speed = int(picks.get("speed", 1500))

frames = []
for n, x in enumerate(order):
    im = Image.open(f"{D}/{x['src']}").convert("RGB")
    s = min(W / im.width, H_IMG / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    f = Image.new("RGB", (W, H_IMG + BAND), PAPER)
    f.paste(im, ((W - im.width) // 2, (H_IMG - im.height) // 2))
    d = ImageDraw.Draw(f)
    y = H_IMG + BAND // 2
    d.text((round(W * 0.025), y), x["stage"], font=title, fill=INK, anchor="lm")
    d.text((W - round(W * 0.025), y), f"{x['date']}  ·  {n + 1}/{len(order)}", font=small, fill=WALNUT, anchor="rm")
    frames.append(f.quantize(colors=255, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE))

out = f"{D}/kitchen-progression.gif"
frames[0].save(out, save_all=True, append_images=frames[1:], duration=[speed] * (len(frames) - 1) + [speed * 2], loop=0, optimize=True, disposal=1)
print(out, len(frames), "frames,", round(os.path.getsize(out) / 1e6, 1), "MB")
