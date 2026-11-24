"""Shared helpers for every asset build script (Blender 5.x, run headless or in the GUI).

Conventions (keep them, three.js relies on them):
  * 1 Blender unit = 1 metre. Characters stand on z=0, face -Y (Blender front view). glTF turns that into
    three.js Y-up with the character facing +Z (towards the default camera).
  * Material names drive the look in three.js (studio/src/kit3d/materials.ts):
      TOON_<name>  -> cel-shaded character material (+ ink outline)
      INK          -> flat ink black (limbs, outlines that are geometry)
      GLOW_<name>  -> unlit emissive (screens, bulbs, crowd eyes); bloom picks it up
      FACE         -> the drawn face decal (canvas texture painted per frame in three.js)
      anything else -> PBR MeshStandardMaterial as exported (sets, props)
  * Empties named MARK_<name> are placement marks for characters / cameras / lights in a set.
  * Lights named LIGHT_<name> are exported (KHR_lights_punctual); three.js can override them per shot.
"""
import bpy, bmesh, math, os
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))          # Faceless/assets
STUDIO_PUBLIC = os.path.abspath(os.path.join(ROOT, '..', 'studio', 'public', 'assets'))
BLEND_DIR = os.path.join(ROOT, 'blend')
PREVIEW_DIR = os.path.join(ROOT, 'previews')

PALETTE = {
    'hero': '#EDE6D6', 'hoodie': '#DED2B9', 'ink': '#16181E', 'amber': '#F2A93B', 'navy': '#141824',
    'bg': '#0B0D12', 'sage': '#7C8C7A', 'clay': '#9C7B6B', 'slate': '#6F7C96', 'lia': '#E3C9A8',
    'teal': '#3E7C7A', 'wood': '#5A4232', 'paper': '#E8E0CC', 'lamp': '#FFD9A0', 'metal': '#2B2F3A',
}


def hex_rgba(h, a=1.0):
    h = h.lstrip('#')
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]
    return (*lin, a)


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene
    s.unit_settings.system = 'METRIC'
    s.unit_settings.scale_length = 1.0


def material(name, color='#808080', rough=0.6, metal=0.0, emission=None, strength=1.0, alpha=1.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value = hex_rgba(color)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if emission:
        b.inputs['Emission Color'].default_value = hex_rgba(emission)
        b.inputs['Emission Strength'].default_value = strength
    if alpha < 1:
        b.inputs['Alpha'].default_value = alpha
    m.diffuse_color = hex_rgba(color)
    return m


def assign(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    return obj


def link(obj, coll=None):
    (coll or bpy.context.scene.collection).objects.link(obj)
    return obj


def collection(name, parent=None):
    c = bpy.data.collections.get(name) or bpy.data.collections.new(name)
    if c.name not in (parent or bpy.context.scene.collection).children:
        (parent or bpy.context.scene.collection).children.link(c)
    return c


def mesh_from_bmesh(name, bm, coll=None):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    return link(bpy.data.objects.new(name, me), coll)


def apply_mods(obj):
    bpy.context.view_layer.objects.active = obj
    for o in bpy.context.view_layer.objects:
        o.select_set(False)
    obj.select_set(True)
    for m in list(obj.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)


def smooth(obj, angle=60):
    for p in obj.data.polygons:
        p.use_smooth = True
    try:
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.shade_auto_smooth(angle=math.radians(angle))
    except Exception:
        pass
    return obj


def rounded_box(name, size, radius, segs=6, coll=None, subdiv=0):
    """box of size (x,y,z) centred at origin with rounded edges (bevel applied)"""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    o = mesh_from_bmesh(name, bm, coll)
    bv = o.modifiers.new('bevel', 'BEVEL')
    bv.width = radius
    bv.segments = segs
    bv.limit_method = 'NONE'
    if subdiv:
        sd = o.modifiers.new('sub', 'SUBSURF')
        sd.levels = subdiv
        sd.render_levels = subdiv
    apply_mods(o)
    return smooth(o)


def tube(name, pts, radius, segs=12, ring=10, coll=None, radius_fn=None, caps=True):
    """mesh tube along a polyline (list of 3-tuples), resampled to `segs` rings"""
    P = [Vector(p) for p in pts]
    L = [0.0]
    for a, b in zip(P, P[1:]):
        L.append(L[-1] + (b - a).length)
    total = L[-1]

    def at(t):
        d = t * total
        for i in range(len(P) - 1):
            if L[i + 1] >= d or i == len(P) - 2:
                f = (d - L[i]) / max(1e-9, L[i + 1] - L[i])
                return P[i].lerp(P[i + 1], min(1, max(0, f))), (P[i + 1] - P[i]).normalized()
    bm = bmesh.new()
    rings = []
    up = Vector((0, 1, 0))
    for k in range(segs + 1):
        t = k / segs
        c, d = at(t)
        side = d.cross(up)
        if side.length < 1e-4:
            side = d.cross(Vector((1, 0, 0)))
        side.normalize()
        up2 = side.cross(d).normalized()
        r = radius * (radius_fn(t) if radius_fn else 1.0)
        rings.append([bm.verts.new(c + (side * math.cos(a) + up2 * math.sin(a)) * r)
                      for a in [2 * math.pi * j / ring for j in range(ring)]])
    for a, b in zip(rings, rings[1:]):
        for j in range(ring):
            bm.faces.new((a[j], a[(j + 1) % ring], b[(j + 1) % ring], b[j]))
    if caps:
        bm.faces.new(list(reversed(rings[0])))
        bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return smooth(mesh_from_bmesh(name, bm, coll))


def ellipsoid(name, r, loc=(0, 0, 0), segs=24, rings=16, coll=None):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=rings, radius=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * r[0] + loc[0], v.co.y * r[1] + loc[1], v.co.z * r[2] + loc[2]))
    return smooth(mesh_from_bmesh(name, bm, coll))


