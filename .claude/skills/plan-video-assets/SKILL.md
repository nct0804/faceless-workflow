---
name: plan-video-assets
description: Step 2 of the Faceless Studio pipeline. Map every place, character and prop in the locked script to the existing reusable asset library, and request new materials only where the content needs them (ask before building). Use after the script is locked and before voiceover/build.
---

# /plan-video-assets: reuse first, build only what's needed (step 2)

## 1. Inventory what the script needs

Read `videos/<NN>-<slug>/script.md`. List every **place**, **character** and **prop or screen**.

## 2. Map it to the library

| Kind | Long (flat kit, `studio/src/kit/`) | Short (3D kit, `studio/src/kit3d/` + `assets/`) |
|---|---|---|
| Places | `kit/backdrops.tsx`: bedroom, kitchen, classroom, hallway, bathroom, gym, street. `<Room/>` picks one from the film plan | `kit3d/envs.tsx`: `Bedroom` (day/night), `StadiumNight`, `Island` class/dinner/shower |
| Characters | `kit/characters.tsx`: `Hero` (Mo), `Person` with `CAST` (Theo, Lia, Dex), `Bleachers` | GLBs mo, theo, lia, dex, crowd (`assets/blender/characters/person.py`). `<Character reach>` for hands |
| Props | `kit/props.tsx`, `kit/sets.tsx`: phone, POV hands, desk, lamp, bed, lockers, car, ... | `kit3d/Props.tsx`: `Phone3D`, `Sketchbook`, `PencilBetween`, `GlowText`, `PovArm` |
| Screens and drawings | `kit/canvas.tsx`: posts, chats, notifications, drawings (`DRAGON`, `portrait`, ...) | same canvases, used as `Phone3D screen={...}` |

Write the mapping into the brief as a table with these columns: **need**, **existing asset**, **status**. Status is one of:
- `reuse`
- `tweak` (a parameter or recolour)
- `NEW`

## 3. Request new materials only when needed

For each `NEW` item, tell the user:
- what it is
- which shots need it
- why the existing ones don't fit
- the rough effort

Ask **"Build these?"** before starting. Build them the reusable way:
- **3D set:** copy `assets/blender/sets/vignettes.py` or `stadium.py`. Use the naming API from `assets/README.md`:
  - `TOON_<pattern>_*`, `GLOW_*`, `INK`, `MARK_*`, `LIGHT_*`
  - and the helpers `box`, `cylinder`, `arc_block`, `props`, `bake_ao`

  Run Blender headless, add the set to `ALL_ASSETS` in `kit3d/assets.ts`, and give it a lit environment in `kit3d/envs.tsx`.
- **Flat place:** add a component to `kit/backdrops.tsx`, a full room that takes `m` (the mood colours), and a new `Loc` in `kit/film.tsx`.
- **Character:** add an entry to `CAST` in `person.py` (3D) or to `CAST` in `kit/characters.tsx` (flat).
- **Prop or screen:** add it to `kit3d/Props.tsx` or `kit/props.tsx`, plus a drawer in `kit/canvas.tsx`.

Every new asset must work in the **next** video too: no shot-specific hacks inside the kit. Document it in `assets/README.md` or `studio/README.md`.

## 4. Verify

Render one look-dev still per new asset:
- shorts: `Checks96Test`-style test composition
- long: a still of a shot that uses it

Check it against the look rules in `CLAUDE.md`: fully built, readable, bright-positive palette. Then tick step 2 in the brief. The next step is `/record-voiceover`.
