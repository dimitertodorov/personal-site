"""
Build the personal site's network pieces in Blender: an RJ45 plug, a wall jack and a 1U patch panel, for cables
that plug in as the floors open. Hard-surface shapes like tools/build_tech_props.py, with names the site can use:

- material "plug_boot" is the boot's colour (the site tints it per floor), "led_*" materials are status lights
  (the site recolours them: amber while a cable is on its way, green once it is plugged in);
- every port has its own light, "led_port_01" .. "led_port_12", so ports can light one at a time.

Origins differ from the floor props, because these are placed by where a cable meets them:
- plug: the back of the boot, where the cable enters; the plug points along +Z (glTF), tip forward.
- jack and patch panel: the centre of the back face, against the wall; the front faces +Z, a plug enters along -Z.
Each is scaled so its longest side is 1; the site sets the real size.

Usage (Blender 4.2+; tested 5.3):
  blender -b --factory-startup --python tools/build_net_props.py -- --out public/models/props   (from the site folder)
"""
import argparse, os, sys
import bpy
from mathutils import Matrix, Vector

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument('--out', required=True)
a = ap.parse_args(argv)


def mat(name, color, emit=0.0, rough=0.45, metal=0.3, alpha=1.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if emit:
        b.inputs['Emission Color'].default_value = (*color, 1)
        b.inputs['Emission Strength'].default_value = emit
    if alpha < 1:
        b.inputs['Alpha'].default_value = alpha
        m.surface_render_method = 'BLENDED'  # exported as alphaMode BLEND
    return m


def box(name, size, loc, material, bevel=0.0):
    """size and loc in Blender units: x right, y back, z up (the front faces -Y)."""
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


def narrow(o, k):
    """Narrow a box centred on x = z = 0 toward its back (+Y) end, to k of its width and height: a boot that thins
    toward the cable."""
    ys = [v.co.y for v in o.data.vertices]
    lo, hi = min(ys), max(ys)
    for v in o.data.vertices:
        s = 1 + (k - 1) * (v.co.y - lo) / (hi - lo)
        v.co.x *= s
        v.co.z *= s


def finish(name):
    """Join everything, put the origin at the centre of the back face (+Y in Blender), scale longest side to 1, export."""
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
    ob.data.transform(Matrix.Scale(k, 4) @ Matrix.Translation(-Vector(((lo.x + hi.x) / 2, hi.y, (lo.z + hi.z) / 2))))
    out = os.path.join(os.path.abspath(a.out), f'{name}.glb')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_yup=True, export_apply=True, use_selection=False,
                              export_animations=False, export_cameras=False, export_lights=False)
    print('BUILT', name, 'tris', sum(len(p.vertices) - 2 for p in ob.data.polygons), 'bytes', os.path.getsize(out))


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


# Sizes in millimetres, as the real parts.

# ---------- RJ45 plug: clear body with gold pins and a latch, a strain-relief boot behind it ----------
reset()
clear = mat('plug_body', (0.78, 0.84, 0.92), rough=0.15, metal=0.0, alpha=0.55)
gold = mat('plug_pins', (1.0, 0.76, 0.3), rough=0.25, metal=1.0)
boot_m = mat('plug_boot', (0.24, 0.9, 1.0), rough=0.55, metal=0.0)
box('body', (11.7, 21, 8), (0, -10.5, 0), clear, bevel=0.6)  # tip at y = -21, back at y = 0
for i in range(8):  # the eight contacts, seen through the clear body
    box(f'pin{i}', (0.6, 3.5, 1.2), (-4.2 + i * 1.2, -19.0, 3.6), gold)
box('latch', (5.5, 14, 1.0), (0, -9.5, -4.6), clear, bevel=0.2)
box('latch_tip', (5.5, 3, 2.2), (0, -3.5, -5.2), clear, bevel=0.3)
boot = box('boot', (13.5, 16, 10), (0, 8, 0), boot_m, bevel=1.0)  # y 0 .. 16, the cable leaves at the back
narrow(boot, 0.62)
for i in range(4):  # grip ribs
    box(f'rib{i}', (0.8, 1.0, 10.4 - i * 0.9), (6.4 - i * 0.55, 3 + i * 3, 0), boot_m)
    box(f'ribr{i}', (0.8, 1.0, 10.4 - i * 0.9), (-6.4 + i * 0.55, 3 + i * 3, 0), boot_m)
finish('rj45-plug')

# ---------- wall jack: a keystone plate with one port and a status light ----------
reset()
plate = mat('jack_plate', (0.07, 0.07, 0.11), rough=0.4)
hole = mat('jack_port', (0.01, 0.01, 0.015), rough=0.9, metal=0.0)
box('plate', (40, 8, 40), (0, -4, 0), plate, bevel=1.5)  # back at y = 0, front at y = -8
box('keystone', (17, 2, 21), (0, -8.6, -1), mat('jack_keystone', (0.12, 0.12, 0.18), rough=0.35), bevel=0.6)
box('port', (12.2, 1, 8.6), (0, -9.2, -1), hole)  # the opening a plug goes into
box('notch', (5, 1, 2.4), (0, -9.25, -6.2), hole)
box('led', (3, 1, 3), (11, -8.6, 11), mat('led_status', (1.0, 0.7, 0.28), emit=6))
finish('rj45-jack')

# ---------- 1U patch panel: 12 ports, each with its own light ----------
reset()
face = mat('panel_face', (0.06, 0.06, 0.1), rough=0.35)
ear = mat('panel_ear', (0.045, 0.045, 0.075))
hole = mat('jack_port', (0.01, 0.01, 0.015), rough=0.9, metal=0.0)
box('face', (440, 6, 44), (0, -3, 0), face, bevel=1.2)
for side in (-1, 1):  # rack ears with their screw slots
    box(f'ear{side}', (18, 6, 44), (side * 229, -3, 0), ear, bevel=1)
    box(f'slot{side}', (9, 1, 5), (side * 229, -6.4, 0), hole)
box('label_strip', (400, 1, 8), (0, -6.4, 15), mat('panel_label', (0.85, 0.86, 0.9), rough=0.6, metal=0.0))
for i in range(12):
    x = -165 + i * 30
    box(f'port{i}', (12.2, 1, 8.6), (x, -6.5, -3), hole)
    box(f'led{i}', (3, 1, 3), (x + 9, -6.5, 3), mat(f'led_port_{i + 1:02d}', (1.0, 0.7, 0.28), emit=6))
finish('patch-panel')
