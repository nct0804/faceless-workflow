"""Build the channel's rigged 3D characters and export one GLB + one asset-marked .blend each.

Run (headless, ~2 s per character):
  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P assets/blender/characters/person.py
  add `-- mo crowd` to build only some of them

Design ("Ink & Ember" house style, see research/MERGED_STYLE.md):
  * paper-white capsule head (Mo's identity) with a DRAWN face: FACE is a shell over the head front whose
    canvas texture three.js paints every frame (eyes, brows, mouth, tears, sweat) -> unlimited expressions
  * bean-shaped hoodie body with cylindrical UVs (three.js paints fabric ribbing strokes on it)
  * long INK stick legs and stick arms with round mitten hands (the "drawn" limbs)
  * every TOON_ mesh gets an ink outline in three.js (inverted hull), so the character reads as a drawing

Rig (bone names are an API: studio/src/kit3d/Character.tsx drives them per frame):
  root > hips > spine > chest > head
  chest > arm.L.1 > arm.L.2      (L = character's left = +X in Blender = screen-right when facing camera)
  chest > arm.R.1 > arm.R.2
  hips  > leg.L.1 > leg.L.2 ,  hips > leg.R.1 > leg.R.2
"""
import bpy, bmesh, math, os, sys
from mathutils import Vector

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib'))
import common as K  # noqa: E402

HIP_Z = 0.50
BODY_Z0, BODY_Z1 = 0.44, 1.00        # hoodie bottom/top
SHOULDER_Z = 0.90
HEAD_C = 1.34                        # head centre
HEAD = (0.62, 0.54, 0.70)            # head size x (width), y (depth), z (height)
ARM_LEN = 0.58                       # long ink sticks (RicksClips proportion); IK in kit3d/Character.tsx
LEG_LEN = HIP_Z


def arm_pts(side):
    s = 1 if side == 'L' else -1
    return [(s * 0.20, 0, SHOULDER_Z), (s * 0.26, 0, SHOULDER_Z - ARM_LEN / 2), (s * 0.29, 0, SHOULDER_Z - ARM_LEN)]


def leg_pts(side):
    s = 1 if side == 'L' else -1
    return [(s * 0.09, 0, HIP_Z), (s * 0.095, 0, HIP_Z * 0.5), (s * 0.10, 0, 0.03)]


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
    bone('hips', (0, 0, HIP_Z - 0.04), (0, 0, 0.66), 'root')
    bone('spine', (0, 0, 0.66), (0, 0, 0.84), 'hips', True)
    bone('chest', (0, 0, 0.84), (0, 0, 0.98), 'spine', True)
    bone('head', (0, 0, 1.0), (0, 0, HEAD_C + HEAD[2] / 2), 'chest')
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


def cylinder_uv(obj, z0, z1):
    """u = angle around Z (0 at the back, .5 at the front), v = height -> fabric strokes wrap the body"""
    me = obj.data
    uv = me.uv_layers.new(name='UVMap')
    for poly in me.polygons:
        us = []
        for li in poly.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            u = (math.atan2(co.x, co.y) / (2 * math.pi)) % 1.0
            us.append(u)
        # fix the seam so a face never spans u 0.99 -> 0.01
        if max(us) - min(us) > 0.5:
            us = [u + 1 if u < 0.5 else u for u in us]
        for li, u in zip(poly.loop_indices, us):
            co = me.vertices[me.loops[li].vertex_index].co
            uv.data[li].uv = (u, (co.z - z0) / (z1 - z0))


