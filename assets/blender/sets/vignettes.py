"""SET: Vignettes. Three small "island" sets floating in the navy void for quick montage beats (RicksClips-style
one-image-per-clause cutaways): CLASS (x=-7), DINNER (x=0), SHOWER (x=+7). Each is a round floor with a curved back
wall, so any camera inside a ~100 deg cone in front sees a finished room, and the edges dissolve into fog.

Run:  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P assets/blender/sets/vignettes.py
Out:  studio/public/assets/set_vignettes.glb   assets/blend/set_vignettes.blend
Marks: MARK_<island>_mo (where Mo goes), MARK_<island> (island centre), LIGHT_<island> (practical).
Add an island: write a function like dinner(ox) and give it a free x slot.
"""
import bpy, math, os, sys, random

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib'))
import common as K  # noqa: E402

random.seed(5)
K.reset()
coll = K.collection('SET_VIGNETTES')
M = K.material
B = K.box
objs = []


def add(o):
    objs.append(o)
    return o


metal = M('TOON_plain_metal', '#2B2F3A', rough=0.4, metal=0.6)
wood = M('TOON_wood_furniture', '#6A4C36', rough=0.6)
wood_dark = M('TOON_wood_dark', '#3A2A22', rough=0.6)
ink = M('INK', '#16181E')
R = 2.4


daysky = M('GLOW_daysky', '#BFE3FF', emission='#BFE3FF', strength=1.6)


def on_wall(ox, a, r):
    ar = math.radians(a)
    return ox - math.sin(ar) * r, math.cos(ar) * r


def window(ox, a, z=1.55, w=0.9, h=1.1, frame=None):
    frame = frame or wood
    x, y = on_wall(ox, a, R - 0.13)
    add(B('win_frame', (w + 0.1, 0.06, h + 0.1), (x, y, z), frame, coll, bevel=0.01, rot=(0, 0, a)))
    add(B('win_pane', (w, 0.02, h), (x - math.sin(math.radians(a)) * -0.02, y - math.cos(math.radians(a)) * 0.02, z), daysky, coll, rot=(0, 0, a)))
    for k in (-1, 1):  # mullions
        add(B('win_mullion', (0.03, 0.05, h), (x, y, z), frame, coll, rot=(0, 0, a)))
        add(B('win_mullion', (w, 0.05, 0.03), (x, y, z + k * 0.0), frame, coll, rot=(0, 0, a)))


def poster(ox, a, z, w, h, mat):
    x, y = on_wall(ox, a, R - 0.13)
    add(B('poster', (w, 0.015, h), (x, y, z), mat, coll, rot=(0, 0, a)))


def island(ox, floor_mat, wall_mat, name):
    add(K.cylinder(f'{name}_floor', R, 0.08, (ox, 0, -0.04), floor_mat, coll, segs=72))
    # walls wrap 220 deg, so most camera angles inside the room see a finished room (not the void)
    add(K.arc_block(f'{name}_wall', R - 0.12, R, 0, 2.7, -110, 110, wall_mat, coll))
    add(K.arc_block(f'{name}_skirting', R - 0.16, R - 0.12, 0, 0.12, -110, 110, wood_dark, coll))
    add(K.arc_block(f'{name}_crown', R - 0.18, R - 0.12, 2.6, 2.68, -110, 110, M('TOON_plain_crown', '#E8E0CC'), coll))
    for o in objs[-3:]:
        o.location.x += ox
    K.empty(f'MARK_{name}', (ox, 0, 0), coll)


