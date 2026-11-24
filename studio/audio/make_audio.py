"""Score + sound design for "Nobody Is Watching." built from the cut list.

    .venv/bin/python audio/make_audio.py

Reads every SHOTxx_FRAMES from src/shots, so retiming a shot re-times the music.
Rule from the style study: the piano note IS the cut, so every cut gets a note.
Writes public/audio/{music,sfx}.wav (stems) and public/audio/mix.wav (−14 LUFS).
"""
import glob
import os
import re
import subprocess
import wave

import numpy as np

import synth as S
from synth import SR

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'audio')
FPS = 30

# ------------------------------------------------------------------ cut list
frames = {}
for f in glob.glob(os.path.join(ROOT, 'src', 'shots', '*.tsx')):
    for n, v in re.findall(r'SHOT(\d+)_FRAMES = (\d+)', open(f).read()):
        frames[int(n)] = int(v)
assert sorted(frames) == list(range(1, 58)), sorted(frames)
start, acc = {}, 0
for n in range(1, 58):
    start[n] = acc
    acc += frames[n]
TOTAL_FRAMES = acc
END = TOTAL_FRAMES / FPS
N = int(END * SR) + SR * 4


def T(shot, f=0.0):
    """seconds at frame f of a shot"""
    return (start[shot] + f) / FPS


music = np.zeros((2, N), np.float32)
sfx = np.zeros((2, N), np.float32)


def put(buf, x, t0, gain=1.0, pan=0.0):
    i = int(round(t0 * SR))
    if i >= N:
        return
    if x.ndim == 1:
        x = np.stack([x * np.sqrt(0.5 * (1 - pan)), x * np.sqrt(0.5 * (1 + pan))])
    j = min(N, i + x.shape[1])
    buf[:, i:j] += gain * x[:, : j - i]


# ------------------------------------------------------------------ harmony (C major / A minor)
CH = {
    'C': [48, 52, 55], 'G': [43, 47, 50], 'Am': [45, 48, 52], 'F': [41, 45, 48],
    'Dm': [50, 53, 57], 'E': [40, 44, 47], 'Em': [40, 43, 47],
}
BEAT = 60 / 88  # ~88 BPM


def chord_notes(name, octave=0):
    root = CH[name][0]
    tones = [n + 12 for n in CH[name]] + [n + 24 for n in CH[name]]
    return root + octave, [n + octave for n in tones]


# sections: [t0, t1) with a progression that advances on every cut inside the section
SECTIONS = [
    # Act 1: warm, curious
    dict(t0=T(1), t1=T(9), prog=['Am', 'F', 'C', 'G'], dens=0.55, vel=0.48, pad=0.09),
    dict(t0=T(9), t1=T(11), prog=['Am', 'E'], dens=0.06, vel=0.36, pad=0.0),  # the wound: music thins
    dict(t0=T(11), t1=T(14), prog=['Dm', 'Am', 'E'], dens=0.28, vel=0.4, pad=0.1),
    # WEEK montage: plucks + pulse
    dict(t0=T(14), t1=T(19), prog=['Am', 'F', 'C', 'G', 'Am'], dens=0.8, vel=0.5, pad=0.06, pluck=True),
    dict(t0=T(19), t1=T(24), prog=['Am', 'F', 'Dm', 'E', 'Am'], dens=0.34, vel=0.42, pad=0.12),
    dict(t0=T(24), t1=T(27), prog=['Dm', 'E', 'Am'], dens=0.2, vel=0.34, pad=0.12, octave=12),
    dict(t0=T(27), t1=T(29), prog=['Am', 'E'], dens=0.14, vel=0.3, pad=0.14),
    # Act 3
    dict(t0=T(34), t1=T(36), prog=['F', 'C', 'G', 'Am'], dens=0.28, vel=0.38, pad=0.1),
    dict(t0=T(36), t1=T(46), prog=['C', 'G', 'Am', 'F'], dens=0.6, vel=0.5, pad=0.1),
    dict(t0=T(46), t1=T(47), prog=['C', 'G'], dens=0.45, vel=0.45, pad=0.08, octave=12),
    dict(t0=T(47), t1=T(48), prog=['Am', 'E'], dens=0.1, vel=0.32, pad=0.0),
    dict(t0=T(48, 58), t1=T(53), prog=['C', 'G', 'Am', 'F', 'C', 'G', 'F'], dens=0.55, vel=0.5, pad=0.16, swell=True),
    dict(t0=T(53), t1=T(55), prog=['F', 'G'], dens=0.3, vel=0.42, pad=0.16),
    dict(t0=T(56), t1=T(57), prog=['F', 'C'], dens=0.18, vel=0.32, pad=0.1),
]

