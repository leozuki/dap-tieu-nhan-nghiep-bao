-- Đập Tiểu Nhân · Nghiệp Báo — kho số liệu chơi cho admin dashboard.
-- Chạy MỘT LẦN trong Supabase: SQL Editor -> New query -> dán toàn bộ file -> Run.
-- Nhớ đổi email ở cuối file thành email tài khoản admin của bạn.

-- 1. Bảng sự kiện (game chỉ ghi vào đây)
create table if not exists public.events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  player      uuid not null,                       -- mã ngẫu nhiên mỗi trình duyệt, không gắn với người thật
  session     integer not null default 0,
  ev          text not null check (char_length(ev) between 1 and 40),
  data        jsonb not null default '{}'::jsonb check (pg_column_size(data) <= 4096),
  app         text check (char_length(app) <= 40),
  client_t    bigint
);
create index if not exists events_created_at_idx on public.events (created_at);
create index if not exists events_ev_idx on public.events (ev);
create index if not exists events_player_idx on public.events (player);

-- 2. Danh sách admin (chỉ chỉnh từ SQL Editor / service role, không ai đọc được qua API)
create table if not exists public.admins (email text primary key);
alter table public.admins enable row level security;

create or replace function public.is_admin() returns boolean
  language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email')) $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 3. Quyền: game (anon) chỉ được THÊM; chỉ admin đã đăng nhập được ĐỌC; không ai sửa/xóa qua API
alter table public.events enable row level security;
drop policy if exists "game ghi su kien" on public.events;
create policy "game ghi su kien" on public.events
  for insert to anon, authenticated
  with check (ev in ('session_start','scene','intro_skip','npc','round_start','round_end','whisper','quit_round','ending','rename','item'));
drop policy if exists "admin doc su kien" on public.events;
create policy "admin doc su kien" on public.events
  for select to authenticated using (public.is_admin());

grant insert on public.events to anon, authenticated;
grant select on public.events to authenticated;

-- 4. Email admin (đổi thành email bạn dùng để đăng nhập dashboard)
insert into public.admins (email) values ('YOUR_ADMIN_EMAIL@example.com') on conflict do nothing;
