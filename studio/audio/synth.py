"""Tiny deterministic synth kit (numpy only): piano, pad, drone, percussion, SFX, reverb.
Everything returns float32 arrays at SR. Mono = shape (n,), stereo = shape (2, n)."""
import numpy as np

SR = 44100
rng = np.random.default_rng(7)


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def _shelf(f, lo, hi, order=4):
    f = np.maximum(f, 1e-3)
    m = np.ones_like(f)
    if lo:
        m *= 1 / (1 + (lo / f) ** order)
    if hi:
        m *= 1 / (1 + (f / hi) ** order)
    return m


def bp(x, lo=None, hi=None):
    """smooth FFT band-pass (lo/hi in Hz, either may be None)"""
    X = np.fft.rfft(x)
    X *= _shelf(np.fft.rfftfreq(len(x), 1 / SR), lo, hi)
    return np.fft.irfft(X, len(x))


def noise(n):
    return rng.standard_normal(n)


def norm(x, peak):
    m = np.abs(x).max()
    return (x * (peak / m if m > 0 else 0)).astype(np.float32)


# ---------------------------------------------------------------- instruments

def piano(midi, vel=0.6, dur=None):
    """felt-piano-ish: inharmonic partials, two detuned strings, soft hammer"""
    f = hz(midi)
    dur = dur or float(np.clip(5.5 * (261 / f) ** 0.5, 1.6, 6.5))
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    B = 0.00035
    for k in range(1, 9):
        fk = f * k * np.sqrt(1 + B * k * k)
        if fk > 12000:
            break
        amp = (0.35 + 0.65 * vel) ** (0.4 * k) / k ** 1.5
        tau = dur * 0.42 / k ** 0.7
        for det in (1.0, 1.0011):
            out += amp * np.exp(-t / tau) * np.sin(2 * np.pi * fk * det * t + rng.random() * 6.283)
    out *= np.minimum(1, t / 0.005)
    out += bp(noise(n), 200, 2500) * np.exp(-t / 0.01) * 0.03
    rel = np.ones(n)
    k = int(0.25 * SR)
    rel[-k:] = np.linspace(1, 0, k)
    return norm(out * rel, vel)


def pluck(midi, vel=0.4):
    """short muted pluck for the 'performing' montage"""
    f = hz(midi)
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    out = sum((1 / k) * np.sin(2 * np.pi * f * k * t) * np.exp(-t / (0.12 / k)) for k in range(1, 6))
    return norm(out * np.minimum(1, t / 0.003), vel)


def pad(midis, dur, vel=0.25, attack=1.5, release=2.5):
    n = int((dur + release) * SR)
    t = np.arange(n) / SR
    out = np.zeros((2, n))
    for m in midis:
        f = hz(m)
        for i, det in enumerate((-0.0035, 0.0, 0.0035)):
            ph = rng.random() * 6.283
            s = np.sin(2 * np.pi * f * (1 + det) * t + ph) + 0.22 * np.sin(4 * np.pi * f * (1 + det) * t + ph) + 0.06 * np.sin(6 * np.pi * f * (1 + det) * t)
            p = (i - 1) * 0.7
            out[0] += s * np.sqrt(0.5 * (1 - p))
            out[1] += s * np.sqrt(0.5 * (1 + p))
    env = np.minimum(1, t / attack) * np.where(t > dur, np.exp(-(t - dur) / (release / 4)), 1)
    out *= env * (1 + 0.05 * np.sin(2 * np.pi * 0.18 * t))
    return norm(out, vel)


def drone(dur, vel=0.3, f=55.0, rise=2.0, fall=0.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 2 * f * t + 1) + 0.25 * np.sin(2 * np.pi * 3.01 * f * t)
    s += bp(noise(n), 60, 320) * 0.8
    env = np.minimum(1, t / rise) * np.clip((dur - t) / fall, 0, 1)
    return norm(s * env * (1 + 0.15 * np.sin(2 * np.pi * 0.13 * t)), vel)


def kick(vel=0.5):
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 46 + 60 * np.exp(-t / 0.035)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.13), vel)


def tick(vel=0.2, dur=0.025, lo=3000, hi=9000):
    n = int(dur * SR)
    x = bp(noise(n + 512), lo, hi)[:n]
    t = np.arange(n) / SR
    return norm(x * np.exp(-t / (dur / 5)), vel)


# ---------------------------------------------------------------- sound effects

def click(vel=0.5, body=1900.0):
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * body * t) * np.exp(-t / 0.005)
    x += 0.7 * bp(noise(n), 2500, 11000) * np.exp(-t / 0.003)
    x += 0.6 * np.sin(2 * np.pi * 170 * t) * np.exp(-t / 0.02)
    return norm(x, vel)


def shutter(vel=0.4):
    a = click(1.0, 2600)
    b = click(0.8, 2100)
    n = int(0.2 * SR)
    out = np.zeros(n)
    out[: len(a)] += a
    k = int(0.065 * SR)
    out[k : k + len(b)] += b[: n - k]
    t = np.arange(n) / SR
    out += 0.25 * bp(noise(n), 3000, 9000) * np.exp(-t / 0.03)
    return norm(out, vel)


def pop(vel=0.3, f0=700, f1=1150):
    n = int(0.16 * SR)
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / 0.02)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.045) * np.minimum(1, t / 0.002), vel)


