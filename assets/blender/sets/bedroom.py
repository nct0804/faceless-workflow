"""SET: Mo's bedroom (the channel's home base). Reusable for every video: night / morning / lamp-off are
lighting choices made per shot in three.js, the geometry never changes.

Run:  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P assets/blender/sets/bedroom.py
Out:  studio/public/assets/set_bedroom.glb   assets/blend/set_bedroom.blend   (AO baked into COLOR_0)

Layout (metres, Blender: +X right, +Y away from the default camera, +Z up; three.js gets x, z->y, -y->z):
  floor 4.6 x 4.0 centred at (0, 0.6); back wall y=+2.6 with the window; left wall x=-2.3 with the door;
  right side open (camera side angles). Bed against the back-right, desk + window at back-left.

Material names are an API (studio/src/kit3d/materials.ts):
  TOON_<pattern>_<name>  -> cel material; <pattern> in {plain, wood, planks, stripes, fabric, paper, brick, tiles}
                            draws procedural ink strokes in world space (no UVs needed)
  GLOW_<name>            -> emissive (screens, lamp bulbs, city windows, moon). Bloom picks them up
  INK                    -> flat ink
Marks (empties) MARK_* = where characters / cameras / practical lights go.
"""
import bpy, math, os, sys, random

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib'))
import common as K  # noqa: E402

random.seed(7)
K.reset()
coll = K.collection('SET_BEDROOM')
M = K.material
P = K.PALETTE

wall = M('TOON_stripes_wall', '#2A3350', rough=0.9)          # navy wallpaper with faint stripes
wall2 = M('TOON_plain_wallside', '#232B45', rough=0.9)
trim = M('TOON_wood_trim', '#3B2C24', rough=0.7)
floor = M('TOON_planks_floor', '#4A3528', rough=0.6)
wood = M('TOON_wood_furniture', '#5A4232', rough=0.6)
wood_dark = M('TOON_wood_dark', '#3A2A22', rough=0.6)
sheet = M('TOON_fabric_sheet', '#D9D2C2', rough=0.95)
blanket = M('TOON_fabric_blanket', '#3E5B74', rough=0.95)
pillow = M('TOON_plain_pillow', '#E8E2D4', rough=0.95)
rug = M('TOON_fabric_rug', '#7A3E3A', rough=1.0)
metal = M('TOON_plain_metal', '#2B2F3A', rough=0.4, metal=0.6)
paper = M('TOON_paper_paper', '#E8E0CC', rough=1.0)
plant = M('TOON_plain_plant', '#3E6B4E', rough=0.8)
pot = M('TOON_plain_pot', '#B0623E', rough=0.8)
curtain = M('TOON_fabric_curtain', '#6B4A3A', rough=1.0)
frame_m = M('TOON_plain_frame', '#1E2230', rough=0.7)
lampshade = M('GLOW_lampshade', '#FFD9A0', emission='#FFC27A', strength=3.0)
bulb = M('GLOW_bulb', '#FFE7C2', emission='#FFE7C2', strength=8.0)
screen = M('GLOW_screen', '#9FB8FF', emission='#8FB0FF', strength=2.5)
city = M('GLOW_citywin', '#F2A93B', emission='#F2A93B', strength=3.0)
moon = M('GLOW_moon', '#E9EEF8', emission='#E9EEF8', strength=4.0)
sky = M('TOON_plain_nightsky', '#0E1426', rough=1.0)
skyline = M('TOON_plain_skyline', '#151B2E', rough=1.0)
ink = M('INK', P['ink'], rough=1.0)
books = [M(f'TOON_plain_book{i}', c, rough=0.8) for i, c in
         enumerate(['#8C3B32', '#C9826B', '#3E7C7A', '#D9B26A', '#5B4E7A', '#E8E0CC', '#2F4A6B'])]
posters = [M('TOON_paper_poster1', '#C97B4A'), M('TOON_paper_poster2', '#4A6B8C')]