def build_person(name, skin='#EDE6D6', top='#DED2B9', top_shade=None, scale=1.0, accessories=(), crowd=False,
                 hood=True):
    coll = K.collection(name.upper())
    top_shade = top_shade or top
    M_SKIN = K.material('TOON_skin_' + name, skin, rough=0.8)
    M_TOP = K.material('TOON_fabric_' + name, top, rough=0.9)
    M_TOP2 = K.material('TOON_fabricshade_' + name, top_shade, rough=0.9)
    M_INK = K.material('INK', K.PALETTE['ink'], rough=1.0)
    rig = build_armature(name, coll)
    parts = []

    # ---- head: soft capsule (rounded box + subsurf)
    head = K.rounded_box('head_geo', HEAD, 0.25, segs=8, coll=coll, subdiv=1)
    head.location = (0, 0, HEAD_C)
    K.assign(head, M_SKIN)
    parts.append((head, lambda co: {'head': 1.0}))

    if not crowd:
        # face shell: the head's front, pushed out 2 mm, planar UVs (x,z) over the head's front
        bm = bmesh.new()
        bm.from_mesh(head.data)
        bm.normal_update()
        bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.normal.y > -0.25], context='FACES')
        uv = bm.loops.layers.uv.new('UVMap')
        for v in bm.verts:
            v.co += v.normal * 0.003
        for f in bm.faces:
            for lp in f.loops:
                x, z = lp.vert.co.x, lp.vert.co.z
                lp[uv].uv = ((x + HEAD[0] / 2) / HEAD[0], (z + HEAD[2] / 2) / HEAD[2])
        face = K.mesh_from_bmesh('FACE', bm, coll)
        face.location = head.location
        K.smooth(face)
        K.assign(face, K.material('FACE', '#FFFFFF', rough=1.0, alpha=0.0))
        parts.append((face, lambda co: {'head': 1.0}))
    else:
        # the crowd: an amber phone screen where the eyes should be
        eye = K.rounded_box('phone_eyes', (0.30, 0.05, 0.11), 0.03, segs=3, coll=coll)
        eye.location = (0, -HEAD[1] / 2 + 0.01, HEAD_C + 0.05)
        K.assign(eye, K.material('GLOW_amber', K.PALETTE['amber'], emission=K.PALETTE['amber'], strength=6))
        parts.append((eye, lambda co: {'head': 1.0}))

    # ---- body: bean (the oversized hoodie): rounded box, wider at the hem, slight forward belly
    h = BODY_Z1 - BODY_Z0
    body = K.rounded_box('body', (0.50, 0.40, h), 0.17, segs=8, coll=coll, subdiv=2)
    for v in body.data.vertices:
        f = (v.co.z + h / 2) / h               # 0 hem .. 1 shoulders
        k = 1.06 - 0.22 * f ** 1.6
        v.co.x *= k
        v.co.y *= 1.02 - 0.12 * f
    body.location = (0, 0, (BODY_Z0 + BODY_Z1) / 2)
    K.assign(body, M_TOP)

    def body_w(co):
        f = max(0.0, min(1.0, (co.z - 0.62) / 0.26))
        return {'hips': 1 - f, 'spine': f} if co.z < 0.86 else {'spine': 0.4, 'chest': 0.6}
    parts.append((body, body_w))

    if hood and not crowd:
        # hood DOWN, bunched behind the neck (a squashed torus segment)
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=False, segments=28, radius1=1, radius2=1, depth=1)
        hoodm = K.mesh_from_bmesh('hood', bm, coll)
        hoodm.modifiers.new('s', 'SOLIDIFY').thickness = 0.45
        K.apply_mods(hoodm)
        for v in hoodm.data.vertices:
            v.co = Vector((v.co.x * 0.21, v.co.y * 0.15 + 0.08, v.co.z * 0.11))
        hoodm.location = (0, 0.05, 0.98)
        hoodm.rotation_euler = (math.radians(-28), 0, 0)
        sd = hoodm.modifiers.new('sub', 'SUBSURF')
        sd.levels = 2
        K.apply_mods(hoodm)
        K.smooth(hoodm)
        K.assign(hoodm, M_TOP2)
        parts.append((hoodm, lambda co: {'chest': 1.0}))
        for s in (-1, 1):                       # drawstrings
            st = K.tube('string', [(s * 0.055, -0.17, 0.97), (s * 0.06, -0.205, 0.88), (s * 0.058, -0.215, 0.79)],
                        0.010, segs=6, ring=6, coll=coll)
            K.assign(st, M_TOP2)
            parts.append((st, lambda co: {'chest': 1.0}))
        pk = K.rounded_box('pocket', (0.28, 0.014, 0.11), 0.006, segs=3, coll=coll)   # kangaroo pocket: flat, tone-on-tone
        pk.location = (0, -0.212, 0.58)
        pk.rotation_euler = (math.radians(6), 0, 0)
        K.assign(pk, M_TOP2)
        parts.append((pk, lambda co: {'hips': 1.0}))

    # ---- stick arms (ink) + round mitten hands (skin)
    for sd in 'LR':
        p = arm_pts(sd)
        bones = [f'arm.{sd}.1', f'arm.{sd}.2']
        a = K.tube(f'arm_{sd}', p, 0.022, segs=16, ring=8, coll=coll)
        K.assign(a, M_INK)
        parts.append((a, chain_weights(p, bones)))
        hand = K.ellipsoid(f'hand_{sd}', (0.048, 0.048, 0.052), loc=(p[-1][0], 0, p[-1][2] - 0.025), coll=coll)
        K.assign(hand, M_SKIN)
        parts.append((hand, lambda co, b=bones[-1]: {b: 1.0}))

    # ---- long stick legs (ink) + rounded shoes
    for sd in 'LR':
        q = leg_pts(sd)
        bones = [f'leg.{sd}.1', f'leg.{sd}.2']
        leg = K.tube(f'leg_{sd}', q, 0.024, segs=12, ring=8, coll=coll)
        K.assign(leg, M_INK)
        parts.append((leg, chain_weights(q, bones)))
        shoe = K.rounded_box(f'shoe_{sd}', (0.11, 0.18, 0.07), 0.034, segs=4, coll=coll)
        shoe.location = (q[-1][0], -0.04, 0.035)
        K.assign(shoe, M_INK if crowd else K.material('TOON_shoe', '#2A2E38', rough=0.7))
        parts.append((shoe, lambda co, b=bones[-1]: {b: 1.0}))

    # ---- accessories (cast members)
    if 'glasses' in accessories:
        for s in (-1, 1):
            g = K.tube('glass', [(s * 0.115 + 0.075 * math.cos(a), -HEAD[1] / 2 - 0.02, HEAD_C + 0.04 + 0.075 * math.sin(a))
                                 for a in [2 * math.pi * k / 24 for k in range(25)]], 0.009, segs=24, ring=6, coll=coll,
                       caps=False)
            K.assign(g, M_INK)
            parts.append((g, lambda co: {'head': 1.0}))
    if 'buns' in accessories:
        for s in (-1, 1):
            bun = K.ellipsoid('bun', (0.11, 0.10, 0.10), loc=(s * 0.21, 0.03, HEAD_C + 0.34), coll=coll)
            K.assign(bun, K.material('TOON_hair_' + name, '#4A3428', rough=0.8))
            parts.append((bun, lambda co: {'head': 1.0}))
    if 'cap' in accessories:
        capm = K.material('TOON_cap_' + name, K.PALETTE['teal'], rough=0.8)
        dome = K.ellipsoid('cap', (0.34, 0.30, 0.22), loc=(0, 0.01, HEAD_C + 0.27), coll=coll)
        bm = bmesh.new()
        bm.from_mesh(dome.data)
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < HEAD_C + 0.25], context='VERTS')
        bm.to_mesh(dome.data)
        bm.free()
        K.assign(dome, capm)
        brim = K.rounded_box('brim', (0.30, 0.22, 0.02), 0.009, segs=3, coll=coll)
        brim.location = (0, -0.31, HEAD_C + 0.26)
        brim.rotation_euler = (math.radians(-8), 0, 0)
        K.assign(brim, capm)
        parts += [(dome, lambda co: {'head': 1.0}), (brim, lambda co: {'head': 1.0})]

    for obj, w in parts:
        bpy.context.view_layer.update()
        if obj.location.length or any(obj.rotation_euler):
            bpy.context.view_layer.objects.active = obj
            for o in bpy.context.view_layer.objects:
                o.select_set(False)
            obj.select_set(True)
            bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        if obj.name.startswith('body'):
            cylinder_uv(obj, BODY_Z0, BODY_Z1)
        bind(obj, rig, w)
    rig.scale = (scale, scale, scale)
    return rig, [o for o, _ in parts]


CAST = {
    'mo': dict(),
    'theo': dict(skin=K.PALETTE['sage'], top='#3B4A5E', top_shade='#33405A', accessories=('glasses',), hood=False),
    'lia': dict(skin=K.PALETTE['lia'], top='#C9826B', top_shade='#B27560', accessories=('buns',), scale=0.8, hood=False),
    'dex': dict(skin=K.PALETTE['slate'], top='#2E3440', top_shade='#262B36', accessories=('cap',), hood=False),
    'crowd': dict(skin=K.PALETTE['navy'], top=K.PALETTE['navy'], crowd=True, hood=False),
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
