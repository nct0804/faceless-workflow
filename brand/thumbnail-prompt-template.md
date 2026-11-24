# Thumbnail prompt template (channel-wide)

Use this for **every** video so thumbnails read as one channel. Only the `{SLOTS}` change from video to video. Keep the fixed blocks **word-for-word**: image models stay consistent when the wording stays identical.

---

## 1. Fixed block: the signature character (Mo)

> **MO**, a stylized 3D cartoon character: a smooth rounded capsule-shaped head with no hair and no ears, a soft matte paper-white skin (#EDE6D6) with a subtle clay-like subsurface glow, a minimal face made of two tall glossy black oval eyes and a thin expressive eyebrow line, a mouth drawn only when the emotion needs it. He wears an oversized cream hoodie with the hood DOWN, bunched behind his neck, and two short drawstrings. A soft trapezoid body, short noodle arms in long sleeves, no visible fingers. Simple, faceless-everyman design, instantly readable as a silhouette.

**Supporting cast** (add only when the video needs them; same style, same proportions):
- **Theo**: same character design, sage-green skin, round black glasses
- **Lia** (little sister): same design, smaller, warm beige skin, two round hair buns
- **Dex**: same design, slate-blue skin, teal snapback cap

## 2. Fixed block: the antagonist (THE CROWD)

> **THE CROWD**: rows of identical faceless dark-navy silhouettes (#141824) sitting on tiered stadium bleachers, each with a small glowing amber rectangle (#F2A93B) where the eyes should be, like a phone screen, softly blooming in the dark.

*(Use it when the video is about an outside pressure / inner critic. Leave it out for purely personal stories.)*

## 3. Fixed block: the look

> Cinematic 3D animated-film illustration, ultra-detailed stylized render, soft global illumination, subsurface scattering on the character, volumetric light rays, shallow depth of field, 35mm lens, low-key lighting: a near-black navy night palette (#0B0D12 to #1B2030) lit by **one warm practical light** ({LIGHT_SOURCE}), strong vignette, subtle film grain. The only saturated accent color is **amber (#F2A93B)**. High contrast, clean composition, the character's face is the brightest thing in frame.

## 4. Fixed block: typography

> Oversized bold white sans-serif text "{TEXT}" (all caps, heavy weight, slightly condensed), filling about 40% of the frame width, placed {TEXT_POSITION}, with a soft dark drop shadow and a faint glow so it pops off the dark background. The text is the second thing the eye reads after the face.

## 5. Variable slots

| Slot | What to write | Rules |
|---|---|---|
| `{EMOTION}` | the ONE exaggerated feeling on Mo's face | Push it to the max: eyes huge or squeezed shut, brows steep, tears welling, mouth wide. One emotion only |
| `{SCENE}` | where he is + what he's doing, in one sentence | One setting, one action. Reuse the film's sets (bedroom desk with lamp, school lockers, stadium bleachers, kitchen) |
| `{CROWD_STATE}` | `none`, `watching`, `towering over him`, `switched off / empty seats` | Optional |
| `{PROP}` | the one object that carries the theme | phone, sketchbook, price tag, plant… max one |
| `{LIGHT_SOURCE}` | desk lamp / phone screen glow / stadium floodlights / streetlamp | Exactly one key light |
| `{TEXT}` | 1–3 words | Never repeat the title; it should *add* to it |
| `{TEXT_POSITION}` | `left third`, `right third`, `top` | Keep the bottom-right corner empty (YouTube's timestamp covers it) |
| `{COMPOSITION}` | camera/framing | Close-up (face fills 40–60% of the frame) or a tiny Mo dwarfed by something huge. Nothing in between |

## 6. The full template (copy, fill the slots)

```
[FRAMING] {COMPOSITION}, 16:9 YouTube thumbnail.

[CHARACTER] MO, a stylized 3D cartoon character: a smooth rounded capsule-shaped head with no hair and no ears, a soft matte paper-white skin (#EDE6D6) with a subtle clay-like subsurface glow, a minimal face made of two tall glossy black oval eyes and a thin expressive eyebrow line, a mouth drawn only when the emotion needs it. He wears an oversized cream hoodie with the hood DOWN, bunched behind his neck, and two short drawstrings. A soft trapezoid body, short noodle arms in long sleeves, no visible fingers.

[EMOTION] Mo's expression is exaggerated and unmistakable: {EMOTION}.

[SCENE] {SCENE}. Key prop: {PROP}.

[CROWD] {CROWD_STATE: paste the CROWD block, or delete this line}

[LOOK] Cinematic 3D animated-film illustration, ultra-detailed stylized render, soft global illumination, subsurface scattering on the character, volumetric light rays, shallow depth of field, 35mm lens, low-key lighting: a near-black navy night palette lit by one warm practical light ({LIGHT_SOURCE}), strong vignette, subtle film grain. The only saturated accent color is amber (#F2A93B). High contrast, the character's face is the brightest thing in frame.

[TEXT] Oversized bold white sans-serif text "{TEXT}" (all caps, heavy weight, slightly condensed), about 40% of the frame width, placed {TEXT_POSITION}, soft dark drop shadow and faint glow.
```

**Negative prompt** (for models that support it):
```
realistic human, human skin, fingers, hands with fingers, hair, ears, nose, teeth, wrinkles, extra eyes, multiple characters with the same face, red color, neon, oversaturated, busy background, cluttered, low contrast, flat lighting, daylight, watermark, logo, signature, misspelled text, extra text, small text, blurry face
```

## 7. Production rules (what makes it look like *one* channel)

1. **Same Mo, every time.** Upload a clean still of Mo from the film as an **image/character reference** (e.g. `studio/out/01-nobody-is-watching/stills/review-act2/s18.png`, his close-up). Keep the CHARACTER block word-for-word. If your tool supports it, lock the seed for a series.
2. **Generate the image WITHOUT text first, then add the text yourself** (Canva / Photoshop / Figma) in the same font every time. AI text often comes out misspelled or with a different font each time. Suggested fonts: *Anton* or *Bebas Neue* (free, Google Fonts), white, all caps, with a 6–10 px dark shadow. Use the `[TEXT]` block only when your model renders text reliably.
3. **One face, one emotion, one prop, one light, ≤3 words.**
4. **Amber is the only color that "pops".** No red (it reads as clickbait and clashes with the film).
5. **Check it at phone size**: shrink it to 320×180. If you can't read the emotion and the words, simplify.
6. **Export** at 1280×720 or larger, 16:9, JPG under 2 MB. Leave the bottom-right corner clear for the timestamp.
7. **A/B test** 2–3 versions with YouTube's *Test & Compare* (YouTube Studio → video → Thumbnail → Test & compare).
