/* Cấu hình gửi số liệu chơi về Supabase (xem docs/ADMIN.md).
   Để trống `url` thì game không gửi gì. `anonKey` là khóa công khai của Supabase (anon / publishable),
   được phép nằm trong mã trang: quyền thật do Row Level Security quyết định (game chỉ được GHI, không được ĐỌC).
   TUYỆT ĐỐI không dán service_role key vào đây. */
window.DTN_TELEMETRY = {
  url: '',      // vd. https://abcdxyz.supabase.co
  anonKey: ''   // vd. eyJhbGciOi... hoặc sb_publishable_...
};