def empty(name, loc=(0, 0, 0), coll=None, size=0.1):
    e = bpy.data.objects.new(name, None)
    e.empty_display_size = size
    e.location = loc
    return link(e, coll)


def ensure_dirs():
    for d in (STUDIO_PUBLIC, BLEND_DIR, PREVIEW_DIR):
        os.makedirs(d, exist_ok=True)


def export_glb(name, objects=None, animations=False):
    """write studio/public/assets/<name>.glb (only `objects` if given, else the whole scene)"""
    ensure_dirs()
    path = os.path.join(STUDIO_PUBLIC, name + '.glb')
    for o in bpy.context.view_layer.objects:
        o.select_set(False)
    if objects:
        for o in objects:
            o.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=path, export_format='GLB', use_selection=bool(objects), export_apply=True,
        export_yup=True, export_skins=True, export_animations=animations, export_lights=True,
        export_cameras=False, export_extras=True, export_texcoords=True, export_normals=True,
        export_materials='EXPORT', export_image_format='AUTO', **_vc_kwargs())
    return path


def _vc_kwargs():
    # glTF exporter option names changed across 4.x/5.x: export the active color attribute (baked AO) as COLOR_0
    props = bpy.ops.export_scene.gltf.get_rna_type().properties.keys()
    if 'export_vertex_color' in props:
        return dict(export_vertex_color='ACTIVE')
    if 'export_colors' in props:
        return dict(export_colors=True)
    return {}


def box(name, size, loc=(0, 0, 0), mat=None, coll=None, bevel=0.0, rot=(0, 0, 0)):
    """axis-aligned box: size (x,y,z), loc = centre. bevel>0 rounds the edges a little (catches the ink line)"""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    o = mesh_from_bmesh(name, bm, coll)
    if bevel:
        bv = o.modifiers.new('bevel', 'BEVEL')
        bv.width = bevel
        bv.segments = 2
        bv.limit_method = 'ANGLE'
        apply_mods(o)
    o.location = loc
    o.rotation_euler = tuple(math.radians(r) for r in rot)
    if mat:
        assign(o, mat)
    return o


def cylinder(name, r, depth, loc=(0, 0, 0), mat=None, coll=None, segs=32, r2=None, rot=(0, 0, 0)):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=r, radius2=r if r2 is None else r2, depth=depth)
    o = mesh_from_bmesh(name, bm, coll)
    o.location = loc
    o.rotation_euler = tuple(math.radians(a) for a in rot)
    smooth(o, 40)
    if mat:
        assign(o, mat)
    return o


def densify(obj, edge=0.12):
    """subdivide big faces so baked vertex AO has enough samples (flat shading kept)"""
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    for _ in range(6):
        long_edges = [e for e in bm.edges if e.calc_length() > edge]
        if not long_edges:
            break
        bmesh.ops.subdivide_edges(bm, edges=long_edges, cuts=1, use_grid_fill=True)
    bm.to_mesh(obj.data)
    bm.free()


