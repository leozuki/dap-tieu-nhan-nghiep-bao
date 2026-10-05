# Đập Tiểu Nhân · Nghiệp Báo (bản khó)

Bản khó, làm **riêng** trong `www-hard/`. Không đụng code bản thường (`www/`), lưu tiến trình ở khóa riêng (`dtn-nghiepbao-v1`), nên chơi hai bản song song không đè nhau.

```bash
npm run dev:hard        # http://localhost:8125  (thêm ?debug để có nút nhảy tiến trình trong Cài đặt)
node tools/sim-nghiepbao.js   # mô phỏng để cân lại số
```

---

## 1. Phân tích gameplay bản thường

**Vòng lặp:** chọn hình nhân → bày mâm (lời khấn) → đập 60s → kết quả + 1 mảnh ký ức → cảnh truyện theo tổng lượt → 15 mảnh → cảnh 07–08 → 3 kết thúc.

**Điểm mạnh**
- Xung đột trụ cột rõ: *muốn điểm thì đập, muốn sự thật thì dừng tay*. Lời thì thầm cắt ngang đúng lúc đang hăng.
- Mỗi con một kiểu né, có báo hiệu 0,4s, nên né có thể đọc được.
- Độ khó tăng theo số lượt với từng con, lời khấn và thì thầm cũng đổi theo lượt.

**Vì sao bản thường dễ**
| Vấn đề | Chi tiết trong code (`www/js/round.js`) |
|---|---|
| Không có trạng thái thua | Hết 60s là luôn nhận mảnh ký ức, bất kể điểm |
| Đập bừa không bị phạt | Trượt chỉ mất combo; chạm loạn khắp sân gần như không thiệt gì |
| Né thưa, báo hiệu dài | Chu kỳ 3–4s ở lượt 1, báo hiệu 0,4s cố định |
| Mỗi con chỉ một kiểu né | Sau 1 lượt là đọc được hết |
| Vùng đập rộng | Chỉ thu ảnh 14% hai bên, cộng thêm 10px đệm |
| Người chơi không bị tấn công | Hình nhân chỉ né, không bao giờ "đánh lại" |
| Ending ẩn dễ | 80% lời thì thầm (24/30), chơi lại lượt 4+ là gom đủ |

**Lỗi phát hiện khi phân tích:** Phát (né kiểu `shield`) không có ảnh khiên trong bộ v3 (`look.shield` không tồn tại), nên khi né thì **không có gì hiện ra**, người chơi đập vào là nghe "KENG" mà không biết vì sao. Bản khó đã vẽ khiên "HỒ SƠ" bằng CSS (`.h-shield`). Bản thường **chưa sửa**.

---

## 2. Thay đổi trong bản Nghiệp Báo

| Hạng mục | Bản thường | Nghiệp Báo |
|---|---|---|
| Chu kỳ né (lượt 1/2/3+) | 3–4 / 2,2–3 / 1,6–2,4s | **2–2,8 / 1,4–2,1 / 1–1,6s** |
| Báo hiệu trước khi né | 0,4s | **0,32 / 0,27 / 0,22s** |
| Giả né | 0 / 10% / 25% | **15% / 25% / 35%** |
| Thời gian giữ né | ×1 / ×1,1 / ×1,2 | ×1,1 / ×1,2 / ×1,3 |
| Né liền hai lần | không | lượt 2: 15%, lượt 3+: 30% |
| Kiểu né thứ hai | không | từ lượt 2 (35–45%): Bà Tư thụt, Khải chạy, Phát thụt, Ngọc chạy, Thảo lủi |
| Vật ném | không | từ lượt 2: LỜI ĐỒN / KPI / VIỆC / GIẤY NỢ / TIN NHẮN, bay 1,35s (lượt 2) / 1,1s (lượt 3+) |
| Vùng đập | thu 14% ngang, 4% dọc, đệm 10px | **thu 20% ngang, 8% dọc, đệm 2px** |
| Combo | đứt nếu > 0,8s không trúng | đứt nếu > **0,6s**, nhưng **đồng hồ combo dừng khi hình nhân đang né** (chờ đúng lúc thì giữ được combo) |
| Hệ số combo | x1,5@10 · x2@20 · x3@35 | x1,5@6 · x2@15 · x3@30 · **x4@50** |
| 10 giây cuối | không | **Cơn giận cuối**: né dồn (chu kỳ ×0,7), vật ném nhanh hơn, **điểm ×2** |
| Thua lượt | không có | **Thanh NGHIỆP** đầy = nghiệp quật, lượt không được tính |
| Mở mảnh ký ức | luôn có | phải đạt **chỉ tiêu 2.000 / 2.200 / 2.300** (lượt 4+ không cần) |
| Ending ẩn | 80% lời (24/30) | **90% lời (27/30)** + đã xem báo + thùng rác |
| Bậc kết quả | 2.500 / 5.000 / 8.000 | 2.500 / 3.300 / 4.000 |

