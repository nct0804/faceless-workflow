"""SET: the Stadium in Mo's head. Reusable for any "everyone is judging me" beat: the spotlight effect, stage fright,
the imagined audience. A round court with a centre spotlight, ringed by steep bleachers (300 deg, open at the front
so a camera can track in from outside), four floodlight towers, aisles every 50 deg.

Run:  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P assets/blender/sets/stadium.py
Out:  studio/public/assets/set_stadium.glb   assets/blend/set_stadium.blend

The crowd is NOT baked in: the runtime fills seats (kit3d/Crowd.tsx) from the numbers on MARK_stands
(userData: r0, depth, rise, tiers, a0, a1, aisles, aisleW), so rows can be full, empty, looking up or down.
"""
import bpy, math, os, sys, random

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib'))
import common as K  # noqa: E402

random.seed(11)
K.reset()
coll = K.collection('SET_STADIUM')
M = K.material
objs = []


def add(o):
    objs.append(o)
    return o


court = M('TOON_planks_court', '#5C4330', rough=0.6)
court2 = M('TOON_planks_court2', '#644A35', rough=0.6)
paint = M('TOON_plain_courtline', '#C9B48A', rough=0.8)
concrete = M('TOON_tiles_concrete', '#2C3450', rough=0.9)
concrete2 = M('TOON_plain_riser', '#232A42', rough=0.9)
bench = M('TOON_wood_bench', '#41506E', rough=0.7)
wall = M('TOON_brick_wall', '#262D47', rough=0.9)
metal = M('TOON_plain_metal', '#1E2232', rough=0.4, metal=0.6)
ink = M('INK', '#16181E', rough=1.0)
flood = M('GLOW_flood', '#FFF1D6', emission='#FFF1D6', strength=10.0)
exitsign = M('GLOW_exit', '#F2A93B', emission='#F2A93B', strength=4.0)
banner = [M('TOON_fabric_banner1', '#8C3B32'), M('TOON_fabric_banner2', '#3E7C7A')]

# ---------------------------------------------------------------- court
R_COURT = 3.2
add(K.cylinder('court_base', R_COURT + 0.3, 0.1, (0, 0, -0.05), concrete2, coll, segs=96))
x = -R_COURT
i = 0
while x < R_COURT:  # planks clipped to the circle: real gaps = ink lines
    w = 0.22
    half = math.sqrt(max(0.0, R_COURT ** 2 - (x + w / 2) ** 2))
    if half > 0.1:
        add(K.box('court_plank', (w - 0.01, 2 * half, 0.02), (x + w / 2, 0, 0.01), court if i % 3 else court2, coll))
    x += w
    i += 1
for r, t in ((0.9, 0.04), (R_COURT - 0.12, 0.05)):  # painted rings (centre circle, boundary)
    add(K.arc_block('court_ring', r - t, r, 0.02, 0.026, 0, 360, paint, coll, segs=96))
add(K.box('court_halfline', (2 * R_COURT - 0.3, 0.05, 0.006), (0, 0, 0.023), paint, coll))

# ---------------------------------------------------------------- bleachers
R0, DEPTH, RISE, TIERS = 4.2, 0.78, 0.42, 12
A0, A1 = -150.0, 150.0         # open 60 deg at the front (-Y side, toward the default camera)
AISLES = [-100, -50, 0, 50, 100]
AISLE_W = 7.0                  # degrees
add(K.arc_block('wall_front', R0 - 0.25, R0, 0, 1.05, A0, A1, wall, coll))           # barrier wall around the court
add(K.arc_block('wall_front_cap', R0 - 0.3, R0 + 0.05, 1.05, 1.11, A0, A1, concrete2, coll))
edges = [A0] + [a for c in AISLES for a in (c - AISLE_W / 2, c + AISLE_W / 2)] + [A1]
sections = [(edges[k], edges[k + 1]) for k in range(0, len(edges), 2)]
for t in range(TIERS):
    r_in, r_out = R0 + t * DEPTH, R0 + (t + 1) * DEPTH
    z = 0.9 + t * RISE
    add(K.arc_block('tier', r_in, r_out, 0, z, A0, A1, concrete, coll))            # stepped concrete
    for s0, s1 in sections:                                                         # bench planks per section
        add(K.arc_block('bench', r_in + 0.08, r_in + 0.42, z, z + 0.07, s0 + 0.4, s1 - 0.4, bench, coll))
    for c in AISLES:  # aisle steps (half-height step in the aisle)
        add(K.arc_block('aisle_step', r_in + DEPTH / 2, r_out, z - RISE / 2, z - RISE / 2 + 0.02, c - AISLE_W / 2 + 0.6,
                        c + AISLE_W / 2 - 0.6, concrete2, coll))
