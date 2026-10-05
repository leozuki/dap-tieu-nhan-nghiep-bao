"""Ghép vòng lặp từ khung đã tách nền: đoạn [start, end), hòa dần `fade` khung cuối vào đầu, lấy mẫu về fps đích,
cắt khung bao chung, thu về chiều cao đích, xuất WebP động."""
import glob, sys
from PIL import Image

src, out, start, end, fade, src_fps, fps, height = sys.argv[1], sys.argv[2], *map(int, sys.argv[3:9])
fs = sorted(glob.glob(src + '/*.png'))
F = [Image.open(f).convert('RGBA') for f in fs[start:end]]
n = len(F) - fade
loop = []
for k in range(n):
    if k < fade:  # khung đầu hòa với phần đuôi -> chỗ nối mượt
        a = (k + 1) / (fade + 1)
        loop.append(Image.blend(F[n + k], F[k], a))
    else:
        loop.append(F[k])
step = src_fps / fps
loop = [loop[int(i * step)] for i in range(int(len(loop) / step))]
box = loop[0].getbbox()
for im in loop[1:]:
    b = im.getbbox(); box = (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
loop = [im.crop(box) for im in loop]
w = round(loop[0].width * height / loop[0].height)
loop = [im.resize((w, height), Image.LANCZOS) for im in loop]
loop[0].save(out, save_all=True, append_images=loop[1:], duration=round(1000 / fps), loop=0, quality=80, alpha_quality=90, method=4)
import os
print(out, len(loop), 'frames', (w, height), os.path.getsize(out) // 1024, 'KB')
