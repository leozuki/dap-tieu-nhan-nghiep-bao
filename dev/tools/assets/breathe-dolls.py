"""Tạo ảnh động "đang thở" (idle breathing) cho tư thế đứng của hình nhân, dùng hiệu ứng Breathe của sprite-gen.

Breathe giữ nguyên đầu (tự tìm cổ), chỉ phồng/xẹp phần thân theo nhịp, nên nhân vật không còn đứng đơ.
Đầu ra: <img>/v3/<vai>/<tier>_idle.webp (WebP động, nền trong suốt) cạnh ảnh tĩnh gốc.

Cài sprite-gen một lần (https://github.com/aldegad/sprite-gen, Apache-2.0):
    git clone https://github.com/aldegad/sprite-gen && cd sprite-gen
    py -3.14 -m venv .venv && .venv/Scripts/python -m pip install -e .
Chạy (từ thư mục gốc repo):
    set PYTHONIOENCODING=utf-8
    <sprite-gen>/.venv/Scripts/python tools/assets/breathe-dolls.py www-hard/img
"""
import sys
from pathlib import Path

from PIL import Image
from sprite_gen.effects.breathe import bake_breathe_sequence

DOLLS = ["batam", "sep", "dongnghiep", "nguoiquen", "traxanh"]
TIERS = ["clean", "wrinkled", "edited"]
CFG = {"depth": 0.045, "breaths": 1, "lag": 0.1}  # phồng ~4,5% chiều cao thân, 1 nhịp mỗi vòng
FRAMES, MS = 6, 200  # 6 khung × 200ms = 1,2s mỗi nhịp thở (6 khung/nhịp là ngưỡng mượt của sprite-gen)


def bake(src: Path, dst: Path) -> None:
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    pad = int(h * 0.12)  # chừa chỗ cho thân giãn ra
    canvas = Image.new("RGBA", (w + 2 * pad, h + pad), (0, 0, 0, 0))
    canvas.paste(im, (pad, pad), im)
    frames, _ = bake_breathe_sequence([canvas] * FRAMES, CFG)
    # cắt về khung bao chung của mọi khung để ảnh không bị nhỏ đi vì phần đệm
    box = frames[0].getbbox()
    for f in frames[1:]:
        b = f.getbbox()
        box = (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
    frames = [f.crop(box) for f in frames]
    frames[0].save(dst, save_all=True, append_images=frames[1:], duration=MS, loop=0,
                   quality=80, alpha_quality=90, method=4)


def main(img_root: str) -> None:
    root = Path(img_root) / "v3"
    for who in DOLLS:
        for tier in TIERS:
            src = root / who / f"{tier}.webp"
            if not src.exists():
                print("thiếu", src)
                continue
            dst = root / who / f"{tier}_idle.webp"
            bake(src, dst)
            print(dst, f"{dst.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "www-hard/img")
