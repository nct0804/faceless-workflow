"""Build the channel's rigged 3D characters and export one GLB + one asset-marked .blend each.

Run (headless, ~3 s per character):
  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P assets/blender/characters/person.py
  add `-- mo crowd` to build only some of them

Design v3 (measured from RicksClips, see research/ricksclips/STYLE_BIBLE.md + CLAUDE.md):
  * ~3.3 heads tall. A SMALL round white head sits straight on the body (no neck), face painted at runtime
    on a FACE shell (studio/src/kit3d/face.ts: 34 expressions)
  * the torso is a THIN pill (~2/3 of the head width) and IS the outfit: hoodie, vest + collar + buttons,
    dress, jacket with zip -- real 3D details (cords, pocket, collar, buttons) that catch the ink line
  * long thin INK stick legs (~38 % of the height) and arms, small ink hands, small shoes
  * identity = hair shell / hat + one accessory (glasses, buns, cap), like the reference
  * every TOON_ mesh gets an ink outline in three.js (inverted hull), so the character reads as a drawing

Rig (bone names are an API: studio/src/kit3d/Character.tsx drives them per frame; hip height kept at 0.5 so
all existing shot placements still line up):
  root > hips > spine > chest > head
  chest > arm.L.1 > arm.L.2      (L = character's left = +X in Blender = screen-right when facing camera)
  chest > arm.R.1 > arm.R.2
  hips  > leg.L.1 > leg.L.2 ,  hips > leg.R.1 > leg.R.2
"""
import bpy, bmesh, math, os, sys
from mathutils import Vector

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib'))
import common as K  # noqa: E402

# ---------------------------------------------------------------- proportions (metres; RicksClips-measured)
HIP_Z = 0.50
TORSO_Z0, TORSO_Z1 = 0.44, 0.90      # the pill
TORSO_W, TORSO_D = 0.27, 0.22
SHOULDER_Z = 0.83
HEAD_R = 0.205
HEAD_C = TORSO_Z1 + HEAD_R - 0.03    # sits straight on the body, tiny overlap
HEAD = (2 * HEAD_R, 2 * HEAD_R, 2 * HEAD_R)
ARM_LEN = 0.52
LIMB_R = 0.0155                      # thin ink sticks


def arm_pts(side):
    s = 1 if side == 'L' else -1
    return [(s * 0.115, 0, SHOULDER_Z), (s * 0.15, 0, SHOULDER_Z - ARM_LEN / 2), (s * 0.165, 0, SHOULDER_Z - ARM_LEN)]


def leg_pts(side):
    s = 1 if side == 'L' else -1
    return [(s * 0.065, 0, HIP_Z), (s * 0.07, 0, HIP_Z * 0.5), (s * 0.072, 0, 0.045)]


def build_armature(name, coll):
    arm = bpy.data.armatures.new(name + '_rig')
    rig = K.link(bpy.data.objects.new(name + '_rig', arm), coll)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode='EDIT')
    eb = arm.edit_bones

    def bone(n, h, t, parent=None, connect=False):
        b = eb.new(n)
        b.head, b.tail = Vector(h), Vector(t)
        b.roll = 0
        if parent:
            b.parent = eb[parent]
            b.use_connect = connect
        return b
    bone('root', (0, 0, 0), (0, 0, 0.12))
    bone('hips', (0, 0, HIP_Z - 0.04), (0, 0, 0.62), 'root')
    bone('spine', (0, 0, 0.62), (0, 0, 0.76), 'hips', True)
    bone('chest', (0, 0, 0.76), (0, 0, 0.90), 'spine', True)
    bone('head', (0, 0, 0.90), (0, 0, HEAD_C + HEAD_R), 'chest')
    for sd in 'LR':
        p = arm_pts(sd)
        bone(f'arm.{sd}.1', p[0], p[1], 'chest')
        bone(f'arm.{sd}.2', p[1], p[2], f'arm.{sd}.1', True)
        q = leg_pts(sd)
        bone(f'leg.{sd}.1', q[0], q[1], 'hips')
        bone(f'leg.{sd}.2', q[1], q[2], f'leg.{sd}.1', True)
    bpy.ops.object.mode_set(mode='OBJECT')
    return rig