# every cut time, plus the in-shot "cards" that should also land on notes
CUTS = [T(n) for n in range(1, 58)]
CUTS += [T(44, i * 21) for i in range(1, 5)]  # DAY 24..30 page flips
CUTS += [T(48, 58)]  # phone face-down click = downbeat
CUTS = sorted(set(round(c, 4) for c in CUTS))

melody_rng = np.random.default_rng(3)


def render_section(s):
    cuts = [c for c in CUTS if s['t0'] - 1e-6 <= c < s['t1'] - 1e-6] or [s['t0']]
    octv = s.get('octave', 0)
    for ci, c in enumerate(cuts):
        name = s['prog'][ci % len(s['prog'])]
        nxt = cuts[ci + 1] if ci + 1 < len(cuts) else s['t1']
        span = max(0.3, nxt - c)
        prog = (c - s['t0']) / max(1e-6, s['t1'] - s['t0'])
        vel = s['vel'] * (0.8 + 0.5 * prog if s.get('swell') else 1.0)
        root, tones = chord_notes(name, octv)
        # the cut hit: bass + a chord tone on top
        put(music, S.piano(root - 12, min(1.0, vel * 1.1)), c, pan=-0.2)
        put(music, S.piano(tones[3 + (ci % 2)], min(1.0, vel * 1.0)), c, pan=0.15)
        if s.get('pad', 0) > 0:
            put(music, S.pad([root, root + 7, tones[1]], span + 0.4, s['pad'] * 0.55, attack=0.8, release=1.6), c)
        # arpeggio between cuts on a half-beat grid
        step = BEAT / 2
        k = 1
        while c + k * step < nxt - 0.3:  # keep the run-up to the cut clean
            if melody_rng.random() < s['dens']:
                note = tones[[0, 1, 2, 1, 3, 2][k % 6]]
                if s.get('pluck'):
                    put(music, S.pluck(note + 12, vel * 0.55), c + k * step, pan=0.3 * ((k % 2) * 2 - 1))
                else:
                    put(music, S.piano(note, vel * (0.32 + 0.2 * melody_rng.random())), c + k * step, pan=(note - 64) / 40)
            k += 1


for s in SECTIONS:
    render_section(s)

# --- montage pulse (shots 14–18): soft kick on every cut + half-way, ticks on off-beats
t = T(14)
while t < T(19) - 0.05:
    put(music, S.kick(0.42), t)
    put(music, S.tick(0.08), t + 0.375, pan=0.3)
    t += 0.75

# --- drones: the crowd's presence
put(music, S.drone(T(11) - T(10), 0.12, rise=1.5), T(10))
put(music, S.drone(T(29) - T(24), 0.2, rise=4.0), T(24))
put(music, S.drone(T(30) - T(29) + 0.05, 0.42, f=55, rise=0.6, fall=0.02), T(29))  # cuts dead at rock bottom
put(music, S.drone(T(48, 58) - T(47), 0.3, f=55, rise=0.8, fall=0.02), T(47))  # cuts dead on the click

# --- shot 31: one piano note returns, then an answer
put(music, S.piano(69, 0.42), T(31))
put(music, S.piano(76, 0.32), T(31) + 2.0)

# --- shot 32: house lights -> warm, wide C major pad through the reveal
put(music, S.pad([36, 43, 48, 52, 55, 60, 64], T(34) - T(32, 8) + 1.0, 0.3, attack=0.4, release=3.0), T(32, 8))

