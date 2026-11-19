-- ============================================================
--  아트다락방 — 친구 신청·수락 표 만들기 (한 번만)
-- ------------------------------------------------------------
--  사용법
--   1) https://supabase.com → 내 프로젝트 → 왼쪽 SQL Editor → New query
--   2) 이 파일 전체를 붙여 넣고 RUN
--   3) 사이트(darakbang.html)를 새로 고치면 친구 기능이 열립니다.
--
--  ※ supabase-schema.sql 을 이미 실행한 프로젝트에서 쓰는 SQL 입니다.
--    (profiles 표를 함께 씁니다)
--  ※ 여러 번 실행해도 안전합니다.
--  ※ 같은 이름의 friendships 표가 이미 있던 프로젝트라면
--    그 표를 지우지 않고 빠진 칸만 보충하고, 접근 규칙과 권한을 다시 답니다.
--    기존 줄은 그대로 둡니다.
--  ※ 이 표가 없거나 열 권한이 없으면 사이트는 조용히
--    '친구 방을 준비하고 있어요' 안내만 보여 주고, 다른 기능은 그대로 동작합니다.
-- ============================================================

-- 0. uuid 기본값을 만드는 확장 (이미 있으면 그대로)
create extension if not exists pgcrypto;

-- 1. 표
create table if not exists public.friendships (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status       text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 예전에 만들어진 같은 이름의 표라면 빠진 칸만 더합니다.
alter table public.friendships add column if not exists requester_id uuid;
alter table public.friendships add column if not exists addressee_id uuid;
alter table public.friendships add column if not exists status       text not null default 'pending';
alter table public.friendships add column if not exists created_at   timestamptz not null default now();
alter table public.friendships add column if not exists updated_at   timestamptz not null default now();

-- id 가 uuid 인 표에만 기본값을 답니다. (예전 표가 숫자 id 를 쓰면 그대로 둡니다)
do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'friendships'
       and column_name = 'id' and data_type = 'uuid'
  ) then
    execute 'alter table public.friendships alter column id set default gen_random_uuid()';
  end if;
end;
$$;

-- 예전 표의 다른 칸이 '반드시 채워야 함'으로 되어 있으면 새 신청이 막히므로 풀어 둡니다.
do $$
declare
  col record;
begin
  for col in
    select column_name from information_schema.columns
     where table_schema = 'public' and table_name = 'friendships'
       and is_nullable = 'NO'
       and column_default is null
       and column_name not in ('id', 'requester_id', 'addressee_id', 'status')
  loop
    execute format('alter table public.friendships alter column %I drop not null', col.column_name);
  end loop;
end;
$$;

-- 상태 값은 pending(신청) · accepted(친구) 둘뿐 (기존 줄이 있으면 그 줄은 건너뜀)
do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conname = 'friendships_status_check' and conrelid = 'public.friendships'::regclass
  ) then
    alter table public.friendships add constraint friendships_status_check
      check (status is null or status in ('pending', 'accepted')) not valid;
  end if;
end;
$$;

-- 나 자신에게는 신청할 수 없습니다 (기존 줄이 있으면 그 줄은 건너뜀)
do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conname = 'friendships_self_check' and conrelid = 'public.friendships'::regclass
  ) then
    alter table public.friendships add constraint friendships_self_check
      check (requester_id is null or addressee_id is null or requester_id <> addressee_id) not valid;
  end if;
end;
$$;

-- 두 사람 사이의 신청은 한 줄만 (이미 친구이거나 신청 중이면 다시 만들지 않습니다)
-- 예전 표에 같은 두 사람의 줄이 여러 개 있어도 표를 지우지 않고 이 규칙만 건너뜁니다.
do $$
begin
  if not exists (select 1 from pg_class where relname = 'friendships_pair_uidx') then
    begin
      execute 'create unique index friendships_pair_uidx on public.friendships '
              '(least(requester_id, addressee_id), greatest(requester_id, addressee_id))';
    exception when unique_violation then
      raise notice 'friendships: 같은 두 사람 사이의 줄이 여러 개라 고유 인덱스는 건너뜁니다.';
    end;
  end if;
end;
$$;

-- profiles 와의 연결(계정이 지워지면 신청도 함께) — 이미 있으면 건너뜀
do $$
begin
  if not exists (
    select 1 from pg_constraint c
      join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
     where c.conrelid = 'public.friendships'::regclass and c.contype = 'f' and a.attname = 'requester_id'
  ) then
    alter table public.friendships add constraint friendships_requester_fk
      foreign key (requester_id) references public.profiles (id) on delete cascade not valid;
  end if;

  if not exists (
    select 1 from pg_constraint c
      join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
     where c.conrelid = 'public.friendships'::regclass and c.contype = 'f' and a.attname = 'addressee_id'
  ) then
    alter table public.friendships add constraint friendships_addressee_fk
      foreign key (addressee_id) references public.profiles (id) on delete cascade not valid;
  end if;
end;
$$;

create index if not exists friendships_requester_idx on public.friendships (requester_id, created_at desc);
create index if not exists friendships_addressee_idx on public.friendships (addressee_id, created_at desc);

-- 2. 고칠 때마다 updated_at 을 새로 적습니다
create or replace function public.touch_friendships()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists friendships_touch on public.friendships;
create trigger friendships_touch before update on public.friendships
  for each row execute function public.touch_friendships();

-- 3. 접근 규칙 (RLS) — 신청한 사람과 받은 사람만 보고 고칠 수 있습니다
alter table public.friendships enable row level security;

-- 같은 이름의 예전 표에 붙어 있던 접근 규칙을 먼저 정리합니다.
do $$
declare
  pol record;
begin
  for pol in
    select policyname from pg_policies
     where schemaname = 'public' and tablename = 'friendships'
  loop
    execute format('drop policy if exists %I on public.friendships', pol.policyname);
  end loop;
end;
$$;

drop policy if exists friendships_read on public.friendships;
create policy friendships_read on public.friendships
  for select to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- 신청: 로그인한 사람이 자기 이름으로만, 아직 수락되지 않은 상태로
drop policy if exists friendships_insert on public.friendships;
create policy friendships_insert on public.friendships
  for insert to authenticated
  with check (auth.uid() = requester_id and status = 'pending');

-- 수락: 받은 사람만. 신청한 사람은 기다리기만 합니다.
drop policy if exists friendships_update on public.friendships;
create policy friendships_update on public.friendships
  for update to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id)
  with check (auth.uid() = requester_id or auth.uid() = addressee_id);

-- 취소·거절·친구 끊기: 두 사람 중 누구나
drop policy if exists friendships_delete on public.friendships;
create policy friendships_delete on public.friendships
  for delete to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- 4. 권한 (표에 접근할 수 있는 역할을 정합니다)
grant select on public.friendships to anon, authenticated;
grant insert, update, delete on public.friendships to authenticated;

-- ============================================================
--  확인용 (선택) — 아래 두 줄의 주석을 풀고 실행하면 표가 보입니다.
-- ============================================================
-- select count(*) from public.friendships;
-- select * from public.friendships order by created_at desc limit 5;