objs = []


def add(o):
    objs.append(o)
    return o


B = K.box
# ---------------------------------------------------------------- shell
FLOOR_W, FLOOR_D, FY = 4.6, 4.0, 0.6
WALL_H = 2.75
add(B('floor_base', (FLOOR_W, FLOOR_D, 0.05), (0, FY, -0.025), floor, coll))
# planks as real geometry: the gaps become ink lines for free
x = -FLOOR_W / 2
while x < FLOOR_W / 2 - 0.01:
    w = 0.19
    add(B('plank', (w - 0.008, FLOOR_D, 0.012), (x + w / 2, FY, 0.006),
          M('TOON_planks_floor%d' % random.randint(0, 2), random.choice(['#4A3528', '#51392B', '#443126']), rough=0.6),
          coll))
    x += w
BACK_Y = FY + FLOOR_D / 2              # 2.6
LEFT_X = -FLOOR_W / 2                  # -2.3
# back wall with a window hole: built from 4 boxes around the opening
WIN_X0, WIN_X1, WIN_Z0, WIN_Z1 = -1.55, -0.35, 1.0, 2.15
T = 0.12
add(B('wall_back_l', (WIN_X0 - LEFT_X, T, WALL_H), ((LEFT_X + WIN_X0) / 2, BACK_Y + T / 2, WALL_H / 2), wall, coll))
add(B('wall_back_r', (FLOOR_W / 2 - WIN_X1, T, WALL_H), ((WIN_X1 + FLOOR_W / 2) / 2, BACK_Y + T / 2, WALL_H / 2), wall, coll))
add(B('wall_back_b', (WIN_X1 - WIN_X0, T, WIN_Z0), ((WIN_X0 + WIN_X1) / 2, BACK_Y + T / 2, WIN_Z0 / 2), wall, coll))
add(B('wall_back_t', (WIN_X1 - WIN_X0, T, WALL_H - WIN_Z1), ((WIN_X0 + WIN_X1) / 2, BACK_Y + T / 2, (WIN_Z1 + WALL_H) / 2), wall, coll))
add(B('wall_left', (T, FLOOR_D, WALL_H), (LEFT_X - T / 2, FY, WALL_H / 2), wall2, coll))
add(B('ceiling', (FLOOR_W, FLOOR_D, 0.08), (0, FY, WALL_H + 0.04), wall2, coll))
# skirting + crown trim
add(B('skirting_back', (FLOOR_W, 0.025, 0.12), (0, BACK_Y - 0.0125, 0.06), trim, coll, bevel=0.006))
add(B('skirting_left', (0.025, FLOOR_D, 0.12), (LEFT_X + 0.0125, FY, 0.06), trim, coll, bevel=0.006))
# window: frame, mullions, sill, glass is open air; the city sits behind
cx, cz = (WIN_X0 + WIN_X1) / 2, (WIN_Z0 + WIN_Z1) / 2
ww, wh = WIN_X1 - WIN_X0, WIN_Z1 - WIN_Z0
for n, (sx, sz, px, pz) in enumerate([(ww + 0.1, 0.06, cx, WIN_Z1), (ww + 0.1, 0.06, cx, WIN_Z0),
                                      (0.06, wh, WIN_X0, cz), (0.06, wh, WIN_X1, cz),
                                      (0.035, wh, cx, cz), (ww, 0.035, cx, cz + 0.12)]):
    add(B(f'window_frame{n}', (sx, 0.08, sz), (px, BACK_Y + 0.02, pz), trim, coll, bevel=0.008))
add(B('window_sill', (ww + 0.3, 0.22, 0.045), (cx, BACK_Y - 0.08, WIN_Z0 - 0.02), trim, coll, bevel=0.01))
for s in (-1, 1):   # curtains, gathered
    for k in range(4):
        add(K.cylinder('curtain', 0.055, WIN_Z1 - WIN_Z0 + 0.5,
                       (cx + s * (ww / 2 + 0.12 + k * 0.07), BACK_Y - 0.12 - 0.02 * (k % 2), cz + 0.1), curtain, coll, segs=12))
