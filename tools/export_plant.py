"""Export potted plant from .blend to web-ready GLB (run via Blender)."""
import bpy
import os

BLEND = os.environ.get(
    'PLANT_BLEND',
    r'C:\Users\galtv\OneDrive\Desktop\potted_plant_04_4k.blend\potted_plant_04_4k.blend',
)
OUT_DIR = os.environ.get(
    'PLANT_OUT_DIR',
    os.path.join(os.path.dirname(__file__), '..', 'models', 'plant'),
)
OUT_PATH = os.path.join(os.path.abspath(OUT_DIR), 'potted_plant.glb')
MAX_TEX = int(os.environ.get('PLANT_MAX_TEX', '1024'))

os.makedirs(os.path.abspath(OUT_DIR), exist_ok=True)

bpy.ops.wm.open_mainfile(filepath=BLEND)

for img in bpy.data.images:
    if not img.size[0] or not img.size[1]:
        continue
    w, h = img.size
    if max(w, h) > MAX_TEX:
        scale = MAX_TEX / max(w, h)
        img.scale(int(w * scale), int(h * scale))
        img.pack()

bpy.ops.object.select_all(action='SELECT')

bpy.ops.export_scene.gltf(
    filepath=OUT_PATH,
    export_format='GLB',
    use_selection=False,
    export_apply=True,
    export_texcoords=True,
    export_normals=True,
    export_materials='EXPORT',
    export_image_format='JPEG',
    export_jpeg_quality=82,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
)

print('Exported:', OUT_PATH, 'size:', os.path.getsize(OUT_PATH))
