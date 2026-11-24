---
name: clean-renders
description: Keep studio/out/ clean. Find videos whose renders are older than 14 days, ask the user whether each was uploaded/posted on social media, record the answer in the brief, and delete (move to Trash) the renders of published videos only - unpublished videos keep everything, drafts too. Run at the start of /new-video, after a final render, or when the user asks to clean up or free disk space.
---

# /clean-renders: posted renders go, unposted ones stay (housekeeping)

**User rule:**
- **Published:** delete that video's renders.
- **Not published:** keep everything, **drafts too**.

The source never gets deleted (`videos/<NN-slug>/`, `studio/src/...`), so any video can be re-rendered with `bin/render.sh <Comp> <NN-slug> final`.

## 1. Find what to ask about

```bash
python3 studio/bin/renders.py stale
```

This lists every `studio/out/<NN-slug>/` whose newest render is **14+ days old** and whose `Published` field isn't answered yet. A "no" is re-asked after another 14 days. Use `--days N` for a different threshold, and `status` to see all videos with their size and age. If nothing is listed, stop silently; don't bother the user.

## 2. Ask the user, one question for all listed videos

> These renders are over 14 days old: **01-nobody-is-watching** (346 MB), …
> Has each one been **uploaded or posted** (YouTube, TikTok, Instagram, …)? If yes, where?

## 3. Record each answer

```bash
python3 studio/bin/renders.py mark <NN-slug> yes "YouTube, TikTok"
```

```bash
python3 studio/bin/renders.py mark <NN-slug> no
```

This writes `| Published | ... |` in `videos/<NN-slug>/brief.md`, which is the source of truth, so the question isn't repeated.

## 4. Clean only the published ones

1. Say exactly what will go:

   > Moving `studio/out/01-nobody-is-watching/` (final, drafts, stills, versions; 346 MB) to the Trash. You can restore it from the Trash, or re-render it from source.

2. Run:

   ```bash
   python3 studio/bin/renders.py clean <NN-slug>
   ```

   The tool refuses to clean anything not marked `yes`. It moves the folder to the macOS **Trash** rather than deleting it permanently. Permanent deletion only happens if the user explicitly asks; then empty that one Trash entry after confirming.

3. **Not published:** do nothing. Keep the final, drafts, stills and versions exactly as they are.

## 5. Report

Give one line per video: what was moved to the Trash (and how many MB were freed), or "kept (not posted yet)". Commit the brief changes along with the next commit.

## Also

- `_lookdev/` (kit tests) is not a video. Ask before touching it, and only if the user wants space back.
- Before long renders, check free space with `df -h`. If space is low, run this skill first.