add(K.cylinder('curtain_rod', 0.015, ww + 0.9, (cx, BACK_Y - 0.12, WIN_Z1 + 0.28), metal, coll, segs=12, rot=(0, 90, 0)))
# outside: night sky card, skyline blocks with lit windows, moon
add(B('sky', (6, 0.05, 4), (cx, BACK_Y + 3.0, 1.6), sky, coll))
for i in range(9):
    bw, bh = random.uniform(0.35, 0.7), random.uniform(0.8, 2.6)
    bx = cx - 1.9 + i * 0.45 + random.uniform(-0.05, 0.05)
    by = BACK_Y + random.uniform(1.4, 2.6)
    add(B('building', (bw, 0.3, bh), (bx, by, bh / 2 + 0.2), skyline, coll))
    for r in range(int(bh / 0.22)):
        for c in range(int(bw / 0.14)):
            if random.random() < 0.22:
                add(B('citywin', (0.06, 0.01, 0.08), (bx - bw / 2 + 0.08 + c * 0.14, by - 0.16, 0.35 + r * 0.22), city, coll))
add(K.cylinder('moon', 0.16, 0.02, (cx + 0.35, BACK_Y + 2.9, 2.35), moon, coll, segs=40, rot=(90, 0, 0)))

# ---------------------------------------------------------------- bed (back-right)
BX, BY = 1.15, BACK_Y - 1.05
add(B('bed_frame', (1.25, 2.05, 0.30), (BX, BY, 0.20), wood, coll, bevel=0.02))
add(B('bed_head', (1.35, 0.08, 1.05), (BX, BACK_Y - 0.04, 0.55), wood_dark, coll, bevel=0.02))
for s in (-1, 1):
    add(B('bed_leg', (0.08, 0.08, 0.1), (BX + s * 0.56, BY - 0.95, 0.05), wood_dark, coll))
add(K.rounded_box('mattress', (1.18, 1.98, 0.22), 0.06, segs=4, coll=coll))
objs[-1].location = (BX, BY, 0.46)
K.assign(objs[-1], sheet)
add(K.rounded_box('pillow', (0.62, 0.34, 0.15), 0.07, segs=5, coll=coll, subdiv=1))
objs[-1].location = (BX - 0.2, BACK_Y - 0.28, 0.63)
objs[-1].rotation_euler = (math.radians(8), 0, math.radians(4))
K.assign(objs[-1], pillow)
bl = add(K.rounded_box('blanket', (1.24, 1.30, 0.10), 0.05, segs=4, coll=coll, subdiv=1))
for v in bl.data.vertices:                     # rumpled folds
    v.co.z += 0.03 * math.sin(v.co.x * 9 + v.co.y * 3) + 0.02 * math.sin(v.co.y * 13)
bl.location = (BX, BY - 0.35, 0.58)
K.assign(bl, blanket)
# nightstand + lamp (the warm practical)
NX, NY = BX - 0.95, BACK_Y - 0.3
add(B('nightstand', (0.45, 0.40, 0.55), (NX, NY, 0.275), wood, coll, bevel=0.015))
add(B('nightstand_drawer', (0.36, 0.02, 0.16), (NX, NY - 0.21, 0.36), wood_dark, coll, bevel=0.006))
add(K.cylinder('lamp_base', 0.07, 0.03, (NX, NY, 0.565), metal, coll))
add(K.cylinder('lamp_stem', 0.012, 0.30, (NX, NY, 0.73), metal, coll, segs=10))
add(K.cylinder('lamp_shade', 0.15, 0.20, (NX, NY, 0.93), lampshade, coll, r2=0.09))
add(K.cylinder('lamp_bulb', 0.04, 0.05, (NX, NY, 0.86), bulb, coll, segs=12))
add(B('alarm_clock', (0.12, 0.06, 0.08), (NX + 0.13, NY - 0.08, 0.59), metal, coll, bevel=0.01))
K.empty('LIGHT_lamp', (NX, NY, 0.88), coll)