TOP = 0.9 + TIERS * RISE
R_BACK = R0 + TIERS * DEPTH
add(K.arc_block('wall_back', R_BACK, R_BACK + 0.3, 0, TOP + 2.2, A0, A1, wall, coll))
# railings on the aisles + along the front
for c in AISLES:
    for side in (-1, 1):
        a = math.radians(c + side * (AISLE_W / 2 - 0.3))
        pts = []
        for t in range(TIERS + 1):
            r = R0 + t * DEPTH
            pts.append((-math.sin(a) * r, math.cos(a) * r, 0.9 + t * RISE + 0.75))
        add(K.tube('rail', pts, 0.022, coll=coll))
        K.assign(objs[-1], metal)
# hanging banners on the back wall
for k, a in enumerate(range(-125, 130, 50)):
    ar = math.radians(a + 25)
    r = R_BACK - 0.02
    add(K.box('banner', (1.0, 0.03, 2.0), (-math.sin(ar) * r, math.cos(ar) * r, TOP + 0.9), banner[k % 2], coll,
              rot=(0, 0, a + 25)))
# tunnel / exit at the back with a glowing sign
add(K.box('exit_sign', (0.9, 0.05, 0.3), (0, R_BACK - 0.05, TOP + 1.85), exitsign, coll))

# ---------------------------------------------------------------- floodlight towers
for k, a in enumerate((-135, -45, 45, 135)):
    ar = math.radians(a)
    r = R_BACK + 1.2
    px, py = -math.sin(ar) * r, math.cos(ar) * r
    add(K.cylinder('tower', 0.12, TOP + 5.0, (px, py, (TOP + 5.0) / 2), metal, coll, segs=12))
    head = add(K.box('flood_frame', (2.2, 0.25, 1.3), (px, py, TOP + 5.2), metal, coll, rot=(0, 0, a)))
    for i in range(3):
        for j in range(2):
            lx = -0.7 + i * 0.7
            lz = -0.3 + j * 0.6
            ox, oy = math.cos(ar) * lx, math.sin(ar) * lx
            add(K.cylinder('flood_lamp', 0.24, 0.06, (px + ox - math.sin(ar) * -0.14, py + oy + math.cos(ar) * -0.14,
                                                      TOP + 5.2 + lz), flood, coll, segs=20, rot=(90, 0, a)))
    K.empty(f'LIGHT_flood{k}', (px, py, TOP + 5.2), coll)

# the spotlight rig above centre court
add(K.cylinder('spot_can', 0.3, 0.6, (0, 0, 9.0), metal, coll, segs=20, r2=0.42))
add(K.cylinder('spot_lens', 0.38, 0.02, (0, 0, 8.69), flood, coll, segs=24))
K.empty('LIGHT_spot', (0, 0, 8.6), coll)

# ---------------------------------------------------------------- marks
st = K.empty('MARK_stands', (0, 0, 0), coll)
K.props(st, r0=R0, depth=DEPTH, rise=RISE, tiers=TIERS, a0=A0, a1=A1, aisles=AISLES, aisleW=AISLE_W, seatZ=0.9 + 0.07)
for n, loc in {
    'MARK_mo_center': (0, 0, 0.02),
    'MARK_cam_court': (0, -6.5, 1.3),         # low, from the open front
    'MARK_cam_high': (0, -9.0, TOP + 2.0),    # high wide
    'MARK_cam_stands': (2.6, R0 + 5 * DEPTH, 0.9 + 6 * RISE),
}.items():
    K.empty(n, loc, coll)

for o in objs:
    if o.type == 'MESH' and max(o.dimensions) > 0.6:
        K.densify(o, 0.4)
print('BAKED', K.bake_ao([o for o in objs if o.type == 'MESH'], samples=32, distance=1.2))
print('BUILT', K.export_glb('set_stadium', [o for o in coll.objects]))
K.save_blend('set_stadium', mark_assets=[coll])