# ---------------------------------------------------------------- CLASS
def classroom(ox):
    island(ox, M('TOON_tiles_classfloor', '#5B6478'), M('TOON_plain_classwall', '#3F5A5A'), 'class')
    # chalkboard on the back wall
    add(B('chalk_frame', (2.3, 0.06, 1.15), (ox, R - 0.2, 1.55), wood, coll, bevel=0.01))
    add(B('chalkboard', (2.18, 0.04, 1.03), (ox, R - 0.23, 1.55), M('TOON_plain_chalkboard', '#22352E'), coll))
    chalk = M('TOON_plain_chalk', '#D8DCCF')
    for i in range(6):  # scribbled equations: short chalk strokes
        y = 1.88 - i * 0.14
        x0 = ox - 0.95 + random.uniform(0, 0.15)
        while x0 < ox + 0.9 - random.uniform(0, 0.8):
            w = random.uniform(0.04, 0.16)
            add(B('chalk_mark', (w, 0.01, 0.02 if random.random() < 0.7 else 0.07), (x0 + w / 2, R - 0.26, y), chalk, coll,
                  rot=(0, random.uniform(-12, 12), 0)))
            x0 += w + random.uniform(0.02, 0.06)
    add(B('chalk_ledge', (2.2, 0.08, 0.03), (ox, R - 0.27, 1.0), wood, coll))
    add(K.cylinder('clock_face', 0.17, 0.03, (ox + 1.45, R - 0.25, 2.25), M('TOON_paper_clock', '#E8E0CC'), coll, rot=(90, 0, 0)))
    add(K.cylinder('clock_rim', 0.19, 0.025, (ox + 1.45, R - 0.24, 2.25), metal, coll, rot=(90, 0, 0)))
    # three desks (Mo's front-centre) + chairs
    for k, (dx, dy) in enumerate([(0, -0.2), (-1.15, 0.35), (1.15, 0.35)]):
        add(B('desk_top', (0.8, 0.55, 0.04), (ox + dx, dy, 0.74), wood, coll, bevel=0.008))
        for sx in (-1, 1):
            for sy in (-1, 1):
                add(K.cylinder('desk_leg', 0.018, 0.72, (ox + dx + sx * 0.36, dy + sy * 0.23, 0.36), metal, coll, segs=8))
        add(B('chair_seat', (0.42, 0.4, 0.04), (ox + dx, dy - 0.5, 0.45), M('TOON_plain_chair', '#8C5A3A'), coll, bevel=0.01))
        add(B('chair_back', (0.42, 0.04, 0.32), (ox + dx, dy - 0.7, 0.72), M('TOON_plain_chair', '#8C5A3A'), coll, bevel=0.01))
        for sx in (-1, 1):
            add(K.cylinder('chair_leg', 0.015, 0.45, (ox + dx + sx * 0.18, dy - 0.5, 0.225), metal, coll, segs=8))
        add(B('book_open', (0.42, 0.28, 0.015), (ox + dx + 0.05, dy + 0.02, 0.768), M('TOON_paper_page', '#E8E0CC'), coll))
    for a in (-75, 75):
        window(ox, a, z=1.5, w=1.0, h=1.2)
    poster(ox, -40, 1.75, 0.8, 0.5, M('TOON_paper_worldmap', '#7FB3A8'))
    poster(ox, 42, 1.8, 0.5, 0.65, M('TOON_paper_classposter', '#E2B45A'))
    for k in range(5):  # lockers on the right
        x, y = on_wall(ox, -98 + k * 0, R - 0.35)
    for k in range(4):
        add(B('locker', (0.34, 0.4, 1.7), (ox + 1.9 - k * 0.0, -1.0 + k * 0.36, 0.85), M('TOON_plain_locker', '#3E7C7A'), coll, bevel=0.01, rot=(0, 0, 90)))
    add(B('teacher_desk', (1.1, 0.6, 0.75), (ox - 1.2, 1.3, 0.375), wood, coll, bevel=0.01))
    add(K.cylinder('globe', 0.12, 0.24, (ox - 1.45, 1.3, 0.87), M('TOON_plain_globe', '#4A7FB0'), coll, segs=20))
    K.empty('MARK_class_mo', (ox, -0.7, 0), coll)
    K.empty('LIGHT_class', (ox - 1.2, -0.6, 2.6), coll)