### 2.1 Thanh Nghiệp (0–100)
| Sự kiện | Nghiệp |
|---|---|
| Đập trượt (kể cả đập lúc nó đang né) | +3 |
| Đập vào hồ sơ (KENG) | +8 |
| Bị vật ném trúng tay (cũng mất combo) | +15 |
| Cắt ngang lời thì thầm | +10 |
| **Nghe trọn một lời** | **−30** |
| Tự vơi | −2,5/giây |

Thiết kế này **làm sâu thêm trụ cột** chứ không chỉ tăng độ khó: dừng tay nghe sự thật là cách duy nhất để gột nghiệp nhanh. Vật ném bay tới đúng lúc hình nhân bắt đầu thì thầm tạo một lựa chọn khó: gạt (cắt lời, +10) hay chịu đòn (+15) để nghe trọn (−30).

### 2.2 Lượt thua
- Nghiệp quật hoặc thiếu chỉ tiêu: lượt **không tính** (không mảnh, không tăng tổng lượt, không kỷ lục).
- Lời thì thầm đã nghe trọn trong lượt thua **vẫn được lưu** vào Hồ sơ, để người chơi không mất phần truyện đã nghe.

### 2.3 Sửa tên người muốn đập
- Ở thẻ hình nhân (chạm vào hình nhân trên bàn), bấm **✎** cạnh tên → nhập tên (tối đa 16 ký tự) → **Viết tên**. Nút **Tên gốc** để trả lại tên cũ.
- Tên mới hiện ở dải giấy trên hình nhân (bàn đỏ, lượt đập, mâm cúng), HUD, bong bóng thì thầm, Hồ sơ, và **thay tên gốc trong lời khấn, lời kể, mảnh ký ức, kết cục**. Lời thì thầm giữ nguyên (không chứa tên).
- Tên dài được ép vừa dải giấy. Ký tự `< > " &` bị lọc, khoảng trắng thừa bị gộp.
- **Riêng tư:** tên chỉ lưu trên máy (`S.names`), giữ lại khi "Chơi lại từ đầu". Nhật ký playtest chỉ ghi sự kiện `rename{doll, custom}`, **không ghi tên**.
- Cài đặt ở `www-hard/js/state.js` (`setName`, `applyNames`): giữ bản gốc ở `d.orig`, mỗi lần đổi thì dựng lại chữ từ bản gốc.

### 2.4 Phần mở đầu (intro)
- Hiện **một lần** khi bấm "Vào hẻm" lần đầu, trước cảnh 01 "Bước vào hẻm". Có nút **Bỏ qua**; xem lại ở Cài đặt → "📖 Xem lại phần mở đầu".
- 5 cảnh, chạm để hiện từng câu: Kinh Trập, tiểu nhân thức giấc → năm lời buộc tội (lấy tên hiện tại của hình nhân, kể cả tên tự đặt) → bàn đỏ cuối hẻm 27 → lời dặn "đập bừa thì nghiệp quật / muốn nghe thì dừng tay" → "Bạn mang theo năm cái tên. Và một chiếc dép xanh."
- **Không lộ twist**: chỉ gợi chiếc dép xanh (khớp tờ báo ở cảnh 05), không nhắc tên Vy.
- Chữ nằm ở `STORY.INTRO` trong `www-hard/js/story.js`; `<b>…</b>` được giữ in đậm. Nhật ký ghi `scene{id:'intro'}` và `intro_skip{at}` để đo tỉ lệ bỏ qua.

