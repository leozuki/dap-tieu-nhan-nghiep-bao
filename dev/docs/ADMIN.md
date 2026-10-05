# Admin dashboard · Nghiệp Báo

Theo dõi người chơi thật để chỉnh độ khó: tỉ lệ đạt chỉ tiêu theo hình nhân × lượt, phân bố điểm, nghiệp quật, lời thì thầm, phễu truyện, kết thúc.

```
Người chơi (game trên host riêng) ──ghi sự kiện ẩn danh──▶ Supabase (bảng events)
                                                              │ chỉ admin đã đăng nhập được đọc
Bạn (trình duyệt) ──đăng nhập──▶ /admin/ ◀────────────────────┘
```

| Thành phần | File |
|---|---|
| Gửi sự kiện từ game | `www-hard/js/telemetry.js` (tự tắt khi chưa cấu hình) |
| Cấu hình | `www-hard/js/config.js` |
| Dashboard | `www-hard/admin/index.html` (mở `/admin/`, thêm `?demo` để xem dữ liệu mẫu) |
| Bảng & quyền trên Supabase | `tools/admin/supabase.sql` |

**Vì sao không dùng link claude.ai:** trang trên claude.ai chặn gửi dữ liệu ra máy chủ khác, và kho dữ liệu riêng của artifact không cho khách ngoài tổ chức ghi. Link claude.ai vẫn chơi được bình thường nhưng **không gửi số liệu**.

---

## Cài đặt (khoảng 15 phút, miễn phí)

### 1. Tạo dự án Supabase
1. Vào https://supabase.com → đăng ký → **New project** (chọn region Singapore cho gần Việt Nam).
2. **SQL Editor → New query**, dán toàn bộ `tools/admin/supabase.sql`, **sửa email ở dòng cuối** thành email admin của bạn → **Run**.
3. **Authentication → Users → Add user → Create new user**: nhập email đó + mật khẩu (tick *Auto Confirm User*).
4. **Authentication → Sign In / Providers**: tắt **Allow new users to sign up** (để người lạ không tự tạo tài khoản; dù có tạo cũng không đọc được vì không nằm trong bảng `admins`).
5. **Project Settings → API**: chép **Project URL** và khóa **anon / publishable**.
   - ⚠️ Không dùng khóa `service_role` / `secret` ở bất kỳ đâu trong game.

### 2. Điền cấu hình
Mở `www-hard/js/config.js`:
```js
window.DTN_TELEMETRY = {
  url: 'https://<mã-dự-án>.supabase.co',
  anonKey: '<khóa anon / publishable>'
};
```
Khóa anon được thiết kế để nằm công khai trong mã trang; quyền thật do Row Level Security trong SQL quyết định: game chỉ **thêm** được sự kiện, không đọc/sửa/xóa.

### 3. Đưa game lên host
Thư mục cần đưa lên: **`www-hard/`** (gồm cả `admin/`). Ví dụ Netlify: https://app.netlify.com/drop → kéo thả thư mục `www-hard`. Cloudflare Pages / GitHub Pages / Vercel cũng được (trang tĩnh, không cần build).
- Game: `https://<tên-trang>/`
- Dashboard: `https://<tên-trang>/admin/` → đăng nhập bằng tài khoản ở bước 1.3.

### 4. Kiểm tra
Chơi một lượt trên link mới → đợi ~10 giây (hoặc chuyển tab) → mở dashboard, chọn **24 giờ** → phải thấy 1 người chơi, 1 lượt. Supabase: **Table Editor → events** cũng thấy các dòng mới.

---

## Dữ liệu gửi đi
- Một mã ngẫu nhiên cho mỗi trình duyệt (`player`), số phiên, tên sự kiện, vài con số. **Không** tên, email, IP lưu trong bảng, hay tên người chơi tự đặt cho hình nhân.
- Chỉ các sự kiện và trường trong danh sách trắng ở `telemetry.js` (`ALLOW`); bảng SQL cũng chỉ nhận đúng các tên sự kiện đó.
- Người chơi tắt được trong **Cài đặt → Gửi số liệu chơi ẩn danh** (chỉ hiện khi đã cấu hình).
- Gom 20 sự kiện hoặc 10 giây mới gửi một lần; mất mạng thì để dành (tối đa 500) gửi sau.

## Đọc dashboard
- **Độ khó theo hình nhân và lượt**: ô = % lượt đạt chỉ tiêu. Hàng *Mục tiêu* so cả cột với mục tiêu từ mô phỏng (80/50/20%): lệch hơn 15 điểm thì báo *Quá dễ / Quá khó*. Chỉnh `STORY.HARD.quota` (story.js) hoặc `KARMA` (round.js), đổi `APP` trong `telemetry.js` (vd. `nghiepbao-0.4`) rồi lọc theo phiên bản để so trước/sau.
- **Phân bố điểm**: điểm dồn sát dưới vạch chỉ tiêu → chỉ tiêu hơi gắt.
- **Lý do thua lượt**: nghiệp quật nhiều → giảm `KARMA.miss` / `KARMA.struck`.
- **Lời thì thầm**: cắt ngang nhiều → người chơi bỏ lỡ truyện.

## Giới hạn
- Gói miễn phí Supabase: 500 MB cơ sở dữ liệu (đủ hàng triệu sự kiện playtest). Dự án tạm dừng nếu 7 ngày không có truy cập; vào trang Supabase bấm *Restore*.
- Khóa anon công khai nên ai cũng có thể gửi sự kiện rác. Đủ cho playtest; phát hành lớn thì nên thêm giới hạn tần suất (Edge Function) hoặc lọc theo `app`.
- Dashboard tải tối đa 90 ngày gần nhất / 50.000 sự kiện mỗi lần.