# ---------------------------------------------------------------- desk + chair + laptop (under the window)
DX, DY = cx, BACK_Y - 0.45
add(B('desk_top', (1.45, 0.70, 0.05), (DX, DY, 0.76), wood, coll, bevel=0.01))
for sx in (-1, 1):
    for sy in (-1, 1):
        add(B('desk_leg', (0.05, 0.05, 0.74), (DX + sx * 0.66, DY + sy * 0.30, 0.37), wood_dark, coll))
add(B('desk_drawers', (0.42, 0.64, 0.45), (DX + 0.48, DY, 0.5), wood_dark, coll, bevel=0.01))
add(B('laptop_base', (0.36, 0.25, 0.018), (DX - 0.1, DY - 0.05, 0.795), metal, coll, bevel=0.004))
lid = add(B('laptop_lid', (0.36, 0.015, 0.24), (DX - 0.1, DY + 0.08, 0.92), metal, coll, bevel=0.004, rot=(-12, 0, 0)))
add(B('laptop_screen', (0.33, 0.004, 0.205), (DX - 0.1, DY + 0.07, 0.92), screen, coll, rot=(-12, 0, 0)))
for i in range(5):   # papers + sketchbook
    add(B('paper', (0.21, 0.297, 0.003), (DX + 0.25 + random.uniform(-0.1, 0.1), DY - 0.1 + random.uniform(-0.08, 0.08),
                                         0.787 + i * 0.003), paper, coll, rot=(0, 0, random.uniform(-25, 25))))
add(K.cylinder('mug', 0.045, 0.1, (DX - 0.5, DY - 0.15, 0.835), M('TOON_plain_mug', '#C9826B'), coll, segs=16))
add(K.cylinder('pencil_cup', 0.04, 0.11, (DX - 0.56, DY + 0.15, 0.84), metal, coll, segs=14))
for k in range(4):
    add(K.cylinder('pencil', 0.006, 0.18, (DX - 0.56 + 0.012 * (k - 1.5), DY + 0.15, 0.93), books[k], coll, segs=6,
                   rot=(random.uniform(-10, 10), random.uniform(-10, 10), 0)))
# chair
CX, CY = DX - 0.05, DY - 0.62
add(B('chair_seat', (0.46, 0.44, 0.05), (CX, CY, 0.47), wood, coll, bevel=0.01))
add(B('chair_back', (0.46, 0.04, 0.5), (CX, CY - 0.21, 0.76), wood, coll, bevel=0.01, rot=(-6, 0, 0)))
for sx in (-1, 1):
    for sy in (-1, 1):
        add(B('chair_leg', (0.04, 0.04, 0.46), (CX + sx * 0.2, CY + sy * 0.19, 0.23), wood_dark, coll))

# ---------------------------------------------------------------- left wall: door, shelf, posters
add(B('door', (0.05, 0.92, 2.05), (LEFT_X + 0.03, FY - 1.1, 1.025), wood_dark, coll, bevel=0.01))
add(B('door_frame', (0.06, 1.06, 2.14), (LEFT_X + 0.015, FY - 1.1, 1.07), trim, coll, bevel=0.01))
add(K.cylinder('door_knob', 0.03, 0.06, (LEFT_X + 0.08, FY - 0.75, 1.0), metal, coll, segs=12, rot=(0, 90, 0)))
add(B('shelf', (0.26, 1.1, 0.03), (LEFT_X + 0.13, FY + 0.65, 1.55), wood, coll, bevel=0.005))
y = FY + 0.18
while y < FY + 1.15:
    bh, bt = random.uniform(0.18, 0.28), random.uniform(0.03, 0.06)
    add(B('book', (0.18, bt, bh), (LEFT_X + 0.13, y, 1.565 + bh / 2), random.choice(books), coll, bevel=0.004,
          rot=(random.choice([0, 0, 0, 8]), 0, 0)))
    y += bt + 0.006
