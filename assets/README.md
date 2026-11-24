# Asset library (Blender → GLB → three.js in Remotion)

Build once and reuse in every video. Each asset is a **Python build script**, so it can be rebuilt, tweaked and versioned. Each build writes:

| Output | Path | Used by |
|---|---|---|
| GLB (runtime) | `studio/public/assets/<name>.glb` | `studio/src/kit3d` (`useGLB`, `Character`, `useSet`) |
| .blend (asset-marked) | `assets/blend/<name>.blend` | Blender Asset Browser: add `assets/blend` as an asset library and drag the pieces into new sets |

## Build

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P assets/blender/characters/person.py
```

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P assets/blender/sets/bedroom.py
```

- `person.py` builds every character in about 3 s. Add `-- mo crowd` to build only some of them.
- `stadium.py` (~14 s) and `vignettes.py` (~10 s) work the same way.
- `bedroom.py` builds the set, bakes AO with Cycles into vertex colours, and exports, in about 15 s.

## What exists

| Asset | Script | Notes |
|---|---|---|
| `mo`, `theo`, `lia`, `dex`, `crowd` | `blender/characters/person.py` | Rigged (root, hips, spine, chest, head, 2-bone arms and legs). Faces are drawn at runtime on the `FACE` shell, so expressions are unlimited. `crowd` has amber phone-screen eyes |
| `set_stadium` | `blender/sets/stadium.py` | The arena in Mo's head (any "everyone is judging me" beat): round plank court with painted rings, 12 tiers of bleachers over 300°, aisles with rails, banners, exit sign, 4 floodlight towers, a centre spotlight rig. Seats are NOT baked: `MARK_stands` carries the layout (`r0, depth, rise, tiers, a0, a1, aisles`) and `kit3d/Crowd.tsx` fills them (instanced, can look up or bow to their phones) |
| `set_vignettes` | `blender/sets/vignettes.py` | Three montage islands in the navy void: `class` (x=-7: desks, chalkboard, clock), `dinner` (x=0: round table, plates, pendant lamp), `shower` (x=+7: tub, curtain, tiles, towels). Marks `MARK_<island>_mo`, `LIGHT_<island>`. Add an island = one function + a free x slot |
| `set_bedroom` | `blender/sets/bedroom.py` | Mo's room: plank floor, wallpaper, window with a night skyline and moon, bed, nightstand with lamp, desk, chair, laptop, shelf of books, posters, pinned drawings, rug, plant, clothes pile. 9 marks (`MARK_mo_desk`, `MARK_mo_bed`, `MARK_mo_center`, `MARK_mo_door`, `MARK_cam_*`, `MARK_moonlight`, `LIGHT_lamp`) |

## Naming API (the runtime looks only at names)

| Name | Runtime behaviour (`studio/src/kit3d/materials.ts`) |
|---|---|
| `TOON_<pattern>_<anything>` | Cel shading (4-band ramp) × baked AO (COLOR_0) plus world-space ink strokes. Patterns: `plain`, `wood`, `planks`, `stripes` (wallpaper), `fabric`, `paper`, `brick`, `tiles` |
| `GLOW_<anything>` | Unlit emissive pushed to high dynamic range, so bloom catches it (lamps, screens, windows, phone eyes) |
| `INK` | Flat ink (limbs, outlines that are geometry) |
| `FACE` | Replaced by the character's live face canvas |
| `MARK_<name>` (empty) | Placement mark: `useSet(...).marks.MARK_name` gives three.js coordinates; custom properties (`K.props(obj, ...)`) arrive as `useSet(...).markData.MARK_name` |
| `LIGHT_<name>` (empty) | Where a practical light belongs |

Conventions: 1 unit = 1 m; characters stand on z=0 facing −Y (Blender front). glTF converts this to three.js Y-up with the character facing +Z.

## Adding a set (only when a script needs a new place)

1. Copy `blender/sets/bedroom.py` to `blender/sets/<place>.py`. Keep the helpers from `blender/lib/common.py` (`box`, `cylinder`, `arc_block` (curved tiers/walls), `props`, `rounded_box`, `tube`, `ellipsoid`, `densify`, `bake_ao`, `export_glb`, `save_blend`).
2. Name materials with the API above. Real geometry gaps (planks, panels, frames) become ink lines for free.
3. Place `MARK_` empties where characters and cameras go.
4. Run the script, then add the name to `ALL_ASSETS` in `studio/src/kit3d/assets.ts`.

## Inspecting in the Blender GUI (MCP)

Open `assets/blend/set_bedroom.blend` or `char_mo.blend`. The collections are asset-marked, so they appear in the Asset Browser for kit-bashing new sets.
