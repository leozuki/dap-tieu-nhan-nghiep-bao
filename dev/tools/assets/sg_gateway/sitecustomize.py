"""Trỏ sprite-gen sang cổng API tương thích (vd. shopaikey) thay cho api.openai.com / api.x.ai.

Python tự nạp file này khi thư mục chứa nó nằm trong PYTHONPATH, nên mọi tiến trình con mà sprite-gen
gọi (video-set chạy `python -m sprite_gen.gen.video` riêng) cũng đi qua cổng, không lọt sang máy chủ gốc.
Chỉ bật khi có biến SG_API_BASE. Dùng qua tools/assets/sg-gateway.py.
"""
import os

BASE = os.environ.get("SG_API_BASE")
try:
    from sprite_gen.gen import openai_provider, xai
except ImportError:  # Python không có sprite-gen (vd. Python hệ thống) thì bỏ qua
    BASE = None
if BASE:
    import base64
    import shutil
    import urllib.request

    # trước khi video.py `from .xai import API_BASE` (kể cả khi nó chạy dưới tên __main__)
    xai.API_BASE = BASE
    openai_provider.API_BASE = BASE
    try:
        from sprite_gen.gen import video as _video
        _video.API_BASE = BASE
    except Exception:  # noqa: BLE001 — video là tùy chọn
        pass

    # cổng có thể trả ảnh dạng link ("url") thay vì base64 ("b64_json") như OpenAI
    _orig_publish = openai_provider._publish_image

    def _publish_image(item, path):
        if not item.get("b64_json") and isinstance(item.get("url"), str):
            url = item["url"]
            if url.startswith("data:"):
                item = {**item, "b64_json": url.split(",", 1)[1]}
            else:
                req = urllib.request.Request(url, headers={"User-Agent": "sprite-gen"})
                with urllib.request.urlopen(req, timeout=120) as r:
                    item = {**item, "b64_json": base64.b64encode(r.read()).decode()}
        return _orig_publish(item, path)

    openai_provider._publish_image = _publish_image

    # thiếu img2webp (libwebp >= 1.5) thì ghi WebP động bằng Pillow; chỉ khác màu RGB dưới vùng trong suốt
    if not shutil.which("img2webp"):
        from sprite_gen.video import loop as _loop

        def _write_webp(frames, out, *, delay_ms, workdir):
            frames[0].save(out, save_all=True, append_images=frames[1:], duration=delay_ms, loop=0,
                           lossless=True, method=4)

        _loop.write_webp = _write_webp