### 2.5 Hình nhân "đang thở" (sprite-gen)
- Tư thế đứng của 5 hình nhân × 3 mức giấy (sạch / nhăn / bị sửa) là **WebP động 6 khung, 1,2 giây/nhịp thở**: đầu giữ nguyên, thân phồng xẹp ~4,5%. Dùng hiệu ứng Breathe của [sprite-gen](https://github.com/aldegad/sprite-gen) (Apache-2.0, không cần AI).
- File: `www-hard/img/v3/<vai>/<tier>_idle.webp` (~70–100 KB mỗi file, tổng 1,3 MB). Dựng lại bằng `tools/assets/breathe-dolls.py` (hướng dẫn cài ở đầu file).
- Bật/tắt: `BREATHE` trong `www-hard/js/art.js`.
- Thêm: tải trước mọi khung của hình nhân khi vào lượt (`preload` trong `round.js`) để lần đầu đổi tư thế không chớp trống.

### 2.6 Mạch truyện có người dẫn chuyện (bà thầy)
Vấn đề cũ: câu chữ rời rạc, không ai giải thích vì sao hình nhân biết nói, vì sao đập 3 lượt; lời thì thầm trôi qua giữa lúc đập rồi mất; cảnh 07 lật mặt quá cô đọng.
- **Bà thầy** thành người dẫn chuyện: hỏi trước lời khấn ở mâm cúng (`UI.askVow`), nhận xét sau mỗi mảnh ký ức ở màn kết quả (`THAY` trong `story.js`). Lượt 1 bà đồng tình, lượt 2 bà chỉ ra chỗ lời kể vênh nhau, lượt 3 bà hỏi thẳng.
- Màn kết quả hiện lại **những lời vừa nghe trọn**, để người chơi đọc kỹ những gì nghe vội lúc đập.
- Nhãn mảnh ký ức: **Bạn kể / Họ kể / Bằng chứng**. Lời "Bạn kể" giới thiệu rõ mỗi người là ai (bà bán vé số đầu hẻm, trưởng phòng, bạn ngồi bàn bên…).
- Cảnh 03 giải thích luật bằng lời bà thầy: hình nhân dán bằng lời khấn, đập là rách lộ cái bên dưới; dừng tay để nghe; mỗi người đập đủ 3 lần.
- Cảnh 05 và 06: bà thầy giấu tờ báo, không trả lời khi bị hỏi về nét chữ, gieo nghi ngờ.
- Cảnh 07 nói thẳng: **không có bà thầy nào**, đó là giọng của Vy; Vy là ai, chuyện gì xảy ra 42 ngày trước, và những người bị đập là những người đang đi tìm Vy. Khối kết cục đổi tên thành "Họ bây giờ".
- Cảnh 08: hình nhân thứ sáu là "cho người cuối cùng Vy còn giận".
- Tên tự đặt cũng được thay trong lời bà thầy.

### 2.7 Tạo hình bằng AI qua cổng API (chưa chạy được)
- `tools/assets/sg-gateway.py`: chạy sprite-gen qua cổng tương thích (vd. shopaikey) thay vì api.openai.com / api.x.ai. Khóa lấy từ biến môi trường, không lưu vào repo.
- Codex CLI trên máy hỏng file `codex.exe` (lỗi C000012F), cần cài lại; thay bằng `gpt-image` qua shopaikey.
- **Bản thử Bà Tư (2026-10-02), tổng ~2,2 USD:**
  - Ảnh: `gen --provider openai --model gpt-image-1.5 --ref <ảnh cũ phóng to>` → 1024×1536, giữ đúng thiết kế, ~0,09 USD/ảnh. AI vẽ trên nền trắng nên tách bằng `sprite-gen cutout --key white` (miễn phí). Lưu ở `assets/hd/batam/clean.png`.
  - Video: cổng shopaikey **không** có `/v1/videos/generations` kiểu xAI, phải gửi `/v1/video/generations` với `{model, prompt, image: <data URL>, duration}` → `sg_gateway/video_submit.py`. `grok-imagine-video-1.5`, 6 giây, ~2 USD/video, ~80 giây chờ. Lưu ở `assets/hd/batam/idle.mp4`.
  - Vòng lặp: `sprite-gen video-frames --key green` tách nền; `video-loop` báo không khép vòng (nhân vật không về đúng tư thế đầu), nên dùng `sg_gateway/make_loop.py` lấy đoạn khung 79→137, hòa 8 khung cuối vào đầu → `www-hard/img/v3/batam/clean_idle.webp` (25 khung, 12 fps, 280×420, 769 KB, có chớp mắt).
  - Hạn chế: các tư thế khác của Bà Tư (né, trúng đòn…) vẫn là ảnh cũ độ phân giải thấp, đổi tư thế sẽ thấy chênh độ nét.

### 2.8 Hai chế độ trong một app (chuẩn bị lên store, 2026-10-05)
- `www-hard/` giờ là mã game duy nhất cho app iOS (`npm run build` → `app-www/`). Người chơi chọn **Bình thường** / **Nghiệp Báo** ở trang đầu hoặc Cài đặt (`State.S.mode`, mặc định Bình thường); đổi lúc nào cũng được, áp dụng từ lượt sau, tiến trình truyện dùng chung.
- `MODES` trong `round.js`: Bình thường = đúng thông số bản gốc (né 3–4 / 2,2–3 / 1,6–2,4s, báo hiệu 0,4s, combo 0,8s, hệ số x1,5@10…x3@35, vùng đập rộng), **tắt** nghiệp, chỉ tiêu, vật ném, kiểu né thứ hai, cơn giận cuối. Nghiệp Báo giữ nguyên mục 2.1–2.2.
- Kết thúc ẩn: Bình thường cần 80% lời, Nghiệp Báo 90% (`State.hiddenRatio()`).
- Truyện có bà thầy, intro, đổi tên, hình nhân "đang thở" dùng chung cho cả hai chế độ.
- Sự kiện `round_start` / `round_end` gửi kèm `mode`; dashboard chỉ tính lượt Nghiệp Báo (có chỉ tiêu) vào bảng độ khó.
- Font nhúng offline (`www-hard/fonts/`, OFL), đường dây hỗ trợ tâm lý (Ngày Mai 096 306 1414, 115) trong Cài đặt và mọi màn kết thúc, 3 mức giấy vẽ lại HD (`tools/assets/hd-tiers.sh` + `hd-finish.py`).

---

## 3. Cân bằng (mô phỏng, `tools/sim-nghiepbao.js`, 2.000 lượt mỗi ô)

| Người chơi | Lượt 1 qua / quật | Lượt 2 qua / quật | Lượt 3 qua / quật |
|---|---|---|---|
| Mới (4 nhát/s, trúng 80%, phản xạ 0,35s) | 2% / 4% | 0% / 22% | 0% / 41% |
| Trung bình (5 nhát/s, 88%, 0,28s) | 86% / 0% | 49% / 1% | 21% / 2% |
| Giỏi (6 nhát/s, 94%, 0,2s) | 100% / 0% | 99% / 0% | 96% / 0% |

Kiểm tra trong trình duyệt: bot đập 6 nhát/s, không trượt, nghe đủ 2 lời được **3.415 điểm** ở lượt 1 Bà Tư, khớp với mô phỏng.

**Ý đồ:** người chơi mới nên chơi bản thường trước. Người chơi trung bình phải chơi lại vài lần ở lượt 3, người giỏi gần như luôn qua. Nếu playtest thấy quá gắt, chỉnh `STORY.HARD.quota` trong `www-hard/js/story.js` và `KARMA` trong `www-hard/js/round.js`, rồi chạy lại mô phỏng.

**Giới hạn của mô phỏng:** mô hình người chơi rất thô (tỉ lệ trúng cố định, không tính việc ngắm lại sau khi hình nhân chạy). Cần playtest thật để chốt.

---

## 4. File đã thay đổi (so với bản sao từ `www/`)
| File | Thay đổi |
|---|---|
| `www-hard/js/round.js` | Toàn bộ cơ chế khó: DIFF, nghiệp, vật ném, combo, cơn giận cuối, kết thúc lượt có `reason`/`passed` |
| `www-hard/js/story.js` | Thêm `STORY.HARD` (chỉ tiêu, kiểu né 2, vật ném, luật) và chữ UI mới |
| `www-hard/js/app.js` | Màn kết quả thua, luật trên trang đầu, chip chỉ tiêu, gợi ý ở mâm cúng, ngưỡng ending ẩn |
| `www-hard/js/state.js` | Khóa lưu riêng, ngưỡng ẩn 90% |
| `www-hard/css/hard.css` | Giao diện thanh nghiệp, chỉ tiêu, vật ném, khiên hồ sơ, hiệu ứng cơn giận / bị ném / nghiệp quật |
| `tools/serve.js` | Nhận cổng qua tham số thứ hai (`node tools/serve.js www-hard 8125`) |

## 5. Chưa làm
- Đóng gói iOS cho bản khó: Capacitor đang trỏ `webDir: www`. Muốn phát hành riêng thì cần `appId` khác và cấu hình Capacitor riêng; muốn gộp làm "chế độ" trong app chính thì nên đưa cơ chế này vào `www/` dưới dạng tùy chọn.
- Kịch bản, ảnh và âm thanh dùng lại bản thường (sửa kịch bản ở `www/` sẽ **không** tự sang `www-hard/`).