# --- the click (shot 48): downbeat, low C + full chord, strings enter
put(music, S.piano(36, 0.6), T(48, 58))
for m in (48, 55, 60, 64):
    put(music, S.piano(m, 0.42), T(48, 58))
put(music, S.pad([36, 43, 48, 52, 55, 60, 67], T(55) - T(48, 58), 0.18, attack=3.0, release=2.0), T(48, 58))

# --- swell into 3:00, resolve on the title card
put(music, S.pad([36, 48, 52, 55, 60, 64, 72], T(55) - T(52), 0.3, attack=4.0, release=0.5), T(52))
put(music, S.piano(36, 0.6), T(55))
for m in (48, 52, 55, 60, 64, 72):
    put(music, S.piano(m, 0.45), T(55))
put(music, S.pad([36, 43, 48, 52, 55, 64], T(57) - T(55) + 4, 0.22, attack=0.3, release=4.0), T(55))
# end screen: a last soft chord that fades
put(music, S.pad([41, 48, 53, 57, 60], END - T(57) - 2.5, 0.12, attack=2.0, release=2.5), T(57))
put(music, S.piano(65, 0.25), T(57) + 0.5)

music = S.reverb(music, secs=3.0, wet=0.3, seed=1)

# a small breath before every cut so each hit lands clean
pre = np.ones(music.shape[1], np.float32)
for c in CUTS:
    i1 = int(c * SR)
    i0 = max(0, i1 - int(0.12 * SR))
    pre[i0:i1] = np.minimum(pre[i0:i1], np.linspace(1.0, 0.55, i1 - i0))
music *= pre

# ------------------------------------------------------------------ sound effects (frame-exact)
def fx(shot, f, x, gain=1.0, pan=0.0):
    put(sfx, x, T(shot, f), gain, pan)


fx(1, 8, S.click(0.5))                       # lamp
fx(2, 0, S.scratch(2.5, 0.12))               # pencil
fx(3, 0, S.scratch(2.0, 0.06))
for f in (26, 46, 62):
    fx(5, f, S.pop(0.3), pan=0.1)            # likes
fx(7, 64, S.thud(0.32, 150))                 # fist bump
fx(7, 64, S.pop(0.14, 900, 1400))
fx(11, 54, S.tick(0.25, 0.03, 1500, 6000))   # thumb on "Delete"
fx(12, 2, S.whoosh(0.22, 0.3))               # post deleted
fx(13, 24, S.thud(0.22, 110))                # sketchbook drops
fx(13, 30, S.slide(0.18, 0.9))               # ...slides under the bed
for sh in (14, 15, 16):
    fx(sh, 3, S.shutter(0.38))               # camera
for i in range(8):
    fx(17, i * 5.6, S.clap(0.16), pan=((i * 37) % 10 - 5) / 6)   # crowd claps
fx(18, 4, S.ding(0.3))                       # notification
for f in (46, 54, 62, 71, 80):
    fx(19, f, S.tick(0.16, 0.02, 1200, 5000))  # typing "busy."
fx(19, 96, S.whoosh(0.2, 0.25))              # sent
for f in (44, 70):
    fx(26, f, S.ding(0.12, 1046.5))          # group chat
for i, f in enumerate(range(50, 63, 1)):
    if i < 9:
        fx(27, f + i * 0.3, S.pop(0.1, 600, 900))  # likes counting to 9
for i in range(24):
    fx(28, i * 2, S.tick(0.12, 0.02, 2000, 8000), pan=((i % 6) - 2.5) / 3)  # grid tiles pop
fx(32, 8, S.clunk(0.9))                      # stadium lights
fx(36, 8, S.slide(0.2, 0.9))                 # sketchbook back out
fx(36, 74, S.blow(0.3))                      # blow the dust off
fx(37, 0, S.scratch(2.0, 0.1))
fx(38, 0, S.scratch(1.5, 0.1))
fx(40, 6, S.tick(0.16, 0.02, 1200, 5000))
fx(40, 9, S.whoosh(0.18, 0.25))
fx(40, 50, S.ding(0.28))                     # "ALWAYS."
fx(42, 0, S.scratch(3.0, 0.06))
fx(45, 0, S.scratch(3.0, 0.08))
for f in (44, 52, 60, 68, 78, 92):
    fx(46, f, S.pop(0.26), pan=0.1)