# ---------------------------------------------------------------- DINNER
def dinner(ox):
    island(ox, M('TOON_planks_dinefloor', '#5A3E2C'), M('TOON_stripes_dinewall', '#6B3E3A'), 'dinner')
    add(K.cylinder('table_top', 0.75, 0.05, (ox, 0.25, 0.76), wood, coll, segs=48))
    add(K.cylinder('tablecloth', 0.8, 0.012, (ox, 0.25, 0.79), M('TOON_fabric_cloth', '#D9D2C2'), coll, segs=48))
    add(K.cylinder('table_post', 0.06, 0.72, (ox, 0.25, 0.37), wood_dark, coll, segs=12))
    add(K.cylinder('table_foot', 0.32, 0.04, (ox, 0.25, 0.02), wood_dark, coll, segs=24))
    plate = M('TOON_plain_plate', '#EDE8DC')
    food = [M('TOON_plain_pasta', '#E2B45A'), M('TOON_plain_peas', '#6E9A4E'), M('TOON_plain_sauce', '#B0452F')]
    for k, a in enumerate((-90, 30, 150)):
        ar = math.radians(a)
        px, py = ox + math.cos(ar) * 0.45, 0.25 + math.sin(ar) * 0.45
        add(K.cylinder('plate', 0.15, 0.02, (px, py, 0.805), plate, coll, segs=32, r2=0.12))
        f = add(K.ellipsoid('food', (0.08, 0.07, 0.035), loc=(px, py, 0.83), coll=coll))
        K.assign(f, food[k])
        add(K.cylinder('glass', 0.035, 0.11, (px + 0.17, py + 0.08, 0.85), M('TOON_plain_glass', '#9FB8C8'), coll, segs=14))
        # chair behind each plate
        cx, cy = ox + math.cos(ar) * 1.05, 0.25 + math.sin(ar) * 1.05
        add(B('chair_seat', (0.44, 0.42, 0.04), (cx, cy, 0.46), wood, coll, bevel=0.01, rot=(0, 0, a + 90)))
        bx, by = ox + math.cos(ar) * 1.26, 0.25 + math.sin(ar) * 1.26
        add(B('chair_back', (0.44, 0.04, 0.5), (bx, by, 0.72), wood, coll, bevel=0.01, rot=(0, 0, a + 90)))
    add(B('picture_frame', (0.7, 0.04, 0.5), (ox - 0.9, R - 0.32, 1.7), wood_dark, coll, rot=(0, 0, 22)))
    add(B('picture', (0.6, 0.02, 0.4), (ox - 0.9, R - 0.35, 1.7), M('TOON_paper_painting', '#C97B4A'), coll, rot=(0, 0, 22)))
    # pendant lamp
    add(K.cylinder('pendant_cord', 0.006, 1.0, (ox, 0.25, 2.3), ink, coll, segs=6))
    add(K.cylinder('pendant_shade', 0.12, 0.2, (ox, 0.25, 1.72), M('GLOW_pendant', '#FFD9A0', emission='#FFC27A', strength=3.0),
                   coll, r2=0.3, segs=32))
    add(K.cylinder('pendant_bulb', 0.04, 0.05, (ox, 0.25, 1.64), M('GLOW_bulb', '#FFE7C2', emission='#FFE7C2', strength=8.0), coll))
    window(ox, 70, z=1.55, w=0.9, h=1.0, frame=wood_dark)
    cab = M('TOON_wood_cabinet', '#8C6A4A')
    for k in range(4):  # kitchen counter + cabinets along the right wall
        x, y = on_wall(ox, -60 - k * 12, R - 0.45)
        add(B('counter', (0.6, 0.6, 0.9), (x, y, 0.45), cab, coll, bevel=0.01, rot=(0, 0, -60 - k * 12)))
        add(B('counter_top', (0.62, 0.64, 0.04), (x, y, 0.92), M('TOON_plain_countertop', '#D9D2C2'), coll, rot=(0, 0, -60 - k * 12)))
        x2, y2 = on_wall(ox, -60 - k * 12, R - 0.3)
        add(B('cabinet_hi', (0.6, 0.35, 0.6), (x2, y2, 1.9), cab, coll, bevel=0.01, rot=(0, 0, -60 - k * 12)))
    fx_, fy_ = on_wall(ox, -108, R - 0.5)
    add(B('fridge', (0.7, 0.7, 1.8), (fx_, fy_, 0.9), M('TOON_plain_fridge', '#E8EDEC'), coll, bevel=0.03, rot=(0, 0, -108)))
    add(K.cylinder('vase', 0.06, 0.18, (ox + 0.15, 0.4, 0.88), M('TOON_plain_vase', '#3E7C7A'), coll, segs=16))
    for k in range(3):
        fl = add(K.ellipsoid('flower', (0.04, 0.04, 0.03), loc=(ox + 0.12 + k * 0.03, 0.4 + (k - 1) * 0.03, 1.0 + k * 0.02), coll=coll))
        K.assign(fl, M('TOON_plain_flower', ['#E58C8A', '#F2C94C', '#E8E0CC'][k]))
    K.empty('MARK_dinner_mo', (ox + math.cos(math.radians(-90)) * 1.05, 0.25 - 1.05 + 0.25, 0), coll)
    K.empty('LIGHT_dinner', (ox, 0.25, 1.6), coll)


