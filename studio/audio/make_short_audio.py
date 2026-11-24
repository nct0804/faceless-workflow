"""Score + sound design + mix for a short, anchored to the voice-over words (vo.json). Everything synthesized locally.

    .venv/bin/python audio/make_short_audio.py checks96

Writes public/audio/<short>/{music,sfx,mix}.wav. mix = VO + music (ducked under the voice) + SFX at -14 LUFS.
RicksClips rule: music sits LOW under a wall of words, SFX hit every action. Ours: felt piano + one silence.
"""
import json
import os
import re
import subprocess
import sys
import wave

import numpy as np

import synth as S
from synth import SR

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAME = sys.argv[1] if len(sys.argv) > 1 else 'checks96'
OUT = os.path.join(ROOT, 'public', 'audio', NAME)
vo_meta = json.load(open(os.path.join(ROOT, 'src', 'shorts', NAME, 'vo.json')))
LINES = {l['id']: l for l in vo_meta['lines']}
FPS = 30
TAIL = 45 / FPS
END = round(vo_meta['duration'] * FPS) / FPS + TAIL
N = int((END + 1.0) * SR)


def L(i):
    return LINES[i]['t0']


def Lend(i):
    return LINES[i]['t1']


def W(i, w, n=1):
    norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
    k = 0
    for x in LINES[i]['words']:
        if norm(x['w']) == norm(w):
            k += 1
            if k == n:
                return x['t0']
    raise KeyError((i, w))


music = np.zeros((2, N), np.float32)
sfx = np.zeros((2, N), np.float32)


def put(buf, x, t0, gain=1.0, pan=0.0):
    i = int(round(t0 * SR))
    if i >= N or i < 0:
        return
    if x.ndim == 1:
        x = np.stack([x * np.sqrt(0.5 * (1 - pan)), x * np.sqrt(0.5 * (1 + pan))])
    j = min(N, i + x.shape[1])
    buf[:, i:j] += gain * x[:, : j - i]


# ------------------------------------------------------------------ music: A minor, ~100 bpm pulse
BEAT = 60 / 100
CH = {'Am': [45, 48, 52], 'F': [41, 45, 48], 'C': [48, 52, 55], 'G': [43, 47, 50], 'Dm': [50, 53, 57], 'E': [40, 44, 47]}
PROG = ['Am', 'F', 'C', 'G']

T_STADIUM = W('L13', 'stadium')
T_WEIRD = L('L15')
T_REVEAL = W('L17', "Nobody's")
T_SILENCE = Lend('L21') + 0.2
T_GOOD = L('L23')
T_LOOP = L('L24')

# 1) bedroom: soft piano arpeggios + pluck pulse (0 .. stadium)
t, bar = 0.25, 0
while t < T_STADIUM - 0.5:
    ch = CH[PROG[bar % 4]]
    for k in range(8):
        tt = t + k * BEAT / 2
        if tt >= T_STADIUM - 0.5:
            break
        note = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 24][k % 4]
        put(music, S.pluck(note, 0.22 if k % 2 else 0.3), tt, 0.5, pan=0.3 if k % 2 else -0.3)
    put(music, S.piano(ch[0], 0.4, 3.5), t, 0.55)
    put(music, S.piano(ch[2] + 12, 0.3, 3.0), t + BEAT * 2, 0.35)
    t += BEAT * 4
    bar += 1
# low pad under the bedroom section
put(music, S.pad([45, 52, 57], T_STADIUM - 1.0, vel=0.12, attack=2.0, release=1.5), 0.2, 1.0)

# 2) stadium: boom + drone + whisper bed (stadium .. weird)
put(music, S.kick(0.9), T_STADIUM, 1.2)
put(music, S.drone(T_WEIRD - T_STADIUM + 0.5, vel=0.35, f=55.0, rise=0.2, fall=0.4), T_STADIUM, 1.0)
t = T_STADIUM
while t < T_WEIRD - 0.2:
    put(music, S.kick(0.35), t, 0.6)          # heartbeat pulse
    put(music, S.kick(0.22), t + 0.28, 0.5)
    t += BEAT * 2
