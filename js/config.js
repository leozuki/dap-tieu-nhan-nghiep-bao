/* Cấu hình gửi số liệu chơi về Supabase (xem docs/ADMIN.md).
   Để trống `url` thì game không gửi gì. `anonKey` là khóa công khai của Supabase (anon / publishable),
   được phép nằm trong mã trang: quyền thật do Row Level Security quyết định (game chỉ được GHI, không được ĐỌC).
   TUYỆT ĐỐI không dán service_role key vào đây. */
window.DTN_TELEMETRY = {
  url: 'https://xmziwcbuazvccpoesmzi.supabase.co',
  anonKey: 'sb_publishable_PrN5b2RAvZeMG1rbSBsjsQ_AiqFgwRT'  // khóa công khai, chỉ cho phép GHI sự kiện
};