def ding(vel=0.3, base=1318.5):
    n = int(1.2 * SR)
    t = np.arange(n) / SR
    x = sum(a * np.sin(2 * np.pi * base * r * t) * np.exp(-t / d) for r, a, d in [(1, 1, 0.5), (1.5, 0.6, 0.35), (2.76, 0.25, 0.15)])
    return norm(x * np.minimum(1, t / 0.002), vel)


def whoosh(vel=0.25, dur=0.35):
    n = int(dur * SR)
    t = np.arange(n) / SR
    env = np.sin(np.pi * t / dur) ** 2
    return norm(bp(noise(n), 400, 5000) * env, vel)


def thud(vel=0.3, f=120.0):
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.05) + 0.5 * bp(noise(n), 80, 900) * np.exp(-t / 0.02)
    return norm(x, vel)


def clunk(vel=0.9):
    """stadium house lights slamming on: low hit + metal + electrical hum"""
    n = int(3.0 * SR)
    t = np.arange(n) / SR
    f = 42 + 70 * np.exp(-t / 0.06)
    x = 1.2 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.35)
    for fr, d in [(212, 0.5), (347, 0.4), (523, 0.3), (811, 0.22), (1290, 0.15)]:
        x += 0.18 * np.sin(2 * np.pi * fr * t + rng.random()) * np.exp(-t / d)
    x += 0.6 * bp(noise(n), 100, 4000) * np.exp(-t / 0.04)
    hum = (np.sin(2 * np.pi * 120 * t) + 0.4 * np.sin(2 * np.pi * 240 * t)) * np.clip(t / 0.3, 0, 1) * np.exp(-t / 1.6) * 0.12
    return norm(x + hum, vel)


def clap(vel=0.3):
    n = int(0.12 * SR)
    out = np.zeros(n)
    for off in (0, 0.009, 0.018):
        k = int(off * SR)
        m = n - k
        tt = np.arange(m) / SR
        out[k:] += bp(noise(m), 900, 4500) * np.exp(-tt / 0.012)
    return norm(out, vel)


def scratch(dur, vel=0.1, rate=7.0):
    """pencil on paper"""
    n = int(dur * SR)
    t = np.arange(n) / SR
    strokes = np.abs(np.sin(2 * np.pi * rate * t + np.sin(2 * np.pi * 1.3 * t) * 2)) ** 0.7
    gaps = (np.sin(2 * np.pi * 0.7 * t + 1) > -0.6).astype(float)
    env = np.minimum(1, t / 0.05) * np.minimum(1, (dur - t) / 0.1)
    return norm(bp(noise(n), 2200, 7500) * strokes * gaps * env, vel)


def slide(vel=0.2, dur=0.8):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return norm(bp(noise(n), 150, 1500) * np.sin(np.pi * t / dur) ** 0.6, vel)


def blow(vel=0.3, dur=0.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    env = np.minimum(1, t / 0.04) * np.exp(-t / 0.25)
    return norm(bp(noise(n), 300, 2800) * env, vel)


def powerdown(vel=0.3, dur=2.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 40 + 90 * np.exp(-t / 0.9)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    return norm(x * np.minimum(1, t / 0.05) * np.exp(-t / 0.9), vel)


def whisper(dur, vel=0.25):
    """breathy, syllabic, unintelligible: the crowd's voice"""
    n = int(dur * SR)
    t = np.arange(n) / SR
    hiss = bp(noise(n), 2500, 7500)
    voice = bp(noise(n), 250, 1100) * 0.7
    syl = np.zeros(n)
    pos = 0
    while pos < n:
        L = int(SR * rng.uniform(0.07, 0.17))
        e = np.sin(np.linspace(0, np.pi, L)) ** 2
        m = min(L, n - pos)
        syl[pos : pos + m] = e[:m]
        pos += L + int(SR * rng.uniform(0.0, 0.05))
    env = np.minimum(1, t / 0.04) * np.clip((dur - t) / 0.15, 0, 1)
    return norm((hiss * 0.8 + voice) * syl * env, vel)


def room(dur, vel=0.004):
    n = int(dur * SR)
    return norm(bp(noise(n), 60, 500), vel)


# ---------------------------------------------------------------- reverb

def reverb(x, secs=2.6, wet=0.3, seed=1, dark=5000):
    """stereo convolution reverb with a synthetic, darkened noise IR"""
    r = np.random.default_rng(seed)
    n = int(secs * SR)
    t = np.arange(n) / SR
    ir = np.stack([r.standard_normal(n), r.standard_normal(n)]) * np.exp(-t / (secs / 6.9))
    ir = np.stack([bp(ir[0], 80, dark), bp(ir[1], 80, dark)])
    ir[:, : int(0.02 * SR)] = 0
    L = x.shape[1] + n
    nfft = 1 << int(np.ceil(np.log2(L)))
    out = np.zeros((2, x.shape[1]), np.float32)
    for c in range(2):
        out[c] = np.fft.irfft(np.fft.rfft(x[c], nfft) * np.fft.rfft(ir[c], nfft), nfft)[: x.shape[1]]
    rx = np.sqrt((x ** 2).mean()) + 1e-12
    ro = np.sqrt((out ** 2).mean()) + 1e-12
    return (x + wet * out * (rx / ro)).astype(np.float32)