def bind(obj, rig, weights):
    """weights: function(co: Vector) -> {bone: w}"""
    groups = {}
    for v in obj.data.vertices:
        co = obj.matrix_world @ v.co
        for b, w in weights(co).items():
            if w <= 0:
                continue
            g = groups.get(b) or obj.vertex_groups.new(name=b)
            groups[b] = g
            g.add([v.index], w, 'REPLACE')
    m = obj.modifiers.new('rig', 'ARMATURE')
    m.object = rig
    obj.parent = rig
    return obj


def chain_weights(pts, bones, blend=0.22):
    P = [Vector(p) for p in pts]

    def fn(co):
        best, bi, bt = 1e9, 0, 0.0
        for i, (a, b) in enumerate(zip(P, P[1:])):
            ab = b - a
            t = max(0.0, min(1.0, (co - a).dot(ab) / ab.length_squared))
            d = (a + ab * t - co).length
            if d < best:
                best, bi, bt = d, i, t
        if bt > 1 - blend and bi + 1 < len(bones):
            f = (bt - (1 - blend)) / (2 * blend)
            return {bones[bi]: 1 - f, bones[bi + 1]: f}
        if bt < blend and bi > 0:
            f = (blend - bt) / (2 * blend)
            return {bones[bi]: 1 - f, bones[bi - 1]: f}
        return {bones[bi]: 1.0}
    return fn


def torso_w(co):
    f = max(0.0, min(1.0, (co.z - 0.58) / 0.24))
    return {'hips': 1 - f, 'spine': f} if co.z < 0.80 else {'spine': 0.35, 'chest': 0.65}


HEAD_W = lambda co: {'head': 1.0}
CHEST_W = lambda co: {'chest': 1.0}


def uv_sphere(name, r, loc, coll, segs=40, rings=28):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=rings, radius=r)
    o = K.mesh_from_bmesh(name, bm, coll)
    o.location = loc
    return K.smooth(o)


def shell(name, r, loc, coll, keep, segs=40, rings=28, plane=None):
    """part of a sphere (hair caps, hoods). plane=(co, normal): a clean straight cut (keeps the +normal side);
    otherwise keep(v_local) decides which verts stay"""
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=rings, radius=r)
    if plane:
        geom = list(bm.verts) + list(bm.edges) + list(bm.faces)
        bmesh.ops.bisect_plane(bm, geom=geom, plane_co=Vector(plane[0]), plane_no=Vector(plane[1]).normalized(), clear_inner=True)
    else:
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if not keep(v.co)], context='VERTS')
    o = K.mesh_from_bmesh(name, bm, coll)
    o.modifiers.new('s', 'SOLIDIFY').thickness = 0.012
    K.apply_mods(o)
    o.location = loc
    return K.smooth(o)


def pill(name, w, d, z0, z1, coll, taper=0.86, flare=1.0):
    """the torso: a rounded pill, slightly narrower at the shoulders (taper) or flared at the hem (dress)"""
    h = z1 - z0
    o = K.rounded_box(name, (w, d, h), min(w, d) * 0.48, segs=8, coll=coll, subdiv=2)
    for v in o.data.vertices:
        f = (v.co.z + h / 2) / h  # 0 hem .. 1 shoulders
        k = flare + (taper - flare) * f ** 1.3
        v.co.x *= k
        v.co.y *= 0.96 + 0.04 * (1 - f)
    o.location = (0, 0, (z0 + z1) / 2)
    return o