def bake_ao(objects, samples=64, distance=0.6):
    """Cycles AO bake into a color attribute 'AO' on every object (exported as COLOR_0, multiplied in three.js)"""
    s = bpy.context.scene
    if s.world is None:
        s.world = bpy.data.worlds.new('bake')
    s.render.engine = 'CYCLES'
    s.cycles.samples = samples
    s.cycles.device = 'CPU'
    try:
        s.world.light_settings.distance = distance
    except Exception:
        pass
    meshes = [o for o in objects if o.type == 'MESH']
    for o in meshes:
        bpy.context.view_layer.update()
        if o.data.users > 1:
            o.data = o.data.copy()
        bpy.context.view_layer.objects.active = o
        for a in list(o.data.color_attributes):
            if a.name == 'AO':
                o.data.color_attributes.remove(a)
        ca = o.data.color_attributes.new('AO', 'BYTE_COLOR', 'CORNER')
        o.data.color_attributes.active_color = ca
        try:
            o.data.color_attributes.render_color_index = o.data.color_attributes.active_color_index
        except Exception:
            pass
    for o in bpy.context.view_layer.objects:
        o.select_set(False)
    for o in meshes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    s.render.bake.target = 'VERTEX_COLORS'
    s.render.bake.margin = 0
    bpy.ops.object.bake(type='AO')
    return len(meshes)


def save_blend(name, mark_assets=()):
    """save assets/blend/<name>.blend; objects/collections in mark_assets get marked as Blender assets"""
    ensure_dirs()
    for it in mark_assets:
        try:
            it.asset_mark()
            it.asset_generate_preview()
        except Exception:
            pass
    path = os.path.join(BLEND_DIR, name + '.blend')
    bpy.ops.wm.save_as_mainfile(filepath=path, compress=True)
    return path


def preview(name, target=(0, 0, 0.7), dist=3.2, height=1.0, lens=50, res=(900, 1100), yaw=-20):
    """quick Eevee turntable-style still for review -> assets/previews/<name>.png"""
    ensure_dirs()
    s = bpy.context.scene
    s.render.engine = 'BLENDER_EEVEE'
    s.render.resolution_x, s.render.resolution_y = res
    s.render.film_transparent = False
    world = bpy.data.worlds.new('preview') if not s.world else s.world
    s.world = world
    world.use_nodes = True
    world.node_tree.nodes['Background'].inputs['Color'].default_value = hex_rgba('#1B2030')
    world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.6
    a = math.radians(yaw)
    cam_d = bpy.data.cameras.new('pcam')
    cam_d.lens = lens
    cam = link(bpy.data.objects.new('pcam', cam_d))
    cam.location = (target[0] + math.sin(a) * dist, target[1] - math.cos(a) * dist, target[2] + height - 0.7)
    d = Vector(target) - cam.location
    cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    s.camera = cam
    key = bpy.data.lights.new('pkey', 'AREA')
    key.energy, key.size, key.color = 300, 2.0, (1, 0.85, 0.65)
    ko = link(bpy.data.objects.new('pkey', key))
    ko.location = (-2.2, -2.4, 2.6)
    ko.rotation_euler = (Vector(target) - ko.location).to_track_quat('-Z', 'Y').to_euler()
    rim = bpy.data.lights.new('prim', 'AREA')
    rim.energy, rim.size, rim.color = 200, 1.5, (0.6, 0.7, 1.0)
    ro = link(bpy.data.objects.new('prim', rim))
    ro.location = (2.0, 2.0, 2.2)
    ro.rotation_euler = (Vector(target) - ro.location).to_track_quat('-Z', 'Y').to_euler()
    s.render.filepath = os.path.join(PREVIEW_DIR, name + '.png')
    bpy.ops.render.render(write_still=True)
    for o in (cam, ko, ro):
        bpy.data.objects.remove(o)
    return s.render.filepath


def arc_block(name, r_in, r_out, z0, z1, a0, a1, mat=None, coll=None, segs=None):
    """solid annular sector (bleacher tiers, curved walls, ring stages). Angles in degrees, 0 = +Y (away from the
    default camera), counter-clockwise seen from above. Faceted every ~6 deg so ink lines + AO read well."""
    segs = segs or max(2, int(abs(a1 - a0) / 6))
    bm = bmesh.new()
    rings = []
    for i in range(segs + 1):
        a = math.radians(a0 + (a1 - a0) * i / segs)
        s, c = -math.sin(a), math.cos(a)
        rings.append([bm.verts.new((r * s, r * c, z)) for r, z in ((r_in, z0), (r_out, z0), (r_out, z1), (r_in, z1))])
    for i in range(segs):
        A, B = rings[i], rings[i + 1]
        for k in range(4):
            bm.faces.new((A[k], A[(k + 1) % 4], B[(k + 1) % 4], B[k]))
    bm.faces.new(list(reversed(rings[0])))
    bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    o = mesh_from_bmesh(name, bm, coll)
    if mat:
        assign(o, mat)
    return o


def props(obj, **kw):
    """custom properties -> glTF extras -> three.js object.userData (layout numbers for the runtime)"""
    for k, v in kw.items():
        obj[k] = v
    return obj
