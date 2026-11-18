# Kitchen starter file

A layered starting point for painting the kitchen in Artstudio Pro. Cooks can still recolour your painting.

```
you paint in Artstudio Pro  →  save as PSD  →  I split the layers  →  app tints the colour layers
```

## What's here

| File | What it is |
|---|---|
| `kitchen-starter.psd` | 2400 × 1600, 17 named layers. Open this one. |
| `kitchen-starter-preview.png` | The whole kitchen flattened, for reference |
| `layers/*.png` | Every layer as its own PNG, in case the PSD import has trouble |

The art is the Kitchen Plate as it stands (round three, your picks, sunflowers for autumn, light off). Paint over it, move things, or replace it entirely.

## The layers, bottom to top

| Layer | Holds | Cooks can recolour it? |
|---|---|---|
| `colour-wall` | the wall | yes |
| `colour-wood` | shelf, window frame, sill, board frame, counter top | yes |
| `colour-wood-dark` | the counter's front lip | follows wood |
| `colour-cabinets` | cabinet body | yes |
| `colour-cabinet-doors` | door panels | follows cabinets |
| `colour-box-back` | inside back of the recipe box | follows box |
| `fixed-art` | books, flour, notebook, window glass, cork, notes, cards, knobs, rod | no |
| `colour-valance` | the valance | yes |
| `colour-box` | front of the recipe box | yes |
| `fixed-front` | things sitting on the box front (brass plate) and the mug | no |
| `fixed-flowers` | the sill flowers | no, but swapped by season |
| `shading` (Multiply) | hatching and shadows | no |
| `ink` | all line work, with hidden lines already removed | no |
| `hit-*` (hidden) | where each clickable object is | not shown in the app |

Layers marked "follows" get a shade of their main colour worked out by the app, so they stay their own layer.

## Rules that keep recolouring working

1. **Don't change the canvas size or crop.** Every layer has to line up.
2. **A colour layer is only a shape.** The app reads its outline and fills it with the cook's colour. Paint it solid, in any colour; soft edges are fine.
3. **No shading or texture on colour layers.** Put shadows and texture on `shading`, in greys, so they darken any colour.
4. **Keep the layer names.** If you add a new part cooks can recolour, name it `colour-something` and tell me.
5. **Line work goes on `ink`.** Erase lines that are hidden behind things in front, the way they are now.
6. **Clickable objects:** if you move one, move or redraw its `hit-` box too. A rough rectangle is enough.

## Things to know

- **Pale colours:** your shading darkens whatever colour a cook picks. The darker you shade, the less a very pale pick will look pale.
- **Patterns:** gingham or awning valances and tiled backsplashes each need their own painted layer. They can't be a setting on one layer.
- **Seasons:** each sill option (tulips, poppies, sunflowers, lemons) would be its own `fixed-flowers-…` layer.
- **Phone:** this canvas is the wide kitchen only. The tall phone kitchen (decision 004) needs its own canvas later.
- **Title:** there's no title in the picture yet. If it goes on the wall, valance or canister, give it its own layer.

## When you're done

Save as PSD with the layer names intact and put it back in this folder. I'll split it and wire it into the app.
