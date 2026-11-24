"""Import an ElevenLabs voice-over + its Scribe word timings into a short (replaces the scratch VO).

    .venv/bin/python audio/vo/import_eleven.py src/shorts/checks96 public/audio/checks96/eleven/vo.mp3 public/audio/checks96/eleven/vo.words.json

Matches the spoken words to lines.json tokens in order ([audio tags] skipped), writes public/audio/<short>/vo.wav
(48 kHz, light polish) and <short>/vo.json (same structure as make_vo.py, so cuts and captions re-time themselves).
Budget note: one eleven_v4 take of a 60-70 s short is about 2.8k credits; Scribe timings are free.
"""
import json, os, re, subprocess, sys

short, mp3 = (os.path.abspath(a) for a in sys.argv[1:3])
wj = sys.argv[3] if len(sys.argv) > 3 else '-'
TEMPO = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0  # >1 speeds the read up (pitch kept), timings follow
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
name = os.path.basename(short)
lines = json.load(open(os.path.join(short, 'lines.json')))
def pause_words():
    """no transcript: split the recording at the (len(lines)-1) longest pauses, space words by length"""
    import numpy as np
    SR = 16000
    v = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', mp3, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'],
                                     capture_output=True, check=True).stdout, np.float32)
    hop = 160
    env = np.sqrt(np.convolve(v ** 2, np.ones(hop) / hop, 'same')[::hop])
    on = env > 0.03 * env.max()
    idx = np.flatnonzero(on)
    t0, t1 = idx[0], idx[-1]
    gaps, run = [], None
    for i in range(t0, t1):
        if not on[i] and run is None:
            run = i
        if on[i] and run is not None:
            gaps.append((i - run, run, i))
            run = None
    cuts = sorted(sorted(gaps, reverse=True)[: len(lines) - 1], key=lambda g: g[1])
    if len(cuts) < len(lines) - 1:
        sys.exit(f'found {len(cuts) + 1} spoken parts but lines.json has {len(lines)} lines: leave a clear pause between lines')
    bounds = [(t0, cuts[0][1])] + [(cuts[k][2], cuts[k + 1][1]) for k in range(len(cuts) - 1)] + [(cuts[-1][2], t1)] if cuts else [(t0, t1)]
    out = []
    for l, (a, b) in zip(lines, bounds):
        toks = l['cap'].split()
        wts = [2 + len(t) for t in toks]
        tot = sum(wts)
        t = a / 100
        for tk, w in zip(toks, wts):
            d = (b - a) / 100 * w / tot
            out.append({'text': tk.replace('*', ''), 'start': t, 'end': t + d})
            t += d
    return out


if wj == '-':
    spoken = pause_words()
else:
    raw = json.load(open(wj))
    words = raw['words'] if isinstance(raw, dict) else raw
    spoken = [w for w in words if w.get('type', 'word') == 'word' and not re.fullmatch(r'\[.*\]', w['text'].strip())]
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
LEAD = 0.25  # silence before the first word
t_first = spoken[0]['start']
off = LEAD - t_first / TEMPO
T = lambda t: t / TEMPO
out, k = [], 0
for l in lines:
    caps = l['cap'].split()
    ws, inkey = [], False
    for c in caps:
        inkey = inkey or c.startswith('*')
        w = spoken[k]
        if norm(w['text']) != norm(c.replace('*', '')):
            print('WARN mismatch', l['id'], repr(c), repr(w['text']))
        ws.append({'w': c.replace('*', ''), 'key': inkey, 't0': round(T(w['start']) + off, 3), 't1': round(T(w['end']) + off, 3)})
        if re.search(r'\*[.,!?]?$', c):
            inkey = False
        k += 1
    out.append({'id': l['id'], 'beat': l.get('beat'), 't0': ws[0]['t0'], 't1': ws[-1]['t1'], 'words': ws})
assert k == len(spoken), (k, len(spoken))
dur = T(spoken[-1]['end']) + off + 0.35
outdir = os.path.join(ROOT, 'public', 'audio', name)
# shift so the first word lands at LEAD, cut the tail, gentle polish (it is already a clean studio voice)
trim = max(0.0, t_first - LEAD * TEMPO)
pad = max(0.0, LEAD - t_first / TEMPO)
subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-ss', f'{trim:.3f}', '-i', mp3, '-af',
                       f'atempo={TEMPO},adelay={int(pad * 1000)},highpass=f=70,acompressor=threshold=-20dB:ratio=2:attack=8:release=120:makeup=2,'
                       f'atrim=0:{dur:.3f},aresample=48000', '-ac', '1', os.path.join(outdir, 'vo.wav')])
# Scribe word starts run ~30-160 ms late: snap every line to the real onset in the audio (shift the whole line)
import numpy as np  # noqa: E402
SR = 16000
v = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(outdir, 'vo.wav'), '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'],
                                 capture_output=True, check=True).stdout, np.float32)
hop = 160
env = np.sqrt(np.convolve(v ** 2, np.ones(hop) / hop, 'same')[::hop])
thr = 0.02 * env.max()
onsets = [i / 100 for i in range(3, len(env)) if env[i] > thr and env[i - 3:i].max() <= thr]
for l in out:
    near = min(onsets, key=lambda o: abs(o - l['t0']))
    dlt = near - l['t0']
    if -0.22 < dlt < 0.06:
        for w in l['words']:
            w['t0'] = round(max(0.0, w['t0'] + dlt), 3)
            w['t1'] = round(w['t1'] + dlt, 3)
        l['t0'], l['t1'] = l['words'][0]['t0'], l['words'][-1]['t1']
json.dump({'voice': 'import:' + os.path.basename(mp3), 'duration': round(dur, 3), 'lines': out},
          open(os.path.join(short, 'vo.json'), 'w'), indent=1)
wc = sum(len(l['words']) for l in out)
print(f'{dur:.2f} s, {wc} words, {wc / dur * 60:.0f} words/min')