def build_person(name, top='#E8A33D', top2=None, hair='#3A2A22', hair_style='messy', outfit='hoodie',
                 shoes='#F4F1EA', scale=1.0, accessories=(), crowd=False):
    coll = K.collection(name.upper())
    top2 = top2 or top
    M_SKIN = K.material('TOON_skin_' + name, '#2A2E3C' if crowd else '#F7F5F0', rough=0.8)
    M_TOP = K.material('TOON_fabric_' + name, top, rough=0.9)
    M_TOP2 = K.material('TOON_fabricshade_' + name, top2, rough=0.9)
    M_HAIR = K.material('TOON_hair_' + name, hair, rough=0.8)
    M_WHITE = K.material('TOON_plain_shirt_' + name, '#F4F1EA', rough=0.9)
    M_INK = K.material('INK', K.PALETTE['ink'], rough=1.0)
    M_SHOE = K.material('TOON_shoe_' + name, shoes, rough=0.7)
    rig = build_armature(name, coll)
    parts = []
    hc = (0, 0, HEAD_C)

    # ---------------------------------------------------------------- head: a small white ball
    head = uv_sphere('head_geo', HEAD_R, hc, coll)
    K.assign(head, M_SKIN)
    parts.append((head, HEAD_W))
    if not crowd:
        # face shell: the front of the ball, 3 mm out, planar UVs over (x, z) -> the runtime face canvas
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=36, radius=HEAD_R + 0.003)
        bm.normal_update()
        bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.normal.y > -0.2], context='FACES')
        uv = bm.loops.layers.uv.new('UVMap')
        for f in bm.faces:
            for lp in f.loops:
                x, z = lp.vert.co.x, lp.vert.co.z
                lp[uv].uv = ((x + HEAD_R) / (2 * HEAD_R), (z + HEAD_R) / (2 * HEAD_R))
        face = K.mesh_from_bmesh('FACE', bm, coll)
        face.location = hc
        K.smooth(face)
        K.assign(face, K.material('FACE', '#FFFFFF', rough=1.0, alpha=0.0))
        parts.append((face, HEAD_W))
    else:
        # the crowd: an amber phone-screen where the eyes should be
        eye = K.rounded_box('phone_eyes', (0.20, 0.04, 0.075), 0.022, segs=3, coll=coll)
        eye.location = (0, -HEAD_R + 0.012, HEAD_C + 0.02)
        K.assign(eye, K.material('GLOW_amber', K.PALETTE['amber'], emission=K.PALETTE['amber'], strength=6))
        parts.append((eye, HEAD_W))

    # ---------------------------------------------------------------- hair / hood (identity)
    R = HEAD_R * 1.045
    if hair_style in ('messy', 'neat', 'buns'):
        # hair cap: hairline low at the back, up at the forehead (-Y = front), a side part for 'neat'
        def keep(c):
            front = -c.y / R          # 1 at the face, -1 at the back
            side = abs(c.x) / R
            line = 0.30 * R * front + (0.12 * R if hair_style == 'neat' and c.x > 0 else 0) - 0.18 * R * (1 - front) * 0.5
            return c.z > line - 0.06 * R * side
        tilt_side = 0.12 if hair_style == 'neat' else 0.0
        cap = shell('hair', R, hc, coll, keep, segs=72, rings=54,
                    plane=((0, 0, 0.06 * R), (tilt_side, 0.24, 1.0)))
        K.assign(cap, M_HAIR)
        parts.append((cap, HEAD_W))
        if hair_style == 'messy':
            # Mo's signature: a thick swept fringe falling over one brow (built at the origin, then placed)
            fringe = K.ellipsoid('fringe', (0.115, 0.05, 0.042), loc=(0, 0, 0), coll=coll)
            fringe.rotation_euler = (math.radians(-38), math.radians(-22), math.radians(-14))
            fringe.location = (-0.045, -0.145, HEAD_C + 0.125)
            K.assign(fringe, M_HAIR)
            parts.append((fringe, HEAD_W))
        if hair_style == 'buns':
            for s in (-1, 1):
                bun = K.ellipsoid('bun', (0.075, 0.07, 0.07), loc=(s * 0.16, 0.03, HEAD_C + 0.16), coll=coll)
                K.assign(bun, M_HAIR)
                parts.append((bun, HEAD_W))
    if hair_style == 'cap':
        # backwards cap (Dex)
        def keepc(c):
            return c.z > 0.30 * HEAD_R
        dome = shell('cap', R * 1.02, hc, coll, keepc)
        capm = K.material('TOON_cap_' + name, K.PALETTE['teal'], rough=0.8)
        K.assign(dome, capm)
        brim = K.rounded_box('brim', (0.18, 0.15, 0.016), 0.007, segs=3, coll=coll)
        brim.location = (0, HEAD_R * 0.95, HEAD_C + HEAD_R * 0.42)
        brim.rotation_euler = (math.radians(12), 0, 0)
        K.assign(brim, capm)
        button = K.ellipsoid('capbutton', (0.018, 0.018, 0.012), loc=(0, 0, HEAD_C + R * 1.02), coll=coll)
        K.assign(button, capm)
        parts += [(dome, HEAD_W), (brim, HEAD_W), (button, HEAD_W)]
    if hair_style == 'hood':
        # the crowd: hood up, leaving the face open
        def keeph(c):
            return c.y > -0.55 * R or c.z > 0.62 * R
        hood = shell('hood_up', R * 1.12, hc, coll, keeph)
        K.assign(hood, M_TOP)
        parts.append((hood, HEAD_W))

    # ---------------------------------------------------------------- torso = the outfit
    flare = 1.18 if outfit == 'dress' else 1.0
    body = pill('body', TORSO_W, TORSO_D, TORSO_Z0, TORSO_Z1, coll, taper=0.84, flare=flare)
    K.assign(body, M_TOP)
    parts.append((body, torso_w))
    front_y = -TORSO_D / 2

    if outfit == 'hoodie':
        # hood bunched behind the neck, white drawstrings, kangaroo pocket, ribbed hem
        hood = K.ellipsoid('hood', (0.12, 0.07, 0.055), loc=(0, 0.075, TORSO_Z1 - 0.02), coll=coll)
        K.assign(hood, M_TOP2)
        parts.append((hood, CHEST_W))
        for s in (-1, 1):
            st = K.tube('string', [(s * 0.035, front_y - 0.004, TORSO_Z1 - 0.03), (s * 0.04, front_y - 0.012, TORSO_Z1 - 0.10),
                                   (s * 0.038, front_y - 0.014, TORSO_Z1 - 0.15)], 0.0045, segs=6, ring=6, coll=coll)
            K.assign(st, M_WHITE)
            parts.append((st, CHEST_W))
        pk = K.rounded_box('pocket', (0.15, 0.008, 0.06), 0.004, segs=3, coll=coll)
        pk.location = (0, front_y - 0.002, 0.555)
        K.assign(pk, M_TOP2)
        parts.append((pk, torso_w))
        hem = pill('hem', TORSO_W * 1.005, TORSO_D * 1.01, TORSO_Z0 + 0.005, TORSO_Z0 + 0.04, coll, taper=1.0)
        K.assign(hem, M_TOP2)
        parts.append((hem, torso_w))
    if outfit in ('vest', 'dress', 'jacket'):
        # white shirt collar points
        for s in (-1, 1):
            col = K.rounded_box('collar', (0.07, 0.012, 0.05), 0.006, segs=2, coll=coll)
            col.location = (s * 0.035, front_y + 0.012, TORSO_Z1 - 0.035)
            col.rotation_euler = (0, s * math.radians(28), 0)
            K.assign(col, M_WHITE)
            parts.append((col, CHEST_W))
    if outfit == 'vest':
        for k in range(3):  # buttons down the front
            b = K.ellipsoid('button', (0.012, 0.008, 0.012), loc=(0, front_y - 0.004, 0.78 - k * 0.075), coll=coll)
            K.assign(b, M_INK)
            parts.append((b, torso_w))
        v = K.rounded_box('vneck', (0.05, 0.008, 0.09), 0.004, segs=2, coll=coll)  # shirt showing in the V
        v.location = (0, front_y - 0.002, TORSO_Z1 - 0.06)
        K.assign(v, M_WHITE)
        parts.append((v, CHEST_W))
    if outfit == 'jacket':
        z = K.rounded_box('zip', (0.012, 0.008, TORSO_Z1 - TORSO_Z0 - 0.06), 0.004, segs=2, coll=coll)
        z.location = (0, front_y - 0.003, (TORSO_Z0 + TORSO_Z1) / 2 - 0.02)
        K.assign(z, M_TOP2)
        parts.append((z, torso_w))
        for s in (-1, 1):
            pk = K.rounded_box('jpocket', (0.06, 0.01, 0.012), 0.004, segs=2, coll=coll)
            pk.location = (s * 0.07, front_y - 0.002, 0.58)
            K.assign(pk, M_TOP2)
            parts.append((pk, torso_w))
    if outfit == 'dress':
        b = K.rounded_box('belt', (TORSO_W * 1.02, TORSO_D * 1.02, 0.03), 0.012, segs=3, coll=coll)
        b.location = (0, 0, 0.64)
        K.assign(b, M_TOP2)
        parts.append((b, torso_w))

    # ---------------------------------------------------------------- stick arms + small ink hands
    for sd in 'LR':
        p = arm_pts(sd)
        bones = [f'arm.{sd}.1', f'arm.{sd}.2']
        a = K.tube(f'arm_{sd}', p, LIMB_R, segs=16, ring=8, coll=coll)
        K.assign(a, M_INK)
        parts.append((a, chain_weights(p, bones)))
        hand = K.ellipsoid(f'hand_{sd}', (0.03, 0.03, 0.034), loc=(p[-1][0], 0, p[-1][2] - 0.02), coll=coll)
        K.assign(hand, M_INK)
        parts.append((hand, lambda co, b=bones[-1]: {b: 1.0}))

    # ---------------------------------------------------------------- long stick legs + small shoes
    for sd in 'LR':
        q = leg_pts(sd)
        bones = [f'leg.{sd}.1', f'leg.{sd}.2']
        leg = K.tube(f'leg_{sd}', q, LIMB_R * 1.05, segs=12, ring=8, coll=coll)
        K.assign(leg, M_INK)
        parts.append((leg, chain_weights(q, bones)))
        shoe = K.rounded_box(f'shoe_{sd}', (0.075, 0.13, 0.05), 0.024, segs=4, coll=coll)
        shoe.location = (q[-1][0], -0.03, 0.025)
        K.assign(shoe, M_INK if crowd else M_SHOE)
        parts.append((shoe, lambda co, b=bones[-1]: {b: 1.0}))

    # ---------------------------------------------------------------- accessories
    if 'glasses' in accessories:
        for s in (-1, 1):
            g = K.tube('glass', [(s * 0.072 + 0.05 * math.cos(a), -HEAD_R - 0.008, HEAD_C + 0.005 + 0.05 * math.sin(a))
                                 for a in [2 * math.pi * k / 24 for k in range(25)]], 0.0042, segs=24, ring=6, coll=coll,
                       caps=False)
            K.assign(g, M_INK)
            parts.append((g, HEAD_W))
        br = K.tube('bridge', [(-0.022, -HEAD_R - 0.01, HEAD_C + 0.012), (0.022, -HEAD_R - 0.01, HEAD_C + 0.012)], 0.005, segs=4,
                    ring=6, coll=coll)
        K.assign(br, M_INK)
        parts.append((br, HEAD_W))

    for obj, w in parts:
        bpy.context.view_layer.update()
        if obj.location.length or any(obj.rotation_euler):
            bpy.context.view_layer.objects.active = obj
            for o in bpy.context.view_layer.objects:
                o.select_set(False)
            obj.select_set(True)
            bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        bind(obj, rig, w)
    rig.scale = (scale, scale, scale)
    return rig, [o for o, _ in parts]


