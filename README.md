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