fx(48, 58, S.click(0.6, 1500))               # phone face down
fx(48, 58, S.thud(0.3, 130))
fx(49, 10, S.powerdown(0.3))                 # the crowd switching off
fx(49, 64, S.scratch(1.8, 0.07))
fx(50, 0, S.scratch(4.5, 0.06))

# whispers under every crowd line: (shot, frame, text, gain)
CROWD = [
    (10, 68, 'they saw it.', 1.0), (11, 14, 'delete it.', 1.0), (17, 8, 'more.', 0.9),
    (18, 44, 'they like this you.', 0.9), (24, 28, "don't be weird.", 1.0), (27, 72, 'only nine?', 1.0),
    (29, 8, 'nobody likes the real you.', 1.0), (29, 24, 'delete it.', 1.0), (29, 36, "they're laughing.", 1.0),
    (29, 48, 'be someone else.', 1.0), (37, 6, 'nobody will like this.', 0.5),
    (47, 18, 'only six.', 1.0), (47, 38, 'delete it.', 1.0), (47, 56, 'they saw it.', 1.0),
]
for i, (sh, f, text, g) in enumerate(CROWD):
    fx(sh, f, S.whisper(0.35 + 0.055 * len(text), 0.3 * g), pan=((i * 53) % 11 - 5) / 7)
# echo murmur beds that pile up (shots 29 & 47)
for i in range(26):
    fx(29, 58 + i * 2, S.whisper(0.6, 0.06 + 0.006 * i), pan=((i * 41) % 13 - 6) / 7)
for i in range(6):
    fx(47, 74 + i * 6, S.whisper(0.6, 0.08), pan=((i * 29) % 9 - 4) / 5)

# closing cards: soft typewriter ticks per character
for sh, text, cpf in ((53, 'Nobody is watching as closely as you think.', 0.9), (54, 'So stop performing. Start living.', 0.75)):
    for i, ch in enumerate(text):
        if ch != ' ':
            fx(sh, 12 + (i + 1) / cpf, S.tick(0.05, 0.015, 1500, 6000))

sfx = S.reverb(sfx, secs=1.4, wet=0.18, seed=2, dark=7000)

# ------------------------------------------------------------------ silence as punctuation
def duck(buf, t0, t1, fade=0.04, floor=0.0):
    i0, i1, k = int(t0 * SR), int(t1 * SR), int(fade * SR)
    env = np.ones(buf.shape[1], np.float32)
    env[i0:i1] = floor
    env[max(0, i0 - k):i0] = np.linspace(1, floor, min(k, i0))
    env[i1:i1 + k] = np.linspace(floor, 1, k)[: len(env[i1:i1 + k])]
    buf *= env


duck(music, T(30), T(31))  # rock bottom: 6 s of nothing
duck(sfx, T(30), T(31))
put(sfx, S.room(T(31) - T(30), 0.006), T(30))  # just room tone

# ------------------------------------------------------------------ mix + write
music *= 0.55
sfx *= 0.9
mix = music + sfx
fade = int(2.0 * SR)
end = int(END * SR)
mix = mix[:, :end]
music, sfx = music[:, :end], sfx[:, :end]
mix[:, -fade:] *= np.linspace(1, 0, fade)


def write(path, x):
    peak = np.abs(x).max()
    y = np.clip(x / max(peak, 1e-9) * 0.89, -1, 1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((y.T * 32767).astype('<i2').tobytes())


os.makedirs(OUT, exist_ok=True)
write(os.path.join(OUT, 'music.wav'), music)
write(os.path.join(OUT, 'sfx.wav'), sfx)
raw = os.path.join(OUT, 'mix_raw.wav')
write(raw, mix)
subprocess.run(
    ['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', os.path.join(OUT, 'mix.wav')],
    check=True,
)
os.remove(raw)
print(f'{len(CUTS)} cut notes, {END:.1f} s -> {OUT}/mix.wav')
