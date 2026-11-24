# Getting started

## 1. Install (macOS)

| Tool | Why | Install |
|---|---|---|
| Node 20+ and npm | Remotion | https://nodejs.org or `brew install node` |
| Python 3 | sound and voice tools | `brew install python` |
| ffmpeg | audio processing and checks | `brew install ffmpeg` |
| Blender 5.x | builds the 3D assets (only needed to change or add assets) | https://www.blender.org → `/Applications/Blender.app` |
| Claude Code | runs the pipeline skills | https://claude.com/claude-code |

```bash
git clone <this repo> faceless && cd faceless/studio
npm install
python3 -m venv .venv && .venv/bin/pip install numpy
```

## 2. Rebuild the generated files

Renders and audio stems are git-ignored:

```bash
.venv/bin/python audio/make_audio.py
```

This builds the long film's score into `public/audio/mix.wav` (~40 s).

```bash
.venv/bin/python audio/vo/import_voice.py src/shorts/checks96 public/audio/checks96/eleven/vo_emmett_v4.mp3 public/audio/checks96/eleven/vo_emmett_v4.words.json 1.07
```

This rebuilds the short's voice track.

```bash
.venv/bin/python audio/make_short_audio.py checks96
```

This rebuilds the short's music, sound effects and mix.

The 3D assets (`public/assets/*.glb`) are committed. To rebuild them:

```bash
cd .. && /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P assets/blender/characters/person.py
```

## 3. Look at the examples

```bash
cd studio
npm run studio
```

`npm run studio` opens the Remotion studio in the browser. Pick `FilmHD` (long) or `Checks96` (short).

```bash
npx remotion render src/index.ts Checks96 out/checks96.mp4 --codec=h264 --crf=16
```

This renders the short (~2 min).

```bash
npx remotion render src/index.ts FilmHD out/film.mp4 --codec=h264 --crf=18
```

This renders the long film (~3 min).

## 4. Make your own

Open the repo folder in Claude Code and type **`/new-video`**. Continue with [WORKFLOW.md](WORKFLOW.md).