put(music, S.pad([45, 48, 51], T_WEIRD - T_STADIUM, vel=0.18, attack=0.8, release=0.6), T_STADIUM, 1.0)  # A dim: tense

# 3) "But it gets weirder": ticking clock only (weird .. reveal)
t = T_WEIRD + 0.1
while t < T_REVEAL - 0.05:
    put(music, S.tick(0.25), t, 0.7, pan=0.2)
    t += BEAT / 2

# 4) reveal: pad swell + piano that resolves (reveal .. silence)
put(music, S.whoosh(0.4, 0.8), T_REVEAL - 0.6, 0.6)
put(music, S.pad([45, 52, 57, 60], T_SILENCE - T_REVEAL, vel=0.2, attack=1.0, release=0.8), T_REVEAL, 1.0)
t, k = T_REVEAL, 0
seq = ['Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'E']
while t < T_SILENCE - 0.4:
    ch = CH[seq[k % len(seq)]]
    put(music, S.piano(ch[0] + 12, 0.45, 3.0), t, 0.5)
    put(music, S.piano(ch[2] + 12, 0.35, 2.5), t + BEAT, 0.35)
    put(music, S.piano(ch[1] + 24, 0.3, 2.0), t + BEAT * 1.5, 0.3)
    t += BEAT * 2
    k += 1

# 5) silence for "Nobody was watching." (the still shot) -- nothing but room tone
# 6) "the good news": one note back, then C major resolve to the end
put(music, S.piano(60, 0.55, 5.0), T_GOOD - 0.05, 0.7)
put(music, S.pad([48, 55, 60, 64], END - T_GOOD + 0.5, vel=0.18, attack=1.5, release=2.0), T_GOOD, 1.0)
t, k = T_LOOP, 0
for name in ['C', 'G', 'Am', 'F', 'C', 'G', 'C']:
    if t > END - 0.3:
        break
    ch = CH[name]
    for j, note in enumerate([ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 24]):
        put(music, S.pluck(note, 0.25), t + j * BEAT / 2, 0.45, pan=-0.3 + 0.2 * j)
    put(music, S.piano(ch[0], 0.4, 3.0), t, 0.5)
    t += BEAT * 2
put(music, S.piano(72, 0.4, 5.0), END - 1.3, 0.45)

music = S.reverb(music, secs=2.8, wet=0.35, seed=3)
# hard silence window (after the reverb, so it is truly quiet)
a, b = int(T_SILENCE * SR), int((T_GOOD - 0.08) * SR)
fade = int(0.25 * SR)
env = np.ones(N, np.float32)
env[a:b] = 0
env[a:a + fade] = np.linspace(1, 0, fade)
music *= env

# ------------------------------------------------------------------ SFX (on the actions)
put(sfx, S.click(0.35, 2400), 0.33, 0.6)                               # phone screen wakes (hook)
put(sfx, S.whoosh(0.3, 0.3), W('L01', 'for') - 0.15, 0.5)
for k in range(9):                                                     # scoreboard roll
    put(sfx, S.tick(0.3, 0.02, 2500, 8000), L('L03') + 0.1 + k * 0.08, 0.6)
put(sfx, S.pop(0.35), W('L04', 'dragon.') + 0.1, 0.6)                    # posted
put(sfx, S.pop(0.3, 900, 1500), L('L05') + 0.15, 0.6)                    # 9 likes
put(sfx, S.click(0.4, 1500), W('L06', 'deletes') + 0.1, 0.7)
put(sfx, S.whoosh(0.35, 0.25), W('L06', 'deletes') + 0.4, 0.6)
put(sfx, S.scratch(1.6, 0.08), L('L02') + 0.1, 0.8)                      # pencil (S02)
put(sfx, S.scratch(2.4, 0.08), L('L07') + 0.1, 0.8)                      # pencil (S07a)
put(sfx, S.click(0.3, 3200), W('L07', 'posts') + 0.35, 0.6)            # clock flips to 2:00
put(sfx, S.ding(0.25), L('L08') + 0.1, 0.5)
for w, n in (('class,', 1), ('at', 1), ('in', 2)):                       # vignette whips
    put(sfx, S.whoosh(0.35, 0.22), W('L09', w, n) - 0.12, 0.6)
put(sfx, S.blow(0.12, 1.2), W('L09', 'shower.') + 0.1, 0.4)              # shower hiss
for k in range(6):                                                     # refresh flicks
    put(sfx, S.tick(0.35, 0.03, 1500, 6000), W('L10', "He's") + k * 0.38, 0.6)
for k in range(22):                                                    # pickups counting up
    put(sfx, S.tick(0.22, 0.015, 3000, 9000), L('L11') + k * 0.035, 0.5)
put(sfx, S.thud(0.25, 160), W('L11', 'Zero'), 0.5)
put(sfx, S.whoosh(0.5, 0.9), W('L13', 'Because') + 0.1, 0.7)           # into his head
put(sfx, S.clunk(0.9), T_STADIUM, 0.9)                                 # stadium lights
put(sfx, S.whisper(T_WEIRD - T_STADIUM, 0.18), T_STADIUM + 0.2, 0.6)   # the crowd murmurs
put(sfx, S.whoosh(0.4, 1.4), L('L16') + 0.1, 0.6)                       # fly up the aisle
for k in range(30):                                                    # phones lighting in a wave
    put(sfx, S.pop(0.08, 1200 + 40 * (k % 7), 1700), T_REVEAL + k * 0.045, 0.35, pan=np.sin(k) * 0.7)
put(sfx, S.clunk(0.7), W('L21', 'nobody'), 0.8)                          # spotlight off
put(sfx, S.powerdown(0.2, 1.4), W('L21', 'nobody') + 0.05, 0.4)
put(sfx, S.room(T_GOOD - T_SILENCE + 0.4, 0.01), T_SILENCE, 1.0)       # room tone in the silence
put(sfx, S.thud(0.3, 110), L('L24') + 0.9, 0.6)                          # phone face down
put(sfx, S.scratch(END - W('L24', 'picks'), 0.08), W('L24', 'picks') + 0.3, 0.8)
# the buzz he ignores
bz = W('L24', 'check.') - 20 / FPS
n = int(0.45 * SR)
tt = np.arange(n) / SR
buzz = np.sign(np.sin(2 * np.pi * 165 * tt)) * 0.5 * (np.sin(2 * np.pi * 9 * tt) > -0.2) * np.minimum(1, (0.45 - tt) * 20)
put(sfx, S.bp(buzz, 120, 2500).astype(np.float32), bz, 0.25)

# ------------------------------------------------------------------ VO + duck + mix
vo_path = os.path.join(OUT, 'vo.wav')
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', vo_path, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(raw, np.float32)
vo = np.pad(vo, (0, max(0, N - len(vo))))[:N]
# voice envelope -> duck music by up to ~9 dB while speaking (fast attack, slow release)
win = int(0.05 * SR)
e = np.sqrt(np.convolve(vo ** 2, np.ones(win) / win, mode='same'))
speaking = (e > 0.01).astype(np.float32)
rel = int(0.35 * SR)
sm = np.convolve(speaking, np.ones(rel) / rel, mode='same')
duck = 1 - 0.65 * np.clip(sm * 1.5, 0, 1)
voS = np.stack([vo, vo])
mixed = voS * 1.0 + music * duck * 0.42 + sfx * 0.5


def write(path, x):
    y = np.clip(x / max(np.abs(x).max(), 1e-9) * 0.89, -1, 1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((y.T * 32767).astype('<i2').tobytes())


write(os.path.join(OUT, 'music.wav'), music)
write(os.path.join(OUT, 'sfx.wav'), sfx)
tmp = os.path.join(OUT, '_mix_raw.wav')
write(tmp, mixed[:, : int(END * SR)])
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', 'acompressor=threshold=-18dB:ratio=2.5:attack=10:release=150,loudnorm=I=-14:TP=-1.5:LRA=7',
                '-ar', '48000', os.path.join(OUT, 'mix.wav')], check=True)
os.remove(tmp)
print(f'{END:.1f} s -> {OUT}/mix.wav')
