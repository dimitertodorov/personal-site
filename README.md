# Personal site (Popfold tower)

A resume as a building at night: one neon floor per skill set, read top to bottom as you scroll. Each floor slides
forward and lights up when you reach it, its pieces spring in, and the floors you've passed stay lit. A glass elevator
follows you down; an integration pipeline runs down the spine with a branch into every floor.

```
pnpm dev         # http://127.0.0.1:5181  (studio: /studio.html)
pnpm build       # static output in dist/
```

Models: free downloads (Poly Pizza, Sweet Home 3D packs) and Blender-built tech props, all in
`public/models/props/` and credited in `CREDITS.md`; screens, signs, pipes and labels are drawn in code.

- Download a model into a folder outside the repo, then normalise it (from the repo root):
  `blender -b --factory-startup --python node_modules/popfold/tools/blender/normalize_glb.py -- --in <file.glb> --out public/models/props/<name>.glb [--turn 90]`
  (keep animated models as downloaded and place them with `gen(name, size, { clip: 'Idle', fit: true })`).
- Rebuild the Blender tech props: `blender -b --factory-startup --python tools/build_tech_props.py -- --out public/models/props`,
  and the network pieces (plug, wall jack, patch panel): the same with `tools/build_net_props.py`.
- List the file in `props` in `src/tower.ts` (a tint or an animation clip goes in `models` there), then add a piece
  of that kind to `src/home.json`, or with the studio's *Add a piece*.

## Where things live

- `src/home.json`: the home as data: the floors, top to bottom (id, sign, neon colour, height), the story (`beats`:
  one per section, each with its camera and the floors it opens) and every piece with its kind and place. The
  studio (`/studio.html` on the dev server) edits it: moves, kinds, cameras, beat values, floor colours and signs.
- `src/tower.ts`: how each kind of piece is built (`kinds`: screens, labels and stand-ins drawn in code, models),
  the words on screens and boards (`TEXT`), the drawings, and the data flows between pieces (`build`, per floor).
- `src/stories.ts`: the cards behind pieces, keyed `<floor id>/<piece>`; cards can have a `meta` line (dates, role)
  and `links`. They win over a story written in the studio for the same piece, so edit those here.
- `index.html`: one `<section class="stage">` per floor, in the same order, with the same ids as the floors (clicking
  a floor scrolls to its section), plus the hero, overview and contact.
- `src/style.css`: the page (dark ops / neon).

Adding a floor: add it to `floors` and a beat for it to `beats` in `src/home.json`, and a matching
`<section id="<floor id>">` in `index.html` (`pnpm exec popfold check` says when they do not line up).

## Popfold features this uses

- Zones: any number of named story zones (`z:<id>` fields in beats; `keyframe(fields, cam, target, { id: 1 })`).
- The tower shell (`tower.ts`): stacked floors, elevator, spine pipeline, floor click → `onZone`.
- Flows (`flow.ts`): glowing pipes with packets, for integration diagrams.
- Story cards with `meta`, `links` and a custom `kicker`.
