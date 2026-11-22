"""
Build the personal site's tech props in Blender: a server rack, a curved SOC console and a 2U appliance.
Hard-surface shapes with bevelled edges, dark metal and emissive LED strips (material names start "led_" so the
site can recolour them). Each GLB follows the props convention: Y-up, front +Z, base-centre origin,
longest side = 1.

Usage (Blender 4.2+; tested 5.3):
  blender -b --factory-startup --python tools/build_tech_props.py -- --out public/models/props   (from the site folder)
"""
import argparse, math, os, sys
import bpy, bmesh
from mathutils import Matrix, Vector

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument('--out', required=True)
a = ap.parse_args(argv)


def mat(name, color, emit=0.0, rough=0.45, metal=0.3):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if emit:
        b.inputs['Emission Color'].default_value = (*color, 1)
        b.inputs['Emission Strength'].default_value = emit
    return m


def box(name, size, loc, material, bevel=0.0):
    """size and loc in Blender metres: x right, y back, z up (front faces -Y)."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    o.data.materials.append(material)
    if bevel:
        md = o.modifiers.new('bevel', 'BEVEL'); md.width = bevel; md.segments = 2; md.limit_method = 'ANGLE'
        bpy.ops.object.modifier_apply(modifier='bevel')
    return o


def finish(name):
    """Join everything, put the origin at the base centre, scale longest side to 1, export."""
    objs = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    ob = bpy.context.object
    ob.name = name
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    vs = [v.co for v in ob.data.vertices]
    lo = Vector((min(v.x for v in vs), min(v.y for v in vs), min(v.z for v in vs)))
    hi = Vector((max(v.x for v in vs), max(v.y for v in vs), max(v.z for v in vs)))
    k = 1.0 / max(hi - lo)
    ob.data.transform(Matrix.Scale(k, 4) @ Matrix.Translation(-Vector(((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, lo.z))))
    out = os.path.join(os.path.abspath(a.out), f'{name}.glb')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_yup=True, export_apply=True, use_selection=False,
                              export_animations=False, export_cameras=False, export_lights=False)
    print('BUILT', name, 'tris', sum(len(p.vertices) - 2 for p in ob.data.polygons), 'bytes', os.path.getsize(out))


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


# ---------- server rack: 0.6 wide, 2.0 tall, 1.0 deep ----------
reset()
body, panel = mat('rack_body', (0.035, 0.035, 0.06)), mat('rack_panel', (0.06, 0.06, 0.1), rough=0.35)
vent = mat('rack_vent', (0.012, 0.012, 0.02), rough=0.8, metal=0.1)
led_c, led_a, led_g = mat('led_cyan', (0.24, 0.9, 1.0), emit=6), mat('led_amber', (1.0, 0.7, 0.28), emit=6), mat('led_lime', (0.72, 1.0, 0.36), emit=5)
box('frame', (0.6, 1.0, 2.0), (0, 0, 1.0), body, bevel=0.02)
for i in range(10):  # rack units behind a recessed front
    z = 0.18 + i * 0.172
    box(f'unit{i}', (0.5, 0.04, 0.13), (0, -0.505, z), panel, bevel=0.006)
    for j in range(6):  # vent slots
        box(f'vent{i}_{j}', (0.035, 0.01, 0.06), (-0.17 + j * 0.05, -0.53, z), vent)
    box(f'led{i}', (0.06, 0.012, 0.018), (0.17, -0.531, z + 0.03), [led_c, led_a, led_c, led_g][i % 4])
    box(f'led{i}b', (0.03, 0.012, 0.018), (0.17, -0.531, z - 0.025), led_c if i % 3 else led_a)
box('top_tray', (0.62, 1.02, 0.05), (0, 0, 2.025), panel, bevel=0.01)
box('strip_l', (0.012, 0.012, 1.8), (-0.29, -0.505, 1.0), led_c)  # neon edge on the door frame
finish('server-rack')

# ---------- SOC console: a gently curved desk with three monitor arms ----------
reset()
desk, top = mat('console_body', (0.04, 0.04, 0.07)), mat('console_top', (0.08, 0.075, 0.12), rough=0.3)
screen = mat('screen_blank', (0.02, 0.025, 0.05), emit=0.3, rough=0.2)
edge = mat('led_cyan', (0.24, 0.9, 1.0), emit=6)
segs, R, arc = 7, 2.6, math.radians(46)
for i in range(segs):  # the desk follows an arc facing the viewer
    t = -arc / 2 + arc * (i + 0.5) / segs
    x, y = R * math.sin(t), -(R - R * math.cos(t))  # ends wrap toward the operator (-Y, the front)
    seg = box(f'top{i}', (2 * R * math.sin(arc / segs / 2) + 0.03, 0.75, 0.06), (x, y, 0.76), top, bevel=0.01)
    seg.rotation_euler.z = -t
    body_ = box(f'body{i}', (2 * R * math.sin(arc / segs / 2) + 0.03, 0.55, 0.72), (x, y + 0.08, 0.36), desk)
    body_.rotation_euler.z = -t
    strip = box(f'edge{i}', (2 * R * math.sin(arc / segs / 2) + 0.03, 0.015, 0.015), (x + 0.37 * math.sin(t), y - 0.37 * math.cos(t), 0.735), edge)
    strip.rotation_euler.z = -t
for i, t in enumerate((-arc / 3, 0, arc / 3)):  # monitors on posts, angled toward the operator
    x, y = R * math.sin(t), -(R - R * math.cos(t)) + 0.22
    post = box(f'post{i}', (0.05, 0.05, 0.35), (x, y + 0.05, 0.96), desk)
    mon = box(f'mon{i}', (0.66, 0.04, 0.4), (x, y, 1.3), desk, bevel=0.01)
    scr = box(f'scr{i}', (0.6, 0.01, 0.35), (x, y - 0.026, 1.3), screen)
    for o in (post, mon, scr): o.rotation_euler.z = -t
finish('soc-console')

# ---------- 2U appliance (the MID server): a rackmount box with LEDs ----------
reset()
case = mat('appliance_body', (0.05, 0.05, 0.085))
box('case', (0.9, 0.6, 0.18), (0, 0, 0.09), case, bevel=0.012)
box('face', (0.86, 0.02, 0.14), (0, -0.305, 0.09), mat('appliance_face', (0.08, 0.08, 0.13), rough=0.35), bevel=0.005)
for j in range(10):
    box(f'grill{j}', (0.025, 0.01, 0.09), (-0.38 + j * 0.04, -0.318, 0.09), mat('rack_vent', (0.012, 0.012, 0.02), rough=0.8))
for j, m in enumerate((mat('led_cyan', (0.24, 0.9, 1.0), emit=6), mat('led_lime', (0.72, 1.0, 0.36), emit=5), mat('led_amber', (1.0, 0.7, 0.28), emit=6))):
    box(f'led{j}', (0.05, 0.01, 0.02), (0.22 + j * 0.07, -0.318, 0.11), m)
box('ports', (0.3, 0.01, 0.04), (0.29, -0.318, 0.05), mat('rack_vent', (0.012, 0.012, 0.02), rough=0.8))
finish('appliance')