CAST = {
    # Mo: mustard hoodie, messy dark hair with a cowlick, white sneakers (our hero, readable at a glance)
    'mo': dict(top='#E8A33D', top2='#C98424', hair='#2E2420', hair_style='messy', outfit='hoodie', shoes='#F4F1EA'),
    # Theo: best friend, sage sweater vest + white collar + round glasses, neat side part
    'theo': dict(top='#6E9A7E', top2='#58806A', hair='#6B4A32', hair_style='neat', outfit='vest', shoes='#3A2E28',
                 accessories=('glasses',)),
    # Lia: little sister, coral dress with a belt, dark buns
    'lia': dict(top='#E8766E', top2='#C95C56', hair='#3A2A22', hair_style='buns', outfit='dress', shoes='#F4F1EA', scale=0.82),
    # Dex: classmate, red jacket with a zip, teal cap worn backwards
    'dex': dict(top='#C9443C', top2='#A8362F', hair='#1E1A18', hair_style='cap', outfit='jacket', shoes='#2A2E38'),
    # the crowd: grey hoodies, hoods up, amber phone-screen faces
    'crowd': dict(top='#3A3F52', top2='#2E3242', hair_style='hood', outfit='hoodie', crowd=True),
}


def build(which):
    K.reset()
    rig, parts = build_person(which, **CAST[which])
    path = K.export_glb(which, [rig] + parts)
    K.save_blend('char_' + which, mark_assets=[rig])
    return path


if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else list(CAST)
    for w in argv:
        print('BUILT', build(w))
