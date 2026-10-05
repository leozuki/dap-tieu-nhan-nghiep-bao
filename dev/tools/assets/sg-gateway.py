"""Chạy sprite-gen (https://github.com/aldegad/sprite-gen) qua một cổng API tương thích OpenAI/xAI, ví dụ shopaikey,
thay cho api.openai.com / api.x.ai mà sprite-gen gắn cứng. Phần vá nằm ở sg_gateway/sitecustomize.py.

Khóa đọc từ biến môi trường SHOPAIKEY (không ghi khóa vào file). Đổi cổng bằng SG_API_BASE.
    set SHOPAIKEY=sk-...
    set PYTHONIOENCODING=utf-8
    <sprite-gen>/.venv/Scripts/python tools/assets/sg-gateway.py gen --provider openai --model gpt-image-1.5 --ref ref.png --out out.png --prompt "..."
    <sprite-gen>/.venv/Scripts/python tools/assets/sg-gateway.py video-set --base front=still.png --states idle --out-dir out/
Mỗi lệnh gen/video là một lần gọi tính phí trên key đó.
"""
import os
import subprocess
import sys
from pathlib import Path

env = dict(os.environ)
env.setdefault("SG_API_BASE", "https://api.shopaikey.com/v1")
key = env.get("SHOPAIKEY")
if not key:
    sys.exit("sg-gateway: chưa đặt biến môi trường SHOPAIKEY")
env["OPENAI_API_KEY"] = key
env["XAI_API_KEY"] = key
env["GROK_HOME"] = str(Path(__file__).parent / "sg_gateway" / "no-grok-login")  # không dùng đăng nhập Grok trên máy
patch_dir = str(Path(__file__).parent / "sg_gateway")
env["PYTHONPATH"] = patch_dir + os.pathsep + env.get("PYTHONPATH", "")
code = "import sys; from sprite_gen.cli import main; sys.exit(main(sys.argv[1:]))"
sys.exit(subprocess.run([sys.executable, "-c", code, *sys.argv[1:]], env=env).returncode)