# ---------------------------------------------------------------- SHOWER
def shower(ox):
    tile = M('TOON_tiles_bath', '#7FA3A8')
    island(ox, M('TOON_tiles_bathfloor', '#C9CFC8'), tile, 'shower')
    tub_m = M('TOON_plain_tub', '#E9EDEC')
    TX, TY, TW, TD, TH = ox, 1.2, 1.7, 0.8, 0.55
    add(B('tub_front', (TW, 0.08, TH), (TX, TY - TD / 2, TH / 2), tub_m, coll, bevel=0.02))
    add(B('tub_back', (TW, 0.08, TH), (TX, TY + TD / 2, TH / 2), tub_m, coll, bevel=0.02))
    for s in (-1, 1):
        add(B('tub_end', (0.08, TD, TH), (TX + s * TW / 2, TY, TH / 2), tub_m, coll, bevel=0.02))
    add(B('tub_floor', (TW, TD, 0.06), (TX, TY, 0.08), tub_m, coll))
    add(B('water', (TW - 0.1, TD - 0.1, 0.02), (TX, TY, 0.18), M('TOON_plain_water', '#9FC3D0'), coll))
    # shower pipe + head
    add(K.cylinder('shower_pipe', 0.018, 1.5, (TX - 0.55, R - 0.2, 1.4), metal, coll, segs=10))
    add(K.cylinder('shower_arm', 0.018, 0.35, (TX - 0.55, R - 0.37, 2.15), metal, coll, segs=10, rot=(90, 0, 0)))
    add(K.cylinder('shower_head', 0.11, 0.06, (TX - 0.55, R - 0.55, 2.1), metal, coll, segs=20, r2=0.05, rot=(-25, 0, 0)))
    # curtain rod + gathered curtain (half drawn, so Mo's head pokes out)
    add(K.cylinder('curtain_rod', 0.015, TW + 0.2, (TX, TY - TD / 2 - 0.05, 2.25), metal, coll, segs=10, rot=(0, 90, 0)))
    cm = M('TOON_stripes_curtain', '#E6D9A8')
    x = TX - TW / 2
    k = 0
    while x < TX + 0.15:
        add(K.cylinder('curtain', 0.05, 1.75, (x, TY - TD / 2 - 0.05 + 0.025 * (k % 2), 1.36), cm, coll, segs=10))
        x += 0.085
        k += 1
    for i in range(3):
        add(B('towel', (0.06, 0.4, 0.55), (TX + TW / 2 + 0.5, R - 0.35 - i * 0.02, 1.3), M(f'TOON_fabric_towel{i}', ['#C9826B', '#3E7C7A', '#D9B26A'][i]),
              coll, rot=(0, 0, 90 + i * 4)))
    add(B('mirror', (0.6, 0.03, 0.8), (TX + 1.25, R - 0.6, 1.6), M('TOON_plain_mirror', '#B9CAD6'), coll, rot=(0, 0, 32)))
    window(ox, -75, z=1.9, w=0.6, h=0.5, frame=tub_m)
    sx, sy = on_wall(ox, 60, R - 0.4)
    add(B('sink_cabinet', (0.7, 0.5, 0.8), (sx, sy, 0.4), M('TOON_plain_vanity', '#3E5B74'), coll, bevel=0.02, rot=(0, 0, 60)))
    add(K.cylinder('sink', 0.2, 0.08, (sx, sy, 0.84), tub_m, coll, segs=24, r2=0.16))
    add(K.cylinder('plant_pot', 0.1, 0.2, (ox - 1.6, -0.6, 0.1), M('TOON_plain_pot', '#B0623E'), coll, segs=16))
    for k in range(6):
        lf = add(K.ellipsoid('leaf', (0.04, 0.14, 0.02), loc=(ox - 1.6 + 0.06 * math.cos(k), -0.6 + 0.06 * math.sin(k), 0.32 + 0.03 * (k % 3)), coll=coll))
        lf.rotation_euler = (math.radians(30), 0, k)
        K.assign(lf, M('TOON_plain_plant', '#3E6B4E'))
    K.empty('MARK_shower_mo', (TX + 0.25, TY, 0.1), coll)
    K.empty('LIGHT_shower', (TX + 0.3, 0.4, 2.5), coll)


classroom(-7.0)
dinner(0.0)
shower(7.0)

for o in objs:
    if o.type == 'MESH' and max(o.dimensions) > 0.6:
        K.densify(o, 0.3)
print('BAKED', K.bake_ao([o for o in objs if o.type == 'MESH'], samples=40, distance=0.7))
print('BUILT', K.export_glb('set_vignettes', [o for o in coll.objects]))
K.save_blend('set_vignettes', mark_assets=[coll])
