"""Scratch voice-over for a short, with word timings for captions and cuts (all local).

    python3 audio/vo/make_vo.py src/shorts/checks96 [voiceId|auto] [rate]

Reads <short>/lines.json ([{id, cap, say, gap}]; cap and say have the same number of tokens; *key* words in cap).
Writes public/audio/<short>/vo.wav (polished, 48 kHz) and <short>/vo.json ({fps, frames, lines:[{id, t0, t1, words:[{w, key, t0, t1}]}]}).
Recorded your own VO? Put it at public/audio/<short>/vo.wav and re-time vo.json (same structure).
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
short = os.path.abspath(sys.argv[1])
name = os.path.basename(short)
voice = sys.argv[2] if len(sys.argv) > 2 else 'auto'
if voice == 'auto':  # best installed voice: Premium > Enhanced > Siri compact (narrator-style male names first)
    voice = subprocess.check_output(['swift', os.path.join(HERE, 'best_voice.swift'),
                                     'Evan', 'Nathan', 'Tom', 'Jamie', 'Lee', 'Aaron', 'Zoe', 'Ava']).decode().strip()
    print('voice:', voice)
rate = sys.argv[3] if len(sys.argv) > 3 else '0.53'
lines = json.load(open(os.path.join(short, 'lines.json')))
outdir = os.path.join(ROOT, 'public', 'audio', name)
os.makedirs(outdir, exist_ok=True)
tmp = os.path.join(outdir, '_tts')
os.makedirs(tmp, exist_ok=True)

binp = os.path.join(tmp, 'tts')
src = os.path.join(HERE, 'tts.swift')
if not os.path.exists(binp) or os.path.getmtime(binp) < os.path.getmtime(src):
    subprocess.check_call(['swiftc', '-O', '-o', binp, src])
json.dump([{'id': l['id'], 'text': l['say'], 'gap': l.get('gap', 0.12)} for l in lines], open(os.path.join(tmp, 'in.json'), 'w'))
raw = os.path.join(tmp, 'raw.wav')
subprocess.check_call([binp, os.path.join(tmp, 'in.json'), raw, os.path.join(tmp, 'raw.json'), voice, rate])
lead = 0.25  # silence before the first word (seconds)
# polish: high-pass, presence, gentle compression, a touch of room, 48 kHz
subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af',
    f'adelay={int(lead*1000)},highpass=f=90,equalizer=f=220:t=q:w=1:g=-2,equalizer=f=3200:t=q:w=1.2:g=3,'
    'acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=4,'
    'aecho=0.8:0.5:28|41:0.10|0.07,aresample=48000', '-ac', '1', os.path.join(outdir, 'vo.wav')])
r = json.load(open(os.path.join(tmp, 'raw.json')))
out = []
for l, rl in zip(lines, r['lines']):
    caps = l['cap'].split()
    keyed, inkey = [], False
    for c in caps:  # *key* markers may span tokens
        start = c.startswith('*')
        inkey = inkey or start
        keyed.append((c.replace('*', ''), inkey))
        if re.search(r'\*[.,!?]?$', c):
            inkey = False
    words = [{'w': k[0], 'key': k[1], 't0': round(w['t0'] + lead, 3), 't1': round(w['t1'] + lead, 3)} for k, w in zip(keyed, rl['words'])]
    out.append({'id': l['id'], 'beat': l.get('beat'), 't0': round(rl['t0'] + lead, 3), 't1': round(rl['t1'] + lead, 3), 'words': words})
dur = r['duration'] + lead
json.dump({'voice': voice, 'rate': float(rate), 'duration': round(dur, 3), 'lines': out}, open(os.path.join(short, 'vo.json'), 'w'), indent=1)
wc = sum(len(l['words']) for l in out)
print(f'{dur:.2f} s, {wc} words, {wc / dur * 60:.0f} words/min')
