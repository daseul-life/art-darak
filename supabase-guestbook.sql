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
--  ※ 같은 이름의 빈 guestbook 표가 이미 있던 프로젝트라면
--    그 표를 지우지 않고 빠진 칸(작성자·내용 등)만 보충합니다.
--    기존 칸(content 등)과 기존 줄은 그대로 둡니다.
-- ============================================================

-- 0. uuid 기본값을 만드는 확장 (이미 있으면 그대로)
create extension if not exists pgcrypto;

-- 1. 표
create table if not exists public.guestbook (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.profiles (id) on delete cascade,
  author_id  uuid not null references public.profiles (id) on delete cascade,
  author_pen text not null default '',
  body       text not null check (char_length(body) between 1 and 200),
  created_at timestamptz not null default now()
);

-- 예전에 만들어진 같은 이름의 표라면 빠진 칸만 더합니다.
alter table public.guestbook add column if not exists owner_id   uuid;
alter table public.guestbook add column if not exists author_id  uuid;
alter table public.guestbook add column if not exists author_pen text not null default '';
alter table public.guestbook add column if not exists body       text;
alter table public.guestbook add column if not exists created_at timestamptz not null default now();
alter table public.guestbook alter column id set default gen_random_uuid();
alter table public.guestbook alter column created_at set default now();

-- 예전 표의 content 칸이 '반드시 채워야 함'으로 되어 있으면 새 인사 저장이 막히므로 풀어 둡니다.
do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'guestbook' and column_name = 'content'
  ) then
    execute 'alter table public.guestbook alter column content drop not null';
  end if;
end;
$$;

-- body 는 비어 있지 않은 200자 이하만 (기존 줄이 있으면 그 줄은 건너뜀)
do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conname = 'guestbook_body_check' and conrelid = 'public.guestbook'::regclass
  ) then
    alter table public.guestbook add constraint guestbook_body_check
      check (body is null or char_length(body) between 1 and 200) not valid;
  end if;
end;
$$;

-- 주인·작성자와 profiles 의 연결(계정이 지워지면 인사도 함께) — 이미 있으면 건너뜀
do $$
begin
  if not exists (
    select 1 from pg_constraint c
      join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
     where c.conrelid = 'public.guestbook'::regclass and c.contype = 'f' and a.attname = 'owner_id'
  ) then
    alter table public.guestbook add constraint guestbook_owner_fk
      foreign key (owner_id) references public.profiles (id) on delete cascade not valid;
  end if;

  if not exists (
    select 1 from pg_constraint c
      join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
     where c.conrelid = 'public.guestbook'::regclass and c.contype = 'f' and a.attname = 'author_id'
  ) then
    alter table public.guestbook add constraint guestbook_author_fk
      foreign key (author_id) references public.profiles (id) on delete cascade not valid;
  end if;
end;
$$;

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

-- 같은 이름의 예전 표에 붙어 있던 접근 규칙을 먼저 정리합니다.
do $$
declare
  pol record;
begin
  for pol in
    select policyname from pg_policies
     where schemaname = 'public' and tablename = 'guestbook'
  loop
    execute format('drop policy if exists %I on public.guestbook', pol.policyname);
  end loop;
end;
$$;

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