for i, (py, pz, w, h) in enumerate([(FY + 0.55, 2.05, 0.5, 0.65), (FY + 1.35, 1.0, 0.42, 0.55)]):
    add(B('poster_frame', (0.02, w + 0.05, h + 0.05), (LEFT_X + 0.01, py, pz), frame_m, coll))
    add(B('poster', (0.01, w, h), (LEFT_X + 0.025, py, pz), posters[i], coll))
# back wall: pinned drawings above the bed (Mo draws)
for i in range(5):
    add(B('drawing', (0.21, 0.01, 0.28), (0.35 + i * 0.3 + random.uniform(-0.04, 0.04), BACK_Y - 0.01,
                                          1.55 + random.uniform(-0.1, 0.12)), paper, coll,
          rot=(0, random.uniform(-6, 6), 0)))

# ---------------------------------------------------------------- floor clutter
r = add(K.cylinder('rug', 0.95, 0.012, (0.15, FY - 0.35, 0.018), rug, coll, segs=48))
r.scale = (1.0, 0.75, 1.0)
add(K.cylinder('pot', 0.13, 0.26, (LEFT_X + 0.35, BACK_Y - 0.3, 0.13), pot, coll, segs=20, r2=0.1))
for k in range(7):
    a = k / 7 * math.tau
    leaf = add(K.ellipsoid('leaf', (0.05, 0.16, 0.025), loc=(LEFT_X + 0.35 + 0.1 * math.cos(a), BACK_Y - 0.3 + 0.1 * math.sin(a),
                                                            0.42 + 0.05 * (k % 3)), coll=coll))
    leaf.rotation_euler = (math.radians(35), 0, a + math.pi / 2)
    K.assign(leaf, plant)
for k in range(3):   # hoodie pile on the floor
    p = add(K.ellipsoid('clothes', (0.22 - 0.04 * k, 0.16, 0.05), loc=(0.55 + 0.05 * k, FY - 1.15, 0.05 + 0.04 * k), coll=coll))
    K.assign(p, M('TOON_fabric_pile', ['#DED2B9', '#3E5B74', '#2E3440'][k]))

# ---------------------------------------------------------------- marks (characters, cameras, lights)
MARKS = {
    'MARK_mo_desk': (CX, CY + 0.08, 0.0),        # sitting on the chair, facing the laptop (+Y)
    'MARK_mo_bed': (BX - 0.1, BY - 0.6, 0.6),     # lying / sitting on the bed
    'MARK_mo_center': (0.1, FY - 0.4, 0.0),       # standing on the rug
    'MARK_mo_door': (LEFT_X + 0.5, FY - 1.1, 0.0),
    'MARK_cam_wide': (1.9, FY - 3.4, 1.35),
    'MARK_cam_desk': (DX + 0.9, DY - 1.9, 1.1),
    'MARK_cam_window': (cx, BACK_Y + 1.2, 1.6),   # outside, looking in through the window
    'MARK_moonlight': (cx + 0.6, BACK_Y + 3.0, 3.0),
}
for n, loc in MARKS.items():
    K.empty(n, loc, coll)

# ---------------------------------------------------------------- bake + export
for o in objs:
    if o.type == 'MESH' and max(o.dimensions) > 0.5:
        K.densify(o, 0.15)
n = K.bake_ao([o for o in objs if o.type == 'MESH'], samples=48, distance=0.7)
print('BAKED', n)
export = [o for o in coll.objects]
print('BUILT', K.export_glb('set_bedroom', export))
K.save_blend('set_bedroom', mark_assets=[coll])
