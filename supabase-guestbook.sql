-- ============================================================
--  아트다락방 — 다락방 방명록 표 만들기 (한 번만)
-- ------------------------------------------------------------
--  사용법
--   1) https://supabase.com → 내 프로젝트 → 왼쪽 SQL Editor → New query
--   2) 이 파일 전체를 붙여 넣고 RUN
--   3) 사이트(darakbang.html)를 새로 고치면 방명록이 열립니다.
--
--  ※ supabase-schema.sql 을 이미 실행한 프로젝트에서 쓰는 SQL 입니다.
--    (profiles 표와 is_admin() 함수를 함께 씁니다)
--  ※ 여러 번 실행해도 안전합니다.
-- ============================================================

-- 1. 표
create table if not exists public.guestbook (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.profiles (id) on delete cascade,
  author_id  uuid not null references public.profiles (id) on delete cascade,
  author_pen text not null default '',
  body       text not null check (char_length(body) between 1 and 200),
  created_at timestamptz not null default now()
);

create index if not exists guestbook_owner_idx  on public.guestbook (owner_id, created_at desc);
create index if not exists guestbook_author_idx on public.guestbook (author_id, created_at desc);

-- 2. 작성자·필명은 서버가 정합니다 (필명 위조 방지)
create or replace function public.stamp_guestbook_author()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  author public.profiles;
begin
  if me is null then
    return new;
  end if;

  select * into author from public.profiles where id = me;
  if author.id is null then
    return new;
  end if;

  new.author_id  := me;
  new.author_pen := author.pen_name;
  return new;
end;
$$;

drop trigger if exists guestbook_stamp_author on public.guestbook;
create trigger guestbook_stamp_author before insert on public.guestbook
  for each row execute function public.stamp_guestbook_author();

-- 3. 접근 규칙 (RLS)
alter table public.guestbook enable row level security;

-- 읽기: 누구나
drop policy if exists guestbook_read on public.guestbook;
create policy guestbook_read on public.guestbook
  for select using (true);

-- 남기기: 로그인한 사람이 자기 이름으로만
drop policy if exists guestbook_insert on public.guestbook;
create policy guestbook_insert on public.guestbook
  for insert to authenticated
  with check (auth.uid() = author_id);

-- 지우기: 남긴 사람, 다락방 주인, 관리자
drop policy if exists guestbook_delete on public.guestbook;
create policy guestbook_delete on public.guestbook
  for delete to authenticated
  using (auth.uid() = author_id or auth.uid() = owner_id or public.is_admin());

-- 4. 권한
grant select on public.guestbook to anon, authenticated;
grant insert, delete on public.guestbook to authenticated;

-- ============================================================
--  확인용 (선택) — 아래 두 줄의 주석을 풀고 실행하면 표가 보입니다.
-- ============================================================
-- select count(*) from public.guestbook;
-- select * from public.guestbook order by created_at desc limit 5;
