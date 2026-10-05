#!/usr/bin/env bash
# Dựng repo công khai cho bản Nghiệp Báo (GitHub Pages phục vụ từ gốc repo).
#   bash tools/build-site.sh            # dựng vào ../dap-tieu-nhan-nghiep-bao
#   bash tools/build-site.sh <thư-mục>  # dựng vào thư mục khác
# Gốc repo = trang game (www-hard). Tài liệu & công cụ nằm trong dev/. Không chép ảnh không dùng, không chép khóa.
set -euo pipefail
SRC="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-$SRC/../dap-tieu-nhan-nghiep-bao}"
mkdir -p "$OUT"
# xóa bản cũ nhưng giữ .git
find "$OUT" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +

W="$SRC/www-hard"
cp "$W/index.html" "$W/privacy.html" "$OUT/"
cp -r "$W/css" "$W/js" "$W/admin" "$OUT/"
mkdir -p "$OUT/img/v2"
cp "$W"/img/*.webp "$OUT/img/"
cp -r "$W/img/play" "$W/img/v3" "$OUT/img/"
cp -r "$W/img/v2/weapons" "$OUT/img/v2/"
touch "$OUT/.nojekyll"   # GitHub Pages: phục vụ nguyên file, không qua Jekyll

mkdir -p "$OUT/dev/docs" "$OUT/dev/tools/admin" "$OUT/dev/tools/assets"
cp "$SRC/docs/NGHIEP_BAO.md" "$SRC/docs/ADMIN.md" "$OUT/dev/docs/"
cp "$SRC/tools/admin/supabase.sql" "$OUT/dev/tools/admin/"
cp "$SRC/tools/sim-nghiepbao.js" "$SRC/tools/build-site.sh" "$OUT/dev/tools/"
cp "$SRC/tools/assets/breathe-dolls.py" "$SRC/tools/assets/sg-gateway.py" "$OUT/dev/tools/assets/"
cp -r "$SRC/tools/assets/sg_gateway" "$OUT/dev/tools/assets/"
find "$OUT/dev" -name "__pycache__" -prune -exec rm -rf {} +

cat > "$OUT/README.md" <<'EOF'
# Đập Tiểu Nhân · Nghiệp Báo

Bản khó của trò chơi xả stress **Đập Tiểu Nhân**: né nhanh, vật ném, thanh nghiệp, chỉ tiêu điểm, và một câu chuyện có bà thầy dẫn chuyện.

- Chơi: trang GitHub Pages của repo này (`/`)
- Bảng điều khiển admin: `/admin/` (cần tài khoản admin Supabase; `/admin/?demo` để xem dữ liệu mẫu)

Game có chủ đề sức khỏe tinh thần ở phần cuối.

## Chạy trên máy
Trang tĩnh, không cần build: mở bằng bất kỳ máy chủ tĩnh nào, ví dụ `npx serve .` rồi vào http://localhost:3000.

## Số liệu chơi
Game gửi sự kiện **ẩn danh** (mã ngẫu nhiên + điểm/lượt) về Supabase khi `js/config.js` đã cấu hình; người chơi tắt được trong Cài đặt. Chi tiết: [dev/docs/ADMIN.md](dev/docs/ADMIN.md).

## Tài liệu
- Thiết kế bản khó, cân bằng: [dev/docs/NGHIEP_BAO.md](dev/docs/NGHIEP_BAO.md)
- Admin & Supabase: [dev/docs/ADMIN.md](dev/docs/ADMIN.md)

Mã nguồn đầy đủ của dự án (bản thường, bộ asset gốc, đóng gói iOS) nằm ở kho riêng; repo này được dựng bằng `dev/tools/build-site.sh`.
EOF
echo "Đã dựng: $OUT"
