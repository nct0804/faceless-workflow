#!/usr/bin/env python3
"""Render housekeeping: which videos have old renders, are they published, clean up the posted ones.

    python3 studio/bin/renders.py status [--days 14]   # table: every studio/out/<NN-slug>/, size, age, Published
    python3 studio/bin/renders.py stale  [--days 14]   # only the ones to ASK about (renders older than N days,
                                                       # Published not yet answered in the brief)
    python3 studio/bin/renders.py mark <NN-slug> yes "YouTube, TikTok"   # record the answer in videos/<NN-slug>/brief.md
    python3 studio/bin/renders.py mark <NN-slug> no
    python3 studio/bin/renders.py clean <NN-slug>      # ONLY for published videos: move studio/out/<NN-slug>/ to the
                                                       # macOS Trash (recoverable). Source (videos/, src/) stays, so the
                                                       # video can be re-rendered any time with bin/render.sh ... final

Rule (CLAUDE.md, user 2026-11-24): published -> delete the renders; not published -> keep everything, drafts too.
"""
import os
import re
import shutil
import sys
import time

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'studio', 'out')
VIDEOS = os.path.join(ROOT, 'videos')
PUB_RE = re.compile(r'^\| *Published *\|(.*)\|\s*$', re.M)


def args_days():
    return int(sys.argv[sys.argv.index('--days') + 1]) if '--days' in sys.argv else 14


def size_and_age(d):
    total, newest = 0, 0.0
    for dp, _, fs in os.walk(d):
        for f in fs:
            p = os.path.join(dp, f)
            st = os.stat(p)
            total += st.st_size
            newest = max(newest, st.st_mtime)
    age = (time.time() - newest) / 86400 if newest else 0
    return total, age


def published(slug):
    """'yes: ...' | 'no' | 'unknown' (no brief or field not answered yet)"""
    b = os.path.join(VIDEOS, slug, 'brief.md')
    if not os.path.exists(b):
        return 'unknown'
    m = PUB_RE.search(open(b).read())
    if not m:
        return 'unknown'
    v = m.group(1).strip()
    return v if v and not v.startswith('not asked') else 'unknown'


def video_dirs():
    if not os.path.isdir(OUT):
        return []
    return sorted(d for d in os.listdir(OUT) if re.match(r'^\d\d-', d) and os.path.isdir(os.path.join(OUT, d)))


def status(only_stale=False):
    days = args_days()
    rows = []
    for v in video_dirs():
        size, age = size_and_age(os.path.join(OUT, v))
        pub = published(v)
        ask = age >= days and not pub.lower().startswith(('yes', 'no'))
        # "no" is re-asked once another N days have passed since it was checked (it may have been posted since)
        m = re.search(r'checked (\d{4}-\d{2}-\d{2})', pub)
        if pub.lower().startswith('no') and m and age >= days:
            ask = (time.time() - time.mktime(time.strptime(m.group(1), '%Y-%m-%d'))) / 86400 >= days
        if only_stale and not ask:
            continue
        rows.append((v, f'{size / 1e6:,.0f} MB', f'{age:.0f} d', pub, 'ASK' if ask else ''))
    if not rows:
        print('nothing to ask about' if only_stale else 'no renders')
        return
    w = [max(len(r[i]) for r in rows + [('video', 'size', 'age', 'published', '')]) for i in range(5)]
    for r in [('video', 'size', 'age', 'published', '')] + rows:
        print('  '.join(c.ljust(w[i]) for i, c in enumerate(r)))


def mark(slug, ans, where=''):
    b = os.path.join(VIDEOS, slug, 'brief.md')
    s = open(b).read()
    val = f"yes: {where} ({time.strftime('%Y-%m-%d')})" if ans == 'yes' else f"no (checked {time.strftime('%Y-%m-%d')})"
    row = f'| Published | {val} |'
    if PUB_RE.search(s):
        s = PUB_RE.sub(row, s, count=1)
    else:  # add the row at the end of the first table
        lines = s.split('\n')
        last = max(i for i, l in enumerate(lines) if l.startswith('|'))
        lines.insert(last + 1, row)
        s = '\n'.join(lines)
    open(b, 'w').write(s)
    print(f'{slug}: Published = {val}')


def clean(slug):
    if not published(slug).lower().startswith('yes'):
        sys.exit(f'{slug} is not marked as published. Rule: unpublished videos keep all renders (drafts too).')
    d = os.path.join(OUT, slug)
    if not os.path.isdir(d):
        sys.exit(f'no renders for {slug}')
    size, _ = size_and_age(d)
    dest = os.path.expanduser(f"~/.Trash/{slug}-renders-{time.strftime('%Y%m%d-%H%M%S')}")
    shutil.move(d, dest)
    print(f'moved {size / 1e6:,.0f} MB of renders to the Trash: {dest}')
    print(f're-render any time: cd studio && bin/render.sh <Comp> {slug} final')


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'status'
    if cmd == 'status':
        status()
    elif cmd == 'stale':
        status(only_stale=True)
    elif cmd == 'mark':
        mark(sys.argv[2], sys.argv[3], sys.argv[4] if len(sys.argv) > 4 else '')
    elif cmd == 'clean':
        clean(sys.argv[2])
    else:
        print(__doc__)
